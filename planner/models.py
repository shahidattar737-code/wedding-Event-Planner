from django.conf import settings
from django.db import models


# --------------------------------------------------
# CLIENT MODEL
# --------------------------------------------------

class Client(models.Model):
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="planner_clients",
    )

    name = models.CharField(max_length=150)
    phone = models.CharField(max_length=15)
    email = models.EmailField(blank=True)
    address = models.TextField(blank=True)
    requirements = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


# --------------------------------------------------
# EVENT MODEL
# --------------------------------------------------

class Event(models.Model):
    STATUS_CHOICES = [
        ("Planning", "Planning"),
        ("Confirmed", "Confirmed"),
        ("Completed", "Completed"),
        ("Cancelled", "Cancelled"),
    ]

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="planner_events",
    )

    name = models.CharField(max_length=200)
    event_type = models.CharField(max_length=100)
    client_name = models.CharField(max_length=150)
    event_date = models.DateField()
    venue = models.CharField(max_length=250)

    budget = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="Planning",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


# --------------------------------------------------
# VENDOR MODEL
# --------------------------------------------------

class Vendor(models.Model):
    VENDOR_TYPES = [
        ("Decorator", "Decorator"),
        ("Caterer", "Caterer"),
        ("Photographer", "Photographer"),
        ("DJ", "DJ"),
        ("Venue", "Venue"),
        ("Other", "Other"),
    ]

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="planner_vendors",
    )

    name = models.CharField(max_length=150)

    vendor_type = models.CharField(
        max_length=50,
        choices=VENDOR_TYPES,
        default="Other",
    )

    phone = models.CharField(max_length=15)
    email = models.EmailField(blank=True)
    address = models.TextField(blank=True)
    services = models.TextField(blank=True)
    payment_terms = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.vendor_type}"


# --------------------------------------------------
# QUOTATION MODEL
# --------------------------------------------------

class Quotation(models.Model):
    STATUS_CHOICES = [
        ("Draft", "Draft"),
        ("Sent", "Sent"),
        ("Approved", "Approved"),
        ("Rejected", "Rejected"),
    ]

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="planner_quotations",
    )

    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name="quotations",
    )

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)

    total_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="Draft",
    )

    version = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.event.name}"


# --------------------------------------------------
# BUDGET ITEM MODEL
# --------------------------------------------------

class BudgetItem(models.Model):
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="planner_budget_items",
    )

    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name="budget_items",
    )

    category = models.CharField(max_length=100)
    description = models.CharField(max_length=250, blank=True)

    planned_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    actual_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.category} - {self.event.name}"


# --------------------------------------------------
# EVENT TASK MODEL
# --------------------------------------------------

class EventTask(models.Model):
    STATUS_CHOICES = [
        ("Pending", "Pending"),
        ("In Progress", "In Progress"),
        ("Completed", "Completed"),
        ("Cancelled", "Cancelled"),
    ]

    PRIORITY_CHOICES = [
        ("Low", "Low"),
        ("Medium", "Medium"),
        ("High", "High"),
    ]

    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name="tasks",
    )

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)

    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_event_tasks",
    )

    deadline = models.DateField()

    priority = models.CharField(
        max_length=20,
        choices=PRIORITY_CHOICES,
        default="Medium",
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="Pending",
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_event_tasks",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.event.name}"


# --------------------------------------------------
# PAYMENT MODEL
# --------------------------------------------------

class Payment(models.Model):
    PAYMENT_TYPES = [
        ("Advance", "Advance"),
        ("Milestone", "Milestone Payment"),
        ("Vendor", "Vendor Payment"),
        ("Final", "Final Payment"),
    ]

    PAYMENT_STATUS = [
        ("Pending", "Pending"),
        ("Paid", "Paid"),
        ("Cancelled", "Cancelled"),
    ]

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="planner_payments",
    )

    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name="payments",
    )

    vendor = models.ForeignKey(
        Vendor,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="payments",
    )

    payment_type = models.CharField(
        max_length=20,
        choices=PAYMENT_TYPES,
        default="Advance",
    )

    description = models.CharField(max_length=250, blank=True)

    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    due_date = models.DateField()
    paid_date = models.DateField(null=True, blank=True)

    status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS,
        default="Pending",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return (
            f"{self.payment_type} - "
            f"{self.event.name} - {self.amount}"
        )


# --------------------------------------------------
# EVENT DOCUMENT MODEL
# --------------------------------------------------

class EventDocument(models.Model):
    DOCUMENT_TYPES = [
        ("Contract", "Contract"),
        ("Quotation", "Quotation"),
        ("Invoice", "Invoice"),
        ("Receipt", "Receipt"),
        ("Other", "Other"),
    ]

    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name="documents",
    )

    title = models.CharField(max_length=200)

    document_type = models.CharField(
        max_length=20,
        choices=DOCUMENT_TYPES,
        default="Other",
    )

    file = models.FileField(
        upload_to="event_documents/%Y/%m/",
    )

    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="uploaded_event_documents",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.event.name}"