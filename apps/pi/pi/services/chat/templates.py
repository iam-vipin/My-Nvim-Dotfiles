import random
from typing import Any
from typing import Dict
from typing import List
from typing import Literal
from typing import Optional

from pydantic import UUID4

from pi import logger
from pi.app.schemas.chat import ChatSuggestion
from pi.app.schemas.chat import ChatType

log = logger.getChild(__name__)


# ========================== PREDEFINED TEMPLATES ==========================
WORKSPACE_TEMPLATES: List[Dict[str, Any]] = [
    # Simple work item queries
    {"text": "Show me my urgent work items that are still pending", "type": ChatType.ISSUES, "category": "work_items", "mode": "ask"},
    {
        "text": "What work items are assigned to me and not yet completed, with start and end dates, priorities?",
        "type": ChatType.ISSUES,
        "category": "work_items",
        "mode": "ask",
    },
    {"text": "Show me my overdue work items", "type": ChatType.ISSUES, "category": "work_items", "mode": "ask"},
    {"text": "What did I complete this week?", "type": ChatType.ISSUES, "category": "work_items", "mode": "ask"},
    {"text": "Show me work items I'm working on currently", "type": ChatType.ISSUES, "category": "work_items", "mode": "ask"},
    {
        "text": "What work items are assigned to me that are blocked, and which ones are blocking them?",
        "type": ChatType.ISSUES,
        "category": "work_items",
        "mode": "ask",
    },
    # Simple activity queries
    {"text": "Who commented on my work items recently?", "type": ChatType.ISSUES, "category": "activity", "mode": "ask"},
    {"text": "What changed in my pending work items today?", "type": ChatType.ISSUES, "category": "activity", "mode": "ask"},
    {"text": "Show me recent activity on my pending work items", "type": ChatType.ISSUES, "category": "activity", "mode": "ask"},
    # Simple planning queries
    # {"text": "Help me prioritize my work items", "type": ChatType.ISSUES, "category": "planning", "mode": "ask"},
    {"text": "What's the progress of work items in current active cycles?", "type": ChatType.ISSUES, "category": "planning", "mode": "ask"},
    ## Multi-tool call queries. Will be used in the future.
    # {"text": "Summarize the latest updates for the last work item assigned to me",
    # "type": ChatType.ISSUES, "category": "work_items", "mode": "ask"},
    # {"text": "Summarize the latest updates for the most recent ten work items assigned to me with Urgent or High priority",
    #     "type": ChatType.ISSUES,
    #     "category": "work_items",
    #     "mode": "ask",
    # },
    # Build mode templates
    {
        "text": "Create a Sticky with details of all Urgent workitems across this workspace",
        "type": ChatType.WORKSPACES,
        "category": "workspaces",
        "mode": "build",
    },
    {
        "text": "Create a Page in the Wiki with work logs for each member in the last month",
        "type": ChatType.WORKSPACES,
        "category": "workspaces",
        "mode": "build",
    },
]


