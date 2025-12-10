"""
Example Python requests code to hit the /slack/answer/ endpoint.

This endpoint is located at: {base_path}/api/v1/chat/slack/answer/
"""

import json
from uuid import UUID
from uuid import uuid4

import requests

# Configuration
BASE_URL = "http://localhost:8001"  # Update with your actual base URL
BASE_PATH = ""  # Update if your API has a base path (e.g., "/pi")
AUTHORIZATION_TOKEN = "plane_api_28a5ceb716424a47b358881d9d185e1f"  # Your Plane access token or API key
# AUTHORIZATION_TOKEN = "plane_api_c9a0aae9011c483bae231b655afac38d" # Your Plane access token or API key

# Endpoint URL
endpoint_url = f"{BASE_URL}{BASE_PATH}/api/v1/chat/slack/answer/"

llm = "gpt-4.1"
# llm = 'gpt-5-standard'
# llm = 'gpt-5-fast'
# llm = 'claude-sonnet-4'
user_id = UUID("c1cc72be-3b92-445d-b223-6bcd94876925")
# user_id = UUID("2225dd79-dffe-4272-9748-3f88548daddb")
# user_id = UUID("6baf27f5-1bfd-4acb-aa2f-333cd23130e0")
workspace_id = "42200c3d-1225-4cb5-88ba-c88af80430f2"
# workspace_id = "cd4ab5a2-1a5f-4516-a6c6-8da1a9fa5be4"
workspace_slug = None
# workspace_id = "23d3924f-db82-4377-b8d3-6ff643af6b9a"
# workspace_id = "31f16e25-535e-404f-946e-3ffbe52695a2"
# workspace_id = "1559196e-fdd9-4651-8a78-33e30cbf5f72"
# workspace_id = None
is_temp = False
workspace_in_context = True
is_new = True
pi_sidebar_open = True
sidebar_open_url = r"piworkspace/projects/3719d6d4-42d6-4bf5-bfe4-85dc33e07958/cycles/28ec0918-9095-42c7-80ae-864816d8dbd2/"
is_project_chat = False
# project_id = "40bc0eaf-2d34-457a-ae5b-d4040c42edcc"
project_id = "47ed2e28-3e91-4ba8-a463-4a117941e2d4"
# project_id=None
# project_id = "743525c9-7ac3-4570-8262-e63330175ed4"
context = {"first_name": "sunder", "last_name": "Chintada"}

# query = """
# Here is the conversation history for context: =================== User: can you talk to SSI folks once.
# also anything from EOP? User: any update on this for SSI?
# User: CDN one resolved, we are fixing all external call related issues in Air-gapped 2.0.0 commercial release.
# User: do let us know if you hear anything from SSI, .
# User: Can we check with them on which version they are on?
# User: I guess they are still running Plane v1.11.1
# User: If they are on the old version. Please request them to move to latest version.
# User: New Airgapped License can be downloaded from the prime.plane.so
# User: Here was Jake @ SSIs response to me: "Thanks Jason.
# There are no active issues I am aware of besides the broken image links on the air-gapped version.
# Any word on if your team is close to a fix there?" User: create an issue on we application project and assign it to Manish here’s context
# Here was Jake @ SSIs response to me: "Thanks Jason.
# There are no active issues I am aware of besides the broken image links on the air-gapped version.
# Any word on if your team is close to a fix there?"
# Assistant: Successfully created work item 'Chassis Design' - <http://127.0.0.1:3000/switchertest/browse/CARB-1/>
# User: created the issue you’ll be notified after it’s fixed
# User: Any idea which version they are on?
# User: I have updated the description with details. in the above ticket.
# User: Hmm, may know User: About?
# User: &gt; Any idea which version they are on? Curious if he knows the version
# User: Ohh okay.
# User: Just to set the expectation.
# The image thing that was mentioned by SSI will not be fixed as part of v2.0.0. Which is scheduled to release on 5th december.
# User: in the same issue can you add a comment saying "Send latest instructions for SSI to upgrade to v2,
# Sriram mentioned their issue will be fixed by tomorrow after a patch"
# =================== πCurrent user messageπ: in the same issue can you add a comment saying "Send latest instructions for SSI to upgrade to v2,
# Sriram mentioned their issue will be fixed by tomorrow after a patch"
# """  # noqa E501

query = """create a workitem titled 'Mogambo' in GPT project"""

# query = """create a workitem titled 'Mogambo' in GPT project"""

# Request payload - ChatRequest schema
payload = {
    "query": query,
    "llm": llm,  # Optional: defaults to DEFAULT_LLM if not provided
    "is_new": True,
    "user_id": str(user_id),  # Optional: UUID as string
    "chat_id": str(uuid4()),  # Optional: UUID as string
    "is_temp": False,
    "workspace_in_context": True,
    "workspace_id": str(workspace_id),  # Optional: UUID as string or empty string
    "project_id": None,  # Optional: UUID as string or None
    "context": {},  # Required: dictionary with any context data
    "is_project_chat": False,  # Optional
    "pi_sidebar_open": False,  # Optional
    # "workspace_slug": "switchertest",  # Optional: workspace slug string
    "attachment_ids": [],  # Optional: list of UUID strings
    "sidebar_open_url": "",  # Optional
    "source": "app",  # Optional: source identifier
}

# Headers
headers = {
    "Authorization": f"Bearer {AUTHORIZATION_TOKEN}",  # Can also be just the token without "Bearer "
    "Content-Type": "application/json",
}

# Make the request
try:
    response = requests.post(
        endpoint_url,
        json=payload,
        headers=headers,
        timeout=300,  # Adjust timeout as needed (streaming can take time)
    )

    # Check response status
    response.raise_for_status()

    # Parse JSON response
    result = response.json()

    print("Response Status:", response.status_code)
    print("\nResponse Body:")
    print(json.dumps(result, indent=2))

    # Access response fields
    print("\n--- Response Fields ---")
    print(f"Response Type: {result.get("response_type")}")
    print(f"Response: {result.get("response")}")
    print(f"Actions Data: {result.get("actions_data")}")
    print(f"Context: {result.get("context")}")
    print(f"Clarification Data: {result.get("clarification_data")}")

except requests.exceptions.HTTPError as e:
    print(f"HTTP Error: {e}")
    print(f"Response: {e.response.text}")
except requests.exceptions.RequestException as e:
    print(f"Request Error: {e}")
