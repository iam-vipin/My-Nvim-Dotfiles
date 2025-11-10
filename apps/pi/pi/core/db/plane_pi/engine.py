# External imports
# from sqlalchemy.ext.asyncio import AsyncEngine
# from sqlalchemy.ext.asyncio import create_async_engine
from sqlmodel import create_engine

# Module imports
from pi.config import settings

# Sync Engine with type annotation
sync_engine = create_engine(settings.database.connection_url(), pool_pre_ping=True, echo=False)

# Async Engine with type annotation
# async_engine: AsyncEngine = create_async_engine(settings.database.async_connection_url(), pool_pre_ping=True, echo=False, future=True)
