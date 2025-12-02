"""Duplicate detection endpoints for finding similar issues using vector search."""

from fastapi import APIRouter
from fastapi import Depends
from fastapi.responses import JSONResponse

from pi import logger
from pi.app.api.v2.dependencies import cookie_schema
from pi.app.api.v2.dependencies import is_valid_session
from pi.app.schemas.dupes import DupeSearchRequest
from pi.app.schemas.dupes import NotDuplicateRequest
from pi.services.dupes import dupes
from pi.services.dupes.dupes import DuplicateNotFoundError
from pi.services.dupes.dupes import NotDuplicateUpdateError
from pi.services.dupes.dupes import VectorSearchError

router = APIRouter()
log = logger.getChild("v2.dupes")


@router.post("/")
async def search_duplicates(
    data: DupeSearchRequest,
    session: str = Depends(cookie_schema),
):
    """
    Search for potential duplicate issues using vector similarity.

    This endpoint uses AI-powered vector search to find issues that are semantically
    similar to a given issue. It helps prevent duplicate issue creation by identifying
    existing issues that might describe the same problem or feature request.

    The search process:
    1. Extracts semantic meaning from issue title and description
    2. Generates vector embeddings
    3. Searches vector database for similar issues
    4. Returns ranked results with similarity scores

    Use cases:
    - Pre-submission duplicate checking
    - Finding related issues
    - Automatic duplicate detection
    - Issue deduplication workflows

    Args:
        data: DupeSearchRequest containing:
            - issue_id: UUID of the issue to check (optional)
            - title: Issue title to search for duplicates
            - description: Issue description for better matching
            - workspace_id: UUID of workspace to search within
            - project_id: Optional project UUID for narrower search
            - limit: Maximum number of results (default: 10)
            - threshold: Minimum similarity score (0.0-1.0)
        session: Session cookie for authentication (injected)

    Returns:
        JSON response with:
        - duplicates: List of potential duplicate issues containing:
            - issue_id: UUID of potential duplicate
            - title: Issue title
            - description: Issue description (excerpt)
            - similarity_score: Semantic similarity (0.0-1.0)
            - state: Issue state (open, closed, etc.)
            - created_at: Creation timestamp
            - is_confirmed_duplicate: Whether previously marked as duplicate
            - is_confirmed_not_duplicate: Whether marked as not duplicate
        - metadata:
            - query_time_ms: Search latency
            - total_results: Number of results found

    Status Codes:
        - 200: Search completed successfully
        - 400: Invalid search request
        - 401: Invalid or missing authentication
        - 404: Issue not found (if searching by issue_id)
        - 500: Internal server error (vector search failure)

    Example Request:
        POST /api/v2/dupes/
        {
            "title": "Login button not working",
            "description": "When I click the login button, nothing happens",
            "workspace_id": "abc-123",
            "project_id": "proj-456",
            "limit": 5,
            "threshold": 0.7
        }

    Example Response:
        {
            "duplicates": [
                {
                    "issue_id": "issue-789",
                    "title": "Login form broken",
                    "description": "Login functionality is not responding...",
                    "similarity_score": 0.92,
                    "state": "open",
                    "created_at": "2025-01-15T10:30:00Z",
                    "is_confirmed_duplicate": false,
                    "is_confirmed_not_duplicate": false
                },
                {
                    "issue_id": "issue-456",
                    "title": "Cannot authenticate",
                    "description": "Authentication button doesn't work...",
                    "similarity_score": 0.85,
                    "state": "closed",
                    "created_at": "2025-01-10T08:15:00Z",
                    "is_confirmed_duplicate": false,
                    "is_confirmed_not_duplicate": true
                }
            ],
            "metadata": {
                "query_time_ms": 145,
                "total_results": 2
            }
        }

    Notes:
        - Higher similarity scores indicate more likely duplicates
        - Threshold typically set between 0.7-0.9 for good results
        - Search is scoped to workspace (and optionally project)
        - Previously marked "not duplicate" pairs are flagged
        - Vector search requires embeddings to be indexed
        - Deprecated V1 endpoint: POST /api/v1/dupes/issues/

    Similarity Score Interpretation:
        - 0.95-1.0: Very likely duplicate (almost identical)
        - 0.85-0.95: Probable duplicate (very similar)
        - 0.75-0.85: Possible duplicate (similar topic)
        - 0.70-0.75: Related (same area, different issue)
        - <0.70: Likely not duplicate

    Use Cases:
        - Display "Similar issues" during issue creation
        - Automatic duplicate detection in workflows
        - Bulk deduplication analysis
        - Related issue recommendations
    """
    try:
        user = await is_valid_session(session)
        if not user:
            return JSONResponse(status_code=401, content={"detail": "Invalid session"})

        result = await dupes.get_dupes(data)
        return JSONResponse(content=result)

    except DuplicateNotFoundError as e:
        return JSONResponse(status_code=e.status_code, content={"detail": e.detail})
    except VectorSearchError as e:
        log.error(f"Vector search error: {e!s}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"detail": "Vector search failed. Please try again."},
        )
    except Exception as e:
        log.error(f"Unexpected error in duplicate search: {e!s}", exc_info=True)
        return JSONResponse(status_code=500, content={"detail": "Internal Server Error"})


