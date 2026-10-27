from zipfile import BadZipFile, ZipFile

from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password

from rest_framework import serializers

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


# CLIENT SERIALIZER
class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = "__all__"
        read_only_fields = ("id", "created_at", "created_by")


# EVENT SERIALIZER
class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = "__all__"
        read_only_fields = ("id", "created_at", "created_by")


# VENDOR SERIALIZER
class VendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = "__all__"
        read_only_fields = ("id", "created_at", "created_by")


# QUOTATION SERIALIZER
class QuotationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quotation
        fields = "__all__"
        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
            "created_by",
        )


# BUDGET ITEM SERIALIZER
class BudgetItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = BudgetItem
        fields = "__all__"
        read_only_fields = (
            "id",
            "created_at",
            "created_by",
        )


# EVENT TASK SERIALIZER
class EventTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventTask
        fields = "__all__"
        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
            "created_by",
        )


# PAYMENT SERIALIZER
class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = "__all__"
        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
            "created_by",
        )


# DOCUMENT SERIALIZER
class EventDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventDocument
        fields = "__all__"
        read_only_fields = (
            "id",
            "uploaded_by",
            "created_at",
        )

    def validate_file(self, value):
        # Maximum allowed file size: 10 MB
        max_size = 10 * 1024 * 1024

        if value.size > max_size:
            raise serializers.ValidationError(
                "File size must not exceed 10 MB."
            )

        # Check the file extension
        extension = value.name.rsplit(".", 1)[-1].lower()

        allowed_extensions = {
            "pdf",
            "doc",
            "docx",
            "jpg",
            "jpeg",
            "png",
        }

        if extension not in allowed_extensions:
            raise serializers.ValidationError(
                "Only PDF, DOC, DOCX, JPG and PNG files are allowed."
            )

        try:
            # Read the actual file signature
            value.seek(0)
            header = value.read(8)
            value.seek(0)

            # PDF validation
            if extension == "pdf":
                if not header.startswith(b"%PDF-"):
                    raise serializers.ValidationError(
                        "The file content is not a valid PDF file."
                    )

            # PNG validation
            elif extension == "png":
                if not header.startswith(
                    b"\x89PNG\r\n\x1a\n"
                ):
                    raise serializers.ValidationError(
                        "The file content is not a valid PNG image."
                    )

            # JPEG validation
            elif extension in {"jpg", "jpeg"}:
                if not header.startswith(b"\xff\xd8\xff"):
                    raise serializers.ValidationError(
                        "The file content is not a valid JPEG image."
                    )

            # Legacy Microsoft Word DOC validation
            elif extension == "doc":
                if not header.startswith(
                    b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1"
                ):
                    raise serializers.ValidationError(
                        "The file content is not a valid DOC file."
                    )

            # Microsoft Word DOCX validation
            elif extension == "docx":
                try:
                    with ZipFile(value) as docx_file:
                        names = set(docx_file.namelist())

                    if (
                        "[Content_Types].xml" not in names
                        or "word/document.xml" not in names
                    ):
                        raise serializers.ValidationError(
                            "The file content is not a valid DOCX document."
                        )

                except (BadZipFile, EOFError, ValueError):
                    raise serializers.ValidationError(
                        "The file content is not a valid DOCX document."
                    )

        finally:
            # Reset the file pointer before saving
            value.seek(0)

        return value


# USER REGISTRATION SERIALIZER
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        validators=[validate_password],
    )

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "password",
        ]
        read_only_fields = ["id"]

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


# LOGIN SERIALIZER
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()

    password = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
    )