import type { FC } from "react";
import React from "react";
import { observer } from "mobx-react";
// plane imports
import { CustomersIcon, EditIcon } from "@plane/propel/icons";
import { Input } from "@plane/ui";
import { getFileURL } from "@plane/utils";

type TProps = {
  handleOpenLogoInput: () => void;
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  logoInputRef: React.RefObject<HTMLInputElement>;
  logo_url?: string;
  logo: File | null;
};

export const CustomerLogoInput = observer(function CustomerLogoInput(props: TProps) {
  const { handleOpenLogoInput, onLogoUpload, logo_url, logo, logoInputRef } = props;
  return (
    <div className="rounded-md border-subtle-1 p-1 relative group cursor-pointer" onClick={() => handleOpenLogoInput()}>
      <Input className="hidden" type="file" onChange={onLogoUpload} maxLength={1} ref={logoInputRef} />
      <div className="absolute -right-1 -top-1 p-1.5 rounded-full bg-surface-1 border border-subtle-1 hidden group-hover:inline">
        <EditIcon className="size-2.5" />
      </div>
      {logo_url || logo ? (
        <div className="bg-surface-1 rounded-md h-11 w-11 overflow-hidden border-[0.5px] border-subtle-1">
          <img
            src={logo ? URL.createObjectURL(logo) : logo_url && logo_url !== "" ? (getFileURL(logo_url) ?? "") : ""}
            alt="customer logo"
            className="w-full h-full object-cover rounded-md"
          />
        </div>
      ) : (
        <div className="bg-layer-1 rounded-md flex items-center justify-center h-11 w-11 p-1.5">
          <CustomersIcon className="size-5 opacity-50" />
        </div>
      )}
    </div>
  );
});
