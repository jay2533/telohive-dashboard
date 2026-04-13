// ─── Domain entities ─────────────────────────────────────────────────────────

export type UserRole = 'guest' | 'host' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: UserRole;
  createdAt: string; // ISO 8601
}

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Unix timestamp (seconds)
}

export interface Space {
  id: string;
  name: string;
  description: string;
  category: string;
  city: string;
  address: string;
  pricePerHour: number;
  capacity: number;
  amenities: string[];
  rating: number; // 0–5
  reviewCount: number;
  images: string[];
  hostId: string;
  isAvailable: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  spaceId: string;
  userId: string;
  startTime: string; // ISO 8601
  endTime: string;
  totalPrice: number;
  status: BookingStatus;
  guestCount: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SavedItem {
  id: string;
  userId: string;
  spaceId: string;
  savedAt: string; // ISO 8601
}

// ─── Filter state (discriminated union) ──────────────────────────────────────

export type FilterState =
  | { readonly kind: 'empty' }
  | {
      readonly kind: 'active';
      /** OR logic within the array — empty means "any category" */
      readonly categories: string[];
      /** OR logic within the array — empty means "any city" */
      readonly cities: string[];
      readonly priceRange: [number, number] | null;
      readonly capacityRange: [number, number] | null;
      /** AND logic — space must possess every listed amenity */
      readonly amenities: string[];
      readonly minRating: number | null;
      readonly searchQuery: string;
    };

// ─── Sort ─────────────────────────────────────────────────────────────────────

export type SortOption =
  | 'price_asc'
  | 'price_desc'
  | 'rating_desc'
  | 'capacity_asc'
  | 'capacity_desc'
  | 'newest';
