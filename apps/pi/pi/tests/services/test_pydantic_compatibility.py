"""
Test Suite for Pydantic v1/v2 Compatibility.

This test suite specifically validates that the pydantic compatibility fixes
in PlaneSDKAdapter work correctly by testing request object creation.
"""

from unittest.mock import AsyncMock

import pytest

from pi.services.actions.plane_sdk_adapter import PlaneSDKAdapter

# Configure pytest for async testing
pytest_plugins = ("pytest_asyncio",)


class TestPydanticCompatibility:
    """Test class for validating pydantic v1/v2 compatibility."""

    @pytest.fixture
    def mock_sdk_apis(self):
        """Create mock SDK API objects."""
        mock_intake = AsyncMock()
        mock_intake.create_intake_work_item = AsyncMock(return_value={"id": "intake-123"})
        mock_intake.update_intake_work_item = AsyncMock(return_value={"id": "intake-123"})

        mock_attachments = AsyncMock()
        mock_attachments.create_work_item_attachment = AsyncMock(return_value={"id": "attachment-123"})

        mock_comments = AsyncMock()
        mock_comments.create_work_item_comment = AsyncMock(return_value={"id": "comment-123"})
        mock_comments.update_work_item_comment = AsyncMock(return_value={"id": "comment-123"})

        mock_links = AsyncMock()
        mock_links.create_work_item_link = AsyncMock(return_value={"id": "link-123"})
        mock_links.update_issue_link = AsyncMock(return_value={"id": "link-123"})

        mock_properties = AsyncMock()
        mock_properties.create_issue_property = AsyncMock(return_value={"id": "property-123"})
        mock_properties.update_issue_property = AsyncMock(return_value={"id": "property-123"})

        mock_types = AsyncMock()
        mock_types.create_issue_type = AsyncMock(return_value={"id": "type-123"})
        mock_types.update_issue_type = AsyncMock(return_value={"id": "type-123"})

        mock_worklogs = AsyncMock()
        mock_worklogs.create_issue_worklog = AsyncMock(return_value={"id": "worklog-123"})
        mock_worklogs.update_issue_worklog = AsyncMock(return_value={"id": "worklog-123"})

        return {
            "intake": mock_intake,
            "work_item_attachments": mock_attachments,
            "work_item_comments": mock_comments,
            "work_item_links": mock_links,
            "work_item_properties": mock_properties,
            "work_item_types": mock_types,
            "work_item_worklogs": mock_worklogs,
        }

    @pytest.fixture
    def sdk_adapter_with_mock_apis(self, mock_sdk_apis):
        """Create a PlaneSDKAdapter with mocked SDK APIs."""
        adapter = PlaneSDKAdapter(access_token="test-token")

        # Replace the SDK API objects with mocks
        adapter.intake = mock_sdk_apis["intake"]
        adapter.work_item_attachments = mock_sdk_apis["work_item_attachments"]
        adapter.work_item_comments = mock_sdk_apis["work_item_comments"]
        adapter.work_item_links = mock_sdk_apis["work_item_links"]
        adapter.work_item_properties = mock_sdk_apis["work_item_properties"]
        adapter.work_item_types = mock_sdk_apis["work_item_types"]
        adapter.work_item_worklogs = mock_sdk_apis["work_item_worklogs"]

        return adapter

    @pytest.mark.asyncio
    async def test_intake_create_request_object_creation(self, sdk_adapter_with_mock_apis):
        """Test that intake create method properly creates request objects."""
        adapter = sdk_adapter_with_mock_apis

        # Call the method with kwargs - need to provide the correct nested structure
        result = await adapter.create_intake_work_item(
            workspace_slug="test-workspace",
            project_id="project-123",
            issue={"name": "Test Intake", "description_html": "<p>Test description</p>", "priority": "medium"},
            intake="test-intake-id",
        )

        assert result["id"] == "intake-123"

        # Verify the SDK method was called with the correct request object
        adapter.intake.create_intake_work_item.assert_called_once()
        call_args = adapter.intake.create_intake_work_item.call_args

        # Check that the request object was created and passed correctly
        assert call_args[1]["project_id"] == "project-123"
        assert call_args[1]["slug"] == "test-workspace"
        assert "intake_issue_create_request" in call_args[1]

        # The request object should be an instance of IntakeIssueCreateRequest
        request_obj = call_args[1]["intake_issue_create_request"]
        assert hasattr(request_obj, "name")
        assert hasattr(request_obj, "description_html")
        assert hasattr(request_obj, "priority")

    @pytest.mark.asyncio
    async def test_intake_update_request_object_creation(self, sdk_adapter_with_mock_apis):
        """Test that intake update method properly creates patched request objects."""
        adapter = sdk_adapter_with_mock_apis

        # Call the method with kwargs
        result = await adapter.update_intake_work_item(
            workspace_slug="test-workspace", project_id="project-123", intake_id="intake-123", name="Updated Intake", priority="high"
        )

        assert result["id"] == "intake-123"

        # Verify the SDK method was called with the correct patched request object
        adapter.intake.update_intake_work_item.assert_called_once()
        call_args = adapter.intake.update_intake_work_item.call_args

        # Check that the patched request object was created and passed correctly
        assert call_args[1]["pk"] == "intake-123"
        assert call_args[1]["project_id"] == "project-123"
        assert call_args[1]["slug"] == "test-workspace"
        assert "patched_intake_issue_update_request" in call_args[1]

        # The request object should be an instance of PatchedIntakeIssueUpdateRequest
        request_obj = call_args[1]["patched_intake_issue_update_request"]
        assert hasattr(request_obj, "name")
        assert hasattr(request_obj, "priority")

    @pytest.mark.asyncio
    async def test_attachments_create_request_object_creation(self, sdk_adapter_with_mock_apis):
        """Test that attachments create method properly creates request objects."""
        adapter = sdk_adapter_with_mock_apis

        # Call the method with kwargs - need to provide required fields
        result = await adapter.create_work_item_attachment(
            workspace_slug="test-workspace", project_id="project-123", issue_id="issue-123", name="test-file.pdf", size=1024
        )

        assert result["id"] == "attachment-123"

        # Verify the SDK method was called with the correct request object
        adapter.work_item_attachments.create_work_item_attachment.assert_called_once()
        call_args = adapter.work_item_attachments.create_work_item_attachment.call_args

        # Check that the request object was created and passed correctly
        assert call_args[1]["project_id"] == "project-123"
        assert call_args[1]["slug"] == "test-workspace"
        assert "issue_attachment_upload_request" in call_args[1]

        # The request object should be an instance of IssueAttachmentUploadRequest
        request_obj = call_args[1]["issue_attachment_upload_request"]
        assert hasattr(request_obj, "name")
        assert hasattr(request_obj, "size")

    @pytest.mark.asyncio
    async def test_comments_create_request_object_creation(self, sdk_adapter_with_mock_apis):
        """Test that comments create method properly creates request objects."""
        adapter = sdk_adapter_with_mock_apis

        # Call the method with kwargs
        result = await adapter.create_work_item_comment(
            workspace_slug="test-workspace", project_id="project-123", issue_id="issue-123", comment_html="<p>Test comment</p>"
        )

        assert result["id"] == "comment-123"

        # Verify the SDK method was called with the correct request object
        adapter.work_item_comments.create_work_item_comment.assert_called_once()
        call_args = adapter.work_item_comments.create_work_item_comment.call_args

        # Check that the request object was created and passed correctly
        assert call_args[1]["project_id"] == "project-123"
        assert call_args[1]["slug"] == "test-workspace"
        assert "issue_comment_create_request" in call_args[1]

        # The request object should be an instance of IssueCommentCreateRequest
        request_obj = call_args[1]["issue_comment_create_request"]
        assert hasattr(request_obj, "comment_html")

    @pytest.mark.asyncio
    async def test_comments_update_request_object_creation(self, sdk_adapter_with_mock_apis):
        """Test that comments update method properly creates patched request objects."""
        adapter = sdk_adapter_with_mock_apis

        # Call the method with kwargs
        result = await adapter.update_work_item_comment(
            workspace_slug="test-workspace", project_id="project-123", comment_id="comment-123", comment_html="<p>Updated comment</p>"
        )

        assert result["id"] == "comment-123"

        # Verify the SDK method was called with the correct patched request object
        adapter.work_item_comments.update_work_item_comment.assert_called_once()
        call_args = adapter.work_item_comments.update_work_item_comment.call_args

        # Check that the patched request object was created and passed correctly
        assert call_args[1]["pk"] == "comment-123"
        assert call_args[1]["project_id"] == "project-123"
        assert call_args[1]["slug"] == "test-workspace"
        assert "patched_issue_comment_create_request" in call_args[1]

        # The request object should be an instance of PatchedIssueCommentCreateRequest
        request_obj = call_args[1]["patched_issue_comment_create_request"]
        assert hasattr(request_obj, "comment_html")

    @pytest.mark.asyncio
    async def test_worklogs_create_request_object_creation(self, sdk_adapter_with_mock_apis):
        """Test that worklogs create method properly creates request objects."""
        adapter = sdk_adapter_with_mock_apis

        # Call the method with kwargs
        result = await adapter.create_issue_worklog(
            workspace_slug="test-workspace", project_id="project-123", issue_id="issue-123", description="Worked on feature", duration=120
        )

        assert result["id"] == "worklog-123"

        # Verify the SDK method was called with the correct request object
        adapter.work_item_worklogs.create_issue_worklog.assert_called_once()
        call_args = adapter.work_item_worklogs.create_issue_worklog.call_args

        # Check that the request object was created and passed correctly
        assert call_args[1]["project_id"] == "project-123"
        assert call_args[1]["slug"] == "test-workspace"
        assert "issue_work_log_api_request" in call_args[1]

        # The request object should be an instance of IssueWorkLogAPIRequest
        request_obj = call_args[1]["issue_work_log_api_request"]
        assert hasattr(request_obj, "description")
        assert hasattr(request_obj, "duration")

    @pytest.mark.asyncio
    async def test_all_request_object_types_covered(self, sdk_adapter_with_mock_apis):
        """Test that all the new request object types are properly handled."""
        adapter = sdk_adapter_with_mock_apis

        # Test all the different request object types
        test_cases = [
            # (method, kwargs, expected_request_param)
            (
                adapter.create_work_item_link,
                {"workspace_slug": "test-workspace", "project_id": "project-123", "issue_id": "issue-123", "url": "https://example.com"},
                "issue_link_create_request",
            ),
            (
                adapter.update_issue_link,
                {"workspace_slug": "test-workspace", "project_id": "project-123", "link_id": "link-123", "url": "https://updated.com"},
                "patched_issue_link_update_request",
            ),
            (
                adapter.create_issue_property,
                {"workspace_slug": "test-workspace", "project_id": "project-123", "name": "Priority", "description": "Custom priority field"},
                "issue_property_api_request",
            ),
            (
                adapter.update_issue_property,
                {"workspace_slug": "test-workspace", "project_id": "project-123", "property_id": "property-123", "name": "Updated Priority"},
                "patched_issue_property_api_request",
            ),
            (
                adapter.create_issue_type,
                {"workspace_slug": "test-workspace", "project_id": "project-123", "name": "Bug", "description": "Bug report type"},
                "issue_type_api_request",
            ),
            (
                adapter.update_issue_type,
                {"workspace_slug": "test-workspace", "project_id": "project-123", "type_id": "type-123", "name": "Updated Bug"},
                "patched_issue_type_api_request",
            ),
            (
                adapter.update_issue_worklog,
                {
                    "workspace_slug": "test-workspace",
                    "project_id": "project-123",
                    "worklog_id": "worklog-123",
                    "description": "Updated work",
                    "duration": 180,
                },
                "patched_issue_work_log_api_request",
            ),
        ]

        for method, kwargs, expected_request_param in test_cases:
            # Call the method
            result = await method(**kwargs)

            # Verify the result is successful
            assert result is not None

            # Get the mock call
            mock_call = method.call_args
            assert mock_call is not None

            # Verify the request object parameter exists
            assert expected_request_param in mock_call[1], f"Expected {expected_request_param} in call args for {method.__name__}"

            # Verify the request object has the expected attributes
            request_obj = mock_call[1][expected_request_param]
            assert request_obj is not None, f"Request object should not be None for {method.__name__}"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
