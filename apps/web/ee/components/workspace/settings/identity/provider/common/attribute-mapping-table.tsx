// plane imports
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@plane/propel/table";

type TAttributeMapping = {
  idp: string;
  plane: string;
};

const SAML_ATTRIBUTE_MAPPINGS: TAttributeMapping[] = [
  { idp: "Name ID format", plane: "emailAddress" },
  { idp: "first_name", plane: "user.firstname" },
  { idp: "last_name", plane: "user.lastname" },
  { idp: "email", plane: "user.email" },
];

type TAttributeMappingTableProps = {
  t: (key: string) => string;
};

export function AttributeMappingTable(props: TAttributeMappingTableProps) {
  const { t } = props;

  return (
    <div className="w-full overflow-hidden">
      <Table>
        <TableHeader className="bg-transparent border-none">
          <TableRow>
            <TableHead className="text-primary text-body-xs-semibold">
              {t("sso.providers.saml.setup_modal.mapping_table.table.idp")}
            </TableHead>
            <TableHead className="text-primary text-body-xs-semibold">
              {t("sso.providers.saml.setup_modal.mapping_table.table.plane")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {SAML_ATTRIBUTE_MAPPINGS.map((mapping, index) => (
            <TableRow key={index}>
              <TableCell className="text-body-xs-medium text-primary">{mapping.idp}</TableCell>
              <TableCell className="text-body-xs-medium text-primary">{mapping.plane}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
