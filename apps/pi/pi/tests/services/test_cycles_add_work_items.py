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
Test for cycles.add_work_items method to verify the fix for the 'data' keyword argument error.

This test can be run with a real API token to verify the fix works correctly.
"""

import os

import pytest

from pi.services.actions.plane_sdk_adapter import PlaneSDKAdapter


class TestCyclesAddWorkItems:
    """Test cycles.add_work_items method."""

    @pytest.mark.skipif(
        not os.getenv("PLANE_API_TOKEN"),
        reason="PLANE_API_TOKEN environment variable not set. Set it to run this test with real API.",
    )
    def test_add_work_items_to_cycle(self):
        """Test adding work items to a cycle with real API."""
        # Get API token from environment
        api_token = os.getenv("PLANE_API_TOKEN")
        workspace_slug = os.getenv("PLANE_WORKSPACE_SLUG", "test-workspace")
        project_id = os.getenv("PLANE_PROJECT_ID", "test-project")
        cycle_id = os.getenv("PLANE_CYCLE_ID", "test-cycle")
        work_item_id = os.getenv("PLANE_WORK_ITEM_ID", "test-work-item")

        # Create adapter
        adapter = PlaneSDKAdapter(access_token=api_token)

        # Test adding work items to cycle
        # This should work without the 'data' keyword argument error
        result = adapter.add_cycle_work_items(
            workspace_slug=workspace_slug,
            project_id=project_id,
            cycle_id=cycle_id,
            issues=[work_item_id],
        )

        # Verify result
        assert result is not None
        print("✅ Successfully added work items to cycle!")
        print(f"   Result: {result}")

    @pytest.mark.skipif(
        not os.getenv("PLANE_API_TOKEN"),
        reason="PLANE_API_TOKEN environment variable not set. Set it to run this test with real API.",
    )
    def test_add_work_items_to_cycle_with_multiple_issues(self):
        """Test adding multiple work items to a cycle."""
        api_token = os.getenv("PLANE_API_TOKEN")
        workspace_slug = os.getenv("PLANE_WORKSPACE_SLUG", "test-workspace")
        project_id = os.getenv("PLANE_PROJECT_ID", "test-project")
        cycle_id = os.getenv("PLANE_CYCLE_ID", "test-cycle")
        work_item_ids = os.getenv("PLANE_WORK_ITEM_IDS", "item1,item2").split(",")

        adapter = PlaneSDKAdapter(access_token=api_token)

        result = adapter.add_cycle_work_items(
            workspace_slug=workspace_slug,
            project_id=project_id,
            cycle_id=cycle_id,
            issues=work_item_ids,
        )

        assert result is not None
        print(f"✅ Successfully added {len(work_item_ids)} work items to cycle!")
        print(f"   Result: {result}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
