import { E_KNOWN_FIELD_KEY } from "@/types/form/base";
import type { FormField } from "@/types/form/base";
import { richTextBlockToMrkdwn } from "../parse-issue-form";
import { removePrefixIfExists } from "../slack-options";
import { SlackFormParser } from "./field-parser";
import type { TParserHandler } from "./field-parser";
import type { TFormParserContext } from "../../types/fields";
import { E_MESSAGE_ACTION_TYPES } from "../../types/types";
import { WO_INPUT_SUFFIX } from "../constants";

/**
 * Creates a field parser that handles both direct field access and input-namespaced fields.
 * Checks for `data["{fieldName}.input"]` first, then falls back to direct `data` access.
 * This allows Slack forms to use either naming convention transparently.
 *
 * @param fieldName - The base field name (e.g., "assignees")
 * @param parser - Function that extracts the value from the resolved data
 * @returns A parser function that handles both access patterns
 */
const createFieldParser = (fieldName: string, parser: (resolvedData: any) => any) => {
  return (data: any) => {
    const inputKey = `${fieldName}.${WO_INPUT_SUFFIX}`;
    const resolvedData = (data[inputKey] || data) as unknown;
    return parser(resolvedData);
  };
};

type TSlackWorkObjectFPConfig = {
  projectId: string;
  issueTypeId?: string;
};

export class SlackWorkObjectFieldParser extends SlackFormParser {
  constructor(
    protected readonly context: TFormParserContext,
    private readonly config: TSlackWorkObjectFPConfig
  ) {
    super(context);
  }

  protected actionHandlers: Map<string, TParserHandler> = new Map<string, TParserHandler>([
    [E_MESSAGE_ACTION_TYPES.WORK_OBJECT_EDIT, this.parseWorkItem.bind(this)],
  ]);

  protected readonly coreFieldParsers = {
    title: createFieldParser("name", (data) => data?.value),
    description_html: createFieldParser(
      "description_html",
      (data) => richTextBlockToMrkdwn(data?.rich_text_value) || "<p></p>"
    ),
    assignees: createFieldParser("assignees", (data) => data?.selected_options?.map((opt: any) => opt.value)),
    status: createFieldParser("state", (data) => data?.selected_option?.value),
    priority: createFieldParser("priority", (data) => data?.selected_option?.value),
    labels: createFieldParser("labels", (data) => data?.selected_options?.map((opt: any) => opt.value)),
    start_date: createFieldParser("start_date", (data) => data?.selected_date),
    due_date: createFieldParser("due_date", (data) => data?.selected_date),
  };

  protected isCoreField(actionKey: string): boolean {
    if (actionKey.includes(`.${WO_INPUT_SUFFIX}`)) {
      const [key] = actionKey.split(".");

      if (key === E_KNOWN_FIELD_KEY.TITLE) {
        return true;
      }

      return key in this.coreFieldParsers;
    }

    return false;
  }

  parseFields(values: any, formFields: FormField[], projectId: string) {
    const coreFields = {
      project: projectId,
      name: "",
      description_html: "", // or whatever default you want
      state: undefined as string | undefined,
      state_id: undefined as string | undefined,
      priority: undefined as string | undefined,
      labels: undefined as string[] | undefined,
      enable_thread_sync: undefined as boolean | undefined,
      type_id: undefined as string | undefined,
    };

    const customFields: Record<string, unknown> = {};
    const fieldMap = new Map(formFields.map((field) => [field.id, field]));

    Object.entries(values).forEach(([_, blockData]: [string, any]) => {
      Object.entries(blockData).forEach(([actionKey, actionData]: [string, any]) => {
        if (this.isCoreField(actionKey)) {
          this.parseCoreField(actionKey, actionData, coreFields);
        } else {
          // Parse dynamic custom fields using action_id pattern: projectId.fieldId
          const fieldId = removePrefixIfExists(actionKey);
          const field = fieldMap.get(fieldId);

          if (field) {
            const value = this.parseFieldValue(actionData, field);
            if (value !== undefined) {
              customFields[fieldId] = value;
            }
          }
        }
      });
    });

    return { coreFields, customFields };
  }

  protected extractProjectId(_values: any): string {
    return this.config.projectId;
  }

  protected extractIssueType(_values: any): string | undefined {
    return this.config.issueTypeId;
  }
}

export const createSlackWorkObjectFormParser = (context: TFormParserContext, config: TSlackWorkObjectFPConfig) =>
  new SlackWorkObjectFieldParser(context, config);
