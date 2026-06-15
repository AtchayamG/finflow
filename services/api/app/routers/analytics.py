from fastapi import APIRouter

from app.models import AnalyticsSummary, ExceptionRecord
from app.store import analytics_summary, store

router = APIRouter(tags=["analytics"])


@router.get("/analytics/summary", response_model=AnalyticsSummary)
def summary() -> AnalyticsSummary:
    return analytics_summary(store.list_cases())


@router.get("/exceptions", response_model=list[ExceptionRecord])
def list_exceptions() -> list[ExceptionRecord]:
    records: list[ExceptionRecord] = []
    for case in store.list_cases():
        records.extend(case.exceptions)
    return records
