import type { FC } from "react";

type DrawioIframeLoadingProps = {
  LoadingComponent?: React.ComponentType;
};

export function DrawioIframeLoading({ LoadingComponent }: DrawioIframeLoadingProps) {
  return (
    <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-layer-1 rounded-xl z-10">
      <div className="flex flex-col items-center gap-4">
        {LoadingComponent ? (
          <LoadingComponent />
        ) : (
          <div className="w-10 h-10 border-2 border-subtle border-t-accent-primary rounded-full animate-spin" />
        )}
      </div>
    </div>
  );
}
