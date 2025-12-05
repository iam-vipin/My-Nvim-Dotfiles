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
AUTHORIZATION_TOKEN = "plane_api_c9a0aae9011c483bae231b655afac38d"  # Your Plane access token or API key
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

query = """
This was the previous conversation history: \n\n
===================\n\n
User:  give me one issue assigned to me in PALL project
Assistant: There are currently no work-items assigned to you in the PALL project. If you need help finding work-items in another project or have a different request, just let me know!
Assistant: There are currently no work-items assigned to you in the PALL project. If you need help finding work-items in another project or want to adjust your search, just let me know!
User:  create a task in PALL project title - "Hello task" and assign it to me
Assistant: Successfully created work item 'Hello task' - <http://127.0.0.1:3000/integrations03/browse/PALL-4/>

User:  do I have any task assigned to me in PALL project. If yes, show it
Assistant: Yes, you currently have one task assigned to you in the PALL project:

• *Task Name:* Hello task
• *Unique Key:* Not provided in the data
• *Priority:* None
• *State:* Backlog

If you need more details or want to take action on this task, just let me know!
User:  what project are we discussing in this thread
Assistant: It seems like you're referring to a previous conversation about the PALL project. If you have any specific questions or need further information about the PALL project, feel free to ask!
User:  create a task with title Test World
Assistant: Successfully created work item 'Test World' - <http://127.0.0.1:3000/integrations03/browse/PALL-5/>

User:  what are we discussing?
Assistant: I'm sorry, but I don't have access to past conversation history. However, I can help with any questions or information you need right now. Feel free to ask!
User:  try again
Assistant: I'm here to help with any questions or tasks you have. However, I don't have access to past conversation history. If you have any specific questions or need assistance, feel free to let me know!
User:  past conversation is available under `This was the previous conversation history` what are we discussing
Assistant: I'm sorry, but I don't have access to the previous conversation history. However, if you provide me with some details or context about the project and work items, I'd be happy to help you summarize or discuss them further!
User:  summarize this thread
Assistant: I'm sorry, but I can't provide a summary of the conversation history as there is no prior conversation content available. If you have specific questions or need assistance with a project, feel free to let me know!

===================\n\n
πCurrent user messageπ:\
What are we discussing in this thread?
"""  # noqa E501
query = """
πCurrent user messageπ:
create a task with title Test World in Starlette project
"""
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
    "workspace_slug": "switchertest",  # Optional: workspace slug string
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
