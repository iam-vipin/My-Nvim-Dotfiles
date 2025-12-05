import type { FC } from "react";
import { useState } from "react";
import { useParams } from "next/navigation";
// plane imports
import { getRandomLabelColor } from "@plane/constants";
import { useTranslation } from "@plane/i18n";
import { Button } from "@plane/propel/button";
import type { TChangeHandlerProps } from "@plane/propel/emoji-icon-picker";
import { EmojiPicker, EmojiIconPickerTypes, Logo } from "@plane/propel/emoji-icon-picker";
import { InitiativeIcon } from "@plane/propel/icons";
import { setToast, TOAST_TYPE } from "@plane/propel/toast";
import { EFileAssetType } from "@plane/types";
import { Input } from "@plane/ui";
import { getDate, getDescriptionPlaceholderI18n, renderFormattedPayloadDate } from "@plane/utils";

// components
import { DateRangeDropdown } from "@/components/dropdowns/date-range";
import { MemberDropdown } from "@/components/dropdowns/member/dropdown";
import { RichTextEditor } from "@/components/editor/rich-text";

// hooks
import { useEditorAsset } from "@/hooks/store/use-editor-asset";
import { useMember } from "@/hooks/store/use-member";
import { useWorkspace } from "@/hooks/store/use-workspace";

// plane web hooks
import { DEFAULT_INITIATIVE_STATE } from "@/plane-web/constants/initiative";
import { useInitiatives } from "@/plane-web/hooks/store/use-initiatives";
import { useEditorMentionSearch } from "@/plane-web/hooks/use-editor-mention-search";

// plane web components
import type { TInitiative } from "@/plane-web/types";

// local components
import { InitiativeLabelDropdown } from "./labels/initiative-label-dropdown";
import { InitiativeStateDropdown } from "./states/initiative-state-dropdown";

type Props = {
  initiativeDetail?: TInitiative;
  formData: Partial<TInitiative> | undefined;
  isSubmitting: boolean;
  handleFormDataChange: <T extends keyof TInitiative>(key: T, value: TInitiative[T] | undefined) => void;
  handleClose: () => void;
  handleFormSubmit: () => Promise<void>;
};

