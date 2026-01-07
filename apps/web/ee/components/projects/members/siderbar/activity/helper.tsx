import type { FC, ReactNode } from "react";
import { LogOut, MailCheck, UserCog, Users, UserX, UserPlus } from "lucide-react";
import type { TProjectBaseActivity } from "@plane/types";

const ProjectMemberActivityTypes = {
  JOINED: "JOINED",
  ADDED: "ADDED",
  LEFT: "LEFT",
  REMOVED: "REMOVED",
  ROLE_UPDATED: "ROLE_UPDATED",
} as const;

export type TProjectMemberActivityType = keyof typeof ProjectMemberActivityTypes;

export type TProjectMemberActivity = TProjectBaseActivity & {
  type?: TProjectMemberActivityType;
  project_member: string | null;
};

const getUserName = (email: string = "") => (email && email.includes("@") ? email.split("@")[0] : email);

export const getProjectMemberActivityDetails = (
  activity: TProjectMemberActivity,
  memberName: string
): { icon: FC<{ className?: string }>; message: ReactNode } => {
  const activityType = activity.type;
  const subject = activity.new_value || activity.old_value;

  switch (activityType) {
    case ProjectMemberActivityTypes.JOINED:
      return {
        icon: MailCheck,
        message: <>has joined the project.</>,
      };
    case ProjectMemberActivityTypes.ADDED: {
      const emailUsername = getUserName(subject);
      return {
        icon: UserPlus,
        message: (
          <>
            added {emailUsername ? <span className="text-primary font-medium">{emailUsername}</span> : "a new member"}
            {" to the project."}
          </>
        ),
      };
    }
    case ProjectMemberActivityTypes.REMOVED:
      return {
        icon: UserX,
        message: (
          <>
            removed {subject ? <span className="text-primary font-medium">{subject}</span> : "a member"}
            {" from the project."}
          </>
        ),
      };
    case ProjectMemberActivityTypes.LEFT:
      return {
        icon: LogOut,
        message: <>left the project.</>,
      };
    case ProjectMemberActivityTypes.ROLE_UPDATED: {
      const oldRole = activity.old_value || "Member";
      const newRole = activity.new_value || "Member";

      return {
        icon: UserCog,
        message: (
          <>
            changed {memberName ? <span className="text-primary font-medium">{memberName}</span> : "a member"}
            {"'s role from "}
            <span className="text-primary font-medium">{oldRole}</span>
            {" to "}
            <span className="text-primary font-medium">{newRole}</span>.
          </>
        ),
      };
    }
    default:
      return {
        icon: Users,
        message: <>made a change</>,
      };
  }
};
