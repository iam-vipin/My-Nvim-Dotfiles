"""
Plane SDK Adapter for Plane Python SDK v0.2.x

This adapter shields the rest of our codebase from SDK breaking changes by:
- Using the new resource-based PlaneClient (v0.2.x)
- Preserving existing adapter method names and return shapes
- Converting Pydantic models to plain dicts/lists

Only this file should need changes when the SDK evolves.
"""

import logging
from typing import Any
from typing import Dict
from typing import List
from typing import Optional
from typing import Union
from typing import cast

# New SDK (v0.2.x)
from plane.client import PlaneClient  # type: ignore[attr-defined]
from plane.errors import HttpError  # type: ignore[attr-defined]
from plane.models.cycles import CreateCycle  # type: ignore[attr-defined]
from plane.models.cycles import UpdateCycle  # type: ignore[attr-defined]
from plane.models.intake import CreateIntakeWorkItem  # type: ignore[attr-defined]
from plane.models.intake import UpdateIntakeWorkItem  # type: ignore[attr-defined]
from plane.models.labels import CreateLabel  # type: ignore[attr-defined]
from plane.models.labels import UpdateLabel  # type: ignore[attr-defined]
from plane.models.modules import CreateModule as ModulesCreateModule  # type: ignore[attr-defined]
from plane.models.modules import UpdateModule as ModulesUpdateModule  # type: ignore[attr-defined]
from plane.models.pages import CreatePage  # type: ignore[attr-defined]

# Common models we will use immediately; add more as we migrate additional methods
from plane.models.projects import CreateProject  # type: ignore[attr-defined]
from plane.models.projects import UpdateProject  # type: ignore[attr-defined]
from plane.models.query_params import WorkItemQueryParams  # type: ignore[attr-defined]
from plane.models.states import CreateState  # type: ignore[attr-defined]
from plane.models.states import UpdateState  # type: ignore[attr-defined]
from plane.models.work_item_properties import CreateWorkItemProperty  # type: ignore[attr-defined]
from plane.models.work_item_properties import UpdateWorkItemProperty  # type: ignore[attr-defined]
from plane.models.work_item_types import CreateWorkItemType  # type: ignore[attr-defined]
from plane.models.work_item_types import UpdateWorkItemType  # type: ignore[attr-defined]
from plane.models.work_items import CreateWorkItem  # type: ignore[attr-defined]
from plane.models.work_items import CreateWorkItemComment  # type: ignore[attr-defined]
from plane.models.work_items import CreateWorkItemLink  # type: ignore[attr-defined]
from plane.models.work_items import UpdateWorkItem  # type: ignore[attr-defined]
from plane.models.work_items import UpdateWorkItemAttachment  # type: ignore[attr-defined]
from plane.models.work_items import UpdateWorkItemComment  # type: ignore[attr-defined]
from plane.models.work_items import UpdateWorkItemLink  # type: ignore[attr-defined]
from plane.models.work_items import WorkItemAttachmentUploadRequest  # type: ignore[attr-defined]

log = logging.getLogger(__name__)


