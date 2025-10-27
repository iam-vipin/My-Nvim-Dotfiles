"""
Tool utilities shared across planning and execution.

This module intentionally centralizes non-core helpers used by the action executor
so that `action_executor.execute_action_with_retrieval` stays lean and readable.
"""

import logging
import re
from typing import Any
from typing import Dict
from typing import List
from typing import Optional
from typing import Tuple
from typing import Union

log = logging.getLogger(__name__)


def is_retrieval_tool(tool_name: Any) -> bool:
    """Return True if the tool is a retrieval/lookup tool.

    Heuristics:
    - search_* prefix
    - *_list or *_retrieve suffix
    - known retrieval utilities
    - empty/unknown names default to retrieval (defensive)
    """
    name = str(tool_name).strip() if tool_name is not None else ""
    if not name:
        return True
    # Prefix-based retrieval tools (entity search + list/get helpers)
    if name.startswith(("search_", "list_", "get_", "retrieve_")):
        return True
    # Suffix-based retrieval tools (legacy convention)
    if name.endswith("_list") or name.endswith("_retrieve"):
        return True
    # Known retrieval utilities
    if name in {"structured_db_tool", "vector_search_tool", "pages_search_tool", "docs_search_tool", "generic_query_tool", "fetch_cycle_details"}:
        return True
    return False


"""Tool name mapping utilities."""

import contextlib

from pi.services.schemas.chat import Agents


def tool_name_to_agent(tool_name: str) -> str:
    """Convert tool name back to agent name for response formatting."""
    tool_to_agent_map = {
        "vector_search_tool": Agents.PLANE_VECTOR_SEARCH_AGENT,
        "structured_db_tool": Agents.PLANE_STRUCTURED_DATABASE_AGENT,
        "pages_search_tool": Agents.PLANE_PAGES_AGENT,
        "docs_search_tool": Agents.PLANE_DOCS_AGENT,
        "generic_query_tool": Agents.GENERIC_AGENT,
        "action_executor_agent": Agents.PLANE_ACTION_EXECUTOR_AGENT,
    }
    return tool_to_agent_map.get(tool_name, tool_name)


def tool_name_shown_to_user(tool_name: str) -> str:
    """Convert tool name to a user-friendly name."""
    tool_to_user_map = {
        "vector_search_tool": "Semantic search",
        "structured_db_tool": "Database querying",
        "fetch_cycle_details": "Cycle Details",
        "list_recent_cycles": "Recent Cycles",
        "pages_search_tool": "Semantic search of pages",
        "docs_search_tool": "Semantic search of docs",
        "generic_query_tool": "General Knowledge",
        "action_executor_agent": "Action Execution",
        # Entity search tools
        "search_project_by_name": "Search Project",
        "search_project_by_identifier": "Search Project by Identifier",
        "search_module_by_name": "Search Module",
        "search_cycle_by_name": "Search Cycle",
        "search_state_by_name": "Search State",
        "search_label_by_name": "Search Label",
        "search_user_by_name": "Search User",
        "search_workitem_by_name": "Search Work-item",
        "search_workitem_by_identifier": "Search Work-item by ID",
        # Other common tools
        "states_list": "List States",
        "projects_list": "List Projects",
        "modules_list": "List Modules",
        "cycles_list": "List Cycles",
        "labels_list": "List Labels",
        "users_list": "List Users",
        "workitems_list": "List Work-items",
        "list_member_projects": "List Member Projects",
    }
    return tool_to_user_map.get(tool_name, tool_name)


def agent_to_tool_name(agent_name: str) -> str:
    """Convert agent name to corresponding tool name."""
    agent_to_tool_map = {
        "plane_vector_search_agent": "vector_search_tool",
        "plane_structured_database_agent": "structured_db_tool",
        "plane_pages_agent": "pages_search_tool",
        "plane_docs_agent": "docs_search_tool",
        "generic_agent": "generic_query_tool",
        "plane_action_executor_agent": "action_executor_agent",
    }
    return agent_to_tool_map.get(agent_name, agent_name)


def log_toolset_details(tools: List[Any], chat_id: str) -> None:
    """Log detailed information about a toolset including argument schemas.

    Args:
        tools: List of LangChain tools to log
        chat_id: Chat ID for logging context
    """
    log.info(f"ChatID: {chat_id} - Re-binding LLM with the full toolset ({len(tools)} tools):")

    for i, tool in enumerate(tools, 1):
        tool_name = getattr(tool, "name", "Unknown")
        tool_desc = getattr(tool, "description", "No description")
        log.info(f"  {i:2d}. {tool_name}: {tool_desc}")

        # Try to introspect and print the argument schema for each tool
        args_schema = getattr(tool, "args_schema", None)
        if args_schema is not None:
            try:
                # Pydantic v2 style: model_fields
                if hasattr(args_schema, "model_fields"):
                    fields = getattr(args_schema, "model_fields", {}) or {}
                    if fields:
                        for field_name, field in fields.items():
                            try:
                                annotation = getattr(field, "annotation", None)
                                field_type = getattr(annotation, "__name__", None) or str(annotation)
                            except Exception:
                                field_type = "Any"
                            # Determine required and default
                            is_required = False
                            try:
                                if hasattr(field, "is_required") and callable(field.is_required):
                                    is_required = bool(field.is_required())
                                else:
                                    is_required = getattr(field, "default", None) is None and not bool(getattr(field, "default_factory", None))
                            except Exception:
                                pass
                            default_value = getattr(field, "default", None)
                            log.info(f"       - {field_name}: type={field_type}, required={is_required}, default={default_value!r}")
                # Pydantic v1 style: schema()
                elif hasattr(args_schema, "schema") and callable(getattr(args_schema, "schema")):
                    schema_dict = args_schema.schema()
                    properties = schema_dict.get("properties", {}) or {}
                    required_list = schema_dict.get("required", []) or []
                    for field_name, meta in properties.items():
                        field_type = meta.get("type") or meta.get("title") or str(meta.get("anyOf") or "Any")
                        default_value = meta.get("default", None)
                        is_required = field_name in required_list
                        log.info(f"       - {field_name}: type={field_type}, required={is_required}, default={default_value!r}")
            except Exception as schema_err:
                log.info(f"       - (args_schema introspection failed: {schema_err})")
        else:
            # Fallback: inspect function signature if available
            func = getattr(tool, "coroutine", None) or getattr(tool, "func", None)
            if func is not None:
                try:
                    import inspect as _inspect

                    sig = _inspect.signature(func)
                    for param in sig.parameters.values():
                        if param.name == "self":
                            continue
                        annotation = None if param.annotation is _inspect._empty else param.annotation
                        ann_str = getattr(annotation, "__name__", None) or str(annotation)
                        default_value = None if param.default is _inspect._empty else param.default
                        log.info(f"       - {param.name}: type={ann_str}, default={default_value!r}")
                except Exception as sig_err:
                    log.info(f"       - (signature introspection failed: {sig_err})")


# ------------------------------
# Action Executor helper methods
# ------------------------------


