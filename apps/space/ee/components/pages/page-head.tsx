import { observer } from "mobx-react";
import { Logo } from "@plane/propel/emoji-icon-picker";
import { PageIcon } from "@plane/propel/icons";
import type { IPage } from "@/plane-web/store/pages";

type Props = {
  pageDetails: IPage;
};
export const PageHeader: React.FC<Props> = observer(({ pageDetails }) => (
  <div className="w-full py-3 page-header-container">
    <div className="space-y-2 block bg-transparent w-full max-w-[720px] mx-auto transition-all duration-200 ease-in-out">
      <div className="size-[60px] bg-custom-background-80 rounded grid place-items-center">
        {pageDetails.logo_props?.in_use ? (
          <Logo logo={pageDetails.logo_props} size={36} type="lucide" />
        ) : (
          <PageIcon className="size-9 text-custom-text-300" />
        )}
      </div>
      <h1 className="tracking-[-2%] font-bold text-[2rem] leading-[2.375rem] break-words">{pageDetails.name}</h1>
    </div>
  </div>
));
