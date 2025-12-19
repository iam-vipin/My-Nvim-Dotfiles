import type { Control, FieldValues } from "react-hook-form";
import { Controller } from "react-hook-form";
import type { TSearchEntityRequestPayload, TSearchResponse } from "@plane/types";
import { cn } from "@plane/ui";
import { RichTextEditor } from "@/components/editor/rich-text";
import type { BaseFieldProps } from "./base-field";
import { FieldWrapper } from "./base-field";

type Props<T extends FieldValues> = BaseFieldProps<T> & {
  control: Control<T>;
  workspaceSlug: string;
  workspaceId: string;
  uploadFile?: (blockId: string, file: File) => Promise<string>;
  duplicateFile?: (assetId: string) => Promise<string>;
  initialValue?: string;
  searchEntityCallback: (payload: TSearchEntityRequestPayload) => Promise<TSearchResponse>;
};

export function RichTextField<T extends FieldValues>(props: Props<T>) {
  const {
    id,
    placeholder,
    tabIndex,
    className = "",
    control,
    validation,
    workspaceSlug,
    workspaceId,
    uploadFile,
    duplicateFile,
    initialValue,
    searchEntityCallback,
    error,
  } = props;

  return (
    <FieldWrapper {...props}>
      <Controller
        name={id}
        control={control}
        rules={validation}
        render={({ field: { onChange } }) => (
          <RichTextEditor
            editable
            id={workspaceSlug}
            tabIndex={tabIndex}
            placeholder={placeholder}
            initialValue={initialValue ?? "<p></p>"}
            workspaceSlug={workspaceSlug}
            workspaceId={workspaceId}
            searchMentionCallback={async (payload) => await searchEntityCallback(payload)}
            dragDropEnabled={false}
            onChange={(_description: object, html: string) => onChange(html)}
            editorClassName="text-11"
            containerClassName={cn(
              `resize-none min-h-24 text-11 border-[0.5px] border-subtle-1 rounded-md px-3 py-2 resize-none text-13 bg-surface-1`,
              className,
              {
                "border-red-500": Boolean(error),
              }
            )}
            displayConfig={{ fontSize: "small-font" }}
            uploadFile={uploadFile ?? (() => Promise.reject())}
            duplicateFile={duplicateFile ?? (() => Promise.reject())}
            disabledExtensions={["attachments"]}
          />
        )}
      />
    </FieldWrapper>
  );
}
