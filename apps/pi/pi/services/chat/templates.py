import random
from typing import Any
from typing import Dict
from typing import List

from pi import logger
from pi.app.schemas.chat import ChatSuggestion
from pi.app.schemas.chat import ChatType

log = logger.getChild(__name__)


# ========================== PREDEFINED TEMPLATES ==========================
WORKSPACE_TEMPLATES: List[Dict[str, Any]] = [
    # Simple work item queries
    {"text": "Show me my urgent work items that are still pending", "type": ChatType.ISSUES, "category": "work_items"},
    {
        "text": "What work items are assigned to me and not yet completed, with start and end dates, priorities?",
        "type": ChatType.ISSUES,
        "category": "work_items",
    },
    {"text": "Show me my overdue work items", "type": ChatType.ISSUES, "category": "work_items"},
    {"text": "What did I complete this week?", "type": ChatType.ISSUES, "category": "work_items"},
    {"text": "Show me work items I'm working on currently", "type": ChatType.ISSUES, "category": "work_items"},
    {
        "text": "What work items are assigned to me that are blocked, and which ones are blocking them?",
        "type": ChatType.ISSUES,
        "category": "work_items",
    },
    # Simple activity queries
    {"text": "Who commented on my work items recently?", "type": ChatType.ISSUES, "category": "activity"},
    {"text": "What changed in my pending work items today?", "type": ChatType.ISSUES, "category": "activity"},
    {"text": "Show me recent activity on my pending work items", "type": ChatType.ISSUES, "category": "activity"},
    # Simple planning queries
    # {"text": "Help me prioritize my work items", "type": ChatType.ISSUES, "category": "planning"},
    {"text": "What's the progress of work items in current active cycles?", "type": ChatType.ISSUES, "category": "planning"},
    ## Multi-tool call queries. Will be used in the future.
    # {"text": "Summarize the latest updates for the last work item assigned to me", "type": ChatType.ISSUES, "category": "work_items"},
    # {
    #     "text": "Summarize the latest updates for the most recent ten work items assigned to me with Urgent or High priority",
    #     "type": ChatType.ISSUES,
    #     "category": "work_items",
    # },
]


def preset_question_flow(question: str) -> List[Dict[str, Any]]:
    """
    End-to-end query flow for the given preset question.
    Returns a list of flow steps that define the complete processing pipeline.

    Each step contains:
    - step_type: The type of step (routing, agent_execution, etc.)
    - agents: List of agents to execute with their queries and parameters
    - skip_routing: Whether to skip the normal routing process
    - reasoning_messages: Messages to show during processing
    """

    preset_flows = {
        "Show me my urgent work items that are still pending": [
            {
                "step_type": "routing",
                "skip_routing": True,
                "reasoning_messages": [
                    "🎯 Using optimized path for urgent work items query",
                    "🔧 Performing database querying to pull details about: 'urgent work items assigned to me'",
                ],
                "agents": [
                    {
                        "agent": "plane_structured_database_agent",
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
                    "🎯 Using optimized path for assigned work items query",
                    "🔧 Performing database querying to pull details about: 'work items assigned to me and not yet completed along with start and end dates, priorities'",  # noqa: E501
                ],
                "agents": [
                    {
                        "agent": "plane_structured_database_agent",
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
                    "🎯 Using optimized path for overdue work items query",
                    "🔧 Performing database querying to pull details about: 'overdue work items assigned to me'",
                ],
                "agents": [
                    {
                        "agent": "plane_structured_database_agent",
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
  AND issues.target_date < CURRENT_DATE
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
                    "🎯 Using optimized path for completed work items query",
                    "🔧 Performing database querying to pull details about: 'work items I completed this week'",
                ],
                "agents": [
                    {
                        "agent": "plane_structured_database_agent",
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
                    "🎯 Using optimized path for current work items query",
                    "🔧 Performing database querying to pull details about: 'work items I am currently working on'",
                ],
                "agents": [
                    {
                        "agent": "plane_structured_database_agent",
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
                    "🎯 Using optimized path for blocked work items query",
                    "🔧 Performing database querying to pull details about: 'blocked work items assigned to me and their blocking issues'",
                ],
                "agents": [
                    {
                        "agent": "plane_structured_database_agent",
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
                    "🎯 Using optimized path for recent commenters query",
                    "🔧 Performing database querying to pull details about: 'users who recently commented on my work items'",
                ],
                "agents": [
                    {
                        "agent": "plane_structured_database_agent",
                        "query": "Who commented on my work items recently?",
                        "sql_query": """SELECT
    users.id::text AS users_id,
    users.first_name,
    users.last_name,
    MAX(issue_comments.created_at) AS most_recent_comment_date
FROM issue_assignees
JOIN issues ON issue_assignees.issue_id = issues.id
JOIN issue_comments ON issue_comments.issue_id = issues.id
JOIN users ON users.id = issue_comments.created_by_id
WHERE issue_assignees.assignee_id = $1
  AND issue_comments.deleted_at IS NULL
  AND issue_assignees.deleted_at IS NULL
GROUP BY users.id, users.first_name, users.last_name
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
                    "🎯 Using optimized path for today's work item changes query",
                    "🔧 Performing database querying to pull details about: 'changes made to my pending work items today'",
                ],
                "agents": [
                    {
                        "agent": "plane_structured_database_agent",
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
                    "🎯 Using optimized path for recent activity query",
                    "🔧 Performing database querying to pull details about: 'recent activity on my pending work items'",
                ],
                "agents": [
                    {
                        "agent": "plane_structured_database_agent",
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
                    "🎯 Using optimized path for active cycle progress query",
                    "🔧 Performing database querying to pull details about: 'progress of work items in current active cycles'",
                ],
                "agents": [
                    {
                        "agent": "plane_structured_database_agent",
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
        #         "step_type": "agent_execution",
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
        #         "step_type": "agent_execution",
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


def tiles_factory() -> List[ChatSuggestion]:
    """
    Factory function to create chat suggestions.
    Returns 3 random templates from the available templates.
    """
    try:
        # Randomly select 3 templates from workspace templates
        selected_templates = random.sample(WORKSPACE_TEMPLATES, min(3, len(WORKSPACE_TEMPLATES)))

        suggestions = []
        for template in selected_templates:
            suggestions.append(ChatSuggestion(text=template["text"], type=template["type"], id=[]))

        return suggestions

    except Exception as e:
        log.error(f"Error creating chat suggestions: {e}")
        fallback_templates: List[Dict[str, Any]] = [
            {"text": "What work items are assigned to me and not yet completed, with start and end dates, priorities?", "type": ChatType.ISSUES},
            {"text": "Show me my overdue work items", "type": ChatType.ISSUES},
            {"text": "Who commented on my work items recently?", "type": ChatType.ISSUES},
        ]

        return [ChatSuggestion(text=template["text"], type=template["type"], id=[]) for template in fallback_templates]
