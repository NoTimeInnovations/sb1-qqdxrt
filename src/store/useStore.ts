import { create } from 'zustand';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, Customer, ManufacturingRecord, Sale, SystemConfig, SaleItem, RawMaterial, Supplier, Purchase, PurchaseItem, Expense } from '../types';

interface Store {
  // Data
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  manufacturingRecords: ManufacturingRecord[];
  sales: Sale[];
  purchases: Purchase[];
  expenses: Expense[];
  systemConfig: SystemConfig | null;
  rawMaterials: RawMaterial[];

  // Loading states
  isProductsLoaded: boolean;
  isCustomersLoaded: boolean;
  isSuppliersLoaded: boolean;
  isManufacturingRecordsLoaded: boolean;
  isSalesLoaded: boolean;
  isPurchasesLoaded: boolean;
  isExpensesLoaded: boolean;
  isSystemConfigLoaded: boolean;
  isRawMaterialsLoaded: boolean;
  
  // Actions
  fetchProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  
  fetchCustomers: () => Promise<void>;
  addCustomer: (customer: Omit<Customer, 'id'>) => Promise<void>;

  fetchSuppliers: () => Promise<void>;
  addSupplier: (supplier: Omit<Supplier, 'id'>) => Promise<void>;
  
  fetchManufacturingRecords: () => Promise<void>;
  addManufacturingRecord: (record: Omit<ManufacturingRecord, 'id'>) => Promise<void>;
  
  fetchSales: () => Promise<void>;
  addSale: (sale: Omit<Sale, 'invoiceNumber' | 'id'>) => Promise<Sale>;
  validateStock: (items: SaleItem[]) => { valid: boolean; message: string };

  fetchPurchases: () => Promise<void>;
  addPurchase: (purchase: Omit<Purchase, 'id'>) => Promise<Purchase>;

  fetchExpenses: () => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  
  fetchSystemConfig: () => Promise<void>;
  getNextInvoiceNumber: () => Promise<string>;

  fetchRawMaterials: () => Promise<void>;
  addRawMaterial: (material: Omit<RawMaterial, 'id'>) => Promise<void>;
  updateRawMaterial: (id: string, material: Partial<RawMaterial>) => Promise<void>;
  deleteRawMaterial: (id: string) => Promise<void>;
}

