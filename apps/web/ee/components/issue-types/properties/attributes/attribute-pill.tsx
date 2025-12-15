import { cn } from "@plane/utils";

type TAttributePillProps = {
  data: string;
  className?: string;
};

export function AttributePill({ data, className }: TAttributePillProps) {
  return (
    <span
      className={cn(
        "flex-shrink-0 w-fit px-2 py-0.5 text-caption-sm-medium text-tertiary bg-layer-1 rounded",
        className
      )}
    >
      {data}
    </span>
  );
}
