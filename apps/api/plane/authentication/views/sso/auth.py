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

# Python imports
import logging

# Django imports
from django.http import HttpResponseRedirect
from django.views import View

# Module imports
from plane.authentication.adapter.saml import SAMLAuthCloudAdapter
from plane.authentication.adapter.error import (
    AuthenticationException,
    AUTHENTICATION_ERROR_CODES,
)
from plane.authentication.utils.host import base_host
from plane.authentication.models.sso import IdentityProvider
from plane.authentication.models.sso import Domain
from plane.utils.path_validator import get_safe_redirect_url
from plane.utils.email_validator import email_validator
from plane.authentication.provider.oauth.oidc import OIDCOAuthCloudProvider


logger = logging.getLogger("plane.authentication")


class SSOAuthInitiateEndpoint(View):
    """
    This class is used to initiate the SSO authentication flow in the cloud environment. This endpoint
    checks the email and domain against configured SSO (SAML/OIDC) providers and redirects to the appropriate
    SSO provider's authentication flow.
    """

    def post(self, request):
        email = request.POST.get("email", False)
        next_path = request.POST.get("next_path")

        try:
            # Check if the email is valid
            if not email:
                logger.warning("Email is required")
                raise AuthenticationException(
                    error_code=AUTHENTICATION_ERROR_CODES["EMAIL_REQUIRED"],
                    error_message="EMAIL_REQUIRED",
                    payload={"email": str(email)},
                )

            is_valid, is_verified = email_validator(email, request=request)
            # Check if the email is valid
            if not is_valid:
                logger.warning("Invalid email")
                raise AuthenticationException(
                    error_code=AUTHENTICATION_ERROR_CODES["INVALID_EMAIL"],
                    error_message="INVALID_EMAIL",
                    payload={"email": str(email)},
                )

            # split the email and domain
            email_parts = email.split("@")
            if len(email_parts) != 2:
                logger.warning("Invalid email")
                raise AuthenticationException(
                    error_code=AUTHENTICATION_ERROR_CODES["INVALID_EMAIL"],
                    error_message="INVALID_EMAIL",
                    payload={"email": str(email)},
                )

            email_domain = email_parts[1]

            # Check if the domain is configured with sso
            domain = Domain.objects.filter(domain=email_domain, verification_status=Domain.VERIFIED).first()
            if not domain:
                logger.warning("Domain not configured")
                raise AuthenticationException(
                    error_code=AUTHENTICATION_ERROR_CODES["DOMAIN_NOT_CONFIGURED"],
                    error_message="DOMAIN_NOT_CONFIGURED",
                    payload={"email": str(email)},
                )

            # Get the workspace id
            workspace_id = domain.workspace_id

            # Check if there is a SAML provider configured for the workspace
            if IdentityProvider.is_saml_configured(workspace_id):
                # Get the SAML provider
                provider = SAMLAuthCloudAdapter(request=request, workspace_id=workspace_id)
                # Get the auth url
                return_url = provider.get_auth_url()
                return HttpResponseRedirect(return_url)
            # Check if there is a OIDC provider configured for the workspace
            elif IdentityProvider.is_oidc_configured(workspace_id):
                # Get the OIDC provider
                provider = OIDCOAuthCloudProvider(request=request, workspace_id=workspace_id)
                # Get the auth url
                return_url = provider.get_auth_url()
                return HttpResponseRedirect(return_url)
            # If no SSO provider is configured, raise an error
            else:
                logger.warning("No SSO provider configured")
                raise AuthenticationException(
                    error_code=AUTHENTICATION_ERROR_CODES["SSO_NOT_CONFIGURED"],
                    error_message="SSO_NOT_CONFIGURED",
                    payload={"email": str(email)},
                )
        except AuthenticationException as e:
            params = e.get_error_dict()
            url = get_safe_redirect_url(
                base_url=base_host(request=request) + "/sso", params=params, next_path=next_path
            )
            return HttpResponseRedirect(url)
