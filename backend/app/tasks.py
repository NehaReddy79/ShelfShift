from app.celery_app import celery_app
import subprocess
from app.database import SessionLocal
from app.models import Job
from app.models import File as FileModel
from datetime import datetime , timedelta
import fitz
import os

@celery_app.task
def add(x,y):
    return x + y


def pdf_to_txt(input_path : str , output_path : str):
    doc = fitz.open(input_path)
    text = ""
    for page in doc : 
        text += page.get_text()
    doc.close()
    with open(output_path , "w" ,encoding="utf-8") as f:
        f.write(text)


def txt_to_pdf(input_path: str, output_path: str):

    with open(input_path, "r", encoding="utf-8") as f:
        text = f.read()

    doc = fitz.open()
    page_width, page_height = 595, 842  
    margin = 50
    fontsize = 11
    line_height = fontsize * 1.2
    max_width = page_width - 2 * margin
    max_lines_per_page = int((page_height - 2 * margin) / line_height)

    font = fitz.Font("helv")

    
    lines = []
    for paragraph in text.split("\n"):
        words = paragraph.split(" ")
        current_line = ""
        for word in words:
            test_line = (current_line + " " + word).strip()
            if font.text_length(test_line, fontsize=fontsize) <= max_width:
                current_line = test_line
            else:
                lines.append(current_line)
                current_line = word
        lines.append(current_line)  

    
    for i in range(0, len(lines), max_lines_per_page):
        page_lines = lines[i:i + max_lines_per_page]
        page = doc.new_page(width=page_width, height=page_height)
        y = margin
        for line in page_lines:
            page.insert_text((margin, y), line, fontsize=fontsize)
            y += line_height

    doc.save(output_path)
    doc.close()

@celery_app.task
def convert_file_task(input_path , output_path , job_id , source_format , target_format):
    db = SessionLocal()
    job = None

    try:
        job = db.query(Job).filter(job_id == Job.id).first()

        if not job :
            raise Exception(f"Job {job_id} not found")

        job.status = "processing"
        db.commit()

        if(source_format , target_format) == ("pdf" , "txt"):
            pdf_to_txt(input_path , output_path)

        elif(source_format , target_format) == ("txt" , "pdf") : 
            txt_to_pdf(input_path, output_path)

        else:
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
            job.error_message = str(e)
            db.commit()
        return {"success" : False, "Error" : str(e)}
            

    finally : 
        db.close()

    
@celery_app.task
def cleanup_old_files():
    db = SessionLocal()

    try:
        job_res = db.query(Job).filter(Job.created_at < (datetime.utcnow() - timedelta(seconds=1))).all()
        for job in job_res:
            input_res = db.query(FileModel).filter(FileModel.job_id == job.id ,FileModel.file_type == "input").first()

            if input_res and os.path.exists(input_res.storage_path):
                os.remove(input_res.storage_path)

            if os.path.exists(f"storage/outputs/{job.id}.{job.target_format}"):
                os.remove(f"storage/outputs/{job.id}.{job.target_format}")

    finally : 
        db.close()