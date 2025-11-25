import { useState, useRef, useEffect } from "react";
import { SearchResults } from "ee/components/workspace/search/results/root";
import { observer } from "mobx-react";
import { useRouter } from "next/navigation";
import { useParams } from "react-router";
import { Search } from "lucide-react";
import type { TSearchResultItem } from "@plane/constants";
import { useOutsideClickDetector } from "@plane/hooks";
import { CloseIcon, SearchIcon } from "@plane/propel/icons";
import { cn } from "@plane/utils";
import { usePowerK } from "@/hooks/store/use-power-k";

export const TopNavSearch = observer(() => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [flattenedSearchResults, setFlattenedSearchResults] = useState<TSearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // router hooks
  const router = useRouter();
  const { workspaceSlug } = useParams();
  // store hooks
  const { setTopNavSearchInputRef } = usePowerK();

  // Register input ref with PowerK store for keyboard shortcut access
  useEffect(() => {
    setTopNavSearchInputRef(inputRef);
    return () => {
      setTopNavSearchInputRef(null);
    };
  }, [setTopNavSearchInputRef]);

  useOutsideClickDetector(containerRef, () => {
    if (isOpen) {
      setIsOpen(false);
      setFlattenedSearchResults([]);
    }
  });

  const handleFocus = () => {
    setIsOpen(true);
  };

  const handleClear = () => {
    setSearchQuery("");
    setFlattenedSearchResults([]);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      inputRef.current?.blur();
      setSearchQuery("");
    }

    if (e.key === "Enter") {
      e.preventDefault();
      router.push(`/${workspaceSlug}/search?q=${searchQuery}`);
      setIsOpen(false);
      setFlattenedSearchResults([]);
    }
  };

  return (
    <div ref={containerRef} className="relative flex justify-center">
      <div
        className={cn(
          "relative flex items-center transition-all duration-300 ease-in-out z-30",
          isOpen ? "w-[554px]" : "w-[364px]"
        )}
      >
        <div
          className={cn(
            "flex items-center w-full h-7 px-2 py-2 rounded-md bg-custom-sidebar-background-80 hover:bg-custom-background-80 transition-colors duration-200",
            isOpen && "border border-custom-border-200"
          )}
          onClick={() => inputRef.current?.focus()}
        >
          <SearchIcon className="shrink-0 size-3.5 text-custom-text-350 mr-2" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value) setIsSearching(true);
            }}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            placeholder="Search"
            className="flex-1 bg-transparent text-sm text-custom-text-100 placeholder-custom-text-350 outline-none min-w-0"
          />
          {searchQuery && (
            <button onClick={handleClear} className="shrink-0 ml-2">
              <CloseIcon className="size-3.5 text-custom-text-400 hover:text-custom-text-100" />
            </button>
          )}
        </div>
      </div>

      <div
        className={cn(
          "absolute -top-[6px] left-1/2 -translate-x-1/2  bg-custom-background-100 border border-custom-border-200 rounded-md shadow-lg overflow-hidden z-20  transition-all duration-300 ease-in-out flex flex-col px-3 pt-10",
          {
            "opacity-100 w-[574px] max-h-[80vh]": isOpen,
            "opacity-0 w-0 h-0": !isOpen,
          }
        )}
      >
        {!searchQuery ? (
          <div className="flex flex-col gap-4 items-center justify-center h-full py-8">
            <div className="w-24 h-24 bg-custom-background-90 rounded-full flex items-center justify-center">
              <Search className="w-14 h-14 text-custom-text-400/40" />
            </div>
            <div className="text-center space-y-2">
              <div className="text-xl font-bold text-custom-text-300">Search your workspace</div>
              <div className="text-sm text-custom-text-300 max-w-[300px]">
                Start typing to search across workitems, projects, cycles,modules and more
              </div>
            </div>
          </div>
        ) : (
          <SearchResults
            query={searchQuery}
            flattenedSearchResults={flattenedSearchResults}
            setFlattenedSearchResults={setFlattenedSearchResults}
            isSearching={isSearching}
            setIsSearching={setIsSearching}
          />
        )}
      </div>
    </div>
  );
});
