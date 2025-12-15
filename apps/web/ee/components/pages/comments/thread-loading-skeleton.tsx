import { range } from "lodash-es";
import { ListFilter } from "lucide-react";

export function PageCommentThreadLoader() {
  return (
    <div className="size-full flex flex-col">
      {/* Header */}
      <div className="shrink-0 py-1 px-3.5 border-b border-subtle">
        <div className="flex justify-between items-start w-full">
          <h2 className="text-primary text-14 font-medium leading-6">Comments</h2>
          <div className="flex h-6 items-center border border-subtle rounded">
            <div className="flex h-6 px-2 items-center gap-1">
              <ListFilter className="size-3 text-tertiary" />
              <span className="text-tertiary text-11 font-medium leading-3.5">Filters</span>
            </div>
          </div>
        </div>
      </div>

      {/* Comments skeleton loader */}
      <div className="flex-1 overflow-hidden divide-y divide-subtle animate-pulse">
        {range(4).map((i) => (
          <div key={i} className="flex flex-col gap-3 p-3.5">
            {/* Reference text quote skeleton (only for first item) */}
            {i === 0 && (
              <div className="flex gap-1 p-1 rounded-sm bg-layer-1">
                <span className="h-4 w-0.5 bg-layer-1 rounded-sm" />
                <span className="h-4 w-48 bg-layer-1 rounded-sm" />
              </div>
            )}

            {/* User and comment */}
            <div className="space-y-2">
              {/* User avatar and timestamp */}
              <div className="flex items-center gap-2">
                <span className="h-6 w-6 bg-layer-1 rounded-full" />
                <span className="h-4 w-32 bg-layer-1 rounded-sm" />
              </div>
              {/* Comment content */}
              <div className="space-y-2 pl-8">
                <span className="h-4 w-full bg-layer-1 rounded-sm" />
                <span className="h-4 w-5/6 bg-layer-1 rounded-sm" />
                {i !== 3 && <span className="h-4 w-4/5 bg-layer-1 rounded-sm" />}
              </div>
            </div>

            {/* Reply button and actions */}
            <div className="flex items-center gap-2">
              {i === 1 && <span className="h-4 w-40 bg-layer-1 rounded-sm" />}
              {i !== 1 && <span className="h-4 w-12 bg-layer-1 rounded-sm" />}
            </div>

            {/* Nested replies (only for third item) */}
            {i === 2 && (
              <div className="pl-8 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="h-5 w-5 bg-layer-1 rounded-full" />
                  <span className="h-4 w-28 bg-layer-1 rounded-sm" />
                </div>
                <div className="space-y-2">
                  <span className="h-4 w-full bg-layer-1 rounded-sm" />
                  <span className="h-4 w-3/4 bg-layer-1 rounded-sm" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
