import { Table, TableBody, TableCell, TableRow } from "@plane/propel/table";
import { Loader } from "@plane/ui";

export function DomainListLoader() {
  return (
    <Loader>
      <div className="w-full">
        <Table>
          <TableBody>
            {Array.from({ length: 3 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell className="py-4">
                  <Loader.Item height="14px" width="120px" />
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex gap-2">
                    <Loader.Item height="12px" width="12px" className="rounded-full" />
                    <Loader.Item height="14px" width="60px" />
                  </div>
                </TableCell>
                <TableCell className="py-4 text-right">
                  <Loader.Item height="20px" width="10px" className="rounded" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Loader>
  );
}
