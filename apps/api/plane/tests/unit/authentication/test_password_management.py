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

import pytest

from rest_framework import status
from rest_framework.test import APIClient

from plane.db.models import User
from plane.authentication.adapter.error import AUTHENTICATION_ERROR_CODES


# URL path for change password endpoint
CHANGE_PASSWORD_URL = "/auth/change-password/"


@pytest.fixture
def test_user(db):
    """Create a test user for password management tests"""
    user = User.objects.create(
        email="passwordtest@plane.so",
        first_name="Password",
        last_name="Test",
        is_password_autoset=False,
    )
    user.set_password("OldPassword123!")
    user.save()
    return user


@pytest.fixture
def test_user_autoset(db):
    """Create a test user with auto-set password"""
    user = User.objects.create(
        email="autosettest@plane.so",
        first_name="AutoSet",
        last_name="Test",
        is_password_autoset=True,
    )
    user.set_password("AutoSetPassword123!")
    user.save()
    return user


@pytest.fixture
def authenticated_client(test_user):
    """Return an authenticated API client"""
    client = APIClient()
    client.force_authenticate(user=test_user)
    return client


@pytest.fixture
def authenticated_autoset_client(test_user_autoset):
    """Return an authenticated API client for autoset user"""
    client = APIClient()
    client.force_authenticate(user=test_user_autoset)
    return client


@pytest.mark.unit
class TestChangePasswordEndpoint:
    """Test the ChangePasswordEndpoint for password reuse prevention"""

    @pytest.mark.django_db
    def test_change_password_same_as_current_rejected(self, authenticated_client, test_user):
        """Test that changing password to the same value is rejected"""
        response = authenticated_client.post(
            CHANGE_PASSWORD_URL,
            {
                "old_password": "OldPassword123!",
                "new_password": "OldPassword123!",  # Same as current
            },
            format="json",
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data["error_code"] == AUTHENTICATION_ERROR_CODES["PASSWORD_SAME_AS_CURRENT"]

    @pytest.mark.django_db
    def test_change_password_success_with_different_password(self, authenticated_client, test_user):
        """Test that changing password to a different value succeeds"""
        response = authenticated_client.post(
            CHANGE_PASSWORD_URL,
            {
                "old_password": "OldPassword123!",
                "new_password": "NewStrongPassword456!",  # Different password
            },
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data["message"] == "Password updated successfully"

        # Verify password was actually changed
        test_user.refresh_from_db()
        assert test_user.check_password("NewStrongPassword456!")
        assert not test_user.check_password("OldPassword123!")

    @pytest.mark.django_db
    def test_change_password_incorrect_old_password(self, authenticated_client, test_user):
        """Test that incorrect old password is rejected"""
        response = authenticated_client.post(
            CHANGE_PASSWORD_URL,
            {
                "old_password": "WrongOldPassword!",
                "new_password": "NewStrongPassword456!",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data["error_code"] == AUTHENTICATION_ERROR_CODES["INCORRECT_OLD_PASSWORD"]

    @pytest.mark.django_db
    def test_change_password_weak_password_rejected(self, authenticated_client, test_user):
        """Test that weak new password is rejected"""
        response = authenticated_client.post(
            CHANGE_PASSWORD_URL,
            {
                "old_password": "OldPassword123!",
                "new_password": "weak",  # Weak password
            },
            format="json",
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data["error_code"] == AUTHENTICATION_ERROR_CODES["INVALID_NEW_PASSWORD"]

    @pytest.mark.django_db
    def test_change_password_missing_old_password(self, authenticated_client, test_user):
        """Test that missing old password is rejected"""
        response = authenticated_client.post(
            CHANGE_PASSWORD_URL,
            {
                "new_password": "NewStrongPassword456!",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data["error_code"] == AUTHENTICATION_ERROR_CODES["MISSING_PASSWORD"]

    @pytest.mark.django_db
    def test_change_password_missing_new_password(self, authenticated_client, test_user):
        """Test that missing new password is rejected"""
        response = authenticated_client.post(
            CHANGE_PASSWORD_URL,
            {
                "old_password": "OldPassword123!",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data["error_code"] == AUTHENTICATION_ERROR_CODES["MISSING_PASSWORD"]

    @pytest.mark.django_db
    def test_change_password_autoset_user_no_old_password_required(self, authenticated_autoset_client, test_user_autoset):
        """Test that user with autoset password doesn't need old password"""
        response = authenticated_autoset_client.post(
            CHANGE_PASSWORD_URL,
            {
                "new_password": "NewStrongPassword456!",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK

        # Verify password was changed and autoset flag cleared
        test_user_autoset.refresh_from_db()
        assert test_user_autoset.check_password("NewStrongPassword456!")
        assert not test_user_autoset.is_password_autoset


@pytest.mark.unit
class TestPasswordSameAsCurrentErrorCode:
    """Test that PASSWORD_SAME_AS_CURRENT error code is properly defined"""

    def test_error_code_exists(self):
        """Test that PASSWORD_SAME_AS_CURRENT error code is defined"""
        assert "PASSWORD_SAME_AS_CURRENT" in AUTHENTICATION_ERROR_CODES
        assert AUTHENTICATION_ERROR_CODES["PASSWORD_SAME_AS_CURRENT"] == 5142
