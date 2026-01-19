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
from plane.payment.bgtasks.update_license_task import update_licenses


class Command(BaseCommand):
    help = "Sync the license user for a workspace with the payment server"

    def handle(self, *args, **options):
        # Trigger the sync license on startup task
        update_licenses.delay()

        # Print the success message
        self.stdout.write(self.style.SUCCESS("Successfully triggered the sync license on startup task"))
        return
