export enum AIResponseType {
  RESPONSE = "response",
  ACTIONS = "actions",
  CLARIFICATION = "clarification",
}

export type TAIInferenceResponse = {
  response: AIResponse;
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
      version_number: unknown;
      entity?: {
        entity_url: string;
        entity_name: string;
        entity_type: string;
        entity_id: string;
        issue_identifier: string;
      };
      project_identifier?: string;
      message: string;
      error?: string;
    }>;
  };
  response_type: AIResponseType;
  clarification_data?: {
    reason: string;
    questions: Array<string>;
    missing_fields: Array<unknown>;
    disambiguation_options: Array<{
      id: string;
      identifier?: string;
      name?: string;
      display_name?: string;
      title?: string;
      type: string;
      email: string;
      url: string;
    }>;
    category_hints: Array<string>;
  };
};

export type AIResponse = {
  text: string;
  entities?: Array<AIEntityResponse>;
};

export type AIEntityResponse = {
  type: string;
  name: string;
  properties: {
    url: string;
    [key: string]: unknown;
  };
};
