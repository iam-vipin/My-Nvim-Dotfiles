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

from markdown_it import MarkdownIt
from mdit_py_plugins.container import container_plugin
from mdit_py_plugins.deflist import deflist_plugin
from mdit_py_plugins.footnote import footnote_plugin
from mdit_py_plugins.tasklists import tasklists_plugin

md = (
    MarkdownIt("commonmark", {"typographer": True})
    .enable("table")
    .enable("strikethrough")
    .use(tasklists_plugin)
    .use(footnote_plugin)
    .use(container_plugin, name="callout")
    .use(deflist_plugin)
)


def md_to_html(markdown_text: str) -> str:
    if not markdown_text:
        return ""

    html = md.render(markdown_text)

    return html
