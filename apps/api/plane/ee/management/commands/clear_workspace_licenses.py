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

# Django imports
from django.core.management import BaseCommand

# Module imports
from plane.ee.models import WorkspaceLicense


class Command(BaseCommand):
    help = "Clear the workspace licenses on the start up"

    def handle(self, *args, **options):
        # Hard Delete all workspace licenses
        WorkspaceLicense.all_objects.all().delete()
        self.stdout.write(self.style.SUCCESS("Workspace licenses cleared successfully"))
        return
