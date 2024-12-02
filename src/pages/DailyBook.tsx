import React, { useState, useEffect } from 'react';
import { format, parseISO, isWithinInterval } from 'date-fns';
import { useStore } from '../store/useStore';
import { LedgerEntry } from '../types';
import { Download } from 'lucide-react';
import html2pdf from 'html2pdf.js';

export default function DailyBook() {
  const {
    sales,
    expenses,
    purchases,
    fetchSales,
    fetchExpenses,
    fetchPurchases,
    isSalesLoaded,
    isExpensesLoaded,
    isPurchasesLoaded
  } = useStore();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [openingBalance, setOpeningBalance] = useState(0);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [showLedger, setShowLedger] = useState(false);

  useEffect(() => {
    if (!isSalesLoaded) {
      fetchSales();
    }
    if (!isExpensesLoaded) {
      fetchExpenses();
    }
    if (!isPurchasesLoaded) {
      fetchPurchases();
    }
  }, [fetchSales, fetchExpenses, fetchPurchases, isSalesLoaded, isExpensesLoaded, isPurchasesLoaded]);

  const generateLedger = () => {
    if (!startDate || !endDate) return;

    const start = parseISO(startDate);
    const end = parseISO(endDate);

    // Get all transactions within the date range
    const filteredSales = sales.filter(sale => 
      isWithinInterval(parseISO(sale.date), { start, end })
    );

    const filteredExpenses = expenses.filter(expense => 
      isWithinInterval(parseISO(expense.date), { start, end })
    );

    const filteredPurchases = purchases.filter(purchase => 
      isWithinInterval(parseISO(purchase.date), { start, end })
    );

    // Combine and sort all transactions by date
    const allTransactions = [
      ...filteredSales.map(sale => ({
        date: sale.date,
        type: 'SALE' as const,
        amount: sale.total,
        description: `Sale to ${sale.customerName}`,
        reference: sale.invoiceNumber
      })),
      ...filteredExpenses.map(expense => ({
        date: expense.date,
        type: 'EXPENSE' as const,
        amount: expense.amount,
        description: expense.name,
        reference: expense.invoiceNumber
      })),
      ...filteredPurchases.map(purchase => ({
        date: purchase.date,
        type: 'PURCHASE' as const,
        amount: purchase.subtotal,
        description: `Purchase from ${purchase.supplierName}`,
        reference: purchase.invoiceNumber
      }))
    ].sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());

    // Generate ledger entries
    let currentBalance = openingBalance;
    const entries: LedgerEntry[] = [
      {
        date: startDate,
        description: 'Opening Balance',
        type: 'OPENING',
        credit: 0,
        debit: 0,
        balance: currentBalance
      }
    ];

    allTransactions.forEach(transaction => {
      if (transaction.type === 'SALE') {
        currentBalance += transaction.amount;
        entries.push({
          date: transaction.date,
          description: transaction.description,
          type: transaction.type,
          credit: transaction.amount,
          debit: 0,
          balance: currentBalance,
          reference: transaction.reference
        });
      } else {
        // Both EXPENSE and PURCHASE reduce the balance
        currentBalance -= transaction.amount;
        entries.push({
          date: transaction.date,
          description: transaction.description,
          type: transaction.type,
          credit: 0,
          debit: transaction.amount,
          balance: currentBalance,
          reference: transaction.reference
        });
      }
    });

    setLedger(entries);
    setShowLedger(true);
  };

  const exportToPdf = async () => {
    const html = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <h1 style="text-align: center; color: #1a56db; margin-bottom: 20px;">
          Daily Book Report
        </h1>
        <div style="margin-bottom: 20px;">
          <p><strong>Period:</strong> ${format(parseISO(startDate), 'dd/MM/yyyy')} - ${format(parseISO(endDate), 'dd/MM/yyyy')}</p>
          <p><strong>Opening Balance:</strong> ₹${openingBalance}</p>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Date</th>
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Description</th>
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Reference</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Credit</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Debit</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Balance</th>
            </tr>
          </thead>
          <tbody>
            ${ledger.map(entry => `
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
                  ${format(parseISO(entry.date), 'dd/MM/yyyy')}
                </td>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
                  ${entry.description}
                </td>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
                  ${entry.reference || '-'}
                </td>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
                  ${entry.credit ? `₹${entry.credit}` : '-'}
                </td>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
                  ${entry.debit ? `₹${entry.debit}` : '-'}
                </td>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
                  ₹${entry.balance}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    const element = document.createElement('div');
    element.innerHTML = html;
    document.body.appendChild(element);

    try {
      await html2pdf()
        .set({
          margin: 1,
          filename: `daily-book-${startDate}-to-${endDate}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        })
        .from(element)
        .save();
    } finally {
      document.body.removeChild(element);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Daily Book</h1>
          {showLedger && (
            <button
              onClick={exportToPdf}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
            >
              <Download className="w-5 h-5 mr-2" />
              Export
            </button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Opening Balance
              </label>
              <input
                type="number"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(parseFloat(e.target.value))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={generateLedger}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Generate Ledger
            </button>
          </div>
        </div>

        {showLedger && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reference
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Credit
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Debit
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Balance
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ledger.map((entry, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {format(parseISO(entry.date), 'dd/MM/yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {entry.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {entry.reference || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {entry.credit ? `₹${entry.credit}` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {entry.debit ? `₹${entry.debit}` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        ₹{entry.balance}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}