import { MoreHorizontal } from "lucide-react";
// plane imports
import { TableCell, TableRow } from "@plane/propel/table";
import { CustomMenu } from "@plane/ui";
import type { TDomain } from "@plane/types";
import { IconButton } from "@plane/propel/icon-button";
import { useTranslation } from "@plane/i18n";

type TDomainListItem = {
  domain: TDomain;
  onVerifyClick: () => void;
  onDeleteClick: () => void;
};

export function DomainListItem(props: TDomainListItem) {
  const { domain, onVerifyClick, onDeleteClick } = props;
  // plane hooks
  const { t } = useTranslation();
  return (
    <>
      <TableRow>
        <TableCell className="text-body-xs-regular text-primary">{domain.domain}</TableCell>
        <TableCell>{getStatusDisplay(domain, t)}</TableCell>
        <TableCell className="text-right">
          <CustomMenu
            customButton={<IconButton icon={MoreHorizontal} variant="ghost" size="sm" />}
            placement="bottom-end"
            closeOnSelect
          >
            {domain.verification_status !== "verified" && (
              <CustomMenu.MenuItem onClick={onVerifyClick}>Verify</CustomMenu.MenuItem>
            )}
            <CustomMenu.MenuItem onClick={onDeleteClick}>
              <span className="text-danger-secondary">Delete</span>
            </CustomMenu.MenuItem>
          </CustomMenu>
        </TableCell>
      </TableRow>
    </>
  );
}

const getStatusDisplay = (domain: TDomain, t: (key: string) => string) => {
  if (domain.verification_status === "verified") {
    return (
      <div className="flex items-center gap-2">
        <div className="size-2.5 rounded-full bg-success-primary" />
        <span className="text-body-xs-regular text-secondary">
          {t("sso.domain_management.verified_domains.list.status_verified")}
        </span>
      </div>
    );
  }

  if (domain.verification_status === "failed") {
    return (
      <div className="flex items-center gap-2">
        <div className="size-2.5 rounded-full bg-danger-primary" />
        <span className="text-body-xs-regular text-secondary">
          {t("sso.domain_management.verified_domains.list.status_failed")}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="size-2.5 rounded-full bg-warning-primary" />
      <span className="text-body-xs-regular text-secondary">
        {t("sso.domain_management.verified_domains.list.status_pending")}
      </span>
    </div>
  );
};
