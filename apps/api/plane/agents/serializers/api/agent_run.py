# SPDX-FileCopyrightText: 2023-present Plane Software, Inc.
# SPDX-License-Identifier: LicenseRef-Plane-Commercial
#
# Licensed under the Plane Commercial License (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
# https://plane.so/legals/eula
#
# DO NOT remove or modify this notice.
# NOTICE: Proprietary and confidential. Unauthorized use or distribution is prohibited.

from rest_framework import serializers

from plane.agents.models import AgentRun, AgentRunActivity, AgentRunActivityType, AgentRunActivitySignal
from plane.app.serializers.base import BaseSerializer


class AgentRunAPISerializer(BaseSerializer):
    workspace = serializers.PrimaryKeyRelatedField(read_only=True)
    agent_user = serializers.PrimaryKeyRelatedField(read_only=True)
    comment = serializers.PrimaryKeyRelatedField(read_only=True)
    issue = serializers.PrimaryKeyRelatedField(read_only=True)
    creator = serializers.PrimaryKeyRelatedField(read_only=True)
    source_comment = serializers.PrimaryKeyRelatedField(read_only=True)

    def create(self, validated_data):
        workspace = self.context["workspace"]
        agent_user = self.context["agent_user"]
        comment = self.context["comment"]
        issue = self.context["issue"]
        creator = self.context["creator"]
        source_comment = self.context["source_comment"]
        project = self.context["project"]

        validated_data["workspace"] = workspace
        validated_data["agent_user"] = agent_user
        validated_data["comment"] = comment
        validated_data["issue"] = issue
        validated_data["creator"] = creator
        validated_data["source_comment"] = source_comment
        validated_data["project"] = project

        return super().create(validated_data)

    class Meta:
        model = AgentRun
        fields = "__all__"


class AgentRunActivityAPISerializer(BaseSerializer):
    agent_run = serializers.PrimaryKeyRelatedField(read_only=True)
    workspace = serializers.PrimaryKeyRelatedField(read_only=True)
    actor = serializers.PrimaryKeyRelatedField(read_only=True)

    def validate_type(self, activity_type):
        if activity_type == AgentRunActivityType.PROMPT:
            raise serializers.ValidationError("Prompt activity type is not allowed by the agent")
        return activity_type

    def validate_content(self, content):
        content_type = content.get("type")
        # they can only generate these types of activities not prompt
        if content_type == AgentRunActivityType.PROMPT:
            raise serializers.ValidationError("Prompt content type is not allowed by the agent")

        # if the content type is action, it should have a format like
        # {type: "action", action: "create_comment", parameters: {comment: "Hello, world!"}}
        if content_type == AgentRunActivityType.ACTION:
            if (
                not content.get("action")
                or not content.get("parameters")
                or type(content.get("action")) is not str
                or type(content.get("parameters")) is not dict
                # single level of nesting for parameters
                or not all(
                    isinstance(key, str) and isinstance(value, str) for key, value in content.get("parameters").items()
                )
            ):
                raise serializers.ValidationError(
                    """
                    Invalid content format. Must be like 
                    {type: 'action', action: 'create_comment', parameters: {comment: 'Hello, world!'}
                    """
                )
            return content
        # for all other content types, it should have a format like {type: "text", body: "Hello, world!"}
        else:
            if (
                not content.get("body")
                or not content.get("type")
                or type(content.get("type")) is not str
                or content.get("type").lower() != content_type.lower()
            ):
                raise serializers.ValidationError(
                    f"Invalid content format. Must be like {{type: '{content_type}', body: 'Hello, world!'}}"
                )
            return content

    def validate_signal(self, signal):
        if signal == AgentRunActivitySignal.AUTH_REQUEST:
            signal_metadata = self.initial_data.get("signal_metadata", {})
            url = signal_metadata.get("url")
            if not url:
                raise serializers.ValidationError("URL is required for AUTH_REQUEST signal")
            if not url.startswith("https://"):
                raise serializers.ValidationError("URL must start with https://")
        return signal

    def create(self, validated_data):
        agent_run = self.context["agent_run"]
        workspace = self.context["workspace"]
        actor = self.context["actor"]

        validated_data["agent_run"] = agent_run
        validated_data["workspace"] = workspace
        validated_data["actor"] = actor

        return super().create(validated_data)

    class Meta:
        model = AgentRunActivity
        fields = "__all__"


class AgentRunActivityWebhookPayloadSerializer(BaseSerializer):
    class Meta:
        model = AgentRunActivity
        fields = "__all__"


class AgentRunWebhookPayloadSerializer(BaseSerializer):
    class Meta:
        model = AgentRun
        fields = "__all__"
