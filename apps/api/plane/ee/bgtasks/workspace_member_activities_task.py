# Python imports
import json

# Third party imports
from celery import shared_task

# Module imports
from plane.ee.models import WorkspaceMemberActivity
from plane.utils.exception_logger import log_exception


def track_role(
    requested_data, current_instance, workspace_id, actor_id, workspace_member_activities, epoch, workspace_member_id
):
    requested_role = int(requested_data.get("role"))
    current_role = current_instance.get("role")

    ROLE_MAPPER = {20: "Admin", 15: "Member", 5: "Guest"}

    if current_role != requested_role:
        workspace_member_activities.append(
            WorkspaceMemberActivity(
                actor_id=actor_id,
                workspace_id=workspace_id,
                type=WorkspaceMemberActivity.WorkspaceMemberActivityType.ROLE_CHANGED.value,
                old_value=ROLE_MAPPER.get(current_role),
                new_value=ROLE_MAPPER.get(requested_role),
                epoch=epoch,
                workspace_member_id=workspace_member_id,
            )
        )


def update_workspace_member_activity(
    requested_data, current_instance, workspace_id, actor_id, workspace_member_activities, epoch, workspace_member_id
):
    WORKSPACE_MEMBERS_ACTIVITY_MAPPER = {"role": track_role}

    current_instance = json.loads(current_instance) if current_instance is not None else None

    for key in requested_data:
        func = WORKSPACE_MEMBERS_ACTIVITY_MAPPER.get(key)

        if func is not None:
            func(
                requested_data=requested_data,
                current_instance=current_instance,
                workspace_id=workspace_id,
                actor_id=actor_id,
                workspace_member_activities=workspace_member_activities,
                epoch=epoch,
                workspace_member_id=workspace_member_id,
            )


def remove_workspace_member_activity(
    requested_data, current_instance, workspace_id, actor_id, workspace_member_activities, epoch, workspace_member_id
):
    name = requested_data.get("name", None)

    workspace_member_activities.append(
        WorkspaceMemberActivity(
            actor_id=actor_id,
            workspace_id=workspace_id,
            type=WorkspaceMemberActivity.WorkspaceMemberActivityType.REMOVED.value,
            old_value=name,
            epoch=epoch,
        )
    )


def leave_workspace_member_activity(
    requested_data, current_instance, workspace_id, actor_id, workspace_member_activities, epoch, workspace_member_id
):
    workspace_member_activities.append(
        WorkspaceMemberActivity(
            actor_id=actor_id,
            workspace_id=workspace_id,
            type=WorkspaceMemberActivity.WorkspaceMemberActivityType.LEFT.value,
            epoch=epoch,
        )
    )


def invite_workspace_member_activity(
    requested_data, current_instance, workspace_id, actor_id, workspace_member_activities, epoch, workspace_member_id
):
    email = requested_data.get("email", None)

    workspace_member_activities.append(
        WorkspaceMemberActivity(
            actor_id=actor_id,
            workspace_id=workspace_id,
            type=WorkspaceMemberActivity.WorkspaceMemberActivityType.INVITED.value,
            new_value=email,
            epoch=epoch,
        )
    )


def accept_workspace_member_invitation_activity(
    requested_data, current_instance, workspace_id, actor_id, workspace_member_activities, epoch, workspace_member_id
):
    email = requested_data.get("email", None)

    workspace_member_activities.append(
        WorkspaceMemberActivity(
            actor_id=actor_id,
            workspace_id=workspace_id,
            type=WorkspaceMemberActivity.WorkspaceMemberActivityType.INVITATION_DELETED.value,
            old_value=email,
            epoch=epoch,
        )
    )


def join_workspace_member_activity(
    requested_data, current_instance, workspace_id, actor_id, workspace_member_activities, epoch, workspace_member_id
):
    workspace_member_activities.append(
        WorkspaceMemberActivity(
            actor_id=actor_id,
            workspace_id=workspace_id,
            type=WorkspaceMemberActivity.WorkspaceMemberActivityType.JOINED.value,
            epoch=epoch,
        )
    )


def add_workspace_seats_activity(
    requested_data, current_instance, workspace_id, actor_id, workspace_member_activities, epoch, workspace_member_id
):
    quantity = requested_data.get("quantity", None)
    current_available_seats = current_instance.get("current_available_seats", None)

    if quantity:
        workspace_member_activities.append(
            WorkspaceMemberActivity(
                actor_id=actor_id,
                workspace_id=workspace_id,
                type=WorkspaceMemberActivity.WorkspaceMemberActivityType.SEATS_ADDED.value,
                new_value=quantity,
                old_value=current_available_seats,
                epoch=epoch,
            )
        )


def remove_workspace_seats_activity(
    requested_data, current_instance, workspace_id, actor_id, workspace_member_activities, epoch, workspace_member_id
):
    required_seats = requested_data.get("required_seats", None)
    purchased_seats = current_instance.get("purchased_seats", None)

    workspace_member_activities.append(
        WorkspaceMemberActivity(
            actor_id=actor_id,
            workspace_id=workspace_id,
            type=WorkspaceMemberActivity.WorkspaceMemberActivityType.SEATS_REMOVED.value,
            new_value=required_seats,
            old_value=purchased_seats,
            epoch=epoch,
        )
    )


@shared_task
def workspace_members_activity(
    type,
    requested_data,
    current_instance,
    actor_id,
    workspace_id,
    epoch,
    notification=False,
    workspace_member_id=None,
):
    try:
        workspace_member_activities = []

        ACTIVITY_MAPPER = {
            "workspace_member.activity.updated": update_workspace_member_activity,
            "workspace_member.activity.removed": remove_workspace_member_activity,
            "workspace_member.activity.left": leave_workspace_member_activity,
            "workspace_member.activity.invited": invite_workspace_member_activity,
            "workspace_member.activity.invitation_deleted": accept_workspace_member_invitation_activity,
            "workspace_member.activity.joined": join_workspace_member_activity,
            "workspace_member.activity.seats_added": add_workspace_seats_activity,
            "workspace_member.activity.removed_unused_seats": remove_workspace_seats_activity,
        }

        func = ACTIVITY_MAPPER.get(type)

        if func is not None:
            func(
                requested_data=requested_data,
                current_instance=current_instance,
                workspace_id=workspace_id,
                actor_id=actor_id,
                workspace_member_activities=workspace_member_activities,
                epoch=epoch,
                workspace_member_id=workspace_member_id,
            )

        WorkspaceMemberActivity.objects.bulk_create(workspace_member_activities)

        return
    except Exception as e:
        log_exception(e)
        return