@router.post("/feedback")
async def submit_duplicate_feedback(
    data: NotDuplicateRequest,
    session: str = Depends(cookie_schema),
):
    """
    Submit feedback that two issues are not duplicates.

    This endpoint allows users to mark a pair of issues as "not duplicates" when
    the AI incorrectly identifies them as similar. This feedback:
    1. Improves future duplicate detection accuracy
    2. Trains the system to avoid similar false positives
    3. Updates the duplicate detection model
    4. Prevents these issues from being suggested as duplicates again

    The feedback is stored and used to:
    - Adjust similarity thresholds for specific issue types
    - Fine-tune the vector search model
    - Improve semantic understanding
    - Build negative training examples

    Args:
        data: NotDuplicateRequest containing:
            - issue_id: UUID of the first issue
            - potential_duplicate_id: UUID of the second issue
            - workspace_id: UUID of workspace
            - reason: Optional reason why they're not duplicates
            - user_id: Optional user UUID providing feedback
        session: Session cookie for authentication (injected)

    Returns:
        JSON response with:
        - success: Boolean indicating operation success
        - message: Confirmation message
        - pair_id: UUID of the feedback record (for tracking)

    Status Codes:
        - 200: Feedback submitted successfully
        - 400: Invalid request (missing IDs, same issue, etc.)
        - 401: Invalid or missing authentication
        - 404: One or both issues not found
        - 500: Internal server error

    Example Request:
        POST /api/v2/dupes/feedback
        {
            "issue_id": "issue-123",
            "potential_duplicate_id": "issue-456",
            "workspace_id": "abc-123",
            "reason": "Different features - one is about login, other is about signup"
        }

    Example Response:
        {
            "success": true,
            "message": "Feedback recorded successfully",
            "pair_id": "feedback-789"
        }

    Notes:
        - Feedback is used to improve future duplicate detection
        - The same pair won't be suggested as duplicates again
        - User must have access to both issues
        - Feedback is workspace-scoped
        - Can provide optional reason for better model training
        - Deprecated V1 endpoint: POST /api/v1/dupes/issues/feedback/

    Common Reasons for "Not Duplicate":
        - Different features/functionality
        - Different contexts or use cases
        - One is bug, other is feature request
        - Different components/areas
        - One is resolved, other is ongoing
        - Similar symptoms, different root causes

    Impact on System:
        - Future searches won't suggest this pair
        - Model learns from the feedback
        - Similarity threshold may be adjusted
        - Negative training examples are created
        - Improves accuracy for similar cases
    """
    try:
        user = await is_valid_session(session)
        if not user:
            return JSONResponse(status_code=401, content={"detail": "Invalid session"})

        result = await dupes.set_not_duplicate_issues(data)
        return JSONResponse(content=result)

    except NotDuplicateUpdateError as e:
        return JSONResponse(status_code=e.status_code, content={"detail": e.detail})

    except Exception as e:
        log.error(f"Error processing duplicate feedback: {e!s}", exc_info=True)
        return JSONResponse(status_code=500, content={"detail": "Internal Server Error"})
