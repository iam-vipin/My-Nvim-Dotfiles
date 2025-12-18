import type { FC, ReactNode } from "react";
import { LogOut, MailCheck, Mails, UserCog, MailX, Users, UserX, UserPlus, UserMinus } from "lucide-react";
import type { IUserLite, TWorkspaceBaseActivity } from "@plane/types";

const WorkspaceMemberActivityType = {
  JOINED: "JOINED",
  REMOVED: "REMOVED",
  LEFT: "LEFT",
  ROLE_CHANGED: "ROLE_CHANGED",
  INVITED: "INVITED",
  INVITATION_DELETED: "INVITATION_DELETED",
  SEATS_ADDED: "SEATS_ADDED",
  SEATS_REMOVED: "SEATS_REMOVED",
} as const;

type WorkspaceMemberActivityType = (typeof WorkspaceMemberActivityType)[keyof typeof WorkspaceMemberActivityType];

type WorkspaceMemberActivity = TWorkspaceBaseActivity & {
  type?: WorkspaceMemberActivityType;
  workspace_member_detail?: IUserLite | null;
};

const getUserName = (email: string = "") => (email && email.includes("@") ? email.split("@")[0] : email);

export const getWorkspaceMemberActivityDetails = (
  activity: TWorkspaceBaseActivity
): { icon: FC<{ className?: string }>; message: ReactNode } => {
  const workspaceActivity = activity as WorkspaceMemberActivity;
  const activityType = workspaceActivity.type;
  const subject = activity.new_value || activity.old_value;

  switch (activityType) {
    case WorkspaceMemberActivityType.INVITED: {
      const emailUsername = getUserName(subject);
      return {
        icon: Mails,
        message: (
          <>
            invited {emailUsername ? <span className="font-medium text-primary">{emailUsername}</span> : "a new member"}
            {" to the workspace."}
          </>
        ),
      };
    }
    case WorkspaceMemberActivityType.JOINED:
      return {
        icon: MailCheck,
        message: <>has accepted the invitation.</>,
      };
    case WorkspaceMemberActivityType.INVITATION_DELETED: {
      const emailUsername = getUserName(subject);
      return {
        icon: MailX,
        message: emailUsername ? (
          <>
            deleted the invitation for <span className="font-medium text-primary">{emailUsername}</span>.
          </>
        ) : (
          <>deleted the invitation.</>
        ),
      };
    }
    case WorkspaceMemberActivityType.REMOVED:
      return {
        icon: UserX,
        message: subject ? (
          <>
            removed <span className="font-medium text-primary">{subject}</span> from the workspace.
          </>
        ) : (
          <>removed a member from the workspace.</>
        ),
      };
    case WorkspaceMemberActivityType.LEFT:
      return {
        icon: LogOut,
        message: <>left the workspace.</>,
      };
    case WorkspaceMemberActivityType.ROLE_CHANGED: {
      const oldRole = activity.old_value || "Member";
      const newRole = activity.new_value || "Member";
      const memberName = workspaceActivity.workspace_member_detail?.display_name;
      return {
        icon: UserCog,
        message: (
          <>
            changed {memberName ? <span className="font-medium text-primary">{memberName}</span> : "member"}
            {"'s role from "}
            <span className="font-medium text-primary">{oldRole}</span>
            {" to "}
            <span className="font-medium text-primary">{newRole}</span>.
          </>
        ),
      };
    }
    case WorkspaceMemberActivityType.SEATS_ADDED: {
      // Calculate the difference between new_value and old_value
      const seatsAdded =
        activity.new_value && activity.old_value
          ? parseInt(activity.new_value, 10) - parseInt(activity.old_value, 10)
          : activity.new_value
            ? parseInt(activity.new_value, 10)
            : 0;
      return {
        icon: UserPlus,
        message: (
          <>
            added <span className="font-medium text-primary">{seatsAdded}</span> {seatsAdded === 1 ? "seat" : "seats"}{" "}
            to the workspace.
          </>
        ),
      };
    }
    case WorkspaceMemberActivityType.SEATS_REMOVED: {
      // old_value = purchased_seats, new_value = required_seats
      const seatsRemoved =
        activity.old_value && activity.new_value
          ? parseInt(activity.old_value, 10) - parseInt(activity.new_value, 10)
          : 0;
      return {
        icon: UserMinus,
        message: (
          <>
            removed <span className="font-medium text-primary">{seatsRemoved}</span>{" "}
            {seatsRemoved === 1 ? "seat" : "seats"} from the workspace.
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