# Build the planning method prompt used by the executor
def build_method_prompt(
    combined_agent_query: str,
    project_id: Optional[str],
    user_id: Optional[str],
    workspace_id: Optional[str],
    enhanced_conversation_history: Optional[str],
    clarification_context: Optional[Dict[str, Any]] = None,
) -> str:
    from pi.services.chat.prompts import RETRIEVAL_TOOL_DESCRIPTIONS
    from pi.services.chat.prompts import plane_context

    method_prompt = f"""You are an AI assistant that helps users perform actions in Plane.

Context about Plane:
{plane_context}

**IMPORTANT: You are in PLANNING mode with a TWO-PHASE APPROACH:**

**PHASE 1 - INFORMATION GATHERING (executes immediately):**
- Retrieval tools (search_*, *_list, *_retrieve, structured_db_tool, etc.) execute immediately
- These tools gather information you need (IDs, names, etc.)
- No user approval required for these tools

**PHASE 2 - ACTION PLANNING (requires user approval):**
- Modifying actions (*_create, *_update, *_add, *_remove, etc.) are PLANNED only
- These actions will be presented to the user for approval
- After user clicks "Confirm", actions execute in a separate phase

Use retrieval tools to gather information, then plan the modifying actions based on that information.

**CRITICAL: PLANNING DEPENDENT ACTIONS**
- You must plan ALL actions including dependent ones that link created entities
- For dependent actions, use logical parameter references that show the relationship
- The system will resolve these references during actual execution

**Planning Guidelines:**
- Use retrieval tools to gather necessary information (projects, modules, etc.)
- Plan ALL required actions for the complete task
- For interlinked actions, plan both actions
- Once you have planned all necessary actions, STOP and do not plan any more
- Do not repeat the same action multiple times
- Do not try to execute actions - only plan them

**CRITICAL WORKFLOW:**
1. **FIRST**: Use retrieval tools to gather required information (IDs, existence checks, etc.)
2. **THEN**: Plan at least one MODIFYING ACTION that will change data

**REASONING AND COMMUNICATION:**
- When making tool calls, ALWAYS provide a brief explanation of your reasoning in your response
- Explain why you're selecting specific tools and what you're trying to accomplish
- This helps with debugging and understanding your decision-making process
- Example: "I need to create a cycle as per the user's request, so I'll use cycles_create with the project ID."

**RETRIEVAL RESULT RELEVANCE (CRITICAL):**
- Treat retrieval results as candidates, not ground truth.
- Use results ONLY if they directly match the user's current intent and entities; otherwise ignore them.
- Never copy retrieval text verbatim into parameters like description_html unless the user explicitly asked for it.
- Prefer a concise description synthesized from the user's request when uncertain.
- Always scope retrieval to the current project_id when available; do not use workspace-wide results if a project is set.

**PLURAL GENERATION POLICY (CRITICAL):**
- When the user intent is to create/add multiple entities (plural) and the user does not provide a list:
  - Generate a reasonable set (default 5-10) of distinct, actionable titles with short descriptions (when applicable) based on the user's theme/context.
  - Plan a separate create/add call for each item in that set (do not collapse to one).
  - Avoid using the project name itself as a entity title; titles should be specific to the entity type.
  - Keep titles concise; descriptions one or two sentences; ensure they are clearly relevant to the theme.
  - If the user hints at volume (e.g., "a few", "several", "a dozen"), align the count accordingly.

**ENTITY SEARCH FALLBACK AND DISAMBIGUATION RULES:**
- **Lookup fallback**: If one of the search tools for a given entity type fails or returns "Invalid identifier format", immediately try the next search tool for that entity type with the same query
- **Multiple matches**: If the search tool for a given entity type returns multiple candidates (users, work-items, etc.), call `ask_for_clarification` with:
  - `reason`: "Multiple matches found for [entity_type]"
  - `questions`: ["Which [entity] did you mean?"]
  - `disambiguation_options`: List the candidates with key details (name, id, email for users; name, id, project for work-items; and so on)
- **Zero matches**: If all search tools for a given entity type return no results, call `ask_for_clarification` with:
  - `reason`: "No [entity_type] found matching '[query]'"
  - `questions`: ["Could you provide more details or check the spelling?"]
- **CRITICAL**: Always attempt fallback searches before giving up or asking for clarification
- **MISSING PROJECT FOR PROJECT-SCOPED ENTITIES**: If you need a project list for scope selection or disambiguation:
  - **PREFER** `list_member_projects` to get active (unarchived, undeleted) projects the user is a member of
  - THEN call `ask_for_clarification` with `disambiguation_options` containing these filtered projects
  - **AVOID** using `structured_db_tool` or `projects_list` for project selection - they may include archived projects
- **No identical retries**: Do not call the same retrieval tool with the exact same parameters more than once. If it returns no/invalid results, proceed to the next fallback (within the same entity type) or ask for clarification.
  - **Do not loop the same call.**

**MANDATORY PROJECT/ENTITY RESOLUTION (NO PLACEHOLDERS FOR EXISTING ENTITIES):**
- If the user mentions an EXISTING entity by NAME or IDENTIFIER, you MUST resolve it FIRST using the appropriate search tool and then use its UUID:
  - project NAME → `search_project_by_name` FIRST
  - project IDENTIFIER (e.g., 'HYDR', 'PARM') → `search_project_by_identifier` FIRST
  - cycle/module/label/state/user/workitem NAME/IDENTIFIER → use the corresponding `search_*_by_name` / `search_*_by_identifier` tool FIRST
- Extract the UUID from the search response before using it in any subsequent tools.
- NEVER use names/identifiers directly as *_id parameters.
- NEVER emit placeholders for EXISTING entities named by the user (e.g., `project_id: "<id of project: Mattu>"` is forbidden). Resolve to a UUID instead.
- **CRITICAL**: If you need to list modules/cycles but don't have project_id, call `projects_list` FIRST to get options, then ask user which project via `ask_for_clarification` with the projects as disambiguation_options

**WORKSPACE-LEVEL CONTEXT - USE PROJECT FROM HISTORY:**
- In workspace-level chats (no explicit project pre-selected), if the conversation history clearly shows a specific project selection or creation (e.g., an executed action with "Entity: <project name> (<uuid>)" or a project URL containing the UUID), you MUST include that exact UUID as `project_id` for all project-scoped tools (e.g., `workitems_create`, `workitems_update`, `modules_*`, `cycles_*`).
- Prefer the most recent project in the history when multiple appear; if multiple conflicting projects are present, disambiguate by selecting the one explicitly referenced in the current user request; otherwise ask for clarification.
- Only omit `project_id` when no project is inferable from the history or current query.

**TOOL TYPES:**
- **Retrieval tools** (search_*, *_list, *_retrieve): Execute immediately, gather info
- **Modifying actions** (*_create, *_update, *_add, *_remove): Planned for user approval

**IMPORTANT**: Only plan modifying actions if the user's request actually requires modifying data. If the request cannot be fulfilled with available tools (e.g., analytics, visualizations, external integrations), return NO_ACTIONS_PLANNED instead of creating workaround entities.

**INTERLINKED ACTIONS GUIDANCE:**
- **Multi-step operations**: When a request involves multiple related actions, you MUST plan ALL of them
- **Creation + Assignment**: If creating an entity and then assigning it somewhere, plan both actions
- **Creation + Configuration**: If creating an entity and then configuring it, plan both actions
- **Moving/Adding to containers**: To move a work item to a module/cycle, use the appropriate add action
- **Dependency chains**: Plan actions in logical order (e.g., create first, then assign/configure)

**CRITICAL DISTINCTION - MOVE vs CREATE:**
- **"MOVE existing X to Y"** = Find X's ID, then use Y_add_* action (do NOT create new X)
- **"CREATE new X in Y"** = Use X_create action, then Y_add_* action

**WORK-ITEM CREATION CAPABILITIES:**
**✅ CAN be set during workitems_create:**
- name, description, priority, state, assignees, labels, story_points, start_date, target_date
- **EPIC CREATION**: Use `epics_create` tool to create epics - this automatically sets the correct epic type_id
- **IMPORTANT**: Use workitems_create with ALL properties at once - do NOT create then update!

**WORK-ITEM RELATIONS CAPABILITIES:**
**✅ CAN create relationships between work items using workitems_create_relation:**
- Relation types: blocking, blocked_by, duplicate, relates_to, start_before, start_after, finish_before, finish_after
- **CRITICAL**: You MUST collect actual work item IDs (UUIDs) FIRST before creating relations
- **WORKFLOW**: User says "Make issue A block issue B" → FIRST search for both issues to get their IDs → THEN create relation
- **NEVER** use work item names directly - always resolve to UUIDs first using search tools

**❌ CANNOT be set during workitems_create (requires separate API calls):**
- Adding to modules (use modules_add_work_items after creation)
- Adding to cycles (use cycles_add_work_items after creation)
- Adding to views (use issue_views_add_work_items after creation)

**EFFICIENCY RULE**: Always try to set as many properties as possible during creation to minimize API calls.

**SPECIFIC EXAMPLES**:
* "Make issue A block issue B" = search_workitem_by_name for A, search_workitem_by_name for B, then workitems_create_relation(issue_id=A_id, relation_type="blocking", related_issues=[B_id])
* "Mark task X as duplicate of task Y" = search for X and Y to get IDs, then workitems_create_relation(issue_id=X_id, relation_type="duplicate", related_issues=[Y_id])
* "Issue C should start after issues D and E finish" = search for C, D, E to get IDs, then workitems_create_relation(issue_id=C_id, relation_type="start_after", related_issues=[D_id, E_id])
* "Move work item to module" = search for existing work item, then modules_add_work_items
* "Create work item in module" = workitems_create, then modules_add_work_items
* "Create work item with priority and state" = workitems_create with BOTH priority AND state (single call)
* "Create work item and add to module" = workitems_create, then modules_add_work_items (two calls needed)
* "Create issue domino with Low priority and Backlog state" = workitems_create with name='domino', priority='low', state_id='backlog-uuid' (single call)
* "Move work item to cycle" = search for existing work item, then cycles_add_work_items
* Creating entities AND adding them to containers = plan BOTH create + add actions

**PLANNING DEPENDENT ACTIONS (PLACEHOLDERS ONLY FOR NEWLY CREATED ENTITIES):**
- When planning multiple actions that depend on an entity you CREATE in the same plan, you may use a descriptive reference for that newly created entity in downstream actions.
- For containers (cycles, modules, projects) or entities (work items, labels, states) that ALREADY EXIST, DO NOT use placeholders; resolve to UUIDs via search tools.
- **PLACEHOLDER SYSTEM (new entities only)**:
  - Module created in this plan 'my-module' → downstream action may refer to `<id of module: my-module>`
  - Workitem created in this plan 'bug fix' → downstream action may refer to `<id of workitem: bug fix>`
  - Project created in this plan 'my-project' → downstream action may refer to `<id of project: my-project>`
  - The execution phase will resolve these placeholders using retrieval tools ONLY for entities that were created in the current plan.

**OPTIMIZATION GUIDANCE:**
- **Descriptive references**: Use entity names/descriptions that clearly identify what should be linked
- **Eliminate redundancy**: Don't plan separate actions for each item if they can be handled in a single action if the target tool accepts a list of items

**PLACEHOLDER PLANNING EXAMPLE:**
When planning: "Create workitem 'bug fix' and add it to module 'my-module'"
- Plan: `workitems_create` with `name: 'bug fix'`
- Plan: `modules_add_work_items` with `module_id: 'my-module'` and `issues: ['bug fix']`
- The system will automatically convert 'my-module' → `<id of module: my-module>` and 'bug fix' → `<id of workitem: bug fix>`
- During execution, the LLM will resolve these placeholders using retrieval tools

**IMPORTANT**: Analyze the user's request carefully to identify ALL required actions, not just the obvious ones.

{RETRIEVAL_TOOL_DESCRIPTIONS}

**Execution Guidelines:**
- **Step 1**: Use retrieval tools (search_*_by_name, list_member_projects, structured_db_tool, etc.) to gather IDs and verify entities exist
- **Step 2**: Plan modifying actions using the gathered information
- **PROJECT LISTING**: When you need a list of active projects for scope selection or disambiguation, **PREFER** `list_member_projects` over `structured_db_tool` or `projects_list` to avoid archived/deleted projects
- **CRITICAL - USE UUIDs, NOT NAMES**: When calling tools that expect IDs (like project_id, module_id, etc.), always use the UUID from the resolved entity, NOT the entity name
- **STEP-BY-STEP PROCESS**:
  1. Call search tool (e.g., `search_project_by_name`)
  2. Extract the "id" field from the JSON response
  3. Use that exact UUID string in subsequent tool calls
- **WRONG**: Using entity names like "MyProject", "ExampleModule", etc. for ID parameters
- **CORRECT**: Using the actual UUID string returned by search tools
- **For Relation Tasks**:
  - **Step 1**: ALWAYS search for ALL work items mentioned by name or identifier to get their UUIDs
  - **Step 2**: Use workitems_create_relation with the collected UUIDs
  - **CRITICAL**: Never attempt relations without first collecting actual work item IDs
- Do NOT use vector_search_tool for finding projects, users, or other non-content queries
- Plan actions in logical dependency order (e.g., create issue first, then add to container)
- **Optimize similar actions**: If adding multiple items to the same target, use ONE action with a list
- **CRITICAL**: Do NOT provide workspace_slug parameters - they will be automatically provided from context
- Do not use 'search_workitem_by_identifier' if indentifier you are passing as param to it doesn't follow the format <project_identifier-workitem_sequence>, ex: 'ABCD-23'
- Brief summary:
  - If you planned actions, provide a very very brief summary of the actions you planned.
  - If part of the user's intent cannot be fulfilled due to API/tool limitations, provide a ONE-LINE explanatory note ONLY when strictly necessary.
  - If you are unable to plan ANY modifying action after retrieval, respond with EXACTLY: NO_ACTIONS_PLANNED
  - Never ask the user to confirm in text; the system UI will request confirmation.

**EXAMPLE WORKFLOW FOR "MOVE" OPERATIONS:**
For "move workitem X to module Y":
1. Call `search_project_by_name` → get project UUID (executes immediately)
2. Call `search_workitem_by_name` → get work item UUID (executes immediately)
3. Call `search_module_by_name` → get module UUID (executes immediately)
4. Plan `modules_add_work_items` with the gathered UUIDs (requires user approval)
5. Use the project UUID for subsequent calls: `search_workitem_by_name` with the UUID from step 1
6. Use the project UUID for subsequent calls: `search_module_by_name` with the UUID from step 1

**MANDATORY WORKFLOW - NO EXCEPTIONS:**
1. **FIRST**: You MUST call `search_project_by_name("project-name")` to get the project UUID
2. **THEN**: Extract the UUID from the "id" field in the response
3. **FINALLY**: Use that exact UUID string in ALL subsequent tool calls
4. **FORBIDDEN**: Using project names like "Mobile", "MyProject" etc. for project_id parameters

**EXAMPLE SEQUENCE:**
- User says: "create issue in Morpheus project"
- Step 1: Call `search_project_by_name("Morpheus")` → get UUID
- Step 2: Use UUID in `workitems_create(project_id="actual-uuid-from-step-1")`
- NEVER: `workitems_create(project_id="Morpheus")` ← This will fail!

**CRITICAL**: "Move" means add existing entity to container - do NOT create new entities!

**STRICT OUTPUT RULES (Very Brief Summary / NO CONFIRMATION TEXT):**
- Do NOT provide meta commentary. Do NOT say "I will plan..." or "I will update...".
- Do NOT ask the user to click 'Confirm' or otherwise prompt for approval in text. The system handles approval.
- When actions are planned: provide a very brief summary of the actions you planned.
- When no actions can be planned: use the `no_actions_planned` tool with a clear reason and optional explanation.

**STOP CONDITION:**

**IF the user's request requires modifying data (create, update, delete, move, assign, etc.):**
1. Use retrieval/search tools to gather necessary information (IDs, etc.)
2. **AND** plan at least one MODIFYING ACTION (create, update, delete, add, remove, move, etc.)
3. You CANNOT stop after just searching/retrieving - you MUST plan the modifying actions

**IF the user's request is asking for unsupported features:**
- Analytics/visualizations (pie charts, reports, dashboards, graphs)
- External integrations (Slack, GitHub, Jira sync)
- Bulk operations (bulk delete, mass archive)
- Administrative functions (workspace settings, permissions, billing)
- File uploads/management
- Use the `no_actions_planned` tool with reason explaining why the feature is unsupported
- Do NOT create workaround entities (like workitems) to satisfy these requests

**CRITICAL**: Distinguish between legitimate data modification requests and requests for unsupported features. Only enforce the "must plan action" requirement for the former.
"""  # noqa: E501

    if project_id:
        method_prompt += f"\n\n**🔥 PROJECT CONTEXT (CRITICAL):**\nProject ID: {project_id}\n\n**IMPORTANT SCOPING RULES:**\n- This is a PROJECT-LEVEL chat - ALL operations are scoped to THIS PROJECT ONLY\n- When the request mentions 'current cycle', 'current module', 'work items', etc. - it means ONLY within THIS PROJECT\n- Use this project_id for ALL tools that accept project_id parameter\n- DO NOT query across all projects - scope everything to THIS specific project\n- User refers to 'this project'/'the project'/'current project' = use this project_id"  # noqa: E501
    else:
        # Workspace-level context (no specific project)
        method_prompt += f"\n\n**🌐 WORKSPACE CONTEXT (CRITICAL):**\nWorkspace ID: {workspace_id}\n\n**IMPORTANT SCOPING RULES:**\n- This is a WORKSPACE-LEVEL chat - queries can span MULTIPLE PROJECTS\n- When the request mentions 'last cycle', 'this cycle', 'work items', etc. WITHOUT specifying a project - it could be in ANY project\n- Use list_member_projects (without limit or with high limit) to get ALL projects in the workspace\n- Then iterate through projects to find relevant cycles/modules/work-items\n- CRITICAL: Do NOT limit to 1 project unless the user specifically names or refers to a specific project"  # noqa: E501

    if user_id:
        method_prompt += f"\n\n**USER CONTEXT:**\nUser ID: {user_id}\nUse this when user refers to him/herself or 'I' or 'me' or 'my' or 'mine' or any other personal pronoun or any derivative of these words."  # noqa: E501

    if enhanced_conversation_history and enhanced_conversation_history.strip():
        method_prompt += f"\n\n**CONVERSATION HISTORY & ACTION CONTEXT:**\n{enhanced_conversation_history}\n\nBased on this conversation history, you can reference previously created entities, their IDs, and project context without needing to search for them again."  # noqa: E501

    # Inject clarification context if present (from previous turn's ask_for_clarification)
    if clarification_context and isinstance(clarification_context, dict):
        try:
            original_query_text = clarification_context.get("original_query")
            reason = clarification_context.get("reason")
            answer_text = clarification_context.get("answer_text")
            missing_fields = clarification_context.get("missing_fields") or []
            category_hints = clarification_context.get("category_hints") or []
            disambig = clarification_context.get("disambiguation_options") or []

            method_prompt += "\n\n**USER CLARIFICATION (previous turn):**\n"
            # CRITICAL: Include the original query to maintain full context
            if original_query_text:
                method_prompt += f"Original user request: {original_query_text}\n"
            if reason:
                method_prompt += f"Clarification reason: {reason}\n"
            if missing_fields:
                method_prompt += f"Missing fields resolved: {", ".join([str(x) for x in missing_fields])}\n"
            if category_hints:
                method_prompt += f"Category hints: {", ".join([str(x) for x in category_hints])}\n"
            if disambig:
                method_prompt += "The user was shown these options:\n"
                for idx, opt in enumerate(disambig, 1):
                    if isinstance(opt, dict):
                        opt_id = opt.get("id")
                        opt_name = opt.get("name") or opt.get("display_name") or ""
                        opt_identifier = opt.get("identifier") or ""
                        opt_email = opt.get("email") or ""

                        # Format based on what fields are available
                        if opt_email:
                            # User entity
                            method_prompt += f"  {idx}. {opt_name} ({opt_email}) → UUID: {opt_id}\n"
                        elif opt_identifier:
                            # Project/workitem entity
                            method_prompt += f"  {idx}. {opt_name} (Identifier: {opt_identifier}) → UUID: {opt_id}\n"
                        else:
                            # Generic entity
                            method_prompt += f"  {idx}. {opt_name} → UUID: {opt_id}\n"
            if answer_text:
                method_prompt += f"\nUser's clarification answer: {answer_text}\n"
            method_prompt += "\nIMPORTANT: The current user message is a clarification response to the original request above. Use the clarification answer to resolve missing information and continue with the ORIGINAL request, not as a new standalone request.\n"  # noqa E501
        except Exception:
            pass

    return method_prompt


