export const SAMLAttributeMappingTable = () => (
  <table className="table-auto border-collapse text-custom-text-200 text-sm w-full">
    <thead>
      <tr className="text-left border-b border-custom-border-200">
        <th className="py-2">IdP</th>
        <th className="py-2">Plane</th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-b border-custom-border-200">
        <td className="py-2">Name ID format</td>
        <td className="py-2">emailAddress</td>
      </tr>
      <tr className="border-b border-custom-border-200">
        <td className="py-2">first_name</td>
        <td className="py-2">user.firstName</td>
      </tr>
      <tr className="border-b border-custom-border-200">
        <td className="py-2">last_name</td>
        <td className="py-2">user.lastName</td>
      </tr>
      <tr className="border-b border-custom-border-200">
        <td className="py-2">email</td>
        <td className="py-2">user.email</td>
      </tr>
    </tbody>
  </table>
);
