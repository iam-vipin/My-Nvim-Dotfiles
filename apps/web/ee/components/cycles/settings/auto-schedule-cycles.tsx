"use client";

import React, { useState } from "react";
import { isEmpty } from "lodash-es";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
// plane imports
import useSWR from "swr";
import { InfoIcon } from "@plane/propel/icons";
import { setPromiseToast } from "@plane/propel/toast";
import { Tooltip } from "@plane/propel/tooltip";
import { TCycleConfig } from "@plane/types";
import { Input, ToggleSwitch, CustomSelect, Button } from "@plane/ui";
import { renderFormattedPayloadDate, getDate } from "@plane/utils";
// components
import { DateDropdown } from "@/components/dropdowns/date";
//services
import { useFlag } from "@/plane-web/hooks/store";
import { useProjectAdvanced } from "@/plane-web/hooks/store/projects/use-projects";
import { cycleService } from "@/plane-web/services/cycle.service";

const defaultValues: Partial<TCycleConfig> = {
  title: "",
  cycle_duration: 0,
  cooldown_period: 0,
  start_date: null,
  number_of_cycles: 0,
  is_auto_rollover_enabled: false,
};

const cycleCountOptions = [
  { value: 1, label: "1 cycle" },
  { value: 2, label: "2 cycles" },
  { value: 3, label: "3 cycles" },
];

