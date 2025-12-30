import { Button } from "@plane/propel/button";

type TModalFormFooter = {
  primaryButtonText: string;
  primaryButtonLoadingText?: string;
  onPrimaryClick: () => void;
  onSecondaryClick: () => void;
  isLoading?: boolean;
  secondaryButtonText?: string;
  primaryButtonType?: "button" | "submit";
};

export function ModalFormFooter(props: TModalFormFooter) {
  const {
    primaryButtonText,
    primaryButtonLoadingText,
    onPrimaryClick,
    onSecondaryClick,
    isLoading = false,
    secondaryButtonText = "Cancel",
    primaryButtonType = "button",
  } = props;

  return (
    <div className="flex items-center justify-end gap-2 pt-2">
      <Button variant="secondary" size="xl" onClick={onSecondaryClick} disabled={isLoading}>
        {secondaryButtonText}
      </Button>
      <Button
        variant="primary"
        size="xl"
        {...(primaryButtonType === "submit" ? { type: "submit" } : { onClick: onPrimaryClick, type: "button" })}
        loading={isLoading}
      >
        {isLoading && primaryButtonLoadingText ? primaryButtonLoadingText : primaryButtonText}
      </Button>
    </div>
  );
}
