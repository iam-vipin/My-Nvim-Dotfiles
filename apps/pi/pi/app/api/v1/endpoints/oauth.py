"""
OAuth endpoints for Plane app integration
Handles authorization flow, callback processing, and token management
"""

from datetime import datetime
from uuid import UUID

from fastapi import APIRouter
from fastapi import Depends
from fastapi import Query
from fastapi.responses import JSONResponse
from fastapi.responses import RedirectResponse
from sqlmodel.ext.asyncio.session import AsyncSession

from pi import logger
from pi import settings
from pi.app.api.v1.dependencies import cookie_schema
from pi.app.api.v1.dependencies import is_valid_session
from pi.app.api.v1.helpers.plane_sql_queries import get_workspace_slug
from pi.app.schemas.oauth import OAuthRevokeRequest
from pi.app.schemas.oauth import OAuthRevokeResponse
from pi.app.schemas.oauth import OAuthStatusRequest
from pi.app.schemas.oauth import OAuthStatusResponse
from pi.core.db.plane_pi.lifecycle import get_async_session
from pi.services.actions.oauth_service import PlaneOAuthService

log = logger.getChild("v1/oauth")
router = APIRouter()


@router.get("/init/", tags=["oauth"])
async def browser_initiate_oauth(
    workspace_id: UUID | None = Query(None),
    db: AsyncSession = Depends(get_async_session),
    session: str = Depends(cookie_schema),
):
    auth = await is_valid_session(session)
    if not auth.user:
        return JSONResponse(status_code=401, content={"detail": "Invalid User"})
    user_id = auth.user.id
    oauth_service = PlaneOAuthService()

    # Clean up expired states periodically
    try:
        await oauth_service.cleanup_expired_states(db)
    except Exception as e:
        log.warning(f"Failed to cleanup expired states: {e}")

    # Get workspace slug if workspace_id is provided
    workspace_slug = None
    if workspace_id:
        workspace_slug = await get_workspace_slug(str(workspace_id))

    # same logic as POST /initiate/
    auth_url, state = oauth_service.generate_authorization_url(
        user_id=user_id,
        workspace_id=workspace_id,
        workspace_slug=workspace_slug,
    )
    await oauth_service.save_oauth_state(db, state, user_id, workspace_id, workspace_slug)

    # just redirect the browser
    return RedirectResponse(url=auth_url, status_code=302)


@router.get("/public-init/", tags=["oauth"])
async def public_initiate_oauth(
    user_id: UUID = Query(..., description="User ID requesting authorization"),
    workspace_id: UUID = Query(..., description="Workspace ID to authorize"),
    force_reset: bool = Query(False, description="Force reset of existing OAuth states"),
    db: AsyncSession = Depends(get_async_session),
):
    """
    Public OAuth initiation endpoint that doesn't require session authentication.
    Used when session cookies can't be shared across domains.
    """
    oauth_service = PlaneOAuthService()

    # Clean up expired states periodically
    try:
        await oauth_service.cleanup_expired_states(db)
    except Exception as e:
        log.warning(f"Failed to cleanup expired states: {e}")

    # If force_reset is requested, clear existing states for this user/workspace
    if force_reset:
        try:
            reset_count = await oauth_service.reset_user_oauth_states(db, user_id, workspace_id)
            log.info(f"Force reset: cleared {reset_count} OAuth states for user {user_id}, workspace {workspace_id}")
        except Exception as e:
            log.warning(f"Failed to reset OAuth states: {e}")

    # Get workspace slug for the workspace
    workspace_slug = None
    if workspace_id:
        workspace_slug = await get_workspace_slug(str(workspace_id))

    # Generate authorization URL with state
    auth_url, state = oauth_service.generate_authorization_url(
        user_id=user_id,
        workspace_id=workspace_id,
        workspace_slug=workspace_slug,
    )

    # Save state for verification
    await oauth_service.save_oauth_state(db, state, user_id, workspace_id, workspace_slug)

    log.debug(f"Generated new OAuth state for user {user_id}")

    # Redirect to Plane for authorization
    return RedirectResponse(url=auth_url, status_code=302)


