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

import axios from "axios";
import type { LinearAuthProps, LinearAuthState } from "@/linear/types";

export type LinearTokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
};

export class LinearAuth {
  props: LinearAuthProps;

  constructor(props: LinearAuthProps) {
    this.props = props;
  }

  getCallbackUrl(): string {
    return this.props.callbackURL;
  }

  getAuthorizationURL(state: LinearAuthState): string {
    const scope = "read,write"; // Linear's scope
    const callbackURL = this.getCallbackUrl();
    const stateString = JSON.stringify(state);
    // encode state string to base64
    const encodedState = Buffer.from(stateString).toString("base64");
    const consentURL = `https://linear.app/oauth/authorize?client_id=${this.props.clientId}&redirect_uri=${callbackURL}&response_type=code&scope=${scope}&state=${encodedState}`;
    return consentURL;
  }

  async getAccessToken(
    code: string,
    state: LinearAuthState
  ): Promise<{ tokenResponse: LinearTokenResponse; state: LinearAuthState }> {
    const params = new URLSearchParams();
    params.append("code", code);
    params.append("client_id", this.props.clientId);
    params.append("client_secret", this.props.clientSecret);
    params.append("redirect_uri", this.getCallbackUrl());
    params.append("grant_type", "authorization_code");

    const { data: tokenResponse } = await axios.post("https://api.linear.app/oauth/token", params.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    return { tokenResponse, state };
  }
}
