import pytest
from django.urls import reverse
from rest_framework import status
from unittest.mock import patch

from plane.ee.models.issue import WorkItemPage
from plane.db.models import Page, Workspace, Project, Issue, ProjectMember, ProjectPage


@pytest.mark.django_db
class TestIssuePageViewSet:
    @pytest.fixture
    def setup_data(self, session_client, create_user):
        # Create test user
        self.user = create_user
        session_client.force_authenticate(user=self.user)
        # Create workspace
        self.workspace = Workspace.objects.create(name="Test Workspace", slug="test-workspace", owner=self.user)

        # Create project
        self.project = Project.objects.create(name="Test Project", workspace=self.workspace, created_by=self.user)

        self.project_member = ProjectMember.objects.create(
            workspace=self.workspace,
            member=self.user,
            role=20,
            project_id=self.project.id,
            is_active=True,
        )

        # Create issue
        self.issue = Issue.objects.create(
            name="Test Issue",
            project=self.project,
            workspace=self.workspace,
            created_by=self.user,
        )

        # Create pages
        self.global_page = Page.objects.create(
            name="Global Page",
            workspace=self.workspace,
            created_by=self.user,
            is_global=True,
            owned_by_id=self.user.id,
        )

        self.project_page = Page.objects.create(
            name="Project Page",
            workspace=self.workspace,
            created_by=self.user,
            owned_by_id=self.user.id,
        )

        ProjectPage.objects.create(
            workspace=self.workspace,
            created_by=self.user,
            project_id=self.project.id,
            page_id=self.project_page.id,
        )

        return {
            "user": self.user,
            "workspace": self.workspace,
            "project": self.project,
            "issue": self.issue,
            "global_page": self.global_page,
            "project_page": self.project_page,
        }

    @pytest.fixture
    def mock_feature_flag(self):
        """Fixture to mock the feature flag"""

        def mock_decorator(flag_name, default_value=False):
            def wrapper(view_func):
                return view_func

            return wrapper

        with patch("plane.payment.flags.flag_decorator.check_feature_flag", mock_decorator):
            yield

        return mock_decorator

    @pytest.mark.contract
    def test_link_pages_to_issue(self, setup_data, session_client, mock_feature_flag):
        # Arrange
        url = reverse(
            "issue-pages",
            kwargs={
                "slug": self.workspace.slug,
                "project_id": str(self.project.id),
                "issue_id": str(self.issue.id),
            },
        )

        payload = {"pages_ids": [str(self.global_page.id), str(self.project_page.id)]}

        response = session_client.post(url, payload, format="json")

        # Assert
        assert response.status_code == status.HTTP_201_CREATED
        assert len(response.data) == 2

    @pytest.mark.contract
    def test_get_linked_pages(self, setup_data, session_client, mock_feature_flag):
        # Arrange
        WorkItemPage.objects.create(
            workspace=self.workspace,
            project=self.project,
            issue=self.issue,
            page=self.project_page,
            created_by=self.user,
        )
        url = reverse(
            "issue-pages",
            kwargs={
                "slug": self.workspace.slug,
                "project_id": str(self.project.id),
                "issue_id": str(self.issue.id),
            },
        )

        # Act
        response = session_client.get(url)

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1

    @pytest.mark.contract
    def test_unlink_page(self, setup_data, session_client, mock_feature_flag):
        # Arrange
        work_item_page = WorkItemPage.objects.create(
            workspace=self.workspace,
            project=self.project,
            issue=self.issue,
            page=self.project_page,
            created_by=self.user,
        )
        url = reverse(
            "issue-page",
            kwargs={
                "slug": self.workspace.slug,
                "project_id": str(self.project.id),
                "issue_id": str(self.issue.id),
                "page_id": str(work_item_page.page.id),
            },
        )

        # Act
        response = session_client.delete(url)

        # Assert
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not WorkItemPage.objects.filter(id=work_item_page.id).exists()

    @pytest.mark.contract
    def test_link_pages_to_issue_activity_tracking(self, setup_data, session_client, mock_feature_flag):
        # Arrange
        url = reverse(
            "issue-pages",
            kwargs={
                "slug": self.workspace.slug,
                "project_id": str(self.project.id),
                "issue_id": str(self.issue.id),
            },
        )
        payload = {"pages_ids": [str(self.global_page.id), str(self.project_page.id)]}

        # Act
        with patch("plane.bgtasks.issue_activities_task.issue_activity.delay") as mock_activity:
            response = session_client.post(url, payload, format="json")

        # Assert
        assert response.status_code == status.HTTP_201_CREATED
        mock_activity.assert_called_once()

        # Verify activity tracking parameters
        activity_kwargs = mock_activity.call_args[1]
        assert activity_kwargs["type"] == "page.activity.created"
        assert activity_kwargs["requested_data"] == payload
        assert activity_kwargs["actor_id"] == str(self.user.id)
        assert activity_kwargs["issue_id"] == str(self.issue.id)
        assert activity_kwargs["project_id"] == str(self.project.id)
        assert activity_kwargs["subscriber"] is True
        assert activity_kwargs["notification"] is True
        assert "epoch" in activity_kwargs
        assert "origin" in activity_kwargs

    @pytest.mark.contract
    def test_unlink_page_activity_tracking(self, setup_data, session_client, mock_feature_flag):
        # Arrange
        work_item_page = WorkItemPage.objects.create(
            workspace=self.workspace,
            project=self.project,
            issue=self.issue,
            page=self.project_page,
            created_by=self.user,
        )
        url = reverse(
            "issue-page",
            kwargs={
                "slug": self.workspace.slug,
                "project_id": str(self.project.id),
                "issue_id": str(self.issue.id),
                "page_id": str(work_item_page.page.id),
            },
        )

        # Act
        with patch("plane.bgtasks.issue_activities_task.issue_activity.delay") as mock_activity:
            response = session_client.delete(url)

        # Assert
        assert response.status_code == status.HTTP_204_NO_CONTENT
        mock_activity.assert_called_once()

        # Verify activity tracking parameters
        activity_kwargs = mock_activity.call_args[1]
        assert activity_kwargs["type"] == "page.activity.deleted"
        assert activity_kwargs["requested_data"] == str(work_item_page.page.id)
        assert activity_kwargs["actor_id"] == str(self.user.id)
        assert activity_kwargs["issue_id"] == str(self.issue.id)
        assert activity_kwargs["project_id"] == str(self.project.id)
        assert activity_kwargs["subscriber"] is True
        assert activity_kwargs["notification"] is True
        assert activity_kwargs["current_instance"] is None
        assert "epoch" in activity_kwargs
        assert "origin" in activity_kwargs


