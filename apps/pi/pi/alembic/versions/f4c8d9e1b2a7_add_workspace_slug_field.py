from typing import Sequence
from typing import Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "f4c8d9e1b2a7"
down_revision: Union[str, None] = "e9c1d7f3a9ab"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add workspace_slug column to chats table
    op.add_column("chats", sa.Column("workspace_slug", sa.String(length=255), nullable=True))

    # Add workspace_slug column to messages table
    op.add_column("messages", sa.Column("workspace_slug", sa.String(length=255), nullable=True))

    # Add workspace_slug column to message_meta table
    op.add_column("message_meta", sa.Column("workspace_slug", sa.String(length=255), nullable=True))

    # Add workspace_slug column to message_flow_steps table
    op.add_column("message_flow_steps", sa.Column("workspace_slug", sa.String(length=255), nullable=True))

    # Add workspace_slug column to message_feedbacks table
    op.add_column("message_feedbacks", sa.Column("workspace_slug", sa.String(length=255), nullable=True))

    # Update analytics views to use workspace_slug instead of workspace_id
    op.execute("DROP VIEW IF EXISTS analytics.messages_enriched CASCADE;")
    op.execute("""
        CREATE OR REPLACE VIEW analytics.messages_enriched AS
        SELECT
          m.id               AS message_id,
          m.created_at       AS message_created_at,
          m.chat_id,
          c.user_id,
          COALESCE(c.workspace_slug, c.workspace_id::text) AS workspace_slug,
          m.sequence,
          m.user_type,
          m.llm_model_id,
          m.llm_model        AS llm_model_key,
          m.parsed_content
        FROM public.messages m
        LEFT JOIN public.chats c ON c.id = m.chat_id
        WHERE m.deleted_at IS NULL;
    """)

    op.execute("DROP VIEW IF EXISTS analytics.daily_llm_spend CASCADE;")
    op.execute("""
        CREATE OR REPLACE VIEW analytics.daily_llm_spend AS
        SELECT
          DATE(me.message_created_at)                          AS day,
          COALESCE(me.llm_model_key, lm.model_key)             AS model_key,
          me.llm_model_id,
          me.workspace_slug,
          COUNT(DISTINCT me.message_id)                        AS messages,
          SUM(m.total_usd)                                     AS usd,
          SUM(m.input_tokens)                                  AS input_tokens,
          SUM(m.cached_input_tokens)                           AS cached_input_tokens,
          SUM(m.output_tokens)                                 AS output_tokens
        FROM analytics.message_costs_per_message m
        JOIN analytics.messages_enriched me ON me.message_id = m.message_id
        LEFT JOIN public.llm_models lm ON lm.id = me.llm_model_id
        GROUP BY 1,2,3,4;
    """)

    op.execute("DROP VIEW IF EXISTS analytics.message_steps_enriched CASCADE;")
    op.execute("""
        CREATE OR REPLACE VIEW analytics.message_steps_enriched AS
        SELECT
          s.id            AS step_id,
          s.created_at    AS step_created_at,
          s.message_id,
          s.chat_id,
          s.step_type,
          s.tool_name,
          s.execution_data,
          c.user_id,
          COALESCE(c.workspace_slug, c.workspace_id::text) AS workspace_slug,
          m.user_type
        FROM public.message_flow_steps s
        LEFT JOIN public.messages m ON m.id = s.message_id
        LEFT JOIN public.chats c ON c.id = s.chat_id
        WHERE s.deleted_at IS NULL;
    """)

    op.execute("DROP VIEW IF EXISTS analytics.message_feedbacks_enriched CASCADE;")
    op.execute("""
        CREATE OR REPLACE VIEW analytics.message_feedbacks_enriched AS
        SELECT
          f.id            AS feedback_id,
          f.created_at    AS feedback_created_at,
          f.type,
          f.reaction,
          f.feedback,
          f.user_id       AS feedback_user_id,
          f.message_id,
          me.chat_id,
          COALESCE(c.workspace_slug, c.workspace_id::text) AS workspace_slug
        FROM public.message_feedbacks f
        JOIN public.messages me ON me.id = f.message_id
        LEFT JOIN public.chats c ON c.id = me.chat_id
        WHERE f.deleted_at IS NULL;
    """)

    op.execute("DROP VIEW IF EXISTS analytics.chats_enriched CASCADE;")
    op.execute("""
        CREATE OR REPLACE VIEW analytics.chats_enriched AS
        SELECT
          c.id                         AS chat_id,
          c.created_at                 AS chat_created_at,
          c.user_id,
          COALESCE(c.workspace_slug, c.workspace_id::text) AS workspace_slug,
          c.is_favorite,
          c.is_project_chat,
          COUNT(m.id)                  AS message_count,
          MAX(m.created_at)            AS last_activity_at
        FROM public.chats c
        LEFT JOIN public.messages m ON m.chat_id = c.id AND m.deleted_at IS NULL
        WHERE c.deleted_at IS NULL
        GROUP BY c.id;
    """)

    op.execute("DROP VIEW IF EXISTS analytics.daily_user_activity CASCADE;")
    op.execute("""
        CREATE OR REPLACE VIEW analytics.daily_user_activity AS
        SELECT
          DATE(m.created_at)   AS day,
          c.user_id,
          COALESCE(c.workspace_slug, c.workspace_id::text) AS workspace_slug,
          COUNT(m.id)          AS messages,
          COUNT(DISTINCT m.chat_id) AS active_chats
        FROM public.messages m
        JOIN public.chats c ON c.id = m.chat_id
        WHERE m.deleted_at IS NULL
        GROUP BY 1,2,3;
    """)

    # Update materialized views
    op.execute("DROP MATERIALIZED VIEW IF EXISTS analytics.mv_daily_usage;")
    op.execute("""
        CREATE MATERIALIZED VIEW analytics.mv_daily_usage AS
        SELECT
          d.day,
          d.workspace_slug,
          COUNT(DISTINCT d.user_id) AS dau,
          SUM(d.messages)           AS messages,
          SUM(d.active_chats)       AS active_chats
        FROM analytics.daily_user_activity d
        GROUP BY 1,2;
    """)

    op.execute("DROP MATERIALIZED VIEW IF EXISTS analytics.mv_daily_spend;")
    op.execute("""
        CREATE MATERIALIZED VIEW analytics.mv_daily_spend AS
        SELECT
          day,
          workspace_slug,
          model_key,
          SUM(usd)                  AS usd,
          SUM(input_tokens)         AS input_tokens,
          SUM(cached_input_tokens)  AS cached_input_tokens,
          SUM(output_tokens)        AS output_tokens
        FROM analytics.daily_llm_spend
        GROUP BY 1,2,3;
    """)

    op.execute("DROP MATERIALIZED VIEW IF EXISTS analytics.mv_user_first_activity;")
    op.execute("""
        CREATE MATERIALIZED VIEW analytics.mv_user_first_activity AS
        SELECT
          c.user_id,
          COALESCE(c.workspace_slug, c.workspace_id::text) AS workspace_slug,
          MIN(m.created_at)::date AS first_message_day
        FROM public.messages m
        JOIN public.chats c ON c.id = m.chat_id
        WHERE m.deleted_at IS NULL
        GROUP BY c.user_id, COALESCE(c.workspace_slug, c.workspace_id::text);
    """)


