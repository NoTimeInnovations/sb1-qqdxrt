import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Download } from 'lucide-react';
import Modal from '../components/Modal';
import { Product } from '../types';
import { useStore } from '../store/useStore';
import { calculateInventoryPrice } from '../utils/pricing';
import html2pdf from 'html2pdf.js';

export default function Inventory() {
  const {
    products,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    isProductsLoaded,
  } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    salesPrice: 0,
    stockQuantity: 0,
    displayQuantity: 0,
  });

  useEffect(() => {
    if (!isProductsLoaded) {
      fetchProducts();
    }
  }, [fetchProducts, isProductsLoaded]);

  const handleExport = async () => {
    const inventoryData = products.map(product => ({
      name: product.name,
      price: product.inventoryPrice,
      stockQuantity: product.stockQuantity,
      total: product.inventoryPrice * product.stockQuantity
    }));

    const grandTotal = inventoryData.reduce((sum, item) => sum + item.total, 0);

    const html = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <h1 style="text-align: center; color: #1a56db; margin-bottom: 20px;">
          Inventory Report
        </h1>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Product Name</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Price</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Stock Quantity</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Total Value</th>
            </tr>
          </thead>
          <tbody>
            ${inventoryData.map(item => `
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹${item.price}</td>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${item.stockQuantity}</td>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹${item.total}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr style="font-weight: bold; background-color: #f3f4f6;">
              <td colspan="3" style="padding: 12px; text-align: right;">Grand Total:</td>
              <td style="padding: 12px; text-align: right;">₹${grandTotal}</td>
            </tr>
          </tfoot>
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
          filename: 'inventory-report.pdf',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const inventoryPrice = calculateInventoryPrice(formData.salesPrice);
    
    if (isEditMode && selectedProduct) {
      await updateProduct(selectedProduct.id, { ...formData, inventoryPrice });
    } else {
      await addProduct({ ...formData, inventoryPrice });
    }
    setIsModalOpen(false);
    resetForm();
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      salesPrice: product.salesPrice,
      stockQuantity: product.stockQuantity,
      displayQuantity: product.displayQuantity,
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(id);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      salesPrice: 0,
      stockQuantity: 0,
      displayQuantity: 0,
    });
    setSelectedProduct(null);
    setIsEditMode(false);
  };

  // Calculate grand total
  const grandTotal = products.reduce((sum, product) => 
    sum + (product.inventoryPrice * product.stockQuantity), 0
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Inventory</h1>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700"
          >
            <Download className="w-5 h-5 mr-2" />
            Export
          </button>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Product
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sales Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inventory Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Display Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">₹{product.salesPrice}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">₹{product.inventoryPrice}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.stockQuantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.displayQuantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ₹{product.inventoryPrice * product.stockQuantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={5} className="px-6 py-4 text-right font-bold">
                  Grand Total:
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-bold">
                  ₹{grandTotal}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={isEditMode ? "Edit Product" : "Add New Product"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Product Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Sales Price
            </label>
            <input
              type="number"
              value={formData.salesPrice}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  salesPrice: parseFloat(e.target.value),
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Inventory Price (20% less than Sales Price)
            </label>
            <input
              type="number"
              value={calculateInventoryPrice(formData.salesPrice)}
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm text-gray-500"
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Stock Quantity
            </label>
            <input
              type="number"
              value={formData.stockQuantity}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  stockQuantity: parseInt(e.target.value),
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Display Quantity
            </label>
            <input
              type="number"
              value={formData.displayQuantity}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  displayQuantity: parseInt(e.target.value),
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {isEditMode ? "Update" : "Add"} Product
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}