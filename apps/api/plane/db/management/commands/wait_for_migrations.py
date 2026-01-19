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

# wait_for_migrations.py
import time
from django.core.management.base import BaseCommand
from django.db.migrations.executor import MigrationExecutor
from django.db import connections, DEFAULT_DB_ALIAS


class Command(BaseCommand):
    help = "Wait for database migrations to complete before starting Celery worker/beat"

    def handle(self, *args, **kwargs):
        while self._pending_migrations():
            self.stdout.write("Waiting for database migrations to complete...")
            time.sleep(10)  # wait for 10 seconds before checking again

        self.stdout.write(self.style.SUCCESS("No migrations Pending. Starting processes ..."))

    def _pending_migrations(self):
        connection = connections[DEFAULT_DB_ALIAS]
        executor = MigrationExecutor(connection)
        targets = executor.loader.graph.leaf_nodes()
        return bool(executor.migration_plan(targets))
