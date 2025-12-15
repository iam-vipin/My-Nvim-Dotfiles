import type { FC } from "react";
import { useTheme } from "next-themes";
import { Key } from "lucide-react";
// helpers
import { API_BASE_URL } from "@plane/constants";

export type TSAMLButton = {
  title: string;
  invitationId?: string;
};

export function SAMLButton(props: TSAMLButton) {
  // props
  const { title, invitationId } = props;
  // hooks
  const { resolvedTheme } = useTheme();

  const handleSignIn = () => {
    let url = `${API_BASE_URL}/auth/mobile/saml/`;
    if (invitationId) url += `?invitation_id=${invitationId}`;
    window.location.assign(url);
  };

  return (
    <button
      className={`flex h-[42px] w-full items-center justify-center gap-2 rounded-sm border px-2 text-13 font-medium text-primary duration-300 bg-surface-1 hover:bg-onboarding-background-300 ${
        resolvedTheme === "dark" ? "border-[#43484F]" : "border-[#D9E4FF]"
      }`}
      onClick={handleSignIn}
    >
      <Key height={18} width={18} />
      {title}
    </button>
  );
}
