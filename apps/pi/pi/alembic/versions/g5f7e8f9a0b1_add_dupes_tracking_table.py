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

from typing import Sequence
from typing import Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "g5f7e8f9a0b1"
down_revision: Union[str, None] = "61a53be6c575"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create dupes_tracking table
    op.create_table(
        "dupes_tracking",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_by_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("updated_by_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("workspace_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("project_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("issue_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("workspace_slug", sa.String(length=255), nullable=True),
        sa.Column("query_title", sa.String(), nullable=True),
        sa.Column("query_description_length", sa.Integer(), nullable=True),
        sa.Column("input_workitems_text", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("output_duplicates_text", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("vector_candidates_count", sa.Integer(), nullable=True),
        sa.Column("vector_search_duration_ms", sa.Float(), nullable=True),
        sa.Column("llm_candidates_count", sa.Integer(), nullable=True),
        sa.Column("llm_identified_dupes_count", sa.Integer(), nullable=True),
        sa.Column("llm_duration_ms", sa.Float(), nullable=True),
        sa.Column("llm_success", sa.Boolean(), nullable=False),
        sa.Column("llm_error", sa.String(), nullable=True),
        sa.Column("llm_model_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("input_text_tokens", sa.Integer(), nullable=True),
        sa.Column("input_text_price", sa.Float(), nullable=True),
        sa.Column("output_text_tokens", sa.Integer(), nullable=True),
        sa.Column("output_text_price", sa.Float(), nullable=True),
        sa.Column("cached_input_text_tokens", sa.Integer(), nullable=True),
        sa.Column("cached_input_text_price", sa.Float(), nullable=True),
        sa.Column("llm_model_pricing_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("total_duration_ms", sa.Float(), nullable=True),
        sa.ForeignKeyConstraint(["llm_model_id"], ["llm_models.id"], name="fk_dupes_tracking_llm_model_id"),
        sa.ForeignKeyConstraint(["llm_model_pricing_id"], ["llm_model_pricing.id"], name="fk_dupes_tracking_llm_model_pricing_id"),
        sa.PrimaryKeyConstraint("id"),
    )

    # Create indexes for common query patterns
    op.create_index(op.f("ix_dupes_tracking_workspace_id"), "dupes_tracking", ["workspace_id"], unique=False)
    op.create_index(op.f("ix_dupes_tracking_project_id"), "dupes_tracking", ["project_id"], unique=False)
    op.create_index(op.f("ix_dupes_tracking_issue_id"), "dupes_tracking", ["issue_id"], unique=False)
    op.create_index(op.f("ix_dupes_tracking_user_id"), "dupes_tracking", ["user_id"], unique=False)
    op.create_index(op.f("ix_dupes_tracking_created_at"), "dupes_tracking", ["created_at"], unique=False)

    # Composite indexes for common query patterns
    op.create_index("ix_dupes_tracking_workspace_created", "dupes_tracking", ["workspace_id", "created_at"], unique=False)


def downgrade() -> None:
    # Drop indexes
    op.drop_index("ix_dupes_tracking_workspace_created", table_name="dupes_tracking")
    op.drop_index(op.f("ix_dupes_tracking_created_at"), table_name="dupes_tracking")
    op.drop_index(op.f("ix_dupes_tracking_user_id"), table_name="dupes_tracking")
    op.drop_index(op.f("ix_dupes_tracking_issue_id"), table_name="dupes_tracking")
    op.drop_index(op.f("ix_dupes_tracking_project_id"), table_name="dupes_tracking")
    op.drop_index(op.f("ix_dupes_tracking_workspace_id"), table_name="dupes_tracking")

    # Drop table
    op.drop_table("dupes_tracking")
