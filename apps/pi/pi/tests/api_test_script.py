#!/usr/bin/env python3
"""
Simple API endpoint testing script
Tests Plane actions via direct HTTP calls to your API
"""

import json
import time
import uuid
from datetime import datetime

import requests


class PlaneAPITester:
    def __init__(self, base_url: str = "http://localhost:8000", session_id: str = "plane-session-id", cookie_value: str = ""):
        self.base_url = base_url.rstrip("/")
        self.session = requests.Session()
        # Add authentication cookies for all requests
        if cookie_value:
            self.session.headers.update({"accept": "application/json", "Content-Type": "application/json", "Cookie": f"{session_id}={cookie_value}"})

    def test_chat_and_execute(self, question: str, workspace_slug: str, workspace_id: str) -> dict:
        """Test the complete flow: chat -> get actions -> execute"""

        print(f"🤖 Testing question: {question}")

        # Step 1: Initialize chat
        # For workspace-level chat, we need either workspace_id or project_id when workspace_in_context=True
        # Let's use a mock workspace_id for testing (in real scenario, you'd resolve this from workspace_slug)
        # Use the provided workspace_id parameter

        init_response = self.session.post(
            f"{self.base_url}/api/v1/chat/initialize-chat/",
            json={
                "chat_id": None,
                "is_project_chat": False,
                "workspace_in_context": True,
                "workspace_slug": workspace_slug,
                "workspace_id": workspace_id,
            },
        )

        if init_response.status_code != 200:
            return {"error": f"Chat initialization failed: {init_response.status_code} - {init_response.text}"}

        init_data = init_response.json()
        chat_id = init_data.get("chat_id")

        # Step 2: Queue the answer
        queue_response = self.session.post(
            f"{self.base_url}/api/v1/chat/queue-answer/",
            json={
                "query": question,  # Changed from "question" to "query"
                "workspace_slug": workspace_slug,
                "workspace_id": workspace_id,
                "chat_id": chat_id,
                "is_project_chat": False,
                "workspace_in_context": True,
                "llm": "gpt-4.1",
                "is_new": True,  # Required field
                "is_temp": False,  # Required field
                "context": {"first_name": "sunder", "last_name": "Chintada"},
            },
        )

        if queue_response.status_code != 200:
            return {"error": f"Queue failed: {queue_response.status_code} - {queue_response.text}"}

        queue_data = queue_response.json()
        token = queue_data.get("stream_token")  # Correct field name from API

        print(f"  📝 Chat ID: {chat_id}, Token: {token}")

        # Step 3: Stream the answer to get the response
        stream_response = self.session.get(f"{self.base_url}/api/v1/chat/stream-answer/{token}")

        if stream_response.status_code != 200:
            return {"error": f"Stream failed: {stream_response.status_code} - {stream_response.text}"}

        print("  📡 Streaming response...")

        # Parse the SSE stream to extract message_id and actions
        message_id = None
        suggested_actions = []

        if stream_response.text:
            lines = stream_response.text.split("\n")
            current_event = None

            for line in lines:
                line = line.strip()
                if not line:
                    continue

                if line.startswith("event: "):
                    current_event = line[7:]  # Remove 'event: ' prefix
                    print(f"    🎯 Event: {current_event}")

                elif line.startswith("data: "):
                    data_content = line[6:]  # Remove 'data: ' prefix

                    if current_event == "delta":
                        try:
                            import json

                            delta_data = json.loads(data_content)
                            chunk = delta_data.get("chunk", "")
                            print(f"    💬 {chunk}", end="", flush=True)
                        except json.JSONDecodeError:
                            print(f"    💬 {data_content}", end="", flush=True)

                    elif current_event == "actions":
                        print("\n    ⚡ Actions received!")
                        try:
                            import json

                            actions_data = json.loads(data_content)
                            message_id = actions_data.get("message_id")
                            suggested_actions = actions_data.get("actions", [])
                            print(f"    📝 Message ID: {message_id}")
                            print(f"    🎯 Actions: {len(suggested_actions)} found")
                        except json.JSONDecodeError:
                            print("    ⚠️ Failed to parse actions data")

                    elif current_event == "reasoning":
                        print(f"\n    🧠 Reasoning: {data_content[:100]}...")

                    else:
                        print(f"    📄 {current_event}: {data_content[:100]}...")

            print()  # Final newline after streaming

        print(f"  🎯 Found {len(suggested_actions)} suggested actions")

        if suggested_actions and message_id:
            # Step 4: Execute the first suggested action
            print(f"  ⚡ Executing action with message_id: {message_id}")

            execute_response = self.session.post(
                f"{self.base_url}/api/v1/chat/execute-action/",
                json={
                    "chat_id": chat_id,
                    "message_id": message_id,  # Use the message_id from stream response
                    "workspace_id": workspace_id,
                    "workspace_slug": workspace_slug,
                },
            )

            if execute_response.status_code != 200:
                return {"error": f"Execute failed: {execute_response.status_code} - {execute_response.text}"}

            execute_data = execute_response.json()
            print("  ✅ Action executed successfully")

            return {
                "chat_id": chat_id,
                "token": token,
                "message_id": message_id,
                "suggested_actions": suggested_actions,
                "execution_result": execute_data,
                "success": True,
            }
        else:
            # No actions to execute, but stream was successful
            return {
                "chat_id": chat_id,
                "token": token,
                "stream_response": stream_response.text[:200] if stream_response.text else "Empty response",
                "message": "Stream successful but no actions found to execute",
                "success": True,
            }

    def run_test_suite(self, workspace_slug: str, workspace_id: str):
        """Run a comprehensive test suite"""

        print("🚀 Starting Plane API Test Suite\n")

        test_cases = [
            "Create a cycle 'second cycle' in Solo project with today as start and two weeks from now as end",
            # Project operations
            f"Create a project called 'API Test Project {datetime.now().strftime("%H%M%S")}' with identifier 'ATP{datetime.now().strftime("%H%M%S")}'",  # noqa: E501
            "List all projects in the workspace",
            # Work item operations
            f"Create a work item called 'API Test Work Item {uuid.uuid4().hex[:8]}' with high priority",  # noqa: E501
            "List all work items in the first project",
            # Cycle operations
            f"Create a cycle called 'API Test Cycle {uuid.uuid4().hex[:8]}' for this month",
            "List all cycles in the project",
            # Label operations
            f"Create a label called 'api-test-{uuid.uuid4().hex[:8]}' with red color",
            "List all labels in the project",
        ]

        results = []

        for i, test_case in enumerate(test_cases, 1):
            print(f"\n{i}️⃣ Test Case {i}/{len(test_cases)}")
            print("-" * 50)

            try:
                result = self.test_chat_and_execute(test_case, workspace_slug, workspace_id)

                if result.get("success"):
                    print("  ✅ SUCCESS")
                    if result.get("execution_result"):
                        exec_result = result["execution_result"]
                        if exec_result.get("success"):
                            print("    📊 Action executed successfully")
                            if exec_result.get("result"):
                                res = exec_result["result"]
                                if isinstance(res, dict) and "id" in res:
                                    print(f"    🆔 Created resource ID: {res["id"]}")
                        else:
                            print(f"    ⚠️ Action failed: {exec_result.get("error", "Unknown error")}")
                else:
                    print(f"  ❌ FAILED: {result.get("error", "Unknown error")}")

                results.append({"test_case": test_case, "status": "SUCCESS" if result.get("success") else "FAILED", "result": result})

            except Exception as e:
                print(f"  💥 EXCEPTION: {str(e)}")
                results.append({"test_case": test_case, "status": "EXCEPTION", "error": str(e)})
            # Small delay between tests
            time.sleep(1)
            break

        # Generate summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)

        successful = len([r for r in results if r["status"] == "SUCCESS"])
        failed = len([r for r in results if r["status"] == "FAILED"])
        exceptions = len([r for r in results if r["status"] == "EXCEPTION"])

        print(f"Total Tests: {len(results)}")
        print(f"✅ Successful: {successful}")
        print(f"❌ Failed: {failed}")
        print(f"💥 Exceptions: {exceptions}")
        print(f"Success Rate: {(successful / len(results) * 100):.1f}%")

        # Save detailed results
        with open(f'pi/tests/api_test_results_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json', "w") as f:
            json.dump(results, f, indent=2, default=str)

        print("\n📁 Detailed results saved to pi/tests/api_test_results_*.json")

        return results


