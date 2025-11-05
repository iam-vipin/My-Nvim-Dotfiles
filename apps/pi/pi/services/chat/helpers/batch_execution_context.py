"""Execution context for managing batch action execution state."""

import datetime
from typing import Any
from typing import Dict
from typing import List
from typing import Optional
from uuid import UUID

from pi import logger

log = logger.getChild(__name__)


class BatchExecutionContext:
    """Manages state during batch action execution."""

    def __init__(self, message_id: UUID, chat_id: UUID, user_id: UUID, workspace_id: UUID, is_project_chat: bool = False):
        self.message_id = message_id
        self.chat_id = chat_id
        self.user_id = user_id
        self.workspace_id = workspace_id
        self.is_project_chat = is_project_chat

        # Execution state
        self.executed_actions: List[Dict[str, Any]] = []
        self.current_step = 0
        self.entity_results: Dict[str, Dict[str, Any]] = {}  # Store created entities by step
        self.failed_at_step: Optional[int] = None
        self.execution_log: List[str] = []
        self.start_time = datetime.datetime.utcnow()

        # Status tracking
        self.status = "running"  # running, success, failed, partial
        self.completed_count = 0
        self.failed_count = 0
        self.total_planned = 0

    def add_execution_result(
        self,
        step_id: str,
        tool_name: str,
        result: Any,
        entity_info: Optional[Dict[str, Any]] = None,
        artifact_id: Optional[str] = None,
        sequence: Optional[int] = None,
        artifact_type: Optional[str] = None,
    ) -> None:
        """Record the result of an executed action."""
        execution_record = {
            "step": self.current_step,
            "step_id": step_id,
            "tool_name": tool_name,
            "result": str(result),
            "entity_info": entity_info,
            "artifact_id": artifact_id,
            "sequence": sequence,
            "artifact_type": artifact_type,
            "executed_at": datetime.datetime.utcnow().isoformat(),
            "success": True,
        }

        self.executed_actions.append(execution_record)

        if entity_info:
            self.entity_results[f"step_{self.current_step}"] = entity_info
            self.entity_results[step_id] = entity_info  # Also store by step_id for easier lookup

        self.completed_count += 1
        self.current_step += 1

    def add_execution_failure(
        self,
        step_id: str,
        tool_name: str,
        error: str,
        artifact_id: Optional[str] = None,
        sequence: Optional[int] = None,
        artifact_type: Optional[str] = None,
    ) -> None:
        """Record a failed action execution."""
        execution_record = {
            "step": self.current_step,
            "step_id": step_id,
            "tool_name": tool_name,
            "error": error,
            "artifact_id": artifact_id,
            "sequence": sequence,
            "artifact_type": artifact_type,
            "executed_at": datetime.datetime.utcnow().isoformat(),
            "success": False,
        }

        self.executed_actions.append(execution_record)
        self.failed_at_step = self.current_step
        self.failed_count += 1
        self.current_step += 1  # Increment step counter for failed actions too

        # Don't immediately set status to "failed" - defer until mark_completed()
        # This allows all planned actions to be attempted instead of stopping on first failure
        # self.status = "failed"  # REMOVED - causes early exit

        log.error(f"Action execution failed: {tool_name} (step {self.current_step - 1}) - {error}")

    def log_message(self, message: str) -> None:
        """Add a message to the execution log."""
        timestamp = datetime.datetime.utcnow().isoformat()
        log_entry = f"[{timestamp}] {message}"
        self.execution_log.append(log_entry)
        # log.info(message)

    def get_entity_by_step(self, step_identifier: str) -> Optional[Dict[str, Any]]:
        """Get entity information by step number or step_id."""
        return self.entity_results.get(step_identifier)

    def get_execution_summary(self) -> Dict[str, Any]:
        """Get a summary of the execution state."""
        duration = (datetime.datetime.utcnow() - self.start_time).total_seconds()

        return {
            "message_id": str(self.message_id),
            "chat_id": str(self.chat_id),
            "status": self.status,
            "total_planned": self.total_planned,
            "completed_count": self.completed_count,
            "failed_count": self.failed_count,
            "failed_at_step": self.failed_at_step,
            "duration_seconds": duration,
            "executed_actions": self.executed_actions,
            "entity_results": self.entity_results,
            "execution_log": self.execution_log[-10:] if self.execution_log else [],  # Last 10 log entries
        }

    def get_clean_summary(self) -> Dict[str, Any]:
        """Get a clean, frontend-friendly summary without debugging information."""
        duration = (datetime.datetime.utcnow() - self.start_time).total_seconds()

        return {
            "message_id": str(self.message_id),
            "chat_id": str(self.chat_id),
            "status": self.status,
            "total_planned": self.total_planned,
            "completed_count": self.completed_count,
            "failed_count": self.failed_count,
            "duration_seconds": round(duration, 2),
        }

    def get_clean_entity_results(self) -> Dict[str, Any]:
        """Get clean entity results without internal debugging information."""
        clean_entities = {}

        for key, entity_info in self.entity_results.items():
            # Skip internal step keys like "step_0", "step_1"
            if key.startswith("step_"):
                continue

            # Keep only essential entity information
            if isinstance(entity_info, dict):
                clean_entity = {}
                for field, value in entity_info.items():
                    # Keep useful fields, skip internal ones
                    if field in ["entity_url", "entity_name", "entity_type", "entity_id"]:
                        clean_entity[field] = value
                    elif field == "tool_name":
                        clean_entity[field] = value
                    elif field == "raw_result" and len(str(value)) < 100:
                        # Only include short raw results
                        clean_entity[field] = value

                if clean_entity:  # Only add if we have useful information
                    clean_entities[key] = clean_entity

        return clean_entities

    def mark_completed(self) -> None:
        """Mark the batch execution as completed with proper status determination."""
        if self.failed_count == 0:
            self.status = "success"
        elif self.completed_count == 0:
            # All actions failed - complete failure
            self.status = "failed"
        else:
            # Mixed results - some succeeded, some failed
            self.status = "partial"

    def can_continue(self) -> bool:
        """Check if execution can continue (not failed)."""
        return self.status != "failed"

    def set_total_planned(self, count: int) -> None:
        """Set the total number of planned actions."""
        self.total_planned = count
