import type { FieldError, FieldValues, Path, RegisterOptions } from "react-hook-form";

export type BaseFieldProps<T extends FieldValues> = {
  id: Path<T>;
  label?: string;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
  tabIndex?: number;
  error?: FieldError;
  className?: string;
  validation?: RegisterOptions<T>;
};

export function FieldWrapper<T extends FieldValues>({
  label,
  description,
  error,
  validation,
  children,
}: BaseFieldProps<T> & { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <div className="text-11 text-primary font-medium gap-1">
          {label}
          <span className="text-red-500">{validation?.required && <sup>*</sup>}</span>
        </div>
      )}
      {description && <div className="text-11 text-tertiary">{description}</div>}
      {children}
      {error && <p className="text-red-500 text-11">{error.message}</p>}
    </div>
  );
}
