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

"""Transcription services module."""

import time
from typing import Any
from typing import Dict
from typing import Tuple

import assemblyai as aai
from deepgram import DeepgramClient
from deepgram import FileSource
from deepgram import PrerecordedOptions
from fastapi import HTTPException
from fastapi import UploadFile
from groq import Groq
from pydantic import UUID4
from sqlmodel.ext.asyncio.session import AsyncSession

from pi import logger
from pi.config import settings
from pi.services.retrievers.pg_store.transcription import create_transcription

log = logger.getChild(__name__)


def calculate_transcription_cost(audio_duration: float, provider: str, model: str) -> float:
    """Calculate transcription cost based on audio duration and provider.

    Args:
        audio_duration: Duration in seconds
        provider: Provider name ('deepgram', 'groq', 'assemblyai')
        model: Specific model name for provider-specific pricing

    Returns:
        Cost in USD
    """
    hours = audio_duration / 3600

    if provider == "deepgram":
        return hours * settings.transcription.DEEPGRAM_MODEL_PRICING_PER_HOUR[model]
    elif provider == "groq":
        return hours * settings.transcription.GROQ_MODEL_PRICING_PER_HOUR[model]
    elif provider == "assemblyai":
        return hours * settings.transcription.ASSEMBLYAI_MODEL_PRICING_PER_HOUR[model]
    else:
        raise ValueError(f"Unknown provider: {provider}")


async def transcribe_with_deepgram(audio_content: bytes, model: str = "nova-3-general") -> Tuple[str, Dict[str, Any]]:
    """Transcribe audio using Deepgram.

    Args:
        audio_content: Raw audio file bytes
        model: Deepgram model to use

    Returns:
        Tuple of (transcript_text, metadata)
    """
    try:
        start_time = time.time()

        # Configure Deepgram client
        deepgram_client = DeepgramClient(api_key=settings.transcription.DEEPGRAM_API_KEY)

        # Prepare payload
        payload: FileSource = {
            "buffer": audio_content,
        }

        # Configure options
        options = PrerecordedOptions(model=model)

        # Call transcription
        response = deepgram_client.listen.rest.v("1").transcribe_file(payload, options)

        processing_time = time.time() - start_time

        # Extract results
        if not response.results or not response.results.channels or not response.results.channels[0].alternatives:
            raise HTTPException(status_code=500, detail="No transcription results returned from Deepgram")

        transcript_text = response.results.channels[0].alternatives[0].transcript

        metadata = {
            "transcription_id": response.metadata.request_id,
            "audio_duration": response.metadata.duration,
            "speech_model": model,
            "processing_time": processing_time,
            "provider": "deepgram",
            "cost": calculate_transcription_cost(response.metadata.duration, "deepgram", model),
        }

        return transcript_text, metadata

    except Exception as e:
        log.error(f"Deepgram transcription failed: {str(e)}")
        raise


async def transcribe_with_groq(audio_content: bytes, filename: str, model: str) -> Tuple[str, Dict[str, Any]]:
    """Transcribe audio using Groq Whisper.

    Args:
        audio_content: Raw audio file bytes
        filename: Original filename for proper format detection
        model: Groq model to use

    Returns:
        Tuple of (transcript_text, metadata)
    """
    try:
        start_time = time.time()

        # Configure Groq client
        client = Groq(api_key=settings.transcription.GROQ_API_KEY)

        # Create a temporary file-like object with proper filename
        import io

        audio_file = io.BytesIO(audio_content)
        audio_file.name = filename  # Use actual filename for proper format detection

        # Call transcription
        response = client.audio.transcriptions.create(file=audio_file, model=model, response_format="verbose_json")

        processing_time = time.time() - start_time

        # Extract transcript text
        transcript_text = response.text

        # Get actual audio duration from response
        # In verbose_json format, duration is available as an attribute
        audio_duration = getattr(response, "duration", 0.0)

        # Apply minimum billing of 10 seconds for Groq
        billable_duration = max(audio_duration, 10.0)

        metadata = {
            "transcription_id": response.x_groq.get("id", "unknown") if hasattr(response, "x_groq") else "unknown",
            "audio_duration": audio_duration,
            "speech_model": model,
            "processing_time": processing_time,
            "provider": "groq",
            "cost": calculate_transcription_cost(billable_duration, "groq", model),
        }

        return transcript_text, metadata

    except Exception as e:
        log.error(f"Groq transcription failed: {str(e)}")
        raise


