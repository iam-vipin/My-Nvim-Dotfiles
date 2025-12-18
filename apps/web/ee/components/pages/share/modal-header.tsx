import { Link2 } from "lucide-react";
import { Button } from "@plane/propel/button";

type TModalHeaderProps = {
  pageTitle: string;
  copied: boolean;
  onCopyLink: () => void;
};

export function ModalHeader({ pageTitle, copied, onCopyLink }: TModalHeaderProps) {
  return (
    <div className="flex items-center justify-between pt-3 px-4">
      <h3 className="text-lg font-medium text-primary truncate">Share {pageTitle}</h3>
      <Button
        variant="link"
        prependIcon={<Link2 className="size-3.5 -rotate-45" />}
        onClick={onCopyLink}
        className="shrink-0"
      >
        {copied ? "Copied!" : "Copy link"}
      </Button>
    </div>
  );
}

ModalHeader.displayName = "ModalHeader";
