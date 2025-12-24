import { Minus, Plus } from "lucide-react";
// plane imports
import { Input } from "@plane/ui";

type TSeatOperation = "increase" | "decrease";

type TNumberInputWithControlsProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  setError?: (error: string) => void;
  handleSeatChange: (action: TSeatOperation) => void;
  isDecreaseDisabled?: boolean;
  isIncreaseDisabled?: boolean;
  min?: number;
  max?: number;
  className?: string;
};

export function NumberInputWithControls({
  value,
  onChange,
  error,
  setError,
  handleSeatChange,
  isDecreaseDisabled = false,
  isIncreaseDisabled = false,
  min = 1,
  max = 10000,
  className = "",
}: TNumberInputWithControlsProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (setError) setError("");
    if (!isNaN(Number(newValue)) && Number(newValue) >= min && Number(newValue) <= max) {
      onChange(newValue);
    }
  };

  return (
    <div className={`flex flex-col items-end gap-1.5 ${className}`}>
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => handleSeatChange("decrease")}
          disabled={isDecreaseDisabled}
          className="flex items-center justify-center size-8 bg-layer-3 rounded-l disabled:text-placeholder cursor-pointer select-none"
        >
          <Minus className="size-4 text-primary" />
        </button>
        <Input
          type="text"
          value={value}
          onChange={handleChange}
          onWheel={(e) => e.currentTarget.blur()}
          className="w-12 h-8 text-center rounded-none border border-subtle bg-layer-2"
          hasError={Boolean(error)}
          inputSize="xs"
          tabIndex={-1}
        />
        <button
          type="button"
          onClick={() => handleSeatChange("increase")}
          disabled={isIncreaseDisabled}
          className="flex items-center justify-center size-8 bg-layer-3 rounded-r disabled:text-placeholder cursor-pointer select-none"
        >
          <Plus className="size-4 text-primary" />
        </button>
      </div>
      {error && <p className="text-11 text-danger-primary">{error}</p>}
    </div>
  );
}
