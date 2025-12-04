import { observer } from "mobx-react";
// utils
import { cn } from "@plane/utils";
// store
import { useMembers } from "@/hooks/store/use-members";

type Props = {
  id: string;
  currentUserId: string;
};

export const EditorUserMention: React.FC<Props> = observer((props) => {
  const { id, currentUserId } = props;

  // store
  const { getMemberById, isMembersFetched } = useMembers();
  // derived values
  const userDetails = getMemberById(id);

  if (!isMembersFetched) return null;

  if (!userDetails) {
    return (
      <div className="not-prose inline px-1 py-0.5 rounded bg-custom-background-80 text-custom-text-300 no-underline">
        @deactivated user
      </div>
    );
  }

  return (
    <div
      className={cn(
        "not-prose inline px-1 py-0.5 rounded bg-custom-primary-100/20 text-custom-primary-100 no-underline",
        {
          "bg-yellow-500/20 text-yellow-500": id === currentUserId,
        }
      )}
    >
      @{userDetails?.displayName}
    </div>
  );
});
