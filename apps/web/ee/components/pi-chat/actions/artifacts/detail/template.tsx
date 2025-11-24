import { isEmpty } from "lodash-es";
import { Briefcase } from "lucide-react";
import { PiChatEditorWithRef } from "@plane/editor";
import { Logo } from "@plane/propel/emoji-icon-picker";
import { Card } from "@plane/ui";
import type { TArtifact } from "@/plane-web/types";
import { Properties } from "../preview-cards/properties";

type TProps = {
  data: TArtifact;
};

export const TemplateDetail = (props: TProps) => {
  const { data } = props;
  const properties = {
    ...data?.parameters?.properties,
    project: data?.parameters?.project,
    showContainer: true,
  };
  return (
    <Card className="relative max-w-[700px] rounded-xl shadow-lg space-y-0">
      <div className="p-3 flex flex-col gap-4 ">
        {/* icon */}
        {data.parameters?.logo_props && (
          <div className="flex flex-col gap-2">
            <div className="font-semibold text-sm text-custom-text-350 capitalize">{data.artifact_type} icon</div>
            <div className="flex h-8  w-8 items-center justify-center rounded-md bg-custom-background-80">
              <span className="grid h-4 w-4 flex-shrink-0 place-items-center">
                {data.parameters?.logo_props ? (
                  <Logo logo={data.parameters?.logo_props} size={16} />
                ) : (
                  <span className="grid h-4 w-4 flex-shrink-0 place-items-center">
                    <Briefcase className="h-4 w-4" />
                  </span>
                )}
              </span>
            </div>
          </div>
        )}
        {/* title */}
        <div className="flex flex-col gap-2">
          <div className="font-semibold text-sm text-custom-text-350 capitalize">{data.artifact_type} title</div>
          <div className="border-[0.5px] border-custom-border-200 rounded-lg py-2 px-4 text-base font-medium">
            {data.parameters?.name || "Unknown"}
          </div>
        </div>
        {/* description */}
        {data.parameters?.description && (
          <div className="flex flex-col gap-2">
            <div className="font-semibold text-sm text-custom-text-350">Description</div>
            <div className="border-[0.5px] border-custom-border-200 rounded-lg py-2 px-4 text-sm text-custom-text-200">
              <PiChatEditorWithRef editable={false} content={data.parameters?.description} />
            </div>
          </div>
        )}
        {/* properties */}
        {!isEmpty(properties) && (
          <div className="flex flex-col">
            <div className="font-semibold text-sm text-custom-text-350">Properties</div>
            <Properties {...properties} />
          </div>
        )}
      </div>
    </Card>
  );
};
