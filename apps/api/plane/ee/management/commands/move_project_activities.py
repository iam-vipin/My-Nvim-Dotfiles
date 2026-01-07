# Django imports
from django.core.management.base import BaseCommand
from django.apps import apps

# Module imports
from plane.ee.utils.move_project_activities import (
    move_project_activities_from_workspace_activities,
    move_project_member_activities_from_workspace_activities,
)


class Command(BaseCommand):
    help = "Move project and project members related activity from WorkspaceActivity to ProjectActivity and ProjectMemberActivity"

    def handle(self, *args, **kwargs):
        try:
            move_project_activities_from_workspace_activities(apps)
            move_project_member_activities_from_workspace_activities(apps)

            self.stdout.write(self.style.SUCCESS("Successfully Moved data from WorkspaceActivity"))
        except Exception as ex:
            self.stdout.write(self.style.ERROR(f"An error occured: {ex}"))