def main():
    """Main test execution"""

    # Configuration
    BASE_URL = "http://localhost:8000"  # Update if your API runs on different port
    WORKSPACE_SLUG = "piworkspace"  # Replace with your workspace slug
    WORKSPACE_ID = "5848c33a-1fdc-4155-8b16-d65e844fe3e7"  # Replace with your actual workspace UUID
    SESSION_ID = "plane-session-id"
    COOKIE_VALUE = "7iqry13n7e8jn1j8t6wh6uql4dbti5axm9p3hl8rwa5t2kplhf681ohhmzxx5x7l1g4no8ua6woqlqx4mdefcmvfij8yq3nwvh10mt5b306z0jsgtthctmholhc3skyd"

    if WORKSPACE_SLUG == "your_workspace_slug":
        print("❌ Please update WORKSPACE_SLUG in the script")
        return

    # Run tests
    tester = PlaneAPITester(BASE_URL, SESSION_ID, COOKIE_VALUE)

    try:
        # Test API connectivity with a simple endpoint
        try:
            # Try to hit the docs endpoint as a basic connectivity test
            health_response = tester.session.get(f"{BASE_URL}/docs")
            if health_response.status_code == 200:
                print("✅ API is accessible")
            else:
                print("⚠️ API connectivity check failed, but continuing...")
        except Exception as e:
            print(f"⚠️ API connectivity check failed: {e}, but continuing...")

        # Run comprehensive test suite
        tester.run_test_suite(WORKSPACE_SLUG, WORKSPACE_ID)

        print("\n🎉 Test suite completed!")

    except Exception as e:
        print(f"❌ Test suite failed: {e}")
        import traceback

        traceback.print_exc()


if __name__ == "__main__":
    main()
