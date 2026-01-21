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

import asyncio
import sys
from copy import deepcopy

import typer
from opensearchpy import NotFoundError
from opensearchpy import RequestError

from pi import logger
from pi import settings
from pi.app.models.embedding_model import EmbeddingModel
from pi.core.db.plane_pi.lifecycle import get_async_session
from pi.core.db.plane_pi.lifecycle import init_async_db
from pi.core.vectordb.client import VectorStore
from pi.services.retrievers.pg_store import create_embedding_model as create_embedding_model_db
from pi.services.retrievers.pg_store import deactivate_embedding_model
from pi.services.retrievers.pg_store import get_active_embedding_model
from pi.services.retrievers.pg_store import get_all_active_embedding_models
from pi.services.retrievers.pg_store import get_ml_model_id_sync

log = logger.getChild(__name__)

app = typer.Typer()
ML_MODEL_ID = get_ml_model_id_sync()


def _build_cohere_connector_config(api_key: str, base_url: str = "") -> dict:
    """
    Build Cohere connector configuration.

    Args:
        api_key: Cohere API key
        base_url: Optional custom base URL for Cohere API (defaults to https://api.cohere.ai/v1/embed)

    Returns:
        dict: Connector configuration for self-hosted OpenSearch
    """
    # Ensure api_key is a plain string
    api_key_str = str(api_key).strip()

    # Use custom base URL if provided, otherwise use default Cohere API
    embed_url = f"{base_url.rstrip("/")}/embed" if base_url else "https://api.cohere.ai/v1/embed"

    # For self-hosted OpenSearch, we need to provide the credential field
    return {
        "name": "Cohere Embed Model",
        "description": "The connector to Cohere's public embed API",
        "version": "1",
        "protocol": "http",
        "credential": {
            "cohere_key": api_key_str,
        },
        "parameters": {
            "model": "embed-v4.0",
            "input_type": "search_document",
            "truncate": "END",
        },
        "actions": [
            {
                "action_type": "predict",
                "method": "POST",
                "url": embed_url,
                "headers": {
                    "Authorization": "Bearer ${credential.cohere_key}",
                    "Request-Source": "unspecified:opensearch",
                    "Content-Type": "application/json",
                },
                "request_body": '{ "texts": ${parameters.texts}, '
                '"truncate": "${parameters.truncate}", '
                '"model": "${parameters.model}", '
                '"input_type": "${parameters.input_type}" }',
                "pre_process_function": "connector.pre_process.cohere.embedding",
                "post_process_function": "connector.post_process.cohere.embedding",
            }
        ],
    }


def _build_model_registration_config(connector_id: str) -> dict:
    """
    Build ML model registration configuration.

    Args:
        connector_id: OpenSearch connector ID

    Returns:
        dict: Model registration configuration
    """
    return {
        "name": "cohere_4_0_embed",
        "function_name": "remote",
        "connector_id": connector_id,
        "description": "Cohere embed-v4.0 model",
    }


def _log_connector_payload(connector_config: dict) -> None:
    """
    Log the connector payload with the credential redacted so it can be
    copy–pasted into Dev Tools for debugging.
    """
    try:
        redacted = deepcopy(connector_config)

        # Redact API key from headers in actions
        for action in redacted.get("actions", []):
            headers = action.get("headers", {})
            if isinstance(headers, dict) and "Authorization" in headers:
                auth_value = str(headers["Authorization"])
                if auth_value.startswith("Bearer "):
                    key_len = len(auth_value) - 7  # subtract "Bearer " prefix
                    headers["Authorization"] = f"Bearer ***REDACTED (len={key_len})***"
    except Exception as e:
        log.warning("Failed to serialize connector payload for debug: %s", e)


