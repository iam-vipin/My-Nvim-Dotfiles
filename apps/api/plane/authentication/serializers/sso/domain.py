# Python imports
from rest_framework import serializers

# Module imports
from plane.authentication.adapter.error import AuthenticationException, AUTHENTICATION_ERROR_CODES
from plane.authentication.models.sso import Domain


class DomainSerializer(serializers.Serializer):
    id = serializers.UUIDField(read_only=True)
    domain = serializers.CharField(max_length=255)
    verification_status = serializers.CharField(read_only=True)
    verified_at = serializers.DateTimeField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    verification_token = serializers.CharField(read_only=True)

    def validate_domain(self, value):
        if not value:
            raise AuthenticationException(
                error_code=AUTHENTICATION_ERROR_CODES["DOMAIN_REQUIRED"],
                error_message="DOMAIN_REQUIRED",
                payload={"domain": value},
            )

        # Clean the domain value
        value = value.strip().lower()

        # Check if the domain is already valid with a workspace
        is_verified, domain = Domain.check_domain_verification_status(value)
        if is_verified:
            raise AuthenticationException(
                error_code=AUTHENTICATION_ERROR_CODES["DOMAIN_ALREADY_VERIFIED_FOR_ANOTHER_WORKSPACE"],
                error_message="DOMAIN_ALREADY_VERIFIED_FOR_ANOTHER_WORKSPACE",
                payload={"domain": value},
            )

        # Check if the domain already exists for this workspace
        workspace = self.context.get("workspace")
        if workspace:
            existing_domain = Domain.objects.filter(workspace=workspace, domain=value, deleted_at__isnull=True).first()

            if existing_domain:
                raise AuthenticationException(
                    error_code=AUTHENTICATION_ERROR_CODES["DOMAIN_ALREADY_ASSOCIATED_WITH_WORKSPACE"],
                    error_message="DOMAIN_ALREADY_ASSOCIATED_WITH_WORKSPACE",
                    payload={"domain": value},
                )

        return value

    def create(self, validated_data):
        workspace = self.context.get("workspace")
        if not workspace:
            raise AuthenticationException(
                error_code=AUTHENTICATION_ERROR_CODES["WORKSPACE_NOT_FOUND"],
                error_message="WORKSPACE_NOT_FOUND",
                payload={},
            )
        # Get or create the domain
        domain, created = Domain.get_or_create_domain(validated_data["domain"], workspace.id)
        return domain

    def update(self, instance, validated_data):
        # If you need update functionality, implement it here
        # For now, domains probably shouldn't be updated
        raise NotImplementedError("Domain updates are not supported")

    def to_representation(self, instance):
        """Convert Domain model instance to dict"""
        return {
            "id": str(instance.id),
            "domain": instance.domain,
            "verification_status": instance.verification_status,
            "verified_at": instance.verified_at,
            "created_at": instance.created_at,
            "updated_at": instance.updated_at,
            "verification_token": instance.verification_token,
        }