export const useStore = create<Store>((set, get) => ({
  // Initial state
  products: [],
  customers: [],
  suppliers: [],
  manufacturingRecords: [],
  sales: [],
  purchases: [],
  expenses: [],
  systemConfig: null,
  rawMaterials: [],

  // Initial loading states
  isProductsLoaded: false,
  isCustomersLoaded: false,
  isSuppliersLoaded: false,
  isManufacturingRecordsLoaded: false,
  isSalesLoaded: false,
  isPurchasesLoaded: false,
  isExpensesLoaded: false,
  isSystemConfigLoaded: false,
  isRawMaterialsLoaded: false,

  // Actions
  fetchProducts: async () => {
    const querySnapshot = await getDocs(collection(db, 'products'));
    const products = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];
    set({ products, isProductsLoaded: true });
  },

  addProduct: async (product) => {
    const docRef = await addDoc(collection(db, 'products'), product);
    const newProduct = { id: docRef.id, ...product };
    set(state => ({ products: [...state.products, newProduct] }));
  },

  updateProduct: async (id, product) => {
    await updateDoc(doc(db, 'products', id), product);
    set(state => ({
      products: state.products.map(p => 
        p.id === id ? { ...p, ...product } : p
      )
    }));
  },

  deleteProduct: async (id) => {
    await deleteDoc(doc(db, 'products', id));
    set(state => ({
      products: state.products.filter(p => p.id !== id)
    }));
  },

  fetchCustomers: async () => {
    const querySnapshot = await getDocs(collection(db, 'customers'));
    const customers = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Customer[];
    set({ customers, isCustomersLoaded: true });
  },

  addCustomer: async (customer) => {
    const docRef = await addDoc(collection(db, 'customers'), customer);
    const newCustomer = { id: docRef.id, ...customer };
    set(state => ({ customers: [...state.customers, newCustomer] }));
  },

  fetchSuppliers: async () => {
    const querySnapshot = await getDocs(collection(db, 'suppliers'));
    const suppliers = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Supplier[];
    set({ suppliers, isSuppliersLoaded: true });
  },

  addSupplier: async (supplier) => {
    const docRef = await addDoc(collection(db, 'suppliers'), supplier);
    const newSupplier = { id: docRef.id, ...supplier };
    set(state => ({ suppliers: [...state.suppliers, newSupplier] }));
  },

  fetchManufacturingRecords: async () => {
    const querySnapshot = await getDocs(collection(db, 'manufacturing'));
    const records = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ManufacturingRecord[];
    set({ manufacturingRecords: records, isManufacturingRecordsLoaded: true });
  },

  addManufacturingRecord: async (record) => {
    // Validate raw materials stock
    for (const material of record.materialsUsed) {
      const rawMaterial = get().rawMaterials.find(m => m.id === material.materialId);
      if (!rawMaterial) {
        throw new Error(`Material ${material.materialName} not found`);
      }
      if (rawMaterial.stock < material.quantity) {
        throw new Error(`Insufficient stock for ${material.materialName}`);
      }
    }

    const docRef = await addDoc(collection(db, 'manufacturing'), record);
    const newRecord = { id: docRef.id, ...record };
    
    // Update product stock
    const product = get().products.find(p => p.id === record.productId);
    if (product) {
      const newStockQuantity = product.stockQuantity + record.quantity;
      await get().updateProduct(record.productId, { stockQuantity: newStockQuantity });
    }

    // Update raw materials stock
    for (const material of record.materialsUsed) {
      const rawMaterial = get().rawMaterials.find(m => m.id === material.materialId);
      if (rawMaterial) {
        const newStock = rawMaterial.stock - material.quantity;
        await get().updateRawMaterial(material.materialId, { stock: newStock });
      }
    }
    
    set(state => ({ manufacturingRecords: [...state.manufacturingRecords, newRecord] }));
  },

  fetchSystemConfig: async () => {
    const configDoc = await getDoc(doc(db, 'system_config', 'invoice'));
    if (!configDoc.exists()) {
      const initialConfig: SystemConfig = {
        id: 'invoice',
        lastInvoiceNumber: 0
      };
      await setDoc(doc(db, 'system_config', 'invoice'), initialConfig);
      set({ systemConfig: initialConfig, isSystemConfigLoaded: true });
    } else {
      set({ 
        systemConfig: { id: configDoc.id, ...configDoc.data() } as SystemConfig,
        isSystemConfigLoaded: true
      });
    }
  },

  getNextInvoiceNumber: async () => {
    const configDoc = await getDoc(doc(db, 'system_config', 'invoice'));
    const currentNumber = configDoc.exists() ? configDoc.data().lastInvoiceNumber : 0;
    const nextNumber = currentNumber + 1;
    
    await updateDoc(doc(db, 'system_config', 'invoice'), {
      lastInvoiceNumber: nextNumber
    });
    
    return nextNumber.toString().padStart(5, '0');
  },

  validateStock: (items) => {
    const products = get().products;
    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        return { valid: false, message: `Product ${item.productName} not found` };
      }
      if (product.stockQuantity < item.quantity) {
        return { 
          valid: false, 
          message: `Insufficient stock for ${item.productName}. Available: ${product.stockQuantity}`
        };
      }
    }
    return { valid: true, message: '' };
  },

  fetchSales: async () => {
    const querySnapshot = await getDocs(collection(db, 'sales'));
    const sales = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Sale[];
    set({ sales, isSalesLoaded: true });
  },

  addSale: async (sale) => {
    const stockValidation = get().validateStock(sale.items);
    if (!stockValidation.valid) {
      throw new Error(stockValidation.message);
    }

    const invoiceNumber = await get().getNextInvoiceNumber();
    const saleWithInvoice = { ...sale, invoiceNumber };

    const docRef = await addDoc(collection(db, 'sales'), saleWithInvoice);
    const newSale = { id: docRef.id, ...saleWithInvoice };
    
    // Update stock quantities
    for (const item of sale.items) {
      const product = get().products.find(p => p.id === item.productId);
      if (product) {
        const newStockQuantity = product.stockQuantity - item.quantity;
        await get().updateProduct(item.productId, { stockQuantity: newStockQuantity });
      }
    }
    
    set(state => ({ sales: [...state.sales, newSale] }));
    return newSale;
  },

  fetchPurchases: async () => {
    const querySnapshot = await getDocs(collection(db, 'purchases'));
    const purchases = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Purchase[];
    set({ purchases, isPurchasesLoaded: true });
  },

  addPurchase: async (purchase) => {
    const docRef = await addDoc(collection(db, 'purchases'), purchase);
    const newPurchase = { id: docRef.id, ...purchase };
    
    // Update raw material quantities and prices
    for (const item of purchase.items) {
      const material = get().rawMaterials.find(m => m.id === item.materialId);
      if (material) {
        const newStock = material.stock + item.quantity;
        // Update price only if it's different
        if (material.price !== item.price) {
          await get().updateRawMaterial(item.materialId, { 
            stock: newStock,
            price: item.price 
          });
        } else {
          await get().updateRawMaterial(item.materialId, { stock: newStock });
        }
      }
    }
    
    set(state => ({ purchases: [...state.purchases, newPurchase] }));
    return newPurchase;
  },

  fetchExpenses: async () => {
    const querySnapshot = await getDocs(collection(db, 'expenses'));
    const expenses = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Expense[];
    set({ expenses, isExpensesLoaded: true });
  },

  addExpense: async (expense) => {
    const docRef = await addDoc(collection(db, 'expenses'), expense);
    const newExpense = { id: docRef.id, ...expense };
    set(state => ({ expenses: [...state.expenses, newExpense] }));
  },

  fetchRawMaterials: async () => {
    const querySnapshot = await getDocs(collection(db, 'raw_materials'));
    const materials = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as RawMaterial[];
    set({ rawMaterials: materials, isRawMaterialsLoaded: true });
  },

  addRawMaterial: async (material) => {
    const docRef = await addDoc(collection(db, 'raw_materials'), material);
    const newMaterial = { id: docRef.id, ...material };
    set(state => ({ rawMaterials: [...state.rawMaterials, newMaterial] }));
  },

  updateRawMaterial: async (id, material) => {
    await updateDoc(doc(db, 'raw_materials', id), material);
    set(state => ({
      rawMaterials: state.rawMaterials.map(m => 
        m.id === id ? { ...m, ...material } : m
      )
    }));
  },

  deleteRawMaterial: async (id) => {
    await deleteDoc(doc(db, 'raw_materials', id));
    set(state => ({
      rawMaterials: state.rawMaterials.filter(m => m.id !== id)
    }));
  },
}));