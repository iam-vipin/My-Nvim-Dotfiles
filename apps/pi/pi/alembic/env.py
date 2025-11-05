"""Alembic environment configuration."""

# Python imports
from logging.config import fileConfig

from alembic import context

# External imports
from sqlalchemy import engine_from_config
from sqlalchemy import pool

from pi.app.models import Chat  # noqa: F401
from pi.app.models import Message  # noqa: F401
from pi.app.models import MessageFeedback  # noqa: F401
from pi.app.models import MessageFlowStep  # noqa: F401
from pi.app.models import MessageMeta  # noqa: F401
from pi.app.models import Transcription  # noqa: F401
from pi.app.models import WorkspaceVectorization  # noqa: F401
from pi.app.models.action_artifact import ActionArtifact  # noqa: F401
from pi.app.models.action_artifact import ActionArtifactVersion  # noqa: F401
from pi.app.models.base import BaseModel
from pi.app.models.oauth import PlaneOAuthState  # noqa: F401
from pi.app.models.oauth import PlaneOAuthToken  # noqa: F401

# Module imports
from pi.config import settings

config = context.config

# setting up the database url for Alembic to use
config.set_main_option("sqlalchemy.url", settings.database.connection_url())

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = BaseModel.metadata


# Exclude ell models
def include_object(obj, name, type_, reflected, compare_to):
    # Exclude tables that are not part of our application models
    if type_ == "table" and name.lower() in {
        "serializedevaluation",
        "serializedlmp",
        "evaluationlabeler",
        "invocation",
        "serializedevaluationrun",
        "serializedlmpuses",
        "evaluationresultdatapoint",
        "evaluationrunlabelersummary",
        "invocationcontents",
        "invocationtrace",
        "evaluationlabel",
    }:
        return False  # skip these tables
    return True


def run_migrations_offline() -> None:
    url = settings.database.connection_url()
    context.configure(
        url=url, include_object=include_object, target_metadata=target_metadata, literal_binds=True, dialect_opts={"paramstyle": "named"}
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    configuration = config.get_section(config.config_ini_section)
    if configuration:
        configuration["sqlalchemy.url"] = settings.database.connection_url()
        connectable = engine_from_config(configuration, prefix="sqlalchemy.", poolclass=pool.NullPool)
        with connectable.connect() as connection:
            context.configure(connection=connection, include_object=include_object, target_metadata=target_metadata)
            with context.begin_transaction():
                context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