@app.command("check-embedding-model")
def check_embedding_model(model_name: str = typer.Option("embed-v4.0", "--model-name", help="Model name to check for (e.g., 'embed-v4.0')")):
    """
    Check if embedding model is configured.

    This command checks:
    1. If OPENSEARCH_ML_MODEL_ID is set
    2. If active model exists in database and OpenSearch

    Example:
        python -m pi.manage check-embedding-model
        python -m pi.manage check-embedding-model --model-name embed-v4.0
    """

    async def run():
        try:
            await init_async_db()

            # Check if OPENSEARCH_ML_MODEL_ID is set
            ml_model_id = ML_MODEL_ID
            if ml_model_id and ml_model_id.strip():
                typer.echo(f"Model ID configured: {ml_model_id}")
                return

            typer.echo(f"Checking for active embedding models (model_name: {model_name})...")

            # Check for existing active models in database
            async for session in get_async_session():
                active_models = await get_all_active_embedding_models(session, model_name=model_name)

                if not active_models:
                    typer.echo(f"No active embedding models found for model_name: {model_name}")
                    return

                typer.echo(f"Found {len(active_models)} active model(s) in database")
                for model in active_models:
                    typer.echo(f"  - Model ID: {model.model_id}")

                break

        except Exception as e:
            log.error("Failed to check embedding model: %s", e, exc_info=True)
            typer.echo(f"Failed to check embedding model: {e}")
            sys.exit(1)

    asyncio.run(run())


@app.command("init-embedding-model")
def init_embedding_model(model_name: str = typer.Option("embed-v4.0", "--model-name", help="Model name to check for (e.g., 'embed-v4.0')")):
    """
    Check and ensure embedding model is configured for the application.

    This command checks in order:
    1. If OPENSEARCH_ML_MODEL_ID is set -> use it (do nothing)
    2. If active model exists in DB -> verify it exists in OpenSearch
    3. If COHERE_API_KEY is set -> auto-create model
    4. Otherwise -> exit with error

    This is meant to be run at application startup.
    """

    async def run():
        try:
            # Initialize database
            await init_async_db()

            # Step 1: Check if OPENSEARCH_ML_MODEL_ID is already set
            ml_model_id = ML_MODEL_ID
            if ml_model_id and ml_model_id.strip():
                log.info("OPENSEARCH_ML_MODEL_ID already set: %s", ml_model_id)
                typer.echo(f"Using configured model ID: {ml_model_id}")
                return

            log.info("OPENSEARCH_ML_MODEL_ID not set, checking for active embedding models in database...")
            log.info("Filtering by model_name: %s", model_name)

            # Step 2: Check for existing active models in database (with parallel validation)
            async for session in get_async_session():
                # Get ALL active models for this model_name (ordered by updated_at DESC)
                active_models = await get_all_active_embedding_models(session, model_name=model_name)

                if not active_models:
                    log.info("No active embedding models found in database for model_name=%s", model_name)
                    break

                log.info("Found %d active model(s) in database for model_name=%s", len(active_models), model_name)

                # Helper function to check a single model in OpenSearch
                async def check_model(model: EmbeddingModel) -> tuple[EmbeddingModel, bool, str]:
                    """
                    Check if a model exists in OpenSearch.
                    Returns: (model, exists, error_msg)
                    """
                    # Skip models without model_id
                    if not model.model_id:
                        return (model, False, "Model ID is not set")

                    try:
                        vs = VectorStore()
                        try:
                            model_status = vs.get_ml_model_status(model.model_id)
                            log.info("Model %s exists in OpenSearch with state: %s", model.model_id, model_status.get("model_state"))
                            return (model, True, "")
                        finally:
                            vs.os.close()
                    except (NotFoundError, RequestError) as e:
                        error_msg = str(e)
                        log.warning("Model %s not found in OpenSearch: %s", model.model_id, error_msg)
                        return (model, False, error_msg)
                    except Exception as e:
                        error_msg = str(e)
                        log.error("Error checking model %s in OpenSearch: %s", model.model_id, error_msg)
                        return (model, False, error_msg)

                # Check all models in parallel
                typer.echo(f"Checking {len(active_models)} model(s) in OpenSearch...")
                check_tasks = [check_model(model) for model in active_models]
                results = await asyncio.gather(*check_tasks)

                # Process results: find first valid model, deactivate invalid ones
                valid_model = None
                models_to_deactivate = []

                for model, exists, error_msg in results:
                    if exists:
                        if valid_model is None:
                            # Use the first valid model (already sorted by updated_at DESC)
                            valid_model = model
                            typer.echo(f"Model {model.model_id} verified in OpenSearch")
                            typer.echo(f"Provider: {model.provider}")
                            typer.echo(f"Model: {model.model_name}")
                        else:
                            # Multiple valid models exist, deactivate the older ones
                            log.info("Model %s is valid but not the newest, will deactivate", model.model_id)  # type: ignore[unreachable]
                            models_to_deactivate.append(model)
                    else:
                        # Model doesn't exist, mark for deactivation
                        typer.echo(f"⚠ Model {model.model_id} not found in OpenSearch")
                        models_to_deactivate.append(model)

                # Deactivate invalid/extra models in parallel
                if models_to_deactivate:
                    typer.echo(f"Deactivating {len(models_to_deactivate)} stale model(s)...")
                    deactivate_tasks = [deactivate_embedding_model(session, model.model_id) for model in models_to_deactivate if model.model_id]
                    await asyncio.gather(*deactivate_tasks)
                    log.info("Deactivated %d models", len(models_to_deactivate))

                # If we found a valid model, use it
                if valid_model and valid_model.model_id:
                    log.info(f"Using embedding model: {valid_model.model_id}")
                    return

            log.info("No valid embedding model found in OpenSearch, checking if we can auto-create one...")

            # Step 3: Check if we can auto-create a model
            api_key = settings.llm_config.COHERE_API_KEY
            if not api_key or not api_key.strip():
                log.error("Cannot setup embedding model: COHERE_API_KEY not configured")
                typer.echo("Error: No embedding model configured")
                typer.echo("OPENSEARCH_ML_MODEL_ID is not set")
                typer.echo("No active embedding model found in database")
                typer.echo("COHERE_API_KEY is not set (needed to auto-create model)")
                typer.echo("")
                typer.echo("Please either:")
                typer.echo("  1. Set OPENSEARCH_ML_MODEL_ID environment variable, OR")
                typer.echo("  2. Set COHERE_API_KEY and run: python -m pi.manage setup-embedding-model")
                sys.exit(1)

            # Step 4: Auto-create the model
            log.info("COHERE_API_KEY found, auto-creating embedding model...")
            typer.echo("Creating embedding model automatically...")

            # Call the setup function
            await _setup_embedding_model_internal()

        except Exception as e:
            log.error("Failed to ensure embedding model: %s", e, exc_info=True)
            typer.echo(f"Failed to ensure embedding model: {e}")
            sys.exit(1)

    asyncio.run(run())


