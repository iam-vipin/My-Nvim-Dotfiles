import { FlatfileProvider } from "@flatfile/react";

function FlatfileClientProvider(props: React.ComponentPropsWithoutRef<typeof FlatfileProvider>) {
  return <FlatfileProvider {...props}>{props.children}</FlatfileProvider>;
}

export default FlatfileClientProvider;
