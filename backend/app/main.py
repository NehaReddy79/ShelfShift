from fastapi import FastAPI , UploadFile , File , HTTPException , Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Job
import os

app = FastAPI()
os.makedirs("storage/uploads/", exist_ok=True)

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


    return {
        "filename" : file.filename,
        "size" : len(contents), 
        "job_id" : new_job.id
    }