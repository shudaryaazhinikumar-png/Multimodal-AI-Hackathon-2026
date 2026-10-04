from django.urls import path

from . import views


urlpatterns = [
    path("", views.materials_list, name="materials-list"),
    path("upload", views.material_upload, name="material-upload"),
    path(
        "<int:material_id>",
        views.material_delete,
        name="material-delete",
    ),
    path(
        "<int:material_id>/reprocess",
        views.material_reprocess,
        name="material-reprocess",
    ),
]