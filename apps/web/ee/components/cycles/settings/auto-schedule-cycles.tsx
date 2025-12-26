import React, { useState } from "react";
import { isEmpty } from "lodash-es";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import useSWR from "swr";
// plane imports
import { useTranslation } from "@plane/i18n";
import { InfoIcon } from "@plane/propel/icons";
import { setPromiseToast } from "@plane/propel/toast";
import { Tooltip } from "@plane/propel/tooltip";
import type { TCycleConfig } from "@plane/types";
import { Button } from "@plane/propel/button";
import { Input, ToggleSwitch, CustomSelect, Loader } from "@plane/ui";
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

export const AutoScheduleCycles = observer(function AutoScheduleCycles() {
  const { workspaceSlug, projectId } = useParams();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TCycleConfig>({
    defaultValues,
  });

  // states
  const [isEdit, setIsEdit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  //hooks
  const { t } = useTranslation();
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

  const { isLoading } = useSWR(
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
      loading: t("project_settings.cycles.auto_schedule.toast.save.loading"),
      success: {
        title: t("project_settings.cycles.auto_schedule.toast.save.success.title"),
        message: () =>
          data.id
            ? t("project_settings.cycles.auto_schedule.toast.save.success.message_update")
            : t("project_settings.cycles.auto_schedule.toast.save.success.message_create"),
      },
      error: {
        title: t("project_settings.cycles.auto_schedule.toast.save.error.title"),
        message: () =>
          data.id
            ? t("project_settings.cycles.auto_schedule.toast.save.error.message_update")
            : t("project_settings.cycles.auto_schedule.toast.save.error.message_create"),
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
      loading: enabled
        ? t("project_settings.cycles.auto_schedule.toast.toggle.loading_enable")
        : t("project_settings.cycles.auto_schedule.toast.toggle.loading_disable"),
      success: {
        title: t("project_settings.cycles.auto_schedule.toast.toggle.success.title"),
        message: () => t("project_settings.cycles.auto_schedule.toast.toggle.success.message"),
      },
      error: {
        title: t("project_settings.cycles.auto_schedule.toast.toggle.error.title"),
        message: () => t("project_settings.cycles.auto_schedule.toast.toggle.error.message"),
      },
    });

    if (enabled) {
      setIsEdit(true);
    }
  };

  return (
    <div className="space-y-2">
      {/* Main toggle */}
      <div className="gap-x-8 gap-y-2 bg-surface-1 py-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="text-13 font-medium leading-5 flex items-center gap-1">
              {t("project_settings.cycles.auto_schedule.heading")}
              <Tooltip tooltipContent={t("project_settings.cycles.auto_schedule.tooltip")} position="right">
                <div>
                  <InfoIcon className="size-3 text-placeholder" />
                </div>
              </Tooltip>
            </h4>
            <p className="text-13 leading-5 tracking-tight text-tertiary">
              {t("project_settings.cycles.auto_schedule.description")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isAutoScheduleEnabled && !isEdit && !isLoading && (
              <Button type="button" variant="secondary" onClick={() => setIsEdit(true)}>
                {t("project_settings.cycles.auto_schedule.edit_button")}
              </Button>
            )}
            <ToggleSwitch value={isAutoScheduleEnabled} onChange={toggleScheduleCycle} size="sm" />
          </div>
        </div>
      </div>

      {/* Configuration form - only show when enabled */}
      {isAutoScheduleEnabled && (
        <div className="border border-subtle-1 bg-layer-1/80 p-4 rounded-lg">
          {isLoading ? (
            <Loader className="space-y-5">
              <div className="flex justify-between items-center">
                <Loader.Item height="10px" width="120px" />
                <Loader.Item height="30px" width="250px" />
              </div>
              <div className="flex justify-between items-center">
                <Loader.Item height="10px" width="140px" />
                <Loader.Item height="30px" width="250px" />
              </div>
              <div className="flex justify-between items-center">
                <Loader.Item height="10px" width="110px" />
                <Loader.Item height="30px" width="250px" />
              </div>
              <div className="flex justify-between items-center">
                <Loader.Item height="10px" width="160px" />
                <Loader.Item height="30px" width="250px" />
              </div>
              <div className="flex justify-between items-center">
                <Loader.Item height="10px" width="130px" />
                <Loader.Item height="30px" width="250px" />
              </div>
              <div className="flex justify-between items-center">
                <Loader.Item height="10px" width="150px" />
                <Loader.Item height="30px" width="250px" />
              </div>
            </Loader>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Cycle Title */}
              <div className="flex justify-between items-center">
                <div className="w-2/3">
                  <div className="flex items-center gap-1">
                    <span className="text-13 font-medium">
                      {t("project_settings.cycles.auto_schedule.form.cycle_title.label")}
                    </span>
                    <Tooltip
                      tooltipContent={t("project_settings.cycles.auto_schedule.form.cycle_title.tooltip")}
                      position="right"
                    >
                      <div>
                        <InfoIcon className="size-3 text-placeholder" />
                      </div>
                    </Tooltip>
                  </div>
                </div>
                <div className="w-1/3">
                  <Controller
                    name="title"
                    control={control}
                    rules={{
                      required: t("project_settings.cycles.auto_schedule.form.cycle_title.validation.required"),
                      maxLength: {
                        value: 255,
                        message: t("project_settings.cycles.auto_schedule.form.cycle_title.validation.max_length"),
                      },
                    }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        className="bg-surface-1 w-full px-3 py-2 rounded-md border-[0.5px] border-subtle-1 text-13"
                        placeholder={t("project_settings.cycles.auto_schedule.form.cycle_title.placeholder")}
                        disabled={!isEdit}
                      />
                    )}
                  />
                  {errors.title && <span className="text-11 text-danger-primary">{errors.title.message}</span>}
                </div>
              </div>
              {/* Cycle Duration */}
              <div className="flex justify-between items-center">
                <div className="w-2/3">
                  <div className="flex items-center gap-1">
                    <span className="text-13 font-medium">
                      {t("project_settings.cycles.auto_schedule.form.cycle_duration.label")}
                    </span>
                  </div>
                </div>
                <div className="w-1/3">
                  <div className="flex flex-col gap-1 w-full">
                    <div className="flex items-center gap-1 w-full">
                      <Controller
                        name="cycle_duration"
                        control={control}
                        rules={{
                          required: t("project_settings.cycles.auto_schedule.form.cycle_duration.validation.required"),
                        }}
                        render={({ field }) => (
                          <Input
                            {...field}
                            className="bg-surface-1 w-1/2 px-3 py-2 rounded-md border-[0.5px] border-subtle-1 text-13"
                            placeholder="1"
                            type="number"
                            min={1}
                            max={30}
                            disabled={!isEdit}
                          />
                        )}
                      />
                      <span className="text-13 text-secondary">
                        {t("project_settings.cycles.auto_schedule.form.cycle_duration.unit")}
                      </span>
                    </div>
                    {errors.cycle_duration && (
                      <span className="text-11 text-danger-primary">{errors.cycle_duration.message}</span>
                    )}
                  </div>
                </div>
              </div>
              {/* Cool down Period*/}
              <div className="flex justify-between items-center">
                <div className="w-2/3">
                  <div className="flex items-center gap-1">
                    <span className="text-13 font-medium">
                      {t("project_settings.cycles.auto_schedule.form.cooldown_period.label")}
                    </span>
                    <Tooltip
                      tooltipContent={t("project_settings.cycles.auto_schedule.form.cooldown_period.tooltip")}
                      position="right"
                    >
                      <div>
                        <InfoIcon className="size-3 text-placeholder" />
                      </div>
                    </Tooltip>
                  </div>
                </div>
                <div className="w-1/3">
                  <div className="flex flex-col gap-1 w-full">
                    <div className="flex items-center gap-1 w-full">
                      <Controller
                        name="cooldown_period"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            className="bg-surface-1 w-1/2 px-3 py-2 rounded-md border-[0.5px] border-subtle-1 text-13"
                            placeholder="1"
                            type="number"
                            min={0}
                            disabled={!isEdit}
                          />
                        )}
                      />
                      <span className="text-13 text-secondary">
                        {t("project_settings.cycles.auto_schedule.form.cooldown_period.unit")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Cycle Start Date */}
              <div className="flex justify-between items-center">
                <div className="w-2/3">
                  <div className="flex items-center gap-1">
                    <span className="text-13 font-medium">
                      {t("project_settings.cycles.auto_schedule.form.start_date.label")}
                    </span>
                  </div>
                </div>
                <div className="w-1/3">
                  <div className="flex flex-col gap-1 w-full">
                    <div className="flex items-center gap-1 w-full">
                      <Controller
                        name="start_date"
                        control={control}
                        rules={{
                          required: t("project_settings.cycles.auto_schedule.form.start_date.validation.required"),
                          validate: (value) => {
                            if (!value)
                              return t("project_settings.cycles.auto_schedule.form.start_date.validation.required");
                            const selectedDate = new Date(value);
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            if (selectedDate < today) {
                              return t("project_settings.cycles.auto_schedule.form.start_date.validation.past");
                            }
                            return true;
                          },
                        }}
                        render={({ field }) => (
                          <DateDropdown
                            value={getDate(field.value) || null}
                            onChange={(date) => field.onChange(renderFormattedPayloadDate(date) || "")}
                            minDate={new Date()}
                            buttonVariant="border-with-text"
                            className="w-full"
                            buttonClassName="bg-surface-1 px-3 py-2 rounded-md border-[0.5px] border-subtle-1 text-left justify-start w-full text-13"
                            showTooltip
                            disabled={!isEdit}
                          />
                        )}
                      />
                    </div>
                    {errors.start_date && (
                      <span className="text-11 text-danger-primary">{errors.start_date.message}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Number of future cycles */}
              <div className="flex justify-between items-center">
                <div className="w-2/3">
                  <div className="flex items-center gap-1">
                    <span className="text-13 font-medium">
                      {t("project_settings.cycles.auto_schedule.form.number_of_cycles.label")}
                    </span>
                  </div>
                </div>
                <div className="w-1/3">
                  <div className="flex flex-col gap-1 w-full">
                    <Controller
                      name="number_of_cycles"
                      control={control}
                      rules={{
                        required: t("project_settings.cycles.auto_schedule.form.number_of_cycles.validation.required"),
                      }}
                      render={({ field }) => (
                        <CustomSelect
                          disabled={!isEdit}
                          value={field.value}
                          onChange={field.onChange}
                          className="w-full"
                          buttonClassName="bg-surface-1 px-3 py-2 rounded-md border-[0.5px] border-subtle-1 text-left w-full text-13"
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
                    {errors.number_of_cycles && (
                      <span className="text-11 text-danger-primary">{errors.number_of_cycles.message}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Auto-rollover work items */}
              <div className="flex justify-between items-center">
                <div className="w-2/3">
                  <div className="flex items-center gap-1">
                    <span className="text-13 font-medium">
                      {t("project_settings.cycles.auto_schedule.form.auto_rollover.label")}
                    </span>
                    <Tooltip
                      tooltipContent={t("project_settings.cycles.auto_schedule.form.auto_rollover.tooltip")}
                      position="right"
                    >
                      <div>
                        <InfoIcon className="size-3 text-placeholder" />
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
                <div className="flex items-center justify-end gap-2 pt-4 border-t border-subtle-1">
                  <Button type="button" variant="secondary" onClick={handleReset}>
                    {t("common.discard")}
                  </Button>
                  <Button type="submit" variant="primary" disabled={isSubmitting}>
                    {t("save")}
                  </Button>
                </div>
              )}
            </form>
          )}
        </div>
      )}
    </div>
  );
});
