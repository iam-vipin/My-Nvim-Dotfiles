import { Controller } from "react-hook-form";
import type { Control, ControllerRenderProps, FieldPath, FieldValues } from "react-hook-form";
// plane imports
import { Input } from "@plane/propel/input";
import { Loader, TextArea } from "@plane/ui";

type TProviderFormField<T extends FieldValues> = {
  name: FieldPath<T>;
  label: string;
  placeholder: string;
  description: string;
  required: boolean;
  type?: "text" | "password" | "textarea";
  control: Control<T>;
  errorMessage?: string;
  isInitializing: boolean;
  customRender?: (field: ControllerRenderProps<T>) => React.ReactNode;
};

export function ProviderFormField<T extends FieldValues>(props: TProviderFormField<T>) {
  const { name, label, placeholder, description, required, type, control, errorMessage, isInitializing, customRender } =
    props;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-body-sm-medium text-primary">
        {label}
        {required && <span className="text-danger-secondary ml-1">*</span>}
      </label>
      <Controller
        name={name}
        control={control}
        rules={{
          required: required ? `${label} is required` : false,
          pattern: String(name).includes("url")
            ? {
                value: /^https?:\/\/.+/,
                message: "Must be a valid URL",
              }
            : undefined,
        }}
        render={({ field: formField }) => {
          if (isInitializing) {
            return (
              <Loader>
                <Loader.Item height={type === "textarea" ? "102px" : "34px"} width="100%" />
              </Loader>
            );
          }
          if (customRender) {
            return <>{customRender(formField)}</>;
          }
          if (type === "textarea") {
            return (
              <TextArea
                {...formField}
                id={name}
                placeholder={placeholder}
                hasError={!!errorMessage}
                className="min-h-[102px] w-full"
                textAreaSize="sm"
              />
            );
          }
          return (
            <Input {...formField} id={name} type={type || "text"} placeholder={placeholder} hasError={!!errorMessage} />
          );
        }}
      />
      {errorMessage && <p className="text-body-xs-medium text-danger-secondary">{errorMessage}</p>}
      <p className="text-body-xs-regular text-placeholder">{description}</p>
    </div>
  );
}
