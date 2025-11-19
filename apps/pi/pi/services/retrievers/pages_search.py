from typing import List

from langchain.callbacks.manager import AsyncCallbackManagerForRetrieverRun
from langchain.callbacks.manager import CallbackManagerForRetrieverRun
from langchain_core.documents import Document
from langchain_core.retrievers import BaseRetriever

from pi import logger
from pi.core.vectordb import VectorStore

log = logger.getChild(__name__)

vector_db = VectorStore()
# embedding_component = settings.vector_db.EMBED_COMPONENT


class PageChunkRetriever(BaseRetriever):
    num_docs: int = 5
    chunk_similarity_threshold: float = 0.8

    def _get_relevant_documents(
        self,
        query: str,
        run_manager: CallbackManagerForRetrieverRun,
        workspace_id: str = "",
        project_id: str = "",
        user_id: str = "",
    ) -> List[Document]:
        if not workspace_id and not project_id:
            log.error("Neither project id nor workspace id provided")
            return []

        response = vector_db.pages_search_semantic(
            query=query,
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
    ) -> List[Document]:
        if not workspace_id and not project_id:
            log.error("Neither project id nor workspace id provided")
            return []

        response = await vector_db.async_pages_search_semantic(
            query=query,
            workspace_id=workspace_id,
            project_id=project_id,
            user_id=user_id,
            threshold=self.chunk_similarity_threshold,
            output_fields=["id", "name", "description"],
        )

        return self._parse_response(response)

    def _parse_response(self, response) -> list[Document]:
        documents: list[Document] = []

        for hit in response[: self.num_docs]:
            title = hit.get("name") or "Untitled Page"
            description = hit.get("description") or "No content available"
            issue_id = hit.get("id") or "Unknown ID"

            documents.append(
                Document(
                    page_content=description,
                    metadata={
                        "page_title": title,
                        "relevance": round(hit.get("Score", 0), 3),
                        "page_id": issue_id,
                    },
                )
            )

        return documents
