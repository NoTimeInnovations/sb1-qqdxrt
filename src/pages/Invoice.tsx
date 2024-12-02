import React from 'react';
import { useParams } from 'react-router-dom';
import { Printer } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Invoice() {
  const { id } = useParams();
  const { sales, customers } = useStore();
  
  const sale = sales.find(s => s.id === id);
  const customer = customers.find(c => sale && c.id === sale.customerId);

  if (!sale || !customer) {
    return (
      <div className="max-w-3xl mx-auto p-8">
        <p className="text-gray-600">Invoice not found</p>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div className="print:hidden max-w-3xl mx-auto mb-6 flex justify-end">
        <button
          onClick={handlePrint}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
        >
          <Printer className="w-5 h-5 mr-2" />
          Print Invoice
        </button>
      </div>

      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-8 print:shadow-none print:rounded-none">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800">SHARON Industries</h1>
          <p className="text-gray-600">Kanjiramattom P.O Ernakulam</p>
          <p className="text-gray-600">PIN: 682315</p>
          <p className="text-gray-600">GSTIN: 9447156765</p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Invoice</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Invoice No: #{sale.invoiceNumber}</p>
              <p className="text-gray-600">
                Date: {new Date(sale.date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Bill To:</h3>
              <p className="text-gray-600">{customer.name}</p>
              {customer.phone && <p className="text-gray-600">{customer.phone}</p>}
              <p className="text-gray-600">{customer.address}</p>
            </div>
          </div>
        </div>

        <table className="min-w-full divide-y divide-gray-200 mb-6">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sale.items.map((item, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {item.productName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{item.quantity}</td>
                <td className="px-6 py-4 whitespace-nowrap">₹{item.price}</td>
                <td className="px-6 py-4 whitespace-nowrap">₹{item.total}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border-t pt-4">
          <div className="flex justify-between mb-2">
            <span className="font-semibold">Subtotal:</span>
            <span>₹{sale.subtotal}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="font-semibold">Discount:</span>
            <span>₹{sale.discount}</span>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span>₹{sale.total}</span>
          </div>
        </div>

        <div className="mt-12 text-center text-gray-600">
          <p>Thank you for your business!</p>
        </div>
      </div>
    </>
  );
}