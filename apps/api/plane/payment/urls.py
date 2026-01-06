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

from django.urls import path

from .views import (
    ProductEndpoint,
    PaymentLinkEndpoint,
    WorkspaceProductEndpoint,
    SubscriptionEndpoint,
    WorkspaceLicenseEndpoint,
    UpgradeSubscriptionEndpoint,
    FeatureFlagProxyEndpoint,
    WorkspaceLicenseRefreshEndpoint,
    WorkspaceLicenseSyncEndpoint,
    WorkspaceFreeTrialEndpoint,
    PurchaseSubscriptionSeatEndpoint,
    RemoveUnusedSeatsEndpoint,
    LicenseDeActivateEndpoint,
    CancelTrialSubscriptionEndpoint,
    ProrationPreviewEndpoint,
    FeatureFlagProxySpaceEndpoint,
    LicenseActivateUploadEndpoint,
    LicenseFileFetchEndpoint,
    # Enterprise License
    EnterpriseLicenseActivateEndpoint,
    EnterpriseLicenseDeactivateEndpoint,
    InstanceLicenseSyncEndpoint,
    EnterpriseModifySeatsEndpoint,
    EnterpriseSubscriptionPortalEndpoint,
    EnterpriseSubscriptionProrationPreviewEndpoint,
    EnterpriseLicenseActivateUploadEndpoint,
    EnterpriseLicenseRemoveUnusedSeatsEndpoint,
    InstanceLicenseEndpoint,
)

urlpatterns = [
    path("workspaces/<str:slug>/products/", ProductEndpoint.as_view(), name="products"),
    path(
        "workspaces/<str:slug>/current-plan/",
        WorkspaceProductEndpoint.as_view(),
        name="products",
    ),
    path(
        "workspaces/<str:slug>/payment-link/",
        PaymentLinkEndpoint.as_view(),
        name="products",
    ),
    path(
        "workspaces/<str:slug>/subscriptions/",
        SubscriptionEndpoint.as_view(),
        name="subscription",
    ),
    path(
        "workspaces/<str:slug>/licenses/",
        WorkspaceLicenseEndpoint.as_view(),
        name="license-activate",
    ),
    path(
        "workspaces/<str:slug>/subscriptions/upgrade/",
        UpgradeSubscriptionEndpoint.as_view(),
        name="subscription",
    ),
    path("workspaces/<str:slug>/flags/", FeatureFlagProxyEndpoint.as_view(), name="flags"),
    path(
        "workspaces/<str:slug>/license-refresh/",
        WorkspaceLicenseRefreshEndpoint.as_view(),
        name="license-refresh",
    ),
    path(
        "workspaces/license-sync/",
        WorkspaceLicenseSyncEndpoint.as_view(),
        name="license-sync",
    ),
    path(
        "workspaces/<str:slug>/trial-subscriptions/",
        WorkspaceFreeTrialEndpoint.as_view(),
        name="trial-subscriptions",
    ),
    path(
        "workspaces/<str:slug>/subscriptions/seats/",
        PurchaseSubscriptionSeatEndpoint.as_view(),
        name="purchase-subscription-seats",
    ),
    path(
        "workspaces/<str:slug>/subscriptions/seats/remove-unused/",
        RemoveUnusedSeatsEndpoint.as_view(),
        name="remove-unused-seats",
    ),
    path(
        "workspaces/<str:slug>/licenses/deactivate/",
        LicenseDeActivateEndpoint.as_view(),
        name="license-deactivate",
    ),
    path(
        "workspaces/<str:slug>/subscriptions/cancel-trial/",
        CancelTrialSubscriptionEndpoint.as_view(),
        name="cancel-trial",
    ),
    path(
        "workspaces/<str:slug>/subscriptions/proration-preview/",
        ProrationPreviewEndpoint.as_view(),
        name="proration-preview",
    ),
    path(
        "workspaces/<str:slug>/licenses/upload/",
        LicenseActivateUploadEndpoint.as_view(),
        name="license-upload",
    ),
    path(
        "workspaces/<str:slug>/license-file/",
        LicenseFileFetchEndpoint.as_view(),
        name="license-fetch",
    ),
    # Enterprise License
    path(
        "instances/admin/licenses/enterprise/activate/",
        EnterpriseLicenseActivateEndpoint.as_view(),
        name="enterprise-license-activate",
    ),
    path(
        "instances/admin/licenses/enterprise/deactivate/",
        EnterpriseLicenseDeactivateEndpoint.as_view(),
        name="enterprise-license-deactivate",
    ),
    path(
        "instances/admin/licenses/enterprise/sync/",
        InstanceLicenseSyncEndpoint.as_view(),
        name="enterprise-license-sync",
    ),
    path(
        "instances/admin/licenses/enterprise/modify-seats/",
        EnterpriseModifySeatsEndpoint.as_view(),
        name="enterprise-license-modify-seats",
    ),
    path(
        "instances/admin/licenses/enterprise/subscription-portal/",
        EnterpriseSubscriptionPortalEndpoint.as_view(),
        name="enterprise-license-subscription-portal",
    ),
    path(
        "instances/admin/licenses/enterprise/subscription-proration-preview/",
        EnterpriseSubscriptionProrationPreviewEndpoint.as_view(),
        name="enterprise-license-subscription-proration-preview",
    ),
    path(
        "instances/admin/licenses/enterprise/upload/",
        EnterpriseLicenseActivateUploadEndpoint.as_view(),
        name="enterprise-license-upload",
    ),
    path(
        "instances/admin/licenses/enterprise/remove-unused-seats/",
        EnterpriseLicenseRemoveUnusedSeatsEndpoint.as_view(),
        name="enterprise-license-remove-unused-seats",
    ),
    path(
        "instances/admin/licenses/enterprise/current-plan/",
        InstanceLicenseEndpoint.as_view(),
        name="enterprise-license-current-plan",
    ),
]


space_urlpatterns = [
    path(
        "anchor/<str:anchor>/flags/",
        FeatureFlagProxySpaceEndpoint.as_view(),
        name="flags",
    ),
]
