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

"""
Method Executor for Plane Actions
Handles the second step of hierarchical action execution.
"""

from typing import Any
from typing import Dict

from .registry import get_available_categories
from .registry import get_category_methods
from .registry import get_method_name_map
from .registry import resolve_actual_method_name


class MethodExecutor:
    """Executes specific methods within selected categories"""

    def __init__(self, plane_executor):
        self.plane_executor = plane_executor

    @staticmethod
    def get_category_methods(category: str) -> Dict[str, str]:
        """Get available methods for a specific category"""
        return get_category_methods(category)

    async def execute(self, category: str, method: str, **kwargs) -> Dict[str, Any]:
        """Execute a method within a category"""
        try:
            # Resolve the actual method name using centralized registry
            mapping = get_method_name_map(category)
            if not mapping:
                return {"success": False, "error": f"Unknown category: {category}", "available_categories": list(get_available_categories().keys())}

            if method not in mapping:
                return {
                    "success": False,
                    "error": f"Unknown method '{method}' for category '{category}'",
                    "available_methods": list(mapping.keys()),
                }

            actual_method = resolve_actual_method_name(category, method)  # never None here because of the check

            # Execute through the PlaneActionsExecutor
            result = await self.plane_executor.execute_method(category, actual_method, **kwargs)
            return result

        except Exception as e:
            return {"success": False, "error": f"Execution error: {str(e)}", "category": category, "method": method}
