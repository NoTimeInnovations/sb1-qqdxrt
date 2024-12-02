import React, { useState, useEffect } from 'react';
import { Plus, Download } from 'lucide-react';
import Modal from '../components/Modal';
import ExportModal from '../components/ExportModal';
import { RawMaterial, Supplier, PurchaseItem } from '../types';
import { useStore } from '../store/useStore';
import { exportToPdf } from '../utils/exportPdf';
import { format } from 'date-fns';
import CustomerSupplierSearch from '../components/CustomerSupplierSearch';
import MaterialTable from '../components/MaterialTable';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import TotalCard from '../components/TotalCard';
import AddItemButton from '../components/AddItemButton';

export default function Purchases() {
  const {
    rawMaterials,
    suppliers,
    purchases,
    addSupplier,
    addPurchase,
    isRawMaterialsLoaded,
    isSuppliersLoaded,
    isPurchasesLoaded,
    fetchRawMaterials,
    fetchSuppliers,
    fetchPurchases
  } = useStore();
  
  const [supplierSearch, setSupplierSearch] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [newSupplier, setNewSupplier] = useState<Partial<Supplier>>({});
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!isRawMaterialsLoaded) {
      fetchRawMaterials();
    }
    if (!isSuppliersLoaded) {
      fetchSuppliers();
    }
    if (!isPurchasesLoaded) {
      fetchPurchases();
    }
  }, [isRawMaterialsLoaded, isSuppliersLoaded, isPurchasesLoaded, fetchRawMaterials, fetchSuppliers, fetchPurchases]);

  // Filter suppliers based on search
  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(supplierSearch.toLowerCase()) ||
    supplier.address.toLowerCase().includes(supplierSearch.toLowerCase())
  );

  const addItem = () => {
    setItems([
      ...items,
      {
        materialId: '',
        materialName: '',
        quantity: 0,
        price: 0,
        total: 0,
      },
    ]);
  };

  const updateItem = (index: number, field: keyof PurchaseItem, value: any) => {
    const newItems = [...items];
    const item = { ...newItems[index] };

    if (field === 'materialId') {
      const material = rawMaterials.find((m) => m.id === value);
      if (material) {
        item.materialId = material.id;
        item.materialName = material.name;
      }
    } else if (field === 'price') {
      item.price = value;
      item.total = item.quantity * value;
    } else if (field === 'quantity') {
      item.quantity = value;
      item.total = value * item.price;
    }

    newItems[index] = item;
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);

  const handleSubmit = async () => {
    if (!selectedSupplier || items.length === 0) {
      setErrorMessage('Please select a supplier and add items');
      return;
    }

    try {
      const purchase = {
        invoiceNumber: invoiceNumber || "-",
        supplierId: selectedSupplier.id,
        supplierName: selectedSupplier.name,
        items,
        subtotal,
        date: purchaseDate,
      };

      await addPurchase(purchase);
      resetForm();
      setIsConfirmModalOpen(false);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to create purchase');
      setIsConfirmModalOpen(false);
    }
  };

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplier.name || !newSupplier.phone || !newSupplier.address) {
      setErrorMessage('Please fill in all supplier details');
      return;
    }

    try {
      await addSupplier(newSupplier as Omit<Supplier, 'id'>);
      setIsSupplierModalOpen(false);
      setNewSupplier({});
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to add supplier');
    }
  };

  const handleExport = async (startDate: string, endDate: string) => {
    await exportToPdf(purchases, startDate, endDate, 'purchases');
  };

  const resetForm = () => {
    setSupplierSearch('');
    setSelectedSupplier(null);
    setItems([]);
    setInvoiceNumber('');
    setPurchaseDate(format(new Date(), 'yyyy-MM-dd'));
    setErrorMessage('');
  };

  return (
    <div>
      <PageHeader 
        title="New Purchase"
        actions={
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
          >
            <Download className="w-5 h-5 mr-2" />
            Export
          </button>
        }
      />
      
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <span className="block sm:inline">{errorMessage}</span>
          <button
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setErrorMessage('')}
          >
            ×
          </button>
        </div>
      )}
      
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Invoice Number (Optional)
            </label>
            <input
              type="text"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter invoice number..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Purchase Date
            </label>
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <CustomerSupplierSearch
          label="Supplier Name"
          searchValue={supplierSearch}
          onSearchChange={(value) => {
            setSupplierSearch(value);
            setShowSupplierDropdown(true);
          }}
          showDropdown={showSupplierDropdown}
          filteredResults={filteredSuppliers}
          onSelect={(supplier) => {
            setSelectedSupplier(supplier);
            setSupplierSearch(supplier.name);
            setShowSupplierDropdown(false);
          }}
          onAddNew={() => setIsSupplierModalOpen(true)}
          placeholder="Search supplier..."
        />

        <AddItemButton onClick={addItem} label="Add Material" />

        <MaterialTable
          items={items}
          rawMaterials={rawMaterials}
          onUpdateItem={updateItem}
          onRemoveItem={removeItem}
        />

        <div className="mt-6">
          <TotalCard
            subtotal={subtotal}
            total={subtotal}
            onSubmit={() => setIsConfirmModalOpen(true)}
            submitLabel="Complete Purchase"
            disabled={!selectedSupplier || items.length === 0}
          />
        </div>
      </Card>

      <Modal
        isOpen={isSupplierModalOpen}
        onClose={() => setIsSupplierModalOpen(false)}
        title="Add New Supplier"
      >
        <form onSubmit={handleAddSupplier} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Supplier Name
            </label>
            <input
              type="text"
              value={newSupplier.name || ''}
              onChange={(e) =>
                setNewSupplier({ ...newSupplier, name: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              type="tel"
              value={newSupplier.phone || ''}
              onChange={(e) =>
                setNewSupplier({ ...newSupplier, phone: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <textarea
              value={newSupplier.address || ''}
              onChange={(e) =>
                setNewSupplier({ ...newSupplier, address: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsSupplierModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Supplier
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Confirm Purchase"
      >
        <div className="space-y-4">
          <p>Are you sure you want to complete this purchase?</p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsConfirmModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Confirm
            </button>
          </div>
        </div>
      </Modal>

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
        title="Export Purchases Report"
      />
    </div>
  );
}