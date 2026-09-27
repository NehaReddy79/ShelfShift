#  ShelfShift

A full-stack eBook conversion platform supporting EPUB, MOBI, PDF, and TXT — built with an asynchronous job pipeline, JWT authentication, and a custom-designed React frontend.

---

##  Live Deployment Limitation

The live deployment currently supports **TXT ↔ PDF conversion only**.

EPUB/MOBI ↔ PDF conversions rely on Calibre's `ebook-convert`, which internally uses a Chromium-based rendering engine (QtWebEngine) for layout processing. This engine requires more memory than the **512MB RAM limit** available on the free-tier hosting instance (Render), and running it there causes an out-of-memory crash.

Rather than let the live app hang or crash silently on these conversions, the backend detects this case and returns a clear, graceful error message instead. **All conversion formats work correctly when run locally** or on infrastructure with sufficient memory .

Due to the RAM constraint, the app fails clearly and explains the limitation to the user, rather than timing out or crashing unpredictably.

---

## Features

- **Multi-format conversion:** EPUB, MOBI, PDF, TXT (any direction, format-support-permitting)
- **Asynchronous processing:** Celery + Redis job queue with live status polling
- **Authentication:** JWT-based, with support for both anonymous conversions and logged-in users
- **Job history & stats:** per-user conversion history with aggregate stats
- **Automated cleanup:** scheduled background task (Celery Beat) removes old files after 1 hour
  

## Tech Stack

**Backend:** FastAPI, Celery, Redis (Upstash), PostgreSQL (Neon), SQLAlchemy, Alembic, Calibre, PyMuPDF <br>
**Frontend:** React, Vite, React Router, Axios <br>
**Auth:** JWT (python-jose), bcrypt password hashing <br>
**Deployment:** Docker (Render — backend + worker in a single container), Vercel (frontend) <br>


## Notable Features

- **Anonymous-first conversion flow:** matching real-world converter tools, users can convert files without an account; login is only required to view history/stats
- **Graceful degradation under resource constraints:** backend explicitly detects and rejects heavy conversions with a clear message 

## Running Locally

```bash
# Backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# In separate terminals:
celery -A app.celery_app worker --loglevel=info --pool=solo
celery -A app.celery_app beat --loglevel=info

# Frontend
cd frontend
npm install
npm run dev
```

Requires: PostgreSQL, Redis, and [Calibre](https://calibre-ebook.com/download) installed locally, plus a `.env` file with `DATABASE_URL`, `REDIS_URL`, and `JWT_SECRET_KEY`.
