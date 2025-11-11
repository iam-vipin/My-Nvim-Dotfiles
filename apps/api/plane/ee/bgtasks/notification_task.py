# Python imports
import json


# Module imports
from plane.ee.models import Initiative, Teamspace
from plane.db.models import Notification, EmailNotificationLog, UserNotificationPreference
from plane.db.models.notification import EntityName


def workspace_notifications(workspace_id, entity_name, entity_identifier, actor_id, activities_created):
    """
    Create notifications for workspace level features, such as initiative, teamspaces, etc.
    """
    try:
        # Check for user notification preference

        # Parse the activities if it's a string
        activities = json.loads(activities_created) if activities_created is not None else []

        if entity_name == EntityName.TEAMSPACE.value:
            entity = Teamspace.objects.prefetch_related("members").get(id=entity_identifier, workspace_id=workspace_id)
            receivers = [entity_member.member_id for entity_member in entity.members.all()]

        elif entity_name == EntityName.INITIATIVE.value:
            entity = Initiative.objects.get(id=entity_identifier, workspace_id=workspace_id)
            receivers = [entity.lead_id] if entity.lead_id else []

        bulk_notifications = []
        bulk_email_notifications = []

        for receiver_id in receivers:
            for activity in activities:
                # User notification preference check
                try:
                    preference = UserNotificationPreference.objects.get(user_id=receiver_id)
                except UserNotificationPreference.DoesNotExist:
                    continue

                # Do not send notification for descriiption changes
                if activity.get("field") == "description":
                    continue

                send_email = False

                if activity.get("field") == "comment" and preference.comment:
                    send_email = True
                elif activity.get("field") == "page":
                    send_email = True
                elif preference.property_change:
                    send_email = True
                else:
                    send_email = False

                if send_email:
                    bulk_notifications.append(
                        Notification(
                            workspace_id=workspace_id,
                            entity_identifier=entity_identifier,
                            entity_name=entity_name,
                            title=activity.get("comment"),
                            triggered_by_id=actor_id,
                            receiver_id=receiver_id,
                            data=build_data(entity, entity_name, activity),
                        )
                    )

                    bulk_email_notifications.append(
                        EmailNotificationLog(
                            triggered_by_id=actor_id,
                            receiver_id=receiver_id,
                            entity_identifier=entity_identifier,
                            entity_name=entity_name,
                            data=build_data(entity, entity_name, activity),
                        )
                    )

        Notification.objects.bulk_create(bulk_notifications, batch_size=100, ignore_conflicts=True)
        EmailNotificationLog.objects.bulk_create(bulk_email_notifications, batch_size=100, ignore_conflicts=True)

    except Exception as e:
        print(e)
        return


def build_data(entity, entity_name, activity):
    return {
        entity_name: {"id": str(entity.id), "name": entity.name, "logo_props": entity.logo_props},
        f"{entity_name}_activity": {
            "id": str(activity.get("id", "")),
            "verb": str(activity.get("verb", "")),
            "field": str(activity.get("field", "")),
            "actor": str(activity.get("actor", "")),
            "new_value": str(activity.get("new_value", "")),
            "old_value": str(activity.get("old_value", "")),
            "old_identifier": (str(activity.get("old_identifier")) if activity.get("old_identifier") else None),
            "new_identifier": (str(activity.get("new_identifier")) if activity.get("new_identifier") else None),
            "activity_time": activity.get("created_at"),
        },
    }
