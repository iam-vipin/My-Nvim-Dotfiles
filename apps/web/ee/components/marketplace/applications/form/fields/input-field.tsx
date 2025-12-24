import type { FieldValues, UseFormRegister } from "react-hook-form";
import { cn, Input } from "@plane/ui";
import type { BaseFieldProps } from "./base-field";
import { FieldWrapper } from "./base-field";

type Props<T extends FieldValues> = BaseFieldProps<T> & {
  type: "text" | "email" | "url";
  register: UseFormRegister<T>;
  onChange?: (value: string) => void;
};

export function InputField<T extends FieldValues>(props: Props<T>) {
  const { id, type, placeholder, disabled, tabIndex, error, className = "", register, validation, onChange } = props;

  return (
    <FieldWrapper {...props}>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        className={cn(`w-full resize-none text-13 bg-surface-1`, className)}
        hasError={Boolean(error)}
        disabled={disabled}
        tabIndex={tabIndex}
        {...register(id, {
          ...validation,
          onChange: (e) => onChange?.(e.target.value),
        })}
      />
    </FieldWrapper>
  );
}