def downgrade() -> None:
    # Recreate original views with workspace_id
    op.execute("DROP MATERIALIZED VIEW IF EXISTS analytics.mv_user_first_activity;")
    op.execute("DROP MATERIALIZED VIEW IF EXISTS analytics.mv_daily_spend;")
    op.execute("DROP MATERIALIZED VIEW IF EXISTS analytics.mv_daily_usage;")
    op.execute("DROP VIEW IF EXISTS analytics.daily_user_activity CASCADE;")
    op.execute("DROP VIEW IF EXISTS analytics.chats_enriched CASCADE;")
    op.execute("DROP VIEW IF EXISTS analytics.message_feedbacks_enriched CASCADE;")
    op.execute("DROP VIEW IF EXISTS analytics.message_steps_enriched CASCADE;")
    op.execute("DROP VIEW IF EXISTS analytics.daily_llm_spend CASCADE;")
    op.execute("DROP VIEW IF EXISTS analytics.messages_enriched CASCADE;")

    # Remove workspace_slug columns
    op.drop_column("message_feedbacks", "workspace_slug")
    op.drop_column("message_flow_steps", "workspace_slug")
    op.drop_column("message_meta", "workspace_slug")
    op.drop_column("messages", "workspace_slug")
    op.drop_column("chats", "workspace_slug")

    # Recreate original views (from previous migration)
    op.execute("""
        CREATE OR REPLACE VIEW analytics.messages_enriched AS
        SELECT
          m.id               AS message_id,
          m.created_at       AS message_created_at,
          m.chat_id,
          c.user_id,
          c.workspace_id,
          m.sequence,
          m.user_type,
          m.llm_model_id,
          m.llm_model        AS llm_model_key,
          m.parsed_content
        FROM public.messages m
        LEFT JOIN public.chats c ON c.id = m.chat_id
        WHERE m.deleted_at IS NULL;
    """)
    # Add other view recreations as needed...
