# Module imports
from .workspace_project_join import process_workspace_project_invitations


def post_user_auth_workflow(user, is_signup, request):
    # Process workspace project invitations
    process_workspace_project_invitations(user=user)
