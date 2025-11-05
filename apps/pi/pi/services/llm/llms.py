"""Language Model Factory and Configuration Module.

This module provides centralized LLM creation for the Plane AI application.
"""

from dataclasses import dataclass
from typing import Any
from typing import AsyncIterator
from typing import Dict
from typing import Iterator
from typing import Optional
from uuid import UUID

from langchain.schema.language_model import BaseLanguageModel
from langchain_core.runnables import Runnable
from langchain_core.runnables import RunnableConfig
from langchain_openai import ChatOpenAI
from pydantic import SecretStr
from sqlmodel.ext.asyncio.session import AsyncSession

from pi import logger
from pi import settings
from pi.app.models.enums import MessageMetaStepType

log = logger.getChild(__name__)


@dataclass
class LLMConfig:
    """Configuration for LLM instances."""

    model: str
    temperature: float = 0.2
    streaming: bool = False
    seed: Optional[int] = None
    max_completion_tokens: Optional[int] = None
    frequency_penalty: Optional[float] = None
    base_url: Optional[str] = None
    api_key: Optional[str] = None
    reasoning_effort: Optional[str] = None
    use_responses_api: Optional[bool] = None

    def __post_init__(self):
        if self.seed is None:
            self.seed = settings.llm_config.OPENAI_RANDOM_SEED


