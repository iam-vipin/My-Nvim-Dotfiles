"""polymorphic focus context

Revision ID: 74852ee169e1
Revises: 6082d91ecc4e
Create Date: 2025-01-28

This migration adds polymorphic focus context columns (focus_entity_type, focus_entity_id)
to replace the specific focus_project_id and focus_workspace_id columns.
This allows supporting multiple entity types (workspace, project, cycle, module, etc.)
without adding new columns for each type.
Also adds mode column to store chat mode (ask/build).
Also adds source column to messages table to track the source of chat requests.
"""

from typing import Sequence
from typing import Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "74852ee169e1"
down_revision: Union[str, None] = "6082d91ecc4e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add new polymorphic columns
    op.add_column("user_chat_preferences", sa.Column("focus_entity_type", sa.String(length=50), nullable=True))
    op.add_column("user_chat_preferences", sa.Column("focus_entity_id", sa.Uuid(), nullable=True))

    # Add mode column with default value 'ask'
    op.add_column("user_chat_preferences", sa.Column("mode", sa.String(length=10), nullable=False, server_default="ask"))

    # Add source column to messages table to track the source of chat requests
    op.add_column("messages", sa.Column("source", sa.String(length=50), nullable=True))

    # Migrate existing data from old columns to new polymorphic structure
    # If focus_project_id is set, migrate to focus_entity_type='project' and focus_entity_id=focus_project_id
    op.execute("""
        UPDATE user_chat_preferences
        SET focus_entity_type = 'project', focus_entity_id = focus_project_id
        WHERE focus_project_id IS NOT NULL
    """)

    # If focus_workspace_id is set (and focus_project_id is NULL), migrate to focus_entity_type='workspace' and focus_entity_id=focus_workspace_id
    op.execute("""
        UPDATE user_chat_preferences
        SET focus_entity_type = 'workspace', focus_entity_id = focus_workspace_id
        WHERE focus_workspace_id IS NOT NULL AND focus_project_id IS NULL
    """)

    # Note: We keep the old columns (focus_project_id, focus_workspace_id) for backward compatibility
    # They will be dropped in a future migration after all code is updated


def downgrade() -> None:
    # Migrate data back from new columns to old columns
    op.execute("""
        UPDATE user_chat_preferences
        SET focus_project_id = focus_entity_id
        WHERE focus_entity_type = 'project' AND focus_entity_id IS NOT NULL
    """)

    op.execute("""
        UPDATE user_chat_preferences
        SET focus_workspace_id = focus_entity_id
        WHERE focus_entity_type = 'workspace' AND focus_entity_id IS NOT NULL
    """)

    # Drop new columns
    op.drop_column("messages", "source")
    op.drop_column("user_chat_preferences", "mode")
    op.drop_column("user_chat_preferences", "focus_entity_id")
    op.drop_column("user_chat_preferences", "focus_entity_type")
