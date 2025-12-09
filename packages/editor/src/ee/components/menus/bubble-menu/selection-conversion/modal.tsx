import { Combobox } from "@headlessui/react";
import { Check, Search } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
// plane imports
import { Logo } from "@plane/propel/emoji-icon-picker";
import { Button, EModalPosition, EModalWidth, ModalCore } from "@plane/ui";
import { cn } from "@plane/utils";
// types
import type { IEditorPropsExtended } from "@/types";

type Props = {
  handleClose: () => void;
  handleSelectionConversion: (projectId: string) => Promise<void>;
  isOpen: boolean;
  selectionConversion: IEditorPropsExtended["selectionConversion"];
};

export function SelectionConversionProjectsListModal(props: Props) {
  const { handleClose: onClose, handleSelectionConversion, isOpen, selectionConversion } = props;
  // states
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  // refs
  const createButtonRef = useRef<HTMLButtonElement>(null);

  const handleClose = useCallback(() => {
    onClose();
    setTimeout(() => {
      setSearchTerm("");
      setSelectedValue(null);
    }, 300);
  }, [onClose]);

  const handleCreateButtonClick = async () => {
    if (!selectionConversion || !selectedValue) return;
    setIsCreating(true);
    try {
      await handleSelectionConversion(selectedValue);
      setIsCreating(false);
      handleClose();
    } catch (error) {
      console.error("Error in creating work items from selection via projects selection modal", error);
    } finally {
      setIsCreating(false);
    }
  };

  const filteredProjectsList = useMemo(
    () =>
      selectionConversion?.projectSelectionEnabled?.projectsList.filter((project) => {
        const projectQuery = `${project.identifier} ${project.name}`.toLowerCase();
        return projectQuery.includes(searchTerm.toLowerCase());
      }),
    [searchTerm, selectionConversion?.projectSelectionEnabled?.projectsList]
  );

  return (
    <ModalCore isOpen={isOpen} width={EModalWidth.LG} position={EModalPosition.TOP} handleClose={handleClose}>
      <Combobox
        as="div"
        value={selectedValue}
        onChange={(val: string) => {
          setSelectedValue(val);
          setSearchTerm("");
          if (createButtonRef.current && val !== null) {
            createButtonRef.current.disabled = false;
            createButtonRef.current.focus();
          }
        }}
      >
        <section className="pt-3 px-3 space-y-2">
          <h3 className="text-xl font-medium text-custom-text-200">Select project</h3>
          <div className="flex items-center gap-2 px-2 border border-custom-border-300 rounded">
            <Search className="flex-shrink-0 size-4 text-custom-text-400" aria-hidden="true" />
            <Combobox.Input
              className="py-1.5 w-full border-0 bg-transparent text-sm text-custom-text-100 outline-none placeholder:text-custom-text-400 focus:ring-0"
              placeholder="Search"
              displayValue={() => ""}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </section>
        <Combobox.Options static className="vertical-scrollbar scrollbar-md max-h-80 scroll-py-2 overflow-y-auto">
          <section className="px-2">
            <ul className="text-custom-text-100 space-y-2">
              {filteredProjectsList?.map((project) => (
                <Combobox.Option
                  key={project.id}
                  value={project.id}
                  className={({ active, selected }) =>
                    cn(
                      "flex items-center justify-between gap-2 truncate w-full cursor-pointer select-none rounded-md p-1 text-custom-text-200 transition-colors",
                      {
                        "bg-custom-background-80": active && !selected,
                        "text-custom-text-100 bg-custom-primary-100/20": selected,
                        "bg-custom-primary-100/30": selected && active,
                      }
                    )
                  }
                >
                  {({ selected }) => (
                    <>
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className={cn("shrink-0 size-6 grid place-items-center rounded", {
                            "bg-custom-background-80": !selected,
                          })}
                        >
                          <Logo logo={project.logo_props} size={16} />
                        </span>
                        <p className="text-sm truncate">{project.name}</p>
                      </div>
                      {selected && <Check className="shrink-0 size-4 text-custom-text-100" />}
                    </>
                  )}
                </Combobox.Option>
              ))}
            </ul>
          </section>
        </Combobox.Options>
      </Combobox>
      <div className="flex items-center justify-end gap-2 p-3">
        <Button variant="neutral-primary" size="sm" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={handleCreateButtonClick}
          loading={isCreating}
          disabled={!selectedValue}
          ref={createButtonRef}
        >
          Create
        </Button>
      </div>
    </ModalCore>
  );
}
