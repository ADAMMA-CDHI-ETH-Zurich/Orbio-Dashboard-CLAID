from app.models.study import Study
from app.models.study_x_user import UserStudy
from app.models.principal_investigator import PrincipalInvestigator
from app.models.study_x_metric import StudyMetric
from app.models.metric import Metric
from app.services.metric_service import MetricService
from app.utils.iso_converter import (
    format_datetime_as_iso_utc,
    hours_to_iso_duration,
    iso_duration_to_hours,
    parse_iso_utc_datetime,
)
from app import db
import base64
from typing import List
from datetime import datetime, timedelta
import uuid
from app.services.heartrate_service import HeartrateService
from app.services.acceleration_service import AccelerationService
from app.constants import MetricType


def is_valid_uuid(uuid_str: str) -> bool:
    try:
        uuid.UUID(uuid_str)
        return True
    except ValueError:
        return False


class StudyService:

    @staticmethod
    def get_study_metrics(study: Study) -> list[Metric]:
        """
        returns a list of metrics associated with a study
        """
        study_metrics = StudyMetric.query.filter_by(study_id=study.id).all()
        metrics = [
            Metric.query.filter_by(id=metric.metric_id).first()
            for metric in study_metrics
        ]
        return metrics

    @staticmethod
    def get_study_info(study: Study) -> dict:
        metrics = StudyService.get_study_metrics(study)
        return {
            "id": study.id,
            "code": study.code,
            "name": study.name,
            "start_date": format_datetime_as_iso_utc(study.start_date),
            "end_date": format_datetime_as_iso_utc(study.end_date),
            "duration": hours_to_iso_duration(study.duration),
            "description": study.description,
            "inclusion_criteria": study.inclusion_criteria,
            "informed_consent": study.informed_consent,
            "num_participants": study.num_participants,
            "status": study.status,
            "metrics": [MetricService.get_metric_info(metric) for metric in metrics],
        }

    @staticmethod
    def get_pi_studies(pi_id: str) -> List[dict]:
        studies = Study.query.filter_by(principal_investigator_id=pi_id).all()
        return [StudyService.get_study_info(study) for study in studies]

    @staticmethod
    def create_study(data: dict, pi_id: str):
        study = Study(
            name=data["name"],
            start_date=parse_iso_utc_datetime(data["start_date"]),
            end_date=parse_iso_utc_datetime(data["end_date"]),
            duration=iso_duration_to_hours(data["duration"]),
            description=data["description"],
            inclusion_criteria=data["inclusion_criteria"],
            informed_consent=data["informed_consent"],
            principal_investigator_id=pi_id,
        )
        db.session.add(study)
        db.session.commit()

        study_metrics = [
            StudyMetric(study_id=study.id, metric_id=metric_id)
            for metric_id in data["metrics"]
        ]
        db.session.bulk_save_objects(study_metrics)
        db.session.commit()
        return StudyService.get_study_info(study)

    @staticmethod
    def delete_study(study_id: str, pi_id: str):
        if not is_valid_uuid(study_id):
            raise ValueError("Study ID must be a valid UUID")

        study = Study.query.filter_by(
            id=study_id, principal_investigator_id=pi_id
        ).first()
        if not study:
            raise ValueError(
                "Study not found or you do not have permission to delete this study"
            )
        UserStudy.query.filter_by(study_id=study_id).delete()
        StudyMetric.query.filter_by(study_id=study_id).delete()
        db.session.delete(study)
        db.session.commit()

    @staticmethod
    def join_study(study_id: str, user_id: str, data: dict):
        if not is_valid_uuid(study_id):
            raise ValueError("Study ID must be a valid UUID")

        # Check if the study exists
        study = Study.query.filter_by(id=study_id).first()
        if not study:
            raise ValueError("Study not found")

        # Check if user has already joined the study
        existing_participation = UserStudy.query.filter_by(
            study_id=study_id, user_id=user_id
        ).first()
        if existing_participation:
            raise ValueError("User has already joined this study")

        pdf_base64 = data["signed_informed_consent"]
        # Handle Base64 string with or without the metadata prefix
        if pdf_base64.startswith("data:application/pdf"):
            pdf_base64 = pdf_base64.split(",")[1]

        # Decode the Base64 string into binary
        pdf_binary = base64.b64decode(pdf_base64)

        # calcualte start and end date
        start_date = datetime.now()
        end_date = start_date + timedelta(hours=study.duration)
        if end_date > study.end_date:
            end_date = study.end_date

        # Create a new UserStudy relationship
        user_study = UserStudy(
            user_id=user_id,
            study_id=study_id,
            participant_num=study.participant_counter + 1,
            start_date=start_date,
            end_date=end_date,
            signed_informed_consent=pdf_binary,
        )

        study.participant_counter += 1
        study.num_participants += 1
        db.session.add(user_study)
        db.session.commit()

    @staticmethod
    def get_study_info_from_user(study_id: str, user_id: str) -> dict:
        if not is_valid_uuid(study_id):
            raise ValueError("Study ID must be a valid UUID")

        study = Study.query.filter_by(id=study_id).first()
        if not study:
            raise ValueError("Study not found")

        user_study = UserStudy.query.filter_by(
            study_id=study_id, user_id=user_id
        ).first()
        if not user_study:
            raise ValueError("User has not joined this study")

        organizer = PrincipalInvestigator.query.filter_by(
            id=study.principal_investigator_id
        ).first()

        metrics = StudyService.get_study_metrics(study)

        user_study_dict = user_study.to_dict()
        return {
            "study_data": {
                "id": study.id,
                "code": study.code,
                "name": study.name,
                "start_date": format_datetime_as_iso_utc(study.start_date),
                "end_date": format_datetime_as_iso_utc(study.end_date),
                "duration": hours_to_iso_duration(study.duration),
                "organizer_name": (
                    f"{organizer.name} {organizer.surname}" if organizer else None
                ),
                "description": study.description,
                "inclusion_criteria": study.inclusion_criteria,
                "informed_consent": study.informed_consent,
                "metrics": [
                    MetricService.get_metric_info(metric) for metric in metrics
                ],
            },
            "user_study_data": user_study_dict,
        }

    @staticmethod
    def get_joined_studies(user_id: str) -> List[dict]:
        joined_studies = (
            db.session.query(UserStudy, Study)
            .join(Study, UserStudy.study_id == Study.id)
            .filter(UserStudy.user_id == user_id)
            .all()
        )

        return [
            {
                "study_id": study.id,
                "study_name": study.name,
                "start_date": format_datetime_as_iso_utc(user_study.start_date),
                "end_date": format_datetime_as_iso_utc(user_study.end_date),
                "status": user_study.status,
                "description": study.description,
            }
            for user_study, study in joined_studies
        ]

    @staticmethod
    def remove_user_from_study(study_id: str, user_id: str):
        if not is_valid_uuid(study_id):
            raise ValueError("Study ID must be a valid UUID")

        study = Study.query.filter_by(id=study_id).first()
        if not study:
            raise ValueError("Study not found")

        user_study = UserStudy.query.filter_by(
            study_id=study_id, user_id=user_id
        ).first()
        if not user_study:
            raise ValueError("User has not joined this study")

        study.num_participants -= 1
        db.session.delete(user_study)
        db.session.commit()

    @staticmethod
    def get_participants_from_study(study_id: str, pi_id: str) -> List[dict]:
        if not is_valid_uuid(study_id):
            raise ValueError("Study ID must be a valid UUID")

        study = Study.query.filter_by(
            id=study_id, principal_investigator_id=pi_id
        ).first()
        if not study:
            raise ValueError(
                "Study not found or you do not have permission to view this study"
            )

        metrics = StudyService.get_study_metrics(study)

        def get_last_updated(participant: UserStudy) -> int:
            from_time = participant.start_date.timestamp()
            to_time = participant.end_date.timestamp()
            last_updated = 0
            for metric in metrics:
                current_last_updated = None
                if metric.name == MetricType.HEARTRATE:
                    current_last_updated = HeartrateService.get_last_updated(
                        participant.user_id, from_time, to_time
                    )
                elif metric.name == MetricType.ACCELERATION:
                    current_last_updated = AccelerationService.get_last_updated(
                        participant.user_id, from_time, to_time
                    )
                if not current_last_updated:
                    continue
                last_updated = max(last_updated, current_last_updated)
            return last_updated

        participants = UserStudy.query.filter_by(study_id=study_id).all()
        return sorted(
            [
                {
                    "participant_num": participant.participant_num,
                    "start_date": format_datetime_as_iso_utc(participant.start_date),
                    "end_date": format_datetime_as_iso_utc(participant.end_date),
                    "status": participant.status,
                    "signed_informed_consent": (
                        base64.b64encode(participant.signed_informed_consent).decode(
                            "utf-8"
                        )
                        if participant.signed_informed_consent
                        else None
                    ),
                    "last_updated": get_last_updated(participant),
                }
                for participant in participants
            ],
            key=lambda x: x["last_updated"],
            reverse=True,
        )

    @staticmethod
    def remove_participant_from_study(study_id: str, pi_id: str, participant_num: int):
        if not is_valid_uuid(study_id):
            raise ValueError("Study ID must be a valid UUID")

        study = Study.query.filter_by(
            id=study_id, principal_investigator_id=pi_id
        ).first()
        if not study:
            raise ValueError(
                "Study not found or you do not have permission to modify this study"
            )

        participant = UserStudy.query.filter_by(
            study_id=study_id, participant_num=participant_num
        ).first()
        if not participant:
            raise ValueError("Participant not found")

        study.num_participants -= 1
        db.session.delete(participant)
        db.session.commit()

    @staticmethod
    def get_participant_metric(
        study_id: str,
        pi_id: str,
        participant_num: int,
        metric_name: str,
        from_time: int,
        to_time: int,
        offset: int,
    ):
        if not is_valid_uuid(study_id):
            raise ValueError("Study ID must be a valid UUID")

        study = Study.query.filter_by(
            id=study_id, principal_investigator_id=pi_id
        ).first()
        if not study:
            raise ValueError(
                "Study not found or you do not have permission to view this study"
            )

        participant = UserStudy.query.filter_by(
            study_id=study_id, participant_num=participant_num
        ).first()
        if not participant:
            raise ValueError("Participant not found")

        # study_metric = StudyMetric.query.filter_by(metric_id=metric_id).first()
        # if not study_metric:
        #     raise ValueError("Metric not accessible for this study")

        # metric_name = Metric.query.filter_by(id=metric_id).first().name
        user_id = participant.user_id

        # start_date = participant.start_date
        # now = datetime.now()
        # if start_date < now:
        #     raise ValueError("Participant has not started the study yet")

        # end_date = (
        #     participant.end_date
        #     if participant.end_date > datetime.now()
        #     else datetime.now()
        # )

        if metric_name == "heartrate":
            return HeartrateService.get_heartrate_graph(
                user_id, from_time, to_time, offset
            )
        elif metric_name == "acceleration_xyz":
            return AccelerationService.get_acceleration_graph_xyz(
                user_id, from_time, to_time, offset
            )
        elif metric_name == "acceleration_vector":
            return AccelerationService.get_acceleration_graph_vector(
                user_id, from_time, to_time, offset
            )
        else:
            raise ValueError("Metric not found")

    @staticmethod
    def get_study_info_to_show(study: Study) -> dict:
        organizer = PrincipalInvestigator.query.filter_by(
            id=study.principal_investigator_id
        ).first()
        metrics = StudyService.get_study_metrics(study)
        return {
            "id": study.id,
            "code": study.code,
            "name": study.name,
            "start_date": format_datetime_as_iso_utc(study.start_date),
            "end_date": format_datetime_as_iso_utc(study.end_date),
            "duration": hours_to_iso_duration(study.duration),
            "organizer_name": (
                f"{organizer.name} {organizer.surname}" if organizer else None
            ),
            "description": study.description,
            "inclusion_criteria": study.inclusion_criteria,
            "informed_consent": study.informed_consent,
            "metrics": [MetricService.get_metric_info(metric) for metric in metrics],
            "num_participants": study.num_participants,
            "status": study.status,
        }

    @staticmethod
    def get_study_info_by_code(study_code: str) -> dict:
        study = Study.query.filter_by(code=study_code).first()
        if not study:
            raise ValueError("Study not found")
        return StudyService.get_study_info_to_show(study)

    @staticmethod
    def download_participant_metric(
        study_id: str, pi_id: str, participant_num: int, metric_id: str
    ):
        if not is_valid_uuid(study_id):
            raise ValueError("Study ID must be a valid UUID")

        study = Study.query.filter_by(
            id=study_id, principal_investigator_id=pi_id
        ).first()
        if not study:
            raise ValueError(
                "Study not found or you do not have permission to view this study"
            )

        participant = UserStudy.query.filter_by(
            study_id=study_id, participant_num=participant_num
        ).first()
        if not participant:
            raise ValueError("Participant not found")

        study_metric = StudyMetric.query.filter_by(metric_id=metric_id).first()
        if not study_metric:
            raise ValueError("Metric not accessible for this study")

        metric_name = Metric.query.filter_by(id=metric_id).first().name
        user_id = participant.user_id

        start_date = participant.start_date.timestamp()
        if start_date > datetime.now().timestamp():
            raise ValueError("Participant has not started the study yet")
        end_date = participant.end_date.timestamp()

        # retrieve data
        if metric_name == MetricType.HEARTRATE:
            return HeartrateService.download_data(user_id, start_date, end_date)
        elif metric_name == MetricType.ACCELERATION:
            return AccelerationService.download_data(user_id, start_date, end_date)

    @staticmethod
    def get_signed_informed_consent(study_id: str, pi_id: str) -> bytes:
        study = Study.query.filter_by(
            id=study_id, principal_investigator_id=pi_id
        ).first()
        if not study:
            raise ValueError(
                "Study not found or you do not have permission to view this study"
            )

        from base64 import b64decode
        from io import BytesIO
        from zipfile import ZipFile

        participants = UserStudy.query.filter_by(study_id=study_id).all()
        if not participants:
            raise ValueError("No participants found for this study")

        zip_buffer = BytesIO()
        with ZipFile(zip_buffer, "w") as zip_file:
            for participant in participants:
                try:
                    # Get base64 encoded consent string
                    consent_base64 = base64.b64encode(
                        participant.signed_informed_consent
                    ).decode("utf-8")

                    # Convert base64 string to PDF bytes
                    # Add padding if necessary
                    missing_padding = len(consent_base64) % 4
                    if missing_padding:
                        consent_base64 += "=" * (4 - missing_padding)
                    pdf_bytes = b64decode(consent_base64)

                    # Save the PDF to the zip file
                    filename = f"participant_{participant.participant_num}_consent.pdf"
                    zip_file.writestr(filename, pdf_bytes)

                except Exception:
                    raise ValueError(
                        f"Failed to decode and save the signed informed consent for participant {participant.participant_num}"
                    )

        zip_buffer.seek(0)
        return zip_buffer.getvalue()
