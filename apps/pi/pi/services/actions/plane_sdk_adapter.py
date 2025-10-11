"""
Plane SDK Adapter with Pydantic v1/v2 Compatibility
Provides a safe translation layer between Plane SDK (v1) and our codebase (v2)
"""

import logging
from datetime import datetime
from typing import Any
from typing import Dict
from typing import List
from typing import Optional
from typing import Union
from typing import cast

# Import native plane SDK with Pydantic v2 support - everything is exported from main module
# Note: Linter suggests specific submodule imports, but direct imports work fine at runtime
from plane import ApiClient  # type: ignore[attr-defined]
from plane import AssetsApi  # type: ignore[attr-defined]
from plane import Configuration  # type: ignore[attr-defined]
from plane import CycleCreateRequest  # type: ignore[attr-defined]
from plane import CycleIssueRequestRequest  # type: ignore[attr-defined]
from plane import CyclesApi  # type: ignore[attr-defined]
from plane import IntakeApi  # type: ignore[attr-defined]
from plane import IntakeIssueCreateRequest  # type: ignore[attr-defined]
from plane import IssueAttachmentUploadRequest  # type: ignore[attr-defined]
from plane import IssueCommentCreateRequest  # type: ignore[attr-defined]
from plane import IssueLinkCreateRequest  # type: ignore[attr-defined]
from plane import IssuePropertyAPIRequest  # type: ignore[attr-defined]
from plane import IssuePropertyOptionAPIRequest  # type: ignore[attr-defined]
from plane import IssuePropertyValueAPIRequest  # type: ignore[attr-defined]
from plane import IssueRequest  # type: ignore[attr-defined]
from plane import IssueTypeAPIRequest  # type: ignore[attr-defined]
from plane import IssueWorkLogAPIRequest  # type: ignore[attr-defined]
from plane import LabelCreateUpdateRequest  # type: ignore[attr-defined]
from plane import LabelsApi  # type: ignore[attr-defined]
from plane import MembersApi  # type: ignore[attr-defined]
from plane import ModuleCreateRequest  # type: ignore[attr-defined]
from plane import ModuleIssueRequestRequest  # type: ignore[attr-defined]
from plane import ModulesApi  # type: ignore[attr-defined]
from plane import PagesApi  # type: ignore[attr-defined]
from plane import PatchedCycleUpdateRequest  # type: ignore[attr-defined]
from plane import PatchedIntakeIssueUpdateRequest  # type: ignore[attr-defined]
from plane import PatchedIssueCommentCreateRequest  # type: ignore[attr-defined]
from plane import PatchedIssueLinkUpdateRequest  # type: ignore[attr-defined]
from plane import PatchedIssuePropertyAPIRequest  # type: ignore[attr-defined]
from plane import PatchedIssuePropertyOptionAPIRequest  # type: ignore[attr-defined]
from plane import PatchedIssueRequest  # type: ignore[attr-defined]
from plane import PatchedIssueTypeAPIRequest  # type: ignore[attr-defined]
from plane import PatchedIssueWorkLogAPIRequest  # type: ignore[attr-defined]
from plane import PatchedLabelCreateUpdateRequest  # type: ignore[attr-defined]
from plane import PatchedModuleUpdateRequest  # type: ignore[attr-defined]
from plane import PatchedProjectUpdateRequest  # type: ignore[attr-defined]
from plane import PatchedStateRequest  # type: ignore[attr-defined]
from plane import ProjectCreateRequest  # type: ignore[attr-defined]
from plane import ProjectsApi  # type: ignore[attr-defined]
from plane import StateRequest  # type: ignore[attr-defined]
from plane import StatesApi  # type: ignore[attr-defined]
from plane import TransferCycleIssueRequestRequest  # type: ignore[attr-defined]
from plane import UsersApi  # type: ignore[attr-defined]
from plane import WorkItemActivityApi  # type: ignore[attr-defined]
from plane import WorkItemAttachmentsApi  # type: ignore[attr-defined]
from plane import WorkItemCommentsApi  # type: ignore[attr-defined]
from plane import WorkItemLinksApi  # type: ignore[attr-defined]
from plane import WorkItemPropertiesApi  # type: ignore[attr-defined]
from plane import WorkItemsApi  # type: ignore[attr-defined]
from plane import WorkItemTypesApi  # type: ignore[attr-defined]
from plane import WorkItemWorklogsApi  # type: ignore[attr-defined]

# Import page models from their specific modules (SDK >= 0.1.10)
from plane.models.page_create_api_request import PageCreateAPIRequest  # type: ignore[attr-defined]

log = logging.getLogger(__name__)


