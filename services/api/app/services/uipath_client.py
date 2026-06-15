import asyncio
from dataclasses import dataclass
from typing import Protocol
from uuid import uuid4

from app.errors import AgentTimeoutError, ExternalServiceError
from app.logging_utils import log_event


class UiPathClient(Protocol):
    async def trigger_process(self, process_name: str, payload: dict) -> dict: ...
    async def create_action_center_task(self, task_type: str, payload: dict) -> dict: ...
    async def update_case_attribute(self, case_id: str, attributes: dict) -> dict: ...


@dataclass
class SimulatedUiPathClient:
    timeout_seconds: float = 2.0

    async def trigger_process(self, process_name: str, payload: dict) -> dict:
        return await self._bounded("trigger_process", {"process": process_name, "payload": payload})

    async def create_action_center_task(self, task_type: str, payload: dict) -> dict:
        task_id = f"ACT-{uuid4().hex[:10].upper()}"
        result = {"task_id": task_id, "task_type": task_type, "provider_mode": "simulated"}
        return await self._bounded("create_action_center_task", result | {"payload": payload})

    async def update_case_attribute(self, case_id: str, attributes: dict) -> dict:
        return await self._bounded("update_case_attribute", {"case_id": case_id, "attributes": attributes})

    async def _bounded(self, operation: str, payload: dict) -> dict:
        try:
            result = await asyncio.wait_for(self._simulate(operation, payload), timeout=self.timeout_seconds)
            log_event("uipath.simulated", operation=operation, provider_mode="simulated")
            return result
        except TimeoutError as exc:
            raise AgentTimeoutError(f"Simulated UiPath operation timed out: {operation}") from exc
        except Exception as exc:
            raise ExternalServiceError(f"Simulated UiPath operation failed: {operation}") from exc

    async def _simulate(self, operation: str, payload: dict) -> dict:
        await asyncio.sleep(0)
        return {"operation": operation, "status": "accepted", **payload}


uipath_client: UiPathClient = SimulatedUiPathClient()
