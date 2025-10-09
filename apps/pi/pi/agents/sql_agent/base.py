import json
from importlib.resources import read_text
from typing import Any
from typing import Dict
from typing import List
from typing import Union
from typing import cast
from uuid import UUID

from langchain.schema import AIMessage
from langchain.schema import HumanMessage
from langchain.schema import SystemMessage
from pydantic import BaseModel
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from sqlglot import exp
from sqlglot import parse_one
from sqlmodel.ext.asyncio.session import AsyncSession

from pi import logger
from pi.app.models.enums import MessageMetaStepType
from pi.services.llm.error_handling import llm_error_handler
from pi.services.llm.llms import get_sql_agent_llm
from pi.services.schemas.chat import QueryFlowStore

from .prompts import TABLE_SELECTION
from .prompts import get_sql_generator
from .schemas import TableSelectionResponse
from .tools import _fix_group_by_order_by_mismatch_parsed
from .tools import _get_available_tables
from .tools import execute_sql_query
from .tools import fix_group_by_order_by_mismatch
from .tools import format_column_context
from .tools import generate_cte_query
from .tools import get_column_details
from .tools import get_table_schemas

log = logger.getChild(__name__)
console = Console()


def _create_message_with_attachments(content: str, attachment_blocks: list[dict[str, Any]] | None = None) -> HumanMessage:
    """Create a HumanMessage with optional attachment blocks."""
    if attachment_blocks:
        from pi.services.chat.utils import format_message_with_attachments

        # format_message_with_attachments returns List[Dict[str, Any]]
        # The content blocks are compatible with HumanMessage at runtime
        formatted_blocks = format_message_with_attachments(content, attachment_blocks)
        return HumanMessage(content=formatted_blocks)  # type: ignore[arg-type]
    else:
        return HumanMessage(content=content)


def log_panel_info(title: str, content: str, style: str = "bold green"):
    panel = Panel(content, title=title, style=style)
    console.print(panel, end="")


def log_table_info(title: str, column_title: str, rows: list[str], column_style: str = "cyan"):
    table = Table(title=title)
    table.add_column(column_title, justify="left", style=column_style, no_wrap=True)
    for row in rows:
        table.add_row(row)
    console.print(table, end="")


def log_relevant_tables_info(chat_id: str, relevant_tables: list[str], iteration: int):
    content = f"{", ".join(relevant_tables)}"
    log_panel_info(f"Relevant Tables {iteration} - ChatID: {chat_id}", content)


def log_final_relevant_tables_info(chat_id: str, relevant_tables: list[str]):
    log_table_info(f"Relevant Tables for ChatID: {chat_id}", "Table Name", relevant_tables)


def log_generated_sql_info(chat_id: str, sql_query: str):
    log_table_info(f"Generated SQL Query for ChatID: {chat_id}", "SQL Query", [sql_query], column_style="green")


# Define Message type
Message = Union[SystemMessage, HumanMessage, AIMessage]

# LLM Configuration
# Note: Create base models, but avoid setting tracking context on shared singletons.
# Derive per-call instances below to prevent context collisions.
table_selection_model = get_sql_agent_llm("table_selection")
sql_generation_model = get_sql_agent_llm("sql_generation")

# Note: structured_table_selection_model is now created dynamically in _perform_table_selection_llm_call
# to ensure proper token tracking context

# Table Mapping and Groupings
hallucinated_table_mapping: dict[str, dict[str, Any]] = json.loads(read_text("pi.agents.sql_agent.store", "hallucinated-table-mapping.json"))
related_table_groupings: dict[str, list[str]] = json.loads(read_text("pi.agents.sql_agent.store", "related-table-groupings.json"))


# Helper function for table selection LLM call with error handling
@llm_error_handler(fallback_message="TABLE_SELECTION_FAILURE", max_retries=2, temp_increment=0.1, log_context="[SQL_TABLE_SELECTION]")
async def _perform_table_selection_llm_call(
    langchain_messages: List[Message], message_id: UUID, db: AsyncSession, llm_model: str | None = None
) -> Any:
    """Perform the actual LLM call for table selection with error handling."""
    # Create structured model dynamically and set tracking context
    # Use the provided model or fall back to the global one
    if llm_model:
        table_selection_model_instance = get_sql_agent_llm("table_selection", llm_model)
    else:
        table_selection_model_instance = table_selection_model

    structured_table_selection_model = table_selection_model_instance.with_structured_output(TableSelectionResponse, include_raw=True)  # type: ignore[arg-type]
    structured_table_selection_model.set_tracking_context(message_id, db, MessageMetaStepType.SQL_TABLE_SELECTION)  # type: ignore[attr-defined]
    return await structured_table_selection_model.ainvoke(langchain_messages)


