from fastapi import FastAPI , UploadFile , File , HTTPException , Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Job
from app.tasks import convert_file_task
from fastapi.responses import FileResponse
import os

app = FastAPI()
os.makedirs("storage/uploads/", exist_ok=True)
os.makedirs("storage/outputs/", exist_ok=True)

@app.get("/")
def root():
    return {"message" : "Working"}

@app.post("/convert")
async def file_upload(file : UploadFile = File(...) , db : Session = Depends(get_db)):
    if not file.filename :
        raise HTTPException(status_code=400 , detail = "No file found")
    
    filepath = os.path.join("storage/uploads", file.filename)

    contents = await file.read()

    with open(filepath , "wb") as buffer : 
        buffer.write(contents)

    new_job = Job(user_id = 1 , status = "queued" , source_format = file.filename.split(".")[-1].lower() , target_format = "pdf")
    db.add(new_job)
    db.commit()
    db.refresh(new_job)

    output_path = f"storage/outputs/{new_job.id}.pdf"
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

    
    return FileResponse(path = output_path , filename = f"converted_job{job.id}.{job.target_format}" , media_type="application/octet-stream")

    