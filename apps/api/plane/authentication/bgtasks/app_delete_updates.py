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

from celery import shared_task
import logging


@shared_task
def app_delete_updates(application_id: str):
    """
    This function deletes all app installations for an application.
    """
    from plane.authentication.models import Application, WorkspaceAppInstallation

    application = Application.objects.get(id=application_id)
    if not application:
        logging.getLogger("plane.worker").info(f"Application {application_id} not found")
        return
    app_installations = WorkspaceAppInstallation.objects.filter(
        application_id=application_id,
    )
    for app_installation in app_installations:
        app_installation.delete()
    return
