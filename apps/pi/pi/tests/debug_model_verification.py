#!/usr/bin/env python3
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

"""
Debug script to test model verification functionality.

Run this script to verify that:
1. Claude Sonnet 4 model mapping is working correctly
2. Token tracking correctly identifies the actual model used
3. Response metadata contains the expected model information

Usage:
    python debug_model_verification.py
"""

import asyncio
import os
import sys

# Add the project root to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from pi import settings
from pi.services.llm.llms import LLMConfig
from pi.services.llm.llms import create_openai_llm
from pi.services.llm.token_tracker import TokenTracker


async def test_model_verification():
    """Test model verification for Claude Sonnet 4."""
    print("🔍 Testing Claude Sonnet 4 Model Verification")
    print("=" * 50)

    # Test Claude Sonnet 4 configuration
    claude_config = LLMConfig(
        model=settings.llm_model.LITE_LLM_CLAUDE_SONNET_4,  # "anthropic.claude-sonnet-4"
        temperature=0.2,
        streaming=False,
        base_url=settings.llm_config.LITE_LLM_HOST,
        api_key=settings.llm_config.LITE_LLM_API_KEY,
    )

    print("📋 Configuration:")
    print(f"   - Model for LiteLLM API: {claude_config.model}")
    print(f"   - Base URL: {claude_config.base_url}")
    print(f"   - Temperature: {claude_config.temperature}")
    print()

    # Create LLM with token tracking
    print("🔧 Creating LLM with token tracking...")
    llm = create_openai_llm(claude_config, track_tokens=True)
    print(f"   - TrackedLLM model key: {llm._model_key}")
    print(f"   - Underlying LLM model: {llm._llm.model_name}")
    print()

    # Test simple prompt
    test_prompt = "Hello! What model are you?"

    print("💬 Testing LLM call...")
    print(f"   - Prompt: {test_prompt}")

    try:
        response = await llm.ainvoke(test_prompt)
        print(f"   - Response: {response.content[:100]}...")
        print()

        # Test token tracker methods directly (without DB connection)
        print("🔍 Testing Model Verification:")

        # Extract actual model used (create temporary tracker instance just for method access)
        from unittest.mock import MagicMock

        mock_db = MagicMock()
        tracker = TokenTracker(db=mock_db)  # Using mock for testing - won't save to DB

        # Extract actual model used
        actual_model = tracker.extract_actual_model_used(response)
        print(f"   - Expected model key: {llm._model_key}")
        print(f"   - Actual model from response: {actual_model}")

        # Test token usage extraction
        token_usage = tracker.extract_token_usage(response)
        print(f"   - Token usage: {token_usage}")

        # Print response metadata for debugging
        print()
        print("📊 Full Response Metadata:")
        if hasattr(response, "response_metadata"):
            for key, value in response.response_metadata.items():
                print(f"   - {key}: {value}")
        else:
            print("   - No response_metadata found")

        print()
        if actual_model:
            if actual_model == llm._model_key:
                print("✅ SUCCESS: Model verification passed!")
            else:
                print("⚠️  WARNING: Model mismatch detected!")
                print(f"   Expected: {llm._model_key}")
                print(f"   Actually used: {actual_model}")
        else:
            print("❌ ERROR: Could not extract actual model from response")

    except Exception as e:
        print(f"❌ ERROR: {e}")
        print("This might indicate:")
        print("  1. LiteLLM server is not running")
        print("  2. Invalid API key")
        print("  3. Model not available on the LiteLLM server")
        print("  4. Network connectivity issues")

    print("\n" + "=" * 50)
    print("Test completed!")


if __name__ == "__main__":
    print("🚀 Starting Model Verification Test")
    print("This will test Claude Sonnet 4 integration with LiteLLM")
    print()

    # Check environment variables
    if not settings.llm_config.LITE_LLM_HOST:
        print("❌ ERROR: LITE_LLM_HOST not configured")
        sys.exit(1)

    if not settings.llm_config.LITE_LLM_API_KEY:
        print("❌ ERROR: LITE_LLM_API_KEY not configured")
        sys.exit(1)

    asyncio.run(test_model_verification())
