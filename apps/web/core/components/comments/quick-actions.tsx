import type { FC } from "react";
import { observer } from "mobx-react";
// plane imports
import { EIssueCommentAccessSpecifier } from "@plane/constants";
import type { TIssueComment, TCommentsOperations } from "@plane/types";
import type { TContextMenuItem } from "@plane/ui";
import { CustomMenu } from "@plane/ui";
import { cn } from "@plane/utils";
// hooks
import { useCommentMenuItems } from "@/components/common/quick-actions-helper";
import { useUser } from "@/hooks/store/user";

type TCommentCard = {
  activityOperations: TCommentsOperations;
  comment: TIssueComment;
  setEditMode: () => void;
  showAccessSpecifier: boolean;
  showCopyLinkOption: boolean;
};

export const CommentQuickActions = observer(function CommentQuickActions(props: TCommentCard) {
  const { activityOperations, comment, setEditMode, showAccessSpecifier, showCopyLinkOption } = props;
  // store hooks
  const { data: currentUser } = useUser();
  // derived values
  const isAuthor = currentUser?.id === comment.actor;

  const MENU_ITEMS: TContextMenuItem[] = useCommentMenuItems({
    comment: {
      id: comment.id,
      actor: comment.actor,
      access: comment.access,
    },
    isAuthor,
    showAccessSpecifier,
    showCopyLinkOption,
    handleEdit: setEditMode,
    handleCopyLink: () => activityOperations.copyCommentLink(comment.id),
    handleToggleAccess: () =>
      activityOperations.updateComment(comment.id, {
        access:
          comment.access === EIssueCommentAccessSpecifier.INTERNAL
            ? EIssueCommentAccessSpecifier.EXTERNAL
            : EIssueCommentAccessSpecifier.INTERNAL,
      }),
    handleDelete: () => activityOperations.removeComment(comment.id),
  });

  if (MENU_ITEMS.length === 0) return null;

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
