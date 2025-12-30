import { useMemo } from "react";
import { observer } from "mobx-react";
// hooks
import { CopyField } from "@/components/common/copy-field";
import { useInstance } from "@/hooks/store";

export const InstanceDetailsSection = observer(function InstanceDetailsSection() {
  // store hooks
  const { instance } = useInstance();
  // derived values
  const instanceId = instance?.instance_id;
  const domain = typeof window !== "undefined" ? window.location.origin : "";
  const appVersion = instance?.current_version;

  const INSTANCE_DETAILS = useMemo(
    () => ({
      title: "Instance details",
      description: "These details are auto-generated for your instance. You can copy and use them as needed.",
      fields: [
        {
          row: 1,
          fields: [
            {
              label: "Instance ID",
              value: instanceId,
            },
            {
              label: "Domain",
              value: domain,
            },
          ],
        },
        {
          row: 2,
          fields: [
            {
              label: "Instance app version",
              value: appVersion,
            },
            null,
          ],
        },
      ],
    }),
    [instanceId, domain, appVersion]
  );

  return (
    <div className="space-y-4">
      <div className="mb-4 space-y-1">
        <h3 className="text-body-sm-semibold text-primary">{INSTANCE_DETAILS.title}</h3>
        <p className="text-body-sm-regular text-secondary">{INSTANCE_DETAILS.description}</p>
      </div>
      <div className="flex flex-col gap-y-3 gap-x-6">
        {INSTANCE_DETAILS.fields.map((row) => (
          <div key={row.row} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {row.fields.map((field, index) => (
              <div key={index} className="flex-1">
                {field && field.value && <CopyField label={field.label} url={field.value} description={undefined} />}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
});
