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

from django.conf import settings
from celery import shared_task


@shared_task
def run_search_index_command(*args, **kwargs):
    """
    Run the opensearch management command with the given arguments.
    :param args: Positional arguments for the management command.
    :param kwargs: Keyword arguments for the management command.

    Available subcommands:
    - list: Show all available indices and their state
    - index: Manage index creation/deletion/rebuild
    - document: Manage document indexing/updating/deletion

    Index subcommand options:
    - create: Create the indices in OpenSearch
    - delete: Delete the indices in OpenSearch
    - rebuild: Delete the indices and then recreate them
    - update: Update index mappings

    Document subcommand options:
    - index: Index documents into OpenSearch
    - delete: Delete documents from OpenSearch
    - update: Update documents in OpenSearch

    Additional options:
    --force: Do not ask for confirmation
    --parallel: Run operations in parallel
    --refresh: Refresh indices after operations

    Example usage:
    # Create all indices
    run_search_index_command.delay('index', 'create', '--force')

    # Rebuild specific indices
    run_search_index_command.delay('index', 'rebuild', '--indices', 'index_name', '--force')

    # Index all documents
    run_search_index_command.delay('document', 'index', '--force')

    # Index documents for specific indices with parallel processing
    run_search_index_command.delay('document', 'index', '--indices', 'index_name', '--parallel', '--force')
    """
    if not getattr(settings, "OPENSEARCH_ENABLED", False):
        print("OpenSearch is disabled")
        return

    from django.core.management import call_command

    print("Running opensearch command with args:", args)

    # Remove '--background' if present (shouldn't be needed but just in case)
    args = [arg for arg in args if arg != "--background"]

    call_command("opensearch", *args, **kwargs)
    print("OpenSearch command completed")
