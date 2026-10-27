from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import authenticate
from django.db.models import Count, Q, Sum
from django.utils import timezone

from rest_framework import status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    Client,
    Event,
    Vendor,
    Quotation,
    BudgetItem,
    EventTask,
    Payment,
    EventDocument,
)

from .serializers import (
    ClientSerializer,
    EventSerializer,
    VendorSerializer,
    QuotationSerializer,
    BudgetItemSerializer,
    EventTaskSerializer,
    PaymentSerializer,
    EventDocumentSerializer,
    RegisterSerializer,
    LoginSerializer,
)


# ============================================================
# CLIENT MANAGEMENT API
# ============================================================

class ClientViewSet(viewsets.ModelViewSet):
    serializer_class = ClientSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.is_superuser:
            return Client.objects.all().order_by("-id")

        return Client.objects.filter(
            created_by=user
        ).order_by("-id")

    def perform_create(self, serializer):
        serializer.save(
            created_by=self.request.user
        )


# ============================================================
# EVENT MANAGEMENT API
# ============================================================

class EventViewSet(viewsets.ModelViewSet):
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.is_superuser:
            return Event.objects.all().order_by("-id")

        return Event.objects.filter(
            created_by=user
        ).order_by("-id")

    def perform_create(self, serializer):
        serializer.save(
            created_by=self.request.user
        )


# ============================================================
# VENDOR MANAGEMENT API
# ============================================================

class VendorViewSet(viewsets.ModelViewSet):
    serializer_class = VendorSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.is_superuser:
            return Vendor.objects.all().order_by("-id")

        return Vendor.objects.filter(
            created_by=user
        ).order_by("-id")

    def perform_create(self, serializer):
        serializer.save(
            created_by=self.request.user
        )


# ============================================================
# ACCESS VALIDATION
# ============================================================

def validate_event_access(event, user):
    if (
        not user.is_superuser
        and event.created_by_id != user.id
    ):
        raise ValidationError(
            "You can only manage records for your own events."
        )


def validate_vendor_access(vendor, user):
    if (
        vendor is not None
        and not user.is_superuser
        and vendor.created_by_id != user.id
    ):
        raise ValidationError(
            "You can only select vendors belonging to your account."
        )


# ============================================================
# QUOTATION MANAGEMENT API
# ============================================================

class QuotationViewSet(viewsets.ModelViewSet):
    serializer_class = QuotationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        queryset = Quotation.objects.select_related(
            "event",
            "created_by",
        )

        if user.is_superuser:
            return queryset.order_by("-id")

        return queryset.filter(
            created_by=user,
            event__created_by=user,
        ).order_by("-id")

    def perform_create(self, serializer):
        event = serializer.validated_data["event"]

        validate_event_access(
            event,
            self.request.user,
        )

        serializer.save(
            created_by=self.request.user
        )

    def perform_update(self, serializer):
        event = serializer.validated_data.get(
            "event",
            serializer.instance.event,
        )

        validate_event_access(
            event,
            self.request.user,
        )

        serializer.save()


# ============================================================
# BUDGET ITEM MANAGEMENT API
# ============================================================

class BudgetItemViewSet(viewsets.ModelViewSet):
    serializer_class = BudgetItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        queryset = BudgetItem.objects.select_related(
            "event",
            "created_by",
        )

        if user.is_superuser:
            return queryset.order_by("-id")

        return queryset.filter(
            created_by=user,
            event__created_by=user,
        ).order_by("-id")

    def perform_create(self, serializer):
        event = serializer.validated_data["event"]

        validate_event_access(
            event,
            self.request.user,
        )

        serializer.save(
            created_by=self.request.user
        )

    def perform_update(self, serializer):
        event = serializer.validated_data.get(
            "event",
            serializer.instance.event,
        )

        validate_event_access(
            event,
            self.request.user,
        )

        serializer.save()


# ============================================================
# TASK MANAGEMENT API
# ============================================================