class TrackedLLM(Runnable):
    """Wrapper for LLMs that automatically tracks token usage."""

    def __init__(self, llm: Any, model_key: str):
        """Initialize TrackedLLM wrapper.

        Args:
            llm: The underlying LLM instance
            model_key: The model key (e.g., "gpt-4o", "gpt-4.1")
        """
        super().__init__()
        self._llm = llm
        self._model_key = model_key
        self._tracking_context: Optional[Dict[str, Any]] = None
        self.model_name = model_key  # For compatibility

    def set_tracking_context(self, message_id: UUID, db: AsyncSession, step_type: MessageMetaStepType, chat_id: Optional[str] = None) -> None:
        """Set token tracking context for subsequent LLM calls.

        Args:
            message_id: The message ID to associate with token usage
            db: Database session for storing token usage
            step_type: The type of step being performed
            chat_id: Optional chat ID for logging correlation
        """
        self._tracking_context = {"message_id": message_id, "db": db, "step_type": step_type, "chat_id": chat_id}

    def clear_tracking_context(self) -> None:
        """Clear the tracking context."""
        self._tracking_context = None

    async def _track_tokens(self, response: Any) -> None:
        """Track token usage if context is set."""
        if self._tracking_context:
            try:
                from pi.services.llm.token_tracker import TokenTracker

                tracker = TokenTracker(self._tracking_context["db"], self._tracking_context["message_id"])
                await tracker.track_llm_usage(response, self._model_key, self._tracking_context["step_type"])
            except Exception as e:
                log.warning(f"Failed to track token usage: {e}")

    # Delegate all BaseLanguageModel methods to the underlying LLM
    async def ainvoke(self, input: Any, config: Optional[RunnableConfig] = None, **kwargs: Any) -> Any:  # noqa: A002
        """Async invoke with automatic token tracking."""
        import time

        start_time = time.time()
        response = await self._llm.ainvoke(input, config, **kwargs)
        elapsed = time.time() - start_time
        chat_id = self._tracking_context.get("chat_id") if self._tracking_context else None
        step_type = self._tracking_context.get("step_type") if self._tracking_context else None
        chat_prefix = f"ChatID: {chat_id} - " if chat_id else ""
        step_suffix = f" ({step_type.value})" if step_type else ""
        log.info(f"{chat_prefix}LLM[{self._model_key}] ainvoke took {elapsed:.2f}s{step_suffix}")
        await self._track_tokens(response)
        return response

    def invoke(self, input: Any, config: Optional[RunnableConfig] = None, **kwargs: Any) -> Any:  # noqa: A002
        """Sync invoke - note: token tracking only works with async methods."""
        response = self._llm.invoke(input, config, **kwargs)
        # Can't track tokens in sync mode - would need async context
        if self._tracking_context:
            log.warning("Token tracking skipped in sync invoke - use ainvoke for tracking")
        return response

    async def astream(self, input: Any, config: Optional[RunnableConfig] = None, **kwargs: Optional[Any]) -> AsyncIterator[Any]:  # noqa: A002
        """Async stream with automatic token tracking."""
        import time

        start_time = time.time()
        chunks = []
        first_chunk_time = None
        chat_id = self._tracking_context.get("chat_id") if self._tracking_context else None
        step_type = self._tracking_context.get("step_type") if self._tracking_context else None
        chat_prefix = f"ChatID: {chat_id} - " if chat_id else ""
        step_suffix = f" ({step_type.value})" if step_type else ""

        async for chunk in self._llm.astream(input, config, **(kwargs or {})):
            if not chunk:  # covers None or falsy chunks
                log.warning(f"{chat_prefix}TrackedLLM[{self._model_key}]: Received an empty chunk " f"for input={getattr(input, "messages", input)}")
            else:
                if first_chunk_time is None:
                    first_chunk_time = time.time()
                    ttfc = first_chunk_time - start_time
                    log.info(f"{chat_prefix}LLM[{self._model_key}] astream TTFC: {ttfc:.2f}s{step_suffix}")
                chunks.append(chunk)
                yield chunk

        if not chunks:
            log.error(
                f"{chat_prefix}TrackedLLM[{self._model_key}]: Stream completed with no chunks " f"for input={getattr(input, "messages", input)}"
            )

        elapsed = time.time() - start_time
        log.info(f"{chat_prefix}LLM[{self._model_key}] astream total took {elapsed:.2f}s{step_suffix}")

        # Track aggregated chunks
        if chunks and self._tracking_context:
            try:
                # Aggregate chunks to get final usage metadata
                aggregate = None
                for chunk in chunks:
                    aggregate = chunk if aggregate is None else aggregate + chunk

                if aggregate and hasattr(aggregate, "usage_metadata") and aggregate.usage_metadata:
                    await self._track_tokens(aggregate)
            except Exception as e:
                log.warning(f"Failed to track streaming tokens: {e}")

    def stream(self, input: Any, config: Optional[RunnableConfig] = None, **kwargs: Optional[Any]) -> Iterator[Any]:  # noqa: A002
        """Sync stream - note: token tracking only works with async methods."""
        if self._tracking_context:
            log.warning("Token tracking skipped in sync stream - use astream for tracking")
        return self._llm.stream(input, config, **(kwargs or {}))

    # Pass through common attributes
    def __getattr__(self, name: str) -> Any:
        """Delegate attribute access to the underlying LLM."""
        return getattr(self._llm, name)

    @property
    def InputType(self):
        """Return the input type of the underlying LLM."""
        return getattr(self._llm, "InputType", Any)

    @property
    def OutputType(self):
        """Return the output type of the underlying LLM."""
        return getattr(self._llm, "OutputType", Any)

    def with_structured_output(self, *args, **kwargs) -> "TrackedLLM":
        """Return a new TrackedLLM with structured output."""
        structured_llm = self._llm.with_structured_output(*args, **kwargs)
        tracked_structured = TrackedLLM(structured_llm, self._model_key)
        # Preserve tracking context
        tracked_structured._tracking_context = self._tracking_context
        return tracked_structured

    def bind_tools(self, *args, **kwargs) -> "TrackedLLM":
        """Return a new TrackedLLM with tools bound."""
        # Use getattr to handle bind_tools since it's not on BaseLanguageModel interface
        if hasattr(self._llm, "bind_tools"):
            bound_llm = self._llm.bind_tools(*args, **kwargs)
        else:
            raise AttributeError(f"{self._llm.__class__.__name__} does not support bind_tools")
        tracked_bound = TrackedLLM(bound_llm, self._model_key)
        # Preserve tracking context
        tracked_bound._tracking_context = self._tracking_context
        return tracked_bound


