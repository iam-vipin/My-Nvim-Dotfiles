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
from urllib.parse import urlencode, urljoin

from django.contrib.auth import logout

# Django imports
from django.http import HttpResponse, HttpResponseRedirect
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt

# Module imports
from plane.authentication.adapter.error import (
    AUTHENTICATION_ERROR_CODES,
    AuthenticationException,
)
from plane.authentication.adapter.saml import SAMLAdapter
from plane.authentication.utils.host import base_host
from plane.authentication.utils.mobile.login import ValidateAuthToken
from plane.db.models import Workspace, WorkspaceMember, WorkspaceMemberInvite
from plane.license.models import Instance


class MobileSAMLAuthInitiateEndpoint(View):
    def get(self, request):
        request.session["host"] = base_host(request=request, is_app=True)
        invitation_id = request.GET.get("invitation_id")

        try:
            # Check instance configuration
            instance = Instance.objects.first()
            if instance is None or not instance.is_setup_done:
                raise AuthenticationException(
                    error_code=AUTHENTICATION_ERROR_CODES["INSTANCE_NOT_CONFIGURED"],
                    error_message="INSTANCE_NOT_CONFIGURED",
                )

            # Provider configuration
            entity_uri = f"{request.scheme}://{request.get_host()}/auth/mobile/saml/metadata/"
            redirect_uri = f"{request.scheme}://{request.get_host()}/auth/mobile/saml/callback/"
            provider = SAMLAdapter(request=request, entity_uri=entity_uri, redirect_uri=redirect_uri)
            request.session["invitation_id"] = invitation_id
            return_url = provider.get_auth_url()
            return HttpResponseRedirect(return_url)
        except AuthenticationException as e:
            params = e.get_error_dict()
            url = urljoin(base_host(request=request, is_app=True), "m/auth/?" + urlencode(params))
            return HttpResponseRedirect(url)


@method_decorator(csrf_exempt, name="dispatch")
class MobileSAMLCallbackEndpoint(View):
    def post(self, request):
        host = request.session.get("host", "/")
        invitation_id = request.session.get("invitation_id")

        try:
            # Provider configuration
            entity_uri = f"{request.scheme}://{request.get_host()}/auth/mobile/saml/metadata/"
            redirect_uri = f"{request.scheme}://{request.get_host()}/auth/mobile/saml/callback/"
            provider = SAMLAdapter(request=request, entity_uri=entity_uri, redirect_uri=redirect_uri)

            user = provider.authenticate()
            user_id = str(user.id)
            user_email = user.email

            # Login the user and record his device info
            session_token = ValidateAuthToken()
            session_token.set_value(user_id)

            # if invitation_id is present
            if invitation_id != "" and user_email:
                # check the invitation is valid
                invitation = WorkspaceMemberInvite.objects.filter(id=invitation_id, email=user_email).first()

                # if not invitation.responded_at and invitation.accepted:
                if invitation and not invitation.responded_at and invitation.accepted:
                    # check the workspace is valid
                    workspace = Workspace.objects.filter(id=invitation.workspace_id).first()

                    if workspace:
                        invitation.responded_at = timezone.now()
                        invitation.save()

                        # add the user to the workspace
                        workspace_member, _ = WorkspaceMember.objects.get_or_create(
                            workspace_id=invitation.workspace.id,
                            member_id=user_id,
                        )
                        workspace_member.role = invitation.role
                        workspace_member.save()

            # redirect to referrer path
            url = urljoin(host, "m/auth/?" + urlencode({"token": session_token.token}))

            return HttpResponseRedirect(url)
        except AuthenticationException as e:
            url = urljoin(host, "m/auth/?" + urlencode(e.get_error_dict()))
            return HttpResponseRedirect(url)


@method_decorator(csrf_exempt, name="dispatch")
class MobileSAMLLogoutEndpoint(View):
    def get(self, request, *args, **kwargs):
        logout(request=request)
        url = urljoin(base_host(request=request, is_app=True), "m/auth/?" + urlencode({}))
        return HttpResponseRedirect(url)


@method_decorator(csrf_exempt, name="dispatch")
class MobileSAMLMetadataEndpoint(View):
    def get(self, request):
        xml_template = f"""<EntityDescriptor xmlns="urn:oasis:names:tc:SAML:2.0:metadata"
                  entityID="{request.scheme}://{request.get_host()}/auth/mobile/saml/metadata/">
    <SPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
        <AssertionConsumerService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
                                  Location="{request.scheme}://{request.get_host()}/auth/mobile/saml/callback/"
                                  index="1"/>
        <SingleLogoutService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect"
                             Location="{request.scheme}://{request.get_host()}/auth/mobile/saml/logout/"/>
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