class EventTaskViewSet(viewsets.ModelViewSet):
    serializer_class = EventTaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        queryset = EventTask.objects.select_related(
            "event",
            "assigned_to",
            "created_by",
        )

        if user.is_superuser:
            return queryset.order_by("-id")

        return queryset.filter(
            created_by=user,
            event__created_by=user,
        ).order_by("-id")

    def perform_create(self, serializer):
        event = serializer.validated_data["event"]

        validate_event_access(
            event,
            self.request.user,
        )

        serializer.save(
            created_by=self.request.user
        )

    def perform_update(self, serializer):
        event = serializer.validated_data.get(
            "event",
            serializer.instance.event,
        )

        validate_event_access(
            event,
            self.request.user,
        )

        serializer.save()


# ============================================================
# PAYMENT MANAGEMENT API
# ============================================================

class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        queryset = Payment.objects.select_related(
            "event",
            "vendor",
            "created_by",
        )

        if user.is_superuser:
            return queryset.order_by("-id")

        return queryset.filter(
            created_by=user,
            event__created_by=user,
        ).order_by("-id")

    def perform_create(self, serializer):
        event = serializer.validated_data["event"]
        vendor = serializer.validated_data.get("vendor")

        validate_event_access(
            event,
            self.request.user,
        )

        validate_vendor_access(
            vendor,
            self.request.user,
        )

        serializer.save(
            created_by=self.request.user
        )

    def perform_update(self, serializer):
        event = serializer.validated_data.get(
            "event",
            serializer.instance.event,
        )

        vendor = serializer.validated_data.get(
            "vendor",
            serializer.instance.vendor,
        )

        validate_event_access(
            event,
            self.request.user,
        )

        validate_vendor_access(
            vendor,
            self.request.user,
        )

        serializer.save()


# ============================================================
# DOCUMENT MANAGEMENT API
# ============================================================

class EventDocumentViewSet(viewsets.ModelViewSet):
    serializer_class = EventDocumentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        queryset = EventDocument.objects.select_related(
            "event",
            "uploaded_by",
        )

        if user.is_superuser:
            return queryset.order_by("-id")

        return queryset.filter(
            uploaded_by=user,
            event__created_by=user,
        ).order_by("-id")

    def perform_create(self, serializer):
        event = serializer.validated_data["event"]

        validate_event_access(
            event,
            self.request.user,
        )

        serializer.save(
            uploaded_by=self.request.user
        )

    def perform_update(self, serializer):
        event = serializer.validated_data.get(
            "event",
            serializer.instance.event,
        )

        validate_event_access(
            event,
            self.request.user,
        )

        serializer.save()


# ============================================================
# USER REGISTRATION API
# ============================================================

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(
            data=request.data
        )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = serializer.save()

        return Response(
            {
                "message": "Registration successful",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "is_admin": False,
                },
            },
            status=status.HTTP_201_CREATED,
        )


