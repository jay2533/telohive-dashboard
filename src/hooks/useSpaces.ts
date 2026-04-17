'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Space } from '@/types';

// ── Wire format (matches db.json) ─────────────────────────────────────────────

/**
 * Shape returned by the json-server `/spaces` endpoint.
 * Field names differ from the domain `Space` type — see `toSpace` below.
 */
interface RawSpace {
  id: number;
  name: string;
  description: string;
  city: string;
  location: string;
  category: string;
  price: number;
  capacity: number;
  rating: number;
  reviewCount: number;
  amenities: string[];
  imageUrl: string;
  createdAt: string;
}

function toSpace(raw: RawSpace): Space {
  return {
    id: String(raw.id),
    name: raw.name,
    description: raw.description,
    category: raw.category,
    city: raw.city,
    address: raw.location,
    pricePerHour: raw.price,
    capacity: raw.capacity,
    amenities: raw.amenities,
    rating: raw.rating,
    reviewCount: raw.reviewCount,
    images: [raw.imageUrl],
    hostId: '',          // not present in db.json
    isAvailable: true,  // not present in db.json — assume true
    createdAt: raw.createdAt,
    updatedAt: raw.createdAt,
  };
}

// ── Hook ──────────────────────────────────────────────────────────────────────

interface UseSpacesResult {
  spaces: Space[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Local mock API served by json-server (`npm run server`). Override via NEXT_PUBLIC_API_URL.
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const API_URL = `${API_BASE}/spaces`;

export function useSpaces(): UseSpacesResult {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSpaces = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);

      const raw = (await res.json()) as RawSpace[];
      setSpaces(raw.map(toSpace));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch spaces',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSpaces();
  }, [fetchSpaces]);

  return { spaces, loading, error, refetch: fetchSpaces };
}
