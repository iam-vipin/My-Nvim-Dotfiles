import type { FC } from "react";
import React, { useState } from "react";
import { observer } from "mobx-react";
// plane imports
import { useTranslation } from "@plane/i18n";
import { copyUrlToClipboard } from "@plane/utils";

type TCreateCustomerCreateToastActions = {
  workspaceSlug: string;
  customerId: string;
};

export const CreateCustomerCreateToastActions = observer(function CreateCustomerCreateToastActions(
  props: TCreateCustomerCreateToastActions
) {
  const { workspaceSlug, customerId } = props;
  // state
  const [copied, setCopied] = useState(false);
  // i18n
  const { t } = useTranslation();

  const customerLink = `/${workspaceSlug}/customers/${customerId}`;

  const copyToClipboard = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    try {
      await copyUrlToClipboard(customerLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      setCopied(false);
    }
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="flex items-center gap-1 text-11 text-secondary">
      <a
        href={customerLink}
        target="_blank"
        rel="noopener noreferrer"
        className="text-accent-primary px-2 py-1 hover:bg-layer-1 font-medium rounded"
      >
        {t("common.view")}
      </a>

      {copied ? (
        <>
          <span className="cursor-default px-2 py-1 text-secondary">{t("common.copied")}</span>
        </>
      ) : (
        <>
          <button
            className="cursor-pointer hidden group-hover:flex px-2 py-1 text-tertiary hover:text-secondary hover:bg-layer-1 rounded"
            onClick={copyToClipboard}
          >
            {t("common.actions.copy_link")}
          </button>
        </>
      )}
    </div>
  );
});
