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

from django.core.management.base import BaseCommand
from plane.silo.services import create_applications
from plane.silo.models import ApplicationSecret
from plane.license.models import InstanceAdmin
from plane.silo.utils.constants import APPLICATIONS


class Command(BaseCommand):
    help = "Reset marketplace application secrets"

    def handle(self, *args, **kwargs):
        instance_admin = InstanceAdmin.objects.first()
        if not instance_admin:
            self.stdout.write(self.style.ERROR("No instance admin found"))
            return
        self.stdout.write(f"Resetting marketplace application secrets for instance admin: {instance_admin.user.id}")
        try:
            applications = APPLICATIONS.keys()
            applications_keys = [f"x-{appkey}-*" for appkey in applications]
            self.stdout.write(f"Deleting application secrets for applications: {applications_keys}")

            # delete existing application secrets for marketplace applications
            for appkey in applications_keys:
                app_query_set = ApplicationSecret.objects.all().filter(key__regex=appkey)
                self.stdout.write(f"Deleting application secrets for applications {appkey}: {app_query_set.count()}")
                app_query_set.delete(soft=False)
            # create new applications secrets
            self.stdout.write(f"Creating new applications secrets for applications: {applications}")
            create_applications(instance_admin.user.id)
            self.stdout.write(
                f"Successfully reset marketplace application secrets for instance admin: {instance_admin.user.id}"
            )
        except Exception as e:
            self.stdout.write(
                f"Error resetting marketplace application secrets for instance admin: {instance_admin.user.id}",
                exc_info=e,
            )
