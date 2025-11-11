"use client";

import { observer } from "mobx-react";
// plane web components
import TeamspacesListRoot from "@/plane-web/components/teamspaces/list/root";

function TeamspacesListPage() {
  return <TeamspacesListRoot />;
}

export default observer(TeamspacesListPage);
