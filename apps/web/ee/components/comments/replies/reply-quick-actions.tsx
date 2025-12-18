import type { FC } from "react";
import { observer } from "mobx-react";
// plane imports
import type { TIssueComment } from "@plane/types";
import type { TContextMenuItem } from "@plane/ui";
import { CustomMenu } from "@plane/ui";
import { cn } from "@plane/utils";
// hooks
import { useUser } from "@/hooks/store/user";
// local imports
import { useReplyMenuItems } from "./helper";

type TReplyQuickActions = {
  handleDelete: () => Promise<void>;
  reply: TIssueComment;
  setEditMode: () => void;
};

export const ReplyQuickActions = observer(function ReplyQuickActions(props: TReplyQuickActions) {
  const { handleDelete, reply, setEditMode } = props;
  // store hooks
  const { data: currentUser } = useUser();
  // derived values
  const isAuthor = currentUser?.id === reply.actor;

  const MENU_ITEMS: TContextMenuItem[] = useReplyMenuItems({
    reply: {
      id: reply.id,
      actor: reply.actor,
    },
    isAuthor,
    handleEdit: setEditMode,
    handleDelete,
  });

  return (
    <CustomMenu ellipsis closeOnSelect>
      {MENU_ITEMS.map((item) => {
        if (item.shouldRender === false) return null;
        return (
          <CustomMenu.MenuItem
            key={item.key}
            onClick={() => item.action()}
            className={cn(
              "flex items-center gap-2",
              {
                "text-placeholder": item.disabled,
              },
              item.className
            )}
            disabled={item.disabled}
          >
            {item.icon && <item.icon className={cn("shrink-0 size-3", item.iconClassName)} />}
            <div>
              <h5>{item.title}</h5>
              {item.description && (
                <p
                  className={cn("text-tertiary whitespace-pre-line", {
                    "text-placeholder": item.disabled,
                  })}
                >
                  {item.description}
                </p>
              )}
            </div>
          </CustomMenu.MenuItem>
        );
      })}
    </CustomMenu>
  );
});
