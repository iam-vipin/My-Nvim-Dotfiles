# flake8: noqa
from typing import List
from typing import Literal
from typing import Dict
from typing import Optional

from pydantic import BaseModel
from pydantic import Field

# ===========================#
# ====    SQL AGENT     =====#
# ===========================#


class SchemaRewriteResponse(BaseModel):
    thinking: str = Field(description="Here you can think and talk to youself, and reason why and how you remove the redundant columns")
    reflection: str = Field(description="Reflection on schema accuracy")
    schema_creation: str = Field(
        description="Here you can reflect on your previous thinking process and if you catch any mistakes, you can correct them, if you are confident, you can move forward to the next step. If you dont find any tables or columns and you are not confident about the schema might answer the user's question, you can reason them here and return NOT ENOUGH INFORMATION"
    )
    schema_refinement: str = Field(
        description="If you think the schema is not accurate or wrong, you can do it here, else if the schema is accurate you can just skip this step"
    )
    final_schema: str = Field(
        description="Here you can provide the final schema in SQL format without hallucinating any names of table and columns. Which will be next used to create the SQL query when paired with the user's question"
    )


class TableSelectionResponse(BaseModel):
    relevant_tables: List[str] = Field(description="List of relevant table names for the SQL query")


class QueryResultIds(BaseModel):
    issues: List[str] = Field(default_factory=list, description="List of issue IDs from query results")
    pages: List[str] = Field(default_factory=list, description="List of page IDs from query results")
    cycles: List[str] = Field(default_factory=list, description="List of cycle IDs from query results")
    modules: List[str] = Field(default_factory=list, description="List of module IDs from query results")


class EntityLink(BaseModel):
    name: str = Field(description="Human-readable name of the entity")
    id: str = Field(description="UUID of the entity")
    url: str = Field(description="Deep-link URL to the entity")
    type: str = Field(description="Type of entity (issue, page, cycle, module)")


class URLConstructionRequest(BaseModel):
    entity_ids: QueryResultIds = Field(description="Entity IDs to construct URLs for")
    api_base_url: str = Field(description="Base URL for the application")
    workspace_slug: Optional[str] = Field(default=None, description="Workspace slug for URL construction")
    project_id: Optional[str] = Field(default=None, description="Project ID for URL construction")