def classify_tool(tool_name: str) -> Tuple[bool, bool]:
    """Return (is_retrieval_tool, is_action_tool) based on name heuristics."""
    # Include both prefix and substring patterns for robustness
    read_only_patterns = [
        "list_",  # prefix form like list_member_projects
        "get_",  # prefix form
        "retrieve_",  # prefix form
        "_list",
        "_retrieve",
        "_get",
        "_search",
        "search_",
    ]
    modifying_patterns = ["_create", "_update", "_delete", "_add", "_remove", "_archive", "_unarchive"]

    is_read_only = any(p in tool_name for p in read_only_patterns)
    has_modifying_pattern = any(p in tool_name for p in modifying_patterns)
    if has_modifying_pattern and is_read_only:
        is_read_only = False  # prioritize modifying for safety

    retrieval = is_retrieval_tool(tool_name) or is_read_only
    return retrieval, not retrieval


def format_tool_query_for_display(tool_name: str, tool_args: dict, user_query: Optional[str] = None) -> str:
    """Format tool arguments for display in streaming messages."""
    if not tool_args:
        return user_query or "the request"

    # For entity search tools, show the textual input used for search
    if tool_name.startswith("search_") and tool_name.endswith("_by_name"):
        entity_name = tool_args.get("name") or tool_args.get("display_name") or ""
        if entity_name:
            return f'"{str(entity_name)}"'

    # Special-case: user search using display_name
    if tool_name == "search_user_by_name":
        display_name = tool_args.get("display_name")
        if display_name:
            return f'"{str(display_name)}"'

    # For identifier-based searches, show the identifier
    if tool_name == "search_workitem_by_identifier":
        identifier = tool_args.get("identifier", "")
        if identifier:
            return f'"{identifier}"'

    if tool_name == "search_project_by_identifier":
        identifier = tool_args.get("identifier", "")
        if identifier:
            return f'"{identifier}"'
    if tool_name == "search_workitem_smart":
        q = tool_args.get("query", "")
        if q:
            return f'"{q}"'

    # For list tools, show what's being listed
    if tool_name.endswith("_list"):
        if "project_id" in tool_args:
            return "for project"
        elif "module_id" in tool_args:
            return "for module"
        elif "cycle_id" in tool_args:
            return "for cycle"
        else:
            return "all items"

    # For other tools, show the query parameter if available
    if "query" in tool_args:
        query = str(tool_args["query"])
        if query and query != "the request":
            return f'"{query}"'

    # Fallback to showing key parameters
    key_params = []
    for key, value in tool_args.items():
        if key in ["name", "display_name", "title", "description", "identifier", "search"] and value:
            key_params.append(f'{key}="{value}"')

    if key_params:
        return ", ".join(key_params)

    # Final fallback: use the actual user query
    return user_query or "the request"


