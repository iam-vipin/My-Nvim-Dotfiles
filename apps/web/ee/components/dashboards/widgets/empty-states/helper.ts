// plane imports
import type { EWidgetChartTypes } from "@plane/types";
// assets
import areaChartDark from "@/app/assets/empty-state/dashboards/widgets/charts/area_chart-dark.webp?url";
import areaChartLight from "@/app/assets/empty-state/dashboards/widgets/charts/area_chart-light.webp?url";
import barChartDark from "@/app/assets/empty-state/dashboards/widgets/charts/bar_chart-dark.webp?url";
import barChartLight from "@/app/assets/empty-state/dashboards/widgets/charts/bar_chart-light.webp?url";
import donutChartDark from "@/app/assets/empty-state/dashboards/widgets/charts/donut_chart-dark.webp?url";
import donutChartLight from "@/app/assets/empty-state/dashboards/widgets/charts/donut_chart-light.webp?url";
import lineChartDark from "@/app/assets/empty-state/dashboards/widgets/charts/line_chart-dark.webp?url";
import lineChartLight from "@/app/assets/empty-state/dashboards/widgets/charts/line_chart-light.webp?url";
import numberDark from "@/app/assets/empty-state/dashboards/widgets/charts/number-dark.webp?url";
import numberLight from "@/app/assets/empty-state/dashboards/widgets/charts/number-light.webp?url";
import pieChartDark from "@/app/assets/empty-state/dashboards/widgets/charts/pie_chart-dark.webp?url";
import pieChartLight from "@/app/assets/empty-state/dashboards/widgets/charts/pie_chart-light.webp?url";

export const CHART_ASSET_MAP: Record<EWidgetChartTypes, { dark: string; light: string }> = {
  AREA_CHART: { dark: areaChartDark, light: areaChartLight },
  BAR_CHART: { dark: barChartDark, light: barChartLight },
  DONUT_CHART: { dark: donutChartDark, light: donutChartLight },
  LINE_CHART: { dark: lineChartDark, light: lineChartLight },
  NUMBER: { dark: numberDark, light: numberLight },
  PIE_CHART: { dark: pieChartDark, light: pieChartLight },
};
