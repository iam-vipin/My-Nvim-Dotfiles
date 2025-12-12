import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Placement } from "@popperjs/core";
import { observer } from "mobx-react";
import { Tags } from "lucide-react";
// plane imports
import { useOutsideClickDetector } from "@plane/hooks";
// i18n
import { useTranslation } from "@plane/i18n";
// types
import { Tooltip } from "@plane/propel/tooltip";
// local imports
import type { TInitiativeLabel } from "@plane/types";
import { cn } from "@plane/utils";
import { usePlatformOS } from "@/hooks/use-platform-os";
import { useInitiatives } from "@/plane-web/hooks/store/use-initiatives";
import { InitiativeLabelPropertyDropdown } from "./initiative-label-property-dropdown";
import { getInitiativeLabelsArray } from "./initiative-label-utils";

export interface IInitiativeLabels {
  workspaceSlug: string;
  value: string[];
  defaultOptions?: unknown;
  onChange: (data: string[]) => void;
  disabled?: boolean;
  hideDropdownArrow?: boolean;
  className?: string;
  buttonClassName?: string;
  optionsClassName?: string;
  placement?: Placement;
  maxRender?: number;
  noLabelBorder?: boolean;
  placeholderText?: string;
  onClose?: () => void;
  renderByDefault?: boolean;
  fullWidth?: boolean;
  fullHeight?: boolean;
}

export const InitiativeLabels = observer(function InitiativeLabels(props: IInitiativeLabels) {
  const {
    workspaceSlug,
    value,
    defaultOptions = [],
    onChange,
    onClose,
    disabled,
    hideDropdownArrow = false,
    buttonClassName = "",
    placement,
    maxRender = 2,
    noLabelBorder = false,
    placeholderText,
    renderByDefault = true,
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
  const storeLabels = getInitiativesLabels(workspaceSlug);

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

  const initiativeLabels = getInitiativeLabelsArray(storeLabels, defaultOptions as TInitiativeLabel[]);

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
              "flex h-full items-center justify-center gap-2 rounded px-2.5 py-1 text-xs hover:bg-custom-background-80",
              noLabelBorder ? "rounded-none" : "border-[0.5px] border-custom-border-300",
              fullWidth && "w-full"
            )}
          >
            <Tags className="h-3.5 w-3.5" strokeWidth={2} />
            {placeholderText}
          </div>
        </Tooltip>
      );
    },
    [placeholderText, fullWidth, noLabelBorder, isMobile]
  );

  const LabelSummary = useMemo(
    function LabelSummary() {
      return (
        <div
          className={cn(
            "flex h-5 flex-shrink-0 items-center justify-center rounded px-2.5 text-xs",
            fullWidth && "w-full",
            noLabelBorder ? "rounded-none" : "border-[0.5px] border-custom-border-300",
            disabled ? "cursor-not-allowed" : "cursor-pointer"
          )}
        >
          <Tooltip
            isMobile={isMobile}
            position="top"
            tooltipHeading={t("common.labels")}
            tooltipContent={initiativeLabels
              ?.filter((l) => value.includes(l?.id))
              .map((l) => l?.name)
              .join(", ")}
            renderByDefault={false}
          >
            <div className="flex h-full items-center gap-1.5 text-custom-text-200">
              <span className="h-2 w-2 flex-shrink-0 rounded-full bg-custom-primary" />
              {`${value.length} Labels`}
            </div>
          </Tooltip>
        </div>
      );
    },
    [fullWidth, disabled, noLabelBorder, isMobile, initiativeLabels, value]
  );

  const LabelItem = useCallback(
    function LabelItem({ label }: { label: TInitiativeLabel }) {
      return (
        <Tooltip
          key={label.id}
          position="top"
          tooltipHeading={t("common.labels")}
          tooltipContent={label?.name ?? ""}
          isMobile={isMobile}
          renderByDefault={renderByDefault}
        >
          <div
            key={label?.id}
            className={cn(
              "flex overflow-hidden justify-center hover:bg-custom-background-80 max-w-full h-full flex-shrink-0 items-center rounded px-2.5 text-xs",
              !disabled && "cursor-pointer",
              fullWidth && "w-full",
              noLabelBorder ? "rounded-none" : "border-[0.5px] border-custom-border-300"
            )}
          >
            <div className="flex max-w-full items-center gap-1.5 overflow-hidden text-custom-text-200">
              <span
                className="h-2 w-2 flex-shrink-0 rounded-full"
                style={{
                  backgroundColor: label?.color ?? "#000000",
                }}
              />
              <div className="line-clamp-1 inline-block w-auto max-w-[200px] truncate">{label?.name}</div>
            </div>
          </div>
        </Tooltip>
      );
    },
    [disabled, fullWidth, isMobile, noLabelBorder, renderByDefault]
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
