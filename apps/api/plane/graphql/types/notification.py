# Python imports
from datetime import datetime
from typing import Optional

# Third-Party Imports
import strawberry
import strawberry_django

# Django imports
from asgiref.sync import sync_to_async
from django.db.models import Q
from django.core.cache import cache

# Strawberry imports
from strawberry.scalars import JSON

# Module imports
from plane.db.models import Issue, Notification
from plane.graphql.types.project import ProjectType
from plane.graphql.types.user import UserType
from plane.graphql.utils.issue_activity import issue_activity_comment_string
from plane.graphql.utils.timezone import user_timezone_converter


_NO_VALUE = object()


@sync_to_async
def cache_notification_intake_id(issue_id: str) -> Optional[str]:
    key = f"notification_intake_{issue_id}"
    cache_key = cache.make_key(key)

    cache_value = cache.get(cache_key, _NO_VALUE)

    if cache_value is not _NO_VALUE:
        return cache_value

    issue = Issue.objects.filter(pk=issue_id, issue_intake__status__in=[0, 2, -2]).first()
    intake_id = str(issue.issue_intake.id) if issue and issue.issue_intake else None
    cache.set(cache_key, intake_id, timeout=60 * 5)
    return intake_id


@sync_to_async
def cache_notification_epic_id(issue_id: str) -> Optional[bool]:
    key = f"notification_epic_{issue_id}"
    cache_key = cache.make_key(key)

    cache_value = cache.get(cache_key, _NO_VALUE)

    if cache_value is not _NO_VALUE:
        return cache_value

    issue = Issue.objects.filter(pk=issue_id).filter(Q(type__isnull=False) & Q(type__is_epic=True)).exists()
    cache.set(cache_key, issue, timeout=60 * 5)
    return issue


@strawberry.type
class NotificationCountBaseType:
    unread: Optional[int]
    mentioned: Optional[int]


@strawberry.type
class NotificationCountWorkspaceType(NotificationCountBaseType):
    id: str
    slug: str
    name: str


@strawberry.type
class NotificationCountType(NotificationCountBaseType):
    workspaces: Optional[list[NotificationCountWorkspaceType]]


@strawberry_django.type(Notification)
class NotificationType:
    id: strawberry.ID
    title: str
    message: Optional[JSON]
    message_html = Optional[str]
    message_stripped = Optional[str]
    sender: str
    triggered_by: Optional[UserType]
    receiver: strawberry.ID
    read_at: Optional[datetime]
    snoozed_till: Optional[datetime]
    archived_at: Optional[datetime]
    entity_name: str
    entity_identifier: strawberry.ID
    data: JSON
    workspace: strawberry.ID
    project: Optional[ProjectType]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    @strawberry.field
    def workspace(self) -> int:
        return self.workspace_id

    @strawberry.field
    def receiver(self) -> int:
        return self.receiver_id

    def created_at(self, info) -> Optional[datetime]:
        converted_date = user_timezone_converter(info.context.user, self.created_at)
        return converted_date

    @strawberry.field
    def updated_at(self, info) -> Optional[datetime]:
        converted_date = user_timezone_converter(info.context.user, self.updated_at)
        return converted_date

    @strawberry.field
    async def data(self) -> JSON:
        # handle the html and custom mention tags in comment and issue_activity
        @sync_to_async
        def process_data() -> JSON:
            issue_activity = self.data.get("issue_activity")
            if issue_activity is not None:
                field = issue_activity.get("field")
                old_value = issue_activity.get("old_value")
                new_value = issue_activity.get("new_value")

                if field == "comment":
                    # handling the old value
                    if old_value is not None and old_value != "" and old_value != "None":
                        stripped_old_value = issue_activity_comment_string(old_value).get("content")
                        if stripped_old_value is not None:
                            self.data["issue_activity"]["old_value"] = stripped_old_value

                    # handling the new value
                    if new_value is not None and new_value != "" and new_value != "None":
                        stripped_new_value = issue_activity_comment_string(new_value).get("content")
                        if stripped_new_value is not None:
                            self.data["issue_activity"]["new_value"] = stripped_new_value

            return self.data

        return await process_data()

    @strawberry.field
    async def is_intake_issue(self) -> bool:
        work_item_id = self.entity_identifier
        if not work_item_id:
            return False

        intake_issue = await cache_notification_intake_id(work_item_id)
        is_intake_issue = intake_issue is not None
        return is_intake_issue

    @strawberry.field
    async def intake_id(self) -> Optional[str]:
        work_item_id = self.entity_identifier
        if not work_item_id:
            return None

        intake_issue = await cache_notification_intake_id(work_item_id)
        if not intake_issue:
            return None

        return str(intake_issue)

    @strawberry.field
    async def is_mentioned_notification(self) -> bool:
        return True if "mentioned" in self.sender.lower() else False

    @strawberry.field
    async def is_epic(self) -> bool:
        work_item_id = self.entity_identifier
        if not work_item_id:
            return False

        is_epic_work_item = await cache_notification_epic_id(work_item_id)
        return is_epic_work_item