export const AutoScheduleCycles = observer(() => {
  const { workspaceSlug, projectId } = useParams();

  const { control, handleSubmit, reset } = useForm<TCycleConfig>({
    defaultValues,
  });

  // states
  const [isEdit, setIsEdit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  //hooks
  const { isProjectFeatureEnabled, toggleProjectFeatures } = useProjectAdvanced();

  // derived values
  const isFeatureFlagEnabled = useFlag(workspaceSlug.toString(), "AUTO_SCHEDULE_CYCLES");
  const isAutoScheduleEnabled = isProjectFeatureEnabled(projectId.toString(), "is_automated_cycle_enabled");

  const fetchCycleConfig = async () => {
    const cycleConfig = await cycleService.getCycleConfig(workspaceSlug.toString(), projectId.toString());
    if (isEmpty(cycleConfig)) {
      reset(defaultValues);
      return;
    } else {
      handleSetFormData(cycleConfig);
    }
  };

  useSWR(
    workspaceSlug && projectId && isFeatureFlagEnabled && isAutoScheduleEnabled
      ? `cycle-config-${workspaceSlug}-${projectId}`
      : null,
    workspaceSlug && projectId && isFeatureFlagEnabled && isAutoScheduleEnabled ? fetchCycleConfig : null,
    {
      revalidateOnFocus: false,
    }
  );

  if (!isFeatureFlagEnabled) return null;

  const handleReset = () => {
    setIsEdit(false);
    fetchCycleConfig();
  };

  const handleSetFormData = (data: Partial<TCycleConfig>) => {
    reset({
      ...data,
      cycle_duration: data.cycle_duration ? data.cycle_duration / 7 : 0,
    });
  };

  const onSubmit = async (data: Partial<TCycleConfig>) => {
    setIsSubmitting(true);
    const payload: Partial<TCycleConfig> = {
      ...data,
      cycle_duration: data.cycle_duration ? data.cycle_duration * 7 : 0,
    };
    const promise = data?.id
      ? cycleService.updateCycleConfig(workspaceSlug.toString(), projectId.toString(), payload)
      : cycleService.scheduleCycle(workspaceSlug.toString(), projectId.toString(), payload);

    const toastPromise = promise
      .then((response) => {
        handleSetFormData(response);
        setIsEdit(false);
      })
      .catch((error) => {
        throw error;
      })
      .finally(() => {
        setIsSubmitting(false);
      });

    setPromiseToast(toastPromise, {
      loading: "Saving auto-schedule cycles configuration",
      success: {
        title: "Success!",
        message: () =>
          data.id
            ? "Auto-schedule cycles configuration updated successfully."
            : "Auto-schedule cycles configuration saved successfully.",
      },
      error: {
        title: "Error!",
        message: () =>
          data.id
            ? "Failed to update auto-schedule cycles configuration."
            : "Failed to save auto-schedule cycles configuration.",
      },
    });
  };

  const toggleScheduleCycle = async (enabled: boolean) => {
    const promise = toggleProjectFeatures(
      workspaceSlug.toString(),
      projectId.toString(),
      {
        is_automated_cycle_enabled: enabled,
      },
      enabled
    );

    setPromiseToast(promise, {
      loading: enabled ? "Enabling auto-schedule cycles" : "Disabling auto-schedule cycles",
      success: { title: "Success!", message: () => "Auto-schedule cycles toggled successfully." },
      error: { title: "Error!", message: () => "Failed to toggle auto-schedule cycles." },
    });

    if (enabled) {
      setIsEdit(true);
    }
  };

  return (
    <div className="space-y-2">
      {/* Main toggle */}
      <div className="gap-x-8 gap-y-2 bg-custom-background-100 py-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="text-sm font-medium leading-5 flex items-center gap-1">
              Auto-schedule cycles
              <Tooltip tooltipContent="Automatically create new cycles based on your chosen schedule." position="right">
                <div>
                  <InfoIcon className="size-3 text-custom-text-400" />
                </div>
              </Tooltip>
            </h4>
            <p className="text-sm leading-5 tracking-tight text-custom-text-300">
              Keep cycles moving without manual setup.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isAutoScheduleEnabled && !isEdit && (
              <Button type="button" variant="neutral-primary" size="sm" onClick={() => setIsEdit(true)}>
                Edit
              </Button>
            )}
            <ToggleSwitch value={isAutoScheduleEnabled} onChange={toggleScheduleCycle} size="sm" />
          </div>
        </div>
      </div>

      {/* Configuration form - only show when enabled */}
      {isAutoScheduleEnabled && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="border border-custom-border-200 bg-custom-background-90 p-4 rounded-lg space-y-5">
            {/* Cycle Title */}
            <div className="flex justify-between items-center">
              <div className="w-2/3">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium">Cycle Title</span>
                  <Tooltip
                    tooltipContent="The title will be appended with numbers for subsequent cycles. For eg: Design - 1/2/3"
                    position="right"
                  >
                    <div>
                      <InfoIcon className="size-3 text-custom-text-400" />
                    </div>
                  </Tooltip>
                </div>
              </div>
              <div className="w-1/3">
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      className="bg-custom-background-100 w-full px-3 py-2 rounded-md border-[0.5px] border-custom-border-200 text-sm"
                      placeholder="Title"
                      disabled={!isEdit}
                    />
                  )}
                />
              </div>
            </div>
            {/* Cycle Duration */}
            <div className="flex justify-between items-center">
              <div className="w-2/3">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium">Cycle Duration</span>
                </div>
              </div>
              <div className="w-1/3">
                <div className="flex items-center gap-1 w-full">
                  <Controller
                    name="cycle_duration"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        className="bg-custom-background-100 w-1/2 px-3 py-2 rounded-md border-[0.5px] border-custom-border-200 text-sm"
                        placeholder="1"
                        type="number"
                        max={30}
                        disabled={!isEdit}
                      />
                    )}
                  />
                  <span className="text-sm text-custom-text-200">Weeks</span>
                </div>
              </div>
            </div>
            {/* Cool down Period*/}
            <div className="flex justify-between items-center">
              <div className="w-2/3">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium">Cooldown Period</span>
                  <Tooltip tooltipContent="Pause between cycles before the next begins." position="right">
                    <div>
                      <InfoIcon className="size-3 text-custom-text-400" />
                    </div>
                  </Tooltip>
                </div>
              </div>
              <div className="w-1/3">
                <div className="flex items-center gap-1 w-full">
                  <Controller
                    name="cooldown_period"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        className="bg-custom-background-100 w-1/2 px-3 py-2 rounded-md border-[0.5px] border-custom-border-200 text-sm"
                        placeholder="1"
                        type="number"
                        min={0}
                        disabled={!isEdit}
                      />
                    )}
                  />
                  <span className="text-sm text-custom-text-200">days</span>
                </div>
              </div>
            </div>
            {/* Cycle Start Date */}
            <div className="flex justify-between items-center">
              <div className="w-2/3">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium">Cycle starts day</span>
                </div>
              </div>
              <div className="w-1/3">
                <div className="flex items-center gap-1 w-full">
                  <Controller
                    name="start_date"
                    control={control}
                    render={({ field }) => (
                      <DateDropdown
                        value={getDate(field.value) || null}
                        onChange={(date) => field.onChange(renderFormattedPayloadDate(date) || "")}
                        minDate={new Date()}
                        buttonVariant="border-with-text"
                        className="w-full"
                        buttonClassName="bg-custom-background-100 px-3 py-2 rounded-md border-[0.5px] border-custom-border-200 text-left justify-start w-full text-sm"
                        showTooltip
                        disabled={!isEdit}
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Number of future cycles */}
            <div className="flex justify-between items-center">
              <div className="w-2/3">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium">Number of future cycles</span>
                </div>
              </div>
              <div className="w-1/3">
                <Controller
                  name="number_of_cycles"
                  control={control}
                  render={({ field }) => (
                    <CustomSelect
                      disabled={!isEdit}
                      value={field.value}
                      onChange={field.onChange}
                      className="w-full"
                      buttonClassName="bg-custom-background-100 px-3 py-2 rounded-md border-[0.5px] border-custom-border-200 text-left w-full text-sm"
                      label={cycleCountOptions.find((option) => option.value === field.value)?.label || "1 cycle"}
                    >
                      {cycleCountOptions.map((option) => (
                        <CustomSelect.Option key={option.value} value={option.value}>
                          {option.label}
                        </CustomSelect.Option>
                      ))}
                    </CustomSelect>
                  )}
                />
              </div>
            </div>

            {/* Auto-rollover work items */}
            <div className="flex justify-between items-center">
              <div className="w-2/3">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium">Auto-rollover work items</span>
                  <Tooltip
                    tooltipContent="On the day a cycle completes, move all unfinished work items into the next cycle."
                    position="right"
                  >
                    <div>
                      <InfoIcon className="size-3 text-custom-text-400" />
                    </div>
                  </Tooltip>
                </div>
              </div>
              <div className="w-1/3 flex justify-end">
                <Controller
                  name="is_auto_rollover_enabled"
                  control={control}
                  render={({ field }) => (
                    <ToggleSwitch value={field.value} onChange={field.onChange} disabled={!isEdit} size="sm" />
                  )}
                />
              </div>
            </div>

            {/* Action buttons */}
            {isEdit && (
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-custom-border-200">
                <Button type="button" variant="neutral-primary" size="sm" onClick={handleReset}>
                  Discard
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
                  Save
                </Button>
              </div>
            )}
          </div>
        </form>
      )}
    </div>
  );
});