# Function to select relevant tables for SQL query generation
async def select_relevant_tables(
    messages: List[Message], focus_id: str, db: AsyncSession, message_id: UUID, llm_model: str | None = None
) -> List[Dict[str, Any]]:
    """Select tables relevant to the user query, ensuring focus_id column is included.

    Args:
        messages: List of user messages containing the query
        focus_id: Column ID to ensure is present (project_id or workspace_id)
        db: Database session for token tracking
        message_id: Message ID for tracking

    Returns:
        List containing the structured response with relevant tables
    """
    updated_table_selection = (
        TABLE_SELECTION
        + f"- Ensure that the {focus_id} column is present in the selected tables. If it's not, examine relationships and add related tables as necessary.\n\n"  # noqa: E501
        + "Please proceed with your analysis and table selection."
    )

    # Prepare messages for the LLM
    langchain_messages: List[Message] = [SystemMessage(content=updated_table_selection)]
    for msg in messages:
        if isinstance(msg, HumanMessage):
            langchain_messages.append(msg)

    # Use error handler for table selection LLM call
    response = await _perform_table_selection_llm_call(langchain_messages, message_id, db, llm_model)

    # Handle failure case
    if response == "TABLE_SELECTION_FAILURE":
        log.error("Table selection failed after all retries")
        return [{"relevant_tables": []}]

    # Get the parsed structured response for the actual data
    parsed_response = response.get("parsed") if isinstance(response, dict) else response
    response_dict: Dict[str, Any]

    if isinstance(parsed_response, BaseModel):
        # Convert Pydantic model to a plain dictionary.
        response_dict = parsed_response.model_dump()
    elif isinstance(parsed_response, dict):
        # Already a dictionary – cast for clarity.
        response_dict = cast(Dict[str, Any], parsed_response)
    else:
        # Fallback to an empty dictionary for unexpected response types.
        response_dict = {}

    return [response_dict]


# Helper function for SQL generation LLM call with error handling
@llm_error_handler(fallback_message="SQL_GENERATION_FAILURE", max_retries=2, temp_increment=0.1, log_context="[SQL_GENERATION]")
async def _perform_sql_generation_llm_call(
    langchain_messages: List[Message], message_id: UUID, db: AsyncSession, llm_model: str | None = None
) -> Any:
    """Perform the actual LLM call for SQL generation with error handling."""
    # Derive a fresh per-call instance to avoid shared-instance tracking context overlap
    if llm_model:
        per_call_sql_model = get_sql_agent_llm("sql_generation", llm_model)
    else:
        per_call_sql_model = sql_generation_model
    per_call_sql_model.set_tracking_context(message_id, db, MessageMetaStepType.SQL_GENERATION)  # type: ignore[attr-defined]
    return await per_call_sql_model.ainvoke(langchain_messages)


# Function to generate SQL query using LangChain
async def sql_generation(
    messages: List[Message], modified_sql_generator: str, db: AsyncSession, message_id: UUID, llm_model: str | None = None
) -> str:
    """Generate SQL query based on user request and database schema.

    Args:
        messages: List of messages containing the user query
        modified_sql_generator: Customized SQL generation prompt with schema details
        db: Database session for token tracking
        message_id: Message ID for tracking

    Returns:
        Generated SQL query as string
    """
    # Prepare messages for the LLM
    langchain_messages: List[Message] = [SystemMessage(content=modified_sql_generator)]
    for msg in messages:
        if isinstance(msg, HumanMessage):
            langchain_messages.append(msg)

    # Use error handler for SQL generation LLM call
    response = await _perform_sql_generation_llm_call(langchain_messages, message_id, db, llm_model)

    # Handle failure case
    if response == "SQL_GENERATION_FAILURE":
        log.error("SQL generation failed after all retries")
        return "SELECT 'Error: Unable to generate SQL query due to processing limitations' as error_message;"

    # Ensure we always return a string - fixed type handling
    if hasattr(response, "content"):
        return str(response.content)
    else:
        # Handle any other case by converting to string
        return str(response)


