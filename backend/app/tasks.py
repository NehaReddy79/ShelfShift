from app.celery_app import celery_app
import subprocess


@celery_app.task
def add(x,y):
    return x + y

@celery_app.task
def convert_file_task(input_path , output_path):
    try:
        process = subprocess.run(['ebook-convert' , input_path , output_path] , check = True, capture_output=True , text=True)
        return {"success" : True, "output_path" : output_path}
    except subprocess.CalledProcessError as e : 
        return {"success" : False, "Error" : e.stderr}
    