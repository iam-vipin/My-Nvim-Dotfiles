import { useRef } from "react";
import Link from "next/link";
import { useTranslation } from "@plane/i18n";
import { Button } from "@plane/propel/button";
import { Popover } from "@plane/ui";

const info = [
  "This short form lets you create a new work item in a Plane project.",
  "When you submit this form, a new work item is created in that project’s Intake.",
  "Someone from that project or team will review this.",
  "If the approve it, this work item will move to the project’s queue of work. Otherwise, it will be rejected.",
  "To check for the status of that work item, get in touch with the project’s manager, admin, or whoever sent you the link to this page.",
];

function IntakeInfo() {
  const popoverButtonRef = useRef<HTMLButtonElement | null>(null);
  const { t } = useTranslation();
  return (
    <Popover
      buttonRefClassName="flex"
      popoverClassName="w-auto items-center flex"
      popoverButtonRef={popoverButtonRef}
      buttonClassName="my-auto outline-none text-tertiary"
      button={
        <Button variant="secondary" size="lg">
          {t("intake_forms.how_it_works.title")}
        </Button>
      }
      popperPosition="bottom-end"
      panelClassName="rounded-sm border-1 border-subtle bg-surface-1 p-3 text-11 shadow-raised-100 focus:outline-none max-w-lg"
    >
      <div className="p-2">
        <div>
          <div>
            <div className="text-16 font-semibold">{t("intake_forms.how_it_works.heading")}</div>
            <div className="text-13 text-tertiary">
              {t("intake_forms.how_it_works.description")}
              <Link href="https://plane.so/intake" target="_blank" className="underline">
                Learn more
              </Link>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {info.map((item, index) => (
              <div key={item} className="flex gap-3 items-center">
                <span className="w-7 h-7 rounded-full bg-layer-1/60 flex items-center justify-center text-13 text-tertiary font-semibold flex-shrink-0 ">
                  {index + 1}
                </span>
                <span className="text-13 text-secondary">{t(`intake_forms.how_it_works.steps.step_${index + 1}`)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Popover>
  );
}

export default IntakeInfo;
