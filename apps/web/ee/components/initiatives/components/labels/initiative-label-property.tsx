/**
 * SPDX-FileCopyrightText: 2023-present Plane Software, Inc.
 * SPDX-License-Identifier: LicenseRef-Plane-Commercial
 *
 * Licensed under the Plane Commercial License (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * https://plane.so/legals/eula
 *
 * DO NOT remove or modify this notice.
 * NOTICE: Proprietary and confidential. Unauthorized use or distribution is prohibited.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import type { Placement } from "@popperjs/core";
import { observer } from "mobx-react";
import { Tags } from "lucide-react";

// plane imports
import { useOutsideClickDetector } from "@plane/hooks";
import { useTranslation } from "@plane/i18n";
import { Tooltip } from "@plane/propel/tooltip";
import type { TInitiativeLabel } from "@plane/types";

// local imports
import { cn } from "@plane/utils";
import { usePlatformOS } from "@/hooks/use-platform-os";
import { useInitiatives } from "@/plane-web/hooks/store/use-initiatives";
import { InitiativeLabelPropertyDropdown } from "./initiative-label-property-dropdown";

export interface IInitiativeLabelProperty {
  workspaceSlug: string | null;
  value: string[];
  defaultOptions?: unknown;
  onChange: (data: string[]) => void;
  onClose?: () => void;
  disabled?: boolean;
  hideDropdownArrow?: boolean;
  className?: string;
  buttonClassName?: string;
  optionsClassName?: string;
  placement?: Placement;
  maxRender?: number;
  noLabelBorder?: boolean;
  placeholderText?: string;
  renderByDefault?: boolean;
  fullWidth?: boolean;
  fullHeight?: boolean;
}

export const InitiativeLabelProperty = observer(function InitiativeLabelProperty(props: IInitiativeLabelProperty) {
  const {
    workspaceSlug,
    value,
    defaultOptions = [],
    onChange,
    onClose,
    disabled: _disabled,
    hideDropdownArrow = false,
    buttonClassName = "",
    placement,
    maxRender = 2,
    noLabelBorder = false,
    placeholderText,
    fullWidth = false,
    fullHeight = false,
  } = props;

  // i18n
  const { t } = useTranslation();

  // states
  const [isOpen, setIsOpen] = useState(false);

  // refs
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // store hooks
  const {
    initiative: { getInitiativesLabels },
  } = useInitiatives();
  const { isMobile } = usePlatformOS();
  const storeLabels = getInitiativesLabels(workspaceSlug || "");

  const handleClose = () => {
    if (!isOpen) return;
    setIsOpen(false);
    if (onClose) onClose();
  };

  useOutsideClickDetector(dropdownRef, handleClose);

  useEffect(() => {
    if (isOpen && inputRef.current && !isMobile) {
      inputRef.current.focus();
    }
  }, [isOpen, isMobile]);

  let initiativeLabels: TInitiativeLabel[] = defaultOptions as TInitiativeLabel[];
  if (storeLabels && storeLabels.size > 0) initiativeLabels = Array.from(storeLabels.values());

  const NoLabel = useMemo(
    function NoLabel() {
      return (
        <Tooltip
          position="top"
          tooltipHeading={t("common.labels")}
          tooltipContent="None"
          isMobile={isMobile}
          renderByDefault={false}
        >
          <div
            className={cn(
              "flex h-full items-center justify-center gap-2 rounded px-2.5 py-1 text-11 hover:bg-layer-1",
              noLabelBorder ? "rounded-none" : "border-[0.5px] border-strong",
              fullWidth && "w-full"
            )}
          >
            <Tags className="h-3.5 w-3.5" strokeWidth={2} />
            {placeholderText}
          </div>
        </Tooltip>
      );
    },
    [placeholderText, fullWidth, noLabelBorder, isMobile, t]
  );

  const LabelSummary = useMemo(
    function LabelSummary() {
      return (
        <div
          className={cn(
            "flex h-full items-center justify-center gap-1 rounded px-2.5 py-1 text-11 hover:bg-layer-1",
            noLabelBorder ? "rounded-none" : "border-[0.5px] border-strong",
            fullWidth && "w-full"
          )}
        >
          <Tags className="h-3.5 w-3.5" strokeWidth={2} />
          <span className="text-secondary">{value.length} labels</span>
        </div>
      );
    },
    [value.length, fullWidth, noLabelBorder]
  );

  const LabelItem = useMemo(
    function LabelItem() {
      function LabelItemComponent({ label }: { label: TInitiativeLabel }) {
        return (
          <div
            className={cn(
              "flex h-full items-center justify-center gap-1 rounded px-2.5 py-1 text-11 hover:bg-layer-1",
              noLabelBorder ? "rounded-none" : "border-[0.5px] border-strong",
              fullWidth && "w-full"
            )}
          >
            <span
              className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
              style={{
                backgroundColor: label?.color,
              }}
            />
            <span className="line-clamp-1 inline-block truncate">{label?.name}</span>
          </div>
        );
      }

      LabelItemComponent.displayName = "LabelItem";
      return LabelItemComponent;
    },
    [fullWidth, noLabelBorder]
  );

  return (
    <>
      {value.length > 0 ? (
        value.length <= maxRender ? (
          initiativeLabels
            ?.filter((l) => value.includes(l?.id))
            .map((label) => (
              <InitiativeLabelPropertyDropdown
                key={label.id}
                workspaceSlug={workspaceSlug}
                value={value}
                onChange={onChange}
                buttonClassName={buttonClassName}
                placement={placement}
                hideDropdownArrow={hideDropdownArrow}
                fullWidth={fullWidth}
                fullHeight={fullHeight}
                label={<LabelItem label={label} />}
              />
            ))
        ) : (
          <InitiativeLabelPropertyDropdown
            workspaceSlug={workspaceSlug}
            value={value}
            onChange={onChange}
            hideDropdownArrow={hideDropdownArrow}
            buttonClassName={buttonClassName}
            placement={placement}
            fullWidth={fullWidth}
            fullHeight={fullHeight}
            label={LabelSummary}
          />
        )
      ) : (
        <InitiativeLabelPropertyDropdown
          workspaceSlug={workspaceSlug}
          value={value}
          onChange={onChange}
          hideDropdownArrow={hideDropdownArrow}
          buttonClassName={buttonClassName}
          placement={placement}
          fullWidth={fullWidth}
          fullHeight={fullHeight}
          label={NoLabel}
        />
      )}
    </>
  );
});
