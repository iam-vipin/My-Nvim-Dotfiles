import asyncio
import logging
from functools import wraps
from typing import Any
from typing import Callable
from typing import Optional
from typing import TypeVar
from typing import Union

from langchain_core.exceptions import LangChainException
from openai import APIConnectionError
from openai import APITimeoutError
from openai import AuthenticationError
from openai import BadRequestError
from openai import InternalServerError
from openai import PermissionDeniedError
from openai import RateLimitError
from openai import UnprocessableEntityError

log = logging.getLogger(__name__)

T = TypeVar("T")
ReturnType = Union[T, str]


def llm_error_handler(
    fallback_message: str = "AI processing failed. Please try again later.",
    max_retries: int = 1,
    temp_increment: float = 0.1,
    max_temp: float = 1.0,
    enable_retry: bool = True,
    log_context: str = "",
):
    """
    Decorator for handling LLM API errors with intelligent retry logic.

    Args:
        fallback_message: Message to return on failure
        max_retries: Maximum number of retry attempts
        temp_increment: Temperature increment for retries
        max_temp: Maximum temperature allowed
        enable_retry: Whether to enable retry logic
        log_context: Additional context for logging
    """

    def decorator(func: Callable[..., Any]) -> Callable[..., Any]:
        @wraps(func)
        async def async_wrapper(*args, **kwargs) -> Any:
            last_exception: Optional[Exception] = None
            base_temp = kwargs.get("temperature", 0.0)

            for attempt in range(max_retries + 1):
                try:
                    return await func(*args, **kwargs)

                except BadRequestError as e:
                    # Context length or other bad request errors
                    if "maximum context length" in str(e).lower() or "context_length_exceeded" in str(e).lower():
                        if attempt < max_retries and enable_retry:
                            log.warning(f"{log_context} Context length exceeded, retrying {func.__name__} (attempt {attempt + 1})")
                            # Increase temperature for retry
                            new_temp = min(base_temp + (temp_increment * (attempt + 1)), max_temp)
                            kwargs["temperature"] = new_temp
                            await asyncio.sleep(2**attempt)  # Exponential backoff
                            continue

                    log.error(f"{log_context} Bad request error in {func.__name__}: {e}")
                    last_exception = e
                    break

                except RateLimitError as e:
                    if attempt < max_retries and enable_retry:
                        wait_time = 2**attempt
                        log.warning(f"{log_context} Rate limit hit, retrying {func.__name__} in {wait_time}s (attempt {attempt + 1})")
                        await asyncio.sleep(wait_time)
                        continue

                    log.error(f"{log_context} Rate limit exceeded in {func.__name__}: {e}")
                    last_exception = e
                    break

                except APITimeoutError as e:
                    if attempt < max_retries and enable_retry:
                        wait_time = 2**attempt
                        log.warning(f"{log_context} API timeout, retrying {func.__name__} in {wait_time}s (attempt {attempt + 1})")
                        await asyncio.sleep(wait_time)
                        continue

                    log.error(f"{log_context} API timeout in {func.__name__}: {e}")
                    last_exception = e
                    break

                except APIConnectionError as e:
                    if attempt < max_retries and enable_retry:
                        wait_time = 2**attempt
                        log.warning(f"{log_context} Connection error, retrying {func.__name__} in {wait_time}s (attempt {attempt + 1})")
                        await asyncio.sleep(wait_time)
                        continue

                    log.error(f"{log_context} API connection error in {func.__name__}: {e}")
                    last_exception = e
                    break

                except AuthenticationError as e:
                    log.error(f"{log_context} Authentication error in {func.__name__}: {e}")
                    last_exception = e
                    break

                except PermissionDeniedError as e:
                    log.error(f"{log_context} Permission denied in {func.__name__}: {e}")
                    last_exception = e
                    break

                except UnprocessableEntityError as e:
                    log.error(f"{log_context} Unprocessable entity error in {func.__name__}: {e}")
                    last_exception = e
                    break

                except InternalServerError as e:
                    if attempt < max_retries and enable_retry:
                        wait_time = 2**attempt
                        log.warning(f"{log_context} Internal server error, retrying {func.__name__} in {wait_time}s (attempt {attempt + 1})")
                        await asyncio.sleep(wait_time)
                        continue

                    log.error(f"{log_context} Internal server error in {func.__name__}: {e}")
                    last_exception = e
                    break

                except LangChainException as e:
                    log.error(f"{log_context} LangChain error in {func.__name__}: {e}")
                    last_exception = e
                    break

                except Exception as e:
                    log.error(f"{log_context} Unexpected error in {func.__name__}: {e}", exc_info=True)
                    last_exception = e
                    break

            # If we get here, all retries failed
            log.error(f"{log_context} All retry attempts failed for {func.__name__}. Last error: {last_exception}")
            return fallback_message

        @wraps(func)
        def sync_wrapper(*args, **kwargs) -> Any:
            try:
                return func(*args, **kwargs)

            except BadRequestError as e:
                log.error(f"{log_context} Bad request error in {func.__name__}: {e}")
                return fallback_message

            except RateLimitError as e:
                log.error(f"{log_context} Rate limit exceeded in {func.__name__}: {e}")
                return fallback_message

            except APITimeoutError as e:
                log.error(f"{log_context} API timeout in {func.__name__}: {e}")
                return fallback_message

            except APIConnectionError as e:
                log.error(f"{log_context} API connection error in {func.__name__}: {e}")
                return fallback_message

            except AuthenticationError as e:
                log.error(f"{log_context} Authentication error in {func.__name__}: {e}")
                return fallback_message

            except PermissionDeniedError as e:
                log.error(f"{log_context} Permission denied in {func.__name__}: {e}")
                return fallback_message

            except UnprocessableEntityError as e:
                log.error(f"{log_context} Unprocessable entity error in {func.__name__}: {e}")
                return fallback_message

            except InternalServerError as e:
                log.error(f"{log_context} Internal server error in {func.__name__}: {e}")
                return fallback_message

            except LangChainException as e:
                log.error(f"{log_context} LangChain error in {func.__name__}: {e}")
                return fallback_message

            except Exception as e:
                log.error(f"{log_context} Unexpected error in {func.__name__}: {e}", exc_info=True)
                return fallback_message

        # Return appropriate wrapper based on whether the function is async
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        else:
            return sync_wrapper

    return decorator


def streaming_error_handler(log_context: str = ""):
    """
    Context manager for handling streaming LLM errors.
    """

    class StreamingErrorContext:
        def __init__(self, context: str):
            self.context = context
            self.chunks: list[Any] = []

        async def __aenter__(self):
            return self

        async def __aexit__(self, exc_type, exc_val, exc_tb):
            if exc_type is not None:
                log.error(f"{self.context} Error during streaming: {exc_val}", exc_info=True)
                return True  # Suppress the exception
            return False

        def add_chunk(self, chunk):
            self.chunks.append(chunk)

        def get_chunks(self):
            return self.chunks

    return StreamingErrorContext(log_context)
