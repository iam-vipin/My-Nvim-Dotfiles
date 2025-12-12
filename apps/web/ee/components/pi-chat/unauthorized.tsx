import { useParams, usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import useSWR from "swr";
import { getButtonStyling } from "@plane/propel/button";
import { cn, resolveGeneralTheme } from "@plane/utils";
import darkState from "@/app/assets/auth/pi-chat-dark.webp?url";
import lightState from "@/app/assets/auth/pi-chat-light.webp?url";
import { useWorkspace } from "@/hooks/store/use-workspace";
import { usePiChat } from "@/plane-web/hooks/store/use-pi-chat";

export function UnauthorizedView(props: { className?: string; imgClassName?: string }) {
  const { className, imgClassName } = props;
  // router
  const pathname = usePathname();
  const { workspaceSlug } = useParams();
  // store hooks
  const { isPiChatDrawerOpen, getInstance } = usePiChat();
  const { resolvedTheme } = useTheme();
  const { getWorkspaceBySlug } = useWorkspace();
  // derived values
  const workspaceId = getWorkspaceBySlug(workspaceSlug)?.id;
  // SWR
  const { data: instance } = useSWR(
    workspaceId ? `PI_STARTER_${workspaceId}` : null,
    workspaceId ? () => getInstance(workspaceId) : null,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      errorRetryCount: 0,
    }
  );

  return (
    <div className={"@container w-full h-full"}>
      <div
        className={cn("flex @[400px]:flex-row flex-col size-full items-center justify-center gap-8  px-8", className)}
      >
        <div className="flex max-h-full bg-custom-background-90 p-12 pr-0 rounded-lg items-center max-w-[350px] overflow-hidden shadow-r-md justify-end">
          <img
            className={cn("w-auto", imgClassName)}
            src={resolveGeneralTheme(resolvedTheme) === "dark" ? darkState : lightState}
            alt="Unauthorized"
          />
        </div>

        <div className="flex flex-col gap-4 max-w-[400px]">
          <div className="flex flex-col">
            <div className="text-lg font-semibold leading-7 text-custom-text-100">
              Plane AI can now take actions for you.
            </div>
            <div className="text-sm leading-5 text-custom-text-300">
              Use Build mode to create work items, cycles and more. Activate now to start Plane AI actions.
            </div>
          </div>
          {instance && !instance?.is_authorized && (
            <a
              href={`${instance.oauth_url}?sidebar_open_url=${pathname}${isPiChatDrawerOpen ? "?pi_sidebar_open=true" : ""}`}
              className={cn(getButtonStyling("primary", "md"), "w-fit")}
            >
              Activate Build mode
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
