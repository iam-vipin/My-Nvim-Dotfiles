import { ArchiveIcon } from "@plane/propel/icons";
import { Badge } from "./badge";

export function ArchivedBadge() {
  return <Badge text="Archived" icon={<ArchiveIcon className="size-2.5 text-tertiary" />} />;
}
