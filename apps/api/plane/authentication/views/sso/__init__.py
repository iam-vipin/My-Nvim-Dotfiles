from .provider import IdentityProviderEndpoint
from .domain import DomainEndpoint, DomainVerificationEndpoint
from .oidc import OIDCAuthCloudCallbackEndpoint
from .saml import (
    SAMLAuthCloudMetadataEndpoint,
    SAMLAuthCloudCallbackEndpoint,
    SAMLAuthCloudLogoutEndpoint,
)
from .auth import SSOAuthInitiateEndpoint

__all__ = [
    "SSOAuthInitiateEndpoint",
    "IdentityProviderEndpoint",
    "DomainEndpoint",
    "DomainVerificationEndpoint",
    # OIDC
    "OIDCAuthCloudCallbackEndpoint",
    # SAML
    "SAMLAuthCloudMetadataEndpoint",
    "SAMLAuthCloudCallbackEndpoint",
    "SAMLAuthCloudLogoutEndpoint",
]
