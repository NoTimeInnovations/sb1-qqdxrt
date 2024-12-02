import React, { useState,useEffect } from 'react';
import { useStore } from '../store/useStore';
import { format } from 'date-fns';
import { FileText, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import ExportModal from '../components/ExportModal';
import { exportToPdf } from '../utils/exportPdf';

export default function SalesHistory() {
  const {
    sales,
    fetchSales,
    isSalesLoaded,
  } = useStore();

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  
  useEffect(() => {
    if (!isSalesLoaded) {
      fetchSales();
    }
  }, [fetchSales, isSalesLoaded]);

  const handleExport = async (startDate: string, endDate: string) => {
    await exportToPdf(sales, startDate, endDate, 'sales');
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Sales History</h1>
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
          >
            <Download className="w-5 h-5 mr-2" />
            Export
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Invoice No
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Items
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
            {sales.map((sale) => (
              <tr key={sale.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {format(new Date(sale.date), 'dd/MM/yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  #{sale.invoiceNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {sale.customerName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {sale.items.length} items
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  ₹{sale.total}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link
                    to={`/invoice/${sale.id}`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <FileText className="w-5 h-5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
        title="Export Sales Report"
      />
    </div>
  );
}