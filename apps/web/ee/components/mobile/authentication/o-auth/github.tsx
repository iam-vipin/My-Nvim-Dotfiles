import type { FC } from "react";
import { useTheme } from "next-themes";
// helpers
import { API_BASE_URL } from "@plane/constants";
// images
import githubLightModeImage from "@/app/assets/logos/github-black.png?url";
import githubDarkModeImage from "@/app/assets/logos/github-dark.svg?url";

export type TGitHubAuthButton = {
  title: string;
  invitationId?: string;
};

export function GitHubAuthButton(props: TGitHubAuthButton) {
  // props
  const { title, invitationId } = props;
  // hooks
  const { resolvedTheme } = useTheme();

  const handleSignIn = () => {
    let url = `${API_BASE_URL}/auth/mobile/github/`;
    if (invitationId) url += `?invitation_id=${invitationId}`;
    window.location.assign(url);
  };

  return (
    <button
      className={`flex h-[42px] w-full items-center justify-center gap-2 rounded border px-2 text-sm font-medium text-custom-text-100 duration-300 bg-custom-background-100 hover:bg-onboarding-background-300 ${
        resolvedTheme === "dark" ? "border-[#43484F]" : "border-[#D9E4FF]"
      }`}
      onClick={handleSignIn}
    >
      <img
        src={resolvedTheme === "dark" ? githubDarkModeImage : githubLightModeImage}
        height={20}
        width={20}
        alt="GitHub Logo"
      />
      {title}
    </button>
  );
}
