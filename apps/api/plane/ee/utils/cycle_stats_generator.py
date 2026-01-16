# Python standard library imports
from datetime import date, datetime
from typing import Dict, List, Optional, Set, Tuple
from uuid import UUID

# Django imports
from django.utils import timezone

# Plane imports
from plane.db.models import IssueActivity, Issue, State, EstimatePoint
from plane.ee.models import EntityProgress
from plane.utils.exception_logger import log_exception


def get_issues_in_cycle_on_date(cycle_id: UUID, target_date: date, project_id: UUID) -> Set[UUID]:
    """
    Find all issue IDs that were part of a cycle on a given date.

    Logic:
    1. Find all activities where issue was added to cycle
       (field="cycles", new_identifier=cycle_id, created_at <= target_date)
    2. Exclude issues that were removed from cycle before target_date
       without being re-added

    Args:
        cycle_id: The cycle ID to check
        target_date: The date to check membership on
        project_id: The project ID for filtering

    Returns:
        Set of issue IDs that were in the cycle on target_date
    """
    try:
        # Get all activities where issues were added to this cycle before/on target_date
        added_activities = (
            IssueActivity.all_objects.filter(
                field="cycles",
                new_identifier=cycle_id,
                created_at__date__lte=target_date,
                project_id=project_id,
            )
            .values("issue_id", "created_at")
            .order_by("issue_id", "created_at")
        )

        # Get all activities where issues were removed from this cycle before/on target_date
        removed_activities = (
            IssueActivity.all_objects.filter(
                field="cycles",
                old_identifier=cycle_id,
                created_at__date__lte=target_date,
                project_id=project_id,
            )
            .values("issue_id", "created_at")
            .order_by("issue_id", "created_at")
        )

        # Build a map of issue_id -> list of (action_type, timestamp)
        issue_events: Dict[UUID, List[tuple]] = {}

        for activity in added_activities:
            issue_id = activity["issue_id"]
            if issue_id not in issue_events:
                issue_events[issue_id] = []
            issue_events[issue_id].append(("added", activity["created_at"]))

        for activity in removed_activities:
            issue_id = activity["issue_id"]
            if issue_id not in issue_events:
                issue_events[issue_id] = []
            issue_events[issue_id].append(("removed", activity["created_at"]))

        # Determine which issues were in cycle on target_date
        # An issue is in cycle if:
        # - The last event before/on target_date was "added" (not "removed")
        issues_in_cycle: Set[UUID] = set()
        target_datetime = timezone.make_aware(datetime.combine(target_date, datetime.max.time()))

        for issue_id, events in issue_events.items():
            # Sort events by timestamp
            events.sort(key=lambda x: x[1])

            # Find the last event before/on target_date
            last_event = None
            for event_type, event_time in events:
                if event_time <= target_datetime:
                    last_event = event_type
                else:
                    break

            # Issue is in cycle if last event was "added"
            # If no events exist before target_date, check if any added events exist
            if last_event == "added":
                issues_in_cycle.add(issue_id)

        return issues_in_cycle

    except Exception as e:
        log_exception(e)
        return set()


def get_issue_state_on_date(issue_id: UUID, target_date: date, project_id: UUID) -> Optional[State]:
    """
    Reconstruct the issue's state at a given date by looking at activities.

    Args:
        issue_id: The issue ID
        target_date: The date to check state on
        project_id: The project ID for filtering

    Returns:
        State object or None if not found
    """
    try:
        target_datetime = timezone.make_aware(datetime.combine(target_date, datetime.max.time()))

        # Find the most recent state change before/on target_date
        state_activity = (
            IssueActivity.all_objects.filter(
                issue_id=issue_id,
                field="state",
                created_at__lte=target_datetime,
                project_id=project_id,
            )
            .order_by("-created_at")
            .first()
        )

        if state_activity and state_activity.new_identifier:
            try:
                return State.objects.get(id=state_activity.new_identifier)
            except State.DoesNotExist:
                pass

        # Fallback to current issue state
        try:
            issue = Issue.objects.get(id=issue_id, project_id=project_id)
            return issue.state
        except Issue.DoesNotExist:
            return None

    except Exception as e:
        log_exception(e)
        return None


