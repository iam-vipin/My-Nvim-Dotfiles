from plane.agents.models import AgentRun, AgentRunActivity
from plane.app.serializers.base import BaseSerializer


class AgentRunSerializer(BaseSerializer):
  # not much verification required as this will be triggered from web
    class Meta:
        model = AgentRun
        fields = "__all__"


class AgentRunActivitySerializer(BaseSerializer):
    class Meta:
        model = AgentRunActivity
        fields = "__all__"