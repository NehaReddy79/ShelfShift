FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    calibre \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
EXPOSE 8000

COPY start.sh .
RUN chmod +x start.sh

ENV HOME=/app
ENV QT_QPA_PLATFORM=offscreen
ENV QTWEBENGINE_DISABLE_SANDBOX=1
ENV QTWEBENGINE_CHROMIUM_FLAGS="--no-sandbox --disable-gpu"
RUN mkdir -p /app/.config

CMD ["./start.sh"]