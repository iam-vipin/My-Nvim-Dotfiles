from langchain_core.callbacks.manager import AsyncCallbackManagerForRetrieverRun
from langchain_core.callbacks.manager import CallbackManagerForRetrieverRun
from langchain_core.documents import Document
from langchain_core.retrievers import BaseRetriever

from pi import logger
from pi import settings
from pi.core.vectordb import VectorStore

vector_db = VectorStore()
# embedding_component = settings.vector_db.EMBED_COMPONENT

log = logger.getChild(__name__)


class DocsRetriever(BaseRetriever):
    num_docs: int = 5
    chunk_similarity_threshold: float = settings.vector_db.DOC_VECTOR_SEARCH_CUTOFF

    def _get_relevant_documents(
        self,
        query: str,
        run_manager: CallbackManagerForRetrieverRun,
    ) -> list[Document]:
        """Asynchronously retrieves relevant issue documents based on semantic search query."""

        response = vector_db.docs_search_semantic(
            query=query,
            threshold=self.chunk_similarity_threshold,
            output_fields=["id", "section", "subsection", "content"],
        )

        return self._parse_response(response)

    async def _aget_relevant_documents(
        self,
        query: str,
        run_manager: AsyncCallbackManagerForRetrieverRun,
    ) -> list[Document]:
        """Asynchronously retrieves relevant issue documents based on semantic search query."""

        response = await vector_db.async_docs_search_semantic(
            query=query,
            threshold=self.chunk_similarity_threshold,
            output_fields=["id", "section", "subsection", "content"],
        )

        return self._parse_response(response)

    def _parse_response(self, response) -> list[Document]:
        """Parses Open Search query response and returns relevant issue documents."""
        documents: list[Document] = []
        for hit in response[: self.num_docs]:
            section = hit.get("section") or "Untitled Section"
            subsection = hit.get("subsection") or "Untitled Subsection"
            content = hit.get("content") or "No content available"
            doc_id = hit.get("id") or "Unknown ID"
            documents.append(
                Document(
                    page_content=content,
                    metadata={
                        "section": section,
                        "subsection": subsection,
                        "relevance": round(hit.get("Score", 0), 3),
                        "id": doc_id,
                    },
                ),
            )

        return documents
