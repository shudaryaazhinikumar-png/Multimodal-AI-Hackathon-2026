from django.contrib import admin

from .models import StudentProfile


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "education", "learning_goal", "avatar")
    search_fields = (
        "user__email",
        "user__username",
        "user__first_name",
        "user__last_name",
        "learning_goal",
    )
