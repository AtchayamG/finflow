FROM python:3.12-slim

WORKDIR /app
COPY services/api/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY services/api/app ./app
ENV FINFLOW_SQLITE_PATH=/data/finflow.sqlite3
ENV FINFLOW_PROVIDER_MODE=MOCK
EXPOSE 8781

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8781"]
