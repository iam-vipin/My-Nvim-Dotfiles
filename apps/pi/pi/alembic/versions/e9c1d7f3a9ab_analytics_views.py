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

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "e9c1d7f3a9ab"
down_revision: Union[str, None] = "b18f9fa7c377"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create analytics schema
    op.execute("CREATE SCHEMA IF NOT EXISTS analytics;")

    # View: messages_enriched
    op.execute(
        r"""
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
        """
    )

    # View: message_costs_per_message
    op.execute(
        r"""
        CREATE OR REPLACE VIEW analytics.message_costs_per_message AS
        SELECT
          mm.message_id,
          MIN(m.created_at)                                          AS message_created_at,
          SUM(COALESCE(mm.input_text_tokens, 0))                     AS input_tokens,
          SUM(COALESCE(mm.cached_input_text_tokens, 0))              AS cached_input_tokens,
          SUM(COALESCE(mm.output_text_tokens, 0))                    AS output_tokens,
          SUM(COALESCE(mm.input_text_price, 0)
            + COALESCE(mm.cached_input_text_price, 0)
            + COALESCE(mm.output_text_price, 0))                     AS total_usd,
          COUNT(*)                                                   AS meta_steps
        FROM public.message_meta mm
        JOIN public.messages m ON m.id = mm.message_id
        WHERE mm.deleted_at IS NULL
        GROUP BY mm.message_id;
        """
    )

    # View: daily_llm_spend
    op.execute(
        r"""
        CREATE OR REPLACE VIEW analytics.daily_llm_spend AS
        SELECT
          DATE(me.message_created_at)                          AS day,
          COALESCE(me.llm_model_key, lm.model_key)             AS model_key,
          me.llm_model_id,
          me.workspace_id,
          COUNT(DISTINCT me.message_id)                        AS messages,
          SUM(m.total_usd)                                     AS usd,
          SUM(m.input_tokens)                                  AS input_tokens,
          SUM(m.cached_input_tokens)                           AS cached_input_tokens,
          SUM(m.output_tokens)                                 AS output_tokens
        FROM analytics.message_costs_per_message m
        JOIN analytics.messages_enriched me ON me.message_id = m.message_id
        LEFT JOIN public.llm_models lm ON lm.id = me.llm_model_id
        GROUP BY 1,2,3,4;
        """
    )

    # View: message_steps_enriched
    op.execute(
        r"""
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
          c.workspace_id,
          m.user_type
        FROM public.message_flow_steps s
        LEFT JOIN public.messages m ON m.id = s.message_id
        LEFT JOIN public.chats c ON c.id = s.chat_id
        WHERE s.deleted_at IS NULL;
        """
    )

    # View: message_feedbacks_enriched
    op.execute(
        r"""
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
          c.workspace_id
        FROM public.message_feedbacks f
        JOIN public.messages me ON me.id = f.message_id
        LEFT JOIN public.chats c ON c.id = me.chat_id
        WHERE f.deleted_at IS NULL;
        """
    )

    # View: chats_enriched
    op.execute(
        r"""
        CREATE OR REPLACE VIEW analytics.chats_enriched AS
        SELECT
          c.id                         AS chat_id,
          c.created_at                 AS chat_created_at,
          c.user_id,
          c.workspace_id,
          c.is_favorite,
          c.is_project_chat,
          COUNT(m.id)                  AS message_count,
          MAX(m.created_at)            AS last_activity_at
        FROM public.chats c
        LEFT JOIN public.messages m ON m.chat_id = c.id AND m.deleted_at IS NULL
        WHERE c.deleted_at IS NULL
        GROUP BY c.id;
        """
    )

    # View: daily_user_activity
    op.execute(
        r"""
        CREATE OR REPLACE VIEW analytics.daily_user_activity AS
        SELECT
          DATE(m.created_at)   AS day,
          c.user_id,
          c.workspace_id,
          COUNT(m.id)          AS messages,
          COUNT(DISTINCT m.chat_id) AS active_chats
        FROM public.messages m
        JOIN public.chats c ON c.id = m.chat_id
        WHERE m.deleted_at IS NULL
        GROUP BY 1,2,3;
        """
    )

    # Materialized View: mv_daily_usage
    op.execute(
        r"""
        CREATE MATERIALIZED VIEW IF NOT EXISTS analytics.mv_daily_usage AS
        SELECT
          d.day,
          d.workspace_id,
          COUNT(DISTINCT d.user_id) AS dau,
          SUM(d.messages)           AS messages,
          SUM(d.active_chats)       AS active_chats
        FROM analytics.daily_user_activity d
        GROUP BY 1,2;
        """
    )

    # Materialized View: mv_daily_spend
    op.execute(
        r"""
        CREATE MATERIALIZED VIEW IF NOT EXISTS analytics.mv_daily_spend AS
        SELECT
          day,
          workspace_id,
          model_key,
          SUM(usd)                  AS usd,
          SUM(input_tokens)         AS input_tokens,
          SUM(cached_input_tokens)  AS cached_input_tokens,
          SUM(output_tokens)        AS output_tokens
        FROM analytics.daily_llm_spend
        GROUP BY 1,2,3;
        """
    )

    # Materialized View: mv_user_first_activity
    op.execute(
        r"""
        CREATE MATERIALIZED VIEW IF NOT EXISTS analytics.mv_user_first_activity AS
        SELECT
          c.user_id,
          c.workspace_id,
          MIN(m.created_at)::date AS first_message_day
        FROM public.messages m
        JOIN public.chats c ON c.id = m.chat_id
        WHERE m.deleted_at IS NULL
        GROUP BY c.user_id, c.workspace_id;
        """
    )


def downgrade() -> None:
    # Drop materialized views first (in dependency order)
    op.execute("DROP MATERIALIZED VIEW IF EXISTS analytics.mv_user_first_activity;")
    op.execute("DROP MATERIALIZED VIEW IF EXISTS analytics.mv_daily_spend;")
    op.execute("DROP MATERIALIZED VIEW IF EXISTS analytics.mv_daily_usage;")

    # Drop regular views
    op.execute("DROP VIEW IF EXISTS analytics.daily_user_activity;")
    op.execute("DROP VIEW IF EXISTS analytics.chats_enriched;")
    op.execute("DROP VIEW IF EXISTS analytics.message_feedbacks_enriched;")
    op.execute("DROP VIEW IF EXISTS analytics.message_steps_enriched;")
    op.execute("DROP VIEW IF EXISTS analytics.daily_llm_spend;")
    op.execute("DROP VIEW IF EXISTS analytics.message_costs_per_message;")
    op.execute("DROP VIEW IF EXISTS analytics.messages_enriched;")

    # Drop schema
    op.execute("DROP SCHEMA IF EXISTS analytics CASCADE;")
