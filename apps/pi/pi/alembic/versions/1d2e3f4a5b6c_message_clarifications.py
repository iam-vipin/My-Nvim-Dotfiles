from typing import Sequence
from typing import Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "1d2e3f4a5b6c"
down_revision: Union[str, None] = "0b378a3ddb8e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "message_clarifications",
        sa.Column("deleted_at", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column("created_by_id", sa.Uuid(), nullable=True),
        sa.Column("updated_by_id", sa.Uuid(), nullable=True),
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("chat_id", sa.Uuid(), nullable=False),
        sa.Column("message_id", sa.Uuid(), nullable=False),
        sa.Column("pending", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("kind", sa.String(length=16), nullable=False),
        sa.Column("original_query", sa.Text(), nullable=False),
        sa.Column("payload", sa.dialects.postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("categories", sa.dialects.postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("method_tool_names", sa.dialects.postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("bound_tool_names", sa.dialects.postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("answer_text", sa.Text(), nullable=True),
        sa.Column("resolved_by_message_id", sa.Uuid(), nullable=True),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("resolved_at", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.CheckConstraint("kind in ('action','retrieval')", name="ck_message_clarifications_kind"),
        sa.ForeignKeyConstraint(["chat_id"], ["chats.id"], name="fk_message_clarifications_chat_id"),
        sa.ForeignKeyConstraint(["message_id"], ["messages.id"], name="fk_message_clarifications_message_id"),
        sa.ForeignKeyConstraint(["resolved_by_message_id"], ["messages.id"], name="fk_message_clarifications_resolved_by_message_id"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("message_id", name="uq_message_clarifications_message_id"),
    )

    # Index for fast lookups of latest pending by chat
    op.create_index(
        "ix_message_clarifications_chat_pending_created",
        "message_clarifications",
        ["chat_id", "pending", "created_at"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_message_clarifications_chat_pending_created", table_name="message_clarifications")
    op.drop_table("message_clarifications")
