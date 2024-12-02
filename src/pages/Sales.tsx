import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import Modal from '../components/Modal';
import CustomerSupplierSearch from '../components/CustomerSupplierSearch';
import ItemsTable from '../components/ItemsTable';
import TotalCard from '../components/TotalCard';
import AddItemButton from '../components/AddItemButton';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import CustomerDetails from '../components/CustomerDetails';
import { Customer, SaleItem } from '../types';
import { format } from 'date-fns';

export default function Sales() {
  const navigate = useNavigate();
  const {
    products,
    customers,
    addCustomer,
    addSale,
    validateStock,
    fetchProducts,
    fetchCustomers,
    isProductsLoaded,
    isCustomersLoaded,
  } = useStore();
  
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({});
  const [items, setItems] = useState<SaleItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState<number | null>(null);
  const [saleDate, setSaleDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [productSearches, setProductSearches] = useState<string[]>([]);

  useEffect(() => {
    if (!isProductsLoaded) {
      fetchProducts();
    }
    if (!isCustomersLoaded) {
      fetchCustomers();
    }
  }, [fetchProducts, fetchCustomers, isProductsLoaded, isCustomersLoaded]);

  // Filter customers based on search
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.address.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const addItem = () => {
    setItems([
      ...items,
      {
        productId: '',
        productName: '',
        quantity: 1,
        price: 0,
        total: 0,
      },
    ]);
    setProductSearches([...productSearches, '']);
  };

  const updateItem = (index: number, field: keyof SaleItem, value: any) => {
    const newItems = [...items];
    const item = { ...newItems[index] };

    if (field === 'productId') {
      const product = products.find((p) => p.id === value);
      if (product) {
        item.productId = product.id;
        item.productName = product.name;
        item.price = product.salesPrice;
        item.total = item.quantity * product.salesPrice;
      }
    } else if (field === 'quantity') {
      item.quantity = value;
      item.total = value * item.price;
    }

    newItems[index] = item;
    setItems(newItems);
  };

  const updateProductSearch = (index: number, search: string) => {
    const newSearches = [...productSearches];
    newSearches[index] = search;
    setProductSearches(newSearches);
    setShowProductDropdown(index);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
    setProductSearches(productSearches.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const total = subtotal - discount;

  const handleSubmit = async () => {
    if (!selectedCustomer) return;

    const stockValidation = validateStock(items);
    if (!stockValidation.valid) {
      setErrorMessage(stockValidation.message);
      setIsConfirmModalOpen(false);
      return;
    }

    try {
      const sale = {
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        items,
        subtotal,
        discount,
        total,
        date: saleDate,
        vehicleNumber,
      };

      const newSale = await addSale(sale);
      navigate(`/invoice/${newSale.id}`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to create sale');
      setIsConfirmModalOpen(false);
    }
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.name || !newCustomer.address) {
      setErrorMessage('Please fill in customer name and address');
      return;
    }

    try {
      await addCustomer(newCustomer as Omit<Customer, 'id'>);
      setIsCustomerModalOpen(false);
      setNewCustomer({});
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to add customer');
    }
  };

  const renderProductSelect = (index: number, item: SaleItem) => (
    <div className="relative">
      <input
        type="text"
        value={productSearches[index] || ''}
        onChange={(e) => {
          updateProductSearch(index, e.target.value);
        }}
        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        placeholder="Search product..."
      />
      {showProductDropdown === index && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-auto">
          {products
            .filter(product =>
              product.name.toLowerCase().includes((productSearches[index] || '').toLowerCase())
            )
            .map((product) => (
              <div
                key={product.id}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  updateItem(index, 'productId', product.id);
                  updateProductSearch(index, product.name);
                  setShowProductDropdown(null);
                }}
              >
                <div className="font-medium">{product.name}</div>
                <div className="text-sm text-gray-600">
                  Stock: {product.stockQuantity}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );

  return (
    <div>
      <PageHeader title="New Sale" />
      
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
              Sale Date
            </label>
            <input
              type="date"
              value={saleDate}
              onChange={(e) => setSaleDate(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vehicle Number
            </label>
            <input
              type="text"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter vehicle number..."
            />
          </div>
        </div>

        <CustomerSupplierSearch
          label="Customer Name"
          searchValue={customerSearch}
          onSearchChange={(value) => {
            setCustomerSearch(value);
            setShowCustomerDropdown(true);
          }}
          showDropdown={showCustomerDropdown}
          filteredResults={filteredCustomers}
          onSelect={(customer) => {
            setSelectedCustomer(customer);
            setCustomerSearch(customer.name);
            setShowCustomerDropdown(false);
          }}
          onAddNew={() => setIsCustomerModalOpen(true)}
          placeholder="Search customer..."
        />

        {selectedCustomer && <CustomerDetails customer={selectedCustomer} />}

        <AddItemButton onClick={addItem} label="Add Item" />

        <ItemsTable
          items={items}
          onRemoveItem={removeItem}
          onUpdateItem={updateItem}
          renderItemSelect={renderProductSelect}
        />

        <div className="mt-6">
          <TotalCard
            subtotal={subtotal}
            discount={discount}
            onDiscountChange={setDiscount}
            total={total}
            onSubmit={() => setIsConfirmModalOpen(true)}
            submitLabel="Complete Sale"
            disabled={!selectedCustomer || items.length === 0}
          />
        </div>
      </Card>

      <Modal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        title="Add New Customer"
      >
        <form onSubmit={handleAddCustomer} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Customer Name
            </label>
            <input
              type="text"
              value={newCustomer.name || ''}
              onChange={(e) =>
                setNewCustomer({ ...newCustomer, name: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone (Optional)
            </label>
            <input
              type="tel"
              value={newCustomer.phone || ''}
              onChange={(e) =>
                setNewCustomer({ ...newCustomer, phone: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <textarea
              value={newCustomer.address || ''}
              onChange={(e) =>
                setNewCustomer({ ...newCustomer, address: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsCustomerModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Customer
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Confirm Sale"
      >
        <div className="space-y-4">
          <p>Are you sure you want to complete this sale?</p>
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
    </div>
  );
}