def get_issue_estimate_on_date(
    issue_id: UUID, target_date: date, project_id: UUID
) -> Tuple[Optional[EstimatePoint], Optional[float]]:
    """
    Reconstruct the issue's estimate at a given date by looking at activities.

    Args:
        issue_id: The issue ID
        target_date: The date to check estimate on
        project_id: The project ID for filtering

    Returns:
        Tuple of (EstimatePoint, estimate_value) or (None, None)
    """
    try:
        target_datetime = timezone.make_aware(datetime.combine(target_date, datetime.max.time()))

        # Find the most recent estimate change before/on target_date
        estimate_activity = (
            IssueActivity.all_objects.filter(
                issue_id=issue_id,
                field__startswith="estimate_",
                created_at__lte=target_datetime,
                project_id=project_id,
            )
            .order_by("-created_at")
            .first()
        )

        if estimate_activity and estimate_activity.new_identifier:
            try:
                estimate_point = EstimatePoint.objects.select_related("estimate").get(
                    id=estimate_activity.new_identifier
                )
                estimate_value = None

                if estimate_point.estimate and getattr(estimate_point.estimate, "type", None) in ["points", "time"]:
                    try:
                        estimate_value = float(estimate_point.value)
                    except (ValueError, TypeError):
                        estimate_value = None

                return estimate_point, estimate_value
            except EstimatePoint.DoesNotExist:
                pass

        # Fallback to current issue estimate
        try:
            issue = Issue.objects.select_related("estimate_point", "estimate_point__estimate").get(
                id=issue_id, project_id=project_id
            )
            if issue.estimate_point:
                estimate_value = None
                if issue.estimate_point.estimate and getattr(issue.estimate_point.estimate, "type", None) in [
                    "points",
                    "time",
                ]:
                    try:
                        estimate_value = float(issue.estimate_point.value)
                    except (ValueError, TypeError):
                        estimate_value = None
                return issue.estimate_point, estimate_value
        except Issue.DoesNotExist:
            pass

        return None, None

    except Exception as e:
        log_exception(e)
        return None, None


def calculate_cycle_stats_for_date(cycle, target_date: date, workspace_id: UUID) -> Optional[EntityProgress]:
    """
    Calculate cycle statistics for a specific date by reconstructing from IssueActivity.

    Args:
        cycle: Cycle object
        target_date: The date to calculate stats for
        workspace_id: Workspace ID

    Returns:
        EntityProgress object (not saved) or None if error
    """
    try:
        # Get all issues that were in cycle on target_date
        issue_ids = get_issues_in_cycle_on_date(cycle.id, target_date, cycle.project_id)

        if not issue_ids:
            # No issues in cycle on this date, create empty stats
            return EntityProgress(
                cycle=cycle,
                workspace_id=workspace_id,
                project=cycle.project,
                entity_type="CYCLE",
                progress_date=timezone.make_aware(datetime.combine(target_date, datetime.min.time())),
                total_issues=0,
                total_estimate_points=0.0,
                backlog_issues=0,
                unstarted_issues=0,
                started_issues=0,
                completed_issues=0,
                cancelled_issues=0,
                backlog_estimate_points=0.0,
                unstarted_estimate_points=0.0,
                started_estimate_points=0.0,
                completed_estimate_points=0.0,
                cancelled_estimate_points=0.0,
            )

        # Initialize state group counters
        state_groups = ["backlog", "unstarted", "started", "completed", "cancelled"]
        state_counts: Dict[str, int] = {group: 0 for group in state_groups}
        state_points: Dict[str, float] = {group: 0.0 for group in state_groups}

        total_issues = 0
        total_estimate_points = 0.0

        # Process each issue
        for issue_id in issue_ids:
            # Get state at target_date
            state = get_issue_state_on_date(issue_id, target_date, cycle.project_id)
            if not state:
                continue

            # Get estimate at target_date
            estimate_point, estimate_value = get_issue_estimate_on_date(issue_id, target_date, cycle.project_id)

            # Count issue
            total_issues += 1
            if estimate_value is not None:
                total_estimate_points += estimate_value

            # Update state group counts
            state_group = state.group.lower() if state.group else None
            if state_group in state_groups:
                state_counts[state_group] += 1
                if estimate_value is not None:
                    state_points[state_group] += estimate_value

        # Create EntityProgress record
        progress_datetime = timezone.make_aware(datetime.combine(target_date, datetime.min.time()))

        return EntityProgress(
            cycle=cycle,
            workspace_id=workspace_id,
            project=cycle.project,
            entity_type="CYCLE",
            progress_date=progress_datetime,
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

    except Exception as e:
        log_exception(e)
        return None
