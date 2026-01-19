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


@shared_task
def app_webhook_url_updates(application_id: str):
    """
    This function updates the webhook url for all app installations that have a webhook.
    """
    from plane.authentication.models import Application, WorkspaceAppInstallation

    application = Application.objects.get(id=application_id)
    if not application:
        return
    app_installations = WorkspaceAppInstallation.objects.filter(application_id=application_id)
    if not application.webhook_url:
        # Delete webhooks for all app installations
        for app_installation in app_installations:
            app_installation.webhook.delete()
        return

    # Update webhook url for existing app installations
    # For new app installations, the webhook will be created when the app is installed
    # Older app installations without webhook will be ignored.
    # Users have to re-install the app to get the webhook
    for app_installation in app_installations:
        if app_installation.webhook:
            app_installation.webhook.url = application.webhook_url
            app_installation.webhook.save()