export const CreateUpdateInitiativeForm: FC<Props> = (props) => {
  const { initiativeDetail, formData, isSubmitting, handleFormDataChange, handleClose, handleFormSubmit } = props;
  const [isOpen, setIsOpen] = useState(false);

  // router
  const { workspaceSlug } = useParams();
  // state
  const [errors, setErrors] = useState<{ name?: string; project_ids?: string }>({});

  // store hooks
  const { currentWorkspace } = useWorkspace();
  const {
    workspace: { workspaceMemberIds },
  } = useMember();
  const { uploadEditorAsset, duplicateEditorAsset } = useEditorAsset();
  const {
    initiative: { getInitiativesLabels, createInitiativeLabel },
  } = useInitiatives();
  const allLabels = getInitiativesLabels(workspaceSlug?.toString());

  // translation
  const { t } = useTranslation();
  // use editor mention search
  const { searchEntity } = useEditorMentionSearch({
    memberIds: workspaceMemberIds ?? [],
  });

  const validateForm = (data: Partial<TInitiative>) => {
    const newErrors: { name?: string; project_ids?: string } = {};
    if (!data.name || data.name.trim() === "") {
      newErrors.name = t("name_is_required");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNameChange = (value: string) => {
    handleFormDataChange("name", value);
    validateForm({ ...formData, name: value });
  };

  const createLabel = async (labelName: string) => {
    const createdLabel = await createInitiativeLabel(workspaceSlug.toString(), {
      name: labelName,
      color: getRandomLabelColor(),
    });
    return createdLabel;
  };

  if (!workspaceSlug || !currentWorkspace || !formData) return null;

  const logoValue = formData?.logo_props;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (validateForm(formData)) {
          handleFormSubmit();
        } else {
          setToast({
            type: TOAST_TYPE.ERROR,
            title: t("toast.error"),
            message: errors.project_ids || errors.name || t("initiatives.fill_all_required_fields"),
          });
        }
      }}
    >
      <div className="space-y-3 p-5 pb-4">
        <h3 className="text-xl font-medium text-custom-text-200">
          {formData.id ? t("initiatives.update_initiative") : t("initiatives.create_initiative")}
        </h3>
        <div className="flex items-start gap-2 w-full">
          <EmojiPicker
            iconType="lucide"
            isOpen={isOpen}
            handleToggle={(val: boolean) => setIsOpen(val)}
            className="flex items-center justify-center flex-shrink0"
            buttonClassName="flex items-center justify-center"
            label={
              <span className="grid h-9 w-9 place-items-center rounded-md bg-custom-background-90">
                <>
                  {logoValue?.in_use ? (
                    <Logo logo={logoValue} size={18} type="lucide" />
                  ) : (
                    <InitiativeIcon className="h-4 w-4 text-custom-text-300" />
                  )}
                </>
              </span>
            }
            onChange={(val: TChangeHandlerProps) => {
              let logoValue = {};

              if (val?.type === "emoji")
                logoValue = {
                  value: val.value,
                };
              else if (val?.type === "icon") logoValue = val.value;

              const logoProps = {
                in_use: val?.type,
                emoji: val?.type === "emoji" ? logoValue : undefined,
                icon: val?.type === "icon" ? logoValue : undefined,
              };
              handleFormDataChange("logo_props", logoProps);
              setIsOpen(false);
            }}
            defaultIconColor={logoValue?.in_use && logoValue?.in_use === "icon" ? logoValue?.icon?.color : undefined}
            defaultOpen={
              logoValue?.in_use && logoValue?.in_use === "emoji"
                ? EmojiIconPickerTypes.EMOJI
                : EmojiIconPickerTypes.ICON
            }
          />
          <div className="space-y-1 flew-grow w-full">
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder={t("initiatives.initiative_name")}
              className="w-full resize-none text-base"
              hasError={Boolean(errors.name)}
              tabIndex={1}
              autoFocus
            />
            {errors.name && <div className="text-red-500 text-xs">{errors.name}</div>}
          </div>
        </div>
        <RichTextEditor
          editable
          id="initiative-modal-editor"
          initialValue={
            !formData?.description_html || formData?.description_html === "" ? "<p></p>" : formData?.description_html
          }
          workspaceSlug={workspaceSlug.toString()}
          workspaceId={currentWorkspace.id}
          dragDropEnabled={false}
          onChange={(description_json: object, description_html: string) => {
            handleFormDataChange("description_html", description_html);
          }}
          placeholder={(isFocused, description) => t(`${getDescriptionPlaceholderI18n(isFocused, description)}`)}
          searchMentionCallback={searchEntity}
          editorClassName="text-xs"
          containerClassName="resize-none min-h-24 text-xs border-[0.5px] border-custom-border-200 rounded-md px-3 py-2"
          tabIndex={2}
          uploadFile={async (blockId, file) => {
            try {
              const { asset_id } = await uploadEditorAsset({
                blockId,
                workspaceSlug: workspaceSlug,
                data: {
                  entity_identifier: initiativeDetail?.id ?? "",
                  entity_type: EFileAssetType.INITIATIVE_DESCRIPTION,
                },
                file,
              });
              return asset_id;
            } catch (error) {
              console.log("Error in uploading initiative asset:", error);
              throw new Error("Asset upload failed. Please try again later.");
            }
          }}
          duplicateFile={async (assetId: string) => {
            try {
              const { asset_id } = await duplicateEditorAsset({
                assetId,
                entityId: initiativeDetail?.id,
                entityType: EFileAssetType.INITIATIVE_DESCRIPTION,
                workspaceSlug: workspaceSlug,
              });
              return asset_id;
            } catch (error) {
              console.log("Error in duplicating initiative asset:", error);
              throw new Error("Asset duplication failed. Please try again later.");
            }
          }}
        />

        <div className="flex flex-wrap items-center gap-2">
          <InitiativeStateDropdown
            value={formData?.state ?? DEFAULT_INITIATIVE_STATE}
            onChange={(val) => handleFormDataChange("state", val)}
            placeholder={t("state")}
          />
          <DateRangeDropdown
            buttonVariant="border-with-text"
            className="h-7"
            value={{
              from: getDate(formData?.start_date),
              to: getDate(formData?.end_date),
            }}
            onSelect={(val) => {
              handleFormDataChange("start_date", val?.from ? renderFormattedPayloadDate(val.from) : null);
              handleFormDataChange("end_date", val?.to ? renderFormattedPayloadDate(val.to) : null);
            }}
            placeholder={{
              from: t("start_date"),
              to: t("end_date"),
            }}
            hideIcon={{
              to: true,
            }}
            tabIndex={3}
          />
          <div className="h-7">
            <MemberDropdown
              value={formData?.lead ?? ""}
              onChange={(val) => handleFormDataChange("lead", val)}
              multiple={false}
              buttonVariant="border-with-text"
              placeholder={t("lead")}
              tabIndex={4}
              showUserDetails
            />
          </div>
          <InitiativeLabelDropdown
            value={formData?.label_ids || []}
            labels={allLabels}
            onChange={(val: string[]) => handleFormDataChange("label_ids", val)}
            placeholder={t("label")}
            onAddLabel={createLabel}
          />
        </div>
      </div>
      <div className="px-5 py-4 flex items-center justify-end gap-2 border-t-[0.5px] border-custom-border-200">
        <Button variant="neutral-primary" size="sm" onClick={handleClose} tabIndex={5}>
          {t("cancel")}
        </Button>
        <Button variant="primary" size="sm" type="submit" loading={isSubmitting} tabIndex={6}>
          {initiativeDetail
            ? isSubmitting
              ? t("common.updating")
              : t("initiatives.update_initiative")
            : isSubmitting
              ? t("common.creating")
              : t("initiatives.create_initiative")}
        </Button>
      </div>
    </form>
  );
};
