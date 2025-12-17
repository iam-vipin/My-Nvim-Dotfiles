import { Button } from "@plane/propel/button";

type TProps = {
  summary: string;
  isExecutingAction: boolean;
  workspaceId: string | undefined;
  query_id: string;
  handleExecuteAction: (workspaceId: string, query_id: string) => void;
};

export function ConfirmBlock(props: TProps) {
  const { summary, isExecutingAction, handleExecuteAction, workspaceId, query_id } = props;
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-layer-1 p-3 mb-4">
      <div className="flex flex-col gap-1">
        <div className="text-body-sm-semibold text-primary">Awaiting response</div>
        <div className="text-body-xs-regular text-tertiary">{summary}</div>
      </div>{" "}
      <Button
        disabled={isExecutingAction}
        onClick={() => handleExecuteAction(workspaceId?.toString() || "", query_id)}
        className="w-fit"
      >
        Confirm
      </Button>
    </div>
  );
}
