export type TWorkItemExtended = {
  customer_ids?: string[];
  customer_request_ids?: string[];
  initiative_ids?: string[];
  milestone_id?: string;
  transferred_cycle_ids?: string[];
};

export type TWorkItemWidgetsExtended = "customer_requests" | "pages";
