from app.models import CaseEvent, LoanCase


class InMemoryStore:
    def __init__(self) -> None:
        self.cases: dict[str, LoanCase] = {}
        self.events: dict[str, list[CaseEvent]] = {}

    def add_case(self, case: LoanCase) -> LoanCase:
        self.cases[case.id] = case
        self.events[case.id] = []
        self.add_event(case.id, "case_created", case.current_stage, "backend", "Loan case created")
        return case

    def get_case(self, case_id: str) -> LoanCase | None:
        return self.cases.get(case_id)

    def list_cases(self) -> list[LoanCase]:
        return list(self.cases.values())

    def add_event(self, case_id: str, event_type: str, stage: str, actor: str, message: str) -> None:
        self.events.setdefault(case_id, []).append(
            CaseEvent(
                case_id=case_id,
                event_type=event_type,
                stage=stage,
                actor=actor,
                message=message,
            )
        )

    def list_events(self, case_id: str) -> list[CaseEvent]:
        return self.events.get(case_id, [])


store = InMemoryStore()
