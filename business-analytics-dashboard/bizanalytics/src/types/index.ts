import React from 'react';

export interface Customer {
  id: string;
  name: string;
  email: string;
  region: string;
  segment: 'Enterprise' | 'SMB' | 'Startup' | 'Individual';
  totalSpent: number;
  orders: number;
  joinedDate: string;
  status: 'Active' | 'Inactive' | 'Churned';
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  product: string;
  category: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  status: 'Completed' | 'Pending' | 'Cancelled' | 'Refunded';
  region: string;
  date: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  sold: number;
  revenue: number;
  trend: 'up' | 'down' | 'stable';
}

export interface RevenueRecord {
  month: string;
  year: number;
  revenue: number;
  expenses: number;
  profit: number;
  region: string;
}

export interface Report {
  id: string;
  name: string;
  type: 'Revenue' | 'Customer' | 'Operations' | 'Marketing' | 'Inventory';
  createdDate: string;
  updatedDate: string;
  status: 'Published' | 'Draft' | 'Archived' | 'Processing';
  createdBy: string;
  size: string;
  description: string;
}

export interface Activity {
  id: string;
  type: 'order' | 'customer' | 'report' | 'alert' | 'system';
  message: string;
  timestamp: string;
  user: string;
  severity: 'info' | 'warning' | 'success' | 'error';
}

export interface KPI {
  label: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  icon: string;
  color: string;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface CategoryData {
  category: string;
  orders: number;
  revenue: number;
}

export interface RegionData {
  region: string;
  customers: number;
  revenue: number;
  orders: number;
}

export interface DateRange {
  from: string;
  to: string;
}

export interface FilterState {
  dateRange: DateRange;
  category: string;
  region: string;
  status: string;
  search: string;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export interface SortState<T> {
  key: keyof T | null;
  direction: 'asc' | 'desc';
}

export interface ColumnDef<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  width?: string;
}

export interface AppState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  filters: FilterState;
  notifications: Activity[];
}

export type AppAction =
  | { type: 'TOGGLE_THEME' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR'; payload: boolean }
  | { type: 'SET_FILTER'; payload: Partial<FilterState> }
  | { type: 'RESET_FILTERS' }
  | { type: 'ADD_NOTIFICATION'; payload: Activity }
  | { type: 'CLEAR_NOTIFICATIONS' };

export interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}
