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

"""Setting for the Plane AI project."""

import logging
import os
from dataclasses import dataclass
from dataclasses import field
from typing import Optional

import colorlog
from dotenv import load_dotenv

load_dotenv()


def get_env_bool(k: str, d: str = "") -> bool:
    """Get boolean env var."""
    return os.getenv(k, d).lower() in ("1", "true")


def get_env_int(k: str, d: str) -> int:
    """Get integer env var."""
    return int(os.getenv(k, d))


@dataclass
class PlaneAPI:
    """Configuration for Plane API endpoints and session."""

    HOST: str = os.getenv("PLANE_API_HOST", "https://api.plane.so")
    BASE_PATH: str = os.getenv("PI_BASE_PATH", "")
    SESSION_CHECK: str = f"{HOST}/api/users/session/"
    SESSION_COOKIE_NAME: str = os.getenv("SESSION_COOKIE_NAME", "session-id")
    FRONTEND_URL: str = os.getenv("PLANE_FRONTEND_URL", "https://app.plane.so")

    # TODO: needed for feature flag (not in use)
    DISCO_HOST_URL: str = os.getenv("DISCO_HOST_URL", "https://disco.plane.so")

    # OAuth Configuration
    OAUTH_CLIENT_ID: str = os.getenv("PLANE_OAUTH_CLIENT_ID", "")
    OAUTH_CLIENT_SECRET: str = os.getenv("PLANE_OAUTH_CLIENT_SECRET", "")
    OAUTH_REDIRECT_URI: str = os.getenv("PLANE_OAUTH_REDIRECT_URI", "")
    OAUTH_URL_ENCRYPTION_KEY: str = os.getenv("PLANE_OAUTH_URL_ENCRYPTION_KEY", "Ajvaq_jsqNuI8AuRWyC1y-iro7csYpab0tYn98Q68mU=")

    # OAuth state expiry time in seconds (default: 23 hours = 82800 seconds)
    OAUTH_STATE_EXPIRY_SECONDS: int = get_env_int("PLANE_OAUTH_STATE_EXPIRY_SECONDS", "82800")


@dataclass
class FeatureFlags:
    """Feature flags constants"""

    # https://github.com/makeplane/plane-ee/blob/preview/packages/constants/src/feature-flag.ts#L59

    PI_DEDUPE = "PI_DEDUPE"
    PI_CHAT = "PI_CHAT"
    PI_CONVERSE = "PI_CONVERSE"  # Voice input in chat
    PI_ACTION_EXECUTION = "PI_ACTIONS"  # Action execution in chat (create/update work-items, etc.)
    # PI_BETA_MODEL = "PI_BETA_MODEL"  # Beta llm models in chat
    PI_SONNET_4 = "PI_SONNET_4"


@dataclass
class Server:
    """FastAPI server configuration settings."""

    FASTAPI_APP_HOST: str = os.getenv("FASTAPI_APP_HOST", "")
    FASTAPI_APP_PORT: str = os.getenv("FASTAPI_APP_PORT", "")
    FASTAPI_APP_WORKERS: str = os.getenv("FASTAPI_APP_WORKERS", "")
    FASTAPI_APP_WORKER_TIMEOUT: str = os.getenv("FASTAPI_APP_WORKER_TIMEOUT", "60")
    PI_SECRET_KEY: str = os.getenv("PI_SECRET_KEY", "")
    PLANE_PI_INTERNAL_API_SECRET: str = os.getenv("PLANE_PI_INTERNAL_API_SECRET", "")

    # Internal API URL for Celery tasks to call back to the API
    # Should use the same ingress URL that frontend services use
    # Examples:
    #   Development: https://dev.plane-pi.plane.town
    #   Production: https://plane-pi.plane.so
    #   Local development: http://localhost:8000
    #   Docker local: http://host.docker.internal:8000
    INTERNAL_API_URL: str = os.getenv("PLANE_PI_INTERNAL_API_URL", "https://plane-pi.plane.so")


