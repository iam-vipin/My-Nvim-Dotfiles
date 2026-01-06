# Django imports
from django.urls import path

# Module imports
from plane.silo.views import ImportJobAPIView

# Job endpoints
urlpatterns = [
    path("import-jobs/", ImportJobAPIView.as_view(), name="import-jobs"),
    path("import-jobs/<uuid:pk>/", ImportJobAPIView.as_view(), name="import-job"),
]
