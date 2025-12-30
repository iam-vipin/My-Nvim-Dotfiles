import type { FC } from "react";

import { InfoIcon, CloseIcon } from "@plane/propel/icons";
import type { TMobileAuthErrorInfo } from "@plane/constants";
// plane imports
import { useTranslation } from "@plane/i18n";

type TMobileAuthBanner = {
  bannerData: TMobileAuthErrorInfo | undefined;
  handleBannerData?: (bannerData: TMobileAuthErrorInfo | undefined) => void;
};

export function MobileAuthBanner(props: TMobileAuthBanner) {
  const { bannerData, handleBannerData } = props;
  // translation
  const { t } = useTranslation();

  if (!bannerData) return <></>;

  return (
    <div
      role="alert"
      className="relative flex items-center p-2 rounded-md gap-2 border border-accent-strong/50 bg-accent-primary/10"
    >
      <div className="size-4 flex-shrink-0 grid place-items-center">
        <InfoIcon height={16} width={16} className="text-accent-primary" />
      </div>
      <p className="w-full text-13 font-medium text-accent-primary">{bannerData?.message}</p>
      <button
        type="button"
        className="relative ml-auto size-6 rounded-sm grid place-items-center transition-all hover:bg-accent-primary/20 text-accent-primary/80"
        onClick={() => handleBannerData?.(undefined)}
        aria-label={t("aria_labels.auth_forms.close_alert")}
      >
        <CloseIcon className="size-4" />
      </button>
    </div>
  );
}
