import { Combobox } from "@headlessui/react";
import { Search } from "lucide-react";
import { CheckIcon } from "@plane/propel/icons";
import { useCallback, useMemo, useRef, useState } from "react";
// plane imports
import { Logo } from "@plane/propel/emoji-icon-picker";
import { Button } from "@plane/propel/button";
import { EModalPosition, EModalWidth, ModalCore } from "@plane/ui";
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
          <h3 className="text-18 font-medium text-secondary">Select project</h3>
          <div className="flex items-center gap-2 px-2 border border-subtle-1 rounded">
            <Search className="flex-shrink-0 size-4 text-placeholder" aria-hidden="true" />
            <Combobox.Input
              className="py-1.5 w-full border-0 bg-transparent text-13 text-primary outline-none placeholder:text-placeholder focus:ring-0"
              placeholder="Search"
              displayValue={() => ""}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </section>
        <Combobox.Options static className="vertical-scrollbar scrollbar-md max-h-80 scroll-py-2 overflow-y-auto">
          <section className="px-2">
            <ul className="text-primary space-y-2">
              {filteredProjectsList?.map((project) => (
                <Combobox.Option
                  key={project.id}
                  value={project.id}
                  className={({ active, selected }) =>
                    cn(
                      "flex items-center justify-between gap-2 truncate w-full cursor-pointer select-none rounded-md p-1 text-secondary transition-colors",
                      {
                        "bg-layer-1-hover": active && !selected,
                        "text-primary bg-accent-primary/20": selected,
                        "bg-accent-primary/30": selected && active,
                      }
                    )
                  }
                >
                  {({ selected }) => (
                    <>
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className={cn("shrink-0 size-6 grid place-items-center rounded", {
                            "bg-layer-1-hover": !selected,
                          })}
                        >
                          <Logo logo={project.logo_props} size={16} />
                        </span>
                        <p className="text-13 truncate">{project.name}</p>
                      </div>
                      {selected && <CheckIcon className="shrink-0 size-4 text-primary" />}
                    </>
                  )}
                </Combobox.Option>
              ))}
            </ul>
          </section>
        </Combobox.Options>
      </Combobox>
      <div className="flex items-center justify-end gap-2 p-3">
        <Button variant="secondary" size="lg" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          size="lg"
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
