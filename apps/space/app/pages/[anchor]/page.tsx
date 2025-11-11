"use client";

import useSWR from "swr";
// hooks
import { useMember } from "@/hooks/store/use-member";
import { useStates } from "@/hooks/store/use-state";
// components
import { PageDetailsMainContent } from "@/plane-web/components/pages";
import type { Route } from "./+types/page";

export default function PageDetailsPage(props: Route.ComponentProps) {
  const { params } = props;
  // params
  const { anchor } = params;
  // store hooks
  const { fetchStates } = useStates();
  const { fetchMembers } = useMember();

  useSWR(anchor ? `PUBLIC_STATES_${anchor}` : null, anchor ? () => fetchStates(anchor) : null);
  useSWR(anchor ? `PUBLIC_MEMBERS_${anchor}` : null, anchor ? () => fetchMembers(anchor) : null);

  return <PageDetailsMainContent anchor={params.anchor.toString()} />;
}
