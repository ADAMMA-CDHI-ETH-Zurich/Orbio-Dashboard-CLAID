from app.models.metric import Metric

from app import db


class MetricService:
    @staticmethod
    def get_metric_info(metric: Metric) -> dict:
        return {"id": metric.id, "name": metric.name}

    @staticmethod
    def get_all_metrics_info() -> list[dict]:
        metrics = Metric.query.all()
        return [MetricService.get_metric_info(metric) for metric in metrics]

    @staticmethod
    def get_metric_by_id(metric_id: str) -> Metric:
        return Metric.query.filter_by(id=metric_id).first()
