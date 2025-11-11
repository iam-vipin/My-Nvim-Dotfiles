import React from "react";
import { observer } from "mobx-react";
// components
import { Logo } from "@plane/propel/emoji-icon-picker";
// plane web imports
import type { EPageStoreType } from "@/plane-web/hooks/store";
import { usePage } from "@/plane-web/hooks/store";

type Props = {
  pageId: string;
  storeType: EPageStoreType;
};

export const DownloadNestedPagesModalSubPageItem: React.FC<Props> = observer((props) => {
  const { pageId, storeType } = props;
  // store hooks
  const page = usePage({
    pageId,
    storeType,
  });
  // derived values
  const { logo_props, name } = page ?? {};

  if (!page) return null;

  return (
    <div className="flex items-center gap-2 p-1">
      {logo_props && (
        <div className="shrink-0 size-6 grid place-items-center bg-custom-background-80 rounded">
          <Logo logo={logo_props} type="lucide" size={16} />
        </div>
      )}
      <h6 className="text-sm font-medium truncate">{name}</h6>
    </div>
  );
});
