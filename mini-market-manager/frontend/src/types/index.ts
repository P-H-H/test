// User types
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'owner' | 'employee';
  assignedStore?: Store;
  phone?: string;
  address?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Store types
export interface Store {
  _id: string;
  name: string;
  code: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  phone: string;
  email?: string;
  manager?: User;
  employees: User[];
  operatingHours: {
    [key: string]: {
      open: string;
      close: string;
      closed: boolean;
    };
  };
  isActive: boolean;
  settings: {
    currency: string;
    taxRate: number;
    lowStockThreshold: number;
  };
  createdBy: User;
  createdAt: Date;
  updatedAt: Date;
}

// Product types
export interface Product {
  _id: string;
  name: string;
  description?: string;
  barcode: string;
  sku: string;
  category: string;
  brand?: string;
  supplier: {
    name: string;
    contact?: string;
    email?: string;
  };
  pricing: {
    costPrice: number;
    sellingPrice: number;
    mrp?: number;
  };
  inventory: ProductInventory[];
  unit: string;
  weight?: {
    value: number;
    unit: string;
  };
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  expiryDate?: Date;
  manufacturingDate?: Date;
  batchNumber?: string;
  images: {
    url: string;
    alt: string;
  }[];
  tags: string[];
  isActive: boolean;
  isPerishable: boolean;
  createdBy: User;
  lastModifiedBy?: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductInventory {
  store: Store;
  quantity: number;
  minStockLevel: number;
  maxStockLevel: number;
  lastRestocked: Date;
}

// Sale types
export interface Sale {
  _id: string;
  saleNumber: string;
  store: Store;
  employee: User;
  items: SaleItem[];
  subtotal: number;
  totalDiscount: number;
  taxAmount: number;
  taxRate: number;
  totalAmount: number;
  paymentMethod: 'cash' | 'card' | 'digital_wallet' | 'bank_transfer' | 'other';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  customer?: {
    name?: string;
    phone?: string;
    email?: string;
  };
  notes?: string;
  receiptPrinted: boolean;
  refunded: boolean;
  refundAmount: number;
  refundReason?: string;
  refundDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SaleItem {
  product: Product;
  productName: string;
  barcode: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  total?: number;
  page?: number;
  pages?: number;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: any[];
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: 'owner' | 'employee';
  assignedStore?: string;
  phone?: string;
  address?: string;
}

// Analytics types
export interface SalesAnalytics {
  summary: {
    totalSales: number;
    totalRevenue: number;
    totalTax: number;
    averageOrderValue: number;
    totalItems: number;
  };
  paymentMethods: {
    _id: string;
    count: number;
    total: number;
  }[];
  topProducts: {
    _id: string;
    productName: string;
    totalQuantity: number;
    totalRevenue: number;
  }[];
  hourlySales: {
    _id: number;
    sales: number;
    revenue: number;
  }[];
}

// Form types
export interface ProductFormData {
  name: string;
  description?: string;
  barcode: string;
  sku: string;
  category: string;
  brand?: string;
  supplier: {
    name: string;
    contact?: string;
    email?: string;
  };
  pricing: {
    costPrice: number;
    sellingPrice: number;
    mrp?: number;
  };
  unit: string;
  weight?: {
    value: number;
    unit: string;
  };
  expiryDate?: string;
  manufacturingDate?: string;
  batchNumber?: string;
  tags?: string[];
  isPerishable: boolean;
}

export interface StoreFormData {
  name: string;
  code: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  phone: string;
  email?: string;
  settings: {
    currency: string;
    taxRate: number;
    lowStockThreshold: number;
  };
}

// Cart types (for POS)
export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  totalDiscount: number;
  taxAmount: number;
  taxRate: number;
  totalAmount: number;
}