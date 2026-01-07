# Django imports
from django.utils import timezone
from django.db.models import Q


def move_activities(apps, activities, activity_name):
    if activity_name == "project_activities":
        model = apps.get_model("ee", "ProjectActivity")
    elif activity_name == "project_member_activities":
        model = apps.get_model("ee", "ProjectMemberActivity")

    activities_to_be_moved = []

    for activity in activities:
        data = dict(
            created_at=activity.created_at,
            updated_at=activity.updated_at,
            deleted_at=activity.deleted_at,
            old_value=activity.old_value,
            new_value=activity.new_value,
            old_identifier=activity.old_identifier,
            new_identifier=activity.new_identifier,
            epoch=activity.epoch,
            actor_id=activity.actor_id,
            created_by_id=activity.created_by_id,
            project_id=activity.project_id,
            updated_by_id=activity.updated_by_id,
            workspace_id=activity.workspace_id,
        )

        if activity_name == "project_activities":
            data.update(
                verb=activity.verb,
                field=activity.field,
                comment=activity.comment,
            )

        elif activity_name == "project_member_activities":
            data.update(
                type=(activity.verb).upper(),
            )

        activities_to_be_moved.append(model(**data))

    model.objects.bulk_create(activities_to_be_moved, batch_size=500, ignore_conflicts=True)

    activities.update(deleted_at=timezone.now())


def move_project_activities_from_workspace_activities(apps):
    WorkspaceActivity = apps.get_model("ee", "WorkspaceActivity")

    project_activities_in_workspace_activity_table = WorkspaceActivity.objects.filter(
        Q(deleted_at__isnull=True, project_id__isnull=False) & ~Q(field="members")
    )

    move_activities(apps, project_activities_in_workspace_activity_table, "project_activities")


def move_project_member_activities_from_workspace_activities(apps):
    WorkspaceActivity = apps.get_model("ee", "WorkspaceActivity")

    project_member_activities_in_workspace_activity = WorkspaceActivity.objects.filter(
        deleted_at__isnull=True, project_id__isnull=False, field="members"
    )

    move_activities(apps, project_member_activities_in_workspace_activity, "project_member_activities")
