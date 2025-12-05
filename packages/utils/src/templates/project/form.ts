// plane imports
import { RANDOM_EMOJI_CODES } from "@plane/constants";
import type { PartialDeep, TProjectTemplateForm } from "@plane/types";
// local imports
import { mockCreateDefaultProjectStates } from "./state";
import type { TMockCreateDefaultWorkItemTypeInstanceParams } from "./work-item-type";
import { mockCreateDefaultWorkItemTypeInstance, mockCreateProjectEpicWorkItemTypeInstance } from "./work-item-type";

type TGenerateAdditionalProjectTemplateFormDataParams = TMockCreateDefaultWorkItemTypeInstanceParams & {
  coverImageUrl: string;
};

/**
 * Generate additional project template form data that are dynamic
 * @param params
 * @param params.workspaceSlug - The workspace slug
 * @param params.projectId - The project id
 * @param params.createWorkItemTypeInstance - The function to create the work item type instance
 * @param params.createOptionInstance - The function to create the option instance
 * @param params.getWorkItemTypeById - The function to get the work item type by id
 * @param params.getCustomPropertyById - The function to get the custom property by id
 * @returns The additional project template form data - PartialDeep<TProjectTemplateForm>
 */
export const generateAdditionalProjectTemplateFormData = async (
  params: TGenerateAdditionalProjectTemplateFormDataParams
): Promise<PartialDeep<TProjectTemplateForm>> => {
  const projectStates = await mockCreateDefaultProjectStates(params);
  const defaultWorkItemType = await mockCreateDefaultWorkItemTypeInstance(params);
  const workItemTypes = defaultWorkItemType.id ? { [defaultWorkItemType.id]: defaultWorkItemType } : {};
  const projectEpicWorkItemType = await mockCreateProjectEpicWorkItemTypeInstance(params);

  return {
    project: {
      logo_props: {
        in_use: "emoji",
        emoji: {
          value: RANDOM_EMOJI_CODES[Math.floor(Math.random() * RANDOM_EMOJI_CODES.length)],
        },
      },
      cover_image_url: params.coverImageUrl,
      states: projectStates,
      workitem_types: workItemTypes,
      epics: projectEpicWorkItemType,
    },
  };
};
