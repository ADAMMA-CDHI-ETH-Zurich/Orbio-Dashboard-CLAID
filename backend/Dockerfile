FROM python:3.10-slim AS base

WORKDIR /server

COPY ./app ./app
COPY ./migrations ./migrations
COPY ./.flaskenv .
COPY ./requirements.txt .
COPY ./run.py .

RUN pip install --no-cache-dir -r requirements.txt

CMD ["gunicorn", "-w=1", "-b=0.0.0.0:8080", "--access-logfile=-", "run:app"]
# CMD ["flask", "run"]