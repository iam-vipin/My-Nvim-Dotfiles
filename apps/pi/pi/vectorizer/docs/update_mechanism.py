import base64
import re

import requests

from pi import logger
from pi import settings

# from typing import Any
# from typing import Dict


# from pi.app.mods.docs.process import process_file_content

log = logger.getChild(__name__)


def process_mdx_file(mdx_content):
    """Processes MDX file content by removing image frames."""
    image_regex = re.compile(r"<Frame>!\[.*?\]\(.*?\)</Frame>")
    processed_lines = [line for line in mdx_content.split("\n") if not image_regex.search(line)]
    return "\n".join(processed_lines)


# def process_mdx_file(mdx_content):
#     """Processes MDX file content by removing HTML tags but preserving content."""
#     # Remove <Frame> tags with images
#     image_regex = re.compile(r"<Frame>!\[.*?\]\(.*?\)</Frame>")

#     # Process content line by line to remove lines with image frames
#     processed_lines = [line for line in mdx_content.split("\n") if not image_regex.search(line)]
#     intermediate_content = "\n".join(processed_lines)

#     # Remove div opening and closing tags but keep their contents
#     div_open_regex = re.compile(r"<div.*?>")
#     div_close_regex = re.compile(r"</div>")

#     # First remove opening tags
#     content_without_open_tags = div_open_regex.sub('', intermediate_content)
#     # Then remove closing tags
#     final_content = div_close_regex.sub('', content_without_open_tags)

#     # Remove other component tags (like Tags component)
#     component_regex = re.compile(r"<[A-Z][a-zA-Z0-9]*\s+[^>]*>.*?</[A-Z][a-zA-Z0-9]*>", re.DOTALL)
#     final_content = component_regex.sub('', final_content)

#     # Remove iframe tags
#     iframe_regex = re.compile(r"<iframe.*?</iframe>", re.DOTALL)
#     final_content = iframe_regex.sub('', final_content)

#     return final_content


def get_file_content(repo_name: str, file_path: str) -> str:
    """Retrieves file content from GitHub repository using API."""
    url = f"https://api.github.com/repos/{settings.vector_db.DOCS_REPO_OWNER}/{repo_name}/contents/{file_path}"
    headers = {"Authorization": f"token {settings.vector_db.DOCS_GITHUB_API_TOKEN}"}
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        content = response.json()["content"]
        return base64.b64decode(content).decode("utf-8")
    except requests.RequestException as e:
        log.error(f"Failed to fetch file content: {e}")
        return ""


def parse_path(file_path: str) -> tuple:
    """Parses file path to extract section and subsection."""
    parts = file_path.split("/")
    if len(parts) == 1:
        return parts[0], parts[0]
    if len(parts) == 2:
        return parts[0], parts[1]
    return "/".join(parts[:-1]), parts[-1]


# def process_file(file_path: str, operation: str = "feed") -> Dict[str, Any]:
#     unique_id = file_path.replace("/", "_").replace("-", "_").replace(".mdx", "").replace(".txt", "")
#     data_id = f"id:docsText:docs::{unique_id}"

#     if operation == "delete":
#         return {"operation": "delete", "data_id": unique_id}

#     content = get_file_content(file_path)
#     if content is None or content.strip() == "":
#         log.warning(f"Empty or invalid content for file: {file_path}")
#         content = ""
#     else:
#         txt_content = process_mdx_file(content)
#         if "api-reference" in file_path:
#             content = process_file_content(txt_content)
#         else:
#             content = txt_content

#     section, subsection = parse_path(file_path)

#     return {
#         "operation": "feed",
#         "data_id": data_id,
#         "fields": {
#             "id": unique_id,
#             "section": section,
#             "subsection": subsection.replace(".mdx", "").replace(".txt", ""),
#             "content": content,
#         },
#     }