@pytest.mark.django_db
class TestPageSearchViewSet:
    @pytest.fixture
    def setup_data(self, session_client, create_user):
        # Create test user
        self.user = create_user
        session_client.force_authenticate(user=self.user)

        # Create workspace
        self.workspace = Workspace.objects.create(name="Test Workspace", slug="test-workspace", owner=self.user)

        # Create project
        self.project = Project.objects.create(name="Test Project", workspace=self.workspace, created_by=self.user)

        self.project_member = ProjectMember.objects.create(
            workspace=self.workspace,
            member=self.user,
            role=20,
            project_id=self.project.id,
            is_active=True,
        )

        # Create pages
        self.global_page = Page.objects.create(
            name="Global Test Page",
            workspace=self.workspace,
            created_by=self.user,
            is_global=True,
            owned_by_id=self.user.id,
        )

        self.project_page = Page.objects.create(
            name="Project Test Page",
            workspace=self.workspace,
            created_by=self.user,
            owned_by_id=self.user.id,
        )

        ProjectPage.objects.create(
            workspace=self.workspace,
            created_by=self.user,
            project_id=self.project.id,
            page_id=self.project_page.id,
        )

        return {
            "user": self.user,
            "workspace": self.workspace,
            "project": self.project,
            "global_page": self.global_page,
            "project_page": self.project_page,
        }

    @pytest.fixture
    def mock_feature_flag(self):
        """Fixture to mock the feature flag"""

        def mock_decorator(flag_name, default_value=False):
            def wrapper(view_func):
                return view_func

            return wrapper

        with patch("plane.payment.flags.flag_decorator.check_feature_flag", mock_decorator):
            yield

    @pytest.mark.contract
    def test_search_project_pages(self, setup_data, session_client, mock_feature_flag):
        # Arrange
        url = reverse(
            "issue-page-search",
            kwargs={"slug": self.workspace.slug, "project_id": str(self.project.id)},
        )

        # Act
        response = session_client.get(url)

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1

    @pytest.mark.contract
    def test_search_all_pages(self, setup_data, session_client, mock_feature_flag):
        # Arrange
        url = (
            reverse(
                "issue-page-search",
                kwargs={
                    "slug": self.workspace.slug,
                    "project_id": str(self.project.id),
                },
            )
            + "?is_global=true"
        )

        # Act
        response = session_client.get(url)

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 2

    @pytest.mark.contract
    def test_search_pages_with_query(self, setup_data, session_client, mock_feature_flag):
        # Arrange
        url = (
            reverse(
                "issue-page-search",
                kwargs={
                    "slug": self.workspace.slug,
                    "project_id": str(self.project.id),
                },
            )
            + "?search=Test"
        )

        # Act
        response = session_client.get(url)

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        for page in response.data:
            assert "Test" in page["name"]