@router.get("/callback/")
async def oauth_callback(
    code: str = Query(..., description="Authorization code from Plane"),
    state: str | None = Query(None, description="State parameter for verification - optional for marketplace install"),
    app_installation_id: str = Query(None, description="App installation ID from Plane"),
    db: AsyncSession = Depends(get_async_session),
):
    """
    Handle OAuth callback from Plane after user authorization.
    Exchanges authorization code for access tokens and stores them.
    """
    try:
        oauth_service = PlaneOAuthService()

        log.debug(f"OAuth callback received - code: {code[:10]}..., state: {state}, app_installation_id: {app_installation_id}")

        oauth_state = None
        if state:
            # Flow initiated via /oauth/initiate/ or /oauth/init/
            oauth_state = await oauth_service.verify_state(db, state)
            if not oauth_state:
                log.error(f"Invalid or expired OAuth state: {state}")
                # Clean up expired states to help with future requests
                cleanup_count = await oauth_service.cleanup_expired_states(db)
                log.info(f"Cleaned up {cleanup_count} expired states")
                return JSONResponse(status_code=400, content={"detail": "Invalid or expired authorization state. Please try initiating OAuth again."})
            else:
                log.debug(f"OAuth state verified successfully: {state}")
        else:
            log.info("Processing OAuth callback without state parameter")

        # Exchange code for tokens
        token_data = await oauth_service.exchange_code_for_tokens(code=code)

        # Get app installation details to fetch workspace info
        workspace_id = oauth_state.workspace_id if oauth_state else None
        workspace_slug = oauth_state.workspace_slug if oauth_state and oauth_state.workspace_slug else "unknown"

        # Ensure we have a valid workspace_id
        if not workspace_id:
            log.error("No workspace_id available from state or installation details")
            raise Exception("Unable to determine workspace for token storage")

        # Determine user ID to associate with token
        user_id_for_token = None
        if oauth_state:
            user_id_for_token = oauth_state.user_id

        if not user_id_for_token:
            log.error("Unable to determine user_id for token storage")
            raise Exception("user_id required for token storage")

        # Save tokens to database
        await oauth_service.save_tokens(
            db=db,
            user_id=user_id_for_token,
            workspace_id=workspace_id,
            workspace_slug=workspace_slug,
            token_data=token_data,
            app_installation_id=app_installation_id,
            app_bot_user_id=None,
        )

        # Mark state as used only after successful completion
        if oauth_state:
            await oauth_service.mark_state_as_used(db, oauth_state)

        log.info(
            "OAuth completed successfully for user %s, workspace %s",
            str(user_id_for_token),
            workspace_slug,
        )

        # Determine redirect URL based on stored context
        if oauth_state and oauth_state.chat_id:
            # Include message_token in redirect URL for frontend to use with stream-answer
            message_token_param = ""
            if oauth_state.message_token:
                message_token_param = f"&message_token={oauth_state.message_token}"

                # Update the MessageFlowStep to mark OAuth as complete
                try:
                    from sqlalchemy import text

                    # Update the oauth_completed column to mark OAuth as complete
                    update_stmt = text("""
                        UPDATE message_flow_steps
                        SET oauth_completed = true, oauth_completed_at = :timestamp
                        WHERE message_id = :message_id AND tool_name = 'QUEUE'
                    """)
                    await db.execute(update_stmt, {"message_id": str(oauth_state.message_token), "timestamp": datetime.utcnow()})
                    await db.commit()
                    log.info(f"Updated MessageFlowStep {oauth_state.message_token} to mark OAuth as complete")
                except Exception as e:
                    log.warning(f"Failed to update MessageFlowStep OAuth status: {e}")
                    # Don't fail the OAuth flow if this update fails

            # Sidebar open redirect
            if getattr(oauth_state, "pi_sidebar_open", False) and oauth_state.sidebar_open_url:
                # Build sidebar redirect URL
                sidebar_url = oauth_state.sidebar_open_url
                chat_id = oauth_state.chat_id
                redirect_url = (
                    f"{settings.plane_api.FRONTEND_URL}/{sidebar_url}/?chat_id={chat_id}{message_token_param}&pi_sidebar_open=true&oauth_success=true"  # noqa: E501
                )
            # Project chat redirect
            elif getattr(oauth_state, "is_project_chat", False):
                redirect_url = f"{settings.plane_api.FRONTEND_URL}/{workspace_slug}/projects/pi-chat/{oauth_state.chat_id}/?oauth_success=true{message_token_param}"  # noqa: E501
            # Default chat redirect
            else:
                redirect_url = (
                    f"{settings.plane_api.FRONTEND_URL}/{workspace_slug}/pi-chat/{oauth_state.chat_id}/?oauth_success=true{message_token_param}"
                )
        else:
            # Fallback to default success page
            redirect_url = f"{settings.plane_api.FRONTEND_URL}?oauth_success=true&workspace={workspace_slug}"

        return RedirectResponse(url=redirect_url, status_code=302)

    except Exception as e:
        log.error(f"Error processing OAuth callback: {e!s}")
        # Redirect to frontend with error
        frontend_url = settings.plane_api.FRONTEND_URL
        redirect_url = f"{frontend_url}?oauth_error=true&message=authorization_failed"
        return RedirectResponse(url=redirect_url, status_code=302)


