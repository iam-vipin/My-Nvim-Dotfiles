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
from plane.bgtasks.silo_data_migration_task import schedule_silo_data_migration_task


class Command(BaseCommand):
    help = "Migrate data from old schema to new schema using Django models"

    def handle(self, *args, **options):
        db_uri = input("Enter database uri: ")
        batch_size = int(input("Enter the batch size: "))

        try:
            schedule_silo_data_migration_task.delay(db_uri, batch_size)
        except Exception as e:
            print(f"Migration failed: {str(e)}")
            raise
