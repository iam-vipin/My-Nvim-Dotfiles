# Standard library imports
from typing import Optional

# Django imports
from django.db.models import QuerySet
from django_filters import filters
from django_filters.rest_framework import DjangoFilterBackend
from django_filters.rest_framework.filterset import FilterSet

# Third-party imports
from rest_framework import status
from rest_framework.filters import SearchFilter
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response

# Module imports
from plane.authentication.models import Application, ApplicationCategory
from plane.ee.views.base import BaseAPIView
from plane.utils.global_paginator import paginate

# Local imports
from ..serializers import (
    ApplicationCategorySerializer,
    ApplicationMetaSerializer,
    ApplicationSerializer,
)


class ApplicationCategoryEndpoint(BaseAPIView):
    """
    Application Category Endpoint
    """

    permission_classes = [AllowAny]
    model = ApplicationCategory
    serializer_class = ApplicationCategorySerializer

    def get(self, request: Request) -> Response:
        application_categories: QuerySet[ApplicationCategory] = self.model.objects.filter(is_active=True).order_by(
            "sort_order"
        )
        serialized_application_categories = self.serializer_class(application_categories, many=True)
        return Response(serialized_application_categories.data, status=status.HTTP_200_OK)


class ApplicationFilter(FilterSet):
    """
    Application Filter
    """

    category = filters.CharFilter(field_name="categories__slug")

    class Meta:
        model = Application
        fields = ["company_name", "category"]


class ApplicationEndpoint(BaseAPIView):
    """
    Published Application list Endpoint or with optional pk
    """

    PAGINATOR_MAX_LIMIT = 100

    permission_classes = [AllowAny]
    model = Application
    serializer_class = ApplicationSerializer
    # Filtering and searching
    filter_backends = (DjangoFilterBackend, SearchFilter)
    filterset_class = ApplicationFilter
    search_fields = ["name", "description_stripped", "company_name", "categories__name"]
    ordering_fields = ["name", "is_featured"]

    def get_queryset(self) -> QuerySet[Application]:
        return (
            self.model.objects.filter(published_at__isnull=False)
            .select_related("logo_asset")
            .prefetch_related("attachments", "categories")
        )

    def get(self, request: Request, pk: Optional[str] = None) -> Response:
        # base query set
        application_query_set: QuerySet[Application] = self.get_queryset()

        order_by = request.query_params.get("order_by", "-is_featured")
        if order_by.lstrip("-") in self.ordering_fields:
            application_query_set = application_query_set.order_by(order_by)

        filtered_queryset = self.filter_queryset(application_query_set)

        if pk:
            try:
                application: Application = filtered_queryset.get(id=pk)
                serialized_application = self.serializer_class(application)
                return Response(serialized_application.data, status=status.HTTP_200_OK)
            except Application.DoesNotExist:
                return Response(
                    {"error": "Application with the given ID does not exist."},
                    status=status.HTTP_404_NOT_FOUND,
                )

        paginated_cursor = request.query_params.get("cursor", None)
        if paginated_cursor is None:
            paginated_cursor = f"{self.PAGINATOR_MAX_LIMIT}:0:0"

        paginated_response = paginate(
            base_queryset=filtered_queryset,
            queryset=filtered_queryset,
            cursor=paginated_cursor,
            on_result=lambda results: self.serializer_class(results, many=True).data,
        )

        return Response(paginated_response, status=status.HTTP_200_OK)


class ApplicationBySlugEndpoint(BaseAPIView):
    """
    Published Application By Slug Endpoint
    """

    permission_classes = [AllowAny]
    model = Application
    serializer_class = ApplicationSerializer

    def get_queryset(self) -> QuerySet[Application]:
        return (
            self.model.objects.filter(published_at__isnull=False)
            .select_related("logo_asset")
            .prefetch_related("attachments", "categories")
        )

    def get(self, request: Request, slug: str) -> Response:
        try:
            application: Application = self.get_queryset().get(slug=slug)
            serialized_application = self.serializer_class(application)
            return Response(serialized_application.data, status=status.HTTP_200_OK)
        except Application.DoesNotExist:
            return Response(
                {"error": "Application with the given slug does not exist."},
                status=status.HTTP_404_NOT_FOUND,
            )


class ApplicationMetaEndpoint(BaseAPIView):
    """
    Published Application Meta Endpoint
    """

    permission_classes = [AllowAny]
    model = Application
    serializer_class = ApplicationMetaSerializer

    def get_queryset(self) -> QuerySet[Application]:
        return self.model.objects.filter(published_at__isnull=False)

    def get(self, request: Request, slug: Optional[str] = None) -> Response:
        if slug:
            try:
                application: Application = self.get_queryset().get(slug=slug)
                serialized_application = self.serializer_class(application)
                return Response(serialized_application.data, status=status.HTTP_200_OK)
            except Application.DoesNotExist:
                return Response(
                    {"error": "Application with the given slug does not exist."},
                    status=status.HTTP_404_NOT_FOUND,
                )

        applications: QuerySet[Application] = self.get_queryset()
        serialized_applications = self.serializer_class(applications, many=True)
        return Response(serialized_applications.data, status=status.HTTP_200_OK)
