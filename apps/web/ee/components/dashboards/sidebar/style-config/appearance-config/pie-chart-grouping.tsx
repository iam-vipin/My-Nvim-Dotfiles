import { useCallback, useEffect } from "react";
import { debounce } from "lodash-es";
import { Controller, useFormContext } from "react-hook-form";
// plane imports
import { useTranslation } from "@plane/i18n";
import type { TDashboardWidget, TDashboardWidgetConfig } from "@plane/types";
import { Input, ToggleSwitch } from "@plane/ui";
// local components
import { WidgetPropertyWrapper } from "../../property-wrapper";

type Props = {
  handleConfigUpdate: (data: Partial<TDashboardWidgetConfig>) => Promise<void>;
};

export function PieChartGroupingConfig(props: Props) {
  const { handleConfigUpdate } = props;
  // translation
  const { t } = useTranslation();
  // form info
  const { control, watch } = useFormContext<TDashboardWidget>();
  // derived values
  const isGroupingEnabled = !!watch("config.group_thin_pieces");

  const debouncedConfigUpdate = useCallback(
    // eslint-disable-next-line react-hooks/use-memo
    debounce((updateData: Partial<TDashboardWidgetConfig>) => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      handleConfigUpdate(updateData);
    }, 500),
    [handleConfigUpdate]
  );

  useEffect(
    () => () => {
      debouncedConfigUpdate.cancel();
    },
    [debouncedConfigUpdate]
  );

  return (
    <div className="flex-shrink-0 space-y-1 text-13">
      <h6 className="font-medium text-secondary">{t("dashboards.widget.chart_types.pie_chart.group.label")}</h6>
      <WidgetPropertyWrapper
        title={t("dashboards.widget.chart_types.pie_chart.group.group_thin_pieces")}
        input={
          <Controller
            control={control}
            name="config.group_thin_pieces"
            render={({ field: { value, onChange } }) => (
              <div className="px-2">
                <ToggleSwitch
                  value={!!value}
                  onChange={(val) => {
                    onChange(val);
                    handleConfigUpdate({ group_thin_pieces: val });
                  }}
                />
              </div>
            )}
          />
        }
      />
      {isGroupingEnabled && (
        <>
          <WidgetPropertyWrapper
            title={t("dashboards.widget.chart_types.pie_chart.group.minimum_threshold.label")}
            input={
              <Controller
                control={control}
                name="config.minimum_threshold"
                render={({ field: { value, onChange } }) => (
                  <Input
                    type="number"
                    value={value ?? 1}
                    onChange={(e) => {
                      const val = e.target.value;
                      onChange(val);
                      if (val === undefined || val === null || val.trim() === "") return;
                      debouncedConfigUpdate({ minimum_threshold: Number(val) });
                    }}
                    className="hide-arrows w-full px-2 py-1 rounded-sm border-subtle-1 text-11"
                    placeholder={t("dashboards.widget.chart_types.pie_chart.group.minimum_threshold.placeholder")}
                    min={1}
                    max={100}
                    step={1}
                  />
                )}
              />
            }
          />
          <WidgetPropertyWrapper
            title={t("dashboards.widget.chart_types.pie_chart.group.name_group.label")}
            input={
              <Controller
                control={control}
                name="config.group_name"
                render={({ field: { value, onChange } }) => (
                  <Input
                    type="text"
                    value={value}
                    onChange={(e) => {
                      const val = e.target.value;
                      onChange(val);
                      if (!val || val.trim() === "") return;
                      debouncedConfigUpdate({ group_name: val });
                    }}
                    className="w-full px-2 py-1 rounded-sm border-subtle-1 text-11"
                    placeholder={t("dashboards.widget.chart_types.pie_chart.group.name_group.placeholder")}
                  />
                )}
              />
            }
          />
        </>
      )}
    </div>
  );
}
