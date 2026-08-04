from app.celery_app import celery_app
import subprocess
from app.database import SessionLocal
from app.models import Job
from datetime import datetime

@celery_app.task
def add(x,y):
    return x + y

@celery_app.task
def convert_file_task(input_path , output_path , job_id):
    db = SessionLocal()
    

    try:
        job = db.query(Job).filter(job_id == Job.id).first()

        if not job :
            raise Exception(f"Job {job_id} not found")

        job.status = "processing"
        db.commit()

        process = subprocess.run(['ebook-convert' , input_path , output_path] , check = True, capture_output=True , text=True)

        job.status = "done"
        job.completed_at = datetime.utcnow()
        db.commit()

        return {"success" : True, "output_path" : output_path}

    
    except subprocess.CalledProcessError as e : 
        job.status = "failed"
        job.error_message = e.stderr
        db.commit()
        return {"success" : False, "Error" : e.stderr}

    except Exception as e :
        if job : 
            job.status = "failed"
            job.error_message = e.stderr
            db.commit()
            return {"success" : False, "Error" : e.stderr}
            

    finally : 
        db.close()

    
    