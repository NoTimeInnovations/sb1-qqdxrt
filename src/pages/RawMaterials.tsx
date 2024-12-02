import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Download } from 'lucide-react';
import Modal from '../components/Modal';
import { RawMaterial } from '../types';
import { useStore } from '../store/useStore';
import html2pdf from 'html2pdf.js';

export default function RawMaterials() {
  const {
    rawMaterials,
    addRawMaterial,
    updateRawMaterial,
    deleteRawMaterial,
    fetchRawMaterials,
    isRawMaterialsLoaded,
  } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<RawMaterial | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    stock: 0,
    threshold: 0,
    price: 0,
  });

  useEffect(() => {
    if (!isRawMaterialsLoaded) {
      fetchRawMaterials();
    }
  }, [fetchRawMaterials, isRawMaterialsLoaded]);

  const handleExport = async () => {
    const materialsData = rawMaterials.map(material => ({
      name: material.name,
      stock: material.stock,
      price: material.price,
      total: material.price * material.stock
    }));

    const grandTotal = materialsData.reduce((sum, item) => sum + item.total, 0);

    const html = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <h1 style="text-align: center; color: #1a56db; margin-bottom: 20px;">
          Raw Materials Report
        </h1>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Material Name</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Stock</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Price</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Total Value</th>
            </tr>
          </thead>
          <tbody>
            ${materialsData.map(item => `
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${item.stock}</td>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹${item.price}</td>
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
          filename: 'raw-materials-report.pdf',
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
    if (isEditMode && selectedMaterial) {
      await updateRawMaterial(selectedMaterial.id, formData);
    } else {
      await addRawMaterial(formData);
    }
    setIsModalOpen(false);
    resetForm();
  };

  const handleEdit = (material: RawMaterial) => {
    setSelectedMaterial(material);
    setFormData({
      name: material.name,
      stock: material.stock,
      threshold: material.threshold,
      price: material.price || 0,
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this material?')) {
      await deleteRawMaterial(id);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      stock: 0,
      threshold: 0,
      price: 0,
    });
    setSelectedMaterial(null);
    setIsEditMode(false);
  };

  const getStockStatus = (material: RawMaterial) => {
    return material.stock < material.threshold ? (
      <span className="text-red-600 font-medium">Low Stock</span>
    ) : (
      <span className="text-green-600 font-medium">Sufficient</span>
    );
  };

  // Calculate grand total
  const grandTotal = rawMaterials.reduce((sum, material) => 
    sum + (material.price * material.stock), 0
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Raw Materials</h1>
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
            Add Material
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Material Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Threshold
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rawMaterials.map((material) => (
                <tr key={material.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{material.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{material.stock}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{material.threshold}</td>
                  <td className="px-6 py-4 whitespace-nowrap">₹{material.price || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap">₹{material.price * material.stock}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStockStatus(material)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(material)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(material.id)}
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
                <td colSpan={4} className="px-6 py-4 text-right font-bold">
                  Grand Total:
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-bold">
                  ₹{grandTotal}
                </td>
                <td colSpan={2}></td>
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
        title={isEditMode ? "Edit Material" : "Add New Material"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Material Name
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
              Stock
            </label>
            <input
              type="number"
              value={formData.stock}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  stock: parseInt(e.target.value),
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Threshold
            </label>
            <input
              type="number"
              value={formData.threshold}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  threshold: parseInt(e.target.value),
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Price
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  price: parseFloat(e.target.value),
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
              {isEditMode ? "Update" : "Add"} Material
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}