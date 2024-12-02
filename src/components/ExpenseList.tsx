import React,{useEffect} from 'react';
import { useStore } from '../store/useStore';
import { format } from 'date-fns';

export default function ExpenseList() {
  const { expenses, fetchExpenses, isExpensesLoaded } = useStore();

  useEffect(() => {
    if (!isExpensesLoaded) {
      fetchExpenses();
    }
  }, [fetchExpenses, isExpensesLoaded]);

  return (
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
              Expense Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {expenses.map((expense) => (
            <tr key={expense.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                {format(new Date(expense.date), 'dd/MM/yyyy')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {expense.invoiceNumber || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {expense.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                ₹{expense.amount}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}