def preset_question_flow(question: str) -> List[Dict[str, Any]]:
    """
    End-to-end query flow for the given preset question.
    Returns a list of flow steps that define the complete processing pipeline.

    Each step contains:
    - step_type: The type of step (routing, tool_execution, etc.)
    - agents: List of tools to execute with their queries and parameters (field name kept for backward compatibility)
    - skip_routing: Whether to skip the normal routing process
    - reasoning_messages: Messages to show during processing
    """

    preset_flows = {
        "Show me my urgent work items that are still pending": [
            {
                "step_type": "routing",
                "skip_routing": True,
                "reasoning_messages": [
                    "🎯 Using optimized path for urgent work items query\n\n",
                    "🔧 Performing database querying to pull details about: 'urgent work items assigned to me'",
                ],
                "agents": [
                    {
                        "agent": "structured_db_tool",
                        "query": "Show me my urgent work items that are still pending",
                        "sql_query": """SELECT
  issues.id::text AS issues_id,
  issues.name,
  issues.priority
FROM issues
JOIN issue_assignees ON issue_assignees.issue_id = issues.id
JOIN states ON issues.state_id = states.id
WHERE issue_assignees.assignee_id = $1
  AND issues.priority ILIKE 'Urgent'
  AND issues.deleted_at IS NULL
  AND issue_assignees.deleted_at IS NULL
  AND states."group" ILIKE ANY (ARRAY['unstarted','started','backlog'])
LIMIT 20;""",
                        "tables": ["issues", "states", "issue_assignees", "users"],
                        "placeholders_in_order": ["user_id"],
                        "tool_name": "structured_db_tool",
                    }
                ],
            }
        ],
        "What work items are assigned to me and not yet completed, with start and end dates, priorities?": [
            {
                "step_type": "routing",
                "skip_routing": True,
                "reasoning_messages": [
                    "🎯 Using optimized path for assigned work items query\n\n",
                    "🔧 Performing database querying to pull details about: 'work items assigned to me and not yet completed along with start and end dates, priorities'",  # noqa: E501
                ],
                "agents": [
                    {
                        "agent": "structured_db_tool",
                        "query": "What work items are assigned to me and not yet completed, with start and end dates, priorities?",
                        "sql_query": """SELECT
        issues.id::text AS issues_id,
        issues.name,
        issues.start_date,
        issues.target_date,
        issues.priority,
        states.name AS state_name
      FROM issues
      JOIN issue_assignees ON issue_assignees.issue_id = issues.id
      JOIN states ON issues.state_id = states.id
      WHERE
        issue_assignees.assignee_id = $1
        AND states."group" ILIKE ANY(ARRAY['backlog', 'unstarted', 'started', 'cancelled'])
        AND states."group" NOT ILIKE 'completed'
        AND issues.deleted_at IS NULL
        AND issue_assignees.deleted_at IS NULL
      LIMIT 20;""",
                        "tables": ["users", "issue_assignees", "issues", "states"],
                        "placeholders_in_order": ["user_id"],
                        "tool_name": "structured_db_tool",
                    }
                ],
            }
        ],
        "Show me my overdue work items": [
            {
                "step_type": "routing",
                "skip_routing": True,
                "reasoning_messages": [
                    "🎯 Using optimized path for overdue work items query\n\n",
                    "🔧 Performing database querying to pull details about: 'overdue work items assigned to me'",
                ],
                "agents": [
                    {
                        "agent": "structured_db_tool",
                        "query": "Show me my overdue work items",
                        "sql_query": """SELECT
  issues.id::text AS issues_id,
  issues.name,
  issues.target_date,
  states.name AS state_name
FROM issues
JOIN issue_assignees ON issue_assignees.issue_id = issues.id
LEFT JOIN states ON issues.state_id = states.id
WHERE
  issue_assignees.assignee_id = $1
  AND issues.target_date IS NOT NULL
  AND issues.target_date::date < CURRENT_DATE
  AND (states.group != 'completed' AND states.group != 'cancelled')
  AND issues.deleted_at IS NULL
  AND issue_assignees.deleted_at IS NULL
LIMIT 20;""",
                        "tables": ["states", "users", "issue_assignees", "issues"],
                        "placeholders_in_order": ["user_id"],
                        "tool_name": "structured_db_tool",
                    }
                ],
            }
        ],
        "What did I complete this week?": [
            {
                "step_type": "routing",
                "skip_routing": True,
                "reasoning_messages": [
                    "🎯 Using optimized path for completed work items query\n\n",
                    "🔧 Performing database querying to pull details about: 'work items I completed this week'",
                ],
                "agents": [
                    {
                        "agent": "structured_db_tool",
                        "query": "What did I complete this week?",
                        "sql_query": """SELECT
  issues.id::text AS issues_id,
  issues.name,
  issues.completed_at
FROM
  issue_assignees
JOIN
  issues ON issue_assignees.issue_id = issues.id
JOIN
  states ON issues.state_id = states.id
WHERE
  issue_assignees.assignee_id = $1
  AND states."group" ILIKE 'completed'
  AND issues.completed_at >= date_trunc('week', CURRENT_TIMESTAMP)
  AND issues.completed_at < date_trunc('week', CURRENT_TIMESTAMP) + interval '1 week'
  AND issues.deleted_at IS NULL
  AND issue_assignees.deleted_at IS NULL
LIMIT 20;""",
                        "tables": ["issues", "states", "issue_assignees", "users"],
                        "placeholders_in_order": ["user_id"],
                        "tool_name": "structured_db_tool",
                    }
                ],
            }
        ],
        "Show me work items I'm working on currently": [
            {
                "step_type": "routing",
                "skip_routing": True,
                "reasoning_messages": [
                    "🎯 Using optimized path for current work items query\n\n",
                    "🔧 Performing database querying to pull details about: 'work items I am currently working on'",
                ],
                "agents": [
                    {
                        "agent": "structured_db_tool",
                        "query": "Show me work items I'm working on currently",
                        "sql_query": """SELECT
    issues.id::text AS issues_id,
    issues.name,
    states.name AS state_name
FROM
    issues
JOIN
    issue_assignees ON issues.id = issue_assignees.issue_id
JOIN
    states ON issues.state_id = states.id
WHERE
    issue_assignees.assignee_id = $1
    AND states."group" ILIKE 'started'
    AND issue_assignees.deleted_at IS NULL
    AND issues.deleted_at IS NULL
LIMIT 20;""",
                        "tables": ["users", "issue_assignees", "states", "issues"],
                        "placeholders_in_order": ["user_id"],
                        "tool_name": "structured_db_tool",
                    }
                ],
            }
        ],
        "What work items are assigned to me that are blocked, and which ones are blocking them?": [
            {
                "step_type": "routing",
                "skip_routing": True,
                "reasoning_messages": [
                    "🎯 Using optimized path for blocked work items query\n\n",
                    "🔧 Performing database querying to pull details about: 'blocked work items assigned to me and their blocking issues'",
                ],
                "agents": [
                    {
                        "agent": "structured_db_tool",
                        "query": "What work items are assigned to me that are blocked, and which ones are blocking them?",
                        "sql_query": """SELECT
  i.id::text AS issues_id,
  i.name AS issue_name,
  s.name AS issue_state,
  bi.id::text AS blocking_issue_id,
  bi.name AS blocking_issue_name
FROM
  issue_assignees ia
JOIN issues i ON ia.issue_id = i.id
JOIN states s ON i.state_id = s.id
JOIN issue_relations ir ON ir.issue_id = i.id AND ir.relation_type = 'blocking'
JOIN issues bi ON ir.related_issue_id = bi.id
WHERE
  ia.assignee_id = $1
  AND s."group" = 'blocked_by'
  AND ia.deleted_at IS NULL
  AND i.deleted_at IS NULL
  AND bi.deleted_at IS NULL
  AND ir.deleted_at IS NULL
LIMIT 20;""",
                        "tables": ["issue_assignees", "states", "issue_relations", "issues", "users"],
                        "placeholders_in_order": ["user_id"],
                        "tool_name": "structured_db_tool",
                    }
                ],
            }
        ],
        "Who commented on my work items recently?": [
            {
                "step_type": "routing",
                "skip_routing": True,
                "reasoning_messages": [
                    "🎯 Using optimized path for recent commenters query\n\n",
                    "🔧 Performing database querying to pull details about: 'users who recently commented on my work items'",
                ],
                "agents": [
                    {
                        "agent": "structured_db_tool",
                        "query": "Who commented on my work items recently?",
                        "sql_query": """SELECT
    users_id,
    first_name,
    last_name,
    most_recent_comment_date,
    issues_id,
    issue_name
FROM (
    SELECT DISTINCT ON (users.id)
        users.id::text AS users_id,
        users.first_name,
        users.last_name,
        issue_comments.created_at AS most_recent_comment_date,
        issues.id::text AS issues_id,
        issues.name AS issue_name
    FROM issue_assignees
    JOIN issues ON issue_assignees.issue_id = issues.id
    JOIN issue_comments ON issue_comments.issue_id = issues.id
    JOIN users ON users.id = issue_comments.created_by_id
    WHERE issue_assignees.assignee_id = $1
      AND users.id <> $1
      AND issue_comments.deleted_at IS NULL
      AND issue_assignees.deleted_at IS NULL
    ORDER BY users.id, issue_comments.created_at DESC
) t
ORDER BY most_recent_comment_date DESC
LIMIT 20;""",
                        "tables": ["issues", "users", "issue_assignees", "issue_comments"],
                        "placeholders_in_order": ["user_id"],
                        "tool_name": "structured_db_tool",
                    }
                ],
            }
        ],
        "What changed in my pending work items today?": [
            {
                "step_type": "routing",
                "skip_routing": True,
                "reasoning_messages": [
                    "🎯 Using optimized path for today's work item changes query\n\n",
                    "🔧 Performing database querying to pull details about: 'changes made to my pending work items today'",
                ],
                "agents": [
                    {
                        "agent": "structured_db_tool",
                        "query": "What changed in my pending work items today?",
                        "sql_query": """SELECT
    issues.id::text AS issues_id,
    issues.name,
    ia.id::text AS issue_activities_id,
    ia.verb,
    ia.field,
    ia.old_value,
    ia.new_value,
    ia.created_at
    FROM issues
    JOIN states ON issues.state_id = states.id
    JOIN issue_assignees ON issues.id = issue_assignees.issue_id
    JOIN issue_activities ia ON issues.id = ia.issue_id
    WHERE
    issue_assignees.assignee_id = $1
    AND issues.deleted_at IS NULL
    AND issue_assignees.deleted_at IS NULL
    AND states."group" ILIKE ANY (ARRAY['unstarted','started','backlog'])
    AND ia.created_at >= date_trunc('day', CURRENT_TIMESTAMP)
    AND ia.created_at <  date_trunc('day', CURRENT_TIMESTAMP) + interval '1 day'
    ORDER BY ia.created_at DESC
    LIMIT 20;
    """,
                        "tables": ["issues", "states", "issue_assignees", "issue_activities"],
                        "placeholders_in_order": ["user_id"],
                        "tool_name": "structured_db_tool",
                    }
                ],
            }
        ],
        "Show me recent activity on my pending work items": [
            {
                "step_type": "routing",
                "skip_routing": True,
                "reasoning_messages": [
                    "🎯 Using optimized path for recent activity query\n\n",
                    "🔧 Performing database querying to pull details about: 'recent activity on my pending work items'",
                ],
                "agents": [
                    {
                        "agent": "structured_db_tool",
                        "query": "Show me recent activity on my pending work items",
                        "sql_query": """SELECT
    ia.id::text             AS issue_activities_id,
    ia.created_at,
    ia.verb,
    ia.field,
    ia.old_value,
    ia.new_value,
    ia.comment,
    ia.issue_id::text       AS issues_id,
    i.name                  AS issue_name,
    u.first_name,
    u.last_name
    FROM issue_activities ia
    JOIN issues i ON ia.issue_id = i.id
    JOIN states s ON i.state_id = s.id
    JOIN issue_assignees ass ON ass.issue_id = i.id
    AND ass.assignee_id = $1
    LEFT JOIN users u ON ia.actor_id = u.id
    WHERE
    ia.deleted_at IS NULL
    AND ass.deleted_at IS NULL
    AND s."group" ILIKE ANY (ARRAY['unstarted','started', 'backlog'])
    AND (
        ia.field ILIKE 'comment'
        OR (ia.verb IN ('created','updated') AND ia.field IS NOT NULL)
        OR ia.field ILIKE 'state'
    )
    ORDER BY ia.created_at DESC
    LIMIT 20;
    """,
                        "tables": ["issue_activities", "issues", "states", "issue_assignees", "users"],
                        "placeholders_in_order": ["user_id"],
                        "tool_name": "structured_db_tool",
                    }
                ],
            }
        ],
        "What's the progress of current active cycles?": [
            {
                "step_type": "routing",
                "skip_routing": True,
                "reasoning_messages": [
                    "🎯 Using optimized path for active cycle progress query\n\n",
                    "🔧 Performing database querying to pull details about: 'progress of work items in current active cycles'",
                ],
                "agents": [
                    {
                        "agent": "structured_db_tool",
                        "query": "What's the progress of current active cycles?",
                        "sql_query": """SELECT
   cycles.id::text AS cycles_id,
   cycles.name,
   cycles.start_date,
   cycles.end_date,
   COUNT(DISTINCT cycle_issues.issue_id) AS total_work_items,
   COUNT(DISTINCT CASE WHEN states.group = 'completed' THEN cycle_issues.issue_id END) AS completed_work_items,
   CASE
    WHEN COUNT(DISTINCT cycle_issues.issue_id) = 0 THEN 0
    ELSE ROUND(
      COUNT(DISTINCT CASE WHEN states.group = 'completed' THEN cycle_issues.issue_id END)::decimal
      / COUNT(DISTINCT cycle_issues.issue_id) * 100, 2
    )
   END AS percent_complete
FROM cycles
LEFT JOIN cycle_issues
  ON cycles.id = cycle_issues.cycle_id
  AND cycle_issues.deleted_at IS NULL
LEFT JOIN issues
  ON cycle_issues.issue_id = issues.id
  AND issues.deleted_at IS NULL
LEFT JOIN states
  ON issues.state_id = states.id
WHERE cycles.deleted_at IS NULL
  AND (cycles.end_date IS NULL OR cycles.end_date > CURRENT_TIMESTAMP)
GROUP BY cycles.id, cycles.name, cycles.start_date, cycles.end_date
ORDER BY cycles.start_date DESC NULLS LAST, cycles.name ASC;""",
                        "tables": ["states", "cycle_issues", "cycles", "issues"],
                        "placeholders_in_order": [],
                        "tool_name": "structured_db_tool",
                    }
                ],
            }
        ],
        # Multi-step queries for future implementation
        # "Summarize the latest updates for the last work item assigned to me": [
        #     {
        #         "step_type": "routing",
        #         "skip_routing": True,
        #         "reasoning_messages": [
        #             "🎯 Using multi-step approach for work item summary",
        #             "🔧 Step 1: Finding your most recent work item"
        #         ],
        #         "agents": [
        #             {
        #                 "agent": "",
        #                 "query": "Find my most recent work item",
        #                 "sql_query": """SELECT *""",
        #                 "tables": [],
        #                 "placeholders_in_order": [],
        #                 "tool_name": ""
        #             }
        #         ]
        #     },
        #     {
        #         "step_type": "tool_execution",
        #         "reasoning_messages": [
        #             "🔧 Step 2: Retrieving detailed updates for the work item"
        #         ],
        #         "agents": [
        #             {
        #                 "agent": "",
        #                 "query": "Get latest updates and comments for issue {issue_id}",
        #                 "tool_name": "",
        #                 "depends_on": ""
        #             }
        #         ]
        #     }
        # ],
        # "Summarize the latest updates for the most recent ten work items assigned to me with Urgent or High priority": [
        #     {
        #         "step_type": "routing",
        #         "skip_routing": True,
        #         "reasoning_messages": [
        #             "🎯 Using multi-step approach for high-priority work items summary",
        #             "🔧 Step 1: Finding your high-priority work items"
        #         ],
        #         "agents": [
        #             {
        #                 "agent": "",
        #                 "query": "Find my high priority work items",
        #                 "sql_query": """SELECT *""",
        #                 "tables": [],
        #                 "placeholders_in_order": [],
        #                 "tool_name": ""
        #             }
        #         ]
        #     },
        #     {
        #         "step_type": "tool_execution",
        #         "reasoning_messages": [
        #             "🔧 Step 2: Retrieving detailed updates for each work item"
        #         ],
        #         "agents": [
        #             {
        #                 "agent": "",
        #                 "query": "Get latest updates and comments for these priority issues",
        #                 "tool_name": "",
        #                 "depends_on": ""
        #             }
        #         ]
        #     }
        # ]
    }

    return preset_flows.get(question, [])


