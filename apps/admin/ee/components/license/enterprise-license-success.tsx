import { observer } from "mobx-react";
// plane imports
import { Button } from "@plane/propel/button";
import { PlaneLockup } from "@plane/propel/icons";
import { EModalWidth, ModalCore } from "@plane/ui";
// assets
import licenseSuccessImage from "@/app/assets/images/license-success.webp?url";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export const InstanceEnterpriseLicenseSuccessModal = observer(function InstanceEnterpriseLicenseSuccessModal(
  props: Props
) {
  const { isOpen, onClose } = props;

  return (
    <ModalCore isOpen={isOpen} handleClose={onClose} width={EModalWidth.MD} className="bg-accent-subtle">
      <div className="flex flex-col items-center px-8 py-8 space-y-6">
        <div className="flex justify-center items-center gap-1.5 text-accent-primary">
          <PlaneLockup className="h-5 w-auto" />
          <h4 className="text-h4-medium pt-1">Enterprise</h4>
        </div>
        <div className="space-y-2 text-center">
          <h5 className="text-h5-semibold text-primary">Your plan is active now!</h5>
          <p className="text-body-sm-regular text-secondary">Unlock your team&apos;s full potential</p>
        </div>
        <img src={licenseSuccessImage} alt="license success" className="w-52 h-full object-cover" />
        <div className="pt-2 mx-auto">
          <Button variant="primary" size="lg" onClick={onClose}>
            Let&apos;s get started
          </Button>
        </div>
      </div>
    </ModalCore>
  );
});
