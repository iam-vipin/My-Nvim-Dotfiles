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

from typing import Dict
from typing import List
from typing import Optional
from typing import Union

import requests

from pi import logger
from pi import settings

log = logger.getChild(__name__)


def get_commit_comparison(repo_name: str, base_commit: str, head_commit: str) -> Union[Dict, str]:
    """
    Get the comparison between two commits using GitHub API.
    Returns the net changes between base and head commits.
    """
    url = f"https://api.github.com/repos/{settings.vector_db.DOCS_REPO_OWNER}/{repo_name}/compare/{base_commit}...{head_commit}"
    headers = {"Authorization": f"token {settings.vector_db.DOCS_GITHUB_API_TOKEN}"}

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        error_message = f"Failed to get commit comparison for {repo_name} from {base_commit} to {head_commit}: {e}"
        log.error(error_message)
        return error_message


def get_net_file_changes(repo_name: str, base_commit: str, head_commit: str) -> Dict[str, Union[List[str], str]]:
    """
    Get net file changes between two commits, filtering for documentation files only.
    Returns a dictionary with 'added', 'modified', and 'removed' file lists.
    """
    if base_commit == head_commit:
        return {"added": [], "modified": [], "removed": []}

    comparison = get_commit_comparison(repo_name, base_commit, head_commit)

    if isinstance(comparison, str):
        return {"added": [], "modified": [], "removed": [], "error": comparison}

    # At this point, comparison is guaranteed to be a Dict
    files = comparison.get("files", [])

    # Filter for documentation files only (.mdx and .txt)
    def is_doc_file(filename: str) -> bool:
        return filename.endswith(".mdx") or filename.endswith(".txt")

    added = []
    modified = []
    removed = []

    for file in files:
        filename = file.get("filename", "")
        if not is_doc_file(filename):
            continue

        status = file.get("status", "")
        if status == "added":
            added.append(filename)
        elif status == "modified":
            modified.append(filename)
        elif status == "removed":
            removed.append(filename)
        elif status == "renamed":
            # Handle renamed files
            previous_filename = file.get("previous_filename", "")
            if is_doc_file(previous_filename):
                removed.append(previous_filename)
            added.append(filename)

    log.info(
        f"Net changes for {repo_name} ({base_commit}..{head_commit}): " f"Added: {len(added)}, Modified: {len(modified)}, Removed: {len(removed)}"
    )

    return {"added": added, "modified": modified, "removed": removed}


def get_latest_commit(repo_name: str, branch: str = "main") -> Optional[str]:
    """
    Get the latest commit SHA for a given branch.
    """
    url = f"https://api.github.com/repos/{settings.vector_db.DOCS_REPO_OWNER}/{repo_name}/commits/{branch}"
    headers = {"Authorization": f"token {settings.vector_db.DOCS_GITHUB_API_TOKEN}"}

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        commit_data = response.json()
        return commit_data.get("sha")
    except requests.exceptions.RequestException as e:
        log.error(f"Failed to get latest commit for {repo_name}/{branch}: {e}")
        return None
