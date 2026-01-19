# Authentication Module

Comprehensive authentication and authorization framework.

## Purpose

Handles multi-factor authentication, OAuth, SSO, session management, and API access control.

## Directory Structure

```
authentication/
├── adapter/                     # Auth adapters
│   ├── base.py                  # Base adapter class
│   ├── oauth.py                 # OAuth 2.0 adapter
│   ├── saml.py                  # SAML 2.0 adapter
│   ├── credential.py            # Credential-based auth
│   ├── error.py                 # Error codes (70+)
│   └── exception.py             # Custom exceptions
├── middleware/
│   └── session.py               # Custom session middleware
├── models/
│   ├── oauth.py                 # OAuth models
│   └── sso.py                   # SSO models
├── permissions/
│   └── oauth.py                 # OAuth workspace permissions
├── provider/
│   ├── oauth/                   # OAuth providers
│   │   ├── github.py
│   │   ├── google.py
│   │   ├── gitlab.py
│   │   ├── gitea.py
│   │   └── oidc.py
│   └── credentials/             # Credential providers
│       ├── email.py
│       ├── magic_code.py
│       └── ldap.py
├── serializers/
│   ├── oauth/                   # OAuth serializers
│   └── sso/                     # SSO serializers
├── views/
│   ├── app/                     # App auth endpoints (16 files)
│   ├── space/                   # Space auth endpoints (9 files)
│   ├── oauth/                   # OAuth management
│   └── sso/                     # SSO management
├── bgtasks/                     # Background tasks
├── utils/                       # Auth utilities
├── urls.py                      # URL routing (~337 lines)
└── rate_limit.py                # Rate limiting
```

## Authentication Methods

| Method         | Provider                    |
| -------------- | --------------------------- |
| Email/Password | `credentials/email.py`      |
| Magic Link     | `credentials/magic_code.py` |
| LDAP           | `credentials/ldap.py`       |
| GitHub OAuth   | `oauth/github.py`           |
| Google OAuth   | `oauth/google.py`           |
| GitLab OAuth   | `oauth/gitlab.py`           |
| OIDC           | `oauth/oidc.py`             |
| SAML           | `adapter/saml.py`           |

## OAuth Models

- **Application**: Third-party OAuth apps with marketplace fields
- **AccessToken**: OAuth 2.0 access tokens
- **RefreshToken**: Token rotation
- **Grant**: Authorization code grants
- **IDToken**: OpenID Connect tokens
- **WorkspaceAppInstallation**: App installation per workspace

## SSO Models

- **Domain**: Workspace domain with DNS verification
- **IdentityProvider**: OIDC/SAML provider configuration
- **IdentityProviderDomain**: Provider-domain mapping

## Rate Limiting

| Throttle                  | Rate        |
| ------------------------- | ----------- |
| AuthenticationThrottle    | 30/minute   |
| EmailVerificationThrottle | 3/hour      |
| OAuthTokenRateThrottle    | 5000/minute |

## Key Endpoints

```
/sign-in/                    # Email password signin
/sign-up/                    # Email password signup
/google/callback/            # Google OAuth
/github/callback/            # GitHub OAuth
/oidc/, /oidc/callback/      # OIDC flows
/saml/, /saml/callback/      # SAML flows
/ldap/                       # LDAP auth
/magic-generate/             # Magic link generation
/sso/workspaces/<slug>/providers/  # SSO management
```

## Error Handling

70+ error codes in `AuthenticationException`:

- Global: INSTANCE_NOT_CONFIGURED, INVALID_EMAIL
- Sign Up/In: USER_ALREADY_EXIST, AUTHENTICATION_FAILED
- OAuth: GOOGLE_NOT_CONFIGURED, GITHUB_NOT_CONFIGURED
- SSO: DOMAIN_NOT_VERIFIED, OIDC_PROVIDER_ERROR
