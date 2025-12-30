# Python imports
import logging

# Third party imports
from rest_framework.response import Response
from rest_framework import status


# Module imports
from plane.authentication.adapter.error import (
    AuthenticationException,
    AUTHENTICATION_ERROR_CODES,
)
from plane.db.models import Workspace
from plane.authentication.serializers.sso import DomainSerializer
from plane.authentication.models.sso import Domain
from plane.utils.exception_logger import log_exception
from plane.authentication.views.sso.base import BaseAPIView
from plane.utils.permissions.workspace import WorkspaceOwnerPermission
from plane.payment.flags.flag_decorator import check_feature_flag
from plane.payment.flags.flag import FeatureFlag


logger = logging.getLogger("plane.authentication")


class DomainEndpoint(BaseAPIView):
    """
    This endpoint allows users to initiate domain verification for a workspace.
    """

    permission_classes = [
        WorkspaceOwnerPermission,
    ]

    @check_feature_flag(FeatureFlag.CLOUD_SSO)
    def post(self, request, slug):
        domain_name = request.data.get("domain", "").strip().lower()

        try:
            # Validate required fields
            if not domain_name:
                logger.warning("Domain is required")
                raise AuthenticationException(
                    error_code=AUTHENTICATION_ERROR_CODES["INVALID_EMAIL"],
                    error_message="DOMAIN_REQUIRED",
                    payload={"domain": domain_name},
                )

            # Get the workspace
            workspace = Workspace.objects.filter(slug=slug).first()
            if not workspace:
                logger.warning(f"Workspace not found: {slug}")
                raise AuthenticationException(
                    error_code=AUTHENTICATION_ERROR_CODES["WORKSPACE_NOT_FOUND"],
                    error_message="WORKSPACE_NOT_FOUND",
                    payload={"workspace_slug": slug},
                )

            # Validate the domain
            serializer = DomainSerializer(data={"domain": domain_name}, context={"workspace": workspace})

            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            logger.warning("Invalid domain")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except AuthenticationException as e:
            logger.error(f"Domain verification initiation failed: {e.error_message}")
            return Response(e.get_error_dict(), status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            log_exception(e)
            return Response(
                {
                    "error": "Something went wrong please try again later",
                    "error_code": "SOMETHING_WENT_WRONG",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @check_feature_flag(FeatureFlag.CLOUD_SSO)
    def get(self, request, slug, pk=None):
        try:
            workspace = Workspace.objects.filter(slug=slug).first()
            if not workspace:
                logger.warning(f"Workspace not found: {slug}")
                raise AuthenticationException(
                    error_code=AUTHENTICATION_ERROR_CODES["WORKSPACE_NOT_FOUND"],
                    error_message="WORKSPACE_NOT_FOUND",
                    payload={"workspace_slug": slug},
                )
            if pk:
                domain = Domain.objects.filter(workspace=workspace, id=pk).first()
                if not domain:
                    logger.warning(f"Domain not found: {pk}")
                    raise AuthenticationException(
                        error_code=AUTHENTICATION_ERROR_CODES["DOMAIN_NOT_FOUND"],
                        error_message="DOMAIN_NOT_FOUND",
                        payload={"domain_id": pk},
                    )

                serializer = DomainSerializer(domain)
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                domains = Domain.objects.filter(workspace=workspace)
                serializer = DomainSerializer(domains, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)
        except AuthenticationException as e:
            logger.error(f"Domain retrieval failed: {e.error_message}")
            return Response(e.get_error_dict(), status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            log_exception(e)
            return Response(
                {
                    "error": "Something went wrong please try again later",
                    "error_code": "SOMETHING_WENT_WRONG",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @check_feature_flag(FeatureFlag.CLOUD_SSO)
    def delete(self, request, slug, pk):
        try:
            workspace = Workspace.objects.filter(slug=slug).first()
            if not workspace:
                logger.warning(f"Workspace not found: {slug}")
                raise AuthenticationException(
                    error_code=AUTHENTICATION_ERROR_CODES["WORKSPACE_NOT_FOUND"],
                    error_message="WORKSPACE_NOT_FOUND",
                    payload={"workspace_slug": slug},
                )

            domain = Domain.objects.filter(workspace=workspace, id=pk).first()
            if not domain:
                logger.warning(f"Domain not found: {pk}")
                raise AuthenticationException(
                    error_code=AUTHENTICATION_ERROR_CODES["DOMAIN_NOT_FOUND"],
                    error_message="DOMAIN_NOT_FOUND",
                    payload={"domain_id": pk},
                )

            domain.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except AuthenticationException as e:
            logger.error(f"Domain deletion failed: {e.error_message}")
            return Response(e.get_error_dict(), status=status.HTTP_400_BAD_REQUEST)


class DomainVerificationEndpoint(BaseAPIView):
    """
    This endpoint allows users to verify a domain for a workspace.
    """

    permission_classes = [
        WorkspaceOwnerPermission,
    ]

    @check_feature_flag(FeatureFlag.CLOUD_SSO)
    def post(self, request, slug, pk):
        try:
            # Check if the user is a workspace admin
            workspace = Workspace.objects.filter(slug=slug).first()
            if not workspace:
                logger.warning(f"Workspace not found: {slug}")
                raise AuthenticationException(
                    error_code=AUTHENTICATION_ERROR_CODES["WORKSPACE_NOT_FOUND"],
                    error_message="WORKSPACE_NOT_FOUND",
                    payload={"workspace_slug": slug},
                )

            domain = Domain.objects.filter(workspace=workspace, id=pk).first()

            # Check if domain is already verified
            if domain.is_verified:
                logger.info(f"Domain already verified: {domain.domain}")
                serializer = DomainSerializer(domain)
                return Response(
                    {
                        "message": "Domain is already verified",
                        "domain": serializer.data,
                    },
                    status=status.HTTP_200_OK,
                )

            # Check if domain verification has failed
            if domain.is_failed:
                logger.warning(f"Domain verification has failed: {domain.domain}")
                raise AuthenticationException(
                    error_code=AUTHENTICATION_ERROR_CODES["DOMAIN_NOT_VERIFIED"],
                    error_message="DOMAIN_VERIFICATION_FAILED",
                    payload={
                        "domain": domain.domain,
                        "detail": "Another workspace has already verified this domain",
                    },
                )

            # Verify the domain
            domain.verify_domain()
            serializer = DomainSerializer(domain)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except AuthenticationException as e:
            logger.warning(f"Domain verification failed: {e.error_message}")
            return Response(e.get_error_dict(), status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            log_exception(e)
            return Response(
                {
                    "error": "Something went wrong please try again later",
                    "error_code": "SOMETHING_WENT_WRONG",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
