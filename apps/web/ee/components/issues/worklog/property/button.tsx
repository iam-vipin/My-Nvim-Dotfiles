import type { FC } from "react";
import { Loader, Plus } from "lucide-react";
// helpers
import { cn } from "@plane/utils";

type TIssueWorklogPropertyButton = { content?: string; isLoading?: boolean };

export function IssueWorklogPropertyButton(props: TIssueWorklogPropertyButton) {
  const { content, isLoading } = props;

  return (
    <div className="flex justify-between items-center text-13 py-2 rounded-sm transition-all cursor-not-allowed w-full">
      <div
        className={cn({
          "text-tertiary": !content,
        })}
      >
        {(content || "").length > 0 ? content : "0h 0m"}
      </div>
      {isLoading ? (
        <div className="transition-all flex-shrink-0 w-4 h-4 flex justify-center items-center text-placeholder animate-spin">
          <Loader size={14} />
        </div>
      ) : (
        <div className="transition-all flex-shrink-0 w-4 h-4 hidden group-hover:flex justify-center items-center text-placeholder">
          <Plus size={14} />
        </div>
      )}
    </div>
  );
}
