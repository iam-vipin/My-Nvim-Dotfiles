import type { CustomAIBlockNodeViewProps } from "./block-ui";

/**
 * Main entry component for the AI block node view.
 * Renders the widgetCallback from web app if provided, otherwise returns null.
 * The web app's widget is responsible for fetching data and passing it to CustomAIBlockUI.
 */
export function CustomAIBlock(props: CustomAIBlockNodeViewProps) {
  const { extension } = props;
  const { widgetCallback: WidgetCallback } = extension.options;

  // If widget callback is provided, render it (web app handles data fetching)
  if (WidgetCallback) {
    return <WidgetCallback {...props} />;
  }

  // No widget callback - return null (widget callback is required for this component)
  return null;
}
