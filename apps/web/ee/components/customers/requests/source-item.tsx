import type { FC } from "react";
import React from "react";

type TProps = {
  link: string;
};

export function SourceItem(props: TProps) {
  const { link } = props;
  // TODO: Add favicon from backend
  // const faviconUrl = useMemo(() => `https://www.google.com/s2/favicons?domain=${link}&sz=${40}`, [link]);
  return (
    <div className="flex gap-2 items-center max-w-40 truncate">
      {/* TODO: Add favicon from backend */}
      {/* {link && <Image src={faviconUrl} height={20} width={20} alt="favicon" />} */}
      <p className="text-sm truncate">{link}</p>
    </div>
  );
}