def clean_tool_args_for_storage(tool_args: Dict[str, Any]) -> Dict[str, Union[str, List[str], Any]]:
    """
    Clean tool arguments before storing in database.
    Replace non-UUID values with specific placeholders that need to be resolved during execution.
    """
    cleaned_args: Dict[str, Union[str, List[str], Any]] = {}
    uuid_pattern = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$", re.IGNORECASE)

    # SPECIAL HANDLING: If tool_args contains a "project" dict with an "id" field that's a UUID,
    # extract it and set project_id directly to avoid later resolution
    project_id_extracted_from_dict = False
    if "project" in tool_args and isinstance(tool_args["project"], dict):
        project_block = tool_args["project"]
        project_id_candidate = project_block.get("id")
        if isinstance(project_id_candidate, str) and uuid_pattern.match(project_id_candidate):
            # Use the UUID from the project block directly
            cleaned_args["project_id"] = project_id_candidate
            project_id_extracted_from_dict = True

    for key, value in tool_args.items():
        if key.endswith("_id"):
            # Skip if we already extracted project_id from project block
            if key == "project_id" and project_id_extracted_from_dict:
                continue
            # For ID fields, only keep if they look like UUIDs
            if isinstance(value, str) and uuid_pattern.match(value):
                cleaned_args[key] = value
            else:
                # Store specific placeholder for non-UUID IDs
                entity_type = key.replace("_id", "")
                cleaned_args[key] = f"<id of {entity_type}: {value}>"
        elif key == "project":
            # Keep the project dict for action summary generation (display purposes)
            # We already extracted project_id above if it was a UUID
            cleaned_args[key] = value
        elif key == "issues" and isinstance(value, list):
            # For issues list, only convert non-UUID items to placeholders
            cleaned_issues = []
            for item in value:
                if isinstance(item, str) and uuid_pattern.match(item):
                    cleaned_issues.append(item)  # Keep UUIDs as-is
                else:
                    cleaned_issues.append(f"<id of workitem: {item}>")  # Convert names to placeholders
            cleaned_args[key] = cleaned_issues
        elif key == "workitems" and isinstance(value, list):
            # For workitems list, only convert non-UUID items to placeholders
            cleaned_workitems = []
            for item in value:
                if isinstance(item, str) and uuid_pattern.match(item):
                    cleaned_workitems.append(item)  # Keep UUIDs as-is
                else:
                    cleaned_workitems.append(f"<id of workitem: {item}>")  # Convert names to placeholders
            cleaned_args[key] = cleaned_workitems
        elif key == "workspace_slug":
            # Skip workspace_slug - it should be auto-filled from context during execution
            continue
        else:
            # For other fields, keep as is
            cleaned_args[key] = value

    return cleaned_args


