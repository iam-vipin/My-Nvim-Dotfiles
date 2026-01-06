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
from django.core.management.base import BaseCommand, CommandError

# Module imports
from plane.license.models import Instance, InstanceAdmin
from plane.db.models import User


class Command(BaseCommand):
    help = "Add a new instance admin"

    def add_arguments(self, parser):
        # Positional argument
        parser.add_argument("admin_email", type=str, help="Instance Admin Email")

    def handle(self, *args, **options):
        admin_email = options.get("admin_email", False)

        if not admin_email:
            raise CommandError("Please provide the email of the admin.")

        user = User.objects.filter(email=admin_email).first()
        if user is None:
            raise CommandError("User with the provided email does not exist.")

        try:
            # Get the instance
            instance = Instance.objects.last()

            # Get or create an instance admin
            _, created = InstanceAdmin.objects.get_or_create(user=user, instance=instance, role=20)

            if not created:
                raise CommandError("The provided email is already an instance admin.")

            self.stdout.write(self.style.SUCCESS("Successfully created the admin"))
        except Exception as e:
            print(e)
            raise CommandError("Failed to create the instance admin.")