ENTITY_TYPE_TEMPLATES = {
    "projects": [
        {"text": "Workitems assigned to me in this project", "type": "projects", "mode": "ask"},
        {"text": "Status of current cycles in the project", "type": "projects", "mode": "ask"},
        {"text": "Workitems that moved to QA this week in the project", "type": "projects", "mode": "ask"},
        {"text": "Provide a breakdown of workitems by assignee in this project", "type": "projects", "mode": "ask"},
        # Build
        {"text": "Create a new cycle starting tomorrow", "type": "projects", "mode": "build"},
    ],
    "cycles": [
        {"text": "Workitems assigned to me in the current cycle with High or Urgent priority", "type": "cycles", "mode": "ask"},
        {"text": "Performance of each team member in the last cycle", "type": "cycles", "mode": "ask"},
        {"text": "Workitems that moved to completed state in the current cycle", "type": "cycles", "mode": "ask"},
        {"text": "Provide a breakdown of workitems by assignee for the current cycle", "type": "cycles", "mode": "ask"},
        # Build
        {"text": "Draft a Page containing bug report detailing the status of bugs included in the current cycle", "type": "cycles", "mode": "build"},
        {"text": "Add all high priority issues to the current cycle", "type": "cycles", "mode": "build"},
        {"text": "Create a new cycle starting tomorrow", "type": "cycles", "mode": "build"},
    ],
    "modules": [
        {"text": "State distribution of workitems in the current module", "type": "modules", "mode": "ask"},
        {"text": "How many high-priority workitems are assigned to me in the current module", "type": "modules", "mode": "ask"},
        {"text": "How many workitems are in backlog in the current module", "type": "modules", "mode": "ask"},
        # Build
        {"text": "Add all high priority issues to the current module", "type": "modules", "mode": "build"},
        {"text": "Draft a module description for the current module and update it", "type": "modules", "mode": "build"},
    ],
    "initiatives": [
        {"text": "Status of Active initiatives in which I'm the lead", "type": "initiatives", "mode": "ask"},
        {"text": "Which initiatives are overdue?", "type": "initiatives", "mode": "ask"},
        {"text": "Show me the progress of all initiatives", "type": "initiatives", "mode": "ask"},
        # Build
        {"text": "Create a new initiative starting tomorrow", "type": "initiatives", "mode": "build"},
    ],
    "issues": [
        {"text": "Provide a breakdown of workitems by assignee in this project", "type": "issues", "mode": "ask"},
        {"text": "Show me the most commented workitems", "type": "issues", "mode": "ask"},
        {"text": "Which workitems are blocked?", "type": "issues", "mode": "ask"},
        # Build
        {"text": "Draft a Page containing a bug report detailing the status of bugs created in the last 15 days", "type": "issues", "mode": "build"},
    ],
}


