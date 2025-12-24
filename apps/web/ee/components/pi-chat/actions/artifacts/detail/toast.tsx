import { FilledCheck, FilledCross } from "@plane/propel/icons";
import { Spinner } from "@plane/ui";

export function Toast(props: { error: string | null; isSaving: boolean }) {
  const { error, isSaving } = props;

  if (isSaving) {
    return (
      <div className="flex justify-center items-center gap-2">
        <Spinner className="size-4" />
        <div>Saving</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center gap-2">
        <FilledCross width={16} height={16} />
        <div>Error</div>
      </div>
    );
  } else {
    return (
      <div className="flex justify-center items-center gap-2">
        <FilledCheck width={16} height={16} className="text-green-500" />
        <div>Saved</div>
      </div>
    );
  }
}