# SQL generation function
async def text2sql(
    db: AsyncSession,
    query: str,
    user_id: str,
    query_flow_store: QueryFlowStore,
    message_id: UUID,
    project_id: str | None = None,
    workspace_id: str | None = None,
    chat_id: str | None = None,
    vector_search_issue_ids: list[str] | None = None,
    vector_search_page_ids: list[str] | None = None,
    is_multi_agent: bool | None = None,
    user_meta: dict[str, Any] | None = None,
    conv_history: list[str] | None = None,
    preset_tables: list[str] | None = None,
    preset_sql_query: str | None = None,
    preset_placeholders: list[str] | None = None,
    attachment_blocks: list[dict[str, Any]] | None = None,
) -> tuple[Dict[str, Any], Dict[str, Any]]:
    try:
        # Initialize a single dictionary to collect all intermediate results
        intermediate_results: Dict[str, Any] = {
            "steps": [],  # Initialize steps as an empty list to avoid KeyError later
            "extracted_entity_ids": None,
            "entity_urls": None,
        }

        # Create user message for both preset and regular flows
        user_message = _create_message_with_attachments(query, attachment_blocks)

        # Step One: Table Selection
        relevant_tables: List[str]
        if preset_tables:
            # Use preset tables, skip LLM call
            relevant_tables = preset_tables.copy()
            query_flow_store["tool_response"] += f"Text2SSQL: Using Preset Tables: {relevant_tables}\n"
            log.info(f"ChatID: {chat_id} - Using preset tables: {relevant_tables}")
        else:
            # Regular table selection with LLM
            if project_id:
                focus_id = "project_id"
            else:
                focus_id = "workspace_id"
            messages: List[Message] = [user_message]
            selection_res = []
            relevant_tables = []  # await get_relevant_tables_from_cache(query)
            if relevant_tables:
                log.info(f"ChatID: {chat_id} - Relevant tables from cache: {relevant_tables}")
                selection_res.append({"relevant_tables": relevant_tables})
            else:
                selection_res = await select_relevant_tables(
                    messages, focus_id=focus_id, db=db, message_id=message_id, llm_model=query_flow_store.get("llm")
                )

            if isinstance(selection_res, list) and selection_res and isinstance(selection_res[0], dict) and "relevant_tables" in selection_res[0]:
                for idx, res in enumerate(selection_res):
                    iteration_relevant_tables = res["relevant_tables"]  # Access as dictionary key
                    # log_relevant_tables_info(chat_id or "", iteration_relevant_tables, idx)
                    query_flow_store["tool_response"] += f"Text2SSQL: Relevant Tables {idx}: {iteration_relevant_tables}\n"
                    relevant_tables.extend(iteration_relevant_tables)
            else:
                log.error(f"ChatID: {chat_id} - Invalid format returned from table selection")
                return (
                    {},
                    {
                        "sql_query": "Failed to retrieve data from the DB due to an error. Please try again later.",
                        "results": "Failed to retrieve data from the DB due to an error. Please try again later.",
                        "entity_urls": None,
                    },
                )

            relevant_tables = list(set(relevant_tables))

        # Store table selection step in our intermediate results
        intermediate_results["relevant_tables"] = relevant_tables

        if not relevant_tables:
            intermediate_results["relevant_tables"] = []
            log.error(f"ChatID: {chat_id} - No relevant tables found in selection response.")
            return (
                intermediate_results,
                {
                    "sql_query": "Failed to retrieve data from the DB due to an error. Please try again later.",
                    "results": "Failed to retrieve data from the DB due to an error. Please try again later.",
                    "entity_urls": None,
                },
            )

        # Verifying relevant tables for known hallucinations
        for table in relevant_tables:
            if table in hallucinated_table_mapping:
                relevant_tables.remove(table)
                relevant_tables.extend(hallucinated_table_mapping[table])

        # Adding related tables to handle cases where LLM misses out on some tables (especially the project_pages table)
        for table in relevant_tables:
            if table in related_table_groupings:
                relevant_tables.extend(related_table_groupings[table])

        # Add issue_assignees if both users and issues tables are present
        # if "users" in relevant_tables and "issues" in relevant_tables and "issue_assignees" not in relevant_tables:
        #     relevant_tables.append("issue_assignees")

        # Add issues table if issue_assignees is present
        if "issue_assignees" in relevant_tables and "issues" not in relevant_tables:
            relevant_tables.append("issues")

        relevant_tables = list(set(relevant_tables))

        # remove hallucinated tables that are not present in the table-list.json
        all_tables = json.loads(read_text("pi.agents.sql_agent.store", "table-list.json"))
        relevant_tables = [table for table in relevant_tables if table in all_tables]
        # log_final_relevant_tables_info(chat_id or "", relevant_tables)

        query_flow_store["tool_response"] += f"Text2SSQL: Final Table List: {relevant_tables}\n"

        # Store table validation step in our intermediate results
        intermediate_results["post_processed_relevant_tables"] = relevant_tables

        # Step 2: Fetching whole schema for all the relevant tables
        try:
            relevant_tables_schemas = get_table_schemas(relevant_tables)

        except Exception as e:
            intermediate_results["schema_fetch_error"] = e
            log.error(f"Error fetching table schemas for chat ID {chat_id}: {e}")
            return (
                intermediate_results,
                {
                    "sql_query": "Failed to retrieve data from the DB due to an error. Please try again later.",
                    "results": "Failed to retrieve data from the DB due to an error. Please try again later.",
                    "entity_urls": None,
                },
            )

        # Step 3: Adding context for sql generation
        try:
            column_context = get_column_details(relevant_tables)
            formatted_column_context = format_column_context(column_context)
            MODIFIED_SQL_GENERATOR = f"{get_sql_generator()}\n\n"
            if len(column_context) > 0:
                MODIFIED_SQL_GENERATOR += f"Below is the more detailed context of few columns:\n\n{formatted_column_context}\n"

            # Add table descriptions for the relevant tables
            table_descriptions = json.loads(read_text("pi.agents.sql_agent.store", "table-descriptions.json"))
            for table in relevant_tables:
                if table in table_descriptions:
                    desc = table_descriptions[table]
                    MODIFIED_SQL_GENERATOR += f"\n## Table `{table}` Description:\n"
                    MODIFIED_SQL_GENERATOR += f"**About**: {desc["about"]}\n"
                    MODIFIED_SQL_GENERATOR += f"**Contains**: {", ".join(desc["contains"])}\n"
                    MODIFIED_SQL_GENERATOR += f"**Does NOT contain**: {", ".join(desc["does_not_contain"])}\n"
        except Exception as e:
            intermediate_results["column_context_error"] = e
            log.error(f"Error preparing SQL generation prompt for chat ID {chat_id}: {e}")
            return (
                intermediate_results,
                {
                    "sql_query": "Failed to retrieve data from the DB due to an error. Please try again later.",
                    "results": "Failed to retrieve data from the DB due to an error. Please try again later.",
                    "entity_urls": None,
                },
            )

        try:
            column_affirmation = json.loads(read_text("pi.agents.sql_agent.store", "column-name-affirmations.json"))
            for table, affirmations in column_affirmation.items():
                if table in relevant_tables:
                    MODIFIED_SQL_GENERATOR += f"\n## Table `{table}`:\n"
                    for affirmation in affirmations:
                        MODIFIED_SQL_GENERATOR += f"\n{affirmation}\n"
        except Exception as e:
            log.error(f"Error fetching column affirmations for chat ID {chat_id}: {e}")
            intermediate_results["column_affirmation_error"] = e
            return (
                intermediate_results,
                {
                    "sql_query": "Failed to retrieve data from the DB due to an error. Please try again later.",
                    "results": "Failed to retrieve data from the DB due to an error. Please try again later.",
                    "entity_urls": None,
                },
            )

        if is_multi_agent:
            if vector_search_issue_ids:
                MODIFIED_SQL_GENERATOR += "\n\nThe user is looking for work items with the following issue_ids:\n\n"
                for issue_id in vector_search_issue_ids:
                    MODIFIED_SQL_GENERATOR += f"issue_id: {issue_id}\n"
            if vector_search_page_ids:
                MODIFIED_SQL_GENERATOR += "\n\nThe user is looking for pages with the following page_ids:\n\n"
                for page_id in vector_search_page_ids:
                    MODIFIED_SQL_GENERATOR += f"page_id: {page_id}\n"

        # Step 4: SQL Generation
        generated_query: str
        if preset_sql_query:
            # Use preset SQL query, skip LLM call
            generated_query = preset_sql_query.strip()
            query_flow_store["tool_response"] += f"Text2SSQL: Using Preset SQL: {generated_query}\n"
            # log.info(f"ChatID: {chat_id} - Using preset SQL query")

            # Store SQL generation in our intermediate results
            intermediate_results["generated_sql"] = generated_query
        else:
            # Regular SQL generation with LLM
            try:
                query_text = user_message.content

                if project_id:
                    context_str = f"User's current project ID is {project_id}. "
                elif workspace_id:
                    context_str = f"User's current workspace ID is {workspace_id}."

                time_context_str = ""
                if user_meta:
                    time_context = user_meta.get("time_context", "")
                    if time_context:
                        time_context_str = f"User's time context is: {str(time_context)}."

                user_context = f"User's user_id is {user_id}. Consider this user_id only when the query is in first person or the user is referring to himself.\n{context_str}\n{time_context_str}"  # noqa: E501

                # Enhanced SQL generation prompt with conversation context
                enhanced_sql_prompt = MODIFIED_SQL_GENERATOR

                # Prepare the SQL query content
                sql_content = (
                    f"Can you create SQL query for the user query: {query_text}\n\n"
                    f"Given the relevant tables and their schema:\n{relevant_tables_schemas}\n"
                    f"Below is some context about the user:\n\n{user_context}"
                )

                # Include attachments in SQL generation if present
                sql_query_message = _create_message_with_attachments(sql_content, attachment_blocks)

                sql_history: List[Message] = [sql_query_message]

                sql_query = await sql_generation(
                    messages=sql_history,
                    modified_sql_generator=enhanced_sql_prompt,
                    db=db,
                    message_id=message_id,
                    llm_model=query_flow_store.get("llm"),
                )  # noqa: E501
                generated_query = sql_query
                # log_generated_sql_info(chat_id or "", generated_query or "")

                # Store SQL generation in our intermediate results
                intermediate_results["generated_sql"] = generated_query

            except Exception as e:
                log.error(f"Error during SQL generation for chat ID {chat_id}: {e}")
                intermediate_results["sql_generation_error"] = e
                query_flow_store["tool_response"] += f"\nText2SSQL: Error during SQL generation: {e}\n"
                return (
                    intermediate_results,
                    {
                        "sql_query": "Failed to retrieve data from the DB due to an error. Please try again later.",
                        "results": "Failed to retrieve data from the DB due to an error. Please try again later.",
                        "entity_urls": None,
                    },
                )

        if not generated_query:
            log.error(f"No SQL query was generated for chat ID {chat_id}.")
            intermediate_results["generated_sql"] = []
            return (
                intermediate_results,
                {
                    "sql_query": "Failed to retrieve data from the DB due to an error. Please try again later.",
                    "results": "Failed to retrieve data from the DB due to an error. Please try again later.",
                    "entity_urls": None,
                },
            )

        # Generate CTE for tables that are not in the relevant tables but are in the generated query
        try:
            # Parse the generated query to extract table names
            parsed_query = parse_one(generated_query, read="postgres")
            generated_query_tables = set()

            # Extract tables from all SELECT statements in the query
            for select in parsed_query.find_all(exp.Select):
                select_tables = _get_available_tables(select)
                generated_query_tables.update(select_tables)

            # Find extra tables that need to be added to CTE
            extra_cte_tables = []
            for table in generated_query_tables:
                if table not in relevant_tables and table in all_tables:
                    extra_cte_tables.append(table)

            tables_for_cte = relevant_tables + extra_cte_tables

        except Exception as e:
            log.warning(f"ChatID: {chat_id} - Could not parse generated query to extract tables: {e}")
            # Fallback to using only relevant tables
            tables_for_cte = relevant_tables

        # Step 5: SQL Query Modification
        try:
            CTE_head = generate_cte_query(
                member_id=user_id,
                tables=tables_for_cte,
                project_id=project_id,
                workspace_id=workspace_id,
                vector_search_issue_ids=vector_search_issue_ids,
                vector_search_page_ids=vector_search_page_ids,
            )

            # Store CTE generation in our intermediate results
            intermediate_results["cte_head"] = CTE_head

        except Exception as e:
            log.error(f"Error generating CTE query for chat ID {chat_id}: {e}")
            intermediate_results["cte_generation_error"] = e
            return (
                intermediate_results,
                {
                    "sql_query": "Failed to retrieve data from the DB due to an error. Please try again later.",
                    "results": "Failed to retrieve data from the DB due to an error. Please try again later.",
                    "entity_urls": None,
                },
            )

        final_query = f"{CTE_head}\n{generated_query}"
        # log.info("Final SQL Query:")
        # log_generated_sql_info(chat_id or "", final_query or "")

        # Parse final_query once for potential reuse in error handling
        try:
            parsed_final_query = parse_one(final_query, read="postgres")
        except Exception as parse_error:
            log.warning(f"ChatID: {chat_id} - Could not pre-parse final query: {parse_error}")
            parsed_final_query = None

        intermediate_results["final_query"] = final_query

        # Step 6: SQL Execution
        query_execution_result: Any
        try:
            # Handle placeholder substitution for preset queries
            if preset_sql_query and preset_placeholders:
                # Create parameter values list for preset queries
                param_values = []

                # Map placeholders to actual values
                for placeholder in preset_placeholders:
                    if placeholder == "user_id":
                        param_values.append(user_id)
                    # Add more placeholder mappings as needed

                # log.info(f"ChatID: {chat_id} - Executing preset query with parameters: {param_values}")
                query_flow_store["tool_response"] += f"Text2SSQL: Executing with parameters: {param_values}\n"

                # Execute with parameters using the modified execute_sql_query function
                query_execution_result = await execute_sql_query(final_query, tuple(param_values))
            else:
                # Regular execution without parameters
                query_execution_result = await execute_sql_query(final_query)
        except Exception as e:
            intermediate_results["sql_execution_error"] = e
            log.error(f"Error executing SQL query for chat ID {chat_id}: {e} \n Generated SQL query that resulted in the error:\n {final_query}\n")

            # Try to fix GROUP BY/ORDER BY issues and re-execute
            try:
                log.info(f"ChatID: {chat_id} - Attempting to fix GROUP BY/ORDER BY issues due to execution error")

                # Apply GROUP BY fix using pre-parsed query if available
                if parsed_final_query is not None:
                    fixed_query = _fix_group_by_order_by_mismatch_parsed(parsed_final_query, dialect="postgres")
                else:
                    fixed_query = fix_group_by_order_by_mismatch(final_query, dialect="postgres")
                # query_flow_store["tool_response"] += f"Text2SSQL: Query fixed, re-executing...\n"

                # Try executing the fixed query
                if preset_sql_query and preset_placeholders:
                    # Handle preset query with parameters
                    param_values = []
                    for placeholder in preset_placeholders:
                        if placeholder == "user_id":
                            param_values.append(user_id)
                    query_execution_result = await execute_sql_query(fixed_query, tuple(param_values))
                else:
                    # Regular execution
                    query_execution_result = await execute_sql_query(fixed_query)

                # Success! Update intermediate results and continue with normal flow
                intermediate_results["fixed_query"] = fixed_query
                intermediate_results["query_was_fixed"] = True
                intermediate_results["final_query"] = fixed_query  # Update to reflect the fixed query
                # query_flow_store["tool_response"] += f"Text2SSQL: Fixed query executed successfully!\n"

                # Update final_query for any downstream processing
                final_query = fixed_query
                log.info(f"ChatID: {chat_id} - Fixed query executed successfully!")

            except Exception as fix_error:
                # Either the fix failed or the fixed query also failed
                if str(fix_error) != str(e):  # Different error from the fix attempt
                    log.error(f"ChatID: {chat_id} - GROUP BY fix attempt also failed: {fix_error}")
                    # query_flow_store["tool_response"] += f"Text2SSQL: GROUP BY fix also failed: {fix_error}\n"
                else:
                    log.error(f"ChatID: {chat_id} - GROUP BY fix didn't resolve the issue")
                    # query_flow_store["tool_response"] += f"Text2SSQL: GROUP BY fix didn't resolve the issue\n"

                # Log the final error with both original and fixed queries for debugging
                intermediate_results["fixed_query_execution_error"] = fix_error
                log.error(f"Final error for chat ID {chat_id}: Original error: {e}, Fix error: {fix_error}")
                # query_flow_store["tool_response"] += (
                #     f"Text2SSQL: Final error during SQL execution: {e}\nOriginal query:\n{final_query}\n"
                # )

                return (
                    intermediate_results,
                    {
                        "sql_query": "Failed to retrieve data from the DB due to an error. Please try again later.",
                        "results": "Failed to retrieve data from the DB due to an error. Please try again later.",
                        "entity_urls": None,
                    },
                )

        # logger.info(f"SQL Query Execution Result: {query_execution_result}")

        # Format results with embedded URLs
        # formatted_query_result = await format_as_bullet_points(query_execution_result)

        response_data: Dict[str, Any] = {"sql_query": final_query, "results": query_execution_result}

        return intermediate_results, response_data

    except Exception as e:
        log.error(f"Error in text2sql function: {e}")
        query_flow_store["tool_response"] += f"Text2SSQL: error in text2sql function {e}\n"
        query_execution_result = "There was an error pulling the data from the database. Please try again later."
        return (intermediate_results, {"sql_query": query_execution_result, "results": query_execution_result, "entity_urls": None})
