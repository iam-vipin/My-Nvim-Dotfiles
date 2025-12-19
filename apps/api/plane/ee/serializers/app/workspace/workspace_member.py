from plane.app.serializers.base import BaseSerializer
from plane.ee.models import WorkspaceMemberActivity
from plane.app.serializers import (
    UserLiteSerializer,
)


class WorkspaceMemberActivitySerializer(BaseSerializer):
    actor_detail = UserLiteSerializer(read_only=True, source="actor")
    workspace_member_detail = UserLiteSerializer(read_only=True, source="workspace_member.member", allow_null=True)

    class Meta:
        model = WorkspaceMemberActivity
        fields = "__all__"
        read_only_fields = ["workspace", "actor", "deleted_at"]
