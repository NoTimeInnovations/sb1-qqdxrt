import React, { useState,useEffect } from 'react';
import { useStore } from '../store/useStore';
import { format } from 'date-fns';
import { Download } from 'lucide-react';
import ExportModal from '../components/ExportModal';
import { exportToPdf } from '../utils/exportPdf';

export default function PurchaseHistory() {
  const { purchases, fetchPurchases, isPurchasesLoaded } = useStore();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  useEffect(() => {
    if (!isPurchasesLoaded) {
      fetchPurchases();
    }
  }, [fetchPurchases, isPurchasesLoaded]);

  const handleExport = async (startDate: string, endDate: string) => {
    await exportToPdf(purchases, startDate, endDate, 'purchases');
  };

  const formatMaterialsList = (items: Array<{ materialName: string; quantity: number }>) => {
    return items.map(item => `${item.materialName}(${item.quantity})`).join(', ');
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Purchase History</h1>
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
                Supplier
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Materials
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {purchases.map((purchase) => (
              <tr key={purchase.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {format(new Date(purchase.date), 'dd/MM/yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  #{purchase.invoiceNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {purchase.supplierName}
                </td>
                <td className="px-6 py-4">
                  {formatMaterialsList(purchase.items)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  ₹{purchase.subtotal}
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
        title="Export Purchases Report"
      />
    </div>
  );
}