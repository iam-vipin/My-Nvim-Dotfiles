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
from django.core.management import BaseCommand, CommandError

# Module imports
from plane.db.models import User


class Command(BaseCommand):
    help = "Make the user with the given email active"

    def add_arguments(self, parser):
        # Positional argument
        parser.add_argument("email", type=str, help="user email")

    def handle(self, *args, **options):
        # get the user email from console
        email = options.get("email", False)

        # raise error if email is not present
        if not email:
            raise CommandError("Error: Email is required")

        # filter the user
        user = User.objects.filter(email=email).first()

        # Raise error if the user is not present
        if not user:
            raise CommandError(f"Error: User with {email} does not exists")

        # Activate the user
        user.is_active = True
        user.save()

        self.stdout.write(self.style.SUCCESS("User activated successfully"))
