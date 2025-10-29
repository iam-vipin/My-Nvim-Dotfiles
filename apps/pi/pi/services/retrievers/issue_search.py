import asyncio

from langchain.callbacks.manager import AsyncCallbackManagerForRetrieverRun
from langchain.callbacks.manager import CallbackManagerForRetrieverRun
from langchain_core.documents import Document
from langchain_core.retrievers import BaseRetriever

from pi import logger
from pi.config import settings
from pi.core.vectordb import VectorStore

vector_db = VectorStore()

log = logger.getChild(__name__)


class IssueRetriever(BaseRetriever):
    num_docs: int = 5
    chunk_similarity_threshold: float = settings.vector_db.ISSUE_VECTOR_SEARCH_CUTOFF

    def _get_relevant_documents(
        self,
        query: str,
        run_manager: CallbackManagerForRetrieverRun,
        workspace_id: str = "",
        project_id: str = "",
        user_id: str = "",
    ) -> list[Document]:
        """Asynchronously retrieves relevant issue documents based on semantic search query."""

        response = vector_db.issue_search_semantic(
            query_title=query,
            query_description="",
            workspace_id=workspace_id,
            project_id=project_id,
            user_id=user_id,
            threshold=self.chunk_similarity_threshold,
            output_fields=["id", "name", "description"],
        )

        return self._parse_response(response)

    async def _aget_relevant_documents(
        self,
        query: str,
        run_manager: AsyncCallbackManagerForRetrieverRun,
        workspace_id: str = "",
        project_id: str = "",
        user_id: str = "",
    ) -> list[Document]:
        """Asynchronously retrieves relevant issue documents based on semantic search query."""

        sem_task = vector_db.async_issue_search_semantic(
            query_title=query,
            query_description="",
            workspace_id=workspace_id,
            project_id=project_id,
            user_id=user_id,
            threshold=self.chunk_similarity_threshold,
            output_fields=["id", "name", "description"],
        )

        text_task = vector_db.async_issue_search_text(
            query_title=query,
            query_description="",
            workspace_id=workspace_id,
            project_id=project_id,
            user_id=user_id,
            output_fields=["id", "name", "description"],
        )

        # Run both tasks concurrently
        resp_sem, resp_text = await asyncio.gather(sem_task, text_task)

        # Combine the results from both tasks
        response = resp_sem + resp_text
        # Remove duplicates based on issue_id
        seen_issue_ids = set()
        unique_response = []
        for hit in response:
            issue_id = hit["ID"]
            if issue_id not in seen_issue_ids:
                seen_issue_ids.add(issue_id)
                unique_response.append(hit)

        return self._parse_response(unique_response)

    def _parse_response(self, response) -> list[Document]:
        """Parses Open Search query response and returns relevant issue documents."""
        documents: list[Document] = []
        for hit in response[: self.num_docs]:
            title = hit.get("name") or "Untitled Issue"
            description = hit.get("description") or "No content available"
            issue_id = hit.get("id") or "Unknown ID"
            documents.append(
                Document(
                    page_content=description,
                    metadata={
                        "name": title,
                        "relevance": round(hit.get("Score", 0), 3),
                        "issue_id": issue_id,
                    },
                ),
            )

        return documents
