from fastapi import FastAPI , UploadFile , File , HTTPException , Depends , Form
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Job
from app.models import File as FileModel
from app.tasks import convert_file_task
from fastapi.responses import FileResponse
import os

app = FastAPI()
os.makedirs("storage/uploads/", exist_ok=True)
os.makedirs("storage/outputs/", exist_ok=True)

SUPPORTED_CONVERSIONS = {
    "epub": ["pdf", "mobi"],
    "mobi": ["pdf", "epub"],
    "pdf": ["epub", "mobi", "txt"],
    "txt": ["pdf"],
}

@app.get("/")
def root():
    return {"message" : "Working"}

@app.post("/convert")
async def file_upload(file : UploadFile = File(...) , db : Session = Depends(get_db) , target_format : str = Form(...)):
    if not file.filename :
        raise HTTPException(status_code=400 , detail = "No file found")
    
    filepath = os.path.join("storage/uploads", file.filename)

    source_format = file.filename.split(".")[-1].lower()
    
    if target_format not in SUPPORTED_CONVERSIONS.get(source_format, []):
        raise HTTPException(status_code=400, detail=f"Cannot convert {source_format} to {target_format}")

    contents = await file.read()

    with open(filepath , "wb") as buffer : 
        buffer.write(contents)

   

    new_job = Job(user_id = 1 , status = "queued" , source_format = source_format , target_format = target_format)
    db.add(new_job)
    db.commit()
    db.refresh(new_job)

    new_file = FileModel(job_id = new_job.id , file_type = "input", original_filename = file.filename , storage_path = filepath , file_size = len(contents))
    db.add(new_file)
    db.commit()

    output_path = f"storage/outputs/{new_job.id}.{target_format}"
    convert_file_task.delay(filepath , output_path , new_job.id)



    return {
        "filename" : file.filename,
        "size" : len(contents), 
        "job_id" : new_job.id,
        "output_path" : output_path
    }

@app.get("/jobs/{job_id}")
async def get_job(job_id : int , db : Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()

    if not job :
        raise HTTPException(status_code=404 , detail = "Job not found")

    return{
        "id" : job.id,
        "status" : job.status,
        "source_format" : job.source_format,
        "target_format" : job.target_format,
        "created_at" : job.created_at,
        "completed_at" : job.completed_at,
        "error_message" : job.error_message
    }

@app.get("/jobs/{job_id}/download")
async def download_job(job_id : int , db : Session = Depends(get_db)):
    job = db.query(Job).filter(job_id == Job.id).first()


    if not job : 
        raise HTTPException(status_code=404 , detail="Job doesnt exist")

    if  job.status != "done" : 
        raise HTTPException(status_code=400 , detail = "Job not ready yet")

    output_path = f"storage/outputs/{job.id}.{job.target_format}"


    if not os.path.exists(output_path):
        raise HTTPException(status_code=404, detail="Output file not found")

    original_file = db.query(FileModel).filter(FileModel.file_type == "input" , FileModel.job_id == job.id).first()
    
    if original_file:
        base_name = os.path.splitext(original_file.original_filename)[0]
        download_name = f"{base_name}.{job.target_format}"
    else:
        download_name = f"converted_job{job.id}.{job.target_format}"
 
    return FileResponse(path = output_path , filename = download_name , media_type="application/octet-stream")

    