def create_openai_llm(config: LLMConfig, track_tokens: bool = True, **overrides: Any) -> Any:
    """Create OpenAI chat model from config with optional token tracking.

    Args:
        config: LLM configuration
        track_tokens: Whether to wrap the LLM with token tracking (default: True)
        **overrides: Additional parameters to pass to ChatOpenAI

    Returns:
        TrackedLLM if track_tokens is True, otherwise ChatOpenAI
    """
    # Build parameters with explicit types
    api_key: str = config.api_key or SecretStr(settings.llm_config.OPENAI_API_KEY).get_secret_value()
    base_url: Optional[str] = config.base_url

    openai_params: Dict[str, Any] = {
        "api_key": api_key,
        "model": config.model,
        "temperature": config.temperature,
        "streaming": config.streaming,
        "base_url": base_url,
        **overrides,
    }

    # Only add seed parameter for non-Claude models (Claude doesn't support seed)
    if config.seed is not None and not config.model.startswith("anthropic."):
        openai_params["seed"] = config.seed

    # Add GPT-5 specific parameters
    if config.model == "gpt-5":
        # GPT-5 has limited parameter support - remove unsupported parameters
        openai_params.pop("temperature", None)  # Only supports default temperature (1.0)
        openai_params.pop("frequency_penalty", None)  # Not supported for gpt-5
        openai_params.pop("seed", None)  # Not supported with responses API
        if config.reasoning_effort is not None:
            openai_params["reasoning_effort"] = config.reasoning_effort
        if config.use_responses_api is not None:
            openai_params["use_responses_api"] = config.use_responses_api

    # Enable stream_usage for streaming models to get token usage metadata
    if config.streaming:
        openai_params["stream_usage"] = True

    llm = ChatOpenAI(**openai_params)

    if track_tokens:
        # Map LiteLLM model names and internal GPT-5 variants back to database-friendly model keys for token tracking
        litellm_to_db_mapping = {
            settings.llm_model.LITE_LLM_CLAUDE_SONNET_4: "claude-sonnet-4",
        }

        # Handle GPT-5 variants - we need to determine which variant based on reasoning_effort
        if config.model == "gpt-5":
            if config.reasoning_effort == "low":
                tracking_model_key = "gpt-5-fast"
            else:  # medium or any other reasoning effort maps to standard
                tracking_model_key = "gpt-5-standard"
        else:
            tracking_model_key = litellm_to_db_mapping.get(config.model, config.model)

        return TrackedLLM(llm, tracking_model_key)
    else:
        return llm


# Pre-configured LLM instances
_DEFAULT_CONFIGS = {
    "default": LLMConfig(model=settings.llm_model.GPT_4_1, temperature=0.2, streaming=False),
    "stream": LLMConfig(model=settings.llm_model.GPT_4_1, temperature=0.2, streaming=True),
    "decomposer": LLMConfig(model=settings.llm_model.GPT_4_1, temperature=0, streaming=False),
    "fast": LLMConfig(model=settings.llm_model.GPT_4O_MINI, temperature=0.2, streaming=False),
    "fast_stream": LLMConfig(model=settings.llm_model.GPT_4O_MINI, temperature=0.2, streaming=True),
    "gpt5_standard_default": LLMConfig(
        model="gpt-5",  # Use base GPT-5 model name for OpenAI API
        streaming=False,
        reasoning_effort="medium",
        use_responses_api=settings.llm_config.GPT5_USE_RESPONSES_API,  # Configurable via env var
    ),
    "gpt5_standard_stream": LLMConfig(
        model="gpt-5",  # Use base GPT-5 model name for OpenAI API
        streaming=True,
        reasoning_effort="medium",
        use_responses_api=settings.llm_config.GPT5_USE_RESPONSES_API,  # Configurable via env var
    ),
    "gpt5_fast_default": LLMConfig(
        model="gpt-5",  # Use base GPT-5 model name for OpenAI API
        streaming=False,
        reasoning_effort="low",
        use_responses_api=settings.llm_config.GPT5_USE_RESPONSES_API,  # Configurable via env var
    ),
    "gpt5_fast_stream": LLMConfig(
        model="gpt-5",  # Use base GPT-5 model name for OpenAI API
        streaming=True,
        reasoning_effort="low",
        use_responses_api=settings.llm_config.GPT5_USE_RESPONSES_API,  # Configurable via env var
    ),
}

