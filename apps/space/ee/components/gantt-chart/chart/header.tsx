import { observer } from "mobx-react";
import { Expand, Shrink } from "lucide-react";

type Props = {
  fullScreenMode: boolean;
  handleToday: () => void;
  toggleFullScreenMode: () => void;
};

export const GanttChartHeader = observer(function GanttChartHeader(props: Props) {
  const { fullScreenMode, handleToday, toggleFullScreenMode } = props;
  // chart hook

  return (
    <div className="relative flex w-full flex-shrink-0 flex-wrap items-center gap-2 whitespace-nowrap px-2.5 py-2 justify-end">
      <button type="button" className="rounded-sm p-1 px-2 text-11 hover:bg-layer-1" onClick={handleToday}>
        Today
      </button>

      <button
        type="button"
        className="flex items-center justify-center rounded-sm border border-subtle-1 p-1 transition-all hover:bg-layer-1"
        onClick={toggleFullScreenMode}
      >
        {fullScreenMode ? <Shrink className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
      </button>
    </div>
  );
});
