import isodate
from datetime import datetime, timedelta, timezone
from dateutil.parser import isoparse


def iso_duration_to_hours(duration: str) -> int:
    """
    Convert an ISO 8601 duration string to hours.
    """
    return isodate.parse_duration(duration).total_seconds() // 3600


def hours_to_iso_duration(hours: int) -> str:
    """
    Convert hours to an ISO 8601 duration string.
    """
    return isodate.duration_isoformat(timedelta(hours=hours))


def parse_iso_utc_datetime(date: str) -> datetime:
    """
    Convert an ISO 8601 datetime string to a datetime object.
    Example: "2021-01-01T00:00:00+00:00" -> datetime.datetime(2021, 1, 1, 0, 0, tzinfo=datetime.timezone.utc)
    """
    utc_datetime = isoparse(date)
    if utc_datetime.tzinfo is None:
        utc_datetime = utc_datetime.replace(tzinfo=timezone.utc)
    else:
        utc_datetime = utc_datetime.astimezone(timezone.utc)
    return utc_datetime


def format_datetime_as_iso_utc(date: datetime) -> str:
    """
    Convert a datetime object to an ISO 8601 datetime string in UTC.
    Example: datetime.datetime(2021, 1, 1, 0, 0, tzinfo=datetime.timezone.utc) -> "2021-01-01T00:00:00+00:00"
    """
    if date.tzinfo is None:
        date = date.replace(tzinfo=timezone.utc)
    else:
        date = date.astimezone(timezone.utc)
    return date.isoformat()
