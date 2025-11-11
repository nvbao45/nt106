FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1

WORKDIR /app 

RUN apt-get update && \
    apt-get install gcc -y
    
COPY ./requirements.txt ./requirements.txt
COPY ./app app

RUN python -m pip install -r ./requirements.txt

EXPOSE 8000

# CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]