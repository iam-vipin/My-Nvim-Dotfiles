import type { FC } from "react";
import { observer } from "mobx-react";

// TODO: Implement the WorklogDownloadEmptyScreen component and change the test based on the filters applied
export const WorklogDownloadEmptyScreen = observer(function WorklogDownloadEmptyScreen() {
  return (
    <div className="flex justify-center items-center text-sm text-custom-text-300 py-10">
      No worklog downloads found
    </div>
  );
});
