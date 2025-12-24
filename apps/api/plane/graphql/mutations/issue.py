import strawberry
from asgiref.sync import sync_to_async

# Strawberry imports
from strawberry.exceptions import GraphQLError
from strawberry.permission import PermissionExtension
from strawberry.scalars import JSON
from strawberry.types import Info

# Module imports
from plane.db.models import IssueSubscriber, IssueUserProperty
from plane.graphql.permissions.project import ProjectBasePermission
from plane.graphql.types.issues.user_property import IssueUserPropertyType
from plane.graphql.utils.workflow import WorkflowStateManager


@sync_to_async
def validate_workflow_state_issue_create(user_id, slug, project_id, state_id):
    workflow_manager = WorkflowStateManager(user_id=user_id, slug=slug, project_id=project_id)
    is_issue_creation_allowed = workflow_manager._validate_issue_creation(state_id=state_id)

    if is_issue_creation_allowed is False:
        message = "You cannot create an issue in this state"
        error_extensions = {"code": "FORBIDDEN", "statusCode": 403}
        raise GraphQLError(message, extensions=error_extensions)

    return is_issue_creation_allowed


@sync_to_async
def validate_workflow_state_issue_update(user_id, slug, project_id, current_state_id, new_state_id):
    workflow_state_manager = WorkflowStateManager(user_id=user_id, slug=slug, project_id=project_id)
    can_state_update = workflow_state_manager._validate_state_transition(
        current_state_id=current_state_id, new_state_id=new_state_id
    )

    if can_state_update is False:
        message = "You cannot update an issue in this state"
        error_extensions = {"code": "FORBIDDEN", "statusCode": 403}
        raise GraphQLError(message, extensions=error_extensions)

    return can_state_update


@strawberry.type
class IssueUserPropertyMutation:
    @strawberry.mutation(extensions=[PermissionExtension(permissions=[ProjectBasePermission()])])
    async def update_user_properties(
        self,
        info: Info,
        slug: str,
        project: strawberry.ID,
        filters: JSON,
        display_filters: JSON,
        display_properties: JSON,
    ) -> IssueUserPropertyType:
        issue_properties = await sync_to_async(IssueUserProperty.objects.get)(
            workspace__slug=slug, project_id=project, user=info.context.user
        )
        issue_properties.filters = filters
        issue_properties.display_filters = display_filters
        issue_properties.display_properties = display_properties

        await sync_to_async(issue_properties.save)()
        return issue_properties


@strawberry.type
class IssueSubscriptionMutation:
    @strawberry.mutation(extensions=[PermissionExtension(permissions=[ProjectBasePermission()])])
    async def subscribeIssue(self, info: Info, slug: str, project: strawberry.ID, issue: strawberry.ID) -> bool:
        issue = await sync_to_async(IssueSubscriber.objects.create)(
            issue_id=issue, project_id=project, subscriber=info.context.user
        )
        return True

    @strawberry.mutation(extensions=[PermissionExtension(permissions=[ProjectBasePermission()])])
    async def unSubscribeIssue(self, info: Info, slug: str, project: strawberry.ID, issue: strawberry.ID) -> bool:
        issue_subscriber = await sync_to_async(IssueSubscriber.objects.get)(
            issue_id=issue,
            subscriber=info.context.user,
            project_id=project,
            workspace__slug=slug,
        )
        await sync_to_async(issue_subscriber.delete)()
        return True
