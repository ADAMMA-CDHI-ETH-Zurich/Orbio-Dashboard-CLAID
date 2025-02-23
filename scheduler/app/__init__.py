from flask import Flask
from flask_apscheduler import APScheduler
from app.jobs import update_DB
from dotenv import load_dotenv


def create_app():
    load_dotenv()
    app = Flask(__name__)

    scheduler = APScheduler()
    # Add the update_DB job to the scheduler
    scheduler.add_job(id="update_DB", func=update_DB, trigger="interval", seconds=600, max_instances=1)
    scheduler.start()

    return app