@dataclass
class VectorDB:
    """Configuration for vector database and related settings."""

    DEBUG: bool = get_env_bool("DEBUG")

    DEV_WORKSPACE_ID: str | None = os.getenv("DEV_WORKSPACE_ID")
    FEED_DOCS_DATA: bool = get_env_bool("FEED_DOCS_DATA", "0")
    FEED_ISSUES_DATA: bool = get_env_bool("FEED_ISSUES_DATA", "0")
    FEED_PAGES_DATA: bool = get_env_bool("FEED_PAGES_DATA", "0")
    FEED_SLICES: int = get_env_int("FEED_SLICES", "1")

    SCROLL_TIMEOUT: str = os.getenv("SCROLL_TIMEOUT", "10m")
    BULK_SIZE: int = 100
    BATCH_SIZE: int = get_env_int("BATCH_SIZE", "64")

    # Documentation Webhook Configuration
    DOCS_WEBHOOK_SECRET: str = os.getenv("DOCS_WEBHOOK_SECRET", "")
    DOCS_GITHUB_API_TOKEN: str = os.getenv("DOCS_GITHUB_API_TOKEN", "")
    DOCS_REPO_OWNER: str = os.getenv("DOCS_REPO_OWNER", "makeplane")
    DOCS_REPO_NAME: str = os.getenv("DOCS_REPO_NAME", "docs,developer-docs")
    DOCS_URL_BASE: str = os.getenv("DOCS_URL_BASE", "https://docs.plane.so")
    DEVELOPER_DOCS_URL_BASE: str = os.getenv("DEVELOPER_DOCS_URL_BASE", "https://developers.plane.so")

    # OpenSearch Configuration
    OPENSEARCH_URL: str = os.getenv("OPENSEARCH_URL", "")
    OPENSEARCH_USER: str = os.getenv("OPENSEARCH_USER", "")
    OPENSEARCH_PASSWORD: str = os.getenv("OPENSEARCH_PASSWORD", "")

    # Model Configuration
    ML_MODEL_ID: str = os.getenv("OPENSEARCH_ML_MODEL_ID", "")
    ML_CONNECTOR_NAME: str = "cohere_azure_foundry_connector"  # unused
    ML_MODEL_NAME: str = "cohere_4_azure"  # unused

    EMBEDDING_MODEL_ID: str = "embed-v-4-0"  # unused
    EMBEDDING_DIMENSION: int = 1536  # unused
    EMBEDDING_MODEL_API_VERSION: str = "2024-05-01-preview"  # unused

    @staticmethod
    def generate_index_name(suffix: str) -> str:
        prefix = os.getenv("OPENSEARCH_INDEX_PREFIX", "")
        if prefix:
            # Remove trailing underscores from prefix to avoid double underscores
            prefix = prefix.rstrip("_")
            return f"{prefix}_{suffix}"
        else:
            return suffix

    # Index Configuration
    ISSUE_INDEX: str = generate_index_name("issues")
    PAGES_INDEX: str = generate_index_name("pages")
    MODULES_INDEX: str = generate_index_name("modules")
    CYCLES_INDEX: str = generate_index_name("cycles")
    PROJECTS_INDEX: str = generate_index_name("projects")
    COMMENTS_INDEX: str = generate_index_name("issue_comments")
    DOCS_INDEX: str = generate_index_name("docs_semantic")
    CHAT_SEARCH_INDEX: str = generate_index_name("pi_chat_messages")
    CACHE_INDEX: str = generate_index_name("rewritten_query_cache")
    CACHE_THRESHOLD: float = float(os.getenv("CACHE_THRESHOLD", "0.9"))

    # Ingest Pipeline Configuration
    DOCS_PIPELINE_NAME: str = "docs-embedding-pipeline"

    # Duplicate Detection Configuration
    DUPES_EMBED_CUTOFF: float = 0.75

    # Vector Search Configuration
    ISSUE_VECTOR_SEARCH_CUTOFF: float = 0.75
    PAGE_VECTOR_SEARCH_CUTOFF: float = 0.69
    DOC_VECTOR_SEARCH_CUTOFF: float = 0.69

    # KNN Configuration
    KNN_TOP_K: int = 50

    # Live Sync Configuration
    LIVE_SYNC_BATCH: int = get_env_int("LIVE_SYNC_BATCH", "1000")


