# SPDX-FileCopyrightText: 2023-present Plane Software, Inc.
# SPDX-License-Identifier: LicenseRef-Plane-Commercial
#
# Licensed under the Plane Commercial License (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
# https://plane.so/legals/eula
#
# DO NOT remove or modify this notice.
# NOTICE: Proprietary and confidential. Unauthorized use or distribution is prohibited.

"""migrate enums to varchar

Revision ID: b18f9fa7c377
Revises: 43306d5dbfcb
Create Date: 2025-01-28

This migration converts all PostgreSQL enum type columns to VARCHAR columns
to avoid enum-related issues.
"""

from typing import Sequence
from typing import Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "b18f9fa7c377"
down_revision: Union[str, None] = "43306d5dbfcb"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Convert enum columns to VARCHAR columns."""

    # 1. agent_artifacts.agent_name
    op.alter_column(
        "agent_artifacts", "agent_name", type_=sa.String(255), existing_type=postgresql.ENUM("PRD_WRITER", name="agentstype"), nullable=False
    )

    # 2. agent_artifacts.content_type
    op.alter_column(
        "agent_artifacts",
        "content_type",
        type_=sa.String(50),
        existing_type=postgresql.ENUM("MARKDOWN", name="agentartifactcontenttype"),
        nullable=False,
        server_default="markdown",
    )

    # 3. messages.user_type
    op.alter_column(
        "messages",
        "user_type",
        type_=sa.String(50),
        existing_type=postgresql.ENUM("USER", "ASSISTANT", "SYSTEM", name="usertypechoices"),
        nullable=False,
    )

    # 4. message_feedbacks.type
    op.alter_column(
        "message_feedbacks",
        "type",
        type_=sa.String(50),
        existing_type=postgresql.ENUM("FEEDBACK", "REACTION", name="messagefeedbacktypechoices"),
        nullable=False,
    )

    # 5. message_flow_steps.step_type
    op.alter_column(
        "message_flow_steps",
        "step_type",
        type_=sa.String(50),
        existing_type=postgresql.ENUM("REWRITE", "ROUTING", "TOOL", "COMBINATION", name="flowsteptype"),
        nullable=False,
    )

    # 6. message_meta.step_type
    op.alter_column(
        "message_meta",
        "step_type",
        type_=sa.String(50),
        existing_type=postgresql.ENUM(
            "INPUT",
            "REWRITE",
            "ROUTER",
            "COMBINATION",
            "SQL_TABLE_SELECTION",
            "SQL_GENERATION",
            "TITLE_GENERATION",
            "TOOL_ORCHESTRATION",
            name="messagemetasteptype",
        ),
        nullable=False,
    )

    # 7. workspacevectorization.status
    op.alter_column(
        "workspacevectorization",
        "status",
        type_=sa.String(50),
        existing_type=postgresql.ENUM("queued", "running", "success", "failed", name="vectorizationstatus"),
        nullable=False,
        server_default="queued",
    )

    # Now we need to update the values from UPPERCASE to lowercase
    # This is needed because the Python enums use lowercase values

    # Update agent_artifacts
    op.execute("UPDATE agent_artifacts SET agent_name = LOWER(agent_name)")
    op.execute("UPDATE agent_artifacts SET content_type = LOWER(content_type)")

    # Update messages
    op.execute("UPDATE messages SET user_type = LOWER(user_type)")

    # Update message_feedbacks
    op.execute("UPDATE message_feedbacks SET type = LOWER(type)")

    # Update message_flow_steps
    op.execute("UPDATE message_flow_steps SET step_type = LOWER(step_type)")

    # Update message_meta
    op.execute("UPDATE message_meta SET step_type = LOWER(step_type)")

    # The workspacevectorization status is already lowercase, no update needed

    # Finally, drop all the enum types
    op.execute("DROP TYPE IF EXISTS agentstype CASCADE")
    op.execute("DROP TYPE IF EXISTS agentartifactcontenttype CASCADE")
    op.execute("DROP TYPE IF EXISTS usertypechoices CASCADE")
    op.execute("DROP TYPE IF EXISTS messagefeedbacktypechoices CASCADE")
    op.execute("DROP TYPE IF EXISTS flowsteptype CASCADE")
    op.execute("DROP TYPE IF EXISTS messagemetasteptype CASCADE")
    op.execute("DROP TYPE IF EXISTS vectorizationstatus CASCADE")


def downgrade() -> None:
    """Convert VARCHAR columns back to enum columns."""

    # Recreate the enum types
    agentstype = postgresql.ENUM("prd_writer", name="agentstype", create_type=False)
    agentstype.create(op.get_bind(), checkfirst=True)

    agentartifactcontenttype = postgresql.ENUM("markdown", name="agentartifactcontenttype", create_type=False)
    agentartifactcontenttype.create(op.get_bind(), checkfirst=True)

    usertypechoices = postgresql.ENUM("user", "assistant", "system", name="usertypechoices", create_type=False)
    usertypechoices.create(op.get_bind(), checkfirst=True)

    messagefeedbacktypechoices = postgresql.ENUM("feedback", "reaction", name="messagefeedbacktypechoices", create_type=False)
    messagefeedbacktypechoices.create(op.get_bind(), checkfirst=True)

    flowsteptype = postgresql.ENUM("rewrite", "routing", "tool", "combination", name="flowsteptype", create_type=False)
    flowsteptype.create(op.get_bind(), checkfirst=True)

    messagemetasteptype = postgresql.ENUM(
        "input",
        "rewrite",
        "router",
        "combination",
        "sql_table_selection",
        "sql_generation",
        "title_generation",
        "tool_orchestration",
        name="messagemetasteptype",
        create_type=False,
    )
    messagemetasteptype.create(op.get_bind(), checkfirst=True)

    vectorizationstatus = postgresql.ENUM("queued", "running", "success", "failed", name="vectorizationstatus", create_type=False)
    vectorizationstatus.create(op.get_bind(), checkfirst=True)

    # Convert columns back to enum types
    op.alter_column(
        "agent_artifacts", "agent_name", type_=agentstype, existing_type=sa.String(255), nullable=False, postgresql_using="agent_name::agentstype"
    )

    op.alter_column(
        "agent_artifacts",
        "content_type",
        type_=agentartifactcontenttype,
        existing_type=sa.String(50),
        nullable=False,
        postgresql_using="content_type::agentartifactcontenttype",
    )

    op.alter_column(
        "messages", "user_type", type_=usertypechoices, existing_type=sa.String(50), nullable=False, postgresql_using="user_type::usertypechoices"
    )

    op.alter_column(
        "message_feedbacks",
        "type",
        type_=messagefeedbacktypechoices,
        existing_type=sa.String(50),
        nullable=False,
        postgresql_using="type::messagefeedbacktypechoices",
    )

    op.alter_column(
        "message_flow_steps", "step_type", type_=flowsteptype, existing_type=sa.String(50), nullable=False, postgresql_using="step_type::flowsteptype"
    )

    op.alter_column(
        "message_meta",
        "step_type",
        type_=messagemetasteptype,
        existing_type=sa.String(50),
        nullable=False,
        postgresql_using="step_type::messagemetasteptype",
    )

    op.alter_column(
        "workspacevectorization",
        "status",
        type_=vectorizationstatus,
        existing_type=sa.String(50),
        nullable=False,
        postgresql_using="status::vectorizationstatus",
    )
