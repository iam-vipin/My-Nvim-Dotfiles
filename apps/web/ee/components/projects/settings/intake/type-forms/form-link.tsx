import { observer } from "mobx-react";
import { Copy, ExternalLink, RefreshCcw } from "lucide-react";
import { SPACE_BASE_URL, SPACE_BASE_PATH } from "@plane/constants";
import { setToast, TOAST_TYPE } from "@plane/propel/toast";
import { cn } from "@plane/propel/utils";
import { Button } from "@plane/ui";
import { copyTextToClipboard } from "@plane/utils";

type Props = {
  anchor: string;
  handleRenew: () => void;
};
export const IntakeFormLink: React.FC<Props> = observer((props: Props) => {
  const { anchor, handleRenew } = props;

  const copyToClipboard = (text: string) => {
    copyTextToClipboard(text).then(() =>
      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: "Copied to clipboard",
        message: "The URL has been successfully copied to your clipboard",
      })
    );
  };

  const SPACE_APP_URL = (SPACE_BASE_URL.trim() === "" ? window.location.origin : SPACE_BASE_URL) + SPACE_BASE_PATH;
  const publishLink = `${SPACE_APP_URL}/intake/custom/${anchor}`;

  return (
    <div className="flex gap-2 h-[30px] w-full">
      <div
        className={cn(
          "flex items-center text-sm rounded-md border-[0.5px] border-custom-border-300 flex-1 py-1 px-2 gap-2 h-full"
        )}
      >
        <span className="truncate flex-1 mr-4">{publishLink}</span>
        <Copy className="text-custom-text-400 w-[16px] cursor-pointer" onClick={() => copyToClipboard(publishLink)} />
        <a href={publishLink} target="_blank">
          <ExternalLink className="text-custom-text-400 w-[16px] cursor-pointer" />
        </a>
      </div>
      <Button
        tabIndex={-1}
        size="sm"
        variant="neutral-primary"
        className="w-fit cursor-pointer px-2 py-1 text-center text-sm font-medium outline-none my-auto h-full"
        onClick={handleRenew}
      >
        <RefreshCcw className="w-[16px]" /> Renew
      </Button>
    </div>
  );
});
