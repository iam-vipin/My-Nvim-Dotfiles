// components
import type { TPowerKCommandConfig, TPowerKContext, TPowerKPageType } from "@/components/power-k/core/types";
// local imports
import { PlaneAiAppPowerKModalPagesList } from "./pages/root";

export type TPowerKCommandsListProps = {
  activePage: TPowerKPageType | null;
  context: TPowerKContext;
  handleCommandSelect: (command: TPowerKCommandConfig) => void;
  handlePageDataSelection: (data: unknown) => void;
  isWorkspaceLevel: boolean;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
};

export const PlaneAiAppPowerKCommandsList: React.FC<TPowerKCommandsListProps> = (props) => {
  const { activePage, context, handleCommandSelect, handlePageDataSelection } = props;

  return (
    <>
      <PlaneAiAppPowerKModalPagesList
        activePage={activePage}
        context={context}
        onPageDataSelect={handlePageDataSelection}
        onCommandSelect={handleCommandSelect}
      />
    </>
  );
};
