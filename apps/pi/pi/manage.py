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

# Python imports
# External imports
import asyncio
import os
import sys
import time

import typer
from alembic import command
from alembic.config import Config
from sqlalchemy import text
from sqlalchemy.exc import OperationalError

from pi import logger

# FastAPI imports removed - use pi.scripts.server for server operations
from pi.core.db.fixtures import sync_llm_pricing
from pi.core.db.fixtures import sync_llms

# Module imports
from pi.core.db.plane_pi.engine import sync_engine
from pi.core.db.plane_pi.lifecycle import get_async_session
from pi.core.db.plane_pi.lifecycle import init_async_db
from pi.services.retrievers.pg_store.model import add_llm_pricing_by_id
from pi.services.retrievers.pg_store.model import get_llm_model_id_from_key

log = logger.getChild(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = typer.Typer()


def get_alembic_config() -> Config:
    """Load Alembic configuration."""
    alembic_cfg = Config(os.path.join(BASE_DIR, "alembic.ini"))
    alembic_cfg.set_main_option("script_location", os.path.join(BASE_DIR, "alembic"))
    return alembic_cfg


@app.command("wait-for-db")
def wait_for_db(timeout: int = 60):
    """
    Wait until the database connection is available.
    This command will block until a connection can be opened successfully
    or until the timeout is reached.
    """

    log.info("Waiting for the database to be available...")
    start_time = time.time()

    while True:
        try:
            with sync_engine.connect() as connection:
                # Execute a simple query to test the connection.
                connection.execute(text("SELECT 1"))
            log.info("Database connection established!")
            return
        except OperationalError:
            if time.time() - start_time > timeout:
                log.error("Database connection timed out.")
                sys.exit(1)
            log.info("Database not available, retrying in 2 seconds...")
            time.sleep(2)
        except Exception as e:
            log.error(f"Unexpected error while connecting to the database: {e}")
            sys.exit(1)


@app.command("wait-for-migrations")
def wait_for_migrations():
    """
    Apply all pending migrations using alembic upgrade head.
    """
    log.info("Applying migrations (if there are any pending)...")
    try:
        alembic_cfg = get_alembic_config()
        command.upgrade(alembic_cfg, "head")
        log.info("Migrations applied successfully!")
    except Exception as e:
        log.error(f"Migration failed: {e}")
        sys.exit(1)


@app.command()
def makemigrations(message: str = "auto"):
    """
    Generate migration scripts.
    """
    alembic_cfg = get_alembic_config()
    log.info("Generating migration script...")
    command.revision(alembic_cfg, message=message, autogenerate=True)
    log.info(f"Migration script created with message: {message}")


@app.command()
def migrate(revision: str = "head"):
    """
    Apply migrations.
    """
    alembic_cfg = get_alembic_config()
    log.info("Applying migrations...")
    command.upgrade(alembic_cfg, revision)
    log.info("Migrations applied successfully!")


@app.command()
def alembic_current():
    """Show the current Alembic revision applied to the database."""
    alembic_cfg = get_alembic_config()
    command.current(alembic_cfg)


@app.command()
def alembic_history():
    """Show the Alembic migration history."""
    alembic_cfg = get_alembic_config()
    command.history(alembic_cfg)


@app.command()
def alembic_downgrade(revision: str = "-1"):
    """Downgrade to a previous Alembic revision (default: -1 for last one)."""
    alembic_cfg = get_alembic_config()
    command.downgrade(alembic_cfg, revision)


@app.command("bootstrap-db")
def bootstrap_db():
    """
    Bootstrap the database: wait for DB, apply migrations, and sync LLMs.
    """
    log.info("Starting database bootstrap process...")

    try:
        # Wait for database to be available
        wait_for_db()

        # Apply migrations
        wait_for_migrations()

        # Sync LLM data
        sync_llms_fixture()

        log.info("Database bootstrap completed successfully!")
        sys.exit(0)

    except SystemExit as e:
        if e.code != 0:
            log.error(f"Bootstrap failed with exit code: {e.code}")
            sys.exit(1)
        else:
            # Re-raise the successful exit
            raise

    except Exception as e:
        log.error(f"Bootstrap failed with unexpected error: {e}")
        sys.exit(1)


# fixtures
@app.command("sync-llms")
def sync_llms_fixture():
    """Sync the LLMs table with fixture data."""

    async def run():
        await init_async_db()
        await sync_llms()

    asyncio.run(run())


@app.command("sync-llm-pricing")
def sync_llm_pricing_fixture():
    """Sync the LLM pricing table with fixture data."""

    async def run():
        await init_async_db()
        await sync_llm_pricing()

    asyncio.run(run())


@app.command()
def runserver():
    """Run the FastAPI server"""
    try:
        from pi.app.main import run_server

        run_server()
    except Exception as e:
        log.error(f"Error: {e}")
        log.error("Please use: python -m pi.scripts.server runserver")


@app.command()
def start_application():
    """Wait for the database, apply migrations, sync LLMs, and start the server"""

    # For backward compatibility, still try to run
    try:
        wait_for_db()
        wait_for_migrations()
        sync_llms_fixture()

        from pi.app.main import run_server

        run_server()
    except Exception as e:
        log.error(f"Error: {e}")
        log.error("Please use: python -m pi.scripts.server start-application")


# Celery commands
@app.command("celery-worker")
def run_celery_worker(
    concurrency: int = typer.Option(2, "--concurrency", "-c", help="Number of concurrent worker processes"),
    queue: str = typer.Option("celery", "--queue", "-Q", help="Queue to consume from"),
    loglevel: str = typer.Option("info", "--loglevel", "-l", help="Log level (debug, info, warning, error)"),
):
    """Run Celery worker for background tasks."""
    import subprocess
    import sys

    cmd = [
        sys.executable,
        "-m",
        "celery",
        "-A",
        "pi.celery_app.celery_app",
        "worker",
        "--concurrency",
        str(concurrency),
        "--queues",
        queue,
        "--loglevel",
        loglevel,
        "--without-heartbeat",
        "--without-gossip",
    ]

    typer.echo(f'Starting Celery worker with command: {" ".join(cmd)}')
    subprocess.run(cmd)


@app.command("celery-beat")
def run_celery_beat(
    loglevel: str = typer.Option("info", "--loglevel", "-l", help="Log level (debug, info, warning, error)"),
    schedule_file: str = typer.Option("celerybeat-schedule", "--schedule", "-s", help="Path to schedule database file"),
):
    """Run Celery Beat scheduler for periodic tasks."""
    import subprocess
    import sys

    cmd = [
        sys.executable,
        "-m",
        "celery",
        "-A",
        "pi.celery_app.celery_app",
        "beat",
        "--loglevel",
        loglevel,
        "--schedule",
        schedule_file,
    ]

    typer.echo(f'Starting Celery Beat with command: {" ".join(cmd)}')
    subprocess.run(cmd)


@app.command("celery-flower")
def run_celery_flower(
    port: int = typer.Option(5555, "--port", "-p", help="Port to run Flower on"),
    address: str = typer.Option("0.0.0.0", "--address", "-a", help="Address to bind to"),
):
    """Run Celery Flower for monitoring tasks."""
    import subprocess
    import sys

    cmd = [
        sys.executable,
        "-m",
        "celery",
        "-A",
        "pi.celery_app.celery_app",
        "flower",
        "--port",
        str(port),
        "--address",
        address,
    ]

    typer.echo(f'Starting Celery Flower with command: {" ".join(cmd)}')
    typer.echo(f"Flower will be available at http://{address}:{port}")
    subprocess.run(cmd)


@app.command("test-vector-sync")
def test_vector_sync():
    """Test the vector processing task manually."""
    from pi.celery_app import trigger_live_sync

    typer.echo("Running vector processing task...")
    try:
        result = trigger_live_sync.delay()
        typer.echo(f"Task submitted with ID: {result.id}")
        typer.echo("Check Celery worker logs for task execution details.")
    except Exception as e:
        typer.echo(f"Error submitting task: {e}")


# Legacy sync command (deprecated)
@app.command()
def sync():
    """Run the live sync (DEPRECATED - use Celery instead)"""
    typer.echo("⚠️  DEPRECATED: This command is deprecated.")
    typer.echo("Live sync is now handled by Celery workers.")
    typer.echo("Use the following commands instead:")
    typer.echo("  python manage.py celery-worker  # Start worker")
    typer.echo("  python manage.py celery-beat    # Start scheduler")
    typer.echo("  python manage.py test-vector-sync  # Test task manually")


@app.command("add-llm-pricing")
def add_llm_pricing_command(
    model_key: str = typer.Option(..., "--model-key", "-m", help="The model key from the llm_models table"),
    text_input_price: float = typer.Option(None, "--text-input-price", "--inp", help="Text input price (USD per 1M tokens)"),
    text_output_price: float = typer.Option(None, "--text-output-price", "--out", help="Text output price (USD per 1M tokens)"),
    cached_text_input_price: float = typer.Option(None, "--cached-text-input-price", "--cached", help="Cached text input price (USD per 1M tokens)"),
):
    """
    Add LLM pricing data for a specific model.
    At least one pricing option must be provided.

    Example usage:
    python manage.py add-llm-pricing --model-key gpt-4o --text-input-price 0.50 --text-output-price 1.00 --cached-text-input-price 0.25
    python manage.py add-llm-pricing -m gpt-4o-mini --inp 0.15 --out 0.60 --cached 0.075
    python manage.py add-llm-pricing -m gpt-4o --inp 2.50 --cached 1.25
    """

    if all(p is None for p in (text_input_price, text_output_price, cached_text_input_price)):
        typer.echo("Error: At least one pricing option must be provided...")
        raise typer.Exit(code=1)

    async def run():
        await init_async_db()

        async for session in get_async_session():
            # First get the model ID using existing function
            model_id = await get_llm_model_id_from_key(model_key, session)

            if not model_id:
                typer.echo(f"No model found with key '{model_key}'")
                raise typer.Exit(code=1)

            # Then add pricing using the model ID
            success, message = await add_llm_pricing_by_id(
                llm_model_id=model_id,
                db=session,
                text_input_price=text_input_price,
                text_output_price=text_output_price,
                cached_text_input_price=cached_text_input_price,
            )

            if success:
                typer.echo(f"Added pricing for '{model_key}':")
                if text_input_price is not None:
                    typer.echo(f"Text Input Price: ${text_input_price}/1M tokens")
                if text_output_price is not None:
                    typer.echo(f"Text Output Price: ${text_output_price}/1M tokens")
                if cached_text_input_price is not None:
                    typer.echo(f"Cached Text Input Price: ${cached_text_input_price}/1M tokens")
            else:
                typer.echo(message)
                raise typer.Exit(code=1)

    asyncio.run(run())


if __name__ == "__main__":
    app()