# Anthropic configs
_ANTHROPIC_CONFIGS = {
    "claude-sonnet-4-0-default": LLMConfig(
        model=settings.llm_model.CLAUDE_SONNET_4_0,
        temperature=0.2,
        streaming=False,
        base_url=settings.llm_config.CLAUDE_BASE_URL,
        api_key=settings.llm_config.CLAUDE_API_KEY,
    ),
    "claude-sonnet-4-0-stream": LLMConfig(
        model=settings.llm_model.CLAUDE_SONNET_4_0,
        temperature=0.2,
        streaming=True,
        base_url=settings.llm_config.CLAUDE_BASE_URL,
        api_key=settings.llm_config.CLAUDE_API_KEY,
    ),
    "claude-sonnet-4-0-decomposer": LLMConfig(
        model=settings.llm_model.CLAUDE_SONNET_4_0,
        temperature=0.2,
        streaming=False,
        base_url=settings.llm_config.CLAUDE_BASE_URL,
        api_key=settings.llm_config.CLAUDE_API_KEY,
    ),
    "claude-sonnet-4-0-fast": LLMConfig(
        model=settings.llm_model.CLAUDE_SONNET_4_0,
        temperature=0.2,
        streaming=False,
        base_url=settings.llm_config.CLAUDE_BASE_URL,
        api_key=settings.llm_config.CLAUDE_API_KEY,
    ),
    "claude-sonnet-4-0-fast-stream": LLMConfig(
        model=settings.llm_model.CLAUDE_SONNET_4_0,
        temperature=0.2,
        streaming=True,
        base_url=settings.llm_config.CLAUDE_BASE_URL,
        api_key=settings.llm_config.CLAUDE_API_KEY,
    ),
}

# LiteLLM configs
_LITE_LLM_CONFIGS = {
    "claude-sonnet-4-default": LLMConfig(
        model=settings.llm_model.LITE_LLM_CLAUDE_SONNET_4,
        temperature=0.2,
        streaming=False,
        base_url=settings.llm_config.LITE_LLM_HOST,
        api_key=settings.llm_config.LITE_LLM_API_KEY,
    ),
    "claude-sonnet-4-stream": LLMConfig(
        model=settings.llm_model.LITE_LLM_CLAUDE_SONNET_4,
        temperature=0.2,
        streaming=True,
        base_url=settings.llm_config.LITE_LLM_HOST,
        api_key=settings.llm_config.LITE_LLM_API_KEY,
    ),
    "claude-sonnet-4-decomposer": LLMConfig(
        model=settings.llm_model.LITE_LLM_CLAUDE_SONNET_4,
        temperature=0.2,
        streaming=False,
        base_url=settings.llm_config.LITE_LLM_HOST,
        api_key=settings.llm_config.LITE_LLM_API_KEY,
    ),
    "claude-sonnet-4-fast": LLMConfig(
        model=settings.llm_model.LITE_LLM_CLAUDE_SONNET_4,
        temperature=0.2,
        streaming=False,
        base_url=settings.llm_config.LITE_LLM_HOST,
        api_key=settings.llm_config.LITE_LLM_API_KEY,
    ),
    "claude-sonnet-4-fast-stream": LLMConfig(
        model=settings.llm_model.LITE_LLM_CLAUDE_SONNET_4,
        temperature=0.2,
        streaming=True,
        base_url=settings.llm_config.LITE_LLM_HOST,
        api_key=settings.llm_config.LITE_LLM_API_KEY,
    ),
}


