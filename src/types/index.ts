// =============================================
// Inventory Manager — TypeScript Type Definitions
// Derived from Django DRF backend serializers
// =============================================

// --- Core Module ---

export interface Tenant {
  id: string;
  name: string;
  default_tax_rate: string;
  created_at: string;
  updated_at: string;
}

export interface PublicTenant {
  name: string;
}

export interface Office {
  id: string;
  tenant: string;
  name: string;
  location: string | null;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: number;
  name: string;
  description: string | null;
}

export interface Employee {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: Role | null;
  role_id?: number;
  is_active: boolean;
  password?: string;
}

// --- Catalog Module ---

export interface Category {
  id: number;
  tenant: string;
  name: string;
  slug: string;
  description: string | null;
  parent: number | null;
}

export interface Brand {
  id: number;
  tenant: string;
  name: string;
  slug: string;
  website: string | null;
}

export type ProductType = 'STANDARD' | 'SERIALIZED' | 'LICENSE' | 'SERVICE';

export interface Product {
  id: number;
  tenant: string;
  name: string;
  sku: string;
  barcode: string | null;
  category: number | null;
  category_name: string | null;
  brand: number | null;
  brand_name: string | null;
  description: string | null;
  product_type: ProductType;
  base_price: string;
  cost_price: string | null;
  is_taxable: boolean;
  is_active: boolean;
  image: string | null;
  created_at: string;
  updated_at: string;
}

// --- Inventory Module ---

export interface StockItem {
  id: number;
  tenant: string;
  office: string;
  office_name: string;
  product: number;
  product_name: string;
  quantity: string;
}

export type MovementType = 'IN' | 'OUT' | 'ADJUSTMENT';

export interface StockMovement {
  id: number;
  tenant: string;
  office: string;
  office_name: string;
  product: number;
  product_name: string;
  movement_type: MovementType;
  quantity: string;
  reference: string | null;
  notes: string | null;
  date: string;
}

export interface StockAlert {
  id: number;
  tenant: string;
  product: number;
  product_name: string;
  office: string;
  office_name: string;
  minimum_quantity: string;
}

// --- API Response Types ---

export interface ApiError {
  detail?: string;
  [key: string]: unknown;
}