async def _setup_embedding_model_internal():
    """Internal function to setup embedding model (shared by both commands)."""
    vector_store = None
    try:
        api_key = settings.llm_config.COHERE_API_KEY.strip()

        # Initialize VectorStore client
        vector_store = VectorStore()

        # Step 1: Configure ML Commons
        log.info("Configuring ML Commons...")
        try:
            _ = vector_store.configure_ml_commons(allow_non_ml_nodes=True)
        except Exception as e:
            log.error("Failed to configure ML Commons: %s", e, exc_info=True)
            typer.echo(f"Failed to configure ML Commons: {e}")
            sys.exit(1)
        log.info("ML Commons configured")

        # Step 2: Configure trusted endpoints
        log.info("Configuring trusted endpoints...")
        try:
            _ = vector_store.configure_trusted_endpoints(["^https://api\\.cohere\\.ai(/.*)?"])
        except Exception as e:
            log.error("Failed to configure trusted endpoints: %s", e, exc_info=True)
            typer.echo(f"Failed to configure trusted endpoints: {e}")
            sys.exit(1)
        log.info("Trusted endpoints configured")

        # Step 3: Create connector
        log.info("Creating connector...")
        cohere_base_url = settings.llm_config.COHERE_BASE_URL
        connector_config = _build_cohere_connector_config(api_key, cohere_base_url)

        # log.debug(
        #     "Connector config: name=%s, parameters=%s",
        #     connector_config["name"],
        #     list(connector_config.get("parameters", {}).keys()),
        # )
        _log_connector_payload(connector_config)

        try:
            connector_response = vector_store.create_ml_connector(connector_config)
            # log.debug("Create connector raw response: %s", connector_response)
        except Exception as e:
            log.error("Failed to create connector: %s", e, exc_info=True)
            typer.echo(f"Failed to create connector: {e}")
            sys.exit(1)

        connector_id = connector_response.get("connector_id")
        if not connector_id:
            log.error("No connector_id in response: %s", connector_response)
            typer.echo(f"No connector_id in response: {connector_response}")
            sys.exit(1)
        log.info("Connector created: %s", connector_id)

        # Step 4: Register model
        log.info("Registering model...")
        model_config = _build_model_registration_config(connector_id)
        # log.debug("Model registration payload: %s", model_config)

        try:
            model_response = vector_store.register_ml_model(model_config)
            # log.debug("Model register raw response: %s", model_response)
        except Exception as e:
            log.error("Failed to register model: %s", e, exc_info=True)
            typer.echo(f"Failed to register model: {e}")
            sys.exit(1)

        model_id = model_response.get("model_id")
        if not model_id:
            log.error("No model_id in response: %s", model_response)
            typer.echo(f"No model_id in response: {model_response}")
            sys.exit(1)
        log.info("Model registered: %s", model_id)

        # Step 5: Deploy model
        log.info("Deploying model...")
        try:
            _ = vector_store.deploy_ml_model(model_id)
        except Exception as e:
            log.error("Failed to deploy model: %s", e, exc_info=True)
            typer.echo(f"Failed to deploy model: {e}")
            sys.exit(1)

        log.info("Model deployment initiated: %s", model_id)

        # Step 6: Save to database
        log.info("Saving configuration to database...")
        async for session in get_async_session():
            saved_model = await create_embedding_model_db(
                db=session,
                provider="cohere",
                model_name="embed-v4.0",
                base_api_url="https://api.cohere.ai/v1/embed",
                connector_id=connector_id,
                model_id=model_id,
                deployment_status="deployed",
                is_active=True,
                dimension=1536,
            )
            if not saved_model:
                log.error("Failed to save model configuration to database")
                typer.echo("Failed to save model configuration to database")
                sys.exit(1)
        log.info("Configuration saved to database")

        log.info("SUCCESS! Embedding model setup complete.")
        log.info("OpenSearch Model ID: %s", model_id)
        log.info("Connector ID: %s", connector_id)

        typer.echo(f"Embedding model created successfully: {model_id}")

    finally:
        # Clean up VectorStore client
        if vector_store:
            vector_store.os.close()


