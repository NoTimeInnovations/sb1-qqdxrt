import React, { useState } from 'react';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';

export default function Expenses() {
  const [activeTab, setActiveTab] = useState<'new' | 'list'>('new');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Expenses</h1>
        
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('new')}
              className={`${
                activeTab === 'new'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              New Expense
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`${
                activeTab === 'list'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Expense List
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'new' ? <ExpenseForm /> : <ExpenseList />}
    </div>
  );
}