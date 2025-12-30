import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Placement } from "@popperjs/core";
import { useParams } from "next/navigation";
import { usePopper } from "react-popper";
import { Loader, Search } from "lucide-react";
import { CheckIcon, ChevronDownIcon } from "@plane/propel/icons";
import { Combobox } from "@headlessui/react";

// plane imports
import { EUserPermissionsLevel, getRandomLabelColor } from "@plane/constants";
import { useOutsideClickDetector } from "@plane/hooks";
import { useTranslation } from "@plane/i18n";
import { EUserWorkspaceRoles } from "@plane/types";
import type { TInitiativeLabel } from "@plane/types";
import { ComboDropDown } from "@plane/ui";

// local imports
import { useUserPermissions } from "@/hooks/store/user";
import { useDropdownKeyDown } from "@/hooks/use-dropdown-key-down";
import { usePlatformOS } from "@/hooks/use-platform-os";
import { useInitiatives } from "@/plane-web/hooks/store/use-initiatives";
import { getInitiativeLabelsArray } from "./initiative-label-utils";

export interface IInitiativeLabelPropertyDropdownProps {
  workspaceSlug: string | null;
  value: string[];
  onChange: (data: string[]) => void;
  onClose?: () => void;
  disabled?: boolean;
  defaultOptions?: TInitiativeLabel[];
  hideDropdownArrow?: boolean;
  className?: string;
  buttonClassName?: string;
  optionsClassName?: string;
  placement?: Placement;
  maxRender?: number;
  renderByDefault?: boolean;
  fullWidth?: boolean;
  fullHeight?: boolean;
  label: React.ReactNode;
}

