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

import json
from typing import Any
from typing import Optional


def sse_event(event: str, data: Any) -> str:
    """Format a Server-Sent Event with the given event name and data.

    Data may be a pre-serialized JSON string or any JSON-serializable object.
    """
    payload = data if isinstance(data, str) else json.dumps(data)
    return f"event: {event}\ndata: {payload}\n\n"


def sse_done() -> str:
    """Standard terminal event for SSE streams."""
    return sse_event("done", {"done": True})


def normalize_error_chunk(chunk: Any) -> Optional[str]:
    """Convert plain text error chunks to a proper SSE error event.

    Recognizes patterns like "error: <message>" (with optional quotes) and
    a set of known fallback error strings used across the pipeline.
    Returns a formatted SSE error event string or None if not applicable.
    """

    if not isinstance(chunk, str):
        return None

    if chunk.startswith("error:"):
        msg = chunk.split("error:", 1)[1].strip()
        if (msg.startswith("'") and msg.endswith("'")) or (msg.startswith('"') and msg.endswith('"')):
            msg = msg[1:-1]
        return sse_event("error", {"message": msg})

    fallback_msgs = {
        "An unexpected error occurred. Please try again",
        "An unexpected error occurred. Please try again later.",
        "I'm having trouble processing your request right now. Please try again later.",
        "Failed to retrieve data from the DB due to an error. Please try again later.",
        "There was an error pulling the data from the database. Please try again later.",
    }
    if chunk in fallback_msgs:
        return sse_event("error", {"message": chunk})

    return None
