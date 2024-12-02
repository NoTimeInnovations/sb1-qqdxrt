import React from 'react';
import { Trash2 } from 'lucide-react';
import { RawMaterial, PurchaseItem } from '../types';

interface MaterialTableProps {
  items: PurchaseItem[];
  rawMaterials: RawMaterial[];
  onUpdateItem: (index: number, field: keyof PurchaseItem, value: any) => void;
  onRemoveItem: (index: number) => void;
}

export default function MaterialTable({
  items,
  rawMaterials,
  onUpdateItem,
  onRemoveItem,
}: MaterialTableProps) {
  return (
    <>
      {/* Desktop view */}
      <div className="hidden lg:block">
        <table className="min-w-full divide-y divide-gray-200 mb-4">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Material
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
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={item.materialId}
                    onChange={(e) =>
                      onUpdateItem(index, 'materialId', e.target.value)
                    }
                    className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select a material</option>
                    {rawMaterials.map((material) => (
                      <option key={material.id} value={material.id}>
                        {material.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="number"
                    value={item.price}
                    onChange={(e) =>
                      onUpdateItem(index, 'price', parseFloat(e.target.value))
                    }
                    className="w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      onUpdateItem(index, 'quantity', parseInt(e.target.value))
                    }
                    className="w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Material
              </label>
              <select
                value={item.materialId}
                onChange={(e) =>
                  onUpdateItem(index, 'materialId', e.target.value)
                }
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select a material</option>
                {rawMaterials.map((material) => (
                  <option key={material.id} value={material.id}>
                    {material.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Price
                </label>
                <input
                  type="number"
                  value={item.price}
                  onChange={(e) =>
                    onUpdateItem(index, 'price', parseFloat(e.target.value))
                  }
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    onUpdateItem(index, 'quantity', parseInt(e.target.value))
                  }
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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