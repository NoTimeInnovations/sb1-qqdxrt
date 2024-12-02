import React from 'react';
import { Plus } from 'lucide-react';

interface Entity {
  id: string;
  name: string;
  address: string;
}

interface CustomerSupplierSearchProps {
  label: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  showDropdown: boolean;
  filteredResults: Entity[];
  onSelect: (entity: Entity) => void;
  onAddNew: () => void;
  placeholder: string;
}

export default function CustomerSupplierSearch({
  label,
  searchValue,
  onSearchChange,
  showDropdown,
  filteredResults,
  onSelect,
  onAddNew,
  placeholder,
}: CustomerSupplierSearchProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder={placeholder}
          />
          {showDropdown && searchValue && (
            <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-auto">
              {filteredResults.map((entity) => (
                <div
                  key={entity.id}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => onSelect(entity)}
                >
                  <div className="font-medium">{entity.name}</div>
                  <div className="text-sm text-gray-600">{entity.address}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={onAddNew}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center whitespace-nowrap"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New
        </button>
      </div>
    </div>
  );
}