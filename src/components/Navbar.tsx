import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Factory, ShoppingCart, History, Database, ShoppingBag, Menu, X, DollarSign, BookOpen } from 'lucide-react';

export default function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const closeSidebar = () => setIsSidebarOpen(false);

  const navLinks = [
    { to: '/', icon: Package, text: 'Inventory' },
    { to: '/raw-materials', icon: Database, text: 'Raw Materials' },
    { to: '/manufacturing', icon: Factory, text: 'Manufacturing' },
    { to: '/purchases', icon: ShoppingBag, text: 'Purchases' },
    { to: '/purchase-history', icon: History, text: 'Purchase History' },
    { to: '/sales', icon: ShoppingCart, text: 'Sales' },
    { to: '/sales-history', icon: History, text: 'Sales History' },
    { to: '/expenses', icon: DollarSign, text: 'Expenses' },
    { to: '/daily-book', icon: BookOpen, text: 'Daily Book' },
  ];

  return (
    <>
      <nav className="bg-blue-600 text-white shadow-lg print:hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0 font-bold text-xl">
              SHARON Industries
            </div>
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-md hover:bg-blue-700"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 print:hidden">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={closeSidebar}
          />

          <div className="absolute right-0 top-0 h-full w-64 bg-white shadow-lg">
            <div className="p-4 flex justify-between items-center border-b">
              <h2 className="text-xl font-bold text-gray-800">Menu</h2>
              <button
                onClick={closeSidebar}
                className="p-2 rounded-md hover:bg-gray-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={closeSidebar}
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100"
                >
                  <link.icon className="w-5 h-5 mr-3" />
                  {link.text}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}