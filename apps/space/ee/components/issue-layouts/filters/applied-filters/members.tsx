import { observer } from "mobx-react";
import { CloseIcon } from "@plane/propel/icons";
// ui
import { Avatar } from "@plane/ui";
import { useMember } from "@/hooks/store/use-member";
// types

type Props = {
  handleRemove: (val: string) => void;
  values: string[];
};

export const AppliedMembersFilters = observer(function AppliedMembersFilters(props: Props) {
  const { handleRemove, values } = props;

  const { getMemberById } = useMember();

  return (
    <>
      {values.map((memberId) => {
        const memberDetails = getMemberById(memberId);

        if (!memberDetails) return null;

        return (
          <div key={memberId} className="flex items-center gap-1 rounded-sm bg-layer-3 p-1 text-11">
            <Avatar name={memberDetails.member__display_name} src={memberDetails.member__avatar} showTooltip={false} />
            <span className="normal-case">{memberDetails.member__display_name}</span>
            <button
              type="button"
              className="grid place-items-center text-tertiary hover:text-secondary"
              onClick={() => handleRemove(memberId)}
            >
              <CloseIcon height={10} width={10} strokeWidth={2} />
            </button>
          </div>
        );
      })}
    </>
  );
});
