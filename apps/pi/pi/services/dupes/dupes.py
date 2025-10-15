from langchain.schema import HumanMessage
from langchain.schema import SystemMessage

from pi import logger
from pi import settings
from pi.app.schemas.dupes import DupeSearchRequest
from pi.app.schemas.dupes import DuplicateIdentificationResponse
from pi.app.schemas.dupes import NotDuplicateRequest
from pi.core.vectordb import VectorStore
from pi.services.dupes.prompts import dupes_human_prompt
from pi.services.dupes.prompts import dupes_system_prompt
from pi.services.llm.error_handling import llm_error_handler
from pi.services.llm.llms import get_dupes_llm

vector_db = VectorStore()

semantic_cutoff = settings.vector_db.DUPES_EMBED_CUTOFF

log = logger.getChild(__name__)

# dupe_fields = ["issue_id", "type_id", "project_id", "sequence_id", "title", "priority", "state_id", "created_by_id"]


# Custom exceptions
class DuplicateNotFoundError(Exception):
    def __init__(self, message: str):
        """Initializes DuplicateNotFoundError with status code and message."""
        super().__init__(message)
        self.status_code = 400
        self.detail = message


class VectorSearchError(Exception):
    def __init__(self, message: str):
        """Initializes VectorSearchError with status code and message."""
        super().__init__(message)
        self.status_code = 500
        self.detail = message


class NotDuplicateUpdateError(Exception):
    def __init__(self, message: str):
        """Initializes NotDuplicateUpdateError with status code and message."""
        super().__init__(message)
        self.status_code = 400
        self.detail = message


def distill_result(resp_sem: list, resp_text: list):
    """Parses Open Search query response to expected duplicates output with deduplication"""
    duplicates = []
    seen_issue_ids = set()

    # Process all results, keeping track of seen issue IDs to avoid duplicates
    for h in resp_sem + resp_text:
        issue_id = h["id"]
        if issue_id not in seen_issue_ids and not h["is_epic"]:  # Filtering out epic issues
            seen_issue_ids.add(issue_id)
            duplicates.append({
                "id": issue_id,
                "typeId": h["type_id"],
                "project_id": h["project_id"],
                "sequence_id": h["sequence_id"],
                "name": h["name"],
                "priority": h["priority"],
                "state_id": h["state_id"],
                "created_by": h["created_by_id"],
            })
    return duplicates


@llm_error_handler(
    fallback_message="LLM_FAILURE",  # Special marker for failure
    max_retries=1,
    log_context="[DUPES]",
)
async def identify_duplicates_with_llm(query_title: str, query_description: str, candidates: list) -> list:
    """Use GPT-4.1 nano to identify actual duplicates from similarity candidates."""
    if not candidates:
        return []

    # Create the dupes LLM with structured output
    dupes_llm = get_dupes_llm()
    dupes_structured_llm = dupes_llm.with_structured_output(DuplicateIdentificationResponse)  # type: ignore[arg-type]

    # Format candidates for LLM input as a clean numbered list
    candidates_text = ""
    for i, candidate in enumerate(candidates, 1):
        candidates_text += f"{i}. {candidate["name"]}\n"
        candidates_text += f"   ID: {candidate["id"]}\n"
        if candidate.get("description"):
            candidates_text += f"   {candidate["description"][:2000]}...\n"
        candidates_text += "\n"

    # Create the system prompt for duplicate identification

    human_prompt = dupes_human_prompt.format(query_title=query_title, query_description=query_description, candidates_text=candidates_text)

    messages = [SystemMessage(content=dupes_system_prompt), HumanMessage(content=human_prompt)]

    # Get LLM response
    response = dupes_structured_llm.invoke(messages)

    if not response:
        log.warning("No response from LLM for duplicate detection")
        return []

    # Handle response as either dict or DuplicateIdentificationResponse object
    if isinstance(response, dict):
        duplicate_serial_numbers = response.get("duplicates", [])
    else:
        duplicate_serial_numbers = getattr(response, "duplicates", [])

    if not duplicate_serial_numbers:
        return []

    log.info(f"LLM identified {len(duplicate_serial_numbers)} duplicates from {len(candidates)} candidates")

    # Map serial numbers back to actual candidates
    filtered_duplicates = []
    for serial_num in duplicate_serial_numbers:
        # Convert to 0-based index and validate range
        index = serial_num - 1
        if 0 <= index < len(candidates):
            filtered_duplicates.append(candidates[index])
        else:
            log.warning(f"Invalid serial number {serial_num} returned by LLM (out of range)")

    return filtered_duplicates


async def get_dupes(data: DupeSearchRequest):
    """Searches for potential duplicate issues based on title and description similarity."""
    dupe_output_fields = ["id", "type_id", "project_id", "sequence_id", "name", "priority", "state_id", "created_by_id", "is_epic"]
    try:
        workspace_id = str(data.workspace_id)
        project_id = str(data.project_id) if data.project_id else None
        issue_id = str(data.issue_id) if data.issue_id else None
        user_id = str(data.user_id) if data.user_id else None

        query_title = data.title
        query_description = data.description_stripped

        # Get initial candidates from vector similarity search
        resp_sem = await vector_db.async_issue_search_semantic(
            query_title,
            query_description,
            workspace_id,
            issue_id,
            user_id,
            project_id=project_id,
            threshold=semantic_cutoff,
            output_fields=dupe_output_fields,
        )

        # Process initial results
        initial_candidates = distill_result(resp_sem, [])

        # Limit to top 10 candidates for LLM processing as per user requirements
        candidates_for_llm = initial_candidates[:10]

        if not candidates_for_llm:
            return {"dupes": []}

        # Use LLM to identify actual duplicates from candidates
        llm_identified_dupes = await identify_duplicates_with_llm(query_title, query_description or "", candidates_for_llm)

        log.info(f"LLM identified {len(llm_identified_dupes)} duplicates from {len(candidates_for_llm)} candidates")

        # Handle error case where decorator returns failure marker
        if llm_identified_dupes == "LLM_FAILURE":
            llm_identified_dupes = candidates_for_llm  # Fall back to all candidates as before

        return {"dupes": llm_identified_dupes}

    except Exception as e:
        log.error(f"Unexpected error: {e!s}")
        # Return empty results on error instead of raising
        return {"dupes": []}


async def set_not_duplicate_issues(data: NotDuplicateRequest) -> dict:
    """Updates issues to mark them as not duplicates of each other."""
    try:
        issue_id_str = str(data.issue_id)
        not_dup_ids_str = [str(uuid) for uuid in data.not_duplicates_with]

        await vector_db.update_bidirectional_not_duplicates("issues-semantic-index", issue_id_str, not_dup_ids_str)

        return {"message": "Not duplicate issues updated successfully"}

    except Exception as e:
        log.error(f"An unexpected error occurred while setting not duplicate issues: {e!s}")
        raise NotDuplicateUpdateError(f"Open Search index update failed: {e!s}")


# if __name__ == "__main__":
#     import asyncio

#     # call get_dupes in an async function and print the result
#     async def main():
#         from uuid import UUID

#         dupe_input = {"title": "h1 and h6", "workspace_id": UUID("cd4ab5a2-1a5f-4516-a6c6-8da1a9fa5be4")}
#         # convert dupe_input to DupeSearchRequest
#         dupe_input = DupeSearchRequest(**dupe_input)
#         # call get_dupes
#         result = await get_dupes(dupe_input)
#         print(result)

#     asyncio.run(main())
