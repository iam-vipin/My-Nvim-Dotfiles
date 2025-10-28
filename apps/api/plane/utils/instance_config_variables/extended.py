# OIDC
oidc_config_variables = [
    {
        "key": "OIDC_CLIENT_ID",
        "value": "",
        "category": "AUTHENTICATION",
        "is_encrypted": False,
    },
    {
        "key": "OIDC_CLIENT_SECRET",
        "value": "",
        "category": "AUTHENTICATION",
        "is_encrypted": True,
    },
    {
        "key": "OIDC_TOKEN_URL",
        "value": "",
        "category": "AUTHENTICATION",
        "is_encrypted": False,
    },
    {
        "key": "OIDC_USERINFO_URL",
        "value": "",
        "category": "AUTHENTICATION",
        "is_encrypted": False,
    },
    {
        "key": "OIDC_AUTHORIZE_URL",
        "value": "",
        "category": "AUTHENTICATION",
        "is_encrypted": False,
    },
    {
        "key": "IS_OIDC_ENABLED",
        "value": "0",
        "category": "AUTHENTICATION",
        "is_encrypted": False,
    },
    {
        "key": "OIDC_LOGOUT_URL",
        "value": "",
        "category": "AUTHENTICATION",
        "is_encrypted": False,
    },
    {
        "key": "OIDC_PROVIDER_NAME",
        "value": "",
        "category": "AUTHENTICATION",
        "is_encrypted": False,
    },
]

# SAML
saml_config_variables = [
    {
        "key": "SAML_ENTITY_ID",
        "value": "",
        "category": "AUTHENTICATION",
        "is_encrypted": False,
    },
    {
        "key": "SAML_SSO_URL",
        "value": "",
        "category": "AUTHENTICATION",
        "is_encrypted": False,
    },
    {
        "key": "SAML_CERTIFICATE",
        "value": "",
        "category": "AUTHENTICATION",
        "is_encrypted": True,
    },
    {
        "key": "SAML_LOGOUT_URL",
        "value": "",
        "category": "AUTHENTICATION",
        "is_encrypted": False,
    },
    {
        "key": "IS_SAML_ENABLED",
        "value": "0",
        "category": "AUTHENTICATION",
        "is_encrypted": False,
    },
    {
        "key": "SAML_PROVIDER_NAME",
        "value": "",
        "category": "AUTHENTICATION",
        "is_encrypted": False,
    },
]

# ldap config
ldap_config_variables = []

extended_config_variables = [*oidc_config_variables, *saml_config_variables, *ldap_config_variables]
