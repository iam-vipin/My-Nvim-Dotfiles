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

from pi.services.pages.prompts import CUSTOM_PROMPT
from pi.services.pages.prompts import ELABORATE_PROMPT
from pi.services.pages.prompts import SHORTEN_PROMPT
from pi.services.pages.prompts import SUMMARY_PROMPT

PAGE_BLOCK_TYPES = [
    {
        "key": "summarize_page",
        "label": "Summarize Page",
        "description": "Generate a concise summary of the page content.",
        "has_content": False,
        "system_message": SUMMARY_PROMPT,
        "user_message": "{context_text}",
    },
    {
        "key": "custom_prompt",
        "label": "Custom Prompt",
        "description": "Ask AI anything about this page.",
        "has_content": True,
        "system_message": CUSTOM_PROMPT,
        "user_message": "Context:\n{context_text}\n\nUser Request: {user_input}",
    },
]

REVISION_BLOCK_TYPES = [
    {
        "key": "elaborate",
        "label": "Elaborate",
        "description": "Elaborate the content.",
        "system_message": ELABORATE_PROMPT,
        "user_message": "Revision Request: elaborate\n\nContext:\n{context_text}\n\nCurrent Content:\n{current_content}",
    },
    {
        "key": "shorten",
        "label": "Shorten",
        "description": "Make the content shorter.",
        "system_message": SHORTEN_PROMPT,
        "user_message": "Revision Request: shorten\n\nContext:\n{context_text}\n\nCurrent Content:\n{current_content}",
    },
]
