from app.models.principal_investigator import PrincipalInvestigator
from app.models.study import Study
from app.models.study_x_metric import StudyMetric
from app.models.metric import Metric
from app.models.user import User
from flask_bcrypt import generate_password_hash
from app import db
from app.models.study_x_user import UserStudy
import os

# Create default test users and studies

ACCELERATION_METRIC_ID = "3cf6e4ed-4dc5-44cd-818c-b0269d8ff545"
HEARTRATE_METRIC_ID = "46889913-cccc-409d-8452-3f9039f19f30"
BENJAMIN_USER_ID = "36840eee-1bd4-400b-9dee-17c6e7decd6e"
HELENA_USER_ID = "ee392c77-74a3-4521-9abc-0355548e62f3"
NIKITA_USER_ID = "e3e43b87-175b-43a3-a0bc-2c3d0e15a350"
JIANING_USER_ID = "8c950773-fda2-4cea-825a-732d40d2f818"
MARK_PI_ID = "6dc4482f-4e3c-4322-8ff5-14444fd4e109"
FITNESS_SLEEP_STUDY_ID = "fb7025c9-c475-48df-b01c-a14513c35d3a"
FITNESS_SLEEP_STUDY_CODE = "3c2d4d98"


class DefaultService:
    @staticmethod
    def create_default_metrics():
        metrics = [
            Metric(id=ACCELERATION_METRIC_ID, name="acceleration"),
            Metric(id=HEARTRATE_METRIC_ID, name="heartrate"),
        ]
        for metric in metrics:
            if not Metric.query.filter_by(id=metric.id).first():
                db.session.add(metric)
        db.session.commit()

    @staticmethod
    def create_default_users():
        password = "test"
        hashed_password = generate_password_hash(password).decode("utf-8")

        def create_if_not_exists(user_data):
            if not User.query.filter_by(email=user_data["email"]).first():
                user = User(**user_data)
                db.session.add(user)
                db.session.commit()

        default_users = [
            {
                "id": BENJAMIN_USER_ID,
                "name": "Benjamin",
                "surname": "Biberstein",
                "email": "benjamin@orbio.com",
                "password": hashed_password,
                "weight_in_kg": 70.0,
                "height_in_cm": 170.0,
                "birth_date": "2004-09-14",
            },
            {
                "id": HELENA_USER_ID,
                "name": "Helena",
                "surname": "Kaikkonen",
                "email": "helena@orbio.com",
                "password": hashed_password,
                "weight_in_kg": 60.0,
                "height_in_cm": 170.0,
                "birth_date": "2004-06-21",
            },
            {
                "id": NIKITA_USER_ID,
                "name": "Nikita",
                "surname": "Zubairov",
                "email": "nikita@orbio.com",
                "password": hashed_password,
                "weight_in_kg": 80.0,
                "height_in_cm": 181.0,
                "birth_date": "2003-10-14",
            },
            {
                "id": JIANING_USER_ID,
                "name": "Jianing",
                "surname": "Xu",
                "email": "jianing@orbio.com",
                "password": hashed_password,
                "weight_in_kg": 70.0,
                "height_in_cm": 175.0,
                "birth_date": "2003-05-11",
            },
        ]
        for user_data in default_users:
            create_if_not_exists(user_data)

    @staticmethod
    def create_default_pi():
        password = "test"
        hashed_password = generate_password_hash(password).decode("utf-8")

        pi = PrincipalInvestigator.query.filter_by(email="mark@orbio.com").first()
        if not pi:
            pi = PrincipalInvestigator(
                id=MARK_PI_ID,
                name="Mark",
                surname="Peters",
                email="mark@orbio.com",
                password=hashed_password,
            )
            db.session.add(pi)
            db.session.commit()

    @staticmethod
    def create_default_studies():
        studies = [
            Study(
                id=FITNESS_SLEEP_STUDY_ID,
                code=FITNESS_SLEEP_STUDY_CODE,
                name="Sleep Pattern Study Using Wearable Devices",
                start_date="2024-12-06",
                end_date="2024-12-20",
                duration=168,
                description=(
                    "A study aimed at understanding the correlation between physical activity, "
                    "heart rate patterns, and sleep quality using smartwatch data. Participants' "
                    "acceleration metrics and heart rate will be continuously monitored to uncover "
                    "insights into how fitness routines affect sleep and overall health."
                ),
                inclusion_criteria=(
                    "# Inclusion Criteria\n"
                    "- Participants aged **20-60 years**.\n"
                    "- Must own a **compatible smartwatch**.\n"
                ),
                informed_consent=(
                    "# Informed Consent\n"
                    "Participants must:\n"
                    "- Provide signed consent indicating they agree to:\n"
                    "  - The **continuous monitoring** of their activity, heart rate, and sleep data.\n"
                    "- Acknowledge that they understand:\n"
                    "   - The study's **objectives**, **procedures**, and **benefits**.\n"
                ),
                num_participants=3,
                participant_counter=3,
                principal_investigator_id=MARK_PI_ID,
            )
        ]
        for study in studies:
            if not Study.query.filter_by(id=study.id).first():
                db.session.add(study)
        db.session.commit()

        metrics = [
            Metric(id=ACCELERATION_METRIC_ID, name="acceleration"),
            Metric(id=HEARTRATE_METRIC_ID, name="heartrate"),
        ]
        for metric in metrics:
            if not StudyMetric.query.filter_by(
                study_id=FITNESS_SLEEP_STUDY_ID, metric_id=metric.id
            ).first():
                db.session.add(
                    StudyMetric(study_id=FITNESS_SLEEP_STUDY_ID, metric_id=metric.id)
                )
        db.session.commit()



        participants = [
            {
                "user_id": BENJAMIN_USER_ID,
                "participant_num": 1,
                "start_date": "2024-12-07",
                "end_date": "2024-12-12",
                "signed_informed_consent": "U0dWc2JHOHNJSFJvYVhNZ2FYTWdZU0JpWVhObE5qUWdaVzVqYjJSbFpDQnpkSEpwYm1jZ1ptOXlJSFJsYzNScGJtY2djSFZ5Y0c5elpYTT0=",
            },
            {
                "user_id": HELENA_USER_ID,
                "participant_num": 2,
                "start_date": "2024-12-08",
                "end_date": "2024-12-12",
                "signed_informed_consent": "U0dWc2JHOHNJSFJvYVhNZ2FYTWdZU0JpWVhObE5qUWdaVzVqYjJSbFpDQnpkSEpwYm1jZ1ptOXlJSFJsYzNScGJtY2djSFZ5Y0c5elpYTT0=",
            },
            {
                "user_id": JIANING_USER_ID,
                "participant_num": 3,
                "start_date": "2024-12-09",
                "end_date": "2024-12-12",
                "signed_informed_consent": "U0dWc2JHOHNJSFJvYVhNZ2FYTWdZU0JpWVhObE5qUWdaVzVqYjJSbFpDQnpkSEpwYm1jZ1ptOXlJSFJsYzNScGJtY2djSFZ5Y0c5elpYTT0=",
            },
        ]
        for participant in participants:
            if not UserStudy.query.filter_by(
                study_id=FITNESS_SLEEP_STUDY_ID, user_id=participant["user_id"]
            ).first():
                user_study = UserStudy(
                    study_id=FITNESS_SLEEP_STUDY_ID,
                    user_id=participant["user_id"],
                    participant_num=participant["participant_num"],
                    start_date=participant["start_date"],
                    end_date=participant["end_date"],
                    signed_informed_consent=participant["signed_informed_consent"],
                )
                db.session.add(user_study)
        db.session.commit()

    @staticmethod
    def create_default_data():
        DefaultService.create_default_metrics()
        DefaultService.create_default_users()
        DefaultService.create_default_pi()
        DefaultService.create_default_studies()
