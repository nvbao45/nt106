FROM python:3.8-slim

ENV PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

RUN apt-get update && \
    apt-get install gcc -y
    
COPY ./requirements.txt ./requirements.txt
COPY ./app app

RUN python -m pip install -r ./requirements.txt