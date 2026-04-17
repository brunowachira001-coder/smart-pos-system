import React from 'react';

interface TableProps {
  columns: Array<{ key: string; label: string; render?: (value: any, row: any) => React.ReactNode }>;
  data: any[];
  loading?: boolean;
  onRowClick?: (row: any) => void;
}

export const Table: React.FC<TableProps> = ({ columns, data, loading = false, onRowClick }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin text-emerald-600 text-3xl">⏳</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 text-slate-500">
        No data available
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-slate-200 bg-slate-50">
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={idx}
              className="border-b border-slate-200 hover:bg-slate-50 cursor-pointer transition"
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-sm text-slate-700">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
