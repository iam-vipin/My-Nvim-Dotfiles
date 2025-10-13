# Python imports
import asyncio

import typer

# Third-party imports
from sqlmodel import select

from pi.app.models import LlmModel
from pi.app.models import LlmModelPricing
from pi.core.db.fixtures.llms import llm_id_map
from pi.core.db.plane_pi.lifecycle import get_async_session

# Pricing data with unique IDs for consistency
# https://platform.openai.com/docs/pricing
PRICING_DATA = [
    {
        "id": "85c2f113-0c4e-4ad3-b5f9-1bada9e0ad24",
        "llm_model_id": llm_id_map["gpt-4o"],
        "text_input_price": 2.50,
        "text_output_price": 10.00,
        "cached_text_input_price": 1.25,
    },
    {
        "id": "b6f5e0de-4c21-4f32-82d6-5a99c0d1aee4",
        "llm_model_id": llm_id_map["gpt-4o-mini"],
        "text_input_price": 0.15,
        "text_output_price": 0.60,
        "cached_text_input_price": 0.075,
    },
    {
        "id": "e9a95f3d-f54e-4a83-8f0b-18f084e4120d",
        "llm_model_id": llm_id_map["gpt-4.1"],
        "text_input_price": 2.00,
        "text_output_price": 8.00,
        "cached_text_input_price": 0.50,
    },
    {
        "id": "4c880df9-0b57-4dec-b511-6fd40ea85308",
        "llm_model_id": llm_id_map["gpt-4.1-nano"],
        "text_input_price": 0.10,
        "text_output_price": 0.40,
        "cached_text_input_price": 0.025,
    },
    {
        "id": "7d9e1f2a-3b4c-5d6e-7f8a-9b0c1d2e3f4a",
        "llm_model_id": llm_id_map["claude-sonnet-4"],
        "text_input_price": 3.00,
        "text_output_price": 15.00,
        "cached_text_input_price": 1.50,
    },
]

tracked_fields = ["text_input_price", "text_output_price", "cached_text_input_price"]


async def sync_llm_pricing():
    """Sync LLM pricing data with pricing IDs."""
    async for session in get_async_session():
        try:
            for pricing in PRICING_DATA:
                model_id = pricing["llm_model_id"]

                # Get model
                stmt_model = select(LlmModel).where(LlmModel.id == model_id)  # type: ignore[union-attr]
                result_model = await session.execute(stmt_model)
                llm_model = result_model.scalar_one_or_none()

                if not llm_model:
                    typer.echo(f"LLM model not found for key: {model_id}")
                    continue

                # Check for existing pricing
                stmt_pricing = select(LlmModelPricing).where(LlmModelPricing.id == pricing["id"]).where(LlmModelPricing.deleted_at.is_(None))  # type: ignore[union-attr]
                result_pricing = await session.execute(stmt_pricing)
                existing_pricing = result_pricing.scalar_one_or_none()

                if existing_pricing:
                    updated = False
                    for field in tracked_fields:
                        if getattr(existing_pricing, field) != pricing[field]:
                            setattr(existing_pricing, field, pricing[field])
                            updated = True

                    if updated:
                        typer.echo(f"Updated pricing for {model_id}")
                    else:
                        typer.echo(f"Pricing unchanged for {model_id}")
                else:
                    new_pricing = LlmModelPricing(
                        id=pricing["id"],
                        llm_model_id=llm_model.id,
                        text_input_price=pricing["text_input_price"],
                        text_output_price=pricing["text_output_price"],
                        cached_text_input_price=pricing["cached_text_input_price"],
                    )
                    session.add(new_pricing)
                    typer.echo(f"Created pricing for {model_id}")

            await session.commit()
            typer.echo("LLM pricing synced successfully.")

        except Exception as e:
            await session.rollback()
            typer.echo(f"Error syncing pricing: {e}")


if __name__ == "__main__":
    asyncio.run(sync_llm_pricing())
