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

import Link from "next/link";

type Props = {
  isSignUp?: boolean;
};

export function TermsAndConditions(props: Props) {
  const { isSignUp = false } = props;
  return (
    <span className="flex items-center justify-center py-6">
      <p className="text-center text-13 text-secondary whitespace-pre-line">
        {isSignUp ? "By creating an account" : "By signing in"}, you agree to our{" \n"}
        <Link href="https://plane.so/legals/terms-and-conditions" target="_blank" rel="noopener noreferrer">
          <span className="text-13 font-medium underline hover:cursor-pointer">Terms of Service</span>
        </Link>{" "}
        and{" "}
        <Link href="https://plane.so/legals/privacy-policy" target="_blank" rel="noopener noreferrer">
          <span className="text-13 font-medium underline hover:cursor-pointer">Privacy Policy</span>
        </Link>
        {"."}
      </p>
    </span>
  );
}
