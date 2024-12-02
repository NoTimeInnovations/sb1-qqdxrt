export interface RawMaterial {
  id: string;
  name: string;
  stock: number;
  threshold: number;
  price: number;
}

export interface MaterialUsage {
  materialId: string;
  materialName: string;
  quantity: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  address: string;
}

export interface ManufacturingRecord {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  date: string;
  materialsUsed: MaterialUsage[];
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface PurchaseItem {
  materialId: string;
  materialName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Purchase {
  id: string;
  invoiceNumber: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseItem[];
  subtotal: number;
  date: string;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  date: string;
  vehicleNumber?: string;
}

export interface Expense {
  id: string;
  invoiceNumber?: string;
  date: string;
  name: string;
  amount: number;
}

export interface SystemConfig {
  id: string;
  lastInvoiceNumber: number;
}

export interface LedgerEntry {
  date: string;
  description: string;
  type: 'OPENING' | 'SALE' | 'EXPENSE' | 'PURCHASE';
  credit: number;
  debit: number;
  balance: number;
  reference?: string;
}