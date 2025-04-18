# Multi-stage build for CodexGUI
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend code
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# Backend stage
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Create necessary directories
RUN mkdir -p ./data/logs ./data/snapshots

# Set environment variables
ENV STATIC_FILES_DIR=/app/frontend/dist
ENV DATA_DIR=/app/data
ENV LOGS_DIR=/app/data/logs
ENV SNAPSHOTS_DIR=/app/data/snapshots
ENV DB_FILE=/app/data/codexgui.db
ENV HOST=0.0.0.0
ENV PORT=8000

# Expose the application port
EXPOSE 8000

# Run the application
CMD ["python", "-m", "app.main"]
