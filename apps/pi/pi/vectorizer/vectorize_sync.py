from __future__ import annotations

"""Synchronous helpers for vectorization.

This module provides a blocking counterpart to the async
`populate_embeddings` pipeline so Celery tasks can run in a purely
synchronous fashion while we finish de-asyncing the vectorizer code.
"""

import asyncio
from typing import Any
from typing import Dict

from pi.core.vectordb.client import VectorStore
from pi.vectorizer.vectorize import populate_embeddings as _populate_embeddings_async


def populate_embeddings_sync(
    vdb: VectorStore,
    index_name: str,
    field_map: Dict[str, str],
    *,
    live: bool = False,
    ids: list[str] | None = None,
    workspace_id: str | None = None,
    feed_slices: int | None = None,
    batch_size: int | None = None,
    bulk_size: int | None = None,
) -> Any:
    """Blocking wrapper around the async `populate_embeddings`.

    This function spins up a private event-loop with `asyncio.run` and
    executes the original async implementation.  Downstream callers can
    treat it as a synchronous, blocking call.
    """

    if ids is None:
        ids = []

    return asyncio.run(
        _populate_embeddings_async(
            vdb,
            index_name,
            field_map,
            live=live,
            ids=ids,
            workspace_id=workspace_id,
            feed_slices=feed_slices,
            batch_size=batch_size,
            bulk_size=bulk_size,
        )
    )
