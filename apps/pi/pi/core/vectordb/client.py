import asyncio
import contextlib
import time
from typing import Any
from typing import Dict

from opensearchpy import ConnectionTimeout
from opensearchpy import OpenSearch
from opensearchpy import RequestError
from opensearchpy._async.client import AsyncOpenSearch

from pi import logger
from pi import settings
from pi.core.vectordb.utils import build_issue_semantic_query
from pi.core.vectordb.utils import build_issue_text_search_query
from pi.core.vectordb.utils import build_pages_semantic_query
from pi.core.vectordb.utils import parse_semantic_search_response
from pi.core.vectordb.utils import parse_text_search_response

log = logger.getChild(__name__)

OPENSEARCH_URL = settings.vector_db.OPENSEARCH_URL
OPENSEARCH_USER = settings.vector_db.OPENSEARCH_USER
OPENSEARCH_PASSWORD = settings.vector_db.OPENSEARCH_PASSWORD
ISSUE_INDEX = settings.vector_db.ISSUE_INDEX
PAGES_INDEX = settings.vector_db.PAGES_INDEX
DOCS_INDEX = settings.vector_db.DOCS_INDEX
ML_MODEL_ID = settings.vector_db.ML_MODEL_ID
WORKSPACE_ID = None  # Deprecated: use explicit workspace_id param instead


