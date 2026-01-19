# Python standard library imports
from datetime import datetime, timedelta
from typing import Dict, List
from uuid import UUID

# Django imports
from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone

# Plane imports
from plane.db.models import Cycle, IssueActivity, State
from plane.ee.models import EntityProgress, EntityIssueStateActivity
from plane.utils.exception_logger import log_exception


class Command(BaseCommand):
    help = """
    Generate EntityProgress data for a specific cycle.
    
    This command:
    1. Fetches the cycle by ID
    2. Generates EntityProgress records based on:
       - EntityIssueStateActivity: when issues were added/removed from cycle
       - IssueActivity: state and estimate updates for issues
    
    Usage:
        python manage.py generate_cycle_progress --cycle-id <cycle-uuid>
    """

    def add_arguments(self, parser):
        parser.add_argument("cycle_id", type=str, help="cycle id")

    def handle(self, *args, **options):
        cycle_id = options["cycle_id"]

        try:
            # Validate UUID format
            try:
                UUID(cycle_id)
            except ValueError:
                raise CommandError(f"Invalid cycle ID format: {cycle_id}. Must be a valid UUID.")

            # Fetch the cycle
            try:
                cycle = Cycle.objects.select_related("workspace", "project").get(
                    id=cycle_id,
                )
            except Cycle.DoesNotExist:
                raise CommandError(f"Cycle with ID {cycle_id} not found or is archived.")

            self.stdout.write(self.style.SUCCESS(f"Found cycle: {cycle.name} (ID: {cycle.id})"))
            self.stdout.write(f"  Cycle dates: {cycle.start_date} to {cycle.end_date}")

            if not cycle.start_date or not cycle.end_date:
                raise CommandError("Cycle must have both start_date and end_date set.")

            # Convert cycle dates to timezone-aware datetimes
            start_datetime = timezone.make_aware(datetime.combine(cycle.start_date, datetime.min.time()))
            end_datetime = timezone.make_aware(datetime.combine(cycle.end_date, datetime.max.time()))

            self.stdout.write(f"\nProcessing cycle: {cycle.name} (ID: {cycle.id})")

            try:
                self._generate_progress_for_cycle(cycle, start_datetime, end_datetime)
                self.stdout.write(self.style.SUCCESS(f"\nSuccessfully processed cycle: {cycle.name}"))

            except Exception as e:
                self.stdout.write(self.style.ERROR(f"  Error processing cycle: {str(e)}"))
                log_exception(e)
                raise CommandError(f"Failed to process cycle: {str(e)}")

        except CommandError:
            raise
        except Exception as e:
            raise CommandError(f"Error: {str(e)}")

    def _generate_progress_for_cycle(
        self,
        cycle: Cycle,
        start_datetime: datetime,
        end_datetime: datetime,
    ) -> int:
        """
        Generate EntityProgress records for a cycle based on activity data.

        For each day in the date range, calculate the state of issues in the cycle
        based on EntityIssueStateActivity (additions/removals) and IssueActivity
        (state/estimate updates).
        """
        # Determine the actual date range to process (intersection of cycle and requested range)
        cycle_start = max(cycle.start_date, start_datetime) if cycle.start_date else start_datetime
        cycle_end = min(cycle.end_date, end_datetime) if cycle.end_date else end_datetime

        # Build a timeline of issue states for each day
        # For each day, determine which issues were in the cycle and their states

        current_date = cycle_start.date()
        end_date = cycle_end.date()

        while current_date <= end_date:
            start_of_day = timezone.make_aware(datetime.combine(current_date, datetime.min.time()))
            end_of_day = timezone.make_aware(datetime.combine(current_date, datetime.max.time()))

            # Get issues that were in the cycle on this date
            # An issue is in the cycle if:
            # - It was ADDED before or on this date
            # - It was not REMOVED before or on this date (or was removed after)
            # This method also creates EntityIssueStateActivity records for state updates if needed
            entity_issue_state_activities = self._get_entity_issue_state_activities_for_date(
                cycle, start_of_day, end_of_day
            )

            # Calculate progress metrics
            self._calculate_progress_metrics(entity_issue_state_activities, cycle, end_of_day)

            # Increment to next day
            current_date += timedelta(days=1)

        return

    def _get_entity_issue_state_activities_for_date(
        self, cycle: Cycle, start_of_day: datetime, end_of_day: datetime
    ) -> List[EntityIssueStateActivity]:
        """
        Get entity issue state activities for a specific date, updating them with any
        state or estimate changes that occurred during that day.

        This method:
        1. Gets the latest activity for each issue up to end_of_day
        2. Checks for state/estimate updates during the day
        3. Creates updated activity records
        4. Returns a list of activities reflecting the state at end_of_day
        """
        cycle_id = str(cycle.id)

        # Get the latest activity for each issue up to end of day
        latest_activities = list(
            EntityIssueStateActivity.objects.filter(
                cycle_id=cycle_id,
                entity_type="CYCLE",
                created_at__lte=end_of_day,
                issue__deleted_at__isnull=True,
            )
            .order_by("issue_id", "-created_at")
            .distinct("issue_id")
            .select_related("state", "issue", "estimate_point")
        )

        all_activities = [activity for activity in latest_activities if activity.action != "REMOVED"]

        # Get all issue IDs that have activities
        issue_ids = [str(activity.issue_id) for activity in all_activities]

        # Bulk fetch all state updates for these issues during the day (single query)
        state_updates = {
            str(activity.issue_id): activity
            for activity in IssueActivity.objects.filter(
                issue_id__in=issue_ids,
                field="state",
                verb="updated",
                created_at__gte=start_of_day,
                created_at__lte=end_of_day,
            )
            .order_by("issue_id", "-created_at")
            .distinct("issue_id")
            .select_related("issue")
        }

        # Bulk fetch all estimate updates for these issues during the day (single query)
        estimate_updates = {
            str(activity.issue_id): activity
            for activity in IssueActivity.objects.filter(
                issue_id__in=issue_ids,
                field__startswith="estimate_",
                verb="updated",
                created_at__gte=start_of_day,
                created_at__lte=end_of_day,
            )
            .order_by("issue_id", "-created_at")
            .distinct("issue_id")
            .select_related("issue")
        }

        # Bulk fetch all states that were updated (single query)
        state_ids = [str(activity.new_identifier) for activity in state_updates.values() if activity.new_identifier]
        states_map = (
            {str(state.id): state for state in State.objects.filter(id__in=state_ids).select_related()}
            if state_ids
            else {}
        )

        # Create a mapping of issue_id to activity for quick lookup
        activities_map = {str(activity.issue_id): activity for activity in latest_activities}

        # Track activities to create
        activities_to_create = []

        # Process updates and modify activities in-place
        for issue_id in issue_ids:
            activity = activities_map[issue_id]
            state_activity = state_updates.get(issue_id)
            estimate_activity = estimate_updates.get(issue_id)

            # Determine which updates occurred and their timestamps
            has_state_update = state_activity and state_activity.new_identifier
            has_estimate_update = estimate_activity is not None

            if not (has_state_update or has_estimate_update):
                continue

            # Get the latest timestamp for determining created_at
            update_timestamps = []
            if has_state_update:
                update_timestamps.append(state_activity.created_at)
            if has_estimate_update:
                update_timestamps.append(estimate_activity.created_at)
            latest_timestamp = max(update_timestamps)

            # Prepare updated values
            updated_state_id = None
            updated_state_group = None
            updated_estimate_value = activity.estimate_value
            updated_estimate_point_id = activity.estimate_point_id

            # Apply state update
            if has_state_update:
                state = states_map.get(str(state_activity.new_identifier))
                if state:
                    updated_state_id = str(state_activity.new_identifier)
                    updated_state_group = state.group
                    # Update the activity object in-place for return value
                    activity.state_id = updated_state_id
                    activity.state_group = updated_state_group

            # Apply estimate update
            if has_estimate_update:
                try:
                    updated_estimate_value = float(estimate_activity.new_value) if estimate_activity.new_value else None
                except (ValueError, TypeError):
                    updated_estimate_value = activity.estimate_value

                # Update the activity object in-place for return value
                if updated_estimate_value is not None:
                    activity.estimate_value = updated_estimate_value
                if updated_estimate_point_id:
                    activity.estimate_point_id = updated_estimate_point_id

            # Update the timestamp
            activity.updated_at = latest_timestamp

            # Create new activity record (single record with all updates)
            # Use updated values if available, otherwise keep existing values
            final_state_id = (
                updated_state_id if updated_state_id else (str(activity.state_id) if activity.state_id else None)
            )
            final_state_group = updated_state_group if updated_state_group else activity.state_group

            activities_to_create.append(
                EntityIssueStateActivity(
                    cycle_id=cycle_id,
                    issue_id=issue_id,
                    action="UPDATED",
                    created_at=latest_timestamp,
                    updated_at=latest_timestamp,
                    workspace_id=cycle.workspace_id,
                    project_id=cycle.project_id,
                    entity_type="CYCLE",
                    state_id=final_state_id,
                    state_group=final_state_group,
                    estimate_point_id=updated_estimate_point_id,
                    estimate_value=updated_estimate_value,
                )
            )

        # Bulk create new activity records
        if activities_to_create:
            EntityIssueStateActivity.objects.bulk_create(activities_to_create, batch_size=100)

        return all_activities

    def _calculate_progress_metrics(
        self,
        entity_issue_state_activities: List[EntityIssueStateActivity],
        cycle: Cycle,
        progress_date: datetime,
    ) -> None:
        """
        Calculate progress metrics from entity issue state activities.
        Checks existing EntityProgress record and verifies numbers match.

        Returns:
            Dictionary with progress metrics
        """
        # Calculate metrics from activities
        total_issues: int = len(entity_issue_state_activities)
        total_estimate_points: float = sum(activity.estimate_value or 0 for activity in entity_issue_state_activities)

        # Count issues and estimate points by state group
        state_groups: List[str] = [
            "backlog",
            "unstarted",
            "started",
            "completed",
            "cancelled",
        ]
        state_counts: Dict[str, int] = {group: 0 for group in state_groups}
        state_points: Dict[str, float] = {group: 0.0 for group in state_groups}

        for activity in entity_issue_state_activities:
            group = activity.state_group
            if group in state_groups:
                state_counts[group] += 1
                state_points[group] += activity.estimate_value or 0

        # Check for existing EntityProgress record
        try:
            existing_record = EntityProgress.objects.get(
                cycle=cycle,
                entity_type="CYCLE",
                progress_date__date=progress_date.date(),
            )

            # Verify numbers match and update if different
            discrepancies = []
            needs_update = False

            if existing_record.total_issues != total_issues:
                discrepancies.append(
                    f"total_issues: existing={existing_record.total_issues}, calculated={total_issues}"
                )
                existing_record.total_issues = total_issues
                needs_update = True

            if abs(existing_record.total_estimate_points - total_estimate_points) > 0.01:
                discrepancies.append(
                    f"total_estimate_points: existing={existing_record.total_estimate_points}, "
                    f"calculated={total_estimate_points}"
                )
                existing_record.total_estimate_points = total_estimate_points
                needs_update = True

            for group in state_groups:
                field_name = f"{group}_issues"
                existing_count = getattr(existing_record, field_name, 0)
                calculated_count = state_counts[group]
                if existing_count != calculated_count:
                    discrepancies.append(f"{field_name}: existing={existing_count}, calculated={calculated_count}")
                    setattr(existing_record, field_name, calculated_count)
                    needs_update = True

                points_field_name = f"{group}_estimate_points"
                existing_points = getattr(existing_record, points_field_name, 0.0)
                calculated_points = state_points[group]
                if abs(existing_points - calculated_points) > 0.01:
                    discrepancies.append(
                        f"{points_field_name}: existing={existing_points}, calculated={calculated_points}"
                    )
                    setattr(existing_record, points_field_name, calculated_points)
                    needs_update = True

            if discrepancies:
                if needs_update:
                    existing_record.save()
                    self.stdout.write(
                        self.style.WARNING(
                            f"  Updated discrepancies for cycle {cycle.id} on {progress_date.date()}:\n"
                            + "\n".join(f"    - {d}" for d in discrepancies)
                        )
                    )
                else:
                    self.stdout.write(
                        self.style.WARNING(
                            f"  Discrepancies found for cycle {cycle.id} on {progress_date.date()}:\n"
                            + "\n".join(f"    - {d}" for d in discrepancies)
                        )
                    )
            else:
                self.stdout.write(
                    self.style.SUCCESS(
                        f"  Verified: Existing record matches calculated values for cycle {cycle.id} "
                        f"on {progress_date.date()}"
                    )
                )

        except EntityProgress.DoesNotExist:
            # Create new EntityProgress record for this day
            EntityProgress.objects.create(
                workspace_id=cycle.workspace_id,
                project_id=cycle.project_id,
                cycle=cycle,
                entity_type="CYCLE",
                progress_date=progress_date,
                total_issues=total_issues,
                total_estimate_points=total_estimate_points,
                backlog_issues=state_counts["backlog"],
                unstarted_issues=state_counts["unstarted"],
                started_issues=state_counts["started"],
                completed_issues=state_counts["completed"],
                cancelled_issues=state_counts["cancelled"],
                backlog_estimate_points=state_points["backlog"],
                unstarted_estimate_points=state_points["unstarted"],
                started_estimate_points=state_points["started"],
                completed_estimate_points=state_points["completed"],
                cancelled_estimate_points=state_points["cancelled"],
            )
            self.stdout.write(
                self.style.SUCCESS(
                    f"  Created EntityProgress for cycle {cycle.id} on {progress_date.date()}: "
                    f"{total_issues} issues, {total_estimate_points} estimate points"
                )
            )
