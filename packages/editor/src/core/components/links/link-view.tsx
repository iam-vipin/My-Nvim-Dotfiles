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

import type { Editor } from "@tiptap/react";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
// components
import { LinkEditView, LinkPreview } from "@/components/links";

export type LinkViews = "LinkPreview" | "LinkEditView";

export type LinkViewProps = {
  view?: LinkViews;
  editor: Editor;
  from: number;
  to: number;
  url: string;
  text?: string;
  closeLinkView: () => void;
};

export function LinkView(props: LinkViewProps & { style: CSSProperties }) {
  const [currentView, setCurrentView] = useState<LinkViews>(props.view ?? "LinkPreview");
  const [prevFrom, setPrevFrom] = useState(props.from);

  const switchView = (view: LinkViews) => {
    setCurrentView(view);
  };

  useEffect(() => {
    if (props.from !== prevFrom) {
      setCurrentView("LinkPreview");
      setPrevFrom(props.from);
    }
  }, [prevFrom, props.from]);

  return (
    <>
      {currentView === "LinkPreview" && <LinkPreview viewProps={props} switchView={switchView} />}
      {currentView === "LinkEditView" && <LinkEditView viewProps={props} switchView={switchView} />}
    </>
  );
}