export function InitiativeLabelPropertyDropdown(props: IInitiativeLabelPropertyDropdownProps) {
  const {
    workspaceSlug,
    value,
    onChange,
    onClose,
    disabled,
    defaultOptions = [],
    hideDropdownArrow = false,
    className,
    buttonClassName = "",
    optionsClassName = "",
    placement,
    maxRender = 2,
    renderByDefault = true,
    fullWidth = false,
    fullHeight = false,
    label,
  } = props;
  const { t } = useTranslation();

  //router
  const { workspaceSlug: routerWorkspaceSlug } = useParams();
  const currentWorkspaceSlug = workspaceSlug || routerWorkspaceSlug?.toString();

  //states
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [query, setQuery] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  //refs
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // popper-js refs
  const [referenceElement, setReferenceElement] = useState<HTMLButtonElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);

  //hooks
  const {
    initiative: { fetchInitiativeLabels, getInitiativesLabels, createInitiativeLabel },
  } = useInitiatives();
  const { isMobile } = usePlatformOS();
  const storeLabels = getInitiativesLabels(currentWorkspaceSlug);
  const { allowPermissions } = useUserPermissions();

  const canCreateLabel =
    currentWorkspaceSlug &&
    allowPermissions([EUserWorkspaceRoles.ADMIN], EUserPermissionsLevel.WORKSPACE, currentWorkspaceSlug);

  const initiativeLabels = getInitiativeLabelsArray(storeLabels, defaultOptions);

  const options = useMemo(
    () =>
      initiativeLabels.map((label) => ({
        value: label?.id,
        query: label?.name,
        content: (
          <div className="flex items-center justify-start gap-2 overflow-hidden">
            <span
              className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
              style={{
                backgroundColor: label?.color,
              }}
            />
            <div className="line-clamp-1 inline-block truncate">{label?.name}</div>
          </div>
        ),
      })),
    [initiativeLabels]
  );

  const filteredOptions = useMemo(
    () =>
      query === "" ? options : options?.filter((option) => option.query.toLowerCase().includes(query.toLowerCase())),
    [options, query]
  );

  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: placement ?? "bottom-start",
    modifiers: [
      {
        name: "preventOverflow",
        options: {
          padding: 12,
        },
      },
    ],
  });

  const onOpen = useCallback(() => {
    if (!storeLabels && currentWorkspaceSlug)
      fetchInitiativeLabels(currentWorkspaceSlug).then(() => setIsLoading(false));
  }, [storeLabels, currentWorkspaceSlug, fetchInitiativeLabels]);

  const toggleDropdown = useCallback(() => {
    if (!isOpen) onOpen();
    setIsOpen((prevIsOpen) => !prevIsOpen);
    if (isOpen && onClose) onClose();
  }, [onOpen, onClose, isOpen]);

  const handleClose = () => {
    if (!isOpen) return;
    setIsOpen(false);
    setQuery("");
    if (onClose) onClose();
  };

  const handleAddLabel = async (labelName: string) => {
    if (!currentWorkspaceSlug) return;
    setSubmitting(true);
    const label = await createInitiativeLabel(currentWorkspaceSlug, { name: labelName, color: getRandomLabelColor() });
    onChange([...value, label.id]);
    setQuery("");
    setSubmitting(false);
  };

  const searchInputKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (query !== "" && e.key === "Escape") {
      setQuery("");
      e.preventDefault();
    }

    if (query !== "" && e.key === "Enter" && !e.nativeEvent.isComposing && canCreateLabel) {
      e.preventDefault();
      await handleAddLabel(query);
    }
  };
  const handleKeyDown = useDropdownKeyDown(toggleDropdown, handleClose);

  const handleOnClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.stopPropagation();
      e.preventDefault();
      toggleDropdown();
    },
    [toggleDropdown]
  );

  useEffect(() => {
    if (isOpen && inputRef.current && !isMobile) {
      inputRef.current.focus();
    }
  }, [isOpen, isMobile]);

  useOutsideClickDetector(dropdownRef, handleClose);

  const comboButton = useMemo(
    () => (
      <button
        ref={setReferenceElement}
        type="button"
        className={`clickable flex w-full h-full items-center justify-center gap-1 text-11 ${fullWidth && "hover:bg-layer-1-hover"} ${
          disabled
            ? "cursor-not-allowed text-secondary"
            : value.length <= maxRender
              ? "cursor-pointer"
              : "cursor-pointer hover:bg-layer-1-hover"
        }  ${buttonClassName}`}
        onClick={handleOnClick}
        disabled={disabled}
      >
        {label}
        {!hideDropdownArrow && !disabled && <ChevronDownIcon className="h-3 w-3" aria-hidden="true" />}
      </button>
    ),
    [buttonClassName, disabled, fullWidth, handleOnClick, hideDropdownArrow, label, maxRender, value.length]
  );

  const preventPropagation = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    e.preventDefault();
  };

  return (
    <div className={`${fullHeight ? "h-full" : "h-5"}`} onClick={preventPropagation}>
      <ComboDropDown
        as="div"
        ref={dropdownRef}
        className={`w-auto max-w-full h-full flex-shrink-0 text-left ${className}`}
        value={value}
        onChange={onChange}
        disabled={disabled}
        onKeyDown={handleKeyDown}
        button={comboButton}
        renderByDefault={renderByDefault}
        multiple
      >
        {isOpen && (
          <Combobox.Options className="fixed z-10" static>
            <div
              className={`z-10 my-1 w-48 h-auto whitespace-nowrap rounded border border-subtle-1 bg-surface-1 px-2 py-2.5 text-11 shadow-raised-200 focus:outline-none ${optionsClassName}`}
              ref={setPopperElement}
              style={styles.popper}
              {...attributes.popper}
            >
              <div className="flex w-full items-center justify-start rounded border border-subtle bg-layer-1 px-2">
                <Search className="h-3.5 w-3.5 text-tertiary" />
                <Combobox.Input
                  ref={inputRef}
                  className="w-full bg-transparent px-2 py-1 text-11 text-secondary placeholder:text-placeholder focus:outline-none"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("common.search.label")}
                  displayValue={(assigned: TInitiativeLabel) => assigned?.name || ""}
                  onKeyDown={searchInputKeyDown}
                />
              </div>
              <div className={`mt-2 max-h-48 space-y-1 overflow-y-scroll`}>
                {isLoading ? (
                  <p className="text-center text-secondary">{t("common.loading")}</p>
                ) : filteredOptions.length > 0 ? (
                  filteredOptions.map((option) => (
                    <Combobox.Option
                      key={option.value}
                      value={option.value}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          e.stopPropagation();
                        }
                      }}
                      className={({ active, selected }) =>
                        `flex cursor-pointer select-none items-center justify-between gap-2 truncate rounded px-1 py-1.5 hover:bg-layer-1-hover ${
                          active ? "bg-layer-1-active" : ""
                        } ${selected ? "text-primary" : "text-secondary"}`
                      }
                    >
                      {({ selected }) => (
                        <>
                          {option.content}
                          {selected && (
                            <div className="flex-shrink-0">
                              <CheckIcon className={`h-3.5 w-3.5`} />
                            </div>
                          )}
                        </>
                      )}
                    </Combobox.Option>
                  ))
                ) : submitting ? (
                  <Loader className="animate-spin h-3.5 w-3.5" />
                ) : canCreateLabel ? (
                  <p
                    onClick={() => {
                      if (!query.length) return;
                      handleAddLabel(query);
                    }}
                    className={`text-left text-secondary ${query.length ? "cursor-pointer" : "cursor-default"}`}
                  >
                    {query.length ? (
                      <>
                        + Add <span className="text-primary">&quot;{query}&quot;</span> to labels
                      </>
                    ) : (
                      t("label.create.type")
                    )}
                  </p>
                ) : (
                  <p className="text-left text-secondary ">{t("common.search.no_matching_results")}</p>
                )}
              </div>
            </div>
          </Combobox.Options>
        )}
      </ComboDropDown>
    </div>
  );
}
