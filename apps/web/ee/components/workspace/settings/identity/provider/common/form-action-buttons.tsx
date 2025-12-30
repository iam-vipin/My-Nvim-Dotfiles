// plane imports
import { Button } from "@plane/propel/button";

type TProviderFormActionButton = {
  isEnabled: boolean;
  isSubmitButtonDisabled: boolean;
  isSubmitting: boolean;
  onSubmit: (enableProvider: boolean) => Promise<void>;
  submitType: "configure-and-enable" | "default" | null;
  t: (key: string) => string;
};

export function ProviderFormActionButtons(props: TProviderFormActionButton) {
  const { isEnabled, isSubmitButtonDisabled, isSubmitting, onSubmit, submitType, t } = props;

  if (isEnabled) {
    return (
      <div className="flex items-center gap-2 pt-2">
        <Button
          variant="primary"
          size="lg"
          type="button"
          loading={isSubmitting}
          disabled={isSubmitButtonDisabled}
          onClick={() => void onSubmit(false)}
        >
          {submitType === "default"
            ? t("sso.providers.form_action_buttons.saving")
            : t("sso.providers.form_action_buttons.save_changes")}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 pt-2">
      <Button
        variant="primary"
        size="lg"
        type="button"
        loading={isSubmitting}
        disabled={isSubmitButtonDisabled}
        onClick={() => void onSubmit(true)}
      >
        {submitType === "configure-and-enable"
          ? t("sso.providers.form_action_buttons.saving")
          : t("sso.providers.form_action_buttons.configure_and_enable")}
      </Button>
      <Button
        variant="secondary"
        size="lg"
        type="button"
        loading={isSubmitting}
        disabled={isSubmitButtonDisabled}
        onClick={() => void onSubmit(false)}
      >
        {submitType === "default"
          ? t("sso.providers.form_action_buttons.saving")
          : t("sso.providers.form_action_buttons.configure_only")}
      </Button>
    </div>
  );
}