@router.post("/status/", response_model=OAuthStatusResponse)
async def check_oauth_status(
    data: OAuthStatusRequest,
    db: AsyncSession = Depends(get_async_session),
    session: str = Depends(cookie_schema),
):
    """
    Check OAuth authorization status for a specific workspace.
    Returns whether user has valid authorization and token details.
    """
    try:
        auth = await is_valid_session(session)
        if not auth.user:
            return JSONResponse(status_code=401, content={"detail": "Invalid User"})
        user_id = auth.user.id
    except Exception as e:
        log.error(f"Error validating session: {e!s}")
        return JSONResponse(status_code=401, content={"detail": "Invalid Session"})

    try:
        oauth_service = PlaneOAuthService()

        # Check if user has valid token for workspace
        access_token = await oauth_service.get_valid_token(db=db, user_id=user_id, workspace_id=data.workspace_id)

        if access_token:
            # Get token details for expiry info
            from sqlmodel import select

            from pi.app.models.oauth import PlaneOAuthToken

            result = await db.execute(
                select(PlaneOAuthToken).where(
                    PlaneOAuthToken.user_id == user_id, PlaneOAuthToken.workspace_id == data.workspace_id, PlaneOAuthToken.is_active is True
                )
            )
            oauth_token = result.scalar_one_or_none()

            return OAuthStatusResponse(
                is_authorized=True,
                workspace_slug=oauth_token.workspace_slug if oauth_token else None,
                expires_at=oauth_token.expires_at.isoformat() if oauth_token else None,
            )
        else:
            return OAuthStatusResponse(is_authorized=False, workspace_slug=None, expires_at=None)

    except Exception as e:
        log.error(f"Error checking OAuth status: {e!s}")
        return JSONResponse(status_code=500, content={"detail": "Failed to check authorization status"})


@router.post("/revoke/", response_model=OAuthRevokeResponse)
async def revoke_oauth_authorization(
    data: OAuthRevokeRequest,
    db: AsyncSession = Depends(get_async_session),
    session: str = Depends(cookie_schema),
):
    """
    Revoke OAuth authorization for a specific workspace.
    Deactivates stored tokens and prevents further API access.
    """
    try:
        auth = await is_valid_session(session)
        if not auth.user:
            return JSONResponse(status_code=401, content={"detail": "Invalid User"})
        user_id = auth.user.id
    except Exception as e:
        log.error(f"Error validating session: {e!s}")
        return JSONResponse(status_code=401, content={"detail": "Invalid Session"})

    try:
        oauth_service = PlaneOAuthService()

        # Revoke token
        success = await oauth_service.revoke_token(db=db, user_id=user_id, workspace_id=data.workspace_id)

        if success:
            log.info(f"OAuth authorization revoked for user {user_id}, workspace {data.workspace_id}")
            return OAuthRevokeResponse(success=True, message="Authorization revoked successfully")
        else:
            return OAuthRevokeResponse(success=False, message="No active authorization found for this workspace")

    except Exception as e:
        log.error(f"Error revoking OAuth authorization: {e!s}")
        return JSONResponse(status_code=500, content={"detail": "Failed to revoke authorization"})


@router.get("/workspaces/")
async def list_authorized_workspaces(
    db: AsyncSession = Depends(get_async_session),
    session: str = Depends(cookie_schema),
):
    """
    List all workspaces the user has authorized access to.
    Returns workspace details and token status.
    """
    try:
        auth = await is_valid_session(session)
        if not auth.user:
            return JSONResponse(status_code=401, content={"detail": "Invalid User"})
        user_id = auth.user.id
    except Exception as e:
        log.error(f"Error validating session: {e!s}")
        return JSONResponse(status_code=401, content={"detail": "Invalid Session"})

    try:
        from sqlmodel import select

        from pi.app.models.oauth import PlaneOAuthToken

        # Get all active tokens for user
        result = await db.execute(select(PlaneOAuthToken).where(PlaneOAuthToken.user_id == user_id, PlaneOAuthToken.is_active is True))
        tokens = result.scalars().all()

        workspaces = []
        for token in tokens:
            workspaces.append({
                "workspace_id": str(token.workspace_id),
                "workspace_slug": token.workspace_slug,
                "expires_at": token.expires_at.isoformat(),
                "needs_refresh": token.needs_refresh(),
                "is_expired": token.is_expired(),
            })

        return JSONResponse(content={"workspaces": workspaces})

    except Exception as e:
        log.error(f"Error listing authorized workspaces: {e!s}")
        return JSONResponse(status_code=500, content={"detail": "Failed to list authorized workspaces"})


