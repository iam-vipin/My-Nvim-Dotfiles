import { Button } from "@plane/propel/button";
import { CloseIcon } from "@plane/propel/icons";

export default function ErrorBanner({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between gap-2 text-danger-primary bg-danger-primary rounded-md p-2">
      <span className="text-13">{message}</span>
      <Button variant="ghost" onClick={onClose}>
        <CloseIcon height={14} width={14} className="text-danger-primary" />
      </Button>
    </div>
  );
}

export { ErrorBanner };
