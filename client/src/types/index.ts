export type Role = "ADMIN" | "USER" | "OWNER";

export interface User {
  id: number;
  name: string;
  email: string;
  address: string;
  role: Role;
  rating?: number | null;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface Store {
  id: number;
  name: string;
  email: string | null;
  address: string;
  rating: number | null;
}

export interface Rating {
  id: number;
  value: number;
  storeId: number;
  userId: number;
}

export interface StoreWithRating extends Store {
  averageRating: number | null;
  myRating: number | null;
}

export interface DashboardStats {
  users: number;
  stores: number;
  ratings: number;
}

export interface StoreOwnerData {
  store: { id: number; name: string };
  averageRating: number | null;
  raters: Array<{
    id: number;
    name: string;
    email: string;
    value: number;
  }>;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface SignupResponse {
  id: number;
}

export interface PasswordChangeResponse {
  success: boolean;
}
