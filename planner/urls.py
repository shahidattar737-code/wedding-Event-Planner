from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    ClientViewSet,
    EventViewSet,
    VendorViewSet,
    QuotationViewSet,
    BudgetItemViewSet,
    EventTaskViewSet,
    PaymentViewSet,
    EventDocumentViewSet,
    RegisterView,
    LoginView,
    AdminLoginView,
    ReportsSummaryView,
    NotificationsListView,
)


router = DefaultRouter()

# Main management APIs
router.register(
    r"clients",
    ClientViewSet,
    basename="client",
)

router.register(
    r"events",
    EventViewSet,
    basename="event",
)

router.register(
    r"vendors",
    VendorViewSet,
    basename="vendor",
)

router.register(
    r"quotations",
    QuotationViewSet,
    basename="quotation",
)

router.register(
    r"budget-items",
    BudgetItemViewSet,
    basename="budget-item",
)

router.register(
    r"tasks",
    EventTaskViewSet,
    basename="task",
)

router.register(
    r"payments",
    PaymentViewSet,
    basename="payment",
)

router.register(
    r"documents",
    EventDocumentViewSet,
    basename="document",
)


urlpatterns = [
    # Authentication
    path(
        "register/",
        RegisterView.as_view(),
        name="register",
    ),

    path(
        "login/",
        LoginView.as_view(),
        name="login",
    ),

    path(
        "admin-login/",
        AdminLoginView.as_view(),
        name="admin-login",
    ),

    # Reports
    path(
        "reports/summary/",
        ReportsSummaryView.as_view(),
        name="reports-summary",
    ),

    # Notifications
    path(
        "notifications/",
        NotificationsListView.as_view(),
        name="notifications",
    ),
] + router.urls