ENTITY_TEMPLATES = {
    "projects": [
        {"text": "Workitems assigned to me in this project", "type": "projects", "mode": "ask"},
        {"text": "Status of current cycles in the project", "type": "projects", "mode": "ask"},
        {"text": "Workitems that moved to QA this week in the project", "type": "projects", "mode": "ask"},
        # Build
        {
            "text": "Draft a Page containing a bug report detailing the status of bugs created in the last 15 days",
            "type": "projects",
            "mode": "build",
        },
        {"text": "Enable Epics for this project", "type": "projects", "mode": "build"},
        {"text": "Enable Workitem-types for this project", "type": "projects", "mode": "build"},
        {"text": "Enable time-tracking for this project", "type": "projects", "mode": "build"},
        {"text": "Create a new cycle starting tomorrow", "type": "projects", "mode": "build"},
    ],
    "cycles": [
        {"text": "Workitems assigned to me in this cycle with High or Urgent priority", "type": "cycles", "mode": "ask"},
        {"text": "Performance of each team member in this cycle", "type": "cycles", "mode": "ask"},
        {"text": "Workitems that moved to completed state in this cycle", "type": "cycles", "mode": "ask"},
        {"text": "Provide a breakdown of workitems by assignee for this cycle", "type": "cycles", "mode": "ask"},
        # Build
        {"text": "Add all pending workitems in the project to this cycle", "type": "cycles", "mode": "build"},
        {"text": "Draft a summary of this cycle and save it in a Page", "type": "cycles", "mode": "build"},
    ],
    "modules": [
        {"text": "State distribution of workitems in this module", "type": "modules", "mode": "ask"},
        {"text": "How many high-priority workitems are assigned to me in this module", "type": "modules", "mode": "ask"},
        {"text": "How many workitems are in backlog in this module", "type": "modules", "mode": "ask"},
        # Build
        {"text": "Update the description of this module", "type": "modules", "mode": "build"},
        {"text": "Draft a documentation for this module and save it in a Page", "type": "modules", "mode": "build"},
    ],
    "initiatives": [
        {"text": "Status of epics in this initiative", "type": "initiatives", "mode": "ask"},
        {"text": "How many epics are in backlog in this initiative", "type": "initiatives", "mode": "ask"},
        {"text": "How many workitems are completed in this initiative", "type": "initiatives", "mode": "ask"},
        # Build
        {"text": "Update the description of this initiative", "type": "initiatives", "mode": "build"},
        {"text": "Draft a progress report for this initiative and save it in a Page", "type": "initiatives", "mode": "build"},
    ],
    "issues": [
        {"text": "Summarize the activity in this workitem", "type": "issues", "mode": "ask"},
        {"text": "Summarize all the comments in this workitem", "type": "issues", "mode": "ask"},
        {"text": "Update the description of this workitem", "type": "issues", "mode": "build"},
        {"text": "Create sub-tasks for this workitem", "type": "issues", "mode": "build"},
        {
            "text": "Add a comment summarizing all the activity/comments pertaining to the workitems blocking this one",
            "type": "issues",
            "mode": "build",
        },
    ],
    "pages": [
        {"text": "Summarize this page in 100 words", "type": "pages", "mode": "ask"},
        {"text": "What are the main topics in this page?", "type": "pages", "mode": "ask"},
        {"text": "Create relevant workitems with actionables from this page", "type": "pages", "mode": "build"},
    ],
}


