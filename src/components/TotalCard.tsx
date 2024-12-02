import React from 'react';

interface TotalCardProps {
  subtotal: number;
  discount?: number;
  onDiscountChange?: (value: number) => void;
  total: number;
  onSubmit: () => void;
  submitLabel: string;
  disabled?: boolean;
}

export default function TotalCard({
  subtotal,
  discount = 0,
  onDiscountChange,
  total,
  onSubmit,
  submitLabel,
  disabled = false,
}: TotalCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal:</span>
          <span>₹{subtotal}</span>
        </div>
        {onDiscountChange && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Discount:</span>
            <input
              type="number"
              value={discount}
              onChange={(e) => onDiscountChange(parseFloat(e.target.value))}
              className="w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              min="0"
            />
          </div>
        )}
        <div className="flex justify-between font-bold">
          <span>Total:</span>
          <span>₹{total}</span>
        </div>
      </div>

      <button
        onClick={onSubmit}
        disabled={disabled}
        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {submitLabel}
      </button>
    </div>
  );
}