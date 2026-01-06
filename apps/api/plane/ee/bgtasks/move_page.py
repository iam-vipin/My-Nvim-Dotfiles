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

from plane.db.models import ProjectMember, UserFavorite

# Third Party imports
from celery import shared_task


@shared_task
def move_page(page_id, old_project_id, new_project_id):
    # Get all the members for the new project
    new_project_members_list = ProjectMember.objects.filter(
        project_id=new_project_id,
    ).values_list("member_id", flat=True)

    # Delete favorites for the members who are not part of the new project
    UserFavorite.objects.filter(
        entity_type="page",
        entity_identifier=page_id,
        project_id=old_project_id,
    ).exclude(user_id__in=new_project_members_list).delete()

    # Update the project id fo the members who are part of the project
    UserFavorite.objects.filter(
        entity_type="page",
        entity_identifier=page_id,
        project_id=old_project_id,
        user_id__in=new_project_members_list,
    ).update(project_id=new_project_id)

    return
