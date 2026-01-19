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

CHART_VALIDATION_RULES = {
    "BASIC": {
        "BAR_CHART": {"group_by": None},
        "LINE_CHART": {"group_by": None},
        "AREA_CHART": {"group_by": None},
        "PIE_CHART": {"group_by": None},
        "DONUT_CHART": {"group_by": None},
    },
    "STACKED": {"BAR_CHART": {"group_by": "required"}},
    "GROUPED": {"BAR_CHART": {"group_by": "required"}},
    "MULTI_LINE": {"LINE_CHART": {"group_by": "required"}},
    "STACKED_LINE": {"LINE_CHART": {"group_by": "required"}},
    "STANDARD": {"AREA_CHART": {"group_by": "required"}},
    "COMPARISON": {"AREA_CHART": {"group_by": "required"}},
    "PROGRESS": {"DONUT_CHART": {"x_axis_date_grouping": None, "group_by": None}},
    None: {"NUMBER": {"x_axis_date_grouping": None, "group_by": None, "chart_type": None}},
}


def validate_chart_config(chart_model, chart_type, config):
    rules = CHART_VALIDATION_RULES.get(chart_model, {}).get(chart_type, {})

    validated_config = {key: value for key, value in config.items() if key not in rules or rules[key] is not None}

    # Add missing keys with None if defined in rules
    for key, value in rules.items():
        if value is None and key not in validated_config:
            validated_config[key] = None

    return validated_config
