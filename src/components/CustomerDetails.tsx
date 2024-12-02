import React from 'react';
import { Customer } from '../types';

interface CustomerDetailsProps {
  customer: Customer;
}

export default function CustomerDetails({ customer }: CustomerDetailsProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-4">
      <h3 className="text-sm font-medium text-gray-500 mb-2">Customer Details</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600">Name:</p>
          <p className="font-medium">{customer.name}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Phone:</p>
          <p className="font-medium">{customer.phone}</p>
        </div>
        <div className="sm:col-span-2">
          <p className="text-sm text-gray-600">Address:</p>
          <p className="font-medium">{customer.address}</p>
        </div>
      </div>
    </div>
  );
}