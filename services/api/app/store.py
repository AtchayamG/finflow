import json
import sqlite3
from pathlib import Path
from typing import Protocol

from app.models import AnalyticsSummary, CaseEvent, LoanCase
from app.settings import get_settings


class CaseStore(Protocol):
    def add_case(self, case: LoanCase) -> LoanCase: ...
    def save_case(self, case: LoanCase) -> LoanCase: ...
    def get_case(self, case_id: str) -> LoanCase | None: ...
    def list_cases(self) -> list[LoanCase]: ...
    def add_event(self, case_id: str, event_type: str, stage: str, actor: str, message: str) -> None: ...
    def list_events(self, case_id: str) -> list[CaseEvent]: ...


class InMemoryStore:
    def __init__(self) -> None:
        self.cases: dict[str, LoanCase] = {}
        self.events: dict[str, list[CaseEvent]] = {}

    def add_case(self, case: LoanCase) -> LoanCase:
        self.cases[case.id] = case
        self.events[case.id] = []
        self.add_event(case.id, "case_created", case.current_stage, "backend", "Loan case created")
        return case

    def save_case(self, case: LoanCase) -> LoanCase:
        self.cases[case.id] = case
        return case

    def get_case(self, case_id: str) -> LoanCase | None:
        return self.cases.get(case_id)

    def list_cases(self) -> list[LoanCase]:
        return sorted(self.cases.values(), key=lambda case: case.created_at, reverse=True)

    def add_event(self, case_id: str, event_type: str, stage: str, actor: str, message: str) -> None:
        self.events.setdefault(case_id, []).append(
            CaseEvent(case_id=case_id, event_type=event_type, stage=stage, actor=actor, message=message)
        )

    def list_events(self, case_id: str) -> list[CaseEvent]:
        return self.events.get(case_id, [])


class SQLiteStore:
    def __init__(self, path: str) -> None:
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self._init()

    def add_case(self, case: LoanCase) -> LoanCase:
        with self._connect() as conn:
            conn.execute(
                "insert or replace into cases(id, case_json, created_at, updated_at) values (?, ?, ?, ?)",
                (case.id, case.model_dump_json(), case.created_at, case.updated_at),
            )
        self.add_event(case.id, "case_created", case.current_stage, "backend", "Loan case created")
        return case

    def save_case(self, case: LoanCase) -> LoanCase:
        with self._connect() as conn:
            conn.execute(
                "update cases set case_json = ?, updated_at = ? where id = ?",
                (case.model_dump_json(), case.updated_at, case.id),
            )
        return case

    def get_case(self, case_id: str) -> LoanCase | None:
        with self._connect() as conn:
            row = conn.execute("select case_json from cases where id = ?", (case_id,)).fetchone()
        return LoanCase.model_validate_json(row[0]) if row else None

    def list_cases(self) -> list[LoanCase]:
        with self._connect() as conn:
            rows = conn.execute("select case_json from cases order by created_at desc").fetchall()
        return [LoanCase.model_validate_json(row[0]) for row in rows]

    def add_event(self, case_id: str, event_type: str, stage: str, actor: str, message: str) -> None:
        event = CaseEvent(case_id=case_id, event_type=event_type, stage=stage, actor=actor, message=message)
        with self._connect() as conn:
            conn.execute(
                "insert into events(id, case_id, event_json, timestamp) values (?, ?, ?, ?)",
                (event.id, case_id, event.model_dump_json(), event.timestamp),
            )

    def list_events(self, case_id: str) -> list[CaseEvent]:
        with self._connect() as conn:
            rows = conn.execute(
                "select event_json from events where case_id = ? order by timestamp asc",
                (case_id,),
            ).fetchall()
        return [CaseEvent.model_validate_json(row[0]) for row in rows]

    def _init(self) -> None:
        with self._connect() as conn:
            conn.execute("create table if not exists cases(id text primary key, case_json text, created_at text, updated_at text)")
            conn.execute("create table if not exists events(id text primary key, case_id text, event_json text, timestamp text)")

    def _connect(self) -> sqlite3.Connection:
        return sqlite3.connect(self.path)


def analytics_summary(cases: list[LoanCase]) -> AnalyticsSummary:
    stage_counts: dict[str, int] = {}
    risk_scores: list[float] = []
    for case in cases:
        stage_counts[case.current_stage] = stage_counts.get(case.current_stage, 0) + 1
        if case.credit and "risk_score" in case.credit:
            risk_scores.append(float(case.credit["risk_score"]))
    return AnalyticsSummary(
        total_cases=len(cases),
        in_progress=sum(case.case_status == "in_progress" for case in cases),
        awaiting_human=sum(case.case_status == "awaiting_human" for case in cases),
        exceptions=sum(case.case_status == "exception" for case in cases),
        approved=sum(case.case_status == "approved" for case in cases),
        rejected=sum(case.case_status == "rejected" for case in cases),
        referred=sum(case.case_status == "referred" for case in cases),
        average_risk_score=round(sum(risk_scores) / len(risk_scores), 4) if risk_scores else 0,
        stage_counts=stage_counts,
    )


def build_store() -> CaseStore:
    settings = get_settings()
    if settings.store_mode == "memory":
        return InMemoryStore()
    return SQLiteStore(settings.sqlite_path)


store: CaseStore = build_store()
