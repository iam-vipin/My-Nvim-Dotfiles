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

import os
import importlib
from django.apps import AppConfig


class AutomationConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "plane.automations"

    def ready(self):
        """
        Auto-discover and import all node modules when Django starts up.

        This ensures that all @register_node decorators are executed
        and the NodeRegistry is properly populated.
        """
        # Import nodes directory to trigger registration
        nodes_dir = os.path.join(os.path.dirname(__file__), "nodes")

        if os.path.exists(nodes_dir):
            # Get all Python files in the nodes directory
            for filename in os.listdir(nodes_dir):
                if filename.endswith(".py") and not filename.startswith("__"):
                    module_name = filename[:-3]  # Remove .py extension
                    try:
                        # Import the module to trigger registration decorators
                        importlib.import_module(f"{self.name}.nodes.{module_name}")
                    except ImportError as e:
                        # Log the error but don't fail startup
                        print(f"Warning: Failed to import automation node module {module_name}: {e}")