class PlaneSDKAdapter:
    """
    Adapter that wraps Plane SDK calls and converts v1 models to plain dicts.
    This avoids pydantic version conflicts by never exposing v1 models directly.
    """

    def __init__(self, access_token: Optional[str] = None, api_key: Optional[str] = None, base_url: str = "https://api.plane.so"):
        """Initialize SDK with proper authentication."""
        if access_token:
            # OAuth Bearer token
            self.configuration = Configuration(access_token=access_token, host=base_url)
        elif api_key:
            # API Key authentication
            self.configuration = Configuration(api_key={"ApiKeyAuthentication": api_key}, host=base_url)
        else:
            raise ValueError("Either access_token or api_key must be provided")

        # Create API client
        self.api_client = ApiClient(self.configuration)

        # Initialize API handlers
        self.assets = AssetsApi(self.api_client)
        self.cycles = CyclesApi(self.api_client)
        self.intake = IntakeApi(self.api_client)
        self.labels = LabelsApi(self.api_client)
        self.members = MembersApi(self.api_client)
        self.modules = ModulesApi(self.api_client)
        self.pages = PagesApi(self.api_client)
        self.projects = ProjectsApi(self.api_client)
        self.states = StatesApi(self.api_client)
        self.users = UsersApi(self.api_client)
        self.work_item_activity = WorkItemActivityApi(self.api_client)
        self.work_item_attachments = WorkItemAttachmentsApi(self.api_client)
        self.work_item_comments = WorkItemCommentsApi(self.api_client)
        self.work_item_links = WorkItemLinksApi(self.api_client)
        self.work_item_properties = WorkItemPropertiesApi(self.api_client)
        self.work_item_types = WorkItemTypesApi(self.api_client)
        self.work_item_worklogs = WorkItemWorklogsApi(self.api_client)
        self.work_items = WorkItemsApi(self.api_client)

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

    def create_project(
        self,
        slug: Optional[str] = None,
        workspace_slug: Optional[str] = None,
        project_create_request: Optional[ProjectCreateRequest] = None,
        name: Optional[str] = None,
        identifier: Optional[str] = None,
        description: Optional[str] = None,
        network: Optional[int] = 2,
        **kwargs,
    ) -> Dict[str, Any]:
        """
        Create a new project and return as plain dict.

        Returns:
            Dict with project data, safely converted from v1 model
        """
        try:
            # Canonicalize slug/workspace_slug
            effective_slug = slug or workspace_slug
            if not effective_slug:
                raise ValueError("slug (workspace_slug) is required")

            # Build or use provided request object
            if project_create_request is not None:
                project_request = project_create_request
            else:
                if not name or not identifier:
                    raise ValueError("name and identifier are required when project_create_request is not provided")
                project_request = ProjectCreateRequest(name=name, identifier=identifier, description=description or "", **kwargs)

            # Call SDK method
            project = self.projects.create_project(slug=effective_slug, project_create_request=project_request)

            # Convert to dict before returning
            result = self._model_to_dict(project)
            if isinstance(result, dict):
                return result
            else:
                # Fallback if conversion didn't return a dict
                return {"data": result}

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
            # Canonicalize slug/workspace_slug
            effective_slug = slug or workspace_slug
            if not effective_slug:
                raise ValueError("slug (workspace_slug) is required")

            # Call SDK method with correct parameter names
            response = self.projects.list_projects(slug=effective_slug, per_page=per_page, cursor=cursor)

            # Build response dict matching our existing format
            results_data = self._model_to_dict(response.results)
            if not isinstance(results_data, list):
                results_data = [results_data] if results_data else []

            # Filter out archived and deleted projects
            filtered_results = []
            for project in results_data:
                if isinstance(project, dict):
                    # Not skip archived projects (archived_at is not None) for now. This may change in the future.
                    # if project.get("archived_at") is not None:
                    #     continue
                    # Skip deleted projects (deleted_at is not None)
                    if project.get("deleted_at") is not None:
                        continue
                    filtered_results.append(project)

            result: Dict[str, Any] = {
                "results": filtered_results,
                "count": len(filtered_results),
                "total_results": getattr(response, "count", len(results_data)),  # Keep original total for pagination
            }

            # Add pagination info if available
            if hasattr(response, "next_cursor") and response.next_cursor:
                result["next_cursor"] = str(response.next_cursor)
            if hasattr(response, "prev_cursor") and response.prev_cursor:
                result["prev_cursor"] = str(response.prev_cursor)

            return result

        except Exception as e:
            log.error(f"Failed to list projects: {str(e)}")
            raise

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
            # Build issue data
            issue_data: Dict[str, Any] = {
                "name": name,
                "project_id": project_id,
            }

            # Add optional fields
            if description_html:
                issue_data["description_html"] = description_html
            if priority:
                issue_data["priority"] = priority
            if state:
                issue_data["state"] = state
            if assignees:
                issue_data["assignees"] = assignees  # List[str] is expected by SDK
            if labels:
                issue_data["labels"] = labels  # List[str] is expected by SDK
            if start_date:
                issue_data["start_date"] = start_date
            if target_date:
                issue_data["target_date"] = target_date

            # Add any additional kwargs
            issue_data.update(kwargs)

            # Create the issue request object
            issue_request = IssueRequest(**issue_data)

            # Call SDK method (note: parameter order is project_id, slug, issue_request)
            issue = self.work_items.create_work_item(project_id=project_id, slug=workspace_slug, issue_request=issue_request)

            # Convert to dict before returning
            result = self._model_to_dict(issue)
            if isinstance(result, dict):
                return result
            else:
                # Fallback if conversion didn't return a dict
                return {"data": result}

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
            # Create the patched issue request object
            patched_request = PatchedIssueRequest(**update_data)

            # Log exact SDK payload
            try:
                body_dump = patched_request.model_dump(exclude_none=True) if hasattr(patched_request, "model_dump") else dict(update_data)
                log.info(f"SDK PAYLOAD work_items.update_work_item: pk={issue_id}, project_id={project_id}, slug={workspace_slug}, body={body_dump}")
            except Exception:
                pass

            # Call SDK method (note: parameter order is pk, project_id, slug, patched_issue_request)
            issue = self.work_items.update_work_item(pk=issue_id, project_id=project_id, slug=workspace_slug, patched_issue_request=patched_request)

            # Convert to dict before returning
            result = self._model_to_dict(issue)
            if isinstance(result, dict):
                return result
            else:
                # Fallback if conversion didn't return a dict
                return {"data": result}

        except Exception as e:
            log.error(f"Failed to update work item: {str(e)}")
            raise

    def get_current_user(self) -> Dict[str, Any]:
        """Get current authenticated user info."""
        try:
            user = self.users.get_current_user()
            result = self._model_to_dict(user)
            if isinstance(result, dict):
                return result
            else:
                # Fallback if conversion didn't return a dict
                return {"data": result}
        except Exception as e:
            log.error(f"Failed to get current user: {str(e)}")
            raise

    def create_cycle(
        self,
        workspace_slug: str,
        project_id: str,
        name: str,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        description: Optional[str] = None,
        owned_by: Optional[str] = None,
        user_id: Optional[str] = None,
        **kwargs,
    ) -> Dict[str, Any]:
        """
        Create a new cycle and return as plain dict.

        Returns:
            Dict with cycle data, safely converted from v1 model
        """
        try:
            if owned_by is None:
                if user_id:
                    owned_by = user_id
                    # log.info(f"Using user_id from context as cycle owner: {user_id}")
                else:
                    try:
                        current_user = self.get_current_user()
                        owned_by = current_user.get("id")
                        if not owned_by:
                            log.warning("Could not get current user ID, cycle creation may fail")
                    except Exception as e:
                        log.warning(f"Failed to get current user for cycle ownership: {e}")

            cycle_data = {"name": name, **kwargs}
            # log.debug(f"cycle_data payload prepared: {cycle_data}")
            if start_date:
                cycle_data["start_date"] = datetime.fromisoformat(start_date.replace("Z", "+00:00"))
            if end_date:
                cycle_data["end_date"] = datetime.fromisoformat(end_date.replace("Z", "+00:00"))
            if description:
                cycle_data["description"] = description
            if owned_by:
                cycle_data["owned_by"] = owned_by

            cycle_request = CycleCreateRequest(**cycle_data)
            # Log the serialized request to see exactly what fields are included
            try:
                cycle_request.model_dump() if hasattr(cycle_request, "model_dump") else cycle_request.dict()
                # log.debug(f"CycleCreateRequest model dump: {dump}")
            except Exception as dump_error:
                log.warning(f"Failed to dump CycleCreateRequest model: {dump_error}")

            # Call SDK method
            cycle = self.cycles.create_cycle(project_id=project_id, slug=workspace_slug, cycle_create_request=cycle_request)

            # Convert to dict before returning
            result = self._model_to_dict(cycle)
            if isinstance(result, dict):
                return result
            else:
                # Fallback if conversion didn't return a dict
                return {"data": result}

        except Exception as e:
            log.error(f"Failed to create cycle: {str(e)}")
            raise

    def list_cycles(
        self, workspace_slug: str, project_id: str, per_page: Optional[int] = 20, cursor: Optional[str] = None, cycle_view: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        List cycles and return as plain dict with pagination info.

        Returns:
            Dict containing:
            - results: List of cycle dicts
            - next_cursor: Cursor for next page
            - prev_cursor: Cursor for previous page
            - count: Number of items
            - total_results: Total count
        """
        try:
            # Call SDK method with correct parameter names
            response = self.cycles.list_cycles(project_id=project_id, slug=workspace_slug, per_page=per_page, cursor=cursor, cycle_view=cycle_view)

            # Build response dict matching our existing format
            results_data = self._model_to_dict(response.results)
            if not isinstance(results_data, list):
                results_data = [results_data] if results_data else []

            result: Dict[str, Any] = {
                "results": results_data,
                "count": len(results_data),
                "total_results": getattr(response, "count", len(results_data)),
            }

            # Add pagination info if available
            if hasattr(response, "next_cursor") and response.next_cursor:
                result["next_cursor"] = str(response.next_cursor)
            if hasattr(response, "prev_cursor") and response.prev_cursor:
                result["prev_cursor"] = str(response.prev_cursor)

            return result

        except Exception as e:
            log.error(f"Failed to list cycles: {str(e)}")
            raise

    # ============================================================================
    # ASSETS API METHODS
    # ============================================================================

    def create_generic_asset_upload(self, workspace_slug: str, project_id: str, **kwargs) -> Union[Dict[str, Any], List[Any], Any]:
        """Create a generic asset upload."""
        try:
            from plane import GenericAssetUploadRequest  # type: ignore[attr-defined]

            request = GenericAssetUploadRequest(**kwargs)
            response = self.assets.create_generic_asset_upload(slug=workspace_slug, generic_asset_upload_request=request)
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to create generic asset upload: {str(e)}")
            raise

    def create_user_asset_upload(self, workspace_slug: str, project_id: str, **kwargs) -> Union[Dict[str, Any], List[Any], Any]:
        """Create a user asset upload."""
        try:
            from plane import UserAssetUploadRequest  # type: ignore[attr-defined]

            request = UserAssetUploadRequest(**kwargs)
            response = self.assets.create_user_asset_upload(user_asset_upload_request=request)
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to create user asset upload: {str(e)}")
            raise

    def get_generic_asset(self, workspace_slug: str, project_id: str, asset_id: str, **kwargs) -> Union[Dict[str, Any], List[Any], Any]:
        """Get a generic asset."""
        try:
            response = self.assets.get_generic_asset(asset_id=asset_id, slug=workspace_slug, **kwargs)
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to get generic asset: {str(e)}")
            raise

    def update_generic_asset(self, workspace_slug: str, project_id: str, asset_id: str, **kwargs) -> Union[Dict[str, Any], List[Any], Any]:
        """Update a generic asset."""
        try:
            response = self.assets.update_generic_asset(asset_id=asset_id, slug=workspace_slug, **kwargs)
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to update generic asset: {str(e)}")
            raise

    def update_user_asset(self, workspace_slug: str, project_id: str, asset_id: str, **kwargs) -> Union[Dict[str, Any], List[Any], Any]:
        """Update a user asset."""
        try:
            response = self.assets.update_user_asset(asset_id=asset_id, **kwargs)
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to update user asset: {str(e)}")
            raise

    def delete_user_asset(self, workspace_slug: str, project_id: str, asset_id: str) -> bool:
        """Delete a user asset."""
        try:
            self.assets.delete_user_asset(asset_id=asset_id)
            return True
        except Exception as e:
            log.error(f"Failed to delete user asset: {str(e)}")
            raise

    # ============================================================================
    # LABELS API METHODS
    # ============================================================================

    def list_labels(self, workspace_slug: str, project_id: str, **kwargs) -> Union[Dict[str, Any], List[Any], Any]:
        """List labels in a project."""
        try:
            response = self.labels.list_labels(project_id=project_id, slug=workspace_slug, **kwargs)
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to list labels: {str(e)}")
            raise

    def create_label(self, workspace_slug: str, project_id: str, **kwargs) -> Union[Dict[str, Any], List[Any], Any]:
        """Create a new label."""
        try:
            # Create the label request object
            label_request = LabelCreateUpdateRequest(**kwargs)

            # Call SDK method with the request object
            response = self.labels.create_label(project_id=project_id, slug=workspace_slug, label_create_update_request=label_request)
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to create label: {str(e)}")
            raise

    def update_label(self, workspace_slug: str, project_id: str, label_id: str, **kwargs) -> Union[Dict[str, Any], List[Any], Any]:
        """Update a label."""
        try:
            # Create the patched label request object
            patched_label_request = PatchedLabelCreateUpdateRequest(**kwargs)

            # Call SDK method with the request object
            response = self.labels.update_label(
                pk=label_id, project_id=project_id, slug=workspace_slug, patched_label_create_update_request=patched_label_request
            )
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to update label: {str(e)}")
            raise

    def delete_label(self, workspace_slug: str, project_id: str, label_id: str) -> bool:
        """Delete a label."""
        try:
            self.labels.delete_label(pk=label_id, project_id=project_id, slug=workspace_slug)
            return True
        except Exception as e:
            log.error(f"Failed to delete label: {str(e)}")
            raise

    def get_labels(self, workspace_slug: str, project_id: str, label_id: str, **kwargs) -> Union[Dict[str, Any], List[Any], Any]:
        """Get a specific label by ID."""
        try:
            response = self.labels.get_labels(pk=label_id, project_id=project_id, slug=workspace_slug, **kwargs)
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to get label: {str(e)}")
            raise

    # ============================================================================
    # STATES API METHODS
    # ============================================================================

    def list_states(self, workspace_slug: str, project_id: str, **kwargs) -> Union[Dict[str, Any], List[Any], Any]:
        """List states in a project."""
        try:
            response = self.states.list_states(project_id=project_id, slug=workspace_slug, **kwargs)
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to list states: {str(e)}")
            raise

    def create_state(self, workspace_slug: str, project_id: str, **kwargs) -> Union[Dict[str, Any], List[Any], Any]:
        """Create a new state."""
        try:
            # Create the state request object
            state_request = StateRequest(**kwargs)

            # Call SDK method with the request object
            response = self.states.create_state(project_id=project_id, slug=workspace_slug, state_request=state_request)
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to create state: {str(e)}")
            raise

    def update_state(self, workspace_slug: str, project_id: str, state_id: str, **kwargs) -> Union[Dict[str, Any], List[Any], Any]:
        """Update a state."""
        try:
            # Create the patched state request object
            patched_state_request = PatchedStateRequest(**kwargs)

            # Call SDK method with the request object
            response = self.states.update_state(
                project_id=project_id, slug=workspace_slug, state_id=state_id, patched_state_request=patched_state_request
            )
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to update state: {str(e)}")
            raise

    def retrieve_state(self, workspace_slug: str, project_id: str, state_id: str, **kwargs) -> Union[Dict[str, Any], List[Any], Any]:
        """Get a specific state by ID."""
        try:
            response = self.states.retrieve_state(project_id=project_id, slug=workspace_slug, state_id=state_id, **kwargs)
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to retrieve state: {str(e)}")
            raise

    def delete_state(self, workspace_slug: str, project_id: str, state_id: str) -> bool:
        """Delete a state."""
        try:
            self.states.delete_state(project_id=project_id, slug=workspace_slug, state_id=state_id)
            return True
        except Exception as e:
            log.error(f"Failed to delete state: {str(e)}")
            raise

    # ============================================================================
    # MODULES API METHODS
    # ============================================================================

    def list_modules(self, workspace_slug: str, project_id: str, **kwargs) -> Union[Dict[str, Any], List[Any], Any]:
        """List modules in a project."""
        try:
            response = self.modules.list_modules(project_id=project_id, slug=workspace_slug, **kwargs)
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to list modules: {str(e)}")
            raise

    def create_module(self, workspace_slug: str, project_id: str, **kwargs) -> Union[Dict[str, Any], List[Any], Any]:
        """Create a new module."""
        try:
            # Extract the module data from kwargs
            module_data = {}

            # Required field
            if "name" in kwargs:
                module_data["name"] = kwargs["name"]

            # Optional fields
            if "description" in kwargs:
                module_data["description"] = kwargs["description"]
            if "start_date" in kwargs:
                module_data["start_date"] = kwargs["start_date"]
            if "target_date" in kwargs:
                module_data["target_date"] = kwargs["target_date"]
            if "status" in kwargs:
                module_data["status"] = kwargs["status"]
            if "lead" in kwargs:
                module_data["lead"] = kwargs["lead"]
            if "members" in kwargs:
                module_data["members"] = kwargs["members"]
            if "external_source" in kwargs:
                module_data["external_source"] = kwargs["external_source"]
            if "external_id" in kwargs:
                module_data["external_id"] = kwargs["external_id"]

            # Create the module request object
            module_create_request = ModuleCreateRequest(**module_data)

            # Call SDK method with the request object
            response = self.modules.create_module(project_id=project_id, slug=workspace_slug, module_create_request=module_create_request)
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to create module: {str(e)}")
            raise

    def update_module(
        self,
        workspace_slug: str,
        project_id: str,
        module_id: str,
        patched_module_update_request: Optional[PatchedModuleUpdateRequest] = None,
        **kwargs,
    ) -> Union[Dict[str, Any], List[Any], Any]:
        """Update a module."""
        try:
            # Create or use provided request object
            request_obj = patched_module_update_request or (PatchedModuleUpdateRequest(**kwargs) if kwargs else PatchedModuleUpdateRequest())

            # Log exact SDK payload
            try:
                body_dump = request_obj.model_dump(exclude_none=True) if hasattr(request_obj, "model_dump") else dict(kwargs)
                log.info(f"SDK PAYLOAD modules.update_module: pk={module_id}, project_id={project_id}, slug={workspace_slug}, body={body_dump}")
            except Exception:
                pass

            # Call SDK method with the request object
            response = self.modules.update_module(pk=module_id, project_id=project_id, slug=workspace_slug, patched_module_update_request=request_obj)
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to update module: {str(e)}")
            raise

    def delete_module(self, workspace_slug: str, project_id: str, module_id: str) -> bool:
        """Delete a module."""
        try:
            self.modules.delete_module(pk=module_id, project_id=project_id, slug=workspace_slug)
            return True
        except Exception as e:
            log.error(f"Failed to delete module: {str(e)}")
            raise

    def add_module_work_items(
        self, workspace_slug: str, project_id: str, module_id: str, issues: List[str], **kwargs
    ) -> Union[Dict[str, Any], List[Any], Any]:
        """Add work items to a module."""
        try:
            # Create the proper request object
            module_issue_request = ModuleIssueRequestRequest(issues=issues)

            # Call SDK method with the request object
            response = self.modules.add_module_work_items(
                module_id=module_id, project_id=project_id, slug=workspace_slug, module_issue_request_request=module_issue_request
            )

            # Convert response to dict
            return self._model_to_dict(response)

        except Exception as e:
            log.error(f"Failed to add work items to module: {str(e)}")
            raise

    def retrieve_module(self, workspace_slug: str, project_id: str, module_id: str, **kwargs) -> Union[Dict[str, Any], List[Any], Any]:
        """Retrieve details of a specific module."""
        try:
            response = self.modules.retrieve_module(pk=module_id, project_id=project_id, slug=workspace_slug, **kwargs)
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to retrieve module: {str(e)}")
            raise

    def archive_module(self, workspace_slug: str, project_id: str, module_id: str, **kwargs) -> bool:
        """Archive a module."""
        try:
            self.modules.archive_module(pk=module_id, project_id=project_id, slug=workspace_slug, **kwargs)
            return True
        except Exception as e:
            log.error(f"Failed to archive module: {str(e)}")
            raise

    def unarchive_module(self, workspace_slug: str, project_id: str, module_id: str, **kwargs) -> bool:
        """Unarchive a module."""
        try:
            self.modules.unarchive_module(pk=module_id, project_id=project_id, slug=workspace_slug, **kwargs)
            return True
        except Exception as e:
            log.error(f"Failed to unarchive module: {str(e)}")
            raise

    def list_archived_modules(self, workspace_slug: str, project_id: str, **kwargs) -> Union[Dict[str, Any], List[Any], Any]:
        """List archived modules in a project."""
        try:
            response = self.modules.list_archived_modules(project_id=project_id, slug=workspace_slug, **kwargs)
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to list archived modules: {str(e)}")
            raise

    def list_module_work_items(self, workspace_slug: str, project_id: str, module_id: str, **kwargs) -> Union[Dict[str, Any], List[Any], Any]:
        """List work items in a module."""
        try:
            response = self.modules.list_module_work_items(module_id=module_id, project_id=project_id, slug=workspace_slug, **kwargs)
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to list module work items: {str(e)}")
            raise

    def delete_module_work_item(self, workspace_slug: str, project_id: str, module_id: str, issue_id: str, **kwargs) -> bool:
        """Remove a work item from a module."""
        try:
            self.modules.delete_module_work_item(issue_id=issue_id, module_id=module_id, project_id=project_id, slug=workspace_slug, **kwargs)
            return True
        except Exception as e:
            log.error(f"Failed to remove work item from module: {str(e)}")
            raise

    # ============================================================================
    # WORK ITEMS API METHODS
    # ============================================================================

    def list_work_items(self, workspace_slug: str, project_id: str, **kwargs) -> Union[Dict[str, Any], List[Any], Any]:
        """List work items in a project."""
        try:
            response = self.work_items.list_work_items(project_id=project_id, slug=workspace_slug, **kwargs)
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to list work items: {str(e)}")
            raise

    def get_work_item(self, workspace_slug: str, project_id: str, work_item_id: str) -> Union[Dict[str, Any], List[Any], Any]:
        """Get a specific work item."""
        try:
            response = self.work_items.retrieve_work_item(pk=work_item_id, project_id=project_id, slug=workspace_slug)
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to get work item: {str(e)}")
            raise

    def retrieve_work_item(self, workspace_slug: str, project_id: str, work_item_id: str, **kwargs) -> Union[Dict[str, Any], List[Any], Any]:
        """Get a specific work item by ID."""
        try:
            response = self.work_items.retrieve_work_item(pk=work_item_id, project_id=project_id, slug=workspace_slug, **kwargs)
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to retrieve work item: {str(e)}")
            raise

    def search_work_items(self, workspace_slug: str, project_id: str, **kwargs) -> Union[Dict[str, Any], List[Any], Any]:
        """Search work items."""
        try:
            response = self.work_items.search_work_items(project_id=project_id, slug=workspace_slug, **kwargs)
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to search work items: {str(e)}")
            raise

    def get_workspace_work_item(self, workspace_slug: str, work_item_id: str, **kwargs) -> Union[Dict[str, Any], List[Any], Any]:
        """Get a work item across workspace."""
        try:
            # This method expects issue_identifier (int) and project_identifier (str)
            # For now, we'll need to parse the work_item_id if it's in format "PROJECT-123"
            if "-" in str(work_item_id):
                parts = str(work_item_id).split("-", 1)
                project_identifier = parts[0]
                issue_identifier = int(parts[1])
            else:
                # Fallback - assume it's just the numeric ID and we need project info from context
                issue_identifier = int(work_item_id)
                project_identifier = kwargs.get("project_identifier", "UNKNOWN")

            response = self.work_items.get_workspace_work_item(
                issue_identifier=issue_identifier, project_identifier=project_identifier, slug=workspace_slug, **kwargs
            )
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to get workspace work item: {str(e)}")
            raise

    def delete_work_item(self, workspace_slug: str, project_id: str, work_item_id: str) -> bool:
        """Delete a work item."""
        try:
            self.work_items.delete_work_item(pk=work_item_id, project_id=project_id, slug=workspace_slug)
            return True
        except Exception as e:
            log.error(f"Failed to delete work item: {str(e)}")
            raise

    # ============================================================================
    # PROJECTS API METHODS
    # ============================================================================

    def update_project(
        self,
        pk: Optional[str] = None,
        project_id: Optional[str] = None,
        slug: Optional[str] = None,
        workspace_slug: Optional[str] = None,
        patched_project_update_request: Optional[PatchedProjectUpdateRequest] = None,
        **kwargs,
    ) -> Union[Dict[str, Any], List[Any], Any]:
        """Update a project (mirrors SDK signature; supports aliases)."""
        try:
            # Canonicalize params to SDK names
            effective_pk = pk or project_id
            effective_slug = slug or workspace_slug
            if not effective_pk or not effective_slug:
                raise ValueError("pk (project_id) and slug (workspace_slug) are required")

            # Build request object from provided model or kwargs
            request_obj = patched_project_update_request
            if request_obj is None and kwargs:
                request_obj = PatchedProjectUpdateRequest(**kwargs)

            # Log exact SDK payload
            try:
                body_dump = request_obj.model_dump(exclude_none=True) if request_obj and hasattr(request_obj, "model_dump") else dict(kwargs)
                log.info(f"SDK PAYLOAD projects.update_project: pk={effective_pk}, slug={effective_slug}, body={body_dump}")
            except Exception:
                pass

            # Call SDK method with the request object
            response = self.projects.update_project(
                pk=effective_pk, slug=effective_slug, patched_project_update_request=(request_obj or PatchedProjectUpdateRequest())
            )
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to update project: {str(e)}")
            raise

    def retrieve_project(
        self,
        pk: Optional[str] = None,
        project_id: Optional[str] = None,
        slug: Optional[str] = None,
        workspace_slug: Optional[str] = None,
        **kwargs,
    ) -> Union[Dict[str, Any], List[Any], Any]:
        """Get a specific project by ID (mirrors SDK signature; supports aliases)."""
        try:
            effective_pk = pk or project_id
            effective_slug = slug or workspace_slug
            if not effective_pk or not effective_slug:
                raise ValueError("pk (project_id) and slug (workspace_slug) are required")
            response = self.projects.retrieve_project(pk=effective_pk, slug=effective_slug, **kwargs)
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to retrieve project: {str(e)}")
            raise

    def archive_project(
        self, project_id: Optional[str] = None, pk: Optional[str] = None, slug: Optional[str] = None, workspace_slug: Optional[str] = None
    ) -> bool:
        """Archive a project (SDK uses project_id for this endpoint)."""
        try:
            effective_project_id = project_id or pk
            effective_slug = slug or workspace_slug
            if not effective_project_id or not effective_slug:
                raise ValueError("project_id (pk) and slug (workspace_slug) are required")
            self.projects.archive_project(project_id=effective_project_id, slug=effective_slug)
            return True
        except Exception as e:
            log.error(f"Failed to archive project: {str(e)}")
            raise

    def unarchive_project(
        self, project_id: Optional[str] = None, pk: Optional[str] = None, slug: Optional[str] = None, workspace_slug: Optional[str] = None
    ) -> bool:
        """Unarchive a project (SDK uses project_id for this endpoint)."""
        try:
            effective_project_id = project_id or pk
            effective_slug = slug or workspace_slug
            if not effective_project_id or not effective_slug:
                raise ValueError("project_id (pk) and slug (workspace_slug) are required")
            self.projects.unarchive_project(project_id=effective_project_id, slug=effective_slug)
            return True
        except Exception as e:
            log.error(f"Failed to unarchive project: {str(e)}")
            raise

    def delete_project(
        self, pk: Optional[str] = None, project_id: Optional[str] = None, slug: Optional[str] = None, workspace_slug: Optional[str] = None
    ) -> bool:
        """Delete a project (SDK uses pk for this endpoint)."""
        try:
            effective_pk = pk or project_id
            effective_slug = slug or workspace_slug
            if not effective_pk or not effective_slug:
                raise ValueError("pk (project_id) and slug (workspace_slug) are required")
            self.projects.delete_project(pk=effective_pk, slug=effective_slug)
            return True
        except Exception as e:
            log.error(f"Failed to delete project: {str(e)}")
            raise

    # ============================================================================
    # PAGES API METHODS
    # ============================================================================

    def create_project_page(
        self,
        project_id: str,
        slug: Optional[str] = None,
        workspace_slug: Optional[str] = None,
        page_create_api_request: Optional[PageCreateAPIRequest] = None,
        name: Optional[str] = None,
        description_html: Optional[str] = None,
        access: Optional[int] = None,
        color: Optional[str] = None,
        logo_props: Optional[dict] = None,
        **kwargs,
    ) -> Dict[str, Any]:
        """
        Create a new page in a project and return as plain dict.

        Args:
            project_id: Project ID where the page will be created
            slug: Workspace slug (required)
            workspace_slug: Alternative name for slug parameter
            page_create_api_request: Pre-built request object (optional)
            name: Page name (required if page_create_api_request not provided)
            description_html: Page content in HTML format (optional)
            access: Access level (0=private, 1=public) (optional)
            color: Page color (optional)
            logo_props: Logo properties dict (optional)
            **kwargs: Additional parameters

        Returns:
            Dict with page data converted from SDK model
        """
        try:
            effective_slug = slug or workspace_slug
            if not effective_slug:
                raise ValueError("slug (workspace_slug) is required")

            # Build request if not provided
            request_obj = page_create_api_request
            if request_obj is None:
                if not name:
                    raise ValueError("name is required when page_create_api_request is not provided")
                # CRITICAL: Ensure description_html is always provided (API requirement)
                # API requires at least 1 character, not just non-null
                if not description_html:
                    description_html = name

                # Sanitize description_html to avoid null characters (\x00) that API rejects
                try:
                    # Remove any NUL bytes that can creep in via encoding glitches
                    description_html = description_html.replace("\x00", "")
                    # Ensure we still have at least 1 character after sanitization
                    if not description_html.strip():
                        description_html = name
                except Exception:
                    description_html = name

                # ALWAYS include description_html in payload (required by API)
                payload: Dict[str, Any] = {"name": name, "description_html": description_html}
                if access is not None:
                    payload["access"] = access
                if color is not None:
                    payload["color"] = color
                if logo_props is not None:
                    payload["logo_props"] = logo_props
                payload.update(kwargs)
                request_obj = PageCreateAPIRequest(**payload)

            response = self.pages.create_project_page(project_id=project_id, slug=effective_slug, page_create_api_request=request_obj)
            return cast(Dict[str, Any], self._model_to_dict(response))
        except Exception as e:
            log.error(f"Failed to create project page: {str(e)}")
            raise

    def create_workspace_page(
        self,
        slug: Optional[str] = None,
        workspace_slug: Optional[str] = None,
        page_create_api_request: Optional[PageCreateAPIRequest] = None,
        name: Optional[str] = None,
        description_html: Optional[str] = None,
        access: Optional[int] = None,
        color: Optional[str] = None,
        logo_props: Optional[dict] = None,
        **kwargs,
    ) -> Dict[str, Any]:
        """
        Create a new page in the workspace and return as plain dict.

        Args:
            slug: Workspace slug (required)
            workspace_slug: Alternative name for slug parameter
            page_create_api_request: Pre-built request object (optional)
            name: Page name (required if page_create_api_request not provided)
            description_html: Page content in HTML format (optional)
            access: Access level (0=private, 1=public) (optional)
            color: Page color (optional)
            logo_props: Logo properties dict (optional)
            **kwargs: Additional parameters

        Returns:
            Dict with page data converted from SDK model
        """
        try:
            effective_slug = slug or workspace_slug
            if not effective_slug:
                raise ValueError("slug (workspace_slug) is required")

            request_obj = page_create_api_request
            if request_obj is None:
                if not name:
                    raise ValueError("name is required when page_create_api_request is not provided")
                # CRITICAL: Ensure description_html is always provided (API requirement)
                # API requires at least 1 character, not just non-null
                if not description_html:
                    description_html = name

                # Sanitize description_html to avoid null characters (\x00) that API rejects
                try:
                    # Remove any NUL bytes that can creep in via encoding glitches
                    description_html = description_html.replace("\x00", "")
                    # Ensure we still have at least 1 character after sanitization
                    if not description_html.strip():
                        description_html = name
                except Exception:
                    description_html = name

                # ALWAYS include description_html in payload (required by API)
                payload: Dict[str, Any] = {"name": name, "description_html": description_html}
                if access is not None:
                    payload["access"] = access
                if color is not None:
                    payload["color"] = color
                if logo_props is not None:
                    payload["logo_props"] = logo_props
                payload.update(kwargs)
                request_obj = PageCreateAPIRequest(**payload)

            response = self.pages.create_workspace_page(slug=effective_slug, page_create_api_request=request_obj)
            return cast(Dict[str, Any], self._model_to_dict(response))
        except Exception as e:
            log.error(f"Failed to create workspace page: {str(e)}")
            raise

    # ============================================================================
    # CYCLES API METHODS
    # ============================================================================

    def update_cycle(
        self,
        workspace_slug: str,
        project_id: str,
        pk: str,
        patched_cycle_update_request: Optional[PatchedCycleUpdateRequest] = None,
        **kwargs,
    ) -> Union[Dict[str, Any], List[Any], Any]:
        """Update a cycle."""
        try:
            # Create or use provided request object
            request_obj = patched_cycle_update_request
            normalized_kwargs = dict(kwargs)
            # Normalize date strings to datetime if provided in kwargs
            try:
                if "start_date" in normalized_kwargs and isinstance(normalized_kwargs["start_date"], str):
                    normalized_kwargs["start_date"] = datetime.fromisoformat(normalized_kwargs["start_date"].replace("Z", "+00:00"))
            except Exception:
                pass
            try:
                if "end_date" in normalized_kwargs and isinstance(normalized_kwargs["end_date"], str):
                    normalized_kwargs["end_date"] = datetime.fromisoformat(normalized_kwargs["end_date"].replace("Z", "+00:00"))
            except Exception:
                pass
            if request_obj is None and normalized_kwargs:
                request_obj = PatchedCycleUpdateRequest(**normalized_kwargs)

            # Log exact SDK payload
            try:
                body_dump = (
                    request_obj.model_dump(exclude_none=True) if request_obj and hasattr(request_obj, "model_dump") else dict(normalized_kwargs)
                )
                log.info(f"SDK PAYLOAD cycles.update_cycle: pk={pk}, project_id={project_id}, slug={workspace_slug}, body={body_dump}")
            except Exception:
                pass

            # Call SDK method with the request object
            response = self.cycles.update_cycle(
                pk=pk, project_id=project_id, slug=workspace_slug, patched_cycle_update_request=(request_obj or PatchedCycleUpdateRequest())
            )
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to update cycle: {str(e)}")
            raise

    def retrieve_cycle(self, workspace_slug: str, project_id: str, pk: str, **kwargs) -> Union[Dict[str, Any], List[Any], Any]:
        """Get a specific cycle by ID."""
        try:
            response = self.cycles.retrieve_cycle(pk=pk, project_id=project_id, slug=workspace_slug, **kwargs)
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to retrieve cycle: {str(e)}")
            raise

    def archive_cycle(self, workspace_slug: str, project_id: str, pk: str) -> bool:
        """Archive a cycle."""
        try:
            self.cycles.archive_cycle(cycle_id=pk, project_id=project_id, slug=workspace_slug)
            return True
        except Exception as e:
            log.error(f"Failed to archive cycle: {str(e)}")
            raise

    def unarchive_cycle(self, workspace_slug: str, project_id: str, pk: str) -> bool:
        """Unarchive a cycle."""
        try:
            self.cycles.unarchive_cycle(pk=pk, project_id=project_id, slug=workspace_slug)
            return True
        except Exception as e:
            log.error(f"Failed to unarchive cycle: {str(e)}")
            raise

    def list_archived_cycles(self, workspace_slug: str, project_id: str, **kwargs) -> Union[Dict[str, Any], List[Any], Any]:
        """List archived cycles."""
        try:
            response = self.cycles.list_archived_cycles(project_id=project_id, slug=workspace_slug, **kwargs)
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to list archived cycles: {str(e)}")
            raise

    def add_cycle_work_items(
        self, workspace_slug: str, project_id: str, cycle_id: str, issues: list, **kwargs
    ) -> Union[Dict[str, Any], List[Any], Any]:
        """Add work items to a cycle."""
        try:
            # Create a single request with all issues (batch approach)
            cycle_issue_request = CycleIssueRequestRequest(issues=issues)

            # Call the SDK method once with all issues
            response = self.cycles.add_cycle_work_items(
                cycle_id=cycle_id, project_id=project_id, slug=workspace_slug, cycle_issue_request_request=cycle_issue_request
            )

            # Convert response to dict
            return self._model_to_dict(response)

        except Exception as e:
            log.error(f"Failed to add work items to cycle: {str(e)}")
            raise

    def list_cycle_work_items(self, workspace_slug: str, project_id: str, cycle_id: str, **kwargs) -> Union[Dict[str, Any], List[Any], Any]:
        """List work items in a cycle."""
        try:
            response = self.cycles.list_cycle_work_items(cycle_id=cycle_id, project_id=project_id, slug=workspace_slug, **kwargs)
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to list cycle work items: {str(e)}")
            raise

    def retrieve_cycle_work_item(
        self, workspace_slug: str, project_id: str, cycle_id: str, issue_id: str, **kwargs
    ) -> Union[Dict[str, Any], List[Any], Any]:
        """Get a specific work item in a cycle."""
        try:
            response = self.cycles.retrieve_cycle_work_item(
                cycle_id=cycle_id, project_id=project_id, slug=workspace_slug, issue_id=issue_id, **kwargs
            )
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to retrieve cycle work item: {str(e)}")
            raise

    def delete_cycle_work_item(self, workspace_slug: str, project_id: str, cycle_id: str, issue_id: str) -> bool:
        """Remove a work item from a cycle."""
        try:
            self.cycles.delete_cycle_work_item(cycle_id=cycle_id, project_id=project_id, slug=workspace_slug, issue_id=issue_id)
            return True
        except Exception as e:
            log.error(f"Failed to delete cycle work item: {str(e)}")
            raise

    def transfer_cycle_work_items(
        self, workspace_slug: str, project_id: str, cycle_id: str, new_cycle_id: str, **kwargs
    ) -> Union[Dict[str, Any], List[Any], Any]:
        """Transfer work items between cycles."""
        try:
            # Create the proper request object
            transfer_request = TransferCycleIssueRequestRequest(new_cycle_id=new_cycle_id)
            response = self.cycles.transfer_cycle_work_items(
                cycle_id=cycle_id, project_id=project_id, slug=workspace_slug, transfer_cycle_issue_request_request=transfer_request
            )
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to transfer cycle work items: {str(e)}")
            raise

    def delete_cycle(self, workspace_slug: str, project_id: str, pk: str) -> bool:
        """Delete a cycle."""
        try:
            self.cycles.delete_cycle(pk=pk, project_id=project_id, slug=workspace_slug)
            return True
        except Exception as e:
            log.error(f"Failed to delete cycle: {str(e)}")
            raise

    # ============================================================================
    # INTAKE API METHODS
    # ============================================================================

    def create_intake_work_item(self, workspace_slug: str, project_id: str, **kwargs) -> Union[Dict[str, Any], List[Any], Any]:
        """Create a new intake work item."""
        try:
            # Create the intake issue request object
            intake_request = IntakeIssueCreateRequest(**kwargs)

            response = self.intake.create_intake_work_item(project_id=project_id, slug=workspace_slug, intake_issue_create_request=intake_request)
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to create intake work item: {str(e)}")
            raise

    def get_intake_work_items_list(self, workspace_slug: str, project_id: str, **kwargs) -> Union[Dict[str, Any], List[Any], Any]:
        """List intake work items."""
        try:
            response = self.intake.get_intake_work_items_list(project_id=project_id, slug=workspace_slug, **kwargs)
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to list intake work items: {str(e)}")
            raise

    def retrieve_intake_work_item(self, workspace_slug: str, project_id: str, intake_id: str, **kwargs) -> Union[Dict[str, Any], List[Any], Any]:
        """Retrieve a specific intake work item."""
        try:
            response = self.intake.retrieve_intake_work_item(issue_id=intake_id, project_id=project_id, slug=workspace_slug, **kwargs)
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to retrieve intake work item: {str(e)}")
            raise

    def update_intake_work_item(self, workspace_slug: str, project_id: str, intake_id: str, **kwargs) -> Union[Dict[str, Any], List[Any], Any]:
        """Update an intake work item."""
        try:
            # Create the patched intake issue request object
            patched_intake_request = PatchedIntakeIssueUpdateRequest(**kwargs)

            response = self.intake.update_intake_work_item(
                issue_id=intake_id, project_id=project_id, slug=workspace_slug, patched_intake_issue_update_request=patched_intake_request
            )
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to update intake work item: {str(e)}")
            raise

    def delete_intake_work_item(self, workspace_slug: str, project_id: str, intake_id: str) -> bool:
        """Delete an intake work item."""
        try:
            self.intake.delete_intake_work_item(issue_id=intake_id, project_id=project_id, slug=workspace_slug)
            return True
        except Exception as e:
            log.error(f"Failed to delete intake work item: {str(e)}")
            raise

    # ============================================================================
    # MEMBERS API METHODS
    # ============================================================================

    def get_workspace_members(self, workspace_slug: str, **kwargs) -> Union[Dict[str, Any], List[Any], Any]:
        """Get all workspace members."""
        try:
            response = self.members.get_workspace_members(slug=workspace_slug, **kwargs)
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to get workspace members: {str(e)}")
            raise

    def get_project_members(self, workspace_slug: str, project_id: str, **kwargs) -> Union[Dict[str, Any], List[Any], Any]:
        """Get all project members."""
        try:
            response = self.members.get_project_members(project_id=project_id, slug=workspace_slug, **kwargs)
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to get project members: {str(e)}")
            raise

    # ============================================================================
    # ACTIVITY API METHODS
    # ============================================================================

    def list_work_item_activities(self, workspace_slug: str, project_id: str, **kwargs) -> Union[Dict[str, Any], List[Any], Any]:
        """List work item activities."""
        try:
            response = self.work_item_activity.list_work_item_activities(project_id=project_id, slug=workspace_slug, **kwargs)
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to list work item activities: {str(e)}")
            raise

    def retrieve_work_item_activity(self, workspace_slug: str, project_id: str, activity_id: str, **kwargs) -> Union[Dict[str, Any], List[Any], Any]:
        """Retrieve a specific work item activity."""
        try:
            response = self.work_item_activity.retrieve_work_item_activity(pk=activity_id, project_id=project_id, slug=workspace_slug, **kwargs)
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to retrieve work item activity: {str(e)}")
            raise

    # ============================================================================
    # ATTACHMENTS API METHODS
    # ============================================================================

    def create_work_item_attachment(self, workspace_slug: str, project_id: str, issue_id: str, **kwargs) -> Union[Dict[str, Any], List[Any], Any]:
        """Create a work item attachment."""
        try:
            # Create the attachment upload request object
            attachment_request = IssueAttachmentUploadRequest(**kwargs)

            response = self.work_item_attachments.create_work_item_attachment(
                issue_id=issue_id, project_id=project_id, slug=workspace_slug, issue_attachment_upload_request=attachment_request
            )
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to create work item attachment: {str(e)}")
            raise

    def list_work_item_attachments(self, workspace_slug: str, project_id: str, **kwargs) -> Union[Dict[str, Any], List[Any], Any]:
        """List work item attachments."""
        try:
            response = self.work_item_attachments.list_work_item_attachments(project_id=project_id, slug=workspace_slug, **kwargs)
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to list work item attachments: {str(e)}")
            raise

    def retrieve_work_item_attachment(
        self, workspace_slug: str, project_id: str, attachment_id: str, **kwargs
    ) -> Union[Dict[str, Any], List[Any], Any]:
        """Retrieve a specific work item attachment."""
        try:
            response = self.work_item_attachments.retrieve_work_item_attachment(
                pk=attachment_id, project_id=project_id, slug=workspace_slug, **kwargs
            )
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to retrieve work item attachment: {str(e)}")
            raise

    def delete_work_item_attachment(self, workspace_slug: str, project_id: str, issue_id: str, attachment_id: str) -> bool:
        """Delete a work item attachment."""
        try:
            self.work_item_attachments.delete_work_item_attachment(issue_id=issue_id, pk=attachment_id, project_id=project_id, slug=workspace_slug)
            return True
        except Exception as e:
            log.error(f"Failed to delete work item attachment: {str(e)}")
            raise

    # ============================================================================
    # COMMENTS API METHODS
    # ============================================================================

    def create_work_item_comment(self, workspace_slug: str, project_id: str, issue_id: str, **kwargs) -> Union[Dict[str, Any], List[Any], Any]:
        """Create a work item comment."""
        try:
            # Create the comment request object
            comment_request = IssueCommentCreateRequest(**kwargs)

            response = self.work_item_comments.create_work_item_comment(
                issue_id=issue_id, project_id=project_id, slug=workspace_slug, issue_comment_create_request=comment_request
            )
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to create work item comment: {str(e)}")
            raise

    def list_work_item_comments(self, workspace_slug: str, project_id: str, **kwargs) -> Union[Dict[str, Any], List[Any], Any]:
        """List work item comments."""
        try:
            response = self.work_item_comments.list_work_item_comments(project_id=project_id, slug=workspace_slug, **kwargs)
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to list work item comments: {str(e)}")
            raise

    def retrieve_work_item_comment(self, workspace_slug: str, project_id: str, comment_id: str, **kwargs) -> Union[Dict[str, Any], List[Any], Any]:
        """Retrieve a specific work item comment."""
        try:
            response = self.work_item_comments.retrieve_work_item_comment(pk=comment_id, project_id=project_id, slug=workspace_slug, **kwargs)
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to retrieve work item comment: {str(e)}")
            raise

    def update_work_item_comment(
        self, workspace_slug: str, project_id: str, issue_id: str, comment_id: str, **kwargs
    ) -> Union[Dict[str, Any], List[Any], Any]:
        """Update a work item comment."""
        try:
            # Create the patched comment request object
            patched_comment_request = PatchedIssueCommentCreateRequest(**kwargs)

            response = self.work_item_comments.update_work_item_comment(
                issue_id=issue_id,
                pk=comment_id,
                project_id=project_id,
                slug=workspace_slug,
                patched_issue_comment_create_request=patched_comment_request,
            )
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to update work item comment: {str(e)}")
            raise

    def delete_work_item_comment(self, workspace_slug: str, project_id: str, issue_id: str, comment_id: str) -> bool:
        """Delete a work item comment."""
        try:
            self.work_item_comments.delete_work_item_comment(issue_id=issue_id, pk=comment_id, project_id=project_id, slug=workspace_slug)
            return True
        except Exception as e:
            log.error(f"Failed to delete work item comment: {str(e)}")
            raise

    # ============================================================================
    # LINKS API METHODS
    # ============================================================================

    def create_work_item_link(self, workspace_slug: str, project_id: str, issue_id: str, **kwargs) -> Union[Dict[str, Any], List[Any], Any]:
        """Create a work item link."""
        try:
            # Create the link request object
            link_request = IssueLinkCreateRequest(**kwargs)

            response = self.work_item_links.create_work_item_link(
                issue_id=issue_id, project_id=project_id, slug=workspace_slug, issue_link_create_request=link_request
            )
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to create work item link: {str(e)}")
            raise

    def list_work_item_links(self, workspace_slug: str, project_id: str, **kwargs) -> Union[Dict[str, Any], List[Any], Any]:
        """List work item links."""
        try:
            response = self.work_item_links.list_work_item_links(project_id=project_id, slug=workspace_slug, **kwargs)
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to list work item links: {str(e)}")
            raise

    def retrieve_work_item_link(self, workspace_slug: str, project_id: str, link_id: str, **kwargs) -> Union[Dict[str, Any], List[Any], Any]:
        """Retrieve a specific work item link."""
        try:
            response = self.work_item_links.retrieve_work_item_link(pk=link_id, project_id=project_id, slug=workspace_slug, **kwargs)
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to retrieve work item link: {str(e)}")
            raise

    def update_issue_link(self, workspace_slug: str, project_id: str, issue_id: str, link_id: str, **kwargs) -> Union[Dict[str, Any], List[Any], Any]:
        """Update a work item link."""
        try:
            # Create the patched link request object
            patched_link_request = PatchedIssueLinkUpdateRequest(**kwargs)

            response = self.work_item_links.update_issue_link(
                issue_id=issue_id, pk=link_id, project_id=project_id, slug=workspace_slug, patched_issue_link_update_request=patched_link_request
            )
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to update work item link: {str(e)}")
            raise

    def delete_work_item_link(self, workspace_slug: str, project_id: str, issue_id: str, link_id: str) -> bool:
        """Delete a work item link."""
        try:
            self.work_item_links.delete_work_item_link(issue_id=issue_id, pk=link_id, project_id=project_id, slug=workspace_slug)
            return True
        except Exception as e:
            log.error(f"Failed to delete work item link: {str(e)}")
            raise

    # ============================================================================
    # PROPERTIES API METHODS
    # ============================================================================

    def create_issue_property(self, workspace_slug: str, project_id: str, type_id: str, **kwargs) -> Union[Dict[str, Any], List[Any], Any]:
        """Create an issue property."""
        try:
            # Create the property request object
            property_request = IssuePropertyAPIRequest(**kwargs)

            response = self.work_item_properties.create_issue_property(
                project_id=project_id, slug=workspace_slug, type_id=type_id, issue_property_api_request=property_request
            )
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to create issue property: {str(e)}")
            raise

    def list_issue_properties(self, workspace_slug: str, project_id: str, **kwargs) -> Union[Dict[str, Any], List[Any], Any]:
        """List issue properties."""
        try:
            response = self.work_item_properties.list_issue_properties(project_id=project_id, slug=workspace_slug, **kwargs)
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to list issue properties: {str(e)}")
            raise

    def retrieve_issue_property(
        self, workspace_slug: str, project_id: str, property_id: str, type_id: str, **kwargs
    ) -> Union[Dict[str, Any], List[Any], Any]:
        """Retrieve a specific issue property."""
        try:
            response = self.work_item_properties.retrieve_issue_property(
                project_id=project_id, property_id=property_id, slug=workspace_slug, type_id=type_id, **kwargs
            )
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to retrieve issue property: {str(e)}")
            raise

    def update_issue_property(
        self, workspace_slug: str, project_id: str, property_id: str, type_id: str, **kwargs
    ) -> Union[Dict[str, Any], List[Any], Any]:
        """Update an issue property."""
        try:
            # Create the patched property request object
            patched_property_request = PatchedIssuePropertyAPIRequest(**kwargs)

            response = self.work_item_properties.update_issue_property(
                project_id=project_id,
                property_id=property_id,
                slug=workspace_slug,
                type_id=type_id,
                patched_issue_property_api_request=patched_property_request,
            )
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to update issue property: {str(e)}")
            raise

    def delete_issue_property(self, workspace_slug: str, project_id: str, property_id: str, type_id: str) -> bool:
        """Delete an issue property."""
        try:
            self.work_item_properties.delete_issue_property(project_id=project_id, property_id=property_id, slug=workspace_slug, type_id=type_id)
            return True
        except Exception as e:
            log.error(f"Failed to delete issue property: {str(e)}")
            raise

    def create_issue_property_option(
        self, workspace_slug: str, project_id: str, property_id: str, type_id: str, **kwargs
    ) -> Union[Dict[str, Any], List[Any], Any]:
        """Create an issue property option."""
        try:
            # Create the property option request object
            option_request = IssuePropertyOptionAPIRequest(**kwargs)

            response = self.work_item_properties.create_issue_property_option(
                project_id=project_id, property_id=property_id, slug=workspace_slug, issue_property_option_api_request=option_request
            )
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to create issue property option: {str(e)}")
            raise

    def create_issue_property_value(
        self, workspace_slug: str, project_id: str, property_id: str, type_id: str, issue_id: str, **kwargs
    ) -> Union[Dict[str, Any], List[Any], Any]:
        """Create an issue property value."""
        try:
            # Create the property value request object
            value_request = IssuePropertyValueAPIRequest(**kwargs)

            response = self.work_item_properties.create_issue_property_value(
                project_id=project_id,
                property_id=property_id,
                slug=workspace_slug,
                issue_id=issue_id,
                issue_property_value_api_request=value_request,
            )
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to create issue property value: {str(e)}")
            raise

    def list_issue_property_options(
        self, workspace_slug: str, project_id: str, property_id: str, type_id: str, **kwargs
    ) -> Union[Dict[str, Any], List[Any], Any]:
        """List issue property options."""
        try:
            response = self.work_item_properties.list_issue_property_options(
                project_id=project_id, property_id=property_id, slug=workspace_slug, **kwargs
            )
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to list issue property options: {str(e)}")
            raise

    def list_issue_property_values(
        self, workspace_slug: str, project_id: str, type_id: str, issue_id: str, **kwargs
    ) -> Union[Dict[str, Any], List[Any], Any]:
        """List issue property values."""
        try:
            response = self.work_item_properties.list_issue_property_values(project_id=project_id, slug=workspace_slug, issue_id=issue_id, **kwargs)
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to list issue property values: {str(e)}")
            raise

    def retrieve_issue_property_option(
        self, workspace_slug: str, project_id: str, property_id: str, type_id: str, option_id: str, **kwargs
    ) -> Union[Dict[str, Any], List[Any], Any]:
        """Retrieve an issue property option."""
        try:
            response = self.work_item_properties.retrieve_issue_property_option(
                project_id=project_id, property_id=property_id, slug=workspace_slug, option_id=option_id, **kwargs
            )
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to retrieve issue property option: {str(e)}")
            raise

    def update_issue_property_option(
        self, workspace_slug: str, project_id: str, property_id: str, type_id: str, option_id: str, **kwargs
    ) -> Union[Dict[str, Any], List[Any], Any]:
        """Update an issue property option."""
        try:
            # Create the patched property option request object
            patched_option_request = PatchedIssuePropertyOptionAPIRequest(**kwargs)

            response = self.work_item_properties.update_issue_property_option(
                project_id=project_id,
                property_id=property_id,
                slug=workspace_slug,
                option_id=option_id,
                patched_issue_property_option_api_request=patched_option_request,
            )
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to update issue property option: {str(e)}")
            raise

    def delete_issue_property_option(self, workspace_slug: str, project_id: str, property_id: str, type_id: str, option_id: str) -> bool:
        """Delete an issue property option."""
        try:
            self.work_item_properties.delete_issue_property_option(
                project_id=project_id, property_id=property_id, slug=workspace_slug, option_id=option_id
            )
            return True
        except Exception as e:
            log.error(f"Failed to delete issue property option: {str(e)}")
            raise

    # ============================================================================
    # TYPES API METHODS
    # ============================================================================

    def create_issue_type(self, workspace_slug: str, project_id: str, **kwargs) -> Union[Dict[str, Any], List[Any], Any]:
        """Create an issue type."""
        try:
            # Create the type request object
            type_request = IssueTypeAPIRequest(**kwargs)

            response = self.work_item_types.create_issue_type(project_id=project_id, slug=workspace_slug, issue_type_api_request=type_request)
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to create issue type: {str(e)}")
            raise

    def list_issue_types(self, workspace_slug: str, project_id: str, **kwargs) -> Union[Dict[str, Any], List[Any], Any]:
        """List issue types."""
        try:
            response = self.work_item_types.list_issue_types(project_id=project_id, slug=workspace_slug, **kwargs)
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to list issue types: {str(e)}")
            raise

    def retrieve_issue_type(self, workspace_slug: str, project_id: str, type_id: str, **kwargs) -> Union[Dict[str, Any], List[Any], Any]:
        """Retrieve a specific issue type."""
        try:
            response = self.work_item_types.retrieve_issue_type(project_id=project_id, slug=workspace_slug, type_id=type_id, **kwargs)
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to retrieve issue type: {str(e)}")
            raise

    def update_issue_type(self, workspace_slug: str, project_id: str, type_id: str, **kwargs) -> Union[Dict[str, Any], List[Any], Any]:
        """Update an issue type."""
        try:
            # Create the patched type request object
            patched_type_request = PatchedIssueTypeAPIRequest(**kwargs)

            response = self.work_item_types.update_issue_type(
                project_id=project_id, slug=workspace_slug, type_id=type_id, patched_issue_type_api_request=patched_type_request
            )
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to update issue type: {str(e)}")
            raise

    def delete_issue_type(self, workspace_slug: str, project_id: str, type_id: str) -> bool:
        """Delete an issue type."""
        try:
            self.work_item_types.delete_issue_type(project_id=project_id, slug=workspace_slug, type_id=type_id)
            return True
        except Exception as e:
            log.error(f"Failed to delete issue type: {str(e)}")
            raise

    # ============================================================================
    # WORKLOGS API METHODS
    # ============================================================================

    def create_issue_worklog(self, workspace_slug: str, project_id: str, issue_id: str, **kwargs) -> Union[Dict[str, Any], List[Any], Any]:
        """Create an issue worklog."""
        try:
            # Create the worklog request object
            worklog_request = IssueWorkLogAPIRequest(**kwargs)

            response = self.work_item_worklogs.create_issue_worklog(
                issue_id=issue_id, project_id=project_id, slug=workspace_slug, issue_work_log_api_request=worklog_request
            )
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to create issue worklog: {str(e)}")
            raise

    def list_issue_worklogs(self, workspace_slug: str, project_id: str, **kwargs) -> Union[Dict[str, Any], List[Any], Any]:
        """List issue worklogs."""
        try:
            response = self.work_item_worklogs.list_issue_worklogs(project_id=project_id, slug=workspace_slug, **kwargs)
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to list issue worklogs: {str(e)}")
            raise

    def get_project_worklog_summary(self, workspace_slug: str, project_id: str, **kwargs) -> Union[Dict[str, Any], List[Any], Any]:
        """Get project worklog summary."""
        try:
            response = self.work_item_worklogs.get_project_worklog_summary(project_id=project_id, slug=workspace_slug, **kwargs)
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to get project worklog summary: {str(e)}")
            raise

    def update_issue_worklog(
        self, workspace_slug: str, project_id: str, issue_id: str, worklog_id: str, **kwargs
    ) -> Union[Dict[str, Any], List[Any], Any]:
        """Update an issue worklog."""
        try:
            # Create the patched worklog request object
            patched_worklog_request = PatchedIssueWorkLogAPIRequest(**kwargs)

            response = self.work_item_worklogs.update_issue_worklog(
                issue_id=issue_id,
                pk=worklog_id,
                project_id=project_id,
                slug=workspace_slug,
                patched_issue_work_log_api_request=patched_worklog_request,
            )
            return self._model_to_dict(response)
        except Exception as e:
            log.error(f"Failed to update issue worklog: {str(e)}")
            raise

    def delete_issue_worklog(self, workspace_slug: str, project_id: str, issue_id: str, worklog_id: str) -> bool:
        """Delete an issue worklog."""
        try:
            self.work_item_worklogs.delete_issue_worklog(issue_id=issue_id, pk=worklog_id, project_id=project_id, slug=workspace_slug)
            return True
        except Exception as e:
            log.error(f"Failed to delete issue worklog: {str(e)}")
            raise
