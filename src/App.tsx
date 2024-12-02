import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Inventory from './pages/Inventory';
import Manufacturing from './pages/Manufacturing';
import Sales from './pages/Sales';
import Invoice from './pages/Invoice';
import SalesHistory from './pages/SalesHistory';
import RawMaterials from './pages/RawMaterials';
import Purchases from './pages/Purchases';
import PurchaseHistory from './pages/PurchaseHistory';
import Expenses from './pages/Expenses';
import DailyBook from './pages/DailyBook';
import Container from './components/Container';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Container className="py-6">
          <Routes>
            <Route path="/" element={<Inventory />} />
            <Route path="/raw-materials" element={<RawMaterials />} />
            <Route path="/manufacturing" element={<Manufacturing />} />
            <Route path="/purchases" element={<Purchases />} />
            <Route path="/purchase-history" element={<PurchaseHistory />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/sales-history" element={<SalesHistory />} />
            <Route path="/invoice/:id" element={<Invoice />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/daily-book" element={<DailyBook />} />
          </Routes>
        </Container>
      </div>
    </BrowserRouter>
  );
}

export default App;