# Backward compatibility factory methods
class LLMFactory:
    @classmethod
    def get_default_llm(cls, model_name: Optional[str] = None) -> Any:
        if model_name in _ANTHROPIC_CONFIGS.keys():
            return create_openai_llm(_ANTHROPIC_CONFIGS[model_name])
        elif model_name in _LITE_LLM_CONFIGS.keys():
            return create_openai_llm(_LITE_LLM_CONFIGS[model_name])
        elif model_name in _DEFAULT_CONFIGS.keys():
            config = _DEFAULT_CONFIGS[model_name]
            return create_openai_llm(config)
        else:
            return create_openai_llm(_DEFAULT_CONFIGS["default"])

    @classmethod
    def get_stream_llm(cls, model_name: Optional[str] = None) -> Any:
        if model_name in _ANTHROPIC_CONFIGS.keys():
            return create_openai_llm(_ANTHROPIC_CONFIGS[model_name])
        elif model_name in _LITE_LLM_CONFIGS.keys():
            return create_openai_llm(_LITE_LLM_CONFIGS[model_name])
        elif model_name in _DEFAULT_CONFIGS.keys():
            config = _DEFAULT_CONFIGS[model_name]
            return create_openai_llm(config)
        else:
            return create_openai_llm(_DEFAULT_CONFIGS["stream"])

    @classmethod
    def get_decomposer_llm(cls, model_name: Optional[str] = None) -> Any:
        if model_name in _ANTHROPIC_CONFIGS.keys():
            return create_openai_llm(_ANTHROPIC_CONFIGS[model_name])
        elif model_name in _LITE_LLM_CONFIGS.keys():
            return create_openai_llm(_LITE_LLM_CONFIGS[model_name])
        elif model_name in _DEFAULT_CONFIGS.keys():
            config = _DEFAULT_CONFIGS[model_name]
            return create_openai_llm(config)
        else:
            return create_openai_llm(_DEFAULT_CONFIGS["decomposer"])

    @classmethod
    def get_fast_llm(cls, streaming: bool = False, model_name: Optional[str] = None) -> Any:
        if model_name in _ANTHROPIC_CONFIGS.keys():
            return create_openai_llm(_ANTHROPIC_CONFIGS[model_name])
        elif model_name in _LITE_LLM_CONFIGS.keys():
            return create_openai_llm(_LITE_LLM_CONFIGS[model_name])
        elif model_name in _DEFAULT_CONFIGS.keys():
            config = _DEFAULT_CONFIGS[model_name]
            return create_openai_llm(config)
        else:
            config_key = "fast_stream" if streaming else "fast"
            return create_openai_llm(_DEFAULT_CONFIGS[config_key])

    @classmethod
    def create_openai(cls, **kwargs: Any) -> Any:
        """Create OpenAI model with direct parameters."""
        track_tokens = kwargs.pop("track_tokens", True)
        config = LLMConfig(
            model=kwargs.pop("model", settings.llm_model.GPT_4O),
            temperature=kwargs.pop("temperature", 0.2),
            streaming=kwargs.pop("streaming", False),
            seed=kwargs.pop("seed", settings.llm_config.OPENAI_RANDOM_SEED),
        )
        return create_openai_llm(config, track_tokens=track_tokens, **kwargs)


def get_chat_llm(llm_name: str) -> Any:
    """Get chat LLM by name with fallback handling."""
    try:
        if llm_name.lower() == "gpt-4o":
            config = LLMConfig(model=settings.llm_model.GPT_4O, temperature=0.2, streaming=True)
        elif llm_name.lower() == "gpt-4.1":
            config = LLMConfig(model=settings.llm_model.GPT_4_1, temperature=0.2, streaming=True)
        elif llm_name.lower() == "gpt-5-standard":
            config = LLMConfig(
                model="gpt-5",  # Use base GPT-5 model name for OpenAI API
                streaming=True,
                reasoning_effort="medium",
                use_responses_api=settings.llm_config.GPT5_USE_RESPONSES_API,  # Configurable via env var
            )
        elif llm_name.lower() == "gpt-5-fast":
            config = LLMConfig(
                model="gpt-5",  # Use base GPT-5 model name for OpenAI API
                streaming=True,
                reasoning_effort="low",
                use_responses_api=settings.llm_config.GPT5_USE_RESPONSES_API,  # Configurable via env var
            )
        elif llm_name.lower() in ["claude-sonnet-4"]:
            config = LLMConfig(
                model=settings.llm_model.LITE_LLM_CLAUDE_SONNET_4,
                temperature=0.2,
                streaming=True,
                base_url=settings.llm_config.LITE_LLM_HOST,
                api_key=settings.llm_config.LITE_LLM_API_KEY,
            )
        elif llm_name.lower() == "claude-sonnet-4-0":
            config = LLMConfig(
                model=settings.llm_model.CLAUDE_SONNET_4_0,
                temperature=0.2,
                streaming=True,
                base_url=settings.llm_config.CLAUDE_BASE_URL,
                api_key=settings.llm_config.CLAUDE_API_KEY,
            )
        else:
            # Fallback to default (GPT-4.1)
            config = LLMConfig(model=settings.llm_model.GPT_4_1, temperature=0.2, streaming=True)

        return create_openai_llm(config)

    except Exception as e:
        log.error(f"Failed to create LLM client ({llm_name!r}): {e}")
        fallback_config = LLMConfig(model=settings.llm_model.GPT_4_1, temperature=0.2, streaming=True)
        return create_openai_llm(fallback_config)


