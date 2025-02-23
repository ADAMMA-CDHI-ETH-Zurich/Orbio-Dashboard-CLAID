FROM python:3.9-slim AS base

WORKDIR /server

COPY ./requirements.txt .
COPY ./run.py .
COPY ./app ./app
RUN mkdir -p logs

RUN pip install --no-cache-dir -r requirements.txt

CMD ["gunicorn", "-w=1", "-b=0.0.0.0:8017", "--log-level=info", "--access-logfile=-", "--error-logfile=-", "run:app"]
# CMD ["flask", "run"]