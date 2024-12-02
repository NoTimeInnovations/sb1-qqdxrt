import React, { useState,useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';
import { Product, ManufacturingRecord, MaterialUsage, RawMaterial } from '../types';
import { useStore } from '../store/useStore';
import { format } from 'date-fns';

export default function Manufacturing() {
  const {
    products,
    rawMaterials,
    manufacturingRecords,
    addManufacturingRecord,
    fetchProducts,
    fetchRawMaterials,
    fetchManufacturingRecords,
    areProductsLoaded,
    areRawMaterialsLoaded,
    areManufacturingRecordsLoaded,
  } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [quantity, setQuantity] = useState<number>(0);
  const [date, setDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [materialsUsed, setMaterialsUsed] = useState<MaterialUsage[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [showMaterialDropdown, setShowMaterialDropdown] = useState<number | null>(null);

  useEffect(() => {
    if (!areProductsLoaded) {
      fetchProducts();
    }
    if (!areRawMaterialsLoaded) {
      fetchRawMaterials();
    }
    if (!areManufacturingRecordsLoaded) {
      fetchManufacturingRecords();
    }
  }, [
    fetchProducts,
    fetchRawMaterials,
    fetchManufacturingRecords,
    areProductsLoaded,
    areRawMaterialsLoaded,
    areManufacturingRecordsLoaded,
  ]);

  // Filter products based on search
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const addMaterial = () => {
    setMaterialsUsed([
      ...materialsUsed,
      {
        materialId: '',
        materialName: '',
        quantity: 0
      }
    ]);
  };

  const updateMaterial = (index: number, field: keyof MaterialUsage, value: any) => {
    const newMaterials = [...materialsUsed];
    const material = { ...newMaterials[index] };

    material[field] = value;

    // If updating materialId, also update the name
    if (field === 'materialId') {
      const rawMaterial = rawMaterials.find(m => m.id === value);
      if (rawMaterial) {
        material.materialName = rawMaterial.name;
      }
    }

    newMaterials[index] = material;
    setMaterialsUsed(newMaterials);
  };

  const removeMaterial = (index: number) => {
    setMaterialsUsed(materialsUsed.filter((_, i) => i !== index));
  };

  const validateMaterials = () => {
    if (materialsUsed.length === 0) {
      return { valid: false, message: 'Please add at least one material' };
    }

    for (const material of materialsUsed) {
      if (!material.materialId || !material.quantity) {
        return { valid: false, message: 'Please fill in all material details' };
      }

      const rawMaterial = rawMaterials.find(m => m.id === material.materialId);
      if (!rawMaterial) {
        return { valid: false, message: `Material ${material.materialName} not found` };
      }
      if (rawMaterial.stock < material.quantity) {
        return {
          valid: false,
          message: `Insufficient stock for ${material.materialName}. Available: ${rawMaterial.stock}`
        };
      }
    }
    return { valid: true, message: '' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) {
      setErrorMessage('Please select a product');
      return;
    }

    const validation = validateMaterials();
    if (!validation.valid) {
      setErrorMessage(validation.message);
      return;
    }

    try {
      const newRecord: Omit<ManufacturingRecord, 'id'> = {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        quantity,
        date,
        materialsUsed,
      };

      await addManufacturingRecord(newRecord);
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to create manufacturing record');
    }
  };

  const resetForm = () => {
    setProductSearch('');
    setSelectedProduct(null);
    setQuantity(0);
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setMaterialsUsed([]);
    setErrorMessage('');
    setShowMaterialDropdown(null);
  };

  const formatMaterialsList = (materials: MaterialUsage[] = []) => {
    return materials.map(material => `${material.materialName}(${material.quantity})`).join(', ');
  };

  const handleMaterialSelect = (index: number, material: RawMaterial) => {
    updateMaterial(index, 'materialId', material.id);
    setShowMaterialDropdown(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manufacturing</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Manufacturing Record
        </button>
      </div>

      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <span className="block sm:inline">{errorMessage}</span>
          <span
            className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer"
            onClick={() => setErrorMessage('')}
          >
            ×
          </span>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Materials Used
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {manufacturingRecords.map((record) => (
              <tr key={record.id}>
                <td className="px-6 py-4 whitespace-nowrap">{record.date}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {record.productName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{record.quantity}</td>
                <td className="px-6 py-4">{formatMaterialsList(record.materialsUsed)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title="Add Manufacturing Record"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Product
            </label>
            <div className="relative">
              <input
                type="text"
                value={productSearch}
                onChange={(e) => {
                  setProductSearch(e.target.value);
                  setShowProductDropdown(true);
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Search for a product..."
                required
              />
              {showProductDropdown && productSearch && (
                <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setSelectedProduct(product);
                        setProductSearch(product.name);
                        setShowProductDropdown(false);
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
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Quantity
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Raw Materials Used
              </label>
              <button
                type="button"
                onClick={addMaterial}
                className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700 flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Material
              </button>
            </div>
            
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Material</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Quantity</th>
                  <th className="px-4 py-2 text-xs font-medium text-gray-500"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {materialsUsed.map((material, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2">
                      <div className="relative">
                        <input
                          type="text"
                          value={material.materialName}
                          onChange={(e) => {
                            updateMaterial(index, 'materialName', e.target.value);
                            setShowMaterialDropdown(index);
                          }}
                          onFocus={() => setShowMaterialDropdown(index)}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Type material name..."
                        />
                        {showMaterialDropdown === index && (
                          <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg max-h-40 overflow-auto">
                            {rawMaterials
                              .filter(m => 
                                m.name.toLowerCase().includes(material.materialName.toLowerCase())
                              )
                              .map((m) => (
                                <div
                                  key={m.id}
                                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                  onClick={() => handleMaterialSelect(index, m)}
                                >
                                  <div className="font-medium">{m.name}</div>
                                  <div className="text-sm text-gray-600">
                                    Stock: {m.stock}
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        value={material.quantity}
                        onChange={(e) =>
                          updateMaterial(index, 'quantity', parseInt(e.target.value))
                        }
                        className="w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <button
                        type="button"
                        onClick={() => removeMaterial(index)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
              Add Record
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}