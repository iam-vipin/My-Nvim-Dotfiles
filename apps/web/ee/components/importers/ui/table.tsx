import { Loader } from "@plane/ui";

type TImporterTable = {
  isLoading?: boolean;
  headerLeft: string;
  headerRight: string;
  iterator: ("" | { id: string; name: string | undefined; value: React.ReactNode } | undefined)[] | undefined;
};

function ImporterTable(props: TImporterTable) {
  const { isLoading = false, headerLeft, headerRight, iterator } = props;
  return (
    <div className="w-full min-h-44 max-h-full overflow-y-auto">
      <div className="relative grid grid-cols-2 items-center p-3 text-13 font-medium border-b border-subtle text-tertiary">
        <div>{headerLeft}</div>
        <div>{headerRight}</div>
      </div>
      <div className="mt-4">
        {isLoading ? (
          <Loader className="relative w-full grid grid-cols-2 items-center py-4 gap-4">
            <Loader.Item height="35px" width="100%" />
            <Loader.Item height="35px" width="100%" />
            <Loader.Item height="35px" width="100%" />
            <Loader.Item height="35px" width="100%" />
            <Loader.Item height="35px" width="100%" />
            <Loader.Item height="35px" width="100%" />
          </Loader>
        ) : (
          iterator &&
          iterator.map(
            (item) =>
              item &&
              item?.id && (
                <div key={item.id} className="relative grid grid-cols-2 items-center p-3 text-13">
                  <div className="text-secondary">{item.name}</div>
                  {item.value}
                </div>
              )
          )
        )}
      </div>
    </div>
  );
}

export default ImporterTable;
