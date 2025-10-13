from typing import AsyncGenerator
from typing import Optional

from fastapi import FastAPI
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlmodel.ext.asyncio.session import AsyncSession

from pi import logger
from pi.config import settings

log = logger.getChild(__name__)

# Store the engine in module scope (but initialize in lifespan)
_async_engine = None


async def init_async_db(app: Optional[FastAPI] = None):
    """Initialize the async database engine."""
    global _async_engine

    log.info("Initializing async database engine...")
    _async_engine = create_async_engine(settings.database.async_connection_url(), pool_pre_ping=True, echo=False, future=True)

    # Store engine in app state if FastAPI app is provided
    if app:
        app.state.async_engine = _async_engine

    log.info("Async database engine initialized.")
    return _async_engine


async def close_async_db(app: Optional[FastAPI] = None):
    """Close the async database engine."""
    global _async_engine

    if _async_engine is None:
        return

    log.info("Disposing async database engine...")
    await _async_engine.dispose()
    _async_engine = None
    log.info("Async database engine disposed.")


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    """Get an async database session."""
    global _async_engine

    if _async_engine is None:
        raise RuntimeError("Database engine not initialized. Call init_async_db first.")

    async_session = sessionmaker(_async_engine, class_=AsyncSession, expire_on_commit=False)  # type: ignore[call-overload]

    async with async_session() as session:
        yield session


def get_streaming_db_session():
    """Get a short-lived async database session for streaming DB writes.

    Returns a context manager that yields an AsyncSession.
    Use this for DB writes during long-running streams to avoid holding connections.

    Usage:
        async with get_streaming_db_session() as db:
            await upsert_message_flow_steps(..., db=db)
    """
    global _async_engine

    if _async_engine is None:
        raise RuntimeError("Database engine not initialized. Call init_async_db first.")

    async_session_factory = sessionmaker(_async_engine, class_=AsyncSession, expire_on_commit=False)  # type: ignore[call-overload]
    return async_session_factory()