def get_sql_agent_llm(operation_type: str, llm_model: str = settings.llm_model.GPT_4_1, reasoning_effort: Optional[str] = None) -> BaseLanguageModel:
    """Get specialized LLM for SQL agent operations."""
    try:
        model_map = {
            "table_selection": llm_model,
            "sql_generation": llm_model,
        }

        model = model_map.get(operation_type.lower(), llm_model)
        # Create a base config and pass SQL-specific parameters via overrides. This keeps the
        # specialised settings local to this helper without extending the generic LLMConfig.
        if model == "claude-sonnet-4":
            config = LLMConfig(
                model=settings.llm_model.LITE_LLM_CLAUDE_SONNET_4,
                temperature=0.2,
                streaming=False,
                base_url=settings.llm_config.LITE_LLM_HOST,
                api_key=settings.llm_config.LITE_LLM_API_KEY,
            )
            # Claude doesn't support frequency_penalty, so don't pass it
            return create_openai_llm(
                config,
                max_completion_tokens=4096,
            )
        elif model == "claude-sonnet-4-0":
            config = LLMConfig(
                model=settings.llm_model.CLAUDE_SONNET_4_0,
                temperature=0.2,
                streaming=False,
                base_url=settings.llm_config.CLAUDE_BASE_URL,
                api_key=settings.llm_config.CLAUDE_API_KEY,
            )
            return create_openai_llm(
                config,
                max_completion_tokens=4096,
            )
        elif model in ["gpt-5-standard", "gpt-5-fast"]:
            # GPT-5 doesn't support temperature or frequency_penalty
            # Don't use responses_api for SQL generation to avoid structured output formatting
            # Determine reasoning effort based on model variant
            if model == "gpt-5-standard":
                model_reasoning_effort = "medium"
            else:  # gpt-5-fast
                model_reasoning_effort = "low"

            config = LLMConfig(
                model="gpt-5",  # Use base GPT-5 model name for OpenAI API
                streaming=False,
                reasoning_effort=model_reasoning_effort,
                use_responses_api=False,  # Disabled for clean SQL output
            )
            # Increase max_completion_tokens for GPT-5 to handle reasoning tokens
            return create_openai_llm(
                config,
                max_completion_tokens=8192,  # Increased from 4096 to handle reasoning tokens
            )
        else:
            config = LLMConfig(model=model, temperature=0.2, streaming=False)
            return create_openai_llm(
                config,
                max_completion_tokens=4096,
                frequency_penalty=0.2,
            )

    except Exception as e:
        log.error(f"Failed to create SQL agent LLM for operation '{operation_type}': {e}")
        fallback_config = LLMConfig(model=settings.llm_model.GPT_4_1, temperature=0.2, streaming=False)
        return create_openai_llm(fallback_config)


def get_dupes_llm() -> BaseLanguageModel:
    """Get specialized LLM for duplicate detection using GPT-4.1 nano for speed and cost efficiency."""
    try:
        config = LLMConfig(model=settings.llm_model.GPT_4_1_NANO, temperature=0.0, streaming=False)
        return create_openai_llm(config)

    except Exception as e:
        log.error(f"Failed to create dupes LLM: {e}")
        # Fallback to fast LLM if nano is not available
        fallback_config = LLMConfig(model=settings.llm_model.GPT_4O_MINI, temperature=0.0, streaming=False)
        return create_openai_llm(fallback_config)


# Global instances for backward compatibility
llm = LLMFactory.get_default_llm()
stream_llm = LLMFactory.get_stream_llm()
decomposer_llm = LLMFactory.get_decomposer_llm()
fast_llm = LLMFactory.get_fast_llm(streaming=False)
fast_llm_stream = LLMFactory.get_fast_llm(streaming=True)
