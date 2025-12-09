// local imports
import { MovePageModalListItem } from "./list-item";
import type { TMovePageModalListItem } from "./list-item";

type Props = {
  getItemDetails: (itemValue: string) => TMovePageModalListItem | null;
  items: string[];
  title: string;
};

export function MovePageModalListSection(props: Props) {
  const { getItemDetails, items, title } = props;

  return (
    <section className="px-2 space-y-2">
      <p className="text-xs text-custom-text-300 font-semibold px-1 py-0.5 tracking-wide">{title}</p>
      <ul className="text-custom-text-100 space-y-2">
        {items.map((itemValue) => {
          const item = getItemDetails(itemValue);
          if (!item) return null;
          return <MovePageModalListItem key={itemValue} item={item} />;
        })}
      </ul>
    </section>
  );
}
