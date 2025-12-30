from .formatters import BaseFormatter
from typing import Any, Dict, List
from dataclasses import dataclass, field


@dataclass
class ImportResult:
    """Tracks import success/failures"""
    success_count: int = 0
    error_count: int = 0
    created: List[Any] = field(default_factory=list)
    errors: Dict[int, Dict] = field(default_factory=dict)  # row_index: errors

    @property
    def total(self) -> int:
        return self.success_count + self.error_count

    @property
    def has_errors(self) -> bool:
        return self.error_count > 0

    def __str__(self) -> str:
        return f"Success: {self.success_count} | Errors: {self.error_count} | Total: {self.total}"


class DataImporter:
    """
    Import data using DRF serializers with many=True.

    Uses many=True to trigger ListSerializer hooks (e.g., seat validation).

    Usage:
        importer = DataImporter(UserImportSerializer, context={...})
        result = importer.from_string(csv_content, CSVFormatter())
        result = importer.validate(csv_content, CSVFormatter())  # Dry run
    """

    def __init__(self, serializer_class, **serializer_kwargs):
        self.serializer_class = serializer_class
        self.serializer_kwargs = serializer_kwargs

    def _process(self, rows: List[Dict], save: bool = True) -> ImportResult:
        """
        Process all rows using many=True.

        This triggers ListSerializer.validate() for batch validation (e.g., seat limits).
        """
        result = ImportResult()

        if not rows:
            return result

        # Use many=True to trigger ListSerializer hooks
        serializer = self.serializer_class(
            data=rows,
            many=True,
            **self.serializer_kwargs
        )

        if not serializer.is_valid():
            # Handle validation errors
            errors = serializer.errors

            # Check if it's a list-level error (like seat validation)
            if isinstance(errors, dict) and "non_field_errors" in errors:
                # List-level validation error - all rows failed
                result.error_count = len(rows)
                result.errors[0] = {"_list_error": errors["non_field_errors"]}
                return result

            # Per-row validation errors
            if isinstance(errors, list):
                for idx, row_errors in enumerate(errors):
                    if row_errors:
                        result.errors[idx] = dict(row_errors)
                        result.error_count += 1
                    else:
                        result.success_count += 1
            else:
                # Unexpected error format
                result.error_count = len(rows)
                result.errors[0] = {"_validation_error": str(errors)}

            return result

        # All rows validated successfully
        if save:
            try:
                instances = serializer.save()
                result.created = instances if isinstance(instances, list) else [instances]
                result.success_count = len(result.created)
            except Exception as e:
                result.error_count = len(rows)
                result.errors[0] = {"_save_error": str(e)}
        else:
            result.success_count = len(rows)

        return result

    def from_string(self, content: str, formatter: BaseFormatter, save: bool = True) -> ImportResult:
        """Import from formatted string"""
        rows = formatter.decode(content)
        return self._process(rows, save=save)

    def from_file(self, filepath: str, formatter: BaseFormatter, save: bool = True) -> ImportResult:
        """Import from file"""
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        return self.from_string(content, formatter, save=save)

    def validate(self, content: str, formatter: BaseFormatter) -> ImportResult:
        """Validate without saving (dry run)"""
        return self.from_string(content, formatter, save=False)

    def validate_file(self, filepath: str, formatter: BaseFormatter) -> ImportResult:
        """Validate file without saving"""
        return self.from_file(filepath, formatter, save=False)
