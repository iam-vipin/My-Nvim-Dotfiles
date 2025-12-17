from __future__ import annotations

from typing import Any
from typing import Dict
from typing import Optional
from typing import Tuple


async def _resolve_issue_id(issue_id_val: Any, workspace_slug: Optional[str]) -> Tuple[Optional[str], bool]:
    """Resolve issue_id that may be a UUID or an identifier like 'NEW-15'."""
    if not issue_id_val:
        return None, False
    try:
        import uuid as _uuid

        _uuid.UUID(str(issue_id_val))
        return str(issue_id_val), False
    except Exception:
        pass

    if not workspace_slug:
        return None, False

    try:
        from pi.app.api.v1.helpers.plane_sql_queries import search_workitem_by_identifier

        wi = await search_workitem_by_identifier(str(issue_id_val), str(workspace_slug))
        if wi and wi.get("id"):
            return str(wi["id"]), True
    except Exception:
        return None, False

    return None, False


async def _attach_issue_identifier(action_summary: Dict[str, Any], issue_id: Optional[str]) -> None:
    """Attach issue_identifier to action_summary if resolvable."""
    if not issue_id:
        return
    try:
        from pi.app.api.v1.helpers.plane_sql_queries import get_issue_identifier_for_artifact

        info = await get_issue_identifier_for_artifact(str(issue_id))
        if info and isinstance(info, dict) and info.get("identifier"):
            action_summary["issue_identifier"] = info["identifier"]
    except Exception:
        return


async def _enrich_delete_comment_preview(tool_args: Dict[str, Any], resolved_issue_id: str) -> None:
    """Include comment_html for comment delete preview, best-effort."""
    comment_id_val = tool_args.get("comment_id")
    if not comment_id_val or tool_args.get("comment_html"):
        return
    try:
        from pi.app.api.v1.helpers.plane_sql_queries import get_issue_comments

        comments = await get_issue_comments(str(resolved_issue_id))
        if comments and isinstance(comments, list):
            match = next((c for c in comments if str(c.get("id")) == str(comment_id_val)), None)
            if match and match.get("comment_html"):
                tool_args["comment_html"] = match["comment_html"]
    except Exception:
        return


DELETE_PREVIEW_ENRICHERS: Dict[str, Any] = {
    # entity_type -> coroutine(tool_args, resolved_issue_id)
    "comment": _enrich_delete_comment_preview,
}


async def enrich_planning_payload(
    *,
    tool_args: Dict[str, Any],
    shadow_args: Dict[str, Any],
    action_type: str,
    entity_type: str,
) -> Dict[str, Any]:
    """
    Central place to enrich planning payload for previews/streaming.

    - Resolves issue_id identifiers to UUIDs when possible
    - For delete actions on issue-scoped entities, can fill preview content fields
    - Returns extra fields to merge into action_summary (e.g. issue_identifier)
    """
    extras: Dict[str, Any] = {}
    issue_id_val = tool_args.get("issue_id")
    ws_slug = tool_args.get("workspace_slug")
    resolved_issue_id, did_mutate = await _resolve_issue_id(issue_id_val, ws_slug)
    if resolved_issue_id and did_mutate:
        tool_args["issue_id"] = resolved_issue_id
        shadow_args["issue_id"] = resolved_issue_id

    if resolved_issue_id:
        await _attach_issue_identifier(extras, resolved_issue_id)

    if action_type == "delete" and entity_type in DELETE_PREVIEW_ENRICHERS and resolved_issue_id:
        await DELETE_PREVIEW_ENRICHERS[entity_type](tool_args, resolved_issue_id)
        # keep shadow_args in sync if we added anything
        if "comment_html" in tool_args and "comment_html" not in shadow_args:
            shadow_args["comment_html"] = tool_args["comment_html"]

    return extras
