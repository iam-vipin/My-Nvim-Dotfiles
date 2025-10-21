"use client";

import type { FC } from "react";
import { useState } from "react";
import { observer } from "mobx-react";
import { Check, Loader, Plus, Tag } from "lucide-react";

// plane imports
import { EUserPermissionsLevel } from "@plane/constants";
import { useTranslation } from "@plane/i18n";
import { Combobox } from "@plane/propel/combobox";
import { EUserWorkspaceRoles } from "@plane/types";
import type { TInitiativeLabel } from "@plane/types";
import { cn } from "@plane/utils";

// types
import { useUserPermissions } from "@/hooks/store/user";

export type TInitiativeLabelDropdownProps = {
  value: string[];
  onChange?: (value: string[]) => void;
  disabled?: boolean;
  buttonVariant?:
    | "border-with-text"
    | "border-without-text"
    | "background-with-text"
    | "background-without-text"
    | "transparent-with-text"
    | "transparent-without-text";
  buttonClassName?: string;
  className?: string;
  tabIndex?: number;
  showTooltip?: boolean;
  placeholder?: string;
  readonly?: boolean;
  labels?: Map<string, TInitiativeLabel>;
  onAddLabel?: (labelName: string) => Promise<TInitiativeLabel>;
  workspaceSlug?: string;
};

export const InitiativeLabelDropdown: FC<TInitiativeLabelDropdownProps> = observer((props) => {
  const {
    value,
    onChange,
    disabled = false,
    buttonClassName = "",
    className = "",
    placeholder = "Select label",
    readonly = false,
    labels = new Map(),
    onAddLabel,
    workspaceSlug,
  } = props;
  // plane hooks
  const { t } = useTranslation();
  const { allowPermissions } = useUserPermissions();

  // states
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // derived values
  const labelOptions = Array.from(labels.values()).map((label) => ({
    value: label.id,
    query: label.name,
    content: (
      <div className="flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
          style={{
            backgroundColor: label.color,
          }}
        />
        <span className="flex-grow truncate text-left text-xs">{label.name}</span>
      </div>
    ),
  }));

  const canCreateLabel = allowPermissions([EUserWorkspaceRoles.ADMIN], EUserPermissionsLevel.WORKSPACE, workspaceSlug);

  const filteredOptions =
    query === ""
      ? labelOptions
      : labelOptions?.filter((option) => option.query.toLowerCase().includes(query.toLowerCase()));

  const selectedLabels = labelOptions.filter((option) => value.includes(option.value));

  const handleValueChange = (newValue: string | string[]) => {
    onChange?.(newValue as string[]);
  };

  const handleAddLabel = async (labelName: string) => {
    if (!labelName.length || !onAddLabel) return;
    setSubmitting(true);
    try {
      const newLabel = await onAddLabel(labelName);
      onChange?.([...value, newLabel.id]);
      setQuery("");
    } catch (error) {
      console.error("Error creating label:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateLabel = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (query.length) {
      handleAddLabel(query);
    }
  };

  return (
    <div className={className}>
      <Combobox
        value={value || []}
        onValueChange={handleValueChange}
        disabled={disabled || readonly}
        open={isOpen}
        onOpenChange={setIsOpen}
        multiSelect
      >
        <Combobox.Button
          className={cn(
            "flex h-full w-full items-center justify-between gap-1 border border-custom-border-300 rounded px-2 py-1 text-xs hover:bg-custom-background-80",
            buttonClassName
          )}
          disabled={disabled || readonly}
        >
          <div className="flex items-center gap-2">
            {selectedLabels.length > 0 ? (
              <SelectedLabelsDisplay selectedLabels={selectedLabels} allLabels={labels} />
            ) : (
              <PlaceholderDisplay placeholder={placeholder} />
            )}
          </div>
        </Combobox.Button>
        <Combobox.Options
          showSearch
          searchPlaceholder={t("common.search.label")}
          emptyMessage=""
          maxHeight="md"
          className="w-48 rounded border-[0.5px] border-custom-border-300 bg-custom-background-100 px-2 py-2.5 text-xs shadow-custom-shadow-rg"
          positionerClassName="z-50"
          searchQuery={query}
          onSearchQueryChange={setQuery}
          onSearchQueryKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (filteredOptions.length === 0 && e.key === "Enter" && query.length && !submitting) {
              handleCreateLabel(e);
            }
          }}
        >
          <div className="vertical-scrollbar scrollbar-sm max-h-48 space-y-1 overflow-y-scroll">
            {submitting ? (
              <div className="flex items-center justify-center py-2">
                <Loader className="h-3.5 w-3.5 animate-spin" />
              </div>
            ) : filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <Combobox.Option
                  key={option.value}
                  value={option.value}
                  className="w-full truncate flex items-center justify-between gap-2 rounded px-1 py-1.5 cursor-pointer select-none hover:bg-custom-background-80 text-custom-text-200"
                >
                  <span className="flex-grow truncate">{option.content}</span>
                  {value.includes(option.value) && <Check className="h-3.5 w-3.5 flex-shrink-0" />}
                </Combobox.Option>
              ))
            ) : canCreateLabel && query ? (
              <button
                onClick={handleCreateLabel}
                className={`text-left text-custom-text-200 flex items-center gap-2 px-1 py-1.5 rounded hover:bg-custom-background-80 w-full whitespace-nowrap overflow-auto ${
                  query.length ? "cursor-pointer" : "cursor-default"
                }`}
              >
                <Plus className="h-3.5 w-3.5 flex-shrink-0" />
                {query.length ? (
                  <>
                    Add <span className="text-custom-text-100">&quot;{query}&quot;</span> to labels
                  </>
                ) : (
                  "Create new label"
                )}
              </button>
            ) : (
              <p className="text-left text-custom-text-200 px-1 py-1.5">{t("common.search.no_matching_results")}</p>
            )}
          </div>
        </Combobox.Options>
      </Combobox>
    </div>
  );
});

const SelectedLabelsDisplay: FC<{
  selectedLabels: Array<{ value: string; query: string }>;
  allLabels: Map<string, TInitiativeLabel>;
}> = ({ selectedLabels, allLabels }) => {
  const isSingleSelection = selectedLabels.length === 1;

  if (isSingleSelection) {
    const selectedLabel = allLabels.get(selectedLabels[0].value);
    return (
      <div className="flex items-center gap-1">
        <ColorDot color={selectedLabel?.color} />
        <span className="text-xs">{selectedLabels[0].query}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <ColorDot color={allLabels.get(selectedLabels[0].value)?.color} />
      <span className="text-xs">{selectedLabels.length} Labels</span>
    </div>
  );
};

const PlaceholderDisplay: FC<{ placeholder: string }> = ({ placeholder }) => (
  <div className="text-custom-text-400 flex items-center gap-2">
    <Tag size={14} />
    {placeholder}
  </div>
);

const ColorDot: FC<{ color?: string }> = ({ color }) => (
  <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: color || "#000" }} />
);