@dataclass
class LLMModels:
    """Available language models for use in the application."""

    GPT_4O: str = "gpt-4o"
    GPT_4_1: str = "gpt-4.1"
    GPT_4_1_NANO: str = "gpt-4.1-nano"
    GPT_4O_MINI: str = "gpt-4o-mini"
    LITE_LLM_CLAUDE_SONNET_4: str = "us.anthropic.claude-sonnet-4-20250514-v1:0"
    GPT_5_STANDARD: str = "gpt-5-standard"
    GPT_5_FAST: str = "gpt-5-fast"
    GPT_5_1: str = "gpt-5.1"
    GPT_5_2: str = "gpt-5.2"
    DEFAULT: str = GPT_5_2
    CLAUDE_SONNET_4_0: str = "claude-sonnet-4-0"
    CLAUDE_SONNET_4_5: str = "claude-sonnet-4-5"


@dataclass
class LLMConfig:
    """Configuration for various language model APIs and settings."""

    OPENAI_API_KEY: str = field(default_factory=lambda: os.getenv("OPENAI_API_KEY", ""))
    CLAUDE_API_KEY: str = field(default_factory=lambda: os.getenv("CLAUDE_API_KEY", ""))
    CLAUDE_BASE_URL: str = field(default_factory=lambda: os.getenv("CLAUDE_BASE_URL", "https://api.anthropic.com"))
    R1_URL_HOST: str = field(default_factory=lambda: os.getenv("R1_URL_HOST", "http://35.239.241.155:8000/v1"))
    R1_MODEL_NAME: str = field(default_factory=lambda: os.getenv("R1_MODEL_NAME", "deepseek-ai/DeepSeek-R1-Distill-Llama-8B"))
    TESTED_FOR_WORKSPACE: list = field(
        default_factory=lambda: [
            LLMModels.GPT_4_1,
            LLMModels.GPT_5_STANDARD,
            LLMModels.GPT_5_FAST,
            LLMModels.GPT_5_1,
            LLMModels.GPT_5_2,
            LLMModels.CLAUDE_SONNET_4_0,
            LLMModels.CLAUDE_SONNET_4_5,
            LLMModels.LITE_LLM_CLAUDE_SONNET_4,
        ]
    )
    CONTEXT_OFF_TEMPERATURE: float = 0.6
    OPENAI_RANDOM_SEED: int = 314
    LITE_LLM_HOST: str = field(default_factory=lambda: os.getenv("LITE_LLM_HOST", ""))
    LITE_LLM_API_KEY: str = field(default_factory=lambda: os.getenv("LITE_LLM_API_KEY", ""))
    ENABLE_MODEL_VERIFICATION_LOGGING: bool = (
        False  # field(default_factory=lambda: os.getenv("ENABLE_MODEL_VERIFICATION_LOGGING", "false").lower() == "true")
    )
    # GPT-5 specific configuration
    GPT5_USE_RESPONSES_API: bool = field(default_factory=lambda: os.getenv("GPT5_USE_RESPONSES_API", "false").lower() == "true")

    # SQL Agent timeout configuration
    # Timeout in seconds for SQL table selection LLM calls
    # If a call exceeds this time, it will retry with a fallback model (GPT-4o)
    SQL_TABLE_SELECTION_TIMEOUT: float = 5.0


@dataclass
class Chat:
    """Configuration for chat-related functionality."""

    NUM_SIMILAR_DOCS: int = 10
    MAX_CHAT_LENGTH: int = 10
    CHUNKS_BEFORE_TITLE_GEN: int = 20
    MENTION_TAGS: dict = field(
        default_factory=lambda: {
            "issues": "issue",
            "pages": "page",
            "cycles": "cycle",
            "modules": "module",
            "projects": "project",
            "users": "user",
            "workitems": "workitem",
            "epics": "epic",
            "labels": "label",
            "states": "state",
            "issue_views": "issue_view",
            "teams": "teamspace",
            "initiatives": "initiative",
        },
    )
    MAX_TOOL_CALLS_PER_AGENT_RUN: int = 5
    MAX_ACTION_EXECUTOR_ITERATIONS: int = 25


