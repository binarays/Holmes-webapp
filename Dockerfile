# -----------------------------
# Base Image
# -----------------------------
FROM python:3.11-slim

WORKDIR /app

ENV PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    git \
    dnsutils \
    iputils-ping \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 7860

# -----------------------------
# Start FastAPI Server (Production Ready)
# -----------------------------
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]