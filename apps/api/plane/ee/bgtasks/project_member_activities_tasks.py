# Python imports
import json

# Module imports
from plane.ee.models import ProjectMemberActivity
from plane.db.models import Project, User
from plane.utils.exception_logger import log_exception


# Third Party imports
from celery import shared_task

ROLE_MAPPER = {20: "Admin", 15: "Member", 5: "Guest"}


def remove_project_member_activity(
    requested_data,
    current_instance,
    project_id,
    workspace_id,
    actor_id,
    project_member_activities,
    project_member_id,
    epoch,
):
    current_instance = json.loads(current_instance)

    members = current_instance.get("members", [])

    for member in members:
        member = User.objects.get(id=member)
        project_member_activities.append(
            ProjectMemberActivity(
                actor_id=actor_id,
                type=ProjectMemberActivity.ProjectMemberActivityType.REMOVED.value,
                old_value=member.display_name,
                project_id=project_id,
                workspace_id=workspace_id,
                old_identifier=member.id,
                epoch=epoch,
            )
        )


def leave_project_member_activity(
    requested_data,
    current_instance,
    project_id,
    workspace_id,
    actor_id,
    project_member_activities,
    project_member_id,
    epoch,
):
    current_instance = json.loads(current_instance)

    members = current_instance.get("members", [])

    for member in members:
        member = User.objects.get(id=member)
        project_member_activities.append(
            ProjectMemberActivity(
                actor_id=actor_id,
                type=ProjectMemberActivity.ProjectMemberActivityType.LEFT.value,
                old_value=member.display_name,
                project_id=project_id,
                workspace_id=workspace_id,
                epoch=epoch,
            )
        )


def update_project_member_activity(
    requested_data,
    current_instance,
    project_id,
    workspace_id,
    actor_id,
    project_member_activities,
    project_member_id,
    epoch,
):
    current_instance = json.loads(current_instance)
    requested_data = json.loads(requested_data)

    requested_role = requested_data.get("role", None)
    current_role = current_instance.get("role", None)

    requested_role = int(requested_role)

    if (requested_role and current_role) and (current_role != requested_role):
        project_member_activities.append(
            ProjectMemberActivity(
                actor_id=actor_id,
                workspace_id=workspace_id,
                type=ProjectMemberActivity.ProjectMemberActivityType.ROLE_UPDATED.value,
                old_value=ROLE_MAPPER.get(current_role),
                new_value=ROLE_MAPPER.get(requested_role),
                epoch=epoch,
                project_member_id=project_member_id,
                project_id=project_id,
            )
        )


def join_project_member_activity(
    requested_data,
    current_instance,
    project_id,
    workspace_id,
    actor_id,
    project_member_activities,
    project_member_id,
    epoch,
):
    requested_data = json.loads(requested_data) if requested_data is not None else None

    member_id = requested_data.get("member_id", None)

    if member_id:
        member = User.objects.get(id=member_id)
        project_member_activities.append(
            ProjectMemberActivity(
                actor_id=actor_id,
                type=ProjectMemberActivity.ProjectMemberActivityType.JOINED.value,
                new_value=member.display_name,
                new_identifier=member.id,
                project_id=project_id,
                workspace_id=workspace_id,
                epoch=epoch,
            )
        )


def add_project_member_activity(
    requested_data,
    current_instance,
    project_id,
    workspace_id,
    actor_id,
    project_member_activities,
    project_member_id,
    epoch,
):
    requested_data = json.loads(requested_data) if requested_data is not None else None

    members = requested_data.get("members", [])

    for member in members:
        member = User.objects.get(id=member.get("member_id"))
        project_member_activities.append(
            ProjectMemberActivity(
                actor_id=actor_id,
                type=ProjectMemberActivity.ProjectMemberActivityType.ADDED.value,
                new_value=member.display_name,
                new_identifier=member.id,
                project_id=project_id,
                workspace_id=workspace_id,
                epoch=epoch,
            )
        )


@shared_task
def project_member_activities(
    type,
    requested_data,
    current_instance,
    actor_id,
    project_id,
    epoch,
    subscriber=True,
    origin=None,
    inbox=None,
    project_member_id=None,
):
    try:
        project_member_activities = []

        project = Project.objects.get(pk=project_id)
        workspace_id = project.workspace_id

        ACTIVITY_MAPPER = {
            "project_member.activity.left": leave_project_member_activity,
            "project_member.activity.added": add_project_member_activity,
            "project_member.activity.update": update_project_member_activity,
            "project_member.activity.removed": remove_project_member_activity,
            "project_member.activity.joined": join_project_member_activity,
        }

        func = ACTIVITY_MAPPER.get(type)
        if func is not None:
            func(
                requested_data=requested_data,
                current_instance=current_instance,
                project_id=project_id,
                workspace_id=workspace_id,
                actor_id=actor_id,
                project_member_activities=project_member_activities,
                project_member_id=project_member_id,
                epoch=epoch,
            )

        # Save all the values to database
        ProjectMemberActivity.objects.bulk_create(project_member_activities)

        return
    except Exception as e:
        log_exception(e)
        return