@app.command("create-embedding-model")
def create_embedding_model():
    """
    Setup OpenSearch embedding model automatically.

    This command will:
    1. Check for COHERE_API_KEY environment variable
    2. Check for existing active model
    3. Configure ML Commons and trusted endpoints
    4. Create connector, register and deploy model
    5. Save configuration to database

    NOTE: No retry logic is used here to simplify debugging.
    """

    async def run():
        vector_store = None
        try:
            # Initialize database
            await init_async_db()

            # Step 1: Check API key
            log.info("Step 1/7: Checking COHERE_API_KEY...")
            api_key = settings.llm_config.COHERE_API_KEY
            if not api_key or not api_key.strip():
                log.error("COHERE_API_KEY not configured")
                typer.echo("Error: COHERE_API_KEY not configured")
                typer.echo("  Please set COHERE_API_KEY environment variable")
                sys.exit(1)
            api_key = api_key.strip()
            log.info(
                "COHERE_API_KEY found (length: %s)",
                len(api_key),
            )

            # Step 2: Check for existing active model
            log.info("Step 2/7: Checking for existing active model...")
            async for session in get_async_session():
                existing_model = await get_active_embedding_model(session)
                if existing_model:
                    log.info("Active model already exists with ID: %s", existing_model.model_id)
                    log.info("  Provider: %s", existing_model.provider)
                    log.info("  Model: %s", existing_model.model_name)
                    log.info("  Status: %s", existing_model.deployment_status)
                    log.info("  OpenSearch Model ID: %s", existing_model.model_id)
                    log.info("\nNo action needed. This model ID will be used for vectorization.")
                    return

            log.info("No active model found. Proceeding with setup...")

            # Initialize VectorStore client
            vector_store = VectorStore()

            # Step 3: Configure ML Commons
            log.info("Step 3/7: Configuring ML Commons...")
            try:
                _ = vector_store.configure_ml_commons(allow_non_ml_nodes=True)
            except Exception as e:
                log.error("Failed to configure ML Commons: %s", e, exc_info=True)
                typer.echo(f"Failed to configure ML Commons: {e}")
                sys.exit(1)
            log.info("ML Commons configured")

            # Step 4: Configure trusted endpoints
            log.info("Step 4/7: Configuring trusted endpoints...")
            try:
                _ = vector_store.configure_trusted_endpoints(["^https://api\\.cohere\\.ai(/.*)?"])
            except Exception as e:
                log.error("Failed to configure trusted endpoints: %s", e, exc_info=True)
                typer.echo(f"Failed to configure trusted endpoints: {e}")
                sys.exit(1)
            log.info("Trusted endpoints configured")

            # Step 5: Create connector
            log.info("Step 5/7: Creating connector...")
            connector_config = _build_cohere_connector_config(api_key)

            # log.debug(
            #     "Connector config: name=%s, parameters=%s",
            #     connector_config["name"],
            #     list(connector_config.get("parameters", {}).keys()),
            # )
            _log_connector_payload(connector_config)

            try:
                connector_response = vector_store.create_ml_connector(connector_config)
                # log.debug("Create connector raw response: %s", connector_response)
            except Exception as e:
                log.error("Failed to create connector: %s", e, exc_info=True)
                typer.echo(f"Failed to create connector: {e}")
                sys.exit(1)

            connector_id = connector_response.get("connector_id")
            if not connector_id:
                log.error("No connector_id in response: %s", connector_response)
                typer.echo(f"No connector_id in response: {connector_response}")
                sys.exit(1)
            log.info("Connector created: %s", connector_id)

            # Step 6: Register model
            log.info("Step 6/7: Registering model...")
            model_config = _build_model_registration_config(connector_id)
            # log.debug("Model registration payload: %s", model_config)

            try:
                model_response = vector_store.register_ml_model(model_config)
                # log.debug("Model register raw response: %s", model_response)
            except Exception as e:
                log.error("Failed to register model: %s", e, exc_info=True)
                typer.echo(f"Failed to register model: {e}")
                sys.exit(1)

            model_id = model_response.get("model_id")
            if not model_id:
                log.error("No model_id in response: %s", model_response)
                typer.echo(f"No model_id in response: {model_response}")
                sys.exit(1)
            log.info("Model registered: %s", model_id)

            # Step 7: Deploy model
            log.info("Step 7/7: Deploying model...")
            try:
                _ = vector_store.deploy_ml_model(model_id)
            except Exception as e:
                log.error("Failed to deploy model: %s", e, exc_info=True)
                typer.echo(f"Failed to deploy model: {e}")
                sys.exit(1)

            log.info("Model deployment initiated: %s", model_id)

            # Step 8: Save to database
            log.info("Saving configuration to database...")
            async for session in get_async_session():
                saved_model = await create_embedding_model_db(
                    db=session,
                    provider="cohere",
                    model_name="embed-v4.0",
                    base_api_url="https://api.cohere.ai/v1/embed",
                    connector_id=connector_id,
                    model_id=model_id,
                    deployment_status="deployed",
                    is_active=True,
                    dimension=1536,
                )
                if not saved_model:
                    log.error("Failed to save model configuration to database")
                    typer.echo("Failed to save model configuration to database")
                    sys.exit(1)
            log.info("Configuration saved to database")
            log.info("SUCCESS! Embedding model setup complete.")
            log.info("OpenSearch Model ID: %s", model_id)
            log.info("Connector ID: %s", connector_id)

        except Exception as e:
            log.error("\nUnexpected error during setup: %s", e, exc_info=True)
            typer.echo(f"\nUnexpected error during setup: {e}")
            sys.exit(1)
        finally:
            # Clean up VectorStore client
            if vector_store:
                vector_store.os.close()

    asyncio.run(run())


