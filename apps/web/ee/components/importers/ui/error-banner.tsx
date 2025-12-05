"use client";

import { Button } from "@plane/propel/button";
import { CloseIcon } from "@plane/propel/icons";

export default function ErrorBanner({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between gap-2 text-red-500 bg-red-500/20 rounded-md p-2">
      <span className="text-sm">{message}</span>
      <Button variant="link-neutral" size="sm" onClick={onClose}>
        <CloseIcon height={14} width={14} className="text-red-500" />
      </Button>
    </div>
  );
}

export { ErrorBanner };