# ============================================================
# USER LOGIN API
# ============================================================

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(
            data=request.data
        )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        username = serializer.validated_data["username"]
        password = serializer.validated_data["password"]

        user = authenticate(
            request,
            username=username,
            password=password,
        )

        if (
            user is not None
            and user.is_active
            and not user.is_superuser
        ):
            token, _ = Token.objects.get_or_create(
                user=user
            )

            return Response(
                {
                    "message": "User login successful",
                    "token": token.key,
                    "user": {
                        "id": user.id,
                        "username": user.username,
                        "email": user.email,
                        "is_admin": False,
                    },
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {
                "error": "Invalid user username or password"
            },
            status=status.HTTP_401_UNAUTHORIZED,
        )


# ============================================================
# ADMIN LOGIN API
# ============================================================

class AdminLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(
            data=request.data
        )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        username = serializer.validated_data["username"]
        password = serializer.validated_data["password"]

        user = authenticate(
            request,
            username=username,
            password=password,
        )

        if (
            user is not None
            and user.is_active
            and user.is_superuser
        ):
            token, _ = Token.objects.get_or_create(
                user=user
            )

            return Response(
                {
                    "message": "Admin login successful",
                    "token": token.key,
                    "user": {
                        "id": user.id,
                        "username": user.username,
                        "email": user.email,
                        "is_admin": True,
                    },
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {
                "error": "Invalid admin username or password"
            },
            status=status.HTTP_401_UNAUTHORIZED,
        )


# ============================================================
# REPORTS & ANALYTICS API
# ============================================================

class ReportsSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # ----------------------------------------------------
        # GET USER EVENTS
        # ----------------------------------------------------

        if user.is_superuser:
            events = Event.objects.all()
            quotations = Quotation.objects.all()
            budget_items = BudgetItem.objects.all()
            tasks = EventTask.objects.all()
            payments = Payment.objects.all()
        else:
            events = Event.objects.filter(
                created_by=user
            )

            quotations = Quotation.objects.filter(
                created_by=user,
                event__created_by=user,
            )

            budget_items = BudgetItem.objects.filter(
                created_by=user,
                event__created_by=user,
            )

            tasks = EventTask.objects.filter(
                created_by=user,
                event__created_by=user,
            )

            payments = Payment.objects.filter(
                created_by=user,
                event__created_by=user,
            )

        # ----------------------------------------------------
        # EVENT SUMMARY
        # ----------------------------------------------------

        total_events = events.count()

        planning_events = events.filter(
            status="Planning"
        ).count()

        confirmed_events = events.filter(
            status="Confirmed"
        ).count()

        completed_events = events.filter(
            status="Completed"
        ).count()

        cancelled_events = events.filter(
            status="Cancelled"
        ).count()

        combined_event_budget = (
            events.aggregate(
                total=Sum("budget")
            )["total"]
            or Decimal("0.00")
        )

        # ----------------------------------------------------
        # QUOTATION SUMMARY
        # ----------------------------------------------------

        total_quotations = quotations.count()

        quotation_value = (
            quotations.aggregate(
                total=Sum("total_amount")
            )["total"]
            or Decimal("0.00")
        )

        # ----------------------------------------------------
        # BUDGET SUMMARY
        # ----------------------------------------------------

        planned_expenses = (
            budget_items.aggregate(
                total=Sum("planned_amount")
            )["total"]
            or Decimal("0.00")
        )

        actual_expenses = (
            budget_items.aggregate(
                total=Sum("actual_amount")
            )["total"]
            or Decimal("0.00")
        )

        budget_variance = (
            planned_expenses - actual_expenses
        )

        # ----------------------------------------------------
        # PAYMENT SUMMARY
        # ----------------------------------------------------

        payments_received = (
            payments.filter(
                status="Paid"
            ).aggregate(
                total=Sum("amount")
            )["total"]
            or Decimal("0.00")
        )

        pending_payments = (
            payments.filter(
                status="Pending"
            ).aggregate(
                total=Sum("amount")
            )["total"]
            or Decimal("0.00")
        )

        cancelled_payments = (
            payments.filter(
                status="Cancelled"
            ).aggregate(
                total=Sum("amount")
            )["total"]
            or Decimal("0.00")
        )

        # ----------------------------------------------------
        # VENDOR PAYMENT SUMMARY
        # ----------------------------------------------------

        vendor_payments_paid = (
            payments.filter(
                payment_type="Vendor",
                status="Paid",
            ).aggregate(
                total=Sum("amount")
            )["total"]
            or Decimal("0.00")
        )

        vendor_payments_pending = (
            payments.filter(
                payment_type="Vendor",
                status="Pending",
            ).aggregate(
                total=Sum("amount")
            )["total"]
            or Decimal("0.00")
        )

        # ----------------------------------------------------
        # TASK SUMMARY
        # ----------------------------------------------------

        total_tasks = tasks.count()

        completed_tasks = tasks.filter(
            status="Completed"
        ).count()

        in_progress_tasks = tasks.filter(
            status="In Progress"
        ).count()

        pending_tasks = tasks.filter(
            status="Pending"
        ).count()

        cancelled_tasks = tasks.filter(
            status="Cancelled"
        ).count()

        if total_tasks > 0:
            task_completion_percentage = round(
                (
                    completed_tasks
                    / total_tasks
                ) * 100
            )
        else:
            task_completion_percentage = 0

        # ----------------------------------------------------
        # EVENT-WISE REPORT
        # ----------------------------------------------------

        event_reports = []

        for event in events.order_by(
            "event_date",
            "id",
        ):
            event_budget_items = budget_items.filter(
                event=event
            )

            event_quotations = quotations.filter(
                event=event
            )

            event_payments = payments.filter(
                event=event
            )

            event_tasks = tasks.filter(
                event=event
            )

            event_planned = (
                event_budget_items.aggregate(
                    total=Sum("planned_amount")
                )["total"]
                or Decimal("0.00")
            )

            event_actual = (
                event_budget_items.aggregate(
                    total=Sum("actual_amount")
                )["total"]
                or Decimal("0.00")
            )

            approved_quote = (
                event_quotations.filter(
                    status="Approved"
                ).aggregate(
                    total=Sum("total_amount")
                )["total"]
                or Decimal("0.00")
            )

            event_paid = (
                event_payments.filter(
                    status="Paid"
                ).aggregate(
                    total=Sum("amount")
                )["total"]
                or Decimal("0.00")
            )

            event_pending = (
                event_payments.filter(
                    status="Pending"
                ).aggregate(
                    total=Sum("amount")
                )["total"]
                or Decimal("0.00")
            )

            event_total_tasks = event_tasks.count()

            event_completed_tasks = event_tasks.filter(
                status="Completed"
            ).count()

            budget_balance = (
                event.budget - event_actual
            )

            event_reports.append(
                {
                    "id": event.id,
                    "event": event.name,
                    "name": event.name,
                    "date": event.event_date,
                    "status": event.status,
                    "event_budget": event.budget,
                    "budget_balance": budget_balance,
                    "approved_quote": approved_quote,
                    "planned_expenses": event_planned,
                    "actual_expenses": event_actual,
                    "paid": event_paid,
                    "pending": event_pending,
                    "tasks_completed": event_completed_tasks,
                    "tasks_total": event_total_tasks,
                }
            )

        # ----------------------------------------------------
        # VENDOR PAYMENT COSTS
        # ----------------------------------------------------

        vendor_payment_records = []

        vendor_payments = payments.filter(
            payment_type="Vendor"
        ).select_related(
            "event",
            "vendor",
        )

        for payment in vendor_payments:
            vendor_payment_records.append(
                {
                    "id": payment.id,
                    "event": payment.event.name,
                    "vendor": (
                        payment.vendor.name
                        if payment.vendor
                        else None
                    ),
                    "description": payment.description,
                    "amount": payment.amount,
                    "due_date": payment.due_date,
                    "paid_date": payment.paid_date,
                    "status": payment.status,
                }
            )

        # ----------------------------------------------------
        # FINAL RESPONSE
        # ----------------------------------------------------

        return Response(
            {
                "updated_at": timezone.now(),

                "event_summary": {
                    "total_events": total_events,
                    "planning_events": planning_events,
                    "confirmed_events": confirmed_events,
                    "completed_events": completed_events,
                    "cancelled_events": cancelled_events,
                    "combined_event_budget": combined_event_budget,
                },

                "quotation_summary": {
                    "total_quotations": total_quotations,
                    "quotation_value": quotation_value,
                },

                "budget_analysis": {
                    "planned_expenses": planned_expenses,
                    "actual_expenses": actual_expenses,
                    "variance": budget_variance,
                    "budget_items": budget_items.count(),
                },

                "payment_summary": {
                    "payments_received": payments_received,
                    "total_payment_records": payments.count(),
                    "pending_payments": pending_payments,
                    "cancelled_payments": cancelled_payments,
                },

                "vendor_payment_summary": {
                    "vendor_payments_paid": vendor_payments_paid,
                    "vendor_payments_pending": vendor_payments_pending,
                    "vendor_payment_records": len(
                        vendor_payment_records
                    ),
                },

                "task_progress": {
                    "percentage": task_completion_percentage,
                    "completed": completed_tasks,
                    "total": total_tasks,
                    "in_progress": in_progress_tasks,
                    "pending": pending_tasks,
                    "cancelled": cancelled_tasks,
                },

                "vendor_payments": vendor_payment_records,

                "event_reports": event_reports,
            }
        )


# ============================================================
# NOTIFICATIONS API
# ============================================================

class NotificationsListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        today = timezone.localdate()

        next_seven_days = (
            today + timedelta(days=7)
        )

        # ----------------------------------------------------
        # USER DATA
        # ----------------------------------------------------

        if user.is_superuser:
            events = Event.objects.all()

            tasks = EventTask.objects.select_related(
                "event"
            ).all()

            payments = Payment.objects.select_related(
                "event"
            ).all()

        else:
            events = Event.objects.filter(
                created_by=user
            )

            tasks = EventTask.objects.select_related(
                "event"
            ).filter(
                created_by=user,
                event__created_by=user,
            )

            payments = Payment.objects.select_related(
                "event"
            ).filter(
                created_by=user,
                event__created_by=user,
            )

        notifications = []

        # ----------------------------------------------------
        # EVENT REMINDERS
        # ----------------------------------------------------

        upcoming_events = events.filter(
            event_date__gte=today,
            event_date__lte=next_seven_days,
        ).exclude(
            status__in=[
                "Completed",
                "Cancelled",
            ]
        )

        for event in upcoming_events:
            days_left = (
                event.event_date - today
            ).days

            if days_left == 0:
                severity = "urgent"
                message = (
                    f"{event.name} is scheduled today."
                )
            elif days_left == 1:
                severity = "urgent"
                message = (
                    f"{event.name} is scheduled tomorrow."
                )
            else:
                severity = "upcoming"
                message = (
                    f"{event.name} is scheduled in "
                    f"{days_left} days."
                )

            notifications.append(
                {
                    "id": f"event-{event.id}",
                    "type": "Event Reminder",
                    "title": event.name,
                    "message": message,
                    "event": event.name,
                    "date": event.event_date.isoformat(),
                    "days_remaining": days_left,
                    "severity": severity,
                }
            )

        # ----------------------------------------------------
        # TASK DEADLINE REMINDERS
        # ----------------------------------------------------

        due_tasks = tasks.filter(
            deadline__lte=next_seven_days
        ).exclude(
            status__in=[
                "Completed",
                "Cancelled",
            ]
        )

        for task in due_tasks:
            days_left = (
                task.deadline - today
            ).days

            if days_left < 0:
                severity = "overdue"
                message = (
                    f"Task '{task.title}' is overdue."
                )
            elif days_left == 0:
                severity = "urgent"
                message = (
                    f"Task '{task.title}' is due today."
                )
            elif days_left == 1:
                severity = "urgent"
                message = (
                    f"Task '{task.title}' is due tomorrow."
                )
            else:
                severity = "upcoming"
                message = (
                    f"Task '{task.title}' is due in "
                    f"{days_left} days."
                )

            notifications.append(
                {
                    "id": f"task-{task.id}",
                    "type": "Task Deadline",
                    "title": task.title,
                    "message": message,
                    "event": task.event.name,
                    "date": task.deadline.isoformat(),
                    "days_remaining": days_left,
                    "severity": severity,
                }
            )

        # ----------------------------------------------------
        # PAYMENT REMINDERS
        # ----------------------------------------------------

        due_payments = payments.filter(
            status="Pending",
            due_date__lte=next_seven_days,
        )

        for payment in due_payments:
            days_left = (
                payment.due_date - today
            ).days

            if days_left < 0:
                severity = "overdue"
                message = (
                    "This payment is overdue."
                )
            elif days_left == 0:
                severity = "urgent"
                message = (
                    "This payment is due today."
                )
            elif days_left == 1:
                severity = "urgent"
                message = (
                    "This payment is due tomorrow."
                )
            else:
                severity = "upcoming"
                message = (
                    "This payment is due in "
                    f"{days_left} days."
                )

            notifications.append(
                {
                    "id": f"payment-{payment.id}",
                    "type": "Payment Reminder",
                    "title": (
                        payment.description
                        or payment.payment_type
                    ),
                    "message": message,
                    "event": payment.event.name,
                    "date": payment.due_date.isoformat(),
                    "amount": str(payment.amount),
                    "days_remaining": days_left,
                    "severity": severity,
                }
            )

        # ----------------------------------------------------
        # SORT NOTIFICATIONS
        # ----------------------------------------------------

        notifications.sort(
            key=lambda item: item["date"]
        )

        # ----------------------------------------------------
        # RESPONSE
        # ----------------------------------------------------

        return Response(
            {
                "count": len(notifications),
                "notifications": notifications,
            }
        )