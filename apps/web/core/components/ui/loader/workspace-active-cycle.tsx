import type { FC } from "react";
import React from "react";

type Props = {
  itemCount?: number;
};

function WorkspaceActiveCycleLoaderItem() {
  return (
    <div className="px-5 pt-5 last:pb-5">
      <div className="flex flex-col gap-4 p-4 rounded-xl border border-subtle-1 bg-surface-1">
        <div className="flex items-center gap-1.5">
          <span className="size-7 bg-layer-1 rounded" />
          <span className="h-7 w-20 bg-layer-1 rounded" />
        </div>
        <div className="flex items-center justify-between px-3 py-2 rounded border-[0.5px] border-subtle bg-surface-2">
          <div className="flex items-center gap-2 cursor-default">
            <span className="size-6 bg-layer-1 rounded" />
            <span className="h-6 w-14 bg-layer-1 rounded" />
            <span className="h-6 w-16 bg-layer-1 rounded" />
          </div>
          <div className="flex items-center gap-4">
            <span className="h-6 w-16 bg-layer-1 rounded" />
            <span className="h-6 w-20 bg-layer-1 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
          <span className="flex flex-col min-h-[17rem] border border-subtle-1 rounded-lg bg-layer-1" />
          <span className="flex flex-col min-h-[17rem] border border-subtle-1 rounded-lg bg-layer-1" />
          <span className="flex flex-col min-h-[17rem] border border-subtle-1 rounded-lg bg-layer-1" />
        </div>
      </div>
    </div>
  );
}

export function WorkspaceActiveCycleLoader({ itemCount = 2 }: Props) {
  return (
    <div className="h-full w-full overflow-y-scroll bg-surface-2 vertical-scrollbar scrollbar-md animate-pulse">
      {[...Array(itemCount)].map((_, index) => (
        <WorkspaceActiveCycleLoaderItem key={index} />
      ))}
    </div>
  );
}
