/**
 * SPDX-FileCopyrightText: 2023-present Plane Software, Inc.
 * SPDX-License-Identifier: LicenseRef-Plane-Commercial
 *
 * Licensed under the Plane Commercial License (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * https://plane.so/legals/eula
 *
 * DO NOT remove or modify this notice.
 * NOTICE: Proprietary and confidential. Unauthorized use or distribution is prohibited.
 */

import { MQActorBase } from "./mq";

export class MQConsumer extends MQActorBase {
  startConsuming(callback: (data: any) => void) {
    // Store the callback for re-registration during reconnection
    this.consumerCallback = callback;

    return this.channel.consume(
      this.queueName,
      (msg: any) => {
        if (msg && msg.content) {
          callback(msg);
        }
      },
      {
        noAck: false,
      }
    );
  }

  async cancelConsumer(consumer: { consumerTag: string }) {
    await this.channel.cancel(consumer.consumerTag);
  }
}
