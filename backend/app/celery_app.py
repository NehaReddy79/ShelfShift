from dotenv import load_dotenv
import os
import ssl
from celery import Celery

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL")
celery_app = Celery("book_converter",broker=REDIS_URL , backend=REDIS_URL , include=["app.tasks"])

celery_app.conf.update(task_serializer = "json" , result_serializer="json" , accept_content = ["json"]
                       , broker_use_ssl = {"ssl_cert_reqs" : ssl.CERT_NONE} , redis_backend_use_ssl = {"ssl_cert_reqs" : ssl.CERT_NONE} )
