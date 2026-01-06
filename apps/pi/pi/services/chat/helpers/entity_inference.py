# SPDX-FileCopyrightText: 2023-present Plane Software, Inc.
# SPDX-License-Identifier: LicenseRef-Plane-Commercial
#
# Licensed under the Plane Commercial License (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
# https://plane.so/legals/eula
#
# DO NOT remove or modify this notice.
# NOTICE: Proprietary and confidential. Unauthorized use or distribution is prohibited.

from __future__ import annotations

from typing import Any
from typing import Dict
from typing import Optional

from pi.config import settings


async def infer_selected_entity(args: Dict[str, Any], context: Dict[str, Any], entity_type_hint: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """
    Generic best-effort entity inference for execute-action results.

    Some tools don’t return an `entity` payload even on success. When we can,
    infer the selected entity from request args + context (e.g., issue_id).
    """
    try:
        workspace_slug = context.get("workspace_slug")
        issue_id = args.get("issue_id")
        if workspace_slug and issue_id:
            from pi.agents.sql_agent.tools import construct_action_entity_url

            url_info = await construct_action_entity_url({"id": str(issue_id)}, "workitem", str(workspace_slug), settings.plane_api.FRONTEND_URL)
            if not url_info or not isinstance(url_info, dict):
                return None
            hint = (entity_type_hint or "").strip().lower()

            subresource_id_fields = {
                "comment": "comment_id",
                "worklog": "worklog_id",
            }
            entity_type = hint if hint in subresource_id_fields else "workitem"
            entity_id = args.get(subresource_id_fields.get(entity_type, ""), None) if entity_type != "workitem" else str(issue_id)

            entity: Dict[str, Any] = {
                "entity_url": url_info.get("entity_url"),
                "entity_name": None if entity_type in {"comment", "worklog"} else url_info.get("entity_name"),
                "entity_type": entity_type,
                "entity_id": str(entity_id) if entity_id else None,
            }
            if url_info.get("issue_identifier"):
                entity["issue_identifier"] = url_info["issue_identifier"]
                entity["entity_identifier"] = url_info["issue_identifier"]
            return entity
    except Exception:
        return None

    return None
