import { cn, CustomMenu } from "@plane/ui";
import { copyUrlToClipboard } from "@plane/utils";
import { useLayoutMenuItems } from "@/components/common/quick-actions-helper";

type Props = {
  workspaceSlug: string;
  projectId: string;
};

export function EpicLayoutQuickActions(props: Props) {
  const { workspaceSlug, projectId } = props;

  const handleCopyLink = () => {
    copyUrlToClipboard(`/${workspaceSlug}/projects/${projectId}/epics`);
  };

  const handleOpenInNewTab = () => window.open(`/${workspaceSlug}/projects/${projectId}/epics`, "_blank");

  const { items, modals } = useLayoutMenuItems({
    workspaceSlug,
    projectId,
    storeType: "EPIC",
    handleCopyLink,
    handleOpenInNewTab,
  });

  return (
    <>
      <CustomMenu
        ellipsis
        placement="bottom-end"
        closeOnSelect
        maxHeight="lg"
        className="flex-shrink-0 flex items-center justify-center size-[26px] bg-layer-1/70 rounded"
      >
        {items.map((item) => {
          if (item.shouldRender === false) return null;
          return (
            <CustomMenu.MenuItem
              key={item.key}
              onClick={item.action}
              className={cn("flex items-center gap-2", {
                "text-placeholder": item.disabled,
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
}
