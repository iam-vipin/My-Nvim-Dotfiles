import { Command } from "cmdk";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
import { Search } from "lucide-react";
// plane imports
import { useTranslation } from "@plane/i18n";
// ce imports
import type { TPowerKModalNoSearchResultsCommandProps } from "@/ce/components/command-palette/power-k/search/no-results-command";
import { PowerKModalNoSearchResultsCommand as BasePowerKModalNoSearchResultsCommand } from "@/ce/components/command-palette/power-k/search/no-results-command";
// components
import { PowerKModalCommandItem } from "@/components/power-k/ui/modal/command-item";
// hooks
import { useAppRouter } from "@/hooks/use-app-router";
// plane web imports
import { useFlag } from "@/plane-web/hooks/store";

export const PowerKModalNoSearchResultsCommand: React.FC<TPowerKModalNoSearchResultsCommandProps> = observer(
  (props) => {
    const { context, searchTerm } = props;
    // navigation
    const router = useAppRouter();
    const { workspaceSlug } = useParams();
    // store hooks
    const isAdvancedSearchEnabled = useFlag(workspaceSlug?.toString() ?? "", "ADVANCED_SEARCH");
    // translation
    const { t } = useTranslation();

    if (!isAdvancedSearchEnabled) return <BasePowerKModalNoSearchResultsCommand {...props} />;

    return (
      <Command.Group>
        <PowerKModalCommandItem
          icon={Search}
          value="no-results"
          label={
            <p className="flex items-center gap-2">
              {t("power_k.search_menu.no_results")}{" "}
              <span className="shrink-0 text-sm text-custom-text-300">
                {t("power_k.search_menu.go_to_advanced_search")}
              </span>
            </p>
          }
          onSelect={() => {
            context.closePalette();
            router.push(`/${workspaceSlug?.toString()}/search/?q=${searchTerm}`);
          }}
        />
      </Command.Group>
    );
  }
);
