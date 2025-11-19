import React, { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import type { EIssuePropertyType, TIssueProperty } from "@plane/types";
import { Calendar } from "../../calendar";
import { Popover } from "../../popover";
import { cn } from "../../utils";

type TDateSelectProps = {
  property: TIssueProperty<EIssuePropertyType.DATETIME>;
  isPreview?: boolean;
  required?: boolean;
};

export const DateSelect: React.FC<TDateSelectProps> = ({ property, isPreview = false, required = false }) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const [isOpen, setIsOpen] = useState(false);
  const fieldName = `${property.id}`;
  const error = errors[fieldName];

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  return (
    <div className="w-full space-y-1">
      <label htmlFor={fieldName} className="text-sm font-medium text-custom-text-300">
        {property.display_name}
        {(required || property.is_required) && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      <Controller
        control={control}
        name={fieldName}
        rules={{
          required: (required || property.is_required) && `${property.display_name} is required`,
        }}
        render={({ field: { value, onChange } }) => (
          <Popover open={isOpen && !isPreview} onOpenChange={setIsOpen}>
            <Popover.Button
              className={cn(
                "flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm focus:outline-none",
                {
                  "border-custom-border-300": !error,
                  "border-red-500": error,
                  "cursor-not-allowed opacity-60": isPreview,
                }
              )}
              disabled={isPreview}
            >
              <span
                className={cn("text-custom-text-200", {
                  "text-custom-text-400": !value,
                })}
              >
                {value ? formatDate(value) : `Select ${property.display_name?.toLowerCase() || "date"}`}
              </span>
            </Popover.Button>
            <Popover.Panel
              className="rounded-md border border-custom-border-200 bg-custom-background-100 shadow-lg"
              side="bottom"
              align="start"
              sideOffset={8}
              positionerClassName="z-30"
            >
              <Calendar
                mode="single"
                selected={value ? new Date(value) : undefined}
                onSelect={(date) => {
                  if (date) {
                    onChange(date.toISOString().split("T")[0]);
                    setIsOpen(false);
                  }
                }}
                disabled={isPreview}
              />
            </Popover.Panel>
          </Popover>
        )}
      />
      {error && <span className="text-xs text-red-500">{error.message as string}</span>}
    </div>
  );
};
