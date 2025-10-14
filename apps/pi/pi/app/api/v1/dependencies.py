import asyncio
from typing import Annotated

import httpx
from fastapi import Header
from fastapi import HTTPException
from fastapi.security import APIKeyCookie
from fastapi.security import HTTPAuthorizationCredentials
from fastapi.security import HTTPBearer
from pydantic import ValidationError
from starlette.status import HTTP_400_BAD_REQUEST
from starlette.status import HTTP_401_UNAUTHORIZED
from starlette.status import HTTP_500_INTERNAL_SERVER_ERROR
from starlette.status import HTTP_503_SERVICE_UNAVAILABLE

from pi import logger
from pi import settings
from pi.app.schemas.auth import AuthResponse

log = logger.getChild("dependencies")
session_check_url = settings.plane_api.SESSION_CHECK
cookie_schema = APIKeyCookie(name=settings.plane_api.SESSION_COOKIE_NAME)
jwt_schema = HTTPBearer()


async def is_valid_session(session: str) -> AuthResponse:
    if not session:
        log.error("Missing or empty session cookie")
        raise HTTPException(status_code=400, detail="Missing or invalid session cookie")

    max_retries = 3
    delay = 0.2  # seconds
    for attempt in range(1, max_retries + 1):
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(session_check_url, cookies={settings.plane_api.SESSION_COOKIE_NAME: session}, timeout=5.0)
                response.raise_for_status()
                data = response.json()

            try:
                auth = AuthResponse(**data)
            except ValidationError as e:
                log.error(f"Invalid response structure: {e}")
                raise HTTPException(status_code=HTTP_500_INTERNAL_SERVER_ERROR, detail="Invalid response structure from session service")

            if auth.is_authenticated:
                return auth
            log.error("User is not authenticated")
            raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="User is not authenticated")

        except httpx.RequestError as e:
            log.error(f"Request failed (attempt {attempt}): {e}")
            if attempt < max_retries:
                await asyncio.sleep(delay)
                continue
            raise HTTPException(status_code=HTTP_503_SERVICE_UNAVAILABLE, detail="Session validation service unavailable")

        except httpx.HTTPStatusError as e:
            if e.response.status_code == 401:
                log.error(f"Unauthorized session: {e}")
                raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="Invalid or expired session")
            log.error(f"HTTP error checking session: {e}")
            raise HTTPException(status_code=e.response.status_code, detail="Error checking session")

        except Exception as e:
            log.error(f"Unexpected error checking session: {e!s}")
            raise HTTPException(status_code=HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")
    raise HTTPException(status_code=HTTP_503_SERVICE_UNAVAILABLE, detail="Session validation service unavailable")


async def verify_internal_secret_key(x_internal_api_secret: Annotated[str | None, Header(description="Api Secret for internal endpoints")] = None):
    """Verify the Internal Api Secret for protected operations."""
    expected_key = settings.server.PLANE_PI_INTERNAL_API_SECRET

    if not expected_key:
        log.error("Internal Api Secret not configured on server")
        raise HTTPException(
            status_code=HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal Api Secret not configured on server",
        )

    if not x_internal_api_secret:
        log.error("Missing Internal Api Secret header")
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED,
            detail="Missing X-Internal-Secret-Key header",
        )

    if x_internal_api_secret != expected_key:
        log.error("Invalid Internal Api Secret")
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED,
            detail="Invalid Internal Api Secret",
        )

    return True


async def is_jwt_valid(token: str) -> AuthResponse:
    if not token:
        log.error("Missing or empty JWT token")
        raise HTTPException(
            status_code=HTTP_400_BAD_REQUEST,
            detail="Missing or invalid JWT token",
        )

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(
                session_check_url,
                headers={"Authorization": f"Bearer {token}"},
            )
            resp.raise_for_status()
            data = resp.json()

        try:
            auth = AuthResponse(**data)

        except ValidationError as e:
            log.error(f"Invalid response structure: {e}")
            raise HTTPException(
                status_code=HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Invalid response structure from JWT validation service",
            )

        if auth.is_authenticated:
            return auth

        log.error("User is not authenticated (JWT check)")
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED,
            detail="User is not authenticated",
        )

    # Network / service-level failures
    except httpx.RequestError as e:
        log.error(f"JWT validation request failed: {e}")
        raise HTTPException(
            status_code=HTTP_503_SERVICE_UNAVAILABLE,
            detail="JWT validation service unavailable",
        )

    # 4xx/5xx returned by the remote service
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 401:
            log.error("Invalid or expired JWT")
            raise HTTPException(
                status_code=HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired JWT",
            )
        log.error(f"HTTP error checking JWT: {e}")
        raise HTTPException(
            status_code=e.response.status_code,
            detail="Error checking JWT",
        )

    except HTTPException as e:
        raise e

    # Anything truly unexpected
    except Exception as e:
        log.error(f"Unexpected error checking JWT: {e!s}")
        raise HTTPException(
            status_code=HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )


async def validate_jwt_token(credentials: HTTPAuthorizationCredentials | None) -> AuthResponse:
    """
    Validate JWT token from HTTPAuthorizationCredentials.
    Handles null checks and proper error handling.
    Raises HTTPException for compatibility with endpoint error handling.
    """
    if not credentials:
        log.error("Missing JWT token credentials")
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="Missing Authorization header")

    if not credentials.credentials:
        log.error("Empty JWT token in credentials")
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="Empty JWT token")

    return await is_jwt_valid(credentials.credentials)
