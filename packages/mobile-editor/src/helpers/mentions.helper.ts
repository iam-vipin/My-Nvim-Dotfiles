import { TMentionSuggestionResponse } from "@/types/mention";

// It transforms the members list into a format suitable for the mention suggestions
export const transformMentionSuggestions = (members: TMentionSuggestionResponse[]): TMentionSuggestionResponse[] =>
  members.map((member: TMentionSuggestionResponse) => ({
    id: member.id ?? "",
    displayName: member?.displayName ?? "",
    firstName: member?.firstName ?? "",
    lastName: member?.lastName ?? "",
    avatarUrl: member?.avatarUrl,
  }));

export const transformMentionHighlights = (userId: string) => [userId];
