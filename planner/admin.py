
from django.contrib import admin
from .models import Event, Client


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "event_type",
        "client_name",
        "event_date",
        "venue",
        "budget",
        "status",
    )

    list_filter = ("status", "event_type", "event_date")
    search_fields = ("name", "client_name", "venue")


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "phone",
        "email",
        "created_at",
    )

    search_fields = ("name", "phone", "email")
    list_filter = ("created_at",)