@app.command("validate-embedding-model")
def validate_embedding_model():
    """
    Validate embedding model ID configuration.

    This command checks if the embedding model ID is configured and valid
    by verifying it exists in OpenSearch and is properly deployed.

    Checks OPENSEARCH_ML_MODEL_ID environment variable first, then falls back to database.
    Tests actual embedding generation to ensure the model is working correctly.
    """
    from pi.services.llm.validators import validate_embedding_model_id
    from pi.services.retrievers.pg_store import get_ml_model_id_sync

    typer.echo("Validating embedding model configuration...")

    # Check environment variable first
    ml_model_id = get_ml_model_id_sync()
    if ml_model_id and ml_model_id.strip():
        typer.echo(f"Using OPENSEARCH_ML_MODEL_ID: {ml_model_id}")
    else:
        typer.echo("OPENSEARCH_ML_MODEL_ID not set, checking database...")

    # Validate the model
    is_valid, message = validate_embedding_model_id(model_id=ml_model_id or None)

    if is_valid:
        typer.echo(f"✅ {message}")
    else:
        typer.echo(f"❌ {message}")
        typer.echo("")
        typer.echo("To fix this issue:")
        typer.echo("  1. Set OPENSEARCH_ML_MODEL_ID environment variable, OR")
        typer.echo("  2. Create an embedding model: python -m pi.manage create-embedding-model")
        raise typer.Exit(code=1)
