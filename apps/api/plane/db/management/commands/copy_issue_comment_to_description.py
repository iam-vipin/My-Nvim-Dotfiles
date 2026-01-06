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
from django.core.management.base import BaseCommand
from django.db import transaction

# Module imports
from plane.db.models import Description
from plane.db.models import IssueComment


class Command(BaseCommand):
    help = "Create Description records for existing IssueComment"

    def handle(self, *args, **kwargs):
        batch_size = 500

        while True:
            comments = list(
                IssueComment.objects.filter(description_id__isnull=True).order_by("created_at")[:batch_size]
            )

            if not comments:
                break

            with transaction.atomic():
                descriptions = [
                    Description(
                        created_at=comment.created_at,
                        updated_at=comment.updated_at,
                        description_json=comment.comment_json,
                        description_html=comment.comment_html,
                        description_stripped=comment.comment_stripped,
                        project_id=comment.project_id,
                        created_by_id=comment.created_by_id,
                        updated_by_id=comment.updated_by_id,
                        workspace_id=comment.workspace_id,
                    )
                    for comment in comments
                ]

                created_descriptions = Description.objects.bulk_create(descriptions)

                comments_to_update = []
                for comment, description in zip(comments, created_descriptions):
                    comment.description_id = description.id
                    comments_to_update.append(comment)

                IssueComment.objects.bulk_update(comments_to_update, ["description_id"])

        self.stdout.write(self.style.SUCCESS("Successfully Copied IssueComment to Description"))
