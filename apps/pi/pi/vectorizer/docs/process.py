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

from .mdx_to_code import mdx_to_curl
from .mdx_to_code import mdx_to_go
from .mdx_to_code import mdx_to_java
from .mdx_to_code import mdx_to_js
from .mdx_to_code import mdx_to_php
from .mdx_to_code import mdx_to_python

converters = [
    mdx_to_python,
    mdx_to_java,
    mdx_to_js,
    mdx_to_curl,
    mdx_to_go,
    mdx_to_php,
]


def convert_md_code(mdx_input, converter):
    """Converts MDX content to specific code format using the provided converter."""
    return converter(mdx_input)


def process_file_content(file_content):
    """Processes file content by converting MDX code blocks to multiple language formats."""
    if "overview" in file_content.lower():
        return file_content

    result = file_content

    for converter in converters:
        converted_code = convert_md_code(file_content, converter)

        # Determine which converter was used
        if converter == mdx_to_python:
            language = "python"
        elif converter == mdx_to_java:
            language = "java"
        elif converter == mdx_to_js:
            language = "javascript"
        elif converter == mdx_to_curl:
            language = "curl"
        elif converter == mdx_to_go:
            language = "go"
        elif converter == mdx_to_php:
            language = "php"

        result += f"\n\n### {language} code\n\n"
        result += converted_code

    return result
