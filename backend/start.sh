#!/bin/bash
celery -A app.celery_app worker --loglevel=info --concurrency=1 &
uvicorn app.main:app --host 0.0.0.0 --port $PORT