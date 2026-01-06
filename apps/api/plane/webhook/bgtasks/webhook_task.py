import logging

# third party imports
from celery import shared_task

# plane imports
# from plane.db.models import Webhook

logger = logging.getLogger("plane.webhook")


@shared_task
def process_webhook_event(body: dict):
    """
    Process a webhook event from the event stream.
    """
    logger.info("Processing webhook event: ", body)