@dataclass
class Transcription:
    """Configuration for transcription services and their pricing."""

    # AssemblyAI Configuration
    ASSEMBLYAI_API_KEY: str = os.getenv("ASSEMBLYAI_API_KEY", "")
    ASSEMBLYAI_MODEL_PRICING_PER_HOUR: dict = field(
        default_factory=lambda: {
            "universal": 0.27,
        }
    )

    # Deepgram Configuration
    DEEPGRAM_API_KEY: str = os.getenv("DEEPGRAM_API_KEY", "")
    DEEPGRAM_MODEL_PRICING_PER_HOUR: dict = field(
        default_factory=lambda: {
            "nova-3-general": 0.312,
        }
    )

    # Groq Whisper Configuration
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL_PRICING_PER_HOUR: dict = field(
        default_factory=lambda: {
            "whisper-large-v3": 0.111,
            "whisper-large-v3-turbo": 0.04,
        }
    )

    # Default Configuration
    DEFAULT_MODEL: str = "whisper-large-v3"
    DEFAULT_PROVIDER: str = "groq"


@dataclass
class Database:
    USER: Optional[str] = os.getenv("PLANE_PI_POSTGRES_USER", None)
    PASSWORD: Optional[str] = os.getenv("PLANE_PI_POSTGRES_PASSWORD", None)
    HOST: Optional[str] = os.getenv("PLANE_PI_POSTGRES_HOST", None)
    PORT: Optional[str] = os.getenv("PLANE_PI_POSTGRES_PORT", None)
    DB: Optional[str] = os.getenv("PLANE_PI_POSTGRES_DB", None)
    URL: Optional[str] = os.getenv("PLANE_PI_DATABASE_URL", None)

    # Connection pool settings for Celery workers
    CELERY_POOL_SIZE: int = get_env_int("CELERY_DB_POOL_SIZE", "20")
    CELERY_POOL_MAX_OVERFLOW: int = get_env_int("CELERY_DB_POOL_MAX_OVERFLOW", "30")
    CELERY_POOL_TIMEOUT: int = get_env_int("CELERY_DB_POOL_TIMEOUT", "10")
    CELERY_POOL_RECYCLE: int = get_env_int("CELERY_DB_POOL_RECYCLE", "3600")

    def connection_url(self) -> str:
        if self.URL:
            return self.URL
        return f"postgresql://{self.USER}:{self.PASSWORD}@{self.HOST}:{self.PORT}/{self.DB}"

    def async_connection_url(self) -> str:
        if self.URL:
            if "asyncpg" not in self.URL:
                return self.URL.replace("postgresql", "postgresql+asyncpg")
            return self.URL
        return f"postgresql+asyncpg://{self.USER}:{self.PASSWORD}@{self.HOST}:{self.PORT}/{self.DB}"


@dataclass
class Agents:
    prd_writer_name: str = "PRD_AGENT"  # 'connection_type' in workspace_connections table of plane database
    prd_writer_user_name: str = (
        "prd-agent_bot"  # 'username' in users table of plane database, append workspace_slug to the username <w_slug>_prd-agent_bot
    )
    prd_writer_client_id: str = os.getenv("PRD_WRITER_CLIENT_ID", "")
    prd_writer_client_secret: str = os.getenv("PRD_WRITER_CLIENT_SECRET", "")


@dataclass
class Celery:
    """Configuration for Celery background tasks."""

    DEFAULT_QUEUE: str = "plane_pi_queue"
    DEFAULT_EXCHANGE: str = "plane_pi_exchange"
    DEFAULT_ROUTING_KEY: str = "plane_pi"

    # Using RabbitMQ for both message brokering and result backend (RPC)
    # RPC backend uses RabbitMQ itself for results - no additional services needed
    BROKER_URL: str = os.getenv("CELERY_BROKER_URL", "pyamqp://guest@localhost:5672//")  # RabbitMQ default
    RESULT_BACKEND: str = os.getenv("CELERY_RESULT_BACKEND", "rpc://")  # RPC uses same RabbitMQ connection

    TASK_SERIALIZER: str = "json"
    RESULT_SERIALIZER: str = "json"
    ACCEPT_CONTENT: list = field(default_factory=lambda: ["json"])
    TIMEZONE: str = "UTC"
    ENABLE_UTC: bool = True

    # Vector sync specific settings
    VECTOR_SYNC_ENABLED: bool = get_env_bool("CELERY_VECTOR_SYNC_ENABLED", "1")
    VECTOR_SYNC_INTERVAL: int = get_env_int("CELERY_VECTOR_SYNC_INTERVAL", "30")  # seconds
    VECTOR_SYNC_MAX_RETRIES: int = get_env_int("CELERY_VECTOR_SYNC_MAX_RETRIES", "3")
    VECTOR_SYNC_RETRY_DELAY: int = get_env_int("CELERY_VECTOR_SYNC_RETRY_DELAY", "30")  # seconds

    # Workspace plan sync settings (Pro/Business management)
    WORKSPACE_PLAN_SYNC_ENABLED: bool = get_env_bool("CELERY_WORKSPACE_PLAN_SYNC_ENABLED", "1")
    WORKSPACE_PLAN_SYNC_INTERVAL: int = get_env_int("CELERY_WORKSPACE_PLAN_SYNC_INTERVAL", "86400")  # 24 hours


