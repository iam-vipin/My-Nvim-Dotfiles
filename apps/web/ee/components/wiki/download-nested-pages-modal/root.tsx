import React, { useState } from "react";
import { observer } from "mobx-react";
// plane imports
import { Button, ModalCore } from "@plane/ui";
// plane web imports
import type { EPageStoreType } from "@/plane-web/hooks/store";
import { usePage } from "@/plane-web/hooks/store";
// local imports
import { DownloadNestedPagesModalSubPageItem } from "./sub-page-item";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  pageId: string;
  storeType: EPageStoreType;
};

export const DownloadNestedPagesModal: React.FC<Props> = observer((props) => {
  const { isOpen, onClose, pageId, storeType } = props;
  // states
  const [isDownloading, setIsDownloading] = useState(false);
  // store hooks
  const page = usePage({
    pageId,
    storeType,
  });
  // derived values
  const { subPageIds } = page ?? {};

  const handleDownload = async () => {
    setIsDownloading(true);
  };

  return (
    <ModalCore isOpen={isOpen} handleClose={onClose}>
      <div>
        <div className="space-y-5 p-5">
          <h3 className="text-xl font-medium text-custom-text-200">Download nested pages data</h3>
          <div className="mt-2 space-y-4">
            <p className="text-sm text-custom-text-200">
              All the data from the nested pages listed below will be downloaded. You{"'"}ll receive an email with the
              files once ready. This may take 5{"'"}10 minutes.
            </p>
            <div className="space-y-2">
              {subPageIds?.map((subPageId) => (
                <DownloadNestedPagesModalSubPageItem key={subPageId} pageId={subPageId} storeType={storeType} />
              ))}
            </div>
          </div>
        </div>
        <div className="px-5 py-4 flex items-center justify-end gap-2 border-t-[0.5px] border-custom-border-200">
          <Button variant="neutral-primary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleDownload} loading={isDownloading}>
            {isDownloading ? "Downloading" : "Download"}
          </Button>
        </div>
      </div>
    </ModalCore>
  );
});
