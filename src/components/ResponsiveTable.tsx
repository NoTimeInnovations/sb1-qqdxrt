import React from 'react';

interface Column {
  header: string;
  accessor: string;
  render?: (value: any, item: any) => React.ReactNode;
}

interface ResponsiveTableProps {
  columns: Column[];
  data: any[];
  keyField: string;
  cardActions?: (item: any) => React.ReactNode;
}

export default function ResponsiveTable({ columns, data, keyField, cardActions }: ResponsiveTableProps) {
  return (
    <>
      {/* Table view for larger screens */}
      <div className="hidden lg:block overflow-hidden bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item) => (
              <tr key={item[keyField]}>
                {columns.map((column, index) => (
                  <td key={index} className="px-6 py-4 whitespace-nowrap">
                    {column.render ? column.render(item[column.accessor], item) : item[column.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Card view for mobile screens */}
      <div className="lg:hidden space-y-4">
        {data.map((item) => (
          <div
            key={item[keyField]}
            className="bg-white rounded-lg shadow p-4 space-y-3"
          >
            {columns.map((column, index) => (
              <div key={index} className="flex justify-between items-start">
                <span className="text-sm font-medium text-gray-500">
                  {column.header}:
                </span>
                <span className="text-sm text-gray-900 text-right">
                  {column.render ? column.render(item[column.accessor], item) : item[column.accessor]}
                </span>
              </div>
            ))}
            {cardActions && (
              <div className="mt-4 flex justify-end space-x-2">
                {cardActions(item)}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}