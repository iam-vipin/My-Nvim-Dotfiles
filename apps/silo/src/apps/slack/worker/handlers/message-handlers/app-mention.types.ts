export type TAIInferenceResponse = {
  response: string;
  actions_data: {
    action: string;
    artifact_type: string;
    artifact_id: string;
    tool_name: string;
    parameters: {
      name: string;
      project: {
        id: string;
        identifier: string;
      };
    };
    message_id: string;
    sequence: number;
  };
  context?: {
    action_summary: {
      total_planned: number;
      completed: number;
      failed: number;
      duration_seconds: number;
    };
    actions: Array<{
      action: string;
      artifact_type: string;
      success: boolean;
      executed_at: string;
      artifact_id: string;
      sequence: number;
      version_number: any;
      entity: {
        entity_url: string;
        entity_name: string;
        entity_type: string;
        entity_id: string;
        issue_identifier: string;
      };
      project_identifier: string;
      message: string;
    }>;
  };
  response_type: "response" | "actions" | "clarification";
  clarification_data?: {
    reason: string;
    questions: Array<string>;
    missing_fields: Array<any>;
    disambiguation_options: Array<{
      id: string;
      name: string;
      type: string;
      email: string;
      url: string;
    }>;
    category_hints: Array<string>;
  };
};
