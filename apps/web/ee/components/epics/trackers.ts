type ToggleType = "enable" | "disable";
type PropertyOperationAction = "create" | "update" | "delete";

type BaseTrackerProps = {
  workspaceSlug?: string;
  projectId?: string;
};

export const epicsTrackers = ({ workspaceSlug, projectId }: BaseTrackerProps) => {
  return {
    toggleEpicsClicked: () => {},

    toggleEpicsSuccess: (toggleType: ToggleType) => {},

    toggleEpicsError: (toggleType: ToggleType) => {},
  };
};

export const epicsPropertiesTrackers = ({ workspaceSlug, projectId }: BaseTrackerProps) => {
  return {
    epicPropertyOperation: (action: PropertyOperationAction, propertyId?: string, isActive?: boolean) => {},

    epicPropertyOperationSuccess: (action: PropertyOperationAction, propertyId?: string) => {},

    epicPropertyOperationError: (action: PropertyOperationAction, error?: Error, propertyId?: string) => {},
  };
};
