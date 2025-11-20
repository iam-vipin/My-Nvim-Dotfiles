import { useCallback, useEffect, useState } from "react";
// components
import { MobileDocumentEditor } from "@/components";
import { EditorWrapper } from "@/components/editor/editor-wrapper";
// constants
import { CallbackHandlerStrings } from "@/constants/callback-handler-strings";
// helpers
import { callNative } from "@/helpers";
// types
import { TEditorVariant } from "@/types/editor";

export function App() {
  const [variant, setVariant] = useState<TEditorVariant | undefined>(undefined);

  // It retrieves the variant from the native code, once the webview is loaded.
  useEffect(() => {
    callNative(CallbackHandlerStrings.getVariant).then((variant: string) => {
      if (!variant || !Object.keys(TEditorVariant).includes(variant)) return;
      setVariant(variant as TEditorVariant);
    });
  }, []);

  // It is used to set the variant from the native code.
  const setEditorVariant = useCallback((variant: string) => {
    if (!variant || !Object.keys(TEditorVariant).includes(variant)) return;
    setVariant(variant as TEditorVariant);
  }, []);

  window.setEditorVariant = setEditorVariant;

  if (!variant) return null;

  if (variant === TEditorVariant.document) return <MobileDocumentEditor />;

  // It renders the lite, sticky or rich editor based on the variant.
  return <EditorWrapper variant={variant as TEditorVariant} />;
}
