import React, { useCallback, useRef, useState } from "react";
import { observer } from "mobx-react";
import { Check, Search } from "lucide-react";
import { Combobox } from "@headlessui/react";
// plane imports
import { useTranslation } from "@plane/i18n";
import { Button } from "@plane/propel/button";
import { Logo } from "@plane/propel/emoji-icon-picker";
import type { TLogoProps } from "@plane/types";
import { EModalPosition, EModalWidth, ModalCore } from "@plane/ui";
import { cn } from "@plane/utils";
// ce imports
import type { TMovePageModalProps } from "@/ce/components/pages/modals";
// components
import { SimpleEmptyState } from "@/components/empty-state/simple-empty-state-root";
// hooks
import { useResolvedAssetPath } from "@/hooks/use-resolved-asset-path";

export const MovePageModal: React.FC<TMovePageModalProps> = observer((props) => {
  const { isOpen, onClose, page } = props;
  // states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  // refs
  const moveButtonRef = useRef<HTMLButtonElement>(null);
  // translation
  const { t } = useTranslation();
  // derived values
  const { id } = page;
  const filteredProjectResolvedPath = useResolvedAssetPath({
    basePath:
      "/empty-st\
    ate/search/project",
  });

  const handleClose = useCallback(() => {
    onClose();
    setTimeout(() => {
      setSearchTerm("");
      setSelectedProjectId(null);
    }, 300);
  }, [onClose]);

  const handleMovePage = useCallback(async () => {
    if (!id) return;
  }, [id]);

  const handleMove = useCallback(async () => {
    setIsMoving(true);
    await handleMovePage();
    setIsMoving(false);
  }, [handleMovePage]);

  const items = [
    {
      id: "1",
      name: "Project 1",
      identifier: "P1",
      logo_props: {
        in_use: "emoji",
        emoji: {
          value: "9993-65039",
        },
      } satisfies TLogoProps,
    },
    {
      id: "2",
      name: "Project 2",
      identifier: "P2",
      logo_props: {
        in_use: "emoji",
        emoji: {
          value: "9993-65039",
        },
      } satisfies TLogoProps,
    },
  ];

  return (
    <ModalCore isOpen={isOpen} width={EModalWidth.LG} position={EModalPosition.TOP} handleClose={handleClose}>
      <Combobox
        as="div"
        value={selectedProjectId}
        onChange={(val: string) => {
          setSelectedProjectId(val);
          setSearchTerm("");
          moveButtonRef.current?.focus();
        }}
      >
        <div className="flex items-center gap-2 px-4">
          <Search className="flex-shrink-0 size-4 text-custom-text-400" aria-hidden="true" />
          <Combobox.Input
            className="h-12 w-full border-0 bg-transparent text-sm text-custom-text-100 outline-none placeholder:text-custom-text-400 focus:ring-0"
            placeholder="Type to search..."
            displayValue={() => ""}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Combobox.Options static className="vertical-scrollbar scrollbar-md max-h-[50vh] scroll-py-2 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-3 py-8 text-center">
              <SimpleEmptyState
                title={t("workspace_projects.empty_state.filter.title")}
                description={t("workspace_projects.empty_state.filter.description")}
                assetPath={filteredProjectResolvedPath}
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div
                className={cn("space-y-2", {
                  "px-2": items.length > 0,
                })}
              >
                <p className="text-xs text-custom-text-300 font-semibold px-1 py-0.5 tracking-wide">PROJECTS</p>
                <ul className="text-custom-text-100 space-y-2">
                  {items.map((projectDetails) => {
                    const isProjectSelected = selectedProjectId === projectDetails?.id;
                    if (!projectDetails) return null;
                    return (
                      <Combobox.Option
                        key={projectDetails.id}
                        value={projectDetails.id}
                        className={({ active }) =>
                          cn(
                            "flex items-center justify-between gap-2 truncate w-full cursor-pointer select-none rounded-md p-1 text-custom-text-200 transition-colors",
                            {
                              "bg-custom-background-80": active,
                              "text-custom-text-100": isProjectSelected,
                            }
                          )
                        }
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="shrink-0 size-6 grid place-items-center bg-custom-background-80 rounded">
                            {isProjectSelected ? (
                              <Check className="size-4 text-custom-text-100" />
                            ) : (
                              <Logo logo={projectDetails.logo_props} size={16} />
                            )}
                          </span>
                          <span className="shrink-0 text-[10px]">{projectDetails.identifier}</span>
                          <p className="text-sm truncate">{projectDetails.name}</p>
                        </div>
                      </Combobox.Option>
                    );
                  })}
                </ul>
              </div>
              <div
                className={cn("space-y-2", {
                  "px-2": items.length > 0,
                })}
              >
                <p className="text-xs text-custom-text-300 font-semibold px-1 py-0.5 tracking-wide">TEAMSPACES</p>
                <ul className="text-custom-text-100">
                  {items.map((projectDetails) => {
                    const isProjectSelected = selectedProjectId === projectDetails?.id;
                    if (!projectDetails) return null;
                    return (
                      <Combobox.Option
                        key={projectDetails.id}
                        value={projectDetails.id}
                        className={({ active }) =>
                          cn(
                            "flex items-center justify-between gap-2 truncate w-full cursor-pointer select-none rounded-md p-2 text-custom-text-200 transition-colors",
                            {
                              "bg-custom-background-80": active,
                              "text-custom-text-100": isProjectSelected,
                            }
                          )
                        }
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="flex-shrink-0 size-4 grid place-items-center">
                            {isProjectSelected ? (
                              <Check className="size-4 text-custom-text-100" />
                            ) : (
                              <Logo logo={projectDetails.logo_props} size={16} />
                            )}
                          </span>
                          <span className="flex-shrink-0 text-[10px]">{projectDetails.identifier}</span>
                          <p className="text-sm truncate">{projectDetails.name}</p>
                        </div>
                      </Combobox.Option>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}
        </Combobox.Options>
      </Combobox>
      <div className="flex items-center justify-end gap-2 p-3">
        <Button variant="neutral-primary" size="sm" onClick={handleClose}>
          {t("common.cancel")}
        </Button>
        <Button
          ref={moveButtonRef}
          variant="primary"
          size="sm"
          onClick={handleMove}
          loading={isMoving}
          disabled={!selectedProjectId}
        >
          {isMoving ? t("pages.move_page.submit_button.loading") : t("pages.move_page.submit_button.default")}
        </Button>
      </div>
    </ModalCore>
  );
});
