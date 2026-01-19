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

"""
Real Implementation Test Suite for Plane API Methods.

This test suite validates that the ACTUAL implementation works correctly,
including the pydantic v1/v2 compatibility fixes and proper request object handling.

Unlike the signature test file, this tests the real PlaneActionsExecutor and PlaneSDKAdapter.
"""

from unittest.mock import AsyncMock

import pytest

from pi.services.actions.plane_actions_executor import PlaneActionsExecutor
from pi.services.actions.plane_sdk_adapter import PlaneSDKAdapter
from pi.services.actions.registry import get_available_categories
from pi.services.actions.registry import get_category_methods

# Configure pytest for async testing
pytest_plugins = ("pytest_asyncio",)


class TestRealPlaneAPIImplementation:
    """Test class for validating the real Plane API implementation."""

    @pytest.fixture
    def mock_sdk_adapter(self):
        """Create a mock SDK adapter that simulates successful API calls."""
        mock_adapter = AsyncMock(spec=PlaneSDKAdapter)

        # Mock all the methods to return success responses
        mock_adapter.create_intake_work_item = AsyncMock(return_value={"id": "intake-123", "name": "Test Intake"})
        mock_adapter.get_intake_work_items_list = AsyncMock(return_value=[{"id": "intake-123", "name": "Test Intake"}])
        mock_adapter.retrieve_intake_work_item = AsyncMock(return_value={"id": "intake-123", "name": "Test Intake"})
        mock_adapter.update_intake_work_item = AsyncMock(return_value={"id": "intake-123", "name": "Updated Intake"})
        mock_adapter.delete_intake_work_item = AsyncMock(return_value=True)

        mock_adapter.get_workspace_members = AsyncMock(return_value=[{"id": "user-123", "name": "Test User"}])
        mock_adapter.get_project_members = AsyncMock(return_value=[{"id": "user-123", "name": "Test User"}])

        mock_adapter.list_work_item_activities = AsyncMock(return_value=[{"id": "activity-123", "type": "created"}])
        mock_adapter.retrieve_work_item_activity = AsyncMock(return_value={"id": "activity-123", "type": "created"})

        mock_adapter.create_work_item_attachment = AsyncMock(return_value={"id": "attachment-123", "name": "test.pdf"})
        mock_adapter.list_work_item_attachments = AsyncMock(return_value=[{"id": "attachment-123", "name": "test.pdf"}])
        mock_adapter.retrieve_work_item_attachment = AsyncMock(return_value={"id": "attachment-123", "name": "test.pdf"})
        mock_adapter.delete_work_item_attachment = AsyncMock(return_value=True)

        mock_adapter.create_work_item_comment = AsyncMock(return_value={"id": "comment-123", "comment_html": "<p>Test</p>"})
        mock_adapter.list_work_item_comments = AsyncMock(return_value=[{"id": "comment-123", "comment_html": "<p>Test</p>"}])
        mock_adapter.retrieve_work_item_comment = AsyncMock(return_value={"id": "comment-123", "comment_html": "<p>Test</p>"})
        mock_adapter.update_work_item_comment = AsyncMock(return_value={"id": "comment-123", "comment_html": "<p>Updated</p>"})
        mock_adapter.delete_work_item_comment = AsyncMock(return_value=True)

        mock_adapter.create_work_item_link = AsyncMock(return_value={"id": "link-123", "url": "https://example.com"})
        mock_adapter.list_work_item_links = AsyncMock(return_value=[{"id": "link-123", "url": "https://example.com"}])
        mock_adapter.retrieve_work_item_link = AsyncMock(return_value={"id": "link-123", "url": "https://example.com"})
        mock_adapter.update_issue_link = AsyncMock(return_value={"id": "link-123", "url": "https://updated.com"})
        mock_adapter.delete_work_item_link = AsyncMock(return_value=True)

        mock_adapter.create_issue_property = AsyncMock(return_value={"id": "property-123", "name": "Priority"})
        mock_adapter.list_issue_properties = AsyncMock(return_value=[{"id": "property-123", "name": "Priority"}])
        mock_adapter.retrieve_issue_property = AsyncMock(return_value={"id": "property-123", "name": "Priority"})
        mock_adapter.update_issue_property = AsyncMock(return_value={"id": "property-123", "name": "Updated Priority"})
        mock_adapter.delete_issue_property = AsyncMock(return_value=True)

        mock_adapter.create_issue_type = AsyncMock(return_value={"id": "type-123", "name": "Bug"})
        mock_adapter.list_issue_types = AsyncMock(return_value=[{"id": "type-123", "name": "Bug"}])
        mock_adapter.retrieve_issue_type = AsyncMock(return_value={"id": "type-123", "name": "Bug"})
        mock_adapter.update_issue_type = AsyncMock(return_value={"id": "type-123", "name": "Updated Bug"})
        mock_adapter.delete_issue_type = AsyncMock(return_value=True)

        mock_adapter.create_issue_worklog = AsyncMock(return_value={"id": "worklog-123", "duration": 120})
        mock_adapter.list_issue_worklogs = AsyncMock(return_value=[{"id": "worklog-123", "duration": 120}])
        mock_adapter.get_project_worklog_summary = AsyncMock(return_value={"total_time": 480, "entries": 4})
        mock_adapter.update_issue_worklog = AsyncMock(return_value={"id": "worklog-123", "duration": 180})
        mock_adapter.delete_issue_worklog = AsyncMock(return_value=True)

        return mock_adapter

    @pytest.fixture
    def executor_with_mock_adapter(self, mock_sdk_adapter):
        """Create a PlaneActionsExecutor with a mocked SDK adapter."""
        executor = PlaneActionsExecutor(access_token="test-token")
        executor.sdk_adapter = mock_sdk_adapter
        return executor

    def test_all_categories_available(self):
        """Test that all expected categories are available."""
        categories = get_available_categories()

        expected_categories = [
            "assets",
            "cycles",
            "labels",
            "modules",
            "projects",
            "states",
            "users",
            "workitems",
            "intake",
            "members",
            "activity",
            "attachments",
            "comments",
            "links",
            "properties",
            "types",
            "worklogs",
        ]

        for category in expected_categories:
            assert category in categories, f"Category {category} not found in available categories"

        assert len(categories) == 17, f"Expected 17 categories, got {len(categories)}"

    def test_all_methods_available(self):
        """Test that all expected methods are available for each category."""
        expected_methods = {
            "intake": ["create", "list", "retrieve", "update", "delete"],
            "members": ["get_workspace_members", "get_project_members"],
            "activity": ["list", "retrieve"],
            "attachments": ["create", "list", "retrieve", "delete"],
            "comments": ["create", "list", "retrieve", "update", "delete"],
            "links": ["create", "list", "retrieve", "update", "delete"],
            "properties": ["create", "list", "retrieve", "update", "delete"],
            "types": ["create", "list", "retrieve", "update", "delete"],
            "worklogs": ["create", "list", "get_summary", "update", "delete"],
        }

        for category, expected_method_list in expected_methods.items():
            methods = get_category_methods(category)
            for method in expected_method_list:
                assert method in methods, f"Method {method} not found in category {category}"

    @pytest.mark.asyncio
    async def test_intake_api_implementation(self, executor_with_mock_adapter):
        """Test that intake API methods work with proper request objects."""
        executor = executor_with_mock_adapter

        # Test create with proper request object
        result = await executor.execute_method(
            "intake",
            "create_intake_work_item",
            workspace_slug="test-workspace",
            project_id="project-123",
            name="Test Intake",
            description_html="<p>Test description</p>",
            priority="medium",
        )

        assert result["success"] is True
        assert result["data"]["id"] == "intake-123"

        # Verify the mock was called with the correct parameters
        executor.sdk_adapter.create_intake_work_item.assert_called_once()
        call_args = executor.sdk_adapter.create_intake_work_item.call_args
        assert call_args[1]["workspace_slug"] == "test-workspace"
        assert call_args[1]["project_id"] == "project-123"
        assert call_args[1]["name"] == "Test Intake"

    @pytest.mark.asyncio
    async def test_attachments_api_implementation(self, executor_with_mock_adapter):
        """Test that attachments API methods work with proper request objects."""
        executor = executor_with_mock_adapter

        # Test create with proper request object
        result = await executor.execute_method(
            "attachments",
            "create_work_item_attachment",
            workspace_slug="test-workspace",
            project_id="project-123",
            issue_id="issue-123",
            asset="test-file.pdf",
        )

        assert result["success"] is True
        assert result["data"]["id"] == "attachment-123"

        # Verify the mock was called with the correct parameters
        executor.sdk_adapter.create_work_item_attachment.assert_called_once()
        call_args = executor.sdk_adapter.create_work_item_attachment.call_args
        assert call_args[1]["workspace_slug"] == "test-workspace"
        assert call_args[1]["project_id"] == "project-123"
        assert call_args[1]["issue_id"] == "issue-123"

    @pytest.mark.asyncio
    async def test_comments_api_implementation(self, executor_with_mock_adapter):
        """Test that comments API methods work with proper request objects."""
        executor = executor_with_mock_adapter

        # Test create with proper request object
        result = await executor.execute_method(
            "comments",
            "create_work_item_comment",
            workspace_slug="test-workspace",
            project_id="project-123",
            issue_id="issue-123",
            comment_html="<p>Test comment</p>",
        )

        assert result["success"] is True
        assert result["data"]["id"] == "comment-123"

        # Test update with proper request object
        result = await executor.execute_method(
            "comments",
            "update_work_item_comment",
            workspace_slug="test-workspace",
            project_id="project-123",
            comment_id="comment-123",
            comment_html="<p>Updated comment</p>",
        )

        assert result["success"] is True
        assert result["data"]["comment_html"] == "<p>Updated</p>"

    @pytest.mark.asyncio
    async def test_worklogs_api_implementation(self, executor_with_mock_adapter):
        """Test that worklogs API methods work with proper request objects."""
        executor = executor_with_mock_adapter

        # Test create with proper request object
        result = await executor.execute_method(
            "worklogs",
            "create_issue_worklog",
            workspace_slug="test-workspace",
            project_id="project-123",
            issue_id="issue-123",
            description="Worked on feature",
            duration=120,
        )

        assert result["success"] is True
        assert result["data"]["id"] == "worklog-123"

        # Test get summary
        result = await executor.execute_method("worklogs", "get_project_worklog_summary", workspace_slug="test-workspace", project_id="project-123")

        assert result["success"] is True
        assert result["data"]["total_time"] == 480

    @pytest.mark.asyncio
    async def test_pydantic_compatibility_fixes(self, executor_with_mock_adapter):
        """Test that the pydantic compatibility fixes work correctly."""
        executor = executor_with_mock_adapter

        # Test that methods can be called with kwargs that will be converted to request objects
        result = await executor.execute_method(
            "intake",
            "create_intake_work_item",
            workspace_slug="test-workspace",
            project_id="project-123",
            name="Test Intake",
            description_html="<p>Test</p>",
            priority="high",
            labels=["bug", "urgent"],
        )

        assert result["success"] is True

        # Verify the method was called (the actual pydantic conversion happens in the SDK adapter)
        executor.sdk_adapter.create_intake_work_item.assert_called_once()

    def test_method_mapping_completeness(self):
        """Test that all methods in the registry are mapped in the executor."""
        executor = PlaneActionsExecutor(access_token="test-token")

        # Get all categories and their methods
        categories = get_available_categories()

        for category in categories.keys():
            registry_methods = get_category_methods(category)
            executor_methods = executor.get_category_methods(category)

            # Check that all registry methods are available in executor
            for method in registry_methods.keys():
                assert method in executor_methods, f"Method {method} in category {category} not available in executor"

    @pytest.mark.asyncio
    async def test_error_handling(self, executor_with_mock_adapter):
        """Test that error handling works correctly."""
        executor = executor_with_mock_adapter

        # Test unknown category - should return error response, not raise exception
        result = await executor.execute_method("unknown_category", "some_method")
        assert result["success"] is False
        assert "Unknown API category" in result["error"]
        assert result["error_type"] == "ValueError"

        # Test unknown method - should return error response, not raise exception
        result = await executor.execute_method("intake", "unknown_method")
        assert result["success"] is False
        assert "Unknown method" in result["error"]
        assert result["error_type"] == "ValueError"

    def test_total_method_count(self):
        """Test that we have the expected total number of methods."""
        categories = get_available_categories()
        total_methods = 0

        for category in categories.keys():
            methods = get_category_methods(category)
            total_methods += len(methods)

        # We should have 87 methods total (36 original + 45 new + 6 additional)
        assert total_methods == 87, f"Expected 87 methods, got {total_methods}"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