def extract_entity_type_from_tool_name(tool_name: str) -> str:
    """Extract entity type from tool name (e.g., 'workitems_create' -> 'workitem')."""
    if tool_name.startswith("workitems_"):
        return "workitem"
    elif tool_name.startswith("epics_"):
        return "epic"  # Treat epics as their own entity type for user-facing display
    elif tool_name.startswith("projects_"):
        return "project"
    elif tool_name.startswith("cycles_"):
        return "cycle"
    elif tool_name.startswith("modules_"):
        return "module"
    elif tool_name.startswith("comments_"):
        return "comment"
    elif tool_name.startswith("pages_"):
        return "page"
    elif tool_name.startswith("labels_"):
        return "label"
    elif tool_name.startswith("states_"):
        return "state"
    elif tool_name.startswith("users_"):
        return "user"
    else:
        parts = tool_name.split("_")
        if len(parts) > 1:
            entity = parts[0]
            if entity.endswith("s") and entity not in ["issues", "users"]:
                entity = entity[:-1]
            return entity
        return "unknown"


def extract_action_type_from_tool_name(tool_name: str) -> str:
    """Extract action type from tool name (e.g., 'workitems_create' -> 'create')."""
    # Special case: relation operations are updates, not creates
    if "_create_relation" in tool_name:
        return "update"
    elif "_create" in tool_name:
        return "create"
    elif "_update" in tool_name:
        return "update"
    elif "_delete" in tool_name:
        return "delete"
    elif "_list" in tool_name:
        return "list"
    elif "_retrieve" in tool_name or "_get" in tool_name:
        return "retrieve"
    elif "_search" in tool_name:
        return "search"
    elif "_add" in tool_name:
        return "add"
    elif "_remove" in tool_name:
        return "remove"
    else:
        parts = tool_name.split("_")
        if len(parts) > 1:
            return parts[-1]
        return "unknown"


