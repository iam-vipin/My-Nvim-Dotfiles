# SPDX-FileCopyrightText: 2023-present Plane Software, Inc.
# SPDX-License-Identifier: LicenseRef-Plane-Commercial
#
# Licensed under the Plane Commercial License (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
# https://plane.so/legals/eula
#
# DO NOT remove or modify this notice.
# NOTICE: Proprietary and confidential. Unauthorized use or distribution is prohibited.

from pi import settings
from pi.core.vectordb import VectorStore

docs_index_name = settings.vector_db.DOCS_INDEX
docs_pipeline_name = settings.vector_db.DOCS_PIPELINE_NAME
embedding_dimension = settings.vector_db.EMBEDDING_DIMENSION
cache_index_name = settings.vector_db.CACHE_INDEX

vectordb = VectorStore()


def create_docs_index():
    """
    Create OpenSearch index for documents with knn_vector fields and ingest pipeline.
    """
    index_body = {
        "settings": {"index": {"default_pipeline": docs_pipeline_name, "knn": True}},
        "mappings": {
            "properties": {
                "id": {"type": "keyword"},
                "section": {"type": "keyword"},
                "subsection": {"type": "keyword"},
                "content": {
                    "type": "text",
                },
                "content_semantic": {
                    "type": "knn_vector",
                    "dimension": embedding_dimension,
                    "method": {"name": "hnsw", "engine": "lucene", "space_type": "cosinesimil", "parameters": {"m": 16, "ef_construction": 512}},
                },
            }
        },
    }

    # Create the index
    vectordb.create_index(
        index_name=docs_index_name,
        body=index_body,
    )


def create_cache_index():
    """
    Create OpenSearch index for cache with knn_vector fields and ingest pipeline.
    """
    index_body = {
        "settings": {"index": {"knn": True}},
        "mappings": {
            "properties": {
                "query": {"type": "keyword"},
                "retrieved_tables": {"type": "keyword"},
                "query_vector": {
                    "type": "knn_vector",
                    "dimension": embedding_dimension,
                    "method": {
                        "name": "hnsw",
                        "engine": "lucene",
                        "space_type": "cosinesimil",
                        "parameters": {"m": 16, "ef_construction": 512},
                    },
                },
            }
        },
    }
    vectordb.create_index(index_name=cache_index_name, body=index_body)
