export const AdminTable = ({ columns, rows }) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-gold-500/10 bg-navy-900/60 backdrop-blur-md shadow-luxury">
      <table className="min-w-full divide-y divide-gold-500/10">
        <thead className="bg-navy-950/50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-4 py-4 text-left text-xs font-medium uppercase tracking-[0.25em] text-gold-400"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gold-500/10">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-gold-500/5 transition-colors">
              {columns.map((column) => (
                <td key={column.key} className="px-4 py-4 text-sm text-luxe-gray-300 align-top">
                  {typeof row[column.key] === 'function' ? row[column.key]() : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
