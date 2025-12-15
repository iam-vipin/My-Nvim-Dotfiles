import { FileKey2 } from "lucide-react";

export function CustomAttachmentFlaggedState() {
  return (
    <a
      href="https://plane.so/pro"
      className="py-3 px-2 rounded-lg bg-layer-1 hover:bg-layer-1-hover border border-subtle flex items-start gap-2 transition-colors"
      contentEditable={false}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className="flex-shrink-0 mt-0.5 size-4 grid place-items-center">
        <FileKey2 className="size-4" />
      </span>
      <p className="not-prose text-13">
        {/* {t("attachmentComponent.upgrade.description")} */}
        Upgrade your plan to view this attachment.
      </p>
    </a>
  );
}