def tiles_factory(
    entity_type: Optional[str] = None,
    entity_id: Optional[UUID4] = None,
    mode: Literal["ask", "build"] = "ask",
    workspace_id: Optional[UUID4] = None,
    project_id: Optional[UUID4] = None,
) -> List[ChatSuggestion]:
    """
    Factory function to create chat suggestions filtered by entity and mode.
    Returns up to 3 random templates matching the criteria.

    Hierarchy:
    1. Get candidate templates based on entity context (specific entity > entity type > workspace)
    2. Filter candidates by mode
    3. If not enough templates, fall back to broader scope (also filtered by mode)
    4. Randomly sample up to 3 templates
    """

    project_scoped_cats = [
        "cycles",
        "cycle",
        "modules",
        "module",
        "worklogs",
        "worklog",
        "epics",
        "epic",
        "intake",
        "intakes",
        "properties",
        "property",
        "types",
        "type",
        "pages",
        "page",
    ]

    try:
        # Step 1: Get candidate templates based on entity context
        if not entity_type and not entity_id:
            # Workspace-level context
            candidate_templates = WORKSPACE_TEMPLATES
        elif entity_type and not entity_id:
            # Entity type context (e.g., "show questions for cycles in general")
            candidate_templates = ENTITY_TYPE_TEMPLATES.get(entity_type, [])
        elif entity_type and entity_id:
            # Specific entity context (e.g., "questions for THIS cycle")
            candidate_templates = ENTITY_TEMPLATES.get(entity_type, [])
        else:
            candidate_templates = WORKSPACE_TEMPLATES

        # Step 2: Filter by mode
        filtered_templates = [t for t in candidate_templates if t.get("mode") == mode]

        # Step 3: If not enough templates after mode filtering, try fallback sources
        if len(filtered_templates) < 3:
            # Determine fallback source
            if entity_type and entity_id:
                # If specific entity, fall back to entity type templates
                fallback_source = ENTITY_TYPE_TEMPLATES.get(entity_type, [])
            elif entity_type in project_scoped_cats:
                # If project-scoped category, fall back to project templates
                fallback_source = ENTITY_TEMPLATES.get("projects", []) if entity_id else ENTITY_TYPE_TEMPLATES.get("projects", [])
            else:
                # Otherwise, fall back to workspace templates
                fallback_source = WORKSPACE_TEMPLATES

            # Filter fallback by mode and add to pool
            fallback_filtered = [t for t in fallback_source if t.get("mode") == mode]

            # Combine without duplicates (based on text)
            existing_texts = {t["text"] for t in filtered_templates}
            for template in fallback_filtered:
                if template["text"] not in existing_texts:
                    filtered_templates.append(template)
                    existing_texts.add(template["text"])

        # Step 4: Randomly sample up to 3 templates
        num_to_sample = min(3, len(filtered_templates))
        selected_templates = random.sample(filtered_templates, num_to_sample) if num_to_sample > 0 else []

        # Step 5: Convert to ChatSuggestion objects
        suggestions = [
            ChatSuggestion(text=template["text"], type=template["type"], mode=template.get("mode", "ask"), id=[]) for template in selected_templates
        ]

        return suggestions

    except Exception as e:
        log.error(f"Error creating chat suggestions: {e}")
        # Fallback with mode-appropriate templates
        fallback_templates: List[Dict[str, Any]] = [
            {"text": "What work items are assigned to me and not yet completed?", "type": ChatType.ISSUES, "mode": "ask"},
            {"text": "Show me my overdue work items", "type": ChatType.ISSUES, "mode": "ask"},
            {"text": "Who commented on my work items recently?", "type": ChatType.ISSUES, "mode": "ask"},
        ]
        mode_filtered_fallback = [t for t in fallback_templates if t.get("mode") == mode]
        if not mode_filtered_fallback:
            # If no mode match, use all fallback templates
            mode_filtered_fallback = fallback_templates

        return [
            ChatSuggestion(text=template["text"], type=template["type"], mode=template.get("mode", "ask"), id=[])
            for template in mode_filtered_fallback[:3]
        ]
