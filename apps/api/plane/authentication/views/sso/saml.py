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
from django.http import HttpResponseRedirect, HttpResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.contrib.auth import logout

# Module imports
from plane.authentication.adapter.saml import SAMLAuthCloudAdapter
from plane.authentication.utils.login import user_login
from plane.authentication.utils.workspace_project_join import (
    process_workspace_project_invitations,
)
from plane.authentication.utils.redirection_path import get_redirection_path
from plane.authentication.adapter.error import (
    AuthenticationException,
    AUTHENTICATION_ERROR_CODES,
)
from plane.authentication.utils.host import base_host
from plane.authentication.models.sso import IdentityProvider
from plane.db.models import Workspace
from plane.utils.path_validator import get_safe_redirect_url


logger = logging.getLogger("plane.authentication")


@method_decorator(csrf_exempt, name="dispatch")
class SAMLAuthCloudCallbackEndpoint(View):
    def post(self, request, workspace_id):
        try:
            provider = SAMLAuthCloudAdapter(request=request, workspace_id=workspace_id)
            user = provider.authenticate()
            # Login the user and record his device info
            user_login(request=request, user=user)
            # Process workspace and project invitations
            process_workspace_project_invitations(user=user)
            # Get the redirection path
            path = get_redirection_path(user=user)
            # redirect to referer path
            url = get_safe_redirect_url(base_url=base_host(request=request), next_path=path)
            return HttpResponseRedirect(url)
        except AuthenticationException as e:
            params = e.get_error_dict()
            url = get_safe_redirect_url(base_url=base_host(request=request) + "/sso", params=params)
            return HttpResponseRedirect(url)


@method_decorator(csrf_exempt, name="dispatch")
class SAMLAuthCloudLogoutEndpoint(View):
    def get(self, request, workspace_id):
        logout(request=request)
        return HttpResponseRedirect(base_host(request=request))


@method_decorator(csrf_exempt, name="dispatch")
class SAMLAuthCloudMetadataEndpoint(View):
    """
    This class is used to generate the SAML metadata for the cloud environment.
    """

    def get(self, request, workspace_id):
        # Get the workspace
        # Check if the workspace exists and has a SAML provider configured
        workspace = Workspace.objects.filter(id=workspace_id).first()
        if not workspace:
            raise AuthenticationException(
                error_code=AUTHENTICATION_ERROR_CODES["WORKSPACE_NOT_FOUND"],
                error_message="WORKSPACE_NOT_FOUND",
                payload={"workspace_id": str(workspace_id)},
            )
        if not IdentityProvider.is_saml_configured(workspace_id):
            logger.warning(
                "SAML not configured",
                extra={
                    "workspace_id": str(workspace_id),
                },
            )
            raise AuthenticationException(
                error_code=AUTHENTICATION_ERROR_CODES["SAML_NOT_CONFIGURED"],
                error_message="SAML_NOT_CONFIGURED",
                payload={"workspace_id": str(workspace_id)},
            )

        xml_template = f"""<EntityDescriptor xmlns="urn:oasis:names:tc:SAML:2.0:metadata"
                  entityID="{request.scheme}://{request.get_host()}/auth/saml/metadata/{workspace_id}/">
    <SPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
        <AssertionConsumerService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
                                  Location="{request.scheme}://{request.get_host()}/auth/saml/callback/{workspace_id}/"
                                  index="1"/>
        <SingleLogoutService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect"
                             Location="{request.scheme}://{request.get_host()}/auth/saml/logout/{workspace_id}/"/>
        <NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress</NameIDFormat>
        <AttributeConsumingService index="1">
            <ServiceName xml:lang="en">Plane</ServiceName>
            <RequestedAttribute Name="user.firstName"
                                FriendlyName="first_name"
                                NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:basic"
                                isRequired="false"/>
            <RequestedAttribute Name="user.lastName"
                                FriendlyName="last_name"
                                NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:basic"
                                isRequired="false"/>
            <RequestedAttribute Name="user.email"
                                FriendlyName="email"
                                NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:basic"
                                isRequired="true"/>
        </AttributeConsumingService>
    </SPSSODescriptor>
</EntityDescriptor>
"""
        return HttpResponse(xml_template, content_type="application/xml")
