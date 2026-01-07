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

import os
import sys
import logging

from django.core.management.base import BaseCommand

from plane.webhook.consumer import WebhookConsumer


logger = logging.getLogger(__name__)


class Command(BaseCommand):
    """
    Django management command to run the Webhook consumer.

    This command starts the RabbitMQ consumer that processes Webhook events
    from the plane.event_stream exchange and dispatches them to Celery tasks.
    """

    help = "Run the Webhook consumer to process events from RabbitMQ"

    def add_arguments(self, parser):
        """Add command line arguments."""
        parser.add_argument(
            "--queue",
            type=str,
            default=os.environ.get("WEBHOOK_QUEUE_NAME", "plane.webhook"),
            help="RabbitMQ queue name to consume from (default: from Django settings)",
        )
        parser.add_argument(
            "--prefetch",
            type=int,
            default=int(os.environ.get("WEBHOOK_PREFETCH_COUNT", "10")),
            help="Number of messages to prefetch (default: 10)",
        )

    def handle(self, *args, **options):
        """Handle the management command execution."""
        consumer = WebhookConsumer(options["queue"], options["prefetch"])

        try:
            logger.info(f"Webhook consumer initialized for queue '{options['queue']}'")
            # Start the consumer (this will block until stopped)
            consumer.start_consuming()

        except KeyboardInterrupt:
            logger.warning("Keyboard interrupt received, stopping...")

        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            sys.exit(1)

        finally:
            logger.info(f"Webhook consumer stopped for queue '{options['queue']}'")
