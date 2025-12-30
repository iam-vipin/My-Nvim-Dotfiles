import { PlusIcon } from "@plane/propel/icons";
import { Row } from "@plane/ui";
import { cn } from "@plane/utils";

type Props = {
  count: number;
  label: string;
  handleAdd: () => void;
  style?: React.CSSProperties;
  onClick?: () => void;
  customClassName?: string;
  icon?: React.ReactNode;
};
export function ListHeader(props: Props) {
  const { count, label, handleAdd, style, onClick, customClassName, icon } = props;

  return (
    <Row
      onClick={onClick}
      className={cn("w-full flex-shrink-0 border-b-[1px] border-subtle bg-layer-1 pr-3 py-2.5", customClassName)}
      style={style}
    >
      <div className="flex items-center justify-between h-full">
        <div className="flex items-center gap-2">
          <span className="text-13 font-medium text-primary flex items-center gap-2">
            {icon}
            <span>{label}</span>
          </span>
          <span className="text-13 font-medium text-primary">{count}</span>
        </div>
        <div
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleAdd();
          }}
          className="cursor-pointer"
        >
          <PlusIcon className="size-4" />
        </div>
      </div>
    </Row>
  );
}
