import { cn, CustomMenu } from "@plane/ui";
import { copyUrlToClipboard } from "@plane/utils";
import { useIntakeHeaderMenuItems } from "@/components/common/quick-actions-helper";

type Props = {
  workspaceSlug: string;
  projectId: string;
};

export const IntakeHeaderQuickActions = (props: Props) => {
  const { workspaceSlug, projectId } = props;

  const handleCopyLink = () => {
    copyUrlToClipboard(`/${workspaceSlug}/projects/${projectId}/intake`);
  };

  const { items, modals } = useIntakeHeaderMenuItems({ workspaceSlug, projectId, handleCopyLink });

  return (
    <>
      <CustomMenu
        ellipsis
        placement="bottom-end"
        closeOnSelect
        maxHeight="lg"
        className="flex-shrink-0 flex items-center justify-center size-[26px] bg-custom-background-80/70 rounded"
      >
        {items.map((item) => {
          if (item.shouldRender === false) return null;
          return (
            <CustomMenu.MenuItem
              key={item.key}
              onClick={item.action}
              className={cn("flex items-center gap-2", {
                "text-custom-text-400": item.disabled,
              })}
              disabled={item.disabled}
            >
              {item.icon && <item.icon className="h-3 w-3" />}
              <span>{item.title}</span>
            </CustomMenu.MenuItem>
          );
        })}
      </CustomMenu>
      {modals}
    </>
  );
};
