import React from 'react';
import { Trash2 } from 'lucide-react';

interface Item {
  id?: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

interface ItemsTableProps {
  items: Item[];
  onRemoveItem: (index: number) => void;
  onUpdateItem: (index: number, field: string, value: any) => void;
  renderItemSelect: (index: number, item: Item) => React.ReactNode;
}

export default function ItemsTable({
  items,
  onRemoveItem,
  onUpdateItem,
  renderItemSelect,
}: ItemsTableProps) {
  return (
    <>
      {/* Desktop view */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item, index) => (
              <tr key={index}>
                <td className="px-6 py-4">{renderItemSelect(index, item)}</td>
                <td className="px-6 py-4 whitespace-nowrap">₹{item.price}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      onUpdateItem(index, 'quantity', parseInt(e.target.value))
                    }
                    className="w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    min="1"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">₹{item.total}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => onRemoveItem(index)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile view */}
      <div className="lg:hidden space-y-4">
        {items.map((item, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-4 space-y-4">
            <div>{renderItemSelect(index, item)}</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Price
                </label>
                <span className="text-gray-900">₹{item.price}</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    onUpdateItem(index, 'quantity', parseInt(e.target.value))
                  }
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min="1"
                />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm font-medium text-gray-500">Total: </span>
                <span className="text-gray-900">₹{item.total}</span>
              </div>
              <button
                onClick={() => onRemoveItem(index)}
                className="text-red-600 hover:text-red-900"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}