from rest_framework.permissions import BasePermission
from plane.payment.flags.flag import FeatureFlag
from plane.payment.flags.flag_decorator import check_workspace_feature_flag


class FeatureFlagPermission(BasePermission):
    """
    Base permission class to check if a feature flag is enabled for the workspace.
    Subclass this and set the feature_flag attribute.
    """

    feature_flag = None

    def has_permission(self, request, view):
        if self.feature_flag is None:
            return True
        return check_workspace_feature_flag(self.feature_flag, view.kwargs.get("slug"))


class TeamspaceFeatureFlagPermission(FeatureFlagPermission):
    """Permission class for Teamspace feature flag"""

    feature_flag = FeatureFlag.TEAMSPACES
    message = "Payment required. Upgrade your plan to access Teamspaces"


class InitiativesFeatureFlagPermission(FeatureFlagPermission):
    """Permission class for Initiatives feature flag"""

    feature_flag = FeatureFlag.INITIATIVES
    message = "Payment required. Upgrade your plan to access Initiatives"