@router.post("/reset-states/")
async def reset_oauth_states(
    user_id: UUID = Query(..., description="User ID to reset states for"),
    workspace_id: UUID = Query(None, description="Workspace ID to reset (optional - if not provided, resets all user states)"),
    db: AsyncSession = Depends(get_async_session),
):
    """
    Reset OAuth states for a user to allow fresh authorization attempts.
    This endpoint can be used when users are stuck with invalid/expired state errors.
    """
    try:
        oauth_service = PlaneOAuthService()

        # Reset states for the user
        reset_count = await oauth_service.reset_user_oauth_states(db, user_id, workspace_id)

        # Also cleanup expired states
        cleanup_count = await oauth_service.cleanup_expired_states(db)

        message = f"Reset {reset_count} OAuth states for user {user_id}"
        if workspace_id:
            message += f" and workspace {workspace_id}"
        message += f". Cleaned up {cleanup_count} expired states."

        log.info(message)

        return JSONResponse(content={"success": True, "message": message, "reset_count": reset_count, "cleanup_count": cleanup_count})

    except Exception as e:
        log.error(f"Error resetting OAuth states: {e!s}")
        return JSONResponse(status_code=500, content={"detail": "Failed to reset OAuth states"})


@router.get("/authorize/{encoded_params}", tags=["oauth"])
async def clean_oauth_init(
    encoded_params: str,
    db: AsyncSession = Depends(get_async_session),
):
    """
    Clean OAuth initiation endpoint with encrypted parameters.
    This replaces the ugly URL with a clean, encrypted one.
    """
    try:
        from pi.services.actions.oauth_url_encoder import OAuthUrlEncoder

        # Decode the parameters
        oauth_encoder = OAuthUrlEncoder()
        params = oauth_encoder.decode_oauth_params(encoded_params)

        # Extract required parameters
        user_id = UUID(params["user_id"])
        workspace_id = UUID(params["workspace_id"])
        chat_id = params.get("chat_id")
        message_token = params.get("message_token")
        is_project_chat = params.get("is_project_chat", "false").lower() == "true"
        project_id = params.get("project_id")
        pi_sidebar_open = params.get("pi_sidebar_open", "false").lower() == "true"
        sidebar_open_url = params.get("sidebar_open_url")

        oauth_service = PlaneOAuthService()

        # Clean up expired states periodically
        try:
            await oauth_service.cleanup_expired_states(db)
        except Exception as e:
            log.warning(f"Failed to cleanup expired states: {e}")

        # Get workspace slug for the workspace
        workspace_slug = None
        if workspace_id:
            workspace_slug = await get_workspace_slug(str(workspace_id))

        # Generate authorization URL with state
        auth_url, state = oauth_service.generate_authorization_url(
            user_id=user_id,
            workspace_id=workspace_id,
            workspace_slug=workspace_slug,
        )

        # Save state for verification with additional context
        await oauth_service.save_oauth_state(
            db,
            state,
            user_id,
            workspace_id,
            workspace_slug,
            chat_id=chat_id,
            message_token=message_token,
            is_project_chat=is_project_chat,
            project_id=project_id,
            pi_sidebar_open=pi_sidebar_open,
            sidebar_open_url=sidebar_open_url,
        )

        log.debug(f"Generated new OAuth state for user {user_id}")

        # Redirect to Plane for authorization
        return RedirectResponse(url=auth_url, status_code=302)

    except Exception as e:
        log.error(f"Error processing clean OAuth init: {e}")
        # Redirect to frontend with error
        frontend_url = settings.plane_api.FRONTEND_URL
        redirect_url = f"{frontend_url}?oauth_error=true&message=invalid_parameters"
        return RedirectResponse(url=redirect_url, status_code=302)
