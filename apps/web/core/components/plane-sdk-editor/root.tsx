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

import { lazy, Suspense, useState, useRef, useCallback } from "react";
import { Code2 } from "lucide-react";
// eslint-disable-next-line import/default
import planeSDKTypes from "@makeplane/plane-node-sdk/dist/types.bundle.d.ts?raw";
// components
import { FunctionBrowserModal } from "@/components/runners/function-browser";
import { Button } from "@plane/propel/button";
import { useTheme } from "next-themes";

type Props = {
  value: string;
  onChange: (value: string) => void;
  allowFunctionBrowser?: boolean;
};

const CodeEditor = lazy(function PlaneSDKCodeEditor() {
  return import("@plane/propel/code-editor").then((mod) => ({
    default: mod.CodeEditor,
  }));
});

export const LazyPlaneSDKCodeEditor = function LazyPlaneSDKCodeEditor(props: Props) {
  const { value, onChange, allowFunctionBrowser = false } = props;
  const [showFunctionBrowser, setShowFunctionBrowser] = useState(false);
  const editorRef = useRef<{ editor: unknown; monaco: unknown } | null>(null);
  const { resolvedTheme } = useTheme();
  const handleInsertFunction = useCallback(
    (code: string) => {
      // Insert code at cursor position or append to end
      const editor = editorRef.current?.editor as {
        getPosition?: () => { lineNumber: number; column: number } | null;
        executeEdits?: (source: string, edits: { range: unknown; text: string }[]) => void;
        getModel?: () => { getFullModelRange?: () => unknown } | null;
      } | null;
      const monaco = editorRef.current?.monaco as {
        Range?: new (startLine: number, startCol: number, endLine: number, endCol: number) => unknown;
      } | null;

      if (editor?.getPosition && editor?.executeEdits && monaco?.Range) {
        const position = editor.getPosition();
        if (position) {
          const range = new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column);
          editor.executeEdits("function-browser", [
            {
              range,
              text: code,
            },
          ]);
        }
      } else {
        // Fallback: append to end of value
        onChange(value + "\n" + code);
      }
    },
    [value, onChange]
  );

  // Custom types including Functions namespace hint and automation event types
  const customTypes = `
    declare global {
      /** Payload containing entity data and previous state */
      interface PlaneEventPayload {
        data: Record<string, unknown>;
        previous_attributes: string | Record<string, unknown>;
      }

      /** Event published by Plane when entities change */
      interface PlaneEvent {
        timestamp: number;
        publisher: string;
        publisher_instance: string;
        version: string;
        source: string;
        outbox_id: number;
        event_id: string;
        event_type: string;
        entity_type: string;
        entity_id: string;
        payload: PlaneEventPayload;
        workspace_id: string;
        project_id: string;
        initiator_id: string;
        initiator_type: string;
      }

      /** Context about the automation execution */
      interface AutomationContext {
        automation_id: string;
        automation_run_id: string;
      }

      /** Input passed to the main function */
      interface AutomationEventInput {
        event: PlaneEvent;
        context: AutomationContext;
      }

      const Plane: PlaneClient;
      const workspaceSlug: string;
      /** Environment variables configured for the script */
      const ENV: Record<string, string>;
      /** Script variables configured in the UI */
      const Variables: Record<string, string>;
      /**
       * Functions library - reusable helper functions.
       * Press Cmd/Ctrl+Shift+F to browse available functions.
       */
      const Functions: {
        [key: string]: (params: Record<string, unknown>) => Promise<unknown>;
      };
    }
  `;

  return (
    <div className="relative">
      <Suspense fallback={<></>}>
        <CodeEditor
          value={value}
          onChange={(v) => onChange(v ?? "")}
          language="typescript"
          path="script.ts"
          height={350}
          theme={resolvedTheme === "dark" ? "plane-dark" : "plane-light"}
          externalLibraries={[
            {
              name: "@makeplane/plane-node-sdk",
              content: planeSDKTypes,
            },
          ]}
          customTypes={customTypes}
          onMount={(editor, monacoInstance) => {
            editorRef.current = { editor, monaco: monacoInstance };

            // Register keyboard shortcut for function browser
            if (allowFunctionBrowser && monacoInstance) {
              const monaco = monacoInstance;
              editor.addAction({
                id: "open-function-browser",
                label: "Insert Function",
                keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF],
                run: () => {
                  setShowFunctionBrowser(true);
                },
              });
            }
          }}
        />
      </Suspense>

      {/* Function Browser Button */}
      {allowFunctionBrowser && (
        <Button
          type="button"
          onClick={() => setShowFunctionBrowser(true)}
          className="absolute top-2 right-2"
          variant="secondary"
          title="Insert Function (Cmd+Shift+F)"
        >
          <Code2 className="size-3.5 text-icon-secondary" />
          Functions
        </Button>
      )}

      {/* Function Browser Modal */}
      {allowFunctionBrowser && (
        <FunctionBrowserModal
          isOpen={showFunctionBrowser}
          onClose={() => setShowFunctionBrowser(false)}
          onInsert={handleInsertFunction}
        />
      )}
    </div>
  );
};
