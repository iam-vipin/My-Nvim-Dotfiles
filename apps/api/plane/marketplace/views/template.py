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
from plane.ee.models import Template, TemplateCategory
from plane.ee.views.base import BaseAPIView
from plane.utils.global_paginator import paginate

# Local imports
from ..serializers import (
    TemplateCategorySerializer,
    TemplateDetailSerializer,
    TemplateMetaSerializer,
    TemplateSerializer,
)


class TemplateCategoryEndpoint(BaseAPIView):
    """
    Template Category Endpoint
    """

    permission_classes = [AllowAny]
    model = TemplateCategory
    serializer_class = TemplateCategorySerializer

    def get(self, request: Request) -> Response:
        template_categories: QuerySet[TemplateCategory] = self.model.objects.filter(is_active=True).order_by(
            "sort_order"
        )
        serialized_template_categories = self.serializer_class(template_categories, many=True)
        return Response(serialized_template_categories.data, status=status.HTTP_200_OK)


class TemplateFilter(FilterSet):
    """
    Template Filter
    """

    category = filters.CharFilter(field_name="categories__slug")

    class Meta:
        model = Template
        fields = ["template_type", "is_verified", "company_name", "category"]


class TemplateEndpoint(BaseAPIView):
    """
    Template Endpoint
    """

    PAGINATOR_MAX_LIMIT = 100

    permission_classes = [AllowAny]
    model = Template
    serializer_class = TemplateSerializer
    detail_serializer_class = TemplateDetailSerializer
    # Filtering and searching
    filter_backends = (DjangoFilterBackend, SearchFilter)
    filterset_class = TemplateFilter
    search_fields = ["name", "description_stripped", "company_name", "categories__name"]
    ordering_fields = ["name", "created_at"]

    def get_queryset(self) -> QuerySet[Template]:
        return (
            self.model.objects.filter(is_published=True)
            .select_related("cover_image_asset")
            .prefetch_related("attachments", "categories")
        )

    def get(self, request: Request, pk: Optional[str] = None, short_id: Optional[str] = None) -> Response:
        template_queryset = self.get_queryset()

        order_by = request.query_params.get("order_by", "-created_at")
        if order_by.lstrip("-") in self.ordering_fields:
            template_queryset = template_queryset.order_by(order_by)

        filtered_queryset = self.filter_queryset(template_queryset)

        # Get template by ID if provided
        if pk:
            try:
                template = filtered_queryset.get(id=pk)
                serialized_template = self.detail_serializer_class(template)
                return Response(serialized_template.data, status=status.HTTP_200_OK)
            except Template.DoesNotExist:
                return Response(
                    {"error": "Template with the given ID does not exist."},
                    status=status.HTTP_404_NOT_FOUND,
                )

        # Get template by short ID if provided
        if short_id:
            try:
                template = filtered_queryset.get(short_id=short_id)
                serialized_template = self.detail_serializer_class(template)
                return Response(serialized_template.data, status=status.HTTP_200_OK)
            except Template.DoesNotExist:
                return Response(
                    {"error": "Template with the given short_id does not exist."},
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


class TemplateMetaEndpoint(BaseAPIView):
    """
    Published Template Meta Endpoint
    """

    permission_classes = [AllowAny]
    model = Template
    serializer_class = TemplateMetaSerializer

    def get_queryset(self) -> QuerySet[Template]:
        return self.model.objects.filter(is_published=True)

    def get(self, request: Request, short_id: Optional[str] = None) -> Response:
        if short_id:
            try:
                template = self.get_queryset().get(short_id=short_id)
                serialized_template = self.serializer_class(template)
                return Response(serialized_template.data, status=status.HTTP_200_OK)
            except Template.DoesNotExist:
                return Response(
                    {"error": "Template with the given short_id does not exist."},
                    status=status.HTTP_404_NOT_FOUND,
                )

        templates: QuerySet[Template] = self.get_queryset()
        serialized_templates = self.serializer_class(templates, many=True)
        return Response(serialized_templates.data, status=status.HTTP_200_OK)
