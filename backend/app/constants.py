from enum import Enum


class UserType(str, Enum):
    USER = "user"
    PRINCIPAL_INVESTIGATOR = "principal_investigator"


class StudyStatus(str, Enum):
    NOT_STARTED = "not_started"
    ONGOING = "ongoing"
    COMPLETED = "completed"
    UNDEFINED = "undefined"


class ParticipantStatus(str, Enum):
    NOT_STARTED = "not_started"
    ONGOING = "ongoing"
    COMPLETED = "completed"
    UNDEFINED = "undefined"


class MetricType(str, Enum):
    HEARTRATE = "heartrate"
    ACCELERATION = "acceleration"