@dataclass
class Settings:
    """Main configuration class for the Plane AI project."""

    PROJECT_NAME: str = "Plane AI"
    PROJECT_VERSION: str = "1.0.3"
    DEBUG: bool = get_env_bool("DEBUG")

    cors_origins_raw: str = os.getenv("CORS_ALLOWED_ORIGINS", "")
    CORS_ALLOWED_ORIGINS = [origin.strip() for origin in cors_origins_raw.split(",") if origin.strip()]

    SENTRY_DSN: str | None = os.getenv("SENTRY_DSN")
    SENTRY_ENVIRONMENT: str = os.getenv("SENTRY_ENVIRONMENT", "development")

    ASSEMBLYAI_API_KEY: str = os.getenv("ASSEMBLYAI_API_KEY", "")
    ASSEMBLYAI_PRICING_PER_HOUR: float = 0.27  # $0.27 per hour for basic transcription

    # AWS Configuration for S3 attachments
    AWS_S3_BUCKET: str = os.getenv("AWS_S3_BUCKET", "")
    AWS_S3_REGION: str = os.getenv("AWS_S3_REGION", "us-east-2")
    AWS_ACCESS_KEY_ID: str = os.getenv("AWS_ACCESS_KEY_ID", "")
    AWS_SECRET_ACCESS_KEY: str = os.getenv("AWS_SECRET_ACCESS_KEY", "")
    FILE_SIZE_LIMIT: int = 10485760  # 10MB
    AWS_S3_ENV: str = os.getenv("AWS_S3_ENV", "")

    DEEPGRAM_API_KEY: str = os.getenv("DEEPGRAM_API_KEY", "")
    DEEPGRAM_PRICING_PER_HOUR: float = 0.312  # $0.312 per hour for Nova-3 multilingual

    DD_ENABLED: bool = get_env_bool("DD_ENABLED", "0")
    DD_ENV: str = os.getenv("DD_ENV", "dev")
    DD_SERVICE: str = os.getenv("DD_SERVICE", "plane-pi-api")
    DD_AGENT_HOST: str = os.getenv("DD_AGENT_HOST", "")
    DD_TRACE_SAMPLE_RATE: float = float(os.getenv("DD_TRACE_SAMPLE_RATE", "0.0") or "0.0")

    FEATURE_FLAG_SERVER_BASE_URL: str = os.getenv("FEATURE_FLAG_SERVER_BASE_URL", "http://localhost:8000")
    FEATURE_FLAG_SERVER_AUTH_TOKEN: str = os.getenv("FEATURE_FLAG_SERVER_AUTH_TOKEN", "")

    FOLLOWER_POSTGRES_URI: str = os.getenv("FOLLOWER_POSTGRES_URI", "")

    chat = Chat()
    server = Server()
    plane_api = PlaneAPI()
    vector_db = VectorDB()
    llm_model = LLMModels()
    llm_config = LLMConfig()
    feature_flags = FeatureFlags()
    transcription = Transcription()
    database = Database()
    agents = Agents()
    celery = Celery()

    # Class attribute for the configured logger
    _configured_logger: Optional[logging.Logger] = None

    @classmethod
    def setup_logger(cls):
        handler = colorlog.StreamHandler()

        # Suppress APScheduler logs below error
        colorlog.getLogger("apscheduler").setLevel(colorlog.ERROR)
        colorlog.getLogger("apscheduler.scheduler").setLevel(colorlog.ERROR)
        colorlog.getLogger("apscheduler").propagate = False

        # Suppress OpenSearch HTTP request logs
        colorlog.getLogger("opensearch").setLevel(colorlog.ERROR)  # Hide HTTP requests
        colorlog.getLogger("opensearchpy").setLevel(colorlog.WARNING)
        colorlog.getLogger("opensearchpy").propagate = False

        # Suppress OpenAI client debug logs
        colorlog.getLogger("openai").setLevel(colorlog.WARNING)
        colorlog.getLogger("openai._base_client").setLevel(colorlog.WARNING)
        colorlog.getLogger("httpx").setLevel(colorlog.WARNING)
        colorlog.getLogger("httpcore").setLevel(colorlog.WARNING)

        # Suppress boto3/botocore debug logs
        colorlog.getLogger("boto3").setLevel(colorlog.INFO)
        colorlog.getLogger("botocore").setLevel(colorlog.INFO)
        colorlog.getLogger("botocore.hooks").setLevel(colorlog.INFO)
        colorlog.getLogger("botocore.loaders").setLevel(colorlog.INFO)
        colorlog.getLogger("botocore.configprovider").setLevel(colorlog.INFO)
        colorlog.getLogger("botocore.endpoint").setLevel(colorlog.INFO)
        colorlog.getLogger("botocore.client").setLevel(colorlog.INFO)
        colorlog.getLogger("botocore.utils").setLevel(colorlog.INFO)

        # Suppress Datadog trace debug logs
        colorlog.getLogger("ddtrace").setLevel(colorlog.INFO)
        colorlog.getLogger("ddtrace.tracer").setLevel(colorlog.INFO)
        colorlog.getLogger("ddtrace.writer").setLevel(colorlog.INFO)
        colorlog.getLogger("ddtrace.internal").setLevel(colorlog.INFO)
        colorlog.getLogger("ddtrace.internal.module").setLevel(colorlog.INFO)
        colorlog.getLogger("ddtrace.internal.runtime").setLevel(colorlog.INFO)
        colorlog.getLogger("ddtrace.internal.runtime.container").setLevel(colorlog.INFO)
        colorlog.getLogger("ddtrace._trace.processor").setLevel(colorlog.INFO)
        colorlog.getLogger("ddtrace._trace.sampler").setLevel(colorlog.INFO)
        colorlog.getLogger("ddtrace.settings.endpoint_config").setLevel(colorlog.INFO)
        colorlog.getLogger("ddtrace.vendor.dogstatsd").setLevel(colorlog.INFO)
        colorlog.getLogger("datadog").setLevel(colorlog.INFO)
        colorlog.getLogger("datadog.dogstatsd").setLevel(colorlog.INFO)

        colorlog.getLogger("ddtrace.internal.telemetry").setLevel(colorlog.INFO)
        colorlog.getLogger("ddtrace.internal.telemetry.writer").setLevel(colorlog.INFO)

        from pythonjsonlogger.json import JsonFormatter

        json_formatter = JsonFormatter(fmt="%(asctime)s %(name)s %(levelname)s %(message)s", datefmt="%Y-%m-%d %H:%M:%S")
        handler.setFormatter(json_formatter)

        # Get the root logger and configure it
        root_logger = colorlog.getLogger()
        # Set logging level based on DEBUG environment variable
        debug_enabled = get_env_bool("DEBUG")
        log_level = logging.DEBUG if debug_enabled else logging.INFO
        root_logger.setLevel(log_level)
        root_logger.addHandler(handler)
        root_logger.propagate = True

        # Suppress noisy Celery internal loggers
        colorlog.getLogger("celery.utils.functional").setLevel(colorlog.WARNING)
        colorlog.getLogger("celery.worker.strategy").setLevel(colorlog.INFO)
        colorlog.getLogger("celery.app.trace").setLevel(colorlog.INFO)

        # Store the configured logger for consistent access
        cls._configured_logger = root_logger

        # Log the configuration for confirmation
        root_logger.info(f"Logging configured - DEBUG: {debug_enabled}, Level: {logging.getLevelName(log_level)}")

        return root_logger

    @classmethod
    def get_logger(cls, name):
        # Use the configured root logger if no name is provided
        if not name:
            return getattr(cls, "_configured_logger", colorlog.getLogger())
        return colorlog.getLogger(name)


settings = Settings()
settings.setup_logger()
logger = settings.get_logger("")
