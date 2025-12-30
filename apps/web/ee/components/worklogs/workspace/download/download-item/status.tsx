import type { FC } from "react";
// helpers
import { cn } from "@plane/utils";
// plane web types
import type { TWorklogDownloadStatus } from "@/plane-web/types";

export function WorklogDownloadStatus(props: { status: TWorklogDownloadStatus | undefined; loader: boolean }) {
  const { status, loader } = props;
  // hooks

  if (!status) return <></>;
  return (
    <span
      className={cn(`rounded-sm px-2 py-0.5 text-11 capitalize`, {
        "bg-success-subtle text-success-primary": status === "completed",
        "bg-yellow-500/20 text-yellow-500": ["processing", "queued"].includes(status),
        "bg-danger-subtle text-danger-primary": status === "failed",
        "bg-gray-500/20 text-gray-500": loader,
      })}
    >
      {loader ? "Refreshing..." : status}
    </span>
  );
}
