from typing import Any
from typing import List
from typing import Optional
from typing import Tuple
from typing import TypeVar

from pydantic import BaseModel
from sqlalchemy import desc
from sqlalchemy.sql import Select
from sqlmodel import SQLModel

T = TypeVar("T", bound=SQLModel)


class CursorInfo(BaseModel):
    """Internal cursor information for pagination."""

    per_page: int
    page: int
    offset: int


# Import PaginationRequest and PaginationResponse from chat schema to avoid circular imports
# These are defined in pi.app.schemas.chat


def create_pagination_response(
    items: List[Any], cursor_info: CursorInfo, has_next: bool, has_prev: bool, total_results: Optional[int] = None
) -> Tuple[List[Any], Any]:
    """Create a pagination response with page-based cursors."""
    count = len(items)

    # Calculate total pages if we have total results
    total_pages = None
    if total_results is not None:
        total_pages = (total_results + cursor_info.per_page - 1) // cursor_info.per_page

    # Generate next cursor (0-based page number)
    next_cursor = None
    if has_next:
        next_cursor = cursor_info.page + 1

    # Generate previous cursor (0-based page number)
    prev_cursor = None
    if has_prev and cursor_info.page > 0:
        prev_cursor = cursor_info.page - 1

    # Import PaginationResponse here to avoid circular imports
    from pi.app.schemas.chat import PaginationResponse

    pagination_response = PaginationResponse(
        next_cursor=str(next_cursor) if next_cursor is not None else None,
        prev_cursor=str(prev_cursor) if prev_cursor is not None else None,
        next_page_results=has_next,
        prev_page_results=has_prev,
        count=count,
        total_pages=total_pages,
        total_results=total_results,
    )

    return items, pagination_response


def apply_cursor_pagination(
    query: Select, cursor: Optional[str], per_page: int, order_by_field, id_field, direction: str = "desc"
) -> Tuple[Select, CursorInfo]:
    """Apply page-based pagination to a SQLAlchemy query."""

    # Convert string cursor to integer page number (0-based)
    try:
        page = int(cursor) if cursor is not None else 0
    except (ValueError, TypeError):
        page = 0

    # Calculate offset from 0-based page number
    offset = page * per_page

    cursor_info = CursorInfo(per_page=per_page, page=page, offset=offset)

    # Apply ordering
    if direction == "desc":
        query = query.order_by(desc(order_by_field), desc(id_field))
    else:
        query = query.order_by(order_by_field, id_field)

    # Apply offset and limit with +1 to check if there are more results
    query = query.offset(offset).limit(per_page + 1)

    return query, cursor_info


def check_pagination_bounds(results: List[T], cursor_info: CursorInfo, total_count: Optional[int] = None) -> Tuple[List[T], bool, bool]:
    """Check pagination bounds and determine if there are next/prev pages."""

    # Check if we have more results than requested (indicates next page exists)
    has_next = len(results) > cursor_info.per_page

    # If we have extra results, remove the last one
    if has_next:
        results = results[:-1]

    # Check if we have previous pages (0-based)
    has_prev = cursor_info.page > 0

    return results, has_next, has_prev
