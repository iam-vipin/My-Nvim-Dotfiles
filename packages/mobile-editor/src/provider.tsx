import { FC, ReactNode } from "react";
import { ThemeProvider } from "next-themes";
// mobx store provider
import { StoreProvider } from "@/lib/store-context";

export interface IAppProvider {
  children: ReactNode;
}

const themes = ["light", "dark"];

export function AppProvider(props: IAppProvider) {
  const { children } = props;
  return (
    <>
      <StoreProvider>
        <ThemeProvider themes={themes} defaultTheme="system">
          {children}
        </ThemeProvider>
      </StoreProvider>
    </>
  );
}
