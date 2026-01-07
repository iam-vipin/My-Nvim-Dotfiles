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

export class MQProducer extends MQActorBase {
  async sendMessage(data: any, headers: any, routingKey?: string) {
    try {
      routingKey = routingKey || this.routingKey;
      this.channel.publish(this.exchange, routingKey, Buffer.from(JSON.stringify(data)), {
        headers,
        contentType: "application/json",
        contentEncoding: "utf-8",
        deliveryMode: 2,
      });
    } catch (error) {
      throw new Error(`Failed to send message: ${error}`, { cause: error });
    }
  }

  async cancelConsumer(consumer: { consumerTag: string }) {
    await this.channel.cancel(consumer.consumerTag);
  }
}