class VectorStore:
    def __init__(self):
        auth = (OPENSEARCH_USER, OPENSEARCH_PASSWORD)

        self.async_os = AsyncOpenSearch(
            hosts=[OPENSEARCH_URL],
            http_auth=auth,
            use_ssl=True,
            verify_certs=False,
            ssl_show_warn=False,
            timeout=60 * 10,
            connections_per_node=1,  # Prevent concurrent ML requests that hit rate limits
        )

        self.os = OpenSearch(
            hosts=[OPENSEARCH_URL],
            http_auth=auth,
            use_ssl=True,
            verify_certs=False,
            ssl_show_warn=False,
            timeout=60 * 10,
            connections_per_node=1,  # Prevent concurrent ML requests that hit rate limits
        )

        # Background vector watch task is initialised on demand in
        # `start_vector_watch()`. Having an explicit attribute here avoids
        # `mypy` complaints about the attribute being created dynamically.
        self._vector_watch_task: asyncio.Task | None = None

    # Adding these methods to make this class work as an async context manager
    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.close()

    def create_index(self, index_name: str, body: dict):
        """
        Create an index in OpenSearch with the given name and body.
        Only creates the index if it doesn't already exist.
        """
        try:
            # Check if the index already exists
            if self.os.indices.exists(index=index_name):
                log.info("Index %s already exists, skipping creation", index_name)
                return

            # Create the index with mappings
            self.os.indices.create(index=index_name, body=body)
            log.info("Index %s created successfully", index_name)
        except Exception as e:
            log.error("Unexpected error while creating index %s: %s", index_name, str(e))

    def issue_search_semantic(
        self,
        query_title: str,
        query_description: str | None,
        workspace_id: str,
        issue_id: str | None = None,
        user_id: str | None = None,
        project_id: str | None = None,
        threshold: float = 0.77,
        output_fields: list[str] = ["name"],
    ):
        """
        Synchronously search for similar issues based on semantic similarity.
        """
        query = build_issue_semantic_query(query_title, query_description, workspace_id, issue_id, project_id, user_id)
        response = self.os.search(index=ISSUE_INDEX, body=query)
        return parse_semantic_search_response(response, threshold, output_fields)

    async def async_issue_search_semantic(
        self,
        query_title: str,
        query_description: str | None,
        workspace_id: str,
        issue_id: str | None = None,
        user_id: str | None = None,
        project_id: str | None = None,
        threshold: float = 0.77,
        output_fields: list[str] = ["name"],
    ):
        """
        Asynchronously search for similar issues based on semantic similarity.
        """
        query = build_issue_semantic_query(query_title, query_description, workspace_id, issue_id, project_id, user_id)
        try:
            response = await self.async_os.search(index=ISSUE_INDEX, body=query)
        except Exception as e:
            log.error(f"Error searching for similar issues based on semantic similarity: {e} query: {query}")
            return []
        return parse_semantic_search_response(response, threshold, *output_fields)

    def pages_search_semantic(
        self,
        query: str,
        workspace_id: str,
        user_id: str,
        project_id: str | None = None,
        threshold: float = 0.77,
        output_fields: list[str] = ["name", "page_id", "description"],
    ):
        """
        Synchronously search for similar pages based on semantic similarity.
        """
        os_query = build_pages_semantic_query(query, workspace_id, user_id, project_id)
        response = self.os.search(index=PAGES_INDEX, body=os_query)
        return parse_semantic_search_response(response, threshold, *output_fields)

    async def async_pages_search_semantic(
        self,
        query: str,
        workspace_id: str,
        user_id: str,
        project_id: str | None = None,
        threshold: float = 0.77,
        output_fields: list[str] = ["name", "page_id", "description"],
    ):
        """
        Asynchronously search for similar pages based on semantic similarity.
        """
        os_query = build_pages_semantic_query(query, workspace_id, user_id, project_id)
        response = await self.async_os.search(index=PAGES_INDEX, body=os_query)
        return parse_semantic_search_response(response, threshold, *output_fields)

    async def async_issue_search_text(
        self,
        query_title: str,
        query_description: str | None,
        workspace_id: str,
        issue_id: str | None = None,
        user_id: str | None = None,
        project_id: str | None = None,
        min_score_percent: int = 70,
        min_filter: float = 0.1,
        output_fields: list[str] = ["name"],
    ):
        """
        Asynchronously search for similar issues based on text similarity.
        """
        search_body = build_issue_text_search_query(query_title, query_description, workspace_id, issue_id, project_id, user_id)
        try:
            response = await self.async_os.search(index=ISSUE_INDEX, body=search_body)
        except Exception as e:
            log.error(f"Error searching for similar issues based on text similarity: {e} search body: {search_body}")
            return []
        return parse_text_search_response(response, min_score_percent, min_filter, *output_fields)

    def docs_search_semantic(
        self,
        query: str,
        threshold: float = 0.77,
        output_fields: list[str] = ["content"],
    ):
        """
        Synchronously search for similar docs content based on semantic similarity.
        """
        neural_query = {"neural": {"content_semantic": {"query_text": query, "model_id": ML_MODEL_ID, "k": 10}}}
        response = self.os.search(index=DOCS_INDEX, body={"query": neural_query})
        return parse_semantic_search_response(response, threshold, *output_fields)

    async def async_docs_search_semantic(
        self,
        query: str,
        threshold: float = 0.77,
        output_fields: list[str] = ["content"],
    ):
        """
        Asynchronously search for similar docs content based on semantic similarity.
        """
        neural_query = {"neural": {"content_semantic": {"query_text": query, "model_id": ML_MODEL_ID, "k": 10}}}
        response = await self.async_os.search(index=DOCS_INDEX, body={"query": neural_query})
        return parse_semantic_search_response(response, threshold, *output_fields)

    async def async_feed(self, index_name, docs):
        """
        Asynchronously feed documents to OpenSearch index.
        """
        failed_docs: list = []
        success_count = 0
        total_docs = len(docs)

        log.info(f"Starting to feed {total_docs} documents to index: {index_name}")

        for i, doc in enumerate(docs):
            max_retries = 3
            retry_count = 0

            while retry_count < max_retries:
                try:
                    _ = await self.async_os.index(
                        index=index_name,
                        id=str(doc["id"]),
                        body=doc,
                        request_timeout=120,  # type: ignore[arg-type]
                    )  # type: ignore[call-arg]
                    success_count += 1
                    break  # Success, exit retry loop

                except ConnectionTimeout as e:
                    retry_count += 1
                    if retry_count >= max_retries:
                        log.error(f"Connection timeout while indexing {doc["id"]}: {str(e)}")
                        failed_docs.append(doc)
                    else:
                        log.warning(f"Connection timeout while indexing {doc["id"]}, retrying ({retry_count}/{max_retries})...")
                        await asyncio.sleep(2)  # Wait before retrying

                except RequestError as e:
                    log.error(f"Error indexing {doc["id"]}: {str(e)}")
                    failed_docs.append(doc)
                    break

                except Exception as e:
                    log.error(f"Error indexing {doc["id"]}: {str(e)}")
                    failed_docs.append(doc)
                    break

            # Only log progress at fixed intervals (every 10 docs)
            if (i + 1) % 10 == 0 or i == total_docs - 1:
                log.info(f"Progress: {i + 1}/{total_docs} documents processed | Success: {success_count} | Failed: {len(failed_docs)}")

        # Final summary
        log.info(f"Feeding complete! Successfully indexed: {success_count}/{total_docs} | Failed: {len(failed_docs)}/{total_docs}")

        return success_count, failed_docs

    async def async_delete_document(self, index_name: str, document_id: str):
        """
        Asynchronously delete a document from OpenSearch index.

        Args:
            index_name: The name of the index to delete from
            document_id: The ID of the document to delete

        Returns:
            dict: The delete response from OpenSearch
        """
        try:
            delete_response = await self.async_os.delete(
                index=index_name,
                id=document_id,
                ignore=[404],  # type: ignore[arg-type]
            )  # type: ignore[call-arg]

            if delete_response.get("result") == "deleted":
                log.info(f"Successfully deleted document: {document_id} from index: {index_name}")
            elif delete_response.get("result") == "not_found":
                log.warning(f"Document not found for deletion: {document_id} in index: {index_name}")

            return delete_response

        except Exception as e:
            log.error(f"Error deleting document {document_id} from index {index_name}: {e}")
            raise

    def retry_failed_updates(self, payload, index, max_retries=3):
        """
        Retry updating documents that did not get updated during the first update_by_query.
        """
        attempt = 0
        while attempt < max_retries:
            log.info("Retrying failed updates, attempt %s", attempt + 1)
            try:
                response = self.os.update_by_query(
                    index=index,
                    body=payload,
                    # wait_for_completion=True,
                    # refresh=True,
                )
            except Exception as e:
                log.error("Error during retry update_by_query: %s", e)
                attempt += 1
                time.sleep(5)
                continue

            total = response.get("total", 0)
            updated = response.get("updated", 0)
            failures = response.get("failures", [])
            remaining = total - updated
            if remaining == 0:
                log.info("Retry successful: all failed documents updated on attempt %s.", attempt + 1)
                return
            else:
                log.warning("Attempt %s: %s docs not updated. Failures: %s", attempt + 1, remaining, failures)
                attempt += 1
                time.sleep(5)
        log.error("Max retries reached. Some documents could not be updated after %s attempts.", max_retries)

    async def update_bidirectional_not_duplicates(self, index: str, issue_id: str, not_duplicate_ids: list):
        """
        Asynchronously update the not_duplicates_with field bidirectionally.
        """
        results: Dict[str, Any] = {}

        try:
            current_doc = await self.async_os.get(index=index, id=issue_id, _source_includes=["not_duplicates_with"])  # type: ignore
            existing_not_duplicates = current_doc.get("_source", {}).get("not_duplicates_with", [])
            updated_not_duplicates: list = list(set(filter(None, existing_not_duplicates + not_duplicate_ids)))

            results["main_issue"] = await self.async_os.update(
                index=index, id=issue_id, body={"doc": {"not_duplicates_with": updated_not_duplicates}}
            )

            update_operations = []
            for not_dup_id in not_duplicate_ids:
                if not not_dup_id:
                    continue

                try:
                    not_dup_doc = await self.async_os.get(index=index, id=not_dup_id, _source_includes=["not_duplicates_with"])  # type: ignore
                    existing_nds = not_dup_doc.get("_source", {}).get("not_duplicates_with", [])
                    updated_nds: list = list(set(filter(None, existing_nds + [issue_id])))

                    update_result = await self.async_os.update(index=index, id=not_dup_id, body={"doc": {"not_duplicates_with": updated_nds}})
                    update_operations.append({"id": not_dup_id, "result": update_result})

                except Exception as e:
                    update_operations.append({"id": not_dup_id, "error": str(e)})

            results["related_updates"] = update_operations

        except Exception as e:
            results["error"] = str(e)

        return results

    async def close(self):
        """Close OpenSearch clients and stop the background watcher (if any)."""
        if self._vector_watch_task is not None and not self._vector_watch_task.done():
            self._vector_watch_task.cancel()
            # Gracefully wait for the cancellation but silence the expected
            with contextlib.suppress(asyncio.CancelledError):
                await self._vector_watch_task
        await self.async_os.close()
        self.os.close()

    def search(self, *args, **kwargs):
        """Wrapper for synchronous search."""
        return self.os.search(*args, **kwargs)

    async def async_search(self, *args, **kwargs):
        """Wrapper for asynchronous search."""
        return await self.async_os.search(*args, **kwargs)

    async def missing_vectors_count(
        self,
        index_name: str,
        src_field: str,
        tgt_field: str,
        *,
        live: bool = False,
        workspace_id: str | None = None,  # NEW: explicit param
    ) -> tuple[int, list[str]]:
        """Return count of documents that still need vector embeddings.

        Checks for documents where the source field exists and has content (≥3 chars)
        but the target vector field is missing.
        """

        keyword_field = f"{src_field}.keyword"

        body = {
            "query": {
                "bool": {
                    "must": [
                        {"exists": {"field": keyword_field}},
                        {
                            "script": {
                                "script": {
                                    "lang": "painless",
                                    "params": {"field": keyword_field, "minLen": 3},
                                    "source": """
                                    if (!doc.containsKey(params.field) || doc[params.field].size() == 0)
                                        return false;
                                    String v = doc[params.field].value;
                                    v = v.replace("&nbsp;", "");
                                    int count = 0;
                                    for (int i = 0; i < v.length(); i++) {
                                      char c = v.charAt(i);
                                      if (c != (char)0xA0 && !Character.isWhitespace(c)) {
                                        count++;
                                      }
                                    }
                                    return count >= params.minLen;
                                    """,
                                }
                            }
                        },
                    ],
                    "must_not": [{"exists": {"field": tgt_field}}],
                }
            },
            "size": 0,
        }

        if workspace_id:
            query_dict = body["query"]
            bool_dict = query_dict["bool"]  # type: ignore[index]
            bool_dict.setdefault("filter", []).append({"term": {"workspace_id": workspace_id}})

        resp = await self.async_os.search(index=index_name, body=body)
        count = resp["hits"]["total"]["value"]

        if live:
            if count > 50:
                log.warning(
                    "Too many missing vectors (%d) for %s in %s - skipping this field in live sync because count > 50", count, tgt_field, index_name
                )
                return count, []
            elif count > 0:
                # Get the actual IDs for live sync
                debug_body = body.copy()
                debug_body["size"] = count  # Get all IDs since count <= 50
                debug_body["_source"] = []  # We only need the IDs
                sample = await self.async_os.search(index=index_name, body=debug_body)
                ids = [hit["_id"] for hit in sample["hits"]["hits"]]
                return count, ids
            else:
                return count, []
        else:
            # Non-live mode: just return count
            return count, []

    # -----------------------------------------------------------------
    # Blocking helper equivalents (sync) – used by Celery sync pipelines
    # -----------------------------------------------------------------

    def missing_vectors_count_sync(
        self,
        index_name: str,
        src_field: str,
        tgt_field: str,
        *,
        live: bool = False,
        workspace_id: str | None = None,
    ) -> tuple[int, list[str]]:
        """Synchronous counterpart to `async missing_vectors_count`.

        Uses the blocking OpenSearch client (`self.os`). Logic is identical but
        executes requests synchronously. It preserves the return signature `(count, ids)` so existing
        async-aware call sites can switch easily.
        """

        keyword_field = f"{src_field}.keyword"

        body = {
            "query": {
                "bool": {
                    "must": [
                        {"exists": {"field": keyword_field}},
                        {
                            "script": {
                                "script": {
                                    "lang": "painless",
                                    "params": {"field": keyword_field, "minLen": 3},
                                    "source": """
                                    if (!doc.containsKey(params.field) || doc[params.field].size() == 0)
                                        return false;
                                    String v = doc[params.field].value;
                                    // Replace HTML entities for non-breaking spaces
                                    v = v.replace("&nbsp;", "");
                                    // Count non-whitespace characters, treating \u00a0 as whitespace
                                    int count = 0;
                                    for (int i = 0; i < v.length(); i++) {
                                      char c = v.charAt(i);
                                      if (c != (char)0xA0 && !Character.isWhitespace(c)) {
                                        count++;
                                      }
                                    }
                                    return count >= params.minLen;
                                    """,
                                }
                            }
                        },
                    ],
                    "must_not": [{"exists": {"field": tgt_field}}],
                }
            },
            "size": 0,
        }

        if workspace_id:
            bool_dict = body["query"]["bool"]  # type: ignore[index]
            bool_dict.setdefault("filter", []).append({"term": {"workspace_id": workspace_id}})

        resp = self.os.search(index=index_name, body=body)
        count = resp["hits"]["total"]["value"]

        if live:
            if count > 50:
                log.warning(
                    "Too many missing vectors (%d) for %s in %s - skipping this field in live sync because count > 50",
                    count,
                    tgt_field,
                    index_name,
                )
                return count, []
            elif count > 0:
                debug_body = body.copy()
                debug_body["size"] = count
                debug_body["_source"] = []
                sample = self.os.search(index=index_name, body=debug_body)
                ids = [hit["_id"] for hit in sample["hits"]["hits"]]
                return count, ids
            else:
                return count, []
        else:
            return count, []

    async def missing_vectors_by_workspace(
        self,
        index_name: str,
        src_field: str,
        tgt_field: str,
        workspace_ids: list[str],
        batch_size: int = 1_000,
    ) -> dict[str, int]:
        """
        Return {workspace_id: count_missing_vectors} for the supplied workspaces.
        Splits the ID list into <=batch_size chunks to keep each query light.

        Args:
            index_name: The OpenSearch index to query
            src_field: Source field that should exist and have content ≥3 chars
            tgt_field: Target vector field that should be missing
            workspace_ids: List of workspace IDs to check
            batch_size: Maximum workspace IDs per query batch

        Returns:
            Dictionary mapping workspace_id to count of missing vectors
        """
        from collections import defaultdict

        if not workspace_ids:
            return {}

        keyword_field = f"{src_field}.keyword"

        combined_results: defaultdict[str, int] = defaultdict(int)

        # Process workspace IDs in batches
        for i in range(0, len(workspace_ids), batch_size):
            batch_ids = workspace_ids[i : i + batch_size]

            body = {
                "query": {
                    "bool": {
                        "must": [
                            {"exists": {"field": keyword_field}},
                            {
                                "script": {
                                    "script": {
                                        "lang": "painless",
                                        "params": {"field": keyword_field, "minLen": 3},
                                        "source": """
                                        if (!doc.containsKey(params.field) || doc[params.field].size() == 0)
                                            return false;
                                        String v = doc[params.field].value;
                                        // Replace HTML entities for non-breaking spaces
                                        v = v.replace("&nbsp;", "");
                                        // Count non-whitespace characters, treating \u00a0 as whitespace
                                        int count = 0;
                                        for (int i = 0; i < v.length(); i++) {
                                          char c = v.charAt(i);
                                          if (c != (char)0xA0 && !Character.isWhitespace(c)) {
                                            count++;
                                          }
                                        }
                                        return count >= params.minLen;
                                        """,
                                    }
                                }
                            },
                        ],
                        "must_not": [{"exists": {"field": tgt_field}}],
                        "filter": [{"terms": {"workspace_id": batch_ids}}],
                    }
                },
                "size": 0,
                "aggs": {
                    "by_workspace": {
                        "terms": {
                            "field": "workspace_id",
                            "size": len(batch_ids) + 100,  # Allow for some buffer
                        }
                    }
                },
            }

            try:
                resp = await self.async_os.search(index=index_name, body=body)

                # Extract counts from aggregation buckets
                buckets = resp.get("aggregations", {}).get("by_workspace", {}).get("buckets", [])
                for bucket in buckets:
                    workspace_id = bucket["key"]
                    count = bucket["doc_count"]
                    combined_results[workspace_id] += count

                log.debug(
                    "Batch %d/%d: Found missing vectors for %d workspaces in %s field %s->%s",
                    (i // batch_size) + 1,
                    (len(workspace_ids) + batch_size - 1) // batch_size,
                    len(buckets),
                    index_name,
                    src_field,
                    tgt_field,
                )

            except Exception as exc:
                log.error(
                    "Error querying missing vectors for batch %d in %s field %s->%s: %s",
                    (i // batch_size) + 1,
                    index_name,
                    src_field,
                    tgt_field,
                    exc,
                )
                # Continue with next batch on error
                continue

        # Convert defaultdict back to regular dict
        return dict(combined_results)

    # ──────────────── Vector-watch background task ────────────────
    async def _vector_watch_loop(self, interval: int = 10) -> None:
        """
        DEPRECATED: This method is no longer used.
        Live sync is now handled via API-driven approach through Celery tasks.
        """
        log.warning("_vector_watch_loop is deprecated - live sync now uses API-driven approach")
        return