async def transcribe_with_assemblyai(audio_content: bytes, model: str = "best") -> Tuple[str, Dict[str, Any]]:
    """Transcribe audio using AssemblyAI.

    Args:
        audio_content: Raw audio file bytes
        model: AssemblyAI model to use

    Returns:
        Tuple of (transcript_text, metadata)
    """
    try:
        start_time = time.time()

        # Configure AssemblyAI
        aai.settings.api_key = settings.transcription.ASSEMBLYAI_API_KEY

        # Create transcriber
        transcriber = aai.Transcriber()

        # Create a temporary file for AssemblyAI
        import tempfile

        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
            temp_file.write(audio_content)
            temp_file_path = temp_file.name

        try:
            # Transcribe
            transcript = transcriber.transcribe(temp_file_path)
            processing_time = time.time() - start_time

            if transcript.status == aai.TranscriptStatus.error:
                raise HTTPException(status_code=500, detail=f"AssemblyAI transcription failed: {transcript.error}")

            # Get audio duration (AssemblyAI provides this)
            audio_duration = transcript.audio_duration / 1000  # Convert from ms to seconds

            metadata = {
                "transcription_id": transcript.id,
                "audio_duration": audio_duration,
                "speech_model": model,
                "processing_time": processing_time,
                "provider": "assemblyai",
                "cost": calculate_transcription_cost(audio_duration, "assemblyai", model),
            }

            return transcript.text, metadata

        finally:
            # Clean up temp file
            import os

            os.unlink(temp_file_path)

    except Exception as e:
        log.error(f"AssemblyAI transcription failed: {str(e)}")
        raise


async def transcribe_audio(audio_content: bytes, filename: str, provider: str, model: str, **kwargs) -> Tuple[str, Dict[str, Any]]:
    """Main transcription function that routes to appropriate provider.

    Args:
        audio_content: Raw audio file bytes
        filename: Original filename for format detection
        provider: Provider to use ('groq', 'deepgram', 'assemblyai')
        model: Model to use (provider-specific)
        **kwargs: Additional provider-specific arguments

    Returns:
        Tuple of (transcript_text, metadata)
    """
    if provider == "groq":
        return await transcribe_with_groq(audio_content, filename, model)
    elif provider == "deepgram":
        return await transcribe_with_deepgram(audio_content, model)
    elif provider == "assemblyai":
        return await transcribe_with_assemblyai(audio_content, model)
    else:
        raise ValueError(f"Unknown transcription provider: {provider}")


async def process_transcription(
    workspace_id: UUID4,
    chat_id: UUID4,
    file: UploadFile,
    user_id: UUID4,
    db: AsyncSession,
) -> tuple[bool, str]:
    """Process audio file transcription and save to database.

    Args:
        workspace_id: UUID of the workspace
        chat_id: UUID of the chat
        file: Uploaded audio file
        user_id: UUID of the user
        db: Database session

    Returns:
        Tuple of (success: bool, message: str)
        If success is True, message contains the transcribed text
        If success is False, message contains the error message
    """
    try:
        # Basic validation
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")

        # Read file content
        content = await file.read()

        # Internal configuration - default to Groq v3 turbo
        provider = settings.transcription.DEFAULT_PROVIDER
        model = settings.transcription.DEFAULT_MODEL

        # Use the transcription service with explicit parameters
        transcript_text, metadata = await transcribe_audio(audio_content=content, filename=file.filename, provider=provider, model=model)

        # Save to database using the generic create_transcription function
        success, message = await create_transcription(
            transcript_text,
            metadata["transcription_id"],
            metadata["audio_duration"],
            metadata["speech_model"],
            metadata["processing_time"],
            user_id,
            workspace_id,
            chat_id,
            db,
            metadata["provider"],
            metadata["cost"],
        )

        if success:
            return True, transcript_text
        else:
            return False, message

    except HTTPException:
        raise
    except Exception as e:
        log.error(f"Transcription processing failed: {str(e)}")
        return False, str(e)
