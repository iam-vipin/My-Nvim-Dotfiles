# Python Imports
import logging
from typing import Optional

# Strawberry Imports
from strawberry.types import Info

logger = logging.getLogger("plane.graphql")


def log_graphql_error(message: str, error: Optional[Exception] = None):
    logger.error(message, exc_info=error)
    return


def log_graphql_warning(message: str):
    logger.warning(message)
    return


def log_graphql_info(message: str, info: Optional[Info] = None):
    logger.info(f"Info in GraphQL: {message}", extra={"info": info})
    return