# ------------------------------
# Clarification formatting utils
# ------------------------------


def format_clarification_as_text(clarification_data: Dict[str, Any]) -> str:
    """Format structured clarification data as natural language text for frontend display.

    This helper lives here so any caller (endpoint or executor) can format
    clarification prompts consistently without duplicating logic.
    """
    try:
        reason = clarification_data.get("reason", "")
        questions = clarification_data.get("questions", []) or []
        disambiguation_options = clarification_data.get("disambiguation_options", []) or []
        clarification_data.get("missing_fields", []) or []

        text_parts: List[str] = []
        if reason:
            text_parts.append(f"❓ **{reason}**\n")

        for question in questions:
            text_parts.append(f"{str(question)}\n")

        if disambiguation_options:
            text_parts.append("\n**Please choose one:**\n")
            for i, option in enumerate(disambiguation_options, 1):
                if isinstance(option, dict):
                    display_name = option.get("display_name") or option.get("name") or option.get("title")
                    email = option.get("email")
                    identifier = option.get("identifier")
                    url = option.get("url")

                    if display_name and email:
                        # Likely a user - link only the name, show email separately
                        if url:
                            text_parts.append(f"{i}. [**{display_name}**]({url}) ({email})\n")
                        else:
                            text_parts.append(f"{i}. **{display_name}** ({email})\n")
                    elif display_name and "(" in display_name and ")" in display_name:
                        # Handle case where LLM combines name and email in single field like "John Doe (john@example.com)"
                        name_part = display_name.split("(")[0].strip()
                        if url:
                            text_parts.append(f"{i}. [**{name_part}**]({url}) ({display_name.split("(")[1]}\n")
                        else:
                            text_parts.append(f"{i}. **{display_name}**\n")
                    elif display_name and identifier:
                        # Likely a workitem
                        if url:
                            text_parts.append(f"{i}. [**{display_name}**]({url}) (ID: {identifier})\n")
                        else:
                            text_parts.append(f"{i}. **{display_name}** (ID: {identifier})\n")
                    elif display_name:
                        if url:
                            text_parts.append(f"{i}. [**{display_name}**]({url})\n")
                        else:
                            text_parts.append(f"{i}. **{display_name}**\n")
                    else:
                        text_parts.append(f"{i}. {str(option)}\n")
                else:
                    text_parts.append(f"{i}. {str(option)}\n")

        # if missing_fields:
        #     text_parts.append(f"\n*Missing information: {", ".join([str(m) for m in missing_fields])}*\n")

        text_parts.append("\n*Please provide your answer in your next message.*")

        return "".join(text_parts)
    except Exception:
        return "❓ I need clarification about your request. Please provide more details."


# ------------------------------
# Required fields preflight
# ------------------------------

# Central registry of required fields per action tool
REQUIRED_FIELDS_BY_TOOL: Dict[str, List[str]] = {
    # Workitems
    "workitems_create": ["project_id", "name"],
    "workitems_update": ["issue_id", "project_id"],
    # Modules
    "modules_create": ["name", "project_id"],
    "modules_add_work_items": ["module_id", "issues", "project_id"],
    "modules_remove_work_item": ["module_id", "issue_id", "project_id"],
    # Cycles
    "cycles_create": ["name", "project_id"],
    # Labels/States (project scoped)
    "labels_create": ["name", "project_id"],
    "states_create": ["name", "color", "project_id"],
    # Pages - project_id is conditionally required based on chat context
    # Will be handled specially in the clarification logic
    "pages_create_project_page": ["project_id", "name"],
    # Workspace pages don't require project_id
    "pages_create_workspace_page": ["name"],
    # Consolidated pages tool (workspace context): force scope selection via clarification
    "pages_create_page": ["project_id", "name"],
}


def resolve_from_context(required_key: str, tool_args: Dict[str, Any], action_context: Optional[Dict[str, Any]]) -> Optional[Any]:
    """Try to resolve a missing required field from the provided action_context.

    Currently supports mapping `project_id` from context.
    """
    try:
        if required_key == "project_id" and isinstance(action_context, dict):
            ctx_val = action_context.get("project_id")
            if ctx_val:
                return ctx_val
    except Exception:
        pass
    return None


def preflight_missing_required_fields(tool_name: str, tool_args: Dict[str, Any], action_context: Optional[Dict[str, Any]] = None) -> List[str]:
    """Return a list of required fields still missing after considering context.

    - Uses REQUIRED_FIELDS_BY_TOOL to determine required params
    - Treats values as present if in tool_args and truthy
    - Allows auto-resolving certain keys from action_context
    """
    missing: List[str] = []
    required = REQUIRED_FIELDS_BY_TOOL.get(tool_name, [])
    if not required:
        return missing

    args = tool_args or {}
    # UUID format for strict validation of *_id fields
    uuid_pattern = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$", re.IGNORECASE)
    for key in required:
        val = args.get(key)
        # Treat 'NEEDS_CLARIFICATION' as missing - it's a sentinel value from LLM
        # Also treat placeholders (e.g., "<id of project: X>") and non-UUID *_id values as missing
        is_missing = False

        if not val or val == "NEEDS_CLARIFICATION":
            is_missing = True
        elif key.endswith("_id"):
            # Special sentinel allowed for pages scope
            if isinstance(val, str) and key == "project_id" and val == "__workspace_scope__":
                is_missing = False
            elif isinstance(val, str):
                # Missing if placeholder or non-UUID
                if "<id of" in val or not uuid_pattern.match(val):
                    is_missing = True
            elif isinstance(val, dict):
                # If dict provided, require a valid UUID in 'id' key
                vid = val.get("id") if isinstance(val, dict) else None
                if not (isinstance(vid, str) and uuid_pattern.match(vid)):
                    is_missing = True
        # Non *_id fields: treat as present if truthy

        if not is_missing:
            continue
        # Try resolving from context
        ctx_val = resolve_from_context(key, args, action_context)
        if ctx_val:
            continue
        missing.append(key)

    return missing


async def handle_missing_required_fields(
    tool_name: str,
    tool_args: Dict[str, Any],
    action_context: Optional[Dict[str, Any]],
    missing_required: List[str],
    method_executor: Any,
    workspace_slug: str,
    chat_id: str,
    tool_id: str,
    current_step: int,
    combined_agent_query: str,
    is_project_chat: Optional[bool] = None,
) -> Optional[Dict[str, Any]]:
    """Handle missing required fields by creating clarification payload with disambiguation options.

    Returns a dict with:
        - clarification_payload: The clarification data to send to frontend
        - tool_message: ToolMessage to append to conversation
        - flow_step: Flow step dict to track the clarification
        - clarification_requested: Boolean flag indicating clarification was triggered

    Returns None if clarification creation fails.
    """
    import json

    from langchain_core.messages import ToolMessage

    from pi.app.models.enums import ExecutionStatus
    from pi.app.models.enums import FlowStepType
    from pi.services.chat.utils import standardize_flow_step_content

    try:
        # Seed category hints so downstream clarification can auto-populate options correctly
        category_hints: List[str] = []
        if tool_name.startswith("workitems_"):
            category_hints = ["workitems"]
        elif tool_name.startswith("pages_"):
            # CRITICAL: mark pages so clarification can fetch filtered project list
            category_hints = ["pages"]

        clarification_payload: Dict[str, Any] = {
            "reason": "Missing required field(s) for action",
            "questions": ["Which project should I use?" if "project_id" in missing_required else "Provide missing information"],
            "missing_fields": missing_required,
            "category_hints": category_hints,
        }

        # Build disambiguation options where possible for the primary missing field
        disambig_options: List[Dict[str, Any]] = []
        try:
            # Choose a primary field to clarify first
            # Special case: if module/cycle/etc need project context, prioritize project_id first
            priority = [
                "project_id",
                "module_id",
                "cycle_id",
                "label_id",
                "state_id",
                "assignee",
                "assignee_id",
                "user_id",
            ]

            # If both project_id and a project-scoped entity are missing, prioritize project_id
            project_scoped_entities = ["module_id", "cycle_id", "label_id", "state_id"]
            has_project_scoped = any(f in missing_required for f in project_scoped_entities)
            if "project_id" not in missing_required and has_project_scoped:
                # Project context exists, continue with normal priority
                primary = next((f for f in priority if f in missing_required), missing_required[0])
            elif "project_id" in missing_required and has_project_scoped:
                # Both project and project-scoped entity missing - ask for project first
                primary = "project_id"
            else:
                # Normal case
                primary = next((f for f in priority if f in missing_required), missing_required[0])

            if primary == "project_id":
                # Special handling for pages: add workspace-level option if not in project chat
                is_page_tool = tool_name in ("pages_create_project_page", "pages_create_workspace_page", "pages_create_page")

                # Debug logging
                from pi import logger

                log = logger.getChild(__name__)
                log.info(f"ChatID: {chat_id} - Clarification for tool={tool_name}, is_page_tool={is_page_tool}, is_project_chat={is_project_chat}")

                # If we're in workspace context (not project chat) and this is a page tool,
                # add "Workspace level" as the first option
                # Explicitly check for False or None (workspace context)
                if is_page_tool and is_project_chat is not True:
                    log.info(f"ChatID: {chat_id} - Adding workspace-level option for page creation")
                    disambig_options.append({
                        "id": "__workspace_scope__",
                        "name": "Workspace level",
                        "type": "scope",
                        "description": "Create page at workspace level (accessible across all projects)",
                    })

                # Prefer DB-backed, filtered project list to avoid archived/deleted noise
                try:
                    ws_id = (action_context or {}).get("workspace_id") if isinstance(action_context, dict) else None
                    if ws_id:
                        from pi.core.db.plane import PlaneDBPool as _DB

                        query = """
                            SELECT p.id, p.name, p.identifier
                            FROM projects p
                            WHERE p.workspace_id = $1
                              AND p.deleted_at IS NULL
                              AND p.archived_at IS NULL
                            ORDER BY p.name
                            LIMIT 50
                            """
                        rows = await _DB.fetch(query, (ws_id,))
                        for r in rows or []:
                            option = {"id": str(r["id"]), "name": r["name"], "type": "project"}
                            if r.get("identifier"):
                                option["identifier"] = r["identifier"]
                            disambig_options.append(option)
                    else:
                        # Fallback to API list with defensive filtering
                        proj_res = await method_executor.execute(
                            "projects",
                            "list",
                            workspace_slug=workspace_slug,
                            per_page=50,
                        )
                        if isinstance(proj_res, dict) and proj_res.get("success"):
                            data_block = proj_res.get("data")
                            candidates = []
                            if isinstance(data_block, list):
                                candidates = data_block
                            elif isinstance(data_block, dict):
                                for key in ("results", "items", "projects", "data"):
                                    val = data_block.get(key)
                                    if isinstance(val, list):
                                        candidates = val
                                        break
                            for it in candidates:
                                try:
                                    pid = it.get("id") if isinstance(it, dict) else None
                                    name = it.get("name") if isinstance(it, dict) else None
                                    identifier = it.get("identifier") if isinstance(it, dict) else None
                                    is_archived = it.get("archived_at") is not None
                                    is_deleted = it.get("deleted_at") is not None

                                    if pid and name and not is_archived and not is_deleted:
                                        option = {"id": str(pid), "name": str(name), "type": "project"}
                                        if identifier:
                                            option["identifier"] = str(identifier)
                                        disambig_options.append(option)
                                except Exception:
                                    continue
                except Exception:
                    # As a last resort, leave options empty
                    pass

                # Adjust question for pages vs other entities
                if is_page_tool and is_project_chat is not True:
                    clarification_payload["questions"] = ["Where would you like to create this page?"]
                else:
                    clarification_payload["questions"] = ["Which project should I use?"]

            elif primary == "module_id":
                # Need project context to scope modules
                proj = tool_args.get("project_id") or (action_context.get("project_id") if action_context else None)
                if proj:
                    mod_res = await method_executor.execute("modules", "list", project_id=proj, workspace_slug=workspace_slug)
                    if isinstance(mod_res, dict) and mod_res.get("success"):
                        data_block = mod_res.get("data")
                        candidates = []
                        if isinstance(data_block, list):
                            candidates = data_block
                        elif isinstance(data_block, dict):
                            for key in ("results", "items", "modules", "data"):
                                val = data_block.get(key)
                                if isinstance(val, list):
                                    candidates = val
                                    break
                        for it in candidates:
                            try:
                                mid = it.get("id") if isinstance(it, dict) else None
                                name = it.get("name") if isinstance(it, dict) else None
                                if mid and name:
                                    disambig_options.append({"id": str(mid), "name": str(name)})
                            except Exception:
                                continue
                clarification_payload["questions"] = ["Which module should I use?"]

            elif primary == "cycle_id":
                proj = tool_args.get("project_id") or (action_context.get("project_id") if action_context else None)
                if proj:
                    cyc_res = await method_executor.execute("cycles", "list", project_id=proj, workspace_slug=workspace_slug, per_page=50)
                    if isinstance(cyc_res, dict) and cyc_res.get("success"):
                        data_block = cyc_res.get("data")
                        candidates = []
                        if isinstance(data_block, list):
                            candidates = data_block
                        elif isinstance(data_block, dict):
                            for key in ("results", "items", "cycles", "data"):
                                val = data_block.get(key)
                                if isinstance(val, list):
                                    candidates = val
                                    break
                        for it in candidates:
                            try:
                                cid = it.get("id") if isinstance(it, dict) else None
                                name = it.get("name") if isinstance(it, dict) else None
                                if cid and name:
                                    disambig_options.append({"id": str(cid), "name": str(name), "type": "cycle", "project_id": str(proj)})
                            except Exception:
                                continue
                clarification_payload["questions"] = ["Which cycle should I use?"]

            elif primary == "label_id":
                proj = tool_args.get("project_id") or (action_context.get("project_id") if action_context else None)
                if proj:
                    lab_res = await method_executor.execute("labels", "list", project_id=proj, workspace_slug=workspace_slug)
                    if isinstance(lab_res, dict) and lab_res.get("success"):
                        data_block = lab_res.get("data")
                        candidates = []
                        if isinstance(data_block, list):
                            candidates = data_block
                        elif isinstance(data_block, dict):
                            for key in ("results", "items", "labels", "data"):
                                val = data_block.get(key)
                                if isinstance(val, list):
                                    candidates = val
                                    break
                        for it in candidates:
                            try:
                                lid = it.get("id") if isinstance(it, dict) else None
                                name = it.get("name") if isinstance(it, dict) else None
                                color = it.get("color") if isinstance(it, dict) else None
                                if lid and name:
                                    opt = {"id": str(lid), "name": str(name)}
                                    if color:
                                        opt["color"] = str(color)
                                    disambig_options.append(opt)
                            except Exception:
                                continue
                clarification_payload["questions"] = ["Which label should I use?"]

            elif primary == "state_id":
                proj = tool_args.get("project_id") or (action_context.get("project_id") if action_context else None)
                if proj:
                    st_res = await method_executor.execute("states", "list", project_id=proj, workspace_slug=workspace_slug)
                    if isinstance(st_res, dict) and st_res.get("success"):
                        data_block = st_res.get("data")
                        candidates = []
                        if isinstance(data_block, list):
                            candidates = data_block
                        elif isinstance(data_block, dict):
                            for key in ("results", "items", "states", "data"):
                                val = data_block.get(key)
                                if isinstance(val, list):
                                    candidates = val
                                    break
                        for it in candidates:
                            try:
                                sid = it.get("id") if isinstance(it, dict) else None
                                name = it.get("name") if isinstance(it, dict) else None
                                group = it.get("group") if isinstance(it, dict) else None
                                if sid and name:
                                    opt = {"id": str(sid), "name": str(name)}
                                    if group:
                                        opt["group"] = str(group)
                                    disambig_options.append(opt)
                            except Exception:
                                continue
                clarification_payload["questions"] = ["Which state should I use?"]

            elif primary in ("assignee", "assignee_id", "user_id"):
                # Prefer project members if project context present
                proj = tool_args.get("project_id") or (action_context.get("project_id") if action_context else None)
                if proj:
                    mem_res = await method_executor.execute("members", "get_project_members", project_id=proj, workspace_slug=workspace_slug)
                else:
                    mem_res = await method_executor.execute("members", "get_workspace_members", workspace_slug=workspace_slug)
                if isinstance(mem_res, dict) and mem_res.get("success"):
                    data_block = mem_res.get("data")
                    candidates = []
                    if isinstance(data_block, list):
                        candidates = data_block
                    elif isinstance(data_block, dict):
                        for key in ("results", "items", "members", "data"):
                            val = data_block.get(key)
                            if isinstance(val, list):
                                candidates = val
                                break
                    for it in candidates:
                        try:
                            uid = (it.get("id") if isinstance(it, dict) else None) or it.get("member_id") if isinstance(it, dict) else None
                            display_name = (
                                (it.get("display_name") if isinstance(it, dict) else None) or it.get("name") if isinstance(it, dict) else None
                            )
                            email = it.get("email") if isinstance(it, dict) else None
                            if uid and (display_name or email):
                                opt = {"id": str(uid)}
                                if display_name:
                                    opt["display_name"] = str(display_name)
                                if email:
                                    opt["email"] = str(email)
                                disambig_options.append(opt)
                        except Exception:
                            continue
                clarification_payload["questions"] = ["Which user should I use?"]
        except Exception:
            # Best-effort only; lack of options shouldn't block clarification
            pass

        # Enrich options with entity URLs (projects/users/cycles/modules) for better UX in clarification
        try:
            if disambig_options:
                from pi.config import settings as _settings

                base_url = _settings.plane_api.FRONTEND_URL
                if base_url and isinstance(workspace_slug, str) and workspace_slug:
                    enriched: List[Dict[str, Any]] = []
                    for _opt in disambig_options:
                        if isinstance(_opt, dict):
                            _opt2 = dict(_opt)
                            _typ = _opt2.get("type")
                            _idv = _opt2.get("id")
                            _proj_id = _opt2.get("project_id")
                            try:
                                if _typ == "project" and _idv:
                                    _opt2["url"] = f"{base_url}/{workspace_slug}/projects/{_idv}/overview/"
                                elif _typ == "cycle" and _idv and _proj_id:
                                    _opt2["url"] = f"{base_url}/{workspace_slug}/projects/{_proj_id}/cycles/{_idv}/"
                                elif _typ == "module" and _idv and _proj_id:
                                    _opt2["url"] = f"{base_url}/{workspace_slug}/projects/{_proj_id}/modules/{_idv}/"
                                elif _typ == "user" and _idv:
                                    _opt2["url"] = f"{base_url}/{workspace_slug}/profile/{_idv}/"
                            except Exception:
                                pass
                            enriched.append(_opt2)
                    disambig_options = enriched
        except Exception:
            pass

        if disambig_options:
            clarification_payload["disambiguation_options"] = disambig_options

        # Create a tool message responding to the tool_call to satisfy LLM protocol
        tool_message = None
        with contextlib.suppress(Exception):
            tool_message = ToolMessage(content=json.dumps(clarification_payload), tool_call_id=tool_id)

        # Log clarification payload synthesized during preflight
        with contextlib.suppress(Exception):
            log.info(
                f"{"*" * 100}\nChatID: {chat_id} - ASK_FOR_CLARIFICATION payload (preflight): {json.dumps(clarification_payload, default=str)}\n{"*" * 100}"  # noqa: E501
            )

        # Track flow step for clarification
        flow_step = {
            "step_order": current_step,
            "step_type": FlowStepType.TOOL,
            "tool_name": "ask_for_clarification",
            "content": standardize_flow_step_content(clarification_payload, FlowStepType.TOOL),
            "execution_data": {
                "args": tool_args,
                "clarification_pending": True,
                "clarification_payload": clarification_payload,
                # CRITICAL: Store the original query so we can reconstruct full context on clarification follow-up
                "original_query": combined_agent_query,
            },
            "is_planned": False,
            "is_executed": False,
            "execution_success": ExecutionStatus.PENDING,
        }

        return {
            "clarification_payload": clarification_payload,
            "tool_message": tool_message,
            "flow_step": flow_step,
            "clarification_requested": True,
        }

    except Exception:
        return None