class PlaneSDKAdapter:
    """
    Adapter that wraps Plane SDK calls and converts v1 models to plain dicts.
    This avoids pydantic version conflicts by never exposing v1 models directly.
    """

    def __init__(self, access_token: Optional[str] = None, api_key: Optional[str] = None, base_url: str = "https://api.plane.so"):
        """Initialize the v0.2 PlaneClient. base_url must not include /api/v1."""
        if not access_token and not api_key:
            raise ValueError("Either access_token or api_key must be provided")

        # The new client enforces exactly one of api_key/access_token. Prefer access_token if provided.
        if access_token and api_key:
            # Choose access_token to avoid ConfigurationError
            api_key = None

        self.client = PlaneClient(base_url=base_url, access_token=access_token, api_key=api_key)

    def _model_to_dict(self, model: Any) -> Union[Dict[str, Any], List[Any], Any]:
        """
        Convert Pydantic v2 models to plain dictionaries.
        Handles nested models and lists recursively.
        """
        if model is None:
            return None

        # Handle lists
        if isinstance(model, list):
            return [self._model_to_dict(item) for item in model]

        # Handle dictionaries
        if isinstance(model, dict):
            return {k: self._model_to_dict(v) for k, v in model.items()}

        # Handle Pydantic v2 models
        if hasattr(model, "model_dump"):
            # Use Pydantic v2's model_dump method
            data = model.model_dump()
            # Recursively convert nested models
            return {k: self._model_to_dict(v) for k, v in data.items()}
        elif hasattr(model, "dict"):
            # Fallback for backwards compatibility
            data = model.dict()
            return {k: self._model_to_dict(v) for k, v in data.items()}

        # Return primitive types as-is
        return model

    def _safe_model_to_dict(self, model: Any) -> Union[Dict[str, Any], List[Any], Any]:
        """
        Safely convert Pydantic v2 models to plain dictionaries.
        Handles cases where the model might be a list or single object.
        """
        if model is None:
            return None

        # If it's already a list, handle each item
        if isinstance(model, list):
            return [self._model_to_dict(item) for item in model]

        # Otherwise, use the regular conversion
        return self._model_to_dict(model)

    def _get_current_user_id(self) -> Optional[str]:
        """Best-effort helper to fetch current user's id via v0.2 client."""
        try:
            me = self.client.users.get_me()
            # Prefer attribute access, fallback to dict conversion
            if hasattr(me, "id") and getattr(me, "id"):
                return str(getattr(me, "id"))
            me_dict = self._model_to_dict(me)
            if isinstance(me_dict, dict):
                uid = me_dict.get("id") or me_dict.get("user_id")
                return str(uid) if uid else None
        except Exception:
            pass
        return None

    # ============================================================================
    # WORKITEMS API METHODS
    # ============================================================================

    def create_work_item(
        self,
        workspace_slug: str,
        project_id: str,
        name: str,
        description_html: Optional[str] = None,
        priority: Optional[str] = None,
        state: Optional[str] = None,
        assignees: Optional[List[str]] = None,
        labels: Optional[List[str]] = None,
        start_date: Optional[str] = None,
        target_date: Optional[str] = None,
        **kwargs,
    ) -> Dict[str, Any]:
        """
        Create a new work item (issue) and return as plain dict.

        Returns:
            Dict with work item data, safely converted from v1 model
        """
        try:
            data: Dict[str, Any] = {"name": name, "project_id": project_id}
            if description_html is not None:
                data["description_html"] = description_html
            if priority is not None:
                data["priority"] = priority
            # Use 'state' field - CreateWorkItem pydantic model has 'state' field, not 'state_id'
            if state is not None:
                data["state"] = state
            if assignees:
                data["assignees"] = assignees
            if labels:
                data["labels"] = labels
            if start_date:
                data["start_date"] = start_date
            if target_date:
                data["target_date"] = target_date
            # Allow extra fields to pass-through (SDK DTO uses extra="ignore")

            if kwargs:
                filtered_kwargs = {k: v for k, v in kwargs.items() if v is not None}
                data.update(filtered_kwargs)

            request_model = CreateWorkItem(**data)
            issue = self.client.work_items.create(workspace_slug=workspace_slug, project_id=project_id, data=request_model)

            result = self._model_to_dict(issue)
            if isinstance(result, dict):
                return result
            else:
                # Fallback if conversion didn't return a dict
                return {"data": result}

        except HttpError as e:
            log.error(f"Failed to create work item: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to create work item: {str(e)}")
            raise

    def update_work_item(self, workspace_slug: str, project_id: str, issue_id: str, **update_data) -> Dict[str, Any]:
        """
        Update an existing work item and return as plain dict.

        Returns:
            Dict with updated work item data
        """
        try:
            # Map legacy fields
            payload = dict(update_data)
            # if "state" in payload and "state_id" not in payload:
            #     payload["state_id"] = payload.pop("state")

            patched = UpdateWorkItem(**payload)

            issue = self.client.work_items.update(
                workspace_slug=workspace_slug,
                project_id=project_id,
                work_item_id=issue_id,
                data=patched,
            )

            result = self._model_to_dict(issue)
            if isinstance(result, dict):
                return result
            else:
                # Fallback if conversion didn't return a dict
                return {"data": result}

        except HttpError as e:
            log.error(f"Failed to update work item: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to update work item: {str(e)}")
            raise

    def retrieve_work_item(self, workspace_slug: str, project_id: str, issue_id: str, **kwargs) -> Dict[str, Any]:
        """Retrieve a work item using v0.2 client; keep return as dict."""
        try:
            # Optional query params
            params = None
            if kwargs:
                # Only include supported params
                expand = kwargs.get("expand") or kwargs.get("fields")
                if expand:
                    from plane.models.query_params import RetrieveQueryParams  # type: ignore[attr-defined]

                    params = RetrieveQueryParams(expand=str(expand))

            wi = self.client.work_items.retrieve(
                workspace_slug=workspace_slug,
                project_id=project_id,
                work_item_id=issue_id,
                params=params,
            )
            return self._model_to_dict(wi)  # type: ignore[return-value]
        except HttpError as e:
            log.error(f"Failed to retrieve work item: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to retrieve work item: {str(e)}")
            raise

    def list_work_items(self, workspace_slug: str, project_id: str, **kwargs) -> Dict[str, Any]:
        """List work items; normalize pagination to existing shape."""
        try:
            params = None
            if kwargs:
                # Map common filters and query parameters
                per_page = kwargs.get("per_page")
                order_by = kwargs.get("order_by")
                page = kwargs.get("page")
                cursor = kwargs.get("cursor")
                expand = kwargs.get("expand")
                external_id = kwargs.get("external_id")
                external_source = kwargs.get("external_source")
                fields = kwargs.get("fields")

                params = WorkItemQueryParams(
                    per_page=per_page,
                    page=page,
                    order_by=order_by,
                    cursor=cursor,
                    expand=expand,
                    external_id=external_id,
                    external_source=external_source,
                    fields=fields,
                )

            response = self.client.work_items.list(workspace_slug=workspace_slug, project_id=project_id, params=params)
            results = self._model_to_dict(getattr(response, "results", []))
            if not isinstance(results, list):
                results = [results] if results else []
            return {
                "results": results,
                "count": len(results),
                "total_results": getattr(response, "total_count", len(results)),
                "next_cursor": str(getattr(response, "next_page_number", "")) if getattr(response, "next_page_number", None) else None,
                "prev_cursor": str(getattr(response, "prev_page_number", "")) if getattr(response, "prev_page_number", None) else None,
            }
        except HttpError as e:
            log.error(f"Failed to list work items: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to list work items: {str(e)}")
            raise

    def delete_work_item(self, workspace_slug: str, project_id: str, issue_id: str) -> Dict[str, Any]:
        try:
            self.client.work_items.delete(workspace_slug=workspace_slug, project_id=project_id, work_item_id=issue_id)
            return {"success": True}
        except HttpError as e:
            log.error(f"Failed to delete work item: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to delete work item: {str(e)}")
            raise

    def create_work_item_relation(
        self,
        workspace_slug: str,
        project_id: str,
        issue_id: str,
        relation_type: str,
        issues: List[str],
    ) -> Dict[str, Any]:
        """Create work item relations (v0.2)."""
        try:
            payload = {"relation_type": relation_type, "issues": issues}
            resp = self.client.work_items.relations.create(workspace_slug, project_id, issue_id, data=payload)
            return cast(Dict[str, Any], self._model_to_dict(resp))
        except HttpError as e:
            log.error(f"Failed to create work item relation: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to create work item relation: {str(e)}")
            raise

    # ============================================================================
    # USERS API METHODS
    # ============================================================================

    def get_current_user(self) -> Dict[str, Any]:
        """Get current authenticated user info (v0.2)."""
        try:
            user = self.client.users.get_me()
            result = self._model_to_dict(user)
            if isinstance(result, dict):
                return result
            else:
                # Fallback if conversion didn't return a dict
                return {"data": result}
        except HttpError as e:
            log.error(f"Failed to get current user: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to get current user: {str(e)}")
            raise

    # ============================================================================
    # PROJECTS API METHODS
    # ============================================================================

    def create_project(
        self,
        workspace_slug: Optional[str] = None,
        name: Optional[str] = None,
        identifier: Optional[str] = None,
        description: Optional[str] = None,
        **kwargs,
    ) -> Dict[str, Any]:
        """
        Create a new project and return as plain dict.

        Returns:
            Dict with project data, safely converted from v1 model
        """
        try:
            if not name or not identifier:
                raise ValueError("name and identifier are required")

            data = {
                "name": name,
                "identifier": identifier,
                "description": description or "",
            }

            if kwargs:
                filtered_kwargs = {k: v for k, v in kwargs.items() if v is not None}
                data.update(filtered_kwargs)

            project = self.client.projects.create(workspace_slug=workspace_slug, data=CreateProject(**data))

            result = self._model_to_dict(project)
            if isinstance(result, dict):
                return result
            else:
                # Fallback if conversion didn't return a dict
                return {"data": result}

        except HttpError as e:
            log.error(f"Failed to create project: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to create project: {str(e)}")
            raise

    def list_projects(
        self, slug: Optional[str] = None, workspace_slug: Optional[str] = None, per_page: Optional[int] = 20, cursor: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        List projects and return as plain dict with pagination info.

        Returns:
            Dict containing:
            - results: List of project dicts
            - next_cursor: Cursor for next page
            - prev_cursor: Cursor for previous page
            - count: Number of items
            - total_results: Total count
        """
        try:
            effective_slug = slug or workspace_slug
            if not effective_slug:
                raise ValueError("slug (workspace_slug) is required")

            # v0.2: simple list; we ignore cursor here for now (page-based in v0.2)
            response = self.client.projects.list(workspace_slug=effective_slug)

            results_data = self._model_to_dict(getattr(response, "results", []))
            if not isinstance(results_data, list):
                results_data = [results_data] if results_data else []

            # Filter out deleted projects
            filtered_results = []
            for project in results_data:
                if isinstance(project, dict):
                    if project.get("deleted_at") is not None:
                        continue
                    filtered_results.append(project)

            result: Dict[str, Any] = {
                "results": filtered_results,
                "count": len(filtered_results),
                "total_results": getattr(response, "total_count", len(results_data)),
            }

            # v0.2 exposes next_page_number/prev_page_number; we expose as next_cursor/prev_cursor best-effort
            if hasattr(response, "next_page_number") and response.next_page_number is not None:
                result["next_cursor"] = str(response.next_page_number)
            if hasattr(response, "prev_page_number") and response.prev_page_number is not None:
                result["prev_cursor"] = str(response.prev_page_number)

            return result

        except HttpError as e:
            log.error(f"Failed to list projects: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to list projects: {str(e)}")
            raise

    def retrieve_project(self, workspace_slug: str, project_id: str) -> Dict[str, Any]:
        try:
            prj = self.client.projects.retrieve(workspace_slug=workspace_slug, project_id=project_id)
            result = self._model_to_dict(prj)
            if isinstance(result, dict):
                return result
            else:
                # Fallback if conversion didn't return a dict
                return {"data": result}
        except HttpError as e:
            log.error(f"Failed to retrieve project: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to retrieve project: {str(e)}")
            raise

    def update_project(self, workspace_slug: str, project_id: str, **update_data) -> Dict[str, Any]:
        try:
            patched = UpdateProject(**update_data)
            prj = self.client.projects.update(workspace_slug=workspace_slug, project_id=project_id, data=patched)
            result = self._model_to_dict(prj)
            if isinstance(result, dict):
                return result
            else:
                # Fallback if conversion didn't return a dict
                return {"data": result}
        except HttpError as e:
            log.error(f"Failed to update project: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to update project: {str(e)}")
            raise

    def delete_project(self, workspace_slug: str, project_id: str) -> Dict[str, Any]:
        try:
            self.client.projects.delete(workspace_slug=workspace_slug, project_id=project_id)
            return {"success": True}
        except HttpError as e:
            log.error(f"Failed to delete project: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to delete project: {str(e)}")
            raise

    # ============================================================================
    # ASSETS API METHODS
    # ============================================================================

    def create_generic_asset_upload(self, workspace_slug: str, project_id: str, **kwargs) -> Union[Dict[str, Any], List[Any], Any]:
        """Create a generic asset upload."""
        try:
            from plane import GenericAssetUploadRequest  # type: ignore[attr-defined]

            request = GenericAssetUploadRequest(**kwargs)
            response = self.client.assets.create_generic_asset_upload(slug=workspace_slug, generic_asset_upload_request=request)
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to create generic asset upload: {str(e)}")
            raise

    def create_user_asset_upload(self, workspace_slug: str, project_id: str, **kwargs) -> Union[Dict[str, Any], List[Any], Any]:
        """Create a user asset upload."""
        try:
            from plane import UserAssetUploadRequest  # type: ignore[attr-defined]

            request = UserAssetUploadRequest(**kwargs)
            response = self.client.assets.create_user_asset_upload(user_asset_upload_request=request)
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to create user asset upload: {str(e)}")
            raise

    def get_generic_asset(self, workspace_slug: str, project_id: str, asset_id: str, **kwargs) -> Union[Dict[str, Any], List[Any], Any]:
        """Get a generic asset."""
        try:
            response = self.client.assets.get_generic_asset(asset_id=asset_id, slug=workspace_slug, **kwargs)
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to get generic asset: {str(e)}")
            raise

    def update_generic_asset(self, workspace_slug: str, project_id: str, asset_id: str, **kwargs) -> Union[Dict[str, Any], List[Any], Any]:
        """Update a generic asset."""
        try:
            response = self.client.assets.update_generic_asset(asset_id=asset_id, slug=workspace_slug, **kwargs)
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to update generic asset: {str(e)}")
            raise

    def update_user_asset(self, workspace_slug: str, project_id: str, asset_id: str, **kwargs) -> Union[Dict[str, Any], List[Any], Any]:
        """Update a user asset."""
        try:
            response = self.client.assets.update_user_asset(asset_id=asset_id, **kwargs)
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to update user asset: {str(e)}")
            raise

    def delete_user_asset(self, workspace_slug: str, project_id: str, asset_id: str) -> bool:
        """Delete a user asset."""
        try:
            self.client.assets.delete_user_asset(asset_id=asset_id)
            return True
        except Exception as e:
            log.error(f"Failed to delete user asset: {str(e)}")
            raise

    # ============================================================================
    # LABELS API METHODS
    # ============================================================================

    def list_labels(self, workspace_slug: str, project_id: str) -> Dict[str, Any]:
        """List labels (v0.2)."""
        try:
            resp = self.client.labels.list(workspace_slug, project_id)
            results = self._model_to_dict(getattr(resp, "results", []))
            if not isinstance(results, list):
                results = [results] if results else []
            return {
                "results": results,
                "count": len(results),
                "total_results": getattr(resp, "total_count", len(results)),
                "next_cursor": str(getattr(resp, "next_page_number", "")) if getattr(resp, "next_page_number", None) else None,
                "prev_cursor": str(getattr(resp, "prev_page_number", "")) if getattr(resp, "prev_page_number", None) else None,
            }
        except HttpError as e:
            log.error(f"Failed to list labels: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to list labels: {str(e)}")
            raise

    def create_label(self, workspace_slug: str, project_id: str, **kwargs) -> Dict[str, Any]:
        """Create a label (v0.2). Requires name."""
        try:
            name = kwargs.get("name")
            if not name:
                raise ValueError("name is required to create a label")

            # Build payload with all supported CreateLabel fields
            payload = {"name": name}

            # Add optional fields if provided
            for field in ["color", "description", "parent", "sort_order", "external_source", "external_id"]:
                if field in kwargs and kwargs[field] is not None:
                    payload[field] = kwargs[field]

            data_model = CreateLabel(**payload)
            resp = self.client.labels.create(workspace_slug, project_id, data=data_model)
            return cast(Dict[str, Any], self._model_to_dict(resp))
        except HttpError as e:
            log.error(f"Failed to create label: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to create label: {str(e)}")
            raise

    def update_label(self, workspace_slug: str, project_id: str, label_id: str, **kwargs) -> Dict[str, Any]:
        """Update a label (v0.2)."""
        try:
            payload = {k: v for k, v in kwargs.items() if v is not None}
            data_model = UpdateLabel(**payload)
            resp = self.client.labels.update(workspace_slug, project_id, label_id, data=data_model)
            return cast(Dict[str, Any], self._model_to_dict(resp))
        except HttpError as e:
            log.error(f"Failed to update label: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to update label: {str(e)}")
            raise

    def delete_label(self, workspace_slug: str, project_id: str, label_id: str) -> Dict[str, Any]:
        """Delete a label (v0.2)."""
        try:
            self.client.labels.delete(workspace_slug, project_id, label_id)
            return {"success": True}
        except HttpError as e:
            log.error(f"Failed to delete label: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to delete label: {str(e)}")
            raise

    def retrieve_label(self, workspace_slug: str, project_id: str, label_id: str) -> Dict[str, Any]:
        """Retrieve a label (v0.2)."""
        try:
            resp = self.client.labels.retrieve(workspace_slug, project_id, label_id)
            return cast(Dict[str, Any], self._model_to_dict(resp))
        except HttpError as e:
            log.error(f"Failed to retrieve label: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to retrieve label: {str(e)}")
            raise

    # ============================================================================
    # STATES API METHODS
    # ============================================================================

    def list_states(self, workspace_slug: str, project_id: str) -> Dict[str, Any]:
        """List states (v0.2)."""
        try:
            resp = self.client.states.list(workspace_slug, project_id)
            results = self._model_to_dict(getattr(resp, "results", []))
            if not isinstance(results, list):
                results = [results] if results else []
            return {
                "results": results,
                "count": len(results),
                "total_results": getattr(resp, "total_count", len(results)),
                "next_cursor": str(getattr(resp, "next_page_number", "")) if getattr(resp, "next_page_number", None) else None,
                "prev_cursor": str(getattr(resp, "prev_page_number", "")) if getattr(resp, "prev_page_number", None) else None,
            }
        except HttpError as e:
            log.error(f"Failed to list states: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to list states: {str(e)}")
            raise

    def create_state(self, workspace_slug: str, project_id: str, **kwargs) -> Dict[str, Any]:
        """Create a state (v0.2). Requires name, color, group."""
        try:
            required = {"name", "color", "group"}
            if not required.issubset(set(kwargs.keys())):
                raise ValueError("name, color, group are required to create a state")
            data_model = CreateState(**{k: v for k, v in kwargs.items() if v is not None})
            resp = self.client.states.create(workspace_slug, project_id, data=data_model)
            return cast(Dict[str, Any], self._model_to_dict(resp))
        except HttpError as e:
            log.error(f"Failed to create state: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to create state: {str(e)}")
            raise

    def update_state(self, workspace_slug: str, project_id: str, state_id: str, **kwargs) -> Dict[str, Any]:
        """Update a state (v0.2)."""
        try:
            data_model = UpdateState(**{k: v for k, v in kwargs.items() if v is not None})
            resp = self.client.states.update(workspace_slug, project_id, state_id, data=data_model)
            return cast(Dict[str, Any], self._model_to_dict(resp))
        except HttpError as e:
            log.error(f"Failed to update state: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to update state: {str(e)}")
            raise

    def retrieve_state(self, workspace_slug: str, project_id: str, state_id: str) -> Dict[str, Any]:
        """Retrieve a state (v0.2)."""
        try:
            resp = self.client.states.retrieve(workspace_slug, project_id, state_id)
            return cast(Dict[str, Any], self._model_to_dict(resp))
        except HttpError as e:
            log.error(f"Failed to retrieve state: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to retrieve state: {str(e)}")
            raise

    def delete_state(self, workspace_slug: str, project_id: str, state_id: str) -> Dict[str, Any]:
        """Delete a state (v0.2)."""
        try:
            self.client.states.delete(workspace_slug, project_id, state_id)
            return {"success": True}
        except HttpError as e:
            log.error(f"Failed to delete state: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to delete state: {str(e)}")
            raise

    # ============================================================================
    # MODULES API METHODS
    # ============================================================================

    def list_modules(self, workspace_slug: str, project_id: str) -> Dict[str, Any]:
        """List modules (v0.2) with normalized pagination."""
        try:
            response = self.client.modules.list(workspace_slug, project_id)
            results = self._model_to_dict(getattr(response, "results", []))
            if not isinstance(results, list):
                results = [results] if results else []
            return {
                "results": results,
                "count": len(results),
                "total_results": getattr(response, "total_count", len(results)),
                "next_cursor": str(getattr(response, "next_page_number", "")) if getattr(response, "next_page_number", None) else None,
                "prev_cursor": str(getattr(response, "prev_page_number", "")) if getattr(response, "prev_page_number", None) else None,
            }
        except HttpError as e:
            log.error(f"Failed to list modules: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to list modules: {str(e)}")
            raise

    def create_module(self, workspace_slug: str, project_id: str, **kwargs) -> Dict[str, Any]:
        """Create a new module (v0.2). Requires name in kwargs."""
        try:
            name = kwargs.get("name")
            if not name:
                raise ValueError("name is required to create a module")
            payload: Dict[str, Any] = {"name": name}
            for key in [
                "description",
                "start_date",
                "target_date",
                "status",
                "lead",
                "members",
                "external_source",
                "external_id",
            ]:
                if key in kwargs and kwargs[key] is not None:
                    payload[key] = kwargs[key]

            data_model = ModulesCreateModule(**payload)
            resp = self.client.modules.create(workspace_slug, project_id, data=data_model)
            return cast(Dict[str, Any], self._model_to_dict(resp))
        except HttpError as e:
            # Log detailed error information
            error_details = ""
            try:
                if hasattr(e, "response") and e.response:
                    # Generic response object (requests/httpx style)
                    if hasattr(e.response, "text"):
                        error_details = f", response_text={e.response.text}"
                    elif hasattr(e.response, "content"):
                        error_details = f", response_content={e.response.content}"

                    if hasattr(e.response, "status_code"):
                        error_details += f", status={e.response.status_code}"
            except Exception:
                pass

            log.error(f"Failed to create module: {e} " f"(status_code={getattr(e, "status_code", None)}" f"{error_details})")
            raise
        except Exception as e:
            log.error(f"Failed to create module: {str(e)}")
            raise

    def update_module(self, workspace_slug: str, project_id: str, module_id: str, **kwargs) -> Dict[str, Any]:
        """Update a module (v0.2)."""
        try:
            payload = {k: v for k, v in kwargs.items() if v is not None}
            data_model = ModulesUpdateModule(**payload)
            resp = self.client.modules.update(workspace_slug, project_id, module_id, data=data_model)
            return cast(Dict[str, Any], self._model_to_dict(resp))
        except HttpError as e:
            log.error(f"Failed to update module: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to update module: {str(e)}")
            raise

    def delete_module(self, workspace_slug: str, project_id: str, module_id: str) -> Dict[str, Any]:
        """Delete a module (v0.2)."""
        try:
            self.client.modules.delete(workspace_slug, project_id, module_id)
            return {"success": True}
        except HttpError as e:
            log.error(f"Failed to delete module: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to delete module: {str(e)}")
            raise

    def add_module_work_items(self, workspace_slug: str, project_id: str, module_id: str, issues: List[str]) -> Dict[str, Any]:
        """Add work items to a module (v0.2)."""
        try:
            # SDK expects issue_ids as positional argument, not data= keyword
            # Pass issue_ids as keyword argument to match SDK signature
            self.client.modules.add_work_items(workspace_slug, project_id, module_id, issue_ids=issues)
            # SDK method returns None, so return success response
            return {"success": True, "issues_added": len(issues)}
        except HttpError as e:
            log.error(f"Failed to add module work items: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to add module work items: {str(e)}")
            raise

    def retrieve_module(self, workspace_slug: str, project_id: str, module_id: str) -> Dict[str, Any]:
        """Retrieve a module (v0.2)."""
        try:
            resp = self.client.modules.retrieve(workspace_slug, project_id, module_id)
            return cast(Dict[str, Any], self._model_to_dict(resp))
        except HttpError as e:
            log.error(f"Failed to retrieve module: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to retrieve module: {str(e)}")
            raise

    def archive_module(self, workspace_slug: str, project_id: str, module_id: str) -> Dict[str, Any]:
        """Archive a module (v0.2)."""
        try:
            self.client.modules.archive(workspace_slug, project_id, module_id)
            return {"success": True}
        except HttpError as e:
            log.error(f"Failed to archive module: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to archive module: {str(e)}")
            raise

    def unarchive_module(self, workspace_slug: str, project_id: str, module_id: str) -> Dict[str, Any]:
        """Unarchive a module (v0.2)."""
        try:
            self.client.modules.unarchive(workspace_slug, project_id, module_id)
            return {"success": True}
        except HttpError as e:
            log.error(f"Failed to unarchive module: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to unarchive module: {str(e)}")
            raise

    def list_archived_modules(self, workspace_slug: str, project_id: str) -> Dict[str, Any]:
        """List archived modules (v0.2)."""
        try:
            response = self.client.modules.list_archived(workspace_slug, project_id)
            results = self._model_to_dict(getattr(response, "results", []))
            if not isinstance(results, list):
                results = [results] if results else []
            return {
                "results": results,
                "count": len(results),
                "total_results": getattr(response, "total_count", len(results)),
                "next_cursor": str(getattr(response, "next_page_number", "")) if getattr(response, "next_page_number", None) else None,
                "prev_cursor": str(getattr(response, "prev_page_number", "")) if getattr(response, "prev_page_number", None) else None,
            }
        except HttpError as e:
            log.error(f"Failed to list archived modules: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to list archived modules: {str(e)}")
            raise

    def list_module_work_items(self, workspace_slug: str, project_id: str, module_id: str) -> Dict[str, Any]:
        """List work items in a module (v0.2)."""
        try:
            response = self.client.modules.list_work_items(workspace_slug, project_id, module_id)
            results = self._model_to_dict(getattr(response, "results", []))
            if not isinstance(results, list):
                results = [results] if results else []
            return {
                "results": results,
                "count": len(results),
                "total_results": getattr(response, "total_count", len(results)),
                "next_cursor": str(getattr(response, "next_page_number", "")) if getattr(response, "next_page_number", None) else None,
                "prev_cursor": str(getattr(response, "prev_page_number", "")) if getattr(response, "prev_page_number", None) else None,
            }
        except HttpError as e:
            log.error(f"Failed to list module work items: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to list module work items: {str(e)}")
            raise

    def remove_module_work_item(self, workspace_slug: str, project_id: str, module_id: str, issue_id: str) -> Dict[str, Any]:
        """Remove a work item from a module (v0.2 remove_work_item)."""
        try:
            self.client.modules.remove_work_item(workspace_slug, project_id, module_id, issue_id)
            return {"success": True}
        except HttpError as e:
            log.error(f"Failed to remove work item from module: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to remove work item from module: {str(e)}")
            raise

    # ============================================================================
    # PAGES API METHODS
    # ============================================================================

    def create_project_page(
        self,
        project_id: str,
        slug: Optional[str] = None,
        workspace_slug: Optional[str] = None,
        page_create_api_request: Optional[Any] = None,
        name: Optional[str] = None,
        description_html: Optional[str] = None,
        access: Optional[int] = None,
        color: Optional[str] = None,
        logo_props: Optional[dict] = None,
        **kwargs,
    ) -> Dict[str, Any]:
        """Create a project page (v0.2)."""
        try:
            effective_slug = slug or workspace_slug
            if not effective_slug:
                raise ValueError("slug (workspace_slug) is required")
            if not project_id:
                raise ValueError("project_id is required")

            # Build payload from provided parameters
            if page_create_api_request is not None:
                if hasattr(page_create_api_request, "model_dump"):
                    payload = page_create_api_request.model_dump(exclude_none=True)
                elif hasattr(page_create_api_request, "dict"):
                    payload = page_create_api_request.dict()
                elif isinstance(page_create_api_request, dict):
                    payload = dict(page_create_api_request)
                else:
                    payload = {}
            else:
                payload = {}

            # Override with explicit parameters if provided
            if name is not None:
                payload["name"] = name
            if description_html is not None:
                payload["description_html"] = description_html
            if access is not None:
                payload["access"] = access
            if color is not None:
                payload["color"] = color
            if logo_props is not None:
                payload["logo_props"] = logo_props

            # Add any extra kwargs
            payload.update({k: v for k, v in kwargs.items() if v is not None})

            # Ensure name is present (required field)
            if "name" not in payload or not payload["name"]:
                raise ValueError("name is required to create a page")

            # Create the DTO
            data_model = CreatePage(**payload)

            # Call the SDK
            resp = self.client.pages.create_project_page(effective_slug, project_id, data=data_model)
            return cast(Dict[str, Any], self._model_to_dict(resp))
        except HttpError as e:
            log.error(f"Failed to create project page: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to create project page: {str(e)}")
            raise

    def create_workspace_page(
        self,
        slug: Optional[str] = None,
        workspace_slug: Optional[str] = None,
        page_create_api_request: Optional[Any] = None,
        name: Optional[str] = None,
        description_html: Optional[str] = None,
        access: Optional[int] = None,
        color: Optional[str] = None,
        logo_props: Optional[dict] = None,
        **kwargs,
    ) -> Dict[str, Any]:
        """Create a workspace page (v0.2)."""
        try:
            effective_slug = slug or workspace_slug
            if not effective_slug:
                raise ValueError("slug (workspace_slug) is required")

            # Build payload from provided parameters
            if page_create_api_request is not None:
                if hasattr(page_create_api_request, "model_dump"):
                    payload = page_create_api_request.model_dump(exclude_none=True)
                elif hasattr(page_create_api_request, "dict"):
                    payload = page_create_api_request.dict()
                elif isinstance(page_create_api_request, dict):
                    payload = dict(page_create_api_request)
                else:
                    payload = {}
            else:
                payload = {}

            # Override with explicit parameters if provided
            if name is not None:
                payload["name"] = name
            if description_html is not None:
                payload["description_html"] = description_html
            if access is not None:
                payload["access"] = access
            if color is not None:
                payload["color"] = color
            if logo_props is not None:
                payload["logo_props"] = logo_props

            # Add any extra kwargs
            payload.update({k: v for k, v in kwargs.items() if v is not None})

            # Ensure name is present (required field)
            if "name" not in payload or not payload["name"]:
                raise ValueError("name is required to create a page")

            # Create the DTO
            data_model = CreatePage(**payload)

            # Call the SDK
            resp = self.client.pages.create_workspace_page(effective_slug, data=data_model)
            return cast(Dict[str, Any], self._model_to_dict(resp))
        except HttpError as e:
            log.error(f"Failed to create workspace page: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to create workspace page: {str(e)}")
            raise

    def list_workspace_pages(self, workspace_slug: str) -> Dict[str, Any]:
        """List workspace pages (v0.2)."""
        try:
            response = self.client.pages.list_workspace_pages(workspace_slug)
            results = self._model_to_dict(getattr(response, "results", []))
            if not isinstance(results, list):
                results = [results] if results else []
            return {
                "results": results,
                "count": len(results),
                "total_results": getattr(response, "total_count", len(results)),
                "next_cursor": str(getattr(response, "next_page_number", "")) if getattr(response, "next_page_number", None) else None,
                "prev_cursor": str(getattr(response, "prev_page_number", "")) if getattr(response, "prev_page_number", None) else None,
            }
        except HttpError as e:
            log.error(f"Failed to list workspace pages: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to list workspace pages: {str(e)}")
            raise

    def list_project_pages(self, workspace_slug: str, project_id: str) -> Dict[str, Any]:
        """List project pages (v0.2)."""
        try:
            response = self.client.pages.list_project_pages(workspace_slug, project_id)
            results = self._model_to_dict(getattr(response, "results", []))
            if not isinstance(results, list):
                results = [results] if results else []
            return {
                "results": results,
                "count": len(results),
                "total_results": getattr(response, "total_count", len(results)),
                "next_cursor": str(getattr(response, "next_page_number", "")) if getattr(response, "next_page_number", None) else None,
                "prev_cursor": str(getattr(response, "prev_page_number", "")) if getattr(response, "prev_page_number", None) else None,
            }
        except HttpError as e:
            log.error(f"Failed to list project pages: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to list project pages: {str(e)}")
            raise

    def retrieve_workspace_page(self, workspace_slug: str, page_id: str) -> Dict[str, Any]:
        """Retrieve a workspace page (v0.2)."""
        try:
            resp = self.client.pages.retrieve_workspace_page(workspace_slug, page_id)
            return cast(Dict[str, Any], self._model_to_dict(resp))
        except HttpError as e:
            log.error(f"Failed to retrieve workspace page: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to retrieve workspace page: {str(e)}")
            raise

    def retrieve_project_page(self, workspace_slug: str, project_id: str, page_id: str) -> Dict[str, Any]:
        """Retrieve a project page (v0.2)."""
        try:
            resp = self.client.pages.retrieve_project_page(workspace_slug, project_id, page_id)
            return cast(Dict[str, Any], self._model_to_dict(resp))
        except HttpError as e:
            log.error(f"Failed to retrieve project page: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to retrieve project page: {str(e)}")
            raise

    # ============================================================================
    # CYCLES API METHODS
    # ============================================================================

    def create_cycle(
        self,
        workspace_slug: str,
        project_id: str,
        name: str,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        description: Optional[str] = None,
        owned_by: Optional[str] = None,
        **kwargs,
    ) -> Dict[str, Any]:
        """Create a cycle using PlaneClient v0.2 and return as dict."""
        try:
            # API requires both dates or neither - validate early
            if (start_date is None) != (end_date is None):
                raise ValueError("Both start_date and end_date are required together, or neither should be provided")

            data = {"name": name, "project_id": project_id}
            if start_date:
                data["start_date"] = start_date
            if end_date:
                data["end_date"] = end_date
            if description:
                data["description"] = description
            if not owned_by:
                owned_by = self._get_current_user_id()
            if owned_by:
                data["owned_by"] = owned_by
            else:
                # CreateCycle requires owned_by; fail early with clear message
                raise ValueError("owner could not be determined; please provide owned_by explicitly")

            data["project_id"] = project_id

            # Only include kwargs that are not None to avoid sending null values to API
            if kwargs:
                filtered_kwargs = {k: v for k, v in kwargs.items() if v is not None}
                data.update(filtered_kwargs)
            print("create cycle p args", workspace_slug, project_id)
            print("create cycle data", data)

            model = CreateCycle(**data)
            cycle = self.client.cycles.create(workspace_slug, project_id, data=model)
            return cast(Dict[str, Any], self._model_to_dict(cycle))
        except HttpError as e:
            log.error(f"Failed to create cycle: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to create cycle: {str(e)}")
            raise

    def list_cycles(
        self,
        workspace_slug: str,
        project_id: str,
        per_page: Optional[int] = None,
        page: Optional[int] = None,
        cursor: Optional[str] = None,
        cycle_view: Optional[str] = None,
    ) -> Dict[str, Any]:
        """List cycles with normalized pagination."""
        try:
            # Build query parameters for SDK
            params: Dict[str, Any] = {}
            if per_page is not None:
                params["per_page"] = per_page
            if page is not None:
                params["page"] = page
            if cursor is not None:
                params["cursor"] = cursor
            if cycle_view is not None:
                params["cycle_view"] = cycle_view

            # Pass params to SDK
            response = self.client.cycles.list(workspace_slug, project_id, params=params or None)
            results = self._model_to_dict(getattr(response, "results", []))
            if not isinstance(results, list):
                results = [results] if results else []
            return {
                "results": results,
                "count": len(results),
                "total_results": getattr(response, "total_count", len(results)),
                "next_cursor": str(getattr(response, "next_page_number", "")) if getattr(response, "next_page_number", None) else None,
                "prev_cursor": str(getattr(response, "prev_page_number", "")) if getattr(response, "prev_page_number", None) else None,
            }
        except HttpError as e:
            log.error(f"Failed to list cycles: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to list cycles: {str(e)}")
            raise

    def retrieve_cycle(self, workspace_slug: str, project_id: str, cycle_id: str) -> Dict[str, Any]:
        """Get a specific cycle by ID using v0.2 client."""
        try:
            response = self.client.cycles.retrieve(workspace_slug, project_id, cycle_id)
            return cast(Dict[str, Any], self._model_to_dict(response))
        except HttpError as e:
            log.error(f"Failed to retrieve cycle: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to retrieve cycle: {str(e)}")
            raise

    def update_cycle(
        self,
        workspace_slug: str,
        project_id: str,
        cycle_id: str,
        **kwargs,
    ) -> Dict[str, Any]:
        """Update a cycle using PlaneClient v0.2 and return as dict."""
        try:
            # Build payload with only non-None values
            payload = {k: v for k, v in kwargs.items() if v is not None}

            model = UpdateCycle(**payload)
            cycle = self.client.cycles.update(workspace_slug, project_id, cycle_id, data=model)
            return cast(Dict[str, Any], self._model_to_dict(cycle))
        except HttpError as e:
            log.error(f"Failed to update cycle: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to update cycle: {str(e)}")
            raise

    def archive_cycle(self, workspace_slug: str, project_id: str, cycle_id: str) -> Dict[str, Any]:
        """Archive a cycle (v0.2)."""
        try:
            self.client.cycles.archive(workspace_slug, project_id, cycle_id)
            return {"success": True}
        except HttpError as e:
            log.error(f"Failed to archive cycle: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to archive cycle: {str(e)}")
            raise

    def unarchive_cycle(self, workspace_slug: str, project_id: str, cycle_id: str) -> Dict[str, Any]:
        """Unarchive a cycle (v0.2)."""
        try:
            self.client.cycles.unarchive(workspace_slug, project_id, cycle_id)
            return {"success": True}
        except HttpError as e:
            log.error(f"Failed to unarchive cycle: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to unarchive cycle: {str(e)}")
            raise

    def list_archived_cycles(self, workspace_slug: str, project_id: str) -> Dict[str, Any]:
        """List archived cycles (v0.2)."""
        try:
            response = self.client.cycles.list_archived(workspace_slug, project_id)
            results = self._model_to_dict(getattr(response, "results", []))
            if not isinstance(results, list):
                results = [results] if results else []
            return {
                "results": results,
                "count": len(results),
                "total_results": getattr(response, "total_count", len(results)),
                "next_cursor": str(getattr(response, "next_page_number", "")) if getattr(response, "next_page_number", None) else None,
                "prev_cursor": str(getattr(response, "prev_page_number", "")) if getattr(response, "prev_page_number", None) else None,
            }
        except HttpError as e:
            log.error(f"Failed to list archived cycles: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to list archived cycles: {str(e)}")
            raise

    def add_cycle_work_items(self, workspace_slug: str, project_id: str, cycle_id: str, issues: List[str]) -> Dict[str, Any]:
        """Add work items to a cycle (v0.2)."""
        # log all input arguments
        log.info(f"Adding work items to cycle {workspace_slug}, {project_id}, {cycle_id}, {issues}")
        try:
            # Pass request as positional argument (not data= keyword)
            response = self.client.cycles.add_work_items(workspace_slug, project_id, cycle_id, issue_ids=issues)
            return cast(Dict[str, Any], self._model_to_dict(response))
        except HttpError as e:
            log.error(f"Failed to add work items to cycle: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to add work items to cycle: {str(e)}")
            raise

    def list_cycle_work_items(self, workspace_slug: str, project_id: str, cycle_id: str) -> Dict[str, Any]:
        """List work items in a cycle (v0.2)."""
        try:
            response = self.client.cycles.list_work_items(workspace_slug, project_id, cycle_id)
            items = self._model_to_dict(getattr(response, "results", []))
            if not isinstance(items, list):
                items = [items] if items else []
            return {
                "results": items,
                "count": len(items),
                "total_results": getattr(response, "total_count", len(items)),
                "next_cursor": str(getattr(response, "next_page_number", "")) if getattr(response, "next_page_number", None) else None,
                "prev_cursor": str(getattr(response, "prev_page_number", "")) if getattr(response, "prev_page_number", None) else None,
            }
        except HttpError as e:
            log.error(f"Failed to list cycle work items: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to list cycle work items: {str(e)}")
            raise

    def remove_cycle_work_item(self, workspace_slug: str, project_id: str, cycle_id: str, work_item_id: str) -> Dict[str, Any]:
        """Remove a work item from a cycle (v0.2 remove_work_item)."""
        try:
            self.client.cycles.remove_work_item(workspace_slug, project_id, cycle_id, work_item_id)
            return {"success": True}
        except HttpError as e:
            log.error(f"Failed to remove work item from cycle: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to remove work item from cycle: {str(e)}")
            raise

    def transfer_cycle_work_items(self, workspace_slug: str, project_id: str, cycle_id: str, new_cycle_id: str) -> Dict[str, Any]:
        """Transfer work items between cycles (v0.2)."""
        try:
            payload = {"new_cycle_id": new_cycle_id}
            resp = self.client.cycles.transfer_work_items(workspace_slug, project_id, cycle_id, data=payload)
            return cast(Dict[str, Any], self._model_to_dict(resp))
        except HttpError as e:
            log.error(f"Failed to transfer cycle work items: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to transfer cycle work items: {str(e)}")
            raise

    def delete_cycle(self, workspace_slug: str, project_id: str, cycle_id: str) -> Dict[str, Any]:
        """Delete a cycle (v0.2)."""
        try:
            self.client.cycles.delete(workspace_slug, project_id, cycle_id)
            return {"success": True}
        except HttpError as e:
            log.error(f"Failed to delete cycle: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to delete cycle: {str(e)}")
            raise

    # ============================================================================
    # INTAKE API METHODS
    # ============================================================================

    def create_intake_work_item(self, workspace_slug: str, project_id: str, **kwargs) -> Dict[str, Any]:
        """Create a new intake work item (v0.2)."""
        try:
            payload = {k: v for k, v in kwargs.items() if v is not None}
            data_model = CreateIntakeWorkItem(**payload)
            resp = self.client.intake.create(workspace_slug, project_id, data=data_model)
            return cast(Dict[str, Any], self._model_to_dict(resp))
        except HttpError as e:
            log.error(f"Failed to create intake work item: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to create intake work item: {str(e)}")
            raise

    def get_intake_work_items_list(
        self,
        workspace_slug: str,
        project_id: str,
        per_page: Optional[int] = None,
        cursor: Optional[str] = None,
    ) -> Dict[str, Any]:
        """List intake work items (v0.2)."""
        try:
            # Build query parameters for SDK
            params: Dict[str, Any] = {}
            if per_page is not None:
                params["per_page"] = per_page
            if cursor is not None:
                params["cursor"] = cursor

            # Pass params to SDK
            response = self.client.intake.list(workspace_slug, project_id, params=params or None)
            results = self._model_to_dict(getattr(response, "results", []))
            if not isinstance(results, list):
                results = [results] if results else []
            return {
                "results": results,
                "count": len(results),
                "total_results": getattr(response, "total_count", len(results)),
                "next_cursor": str(getattr(response, "next_page_number", "")) if getattr(response, "next_page_number", None) else None,
                "prev_cursor": str(getattr(response, "prev_page_number", "")) if getattr(response, "prev_page_number", None) else None,
            }
        except HttpError as e:
            log.error(f"Failed to list intake work items: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to list intake work items: {str(e)}")
            raise

    def retrieve_intake_work_item(self, workspace_slug: str, project_id: str, intake_id: str) -> Dict[str, Any]:
        """Retrieve a specific intake work item (v0.2)."""
        try:
            resp = self.client.intake.retrieve(workspace_slug, project_id, intake_id)
            return cast(Dict[str, Any], self._model_to_dict(resp))
        except HttpError as e:
            log.error(f"Failed to retrieve intake work item: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to retrieve intake work item: {str(e)}")
            raise

    def update_intake_work_item(self, workspace_slug: str, project_id: str, intake_id: str, **kwargs) -> Dict[str, Any]:
        """Update an intake work item (v0.2)."""
        try:
            payload = {k: v for k, v in kwargs.items() if v is not None}
            data_model = UpdateIntakeWorkItem(**payload)
            resp = self.client.intake.update(workspace_slug, project_id, intake_id, data=data_model)
            return cast(Dict[str, Any], self._model_to_dict(resp))
        except HttpError as e:
            log.error(f"Failed to update intake work item: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to update intake work item: {str(e)}")
            raise

    def delete_intake_work_item(self, workspace_slug: str, project_id: str, intake_id: str) -> Dict[str, Any]:
        """Delete an intake work item (v0.2)."""
        try:
            self.client.intake.delete(workspace_slug, project_id, intake_id)
            return {"success": True}
        except HttpError as e:
            log.error(f"Failed to delete intake work item: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to delete intake work item: {str(e)}")
            raise

    # ============================================================================
    # MEMBERS API METHODS
    # ============================================================================

    def get_workspace_members(self, workspace_slug: str) -> Dict[str, Any]:
        """Get list of all workspace members and their counts.
        Returns user_id, first_name, last_name, email, and display_name of each member.
        Includes bot users."""
        try:
            # SDK returns a list of UserLite objects directly, not a paginated response
            response = self.client.workspaces.get_members(workspace_slug)
            results = self._model_to_dict(response)
            if not isinstance(results, list):
                results = [results] if results else []
            return {
                "results": results,
                "count": len(results),
                "total_results": len(results),
                "next_cursor": None,
                "prev_cursor": None,
            }
        except HttpError as e:
            log.error(f"Failed to get workspace members: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to get workspace members: {str(e)}")
            raise

    def get_project_members(self, workspace_slug: str, project_id: str) -> Dict[str, Any]:
        """Get list of all project members and their counts.
        Returns user_id, first_name, last_name, email, and display_name of each member.
        Includes bot users."""
        try:
            # SDK returns a list of UserLite objects directly, not a paginated response
            response = self.client.projects.get_members(workspace_slug, project_id)
            results = self._model_to_dict(response)
            if not isinstance(results, list):
                results = [results] if results else []
            return {
                "results": results,
                "count": len(results),
                "total_results": len(results),
                "next_cursor": None,
                "prev_cursor": None,
            }
        except HttpError as e:
            log.error(f"Failed to get project members: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to get project members: {str(e)}")
            raise

    # ============================================================================
    # ACTIVITY API METHODS
    # ============================================================================

    def list_work_item_activities(self, workspace_slug: str, project_id: str, issue_id: Optional[str] = None) -> Dict[str, Any]:
        """List work item activities (v0.2)."""
        try:
            if issue_id:
                response = self.client.work_items.activity.list(workspace_slug, project_id, issue_id)
            else:
                # Best-effort: try project-level activities
                response = self.client.work_items.activity.list(workspace_slug, project_id, "")
            results = self._model_to_dict(getattr(response, "results", []))
            if not isinstance(results, list):
                results = [results] if results else []
            return {
                "results": results,
                "count": len(results),
                "total_results": getattr(response, "total_count", len(results)),
                "next_cursor": str(getattr(response, "next_page_number", "")) if getattr(response, "next_page_number", None) else None,
                "prev_cursor": str(getattr(response, "prev_page_number", "")) if getattr(response, "prev_page_number", None) else None,
            }
        except HttpError as e:
            log.error(f"Failed to list work item activities: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to list work item activities: {str(e)}")
            raise

    def retrieve_work_item_activity(self, workspace_slug: str, project_id: str, issue_id: str, activity_id: str) -> Dict[str, Any]:
        """Retrieve a specific work item activity (v0.2)."""
        try:
            resp = self.client.work_items.activity.retrieve(workspace_slug, project_id, issue_id, activity_id)
            return cast(Dict[str, Any], self._model_to_dict(resp))
        except HttpError as e:
            log.error(f"Failed to retrieve work item activity: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to retrieve work item activity: {str(e)}")
            raise

    # ============================================================================
    # ATTACHMENTS API METHODS
    # ============================================================================

    def create_work_item_attachment(self, workspace_slug: str, project_id: str, issue_id: str, **kwargs) -> Dict[str, Any]:
        """Create a work item attachment (v0.2)."""
        try:
            payload = {k: v for k, v in kwargs.items() if v is not None}
            data_model = WorkItemAttachmentUploadRequest(**payload)
            resp = self.client.work_items.attachments.create(workspace_slug, project_id, issue_id, data=data_model)
            return cast(Dict[str, Any], self._model_to_dict(resp))
        except HttpError as e:
            log.error(f"Failed to create work item attachment: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to create work item attachment: {str(e)}")
            raise

    def list_work_item_attachments(self, workspace_slug: str, project_id: str, issue_id: Optional[str] = None) -> Dict[str, Any]:
        """List work item attachments (v0.2)."""
        try:
            if issue_id:
                response = self.client.work_items.attachments.list(workspace_slug, project_id, issue_id)
            else:
                # Best-effort: try project-level attachments list (may not be available)
                response = self.client.work_items.attachments.list(workspace_slug, project_id, "")
            results = self._model_to_dict(getattr(response, "results", []))
            if not isinstance(results, list):
                results = [results] if results else []
            return {
                "results": results,
                "count": len(results),
                "total_results": getattr(response, "total_count", len(results)),
                "next_cursor": str(getattr(response, "next_page_number", "")) if getattr(response, "next_page_number", None) else None,
                "prev_cursor": str(getattr(response, "prev_page_number", "")) if getattr(response, "prev_page_number", None) else None,
            }
        except HttpError as e:
            log.error(f"Failed to list work item attachments: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to list work item attachments: {str(e)}")
            raise

    def retrieve_work_item_attachment(self, workspace_slug: str, project_id: str, issue_id: str, attachment_id: str) -> Dict[str, Any]:
        """Retrieve a specific work item attachment (v0.2)."""
        try:
            resp = self.client.work_items.attachments.retrieve(workspace_slug, project_id, issue_id, attachment_id)
            return cast(Dict[str, Any], self._model_to_dict(resp))
        except HttpError as e:
            log.error(f"Failed to retrieve work item attachment: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to retrieve work item attachment: {str(e)}")
            raise

    def update_work_item_attachment(self, workspace_slug: str, project_id: str, issue_id: str, attachment_id: str, **kwargs) -> Dict[str, Any]:
        """Update a work item attachment (v0.2)."""
        try:
            payload = {k: v for k, v in kwargs.items() if v is not None}
            data_model = UpdateWorkItemAttachment(**payload)
            resp = self.client.work_items.attachments.update(workspace_slug, project_id, issue_id, attachment_id, data=data_model)
            return cast(Dict[str, Any], self._model_to_dict(resp))
        except HttpError as e:
            log.error(f"Failed to update work item attachment: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to update work item attachment: {str(e)}")
            raise

    def delete_work_item_attachment(self, workspace_slug: str, project_id: str, issue_id: str, attachment_id: str) -> Dict[str, Any]:
        """Delete a work item attachment (v0.2)."""
        try:
            self.client.work_items.attachments.delete(workspace_slug, project_id, issue_id, attachment_id)
            return {"success": True}
        except HttpError as e:
            log.error(f"Failed to delete work item attachment: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to delete work item attachment: {str(e)}")
            raise

    # ============================================================================
    # COMMENTS API METHODS
    # ============================================================================

    def create_work_item_comment(self, workspace_slug: str, project_id: str, issue_id: str, **kwargs) -> Dict[str, Any]:
        """Create a work item comment (v0.2). Requires comment or comment_html."""
        try:
            payload = {k: v for k, v in kwargs.items() if v is not None}
            data_obj = CreateWorkItemComment(**payload)
            resp = self.client.work_items.comments.create(workspace_slug, project_id, issue_id, data=data_obj)
            return cast(Dict[str, Any], self._model_to_dict(resp))
        except HttpError as e:
            log.error(f"Failed to create work item comment: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to create work item comment: {str(e)}")
            raise

    def list_work_item_comments(self, workspace_slug: str, project_id: str, issue_id: Optional[str] = None) -> Dict[str, Any]:
        """List work item comments (v0.2). If issue_id is provided, list for that issue only."""
        try:
            if issue_id:
                response = self.client.work_items.comments.list(workspace_slug, project_id, issue_id)
            else:
                # Best-effort: try project-level comments list (may not be available)
                response = self.client.work_items.comments.list(workspace_slug, project_id, "")
            results = self._model_to_dict(getattr(response, "results", []))
            if not isinstance(results, list):
                results = [results] if results else []
            return {
                "results": results,
                "count": len(results),
                "total_results": getattr(response, "total_count", len(results)),
                "next_cursor": str(getattr(response, "next_page_number", "")) if getattr(response, "next_page_number", None) else None,
                "prev_cursor": str(getattr(response, "prev_page_number", "")) if getattr(response, "prev_page_number", None) else None,
            }
        except HttpError as e:
            log.error(f"Failed to list work item comments: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to list work item comments: {str(e)}")
            raise

    def retrieve_work_item_comment(self, workspace_slug: str, project_id: str, issue_id: str, comment_id: str) -> Dict[str, Any]:
        """Retrieve a specific work item comment (v0.2)."""
        try:
            resp = self.client.work_items.comments.retrieve(workspace_slug, project_id, issue_id, comment_id)
            return cast(Dict[str, Any], self._model_to_dict(resp))
        except HttpError as e:
            log.error(f"Failed to retrieve work item comment: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to retrieve work item comment: {str(e)}")
            raise

    def update_work_item_comment(self, workspace_slug: str, project_id: str, issue_id: str, comment_id: str, **kwargs) -> Dict[str, Any]:
        """Update a work item comment (v0.2)."""
        try:
            payload = {k: v for k, v in kwargs.items() if v is not None}
            data_obj = UpdateWorkItemComment(**payload)
            resp = self.client.work_items.comments.update(workspace_slug, project_id, issue_id, comment_id, data=data_obj)
            return cast(Dict[str, Any], self._model_to_dict(resp))
        except HttpError as e:
            log.error(f"Failed to update work item comment: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to update work item comment: {str(e)}")
            raise

    def delete_work_item_comment(self, workspace_slug: str, project_id: str, issue_id: str, comment_id: str) -> Dict[str, Any]:
        """Delete a work item comment (v0.2)."""
        try:
            self.client.work_items.comments.delete(workspace_slug, project_id, issue_id, comment_id)
            return {"success": True}
        except HttpError as e:
            log.error(f"Failed to delete work item comment: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to delete work item comment: {str(e)}")
            raise

    # ============================================================================
    # LINKS API METHODS
    # ============================================================================

    def create_work_item_link(self, workspace_slug: str, project_id: str, issue_id: str, **kwargs) -> Dict[str, Any]:
        """Create a work item link (v0.2). Requires url."""
        try:
            payload = {k: v for k, v in kwargs.items() if v is not None}
            data_model = CreateWorkItemLink(**payload)
            resp = self.client.work_items.links.create(workspace_slug, project_id, issue_id, data=data_model)
            return cast(Dict[str, Any], self._model_to_dict(resp))
        except HttpError as e:
            log.error(f"Failed to create work item link: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to create work item link: {str(e)}")
            raise

    def list_work_item_links(self, workspace_slug: str, project_id: str, issue_id: Optional[str] = None) -> Dict[str, Any]:
        """List work item links (v0.2)."""
        try:
            if issue_id:
                response = self.client.work_items.links.list(workspace_slug, project_id, issue_id)
            else:
                # Best-effort: try project-level links list (may not be available)
                response = self.client.work_items.links.list(workspace_slug, project_id, "")
            results = self._model_to_dict(getattr(response, "results", []))
            if not isinstance(results, list):
                results = [results] if results else []
            return {
                "results": results,
                "count": len(results),
                "total_results": getattr(response, "total_count", len(results)),
                "next_cursor": str(getattr(response, "next_page_number", "")) if getattr(response, "next_page_number", None) else None,
                "prev_cursor": str(getattr(response, "prev_page_number", "")) if getattr(response, "prev_page_number", None) else None,
            }
        except HttpError as e:
            log.error(f"Failed to list work item links: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to list work item links: {str(e)}")
            raise

    def retrieve_work_item_link(self, workspace_slug: str, project_id: str, issue_id: str, link_id: str) -> Dict[str, Any]:
        """Retrieve a specific work item link (v0.2)."""
        try:
            resp = self.client.work_items.links.retrieve(workspace_slug, project_id, issue_id, link_id)
            return cast(Dict[str, Any], self._model_to_dict(resp))
        except HttpError as e:
            log.error(f"Failed to retrieve work item link: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to retrieve work item link: {str(e)}")
            raise

    def update_issue_link(self, workspace_slug: str, project_id: str, issue_id: str, link_id: str, **kwargs) -> Dict[str, Any]:
        """Update a work item link (v0.2)."""
        try:
            payload = {k: v for k, v in kwargs.items() if v is not None}
            data_model = UpdateWorkItemLink(**payload)
            resp = self.client.work_items.links.update(workspace_slug, project_id, issue_id, link_id, data=data_model)
            return cast(Dict[str, Any], self._model_to_dict(resp))
        except HttpError as e:
            log.error(f"Failed to update work item link: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to update work item link: {str(e)}")
            raise

    def delete_work_item_link(self, workspace_slug: str, project_id: str, issue_id: str, link_id: str) -> Dict[str, Any]:
        """Delete a work item link (v0.2)."""
        try:
            self.client.work_items.links.delete(workspace_slug, project_id, issue_id, link_id)
            return {"success": True}
        except HttpError as e:
            log.error(f"Failed to delete work item link: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to delete work item link: {str(e)}")
            raise

    # ============================================================================
    # PROPERTIES API METHODS
    # ============================================================================

    def create_issue_property(self, workspace_slug: str, project_id: str, type_id: str, **kwargs) -> Dict[str, Any]:
        """Create an issue property (v0.2)."""
        try:
            # Use SDK model for validation and serialization
            property_data = CreateWorkItemProperty(**kwargs)
            resp = self.client.work_item_properties.create(workspace_slug, project_id, type_id, data=property_data)
            return cast(Dict[str, Any], self._model_to_dict(resp))
        except HttpError as e:
            log.error(f"Failed to create issue property: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to create issue property: {str(e)}")
            raise

    def list_issue_properties(self, workspace_slug: str, project_id: str, type_id: str) -> Dict[str, Any]:
        """List issue properties (v0.2)."""
        try:
            response = self.client.work_item_properties.list(workspace_slug, project_id, type_id)
            # SDK returns list directly, not a paginated response
            results = self._model_to_dict(response)
            if not isinstance(results, list):
                results = [results] if results else []
            return {
                "results": results,
                "count": len(results),
                "total_results": len(results),
                "next_cursor": None,
                "prev_cursor": None,
            }
        except HttpError as e:
            log.error(f"Failed to list issue properties: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to list issue properties: {str(e)}")
            raise

    def retrieve_issue_property(self, workspace_slug: str, project_id: str, type_id: str, property_id: str) -> Dict[str, Any]:
        """Retrieve a specific issue property (v0.2)."""
        try:
            resp = self.client.work_item_properties.retrieve(workspace_slug, project_id, type_id, property_id)
            return cast(Dict[str, Any], self._model_to_dict(resp))
        except HttpError as e:
            log.error(f"Failed to retrieve issue property: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to retrieve issue property: {str(e)}")
            raise

    def update_issue_property(self, workspace_slug: str, project_id: str, type_id: str, property_id: str, **kwargs) -> Dict[str, Any]:
        """Update an issue property (v0.2)."""
        try:
            # Use SDK model for validation and serialization
            property_data = UpdateWorkItemProperty(**kwargs)
            resp = self.client.work_item_properties.update(workspace_slug, project_id, type_id, property_id, data=property_data)
            return cast(Dict[str, Any], self._model_to_dict(resp))
        except HttpError as e:
            log.error(f"Failed to update issue property: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to update issue property: {str(e)}")
            raise

    def delete_issue_property(self, workspace_slug: str, project_id: str, type_id: str, property_id: str) -> Dict[str, Any]:
        """Delete an issue property (v0.2)."""
        try:
            self.client.work_item_properties.delete(workspace_slug, project_id, type_id, property_id)
            return {"success": True}
        except HttpError as e:
            log.error(f"Failed to delete issue property: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to delete issue property: {str(e)}")
            raise

    def create_issue_property_option(
        self, workspace_slug: str, project_id: str, property_id: str, type_id: Optional[str] = None, **kwargs
    ) -> Dict[str, Any]:
        """Create an issue property option (v0.2 - not yet implemented)."""
        raise NotImplementedError("create_issue_property_option not yet available in v0.2")

    def create_issue_property_value(
        self, workspace_slug: str, project_id: str, property_id: str, type_id: Optional[str] = None, issue_id: Optional[str] = None, **kwargs
    ) -> Dict[str, Any]:
        """Create an issue property value (v0.2 - not yet implemented)."""
        raise NotImplementedError("create_issue_property_value not yet available in v0.2")

    def list_issue_property_options(self, workspace_slug: str, project_id: str, property_id: str, type_id: Optional[str] = None) -> Dict[str, Any]:
        """List issue property options (v0.2 - not yet implemented)."""
        raise NotImplementedError("list_issue_property_options not yet available in v0.2")

    def list_issue_property_values(self, workspace_slug: str, project_id: str, type_id: str, issue_id: str) -> Dict[str, Any]:
        """List issue property values (v0.2 - not yet implemented)."""
        raise NotImplementedError("list_issue_property_values not yet available in v0.2")

    def retrieve_issue_property_option(self, workspace_slug: str, project_id: str, property_id: str, type_id: str, option_id: str) -> Dict[str, Any]:
        """Retrieve an issue property option (v0.2 - not yet implemented)."""
        raise NotImplementedError("retrieve_issue_property_option not yet available in v0.2")

    def update_issue_property_option(
        self, workspace_slug: str, project_id: str, property_id: str, type_id: str, option_id: str, **kwargs
    ) -> Dict[str, Any]:
        """Update an issue property option (v0.2 - not yet implemented)."""
        raise NotImplementedError("update_issue_property_option not yet available in v0.2")

    def delete_issue_property_option(self, workspace_slug: str, project_id: str, property_id: str, type_id: str, option_id: str) -> Dict[str, Any]:
        """Delete an issue property option (v0.2 - not yet implemented)."""
        raise NotImplementedError("delete_issue_property_option not yet available in v0.2")

    # ============================================================================
    # TYPES API METHODS
    # ============================================================================

    def create_issue_type(self, workspace_slug: str, project_id: str, **kwargs) -> Dict[str, Any]:
        """Create an issue type (v0.2)."""
        try:
            payload = {k: v for k, v in kwargs.items() if v is not None}
            resp = self.client.work_item_types.create(workspace_slug, project_id, data=CreateWorkItemType(**payload))
            return cast(Dict[str, Any], self._model_to_dict(resp))
        except HttpError as e:
            log.error(f"Failed to create issue type: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to create issue type: {str(e)}")
            raise

    def list_issue_types(self, workspace_slug: str, project_id: str) -> Dict[str, Any]:
        """List issue types (v0.2)."""
        try:
            response = self.client.work_item_types.list(workspace_slug, project_id)
            results = self._model_to_dict(response)  # response is already a list
            if not isinstance(results, list):
                results = [results] if results else []
            return {
                "results": results,
                "count": len(results),
                "total_results": len(results),
                "next_cursor": None,
                "prev_cursor": None,
            }
        except HttpError as e:
            log.error(f"Failed to list issue types: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to list issue types: {str(e)}")
            raise

    def retrieve_issue_type(self, workspace_slug: str, project_id: str, type_id: str) -> Dict[str, Any]:
        """Retrieve a specific issue type (v0.2)."""
        try:
            resp = self.client.work_item_types.retrieve(workspace_slug, project_id, type_id)
            return cast(Dict[str, Any], self._model_to_dict(resp))
        except HttpError as e:
            log.error(f"Failed to retrieve issue type: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to retrieve issue type: {str(e)}")
            raise

    def update_issue_type(self, workspace_slug: str, project_id: str, type_id: str, **kwargs) -> Dict[str, Any]:
        """Update an issue type (v0.2)."""
        try:
            payload = {k: v for k, v in kwargs.items() if v is not None}
            resp = self.client.work_item_types.update(workspace_slug, project_id, type_id, data=UpdateWorkItemType(**payload))
            return cast(Dict[str, Any], self._model_to_dict(resp))
        except HttpError as e:
            log.error(f"Failed to update issue type: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to update issue type: {str(e)}")
            raise

    def delete_issue_type(self, workspace_slug: str, project_id: str, type_id: str) -> Dict[str, Any]:
        """Delete an issue type (v0.2)."""
        try:
            self.client.work_item_types.delete(workspace_slug, project_id, type_id)
            return {"success": True}
        except HttpError as e:
            log.error(f"Failed to delete issue type: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to delete issue type: {str(e)}")
            raise

    # ============================================================================
    # WORKLOGS API METHODS
    # ============================================================================

    def create_issue_worklog(self, workspace_slug: str, project_id: str, issue_id: str, **kwargs) -> Dict[str, Any]:
        """Create an issue worklog (v0.2)."""
        try:
            payload = {k: v for k, v in kwargs.items() if v is not None}
            resp = self.client.work_items.work_logs.create(workspace_slug, project_id, work_item_id=issue_id, data=payload)
            return cast(Dict[str, Any], self._model_to_dict(resp))
        except HttpError as e:
            log.error(f"Failed to create issue worklog: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to create issue worklog: {str(e)}")
            raise

    def list_issue_worklogs(self, workspace_slug: str, project_id: str, issue_id: Optional[str] = None) -> Dict[str, Any]:
        """List issue worklogs (v0.2)."""
        try:
            if issue_id:
                response = self.client.work_items.work_logs.list(workspace_slug, project_id, work_item_id=issue_id)
            else:
                # Best-effort: try project-level worklogs list
                response = self.client.work_items.work_logs.list(workspace_slug, project_id, work_item_id="")
            results = self._model_to_dict(getattr(response, "results", []))
            if not isinstance(results, list):
                results = [results] if results else []
            return {
                "results": results,
                "count": len(results),
                "total_results": getattr(response, "total_count", len(results)),
                "next_cursor": str(getattr(response, "next_page_number", "")) if getattr(response, "next_page_number", None) else None,
                "prev_cursor": str(getattr(response, "prev_page_number", "")) if getattr(response, "prev_page_number", None) else None,
            }
        except HttpError as e:
            log.error(f"Failed to list issue worklogs: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to list issue worklogs: {str(e)}")
            raise

    def get_project_worklog_summary(self, workspace_slug: str, project_id: str) -> Dict[str, Any]:
        """Get project worklog summary (v0.2 - not implemented yet; placeholder)."""
        try:
            # This method may not exist in v0.2 SDK; mark as NotImplemented for now
            raise NotImplementedError("get_project_worklog_summary not yet available in v0.2")
        except Exception as e:
            log.error(f"Failed to get project worklog summary: {str(e)}")
            raise

    def update_issue_worklog(self, workspace_slug: str, project_id: str, issue_id: str, worklog_id: str, **kwargs) -> Dict[str, Any]:
        """Update an issue worklog (v0.2)."""
        try:
            payload = {k: v for k, v in kwargs.items() if v is not None}
            resp = self.client.work_items.work_logs.update(workspace_slug, project_id, work_item_id=issue_id, work_log_id=worklog_id, data=payload)
            return cast(Dict[str, Any], self._model_to_dict(resp))
        except HttpError as e:
            log.error(f"Failed to update issue worklog: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to update issue worklog: {str(e)}")
            raise

    def delete_issue_worklog(self, workspace_slug: str, project_id: str, issue_id: str, worklog_id: str) -> Dict[str, Any]:
        """Delete an issue worklog (v0.2)."""
        try:
            self.client.work_items.work_logs.delete(workspace_slug, project_id, work_item_id=issue_id, work_log_id=worklog_id)
            return {"success": True}
        except HttpError as e:
            log.error(f"Failed to delete issue worklog: {e} ({getattr(e, "status_code", None)})")
            raise
        except Exception as e:
            log.error(f"Failed to delete issue worklog: {str(e)}")
            raise
