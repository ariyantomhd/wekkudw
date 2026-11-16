// src/types/dashboard.ts
export interface DashboardUser {
  id: string;
  username: string;
  email: string;
  avatar_url?: string | null;
  role: string;
  status: string;
  created_at: string;
  updated_at?: string;
}

export interface DashboardStats {
  total_spent: number;
  active_orders: number;
  downloadable_items: number;
  wishlist_count: number;
}

export interface RecentOrder {
  id: string;
  order_number: string;
  product_name: string;
  total_amount: number;
  status: 'COMPLETED' | 'PENDING' | 'CANCELLED';
  created_at: string;
}

export interface UserDashboardData {
  user: DashboardUser | null;
  stats: DashboardStats;
  recent_orders: RecentOrder[];
}