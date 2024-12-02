import React from 'react';
import { Plus } from 'lucide-react';

interface AddItemButtonProps {
  onClick: () => void;
  label: string;
}

export default function AddItemButton({ onClick, label }: AddItemButtonProps) {
  return (
    <button
      onClick={onClick}
      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center mb-4"
    >
      <Plus className="w-5 h-5 mr-2" />
      {label}
    </button>
  );
}