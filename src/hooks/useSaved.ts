'use client';

import { useCallback, useEffect, useState } from 'react';

// ── Wire format (matches db.json) ─────────────────────────────────────────────

interface RawSavedItem {
  id: number;
  spaceId: number;
  savedAt: string;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

interface UseSavedResult {
  savedItems: RawSavedItem[];
  loading: boolean;
  error: string | null;
  isSaved: (spaceId: number) => boolean;
  toggleSave: (spaceId: number) => Promise<void>;
}

// Local mock API served by json-server (`npm run server`). Override via NEXT_PUBLIC_API_URL.
const API_BASE = `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/saved`;

export function useSaved(): UseSavedResult {
  const [savedItems, setSavedItems] = useState<RawSavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initial load
  useEffect(() => {
    fetch(API_BASE)
      .then((res) => {
        if (!res.ok) throw new Error(`Server responded with ${res.status}`);
        return res.json() as Promise<RawSavedItem[]>;
      })
      .then(setSavedItems)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'Failed to load saved items'),
      )
      .finally(() => setLoading(false));
  }, []);

  const isSaved = useCallback(
    (spaceId: number): boolean =>
      savedItems.some((item) => item.spaceId === spaceId),
    [savedItems],
  );

  const toggleSave = useCallback(
    async (spaceId: number): Promise<void> => {
      const existing = savedItems.find((item) => item.spaceId === spaceId);

      if (existing) {
        // ── Optimistic unsave ─────────────────────────────────────────────────
        setSavedItems((prev) => prev.filter((item) => item.id !== existing.id));

        try {
          const res = await fetch(`${API_BASE}/${existing.id}`, {
            method: 'DELETE',
          });
          if (!res.ok) throw new Error(`Server responded with ${res.status}`);
        } catch (err) {
          // Revert optimistic removal
          setSavedItems((prev) => [...prev, existing]);
          setError(
            err instanceof Error ? err.message : 'Failed to remove saved item',
          );
        }
      } else {
        // ── Optimistic save ───────────────────────────────────────────────────
        // Use a temporary negative id so isSaved() returns true immediately
        const optimistic: RawSavedItem = {
          id: -Date.now(),
          spaceId,
          savedAt: new Date().toISOString(),
        };
        setSavedItems((prev) => [...prev, optimistic]);

        try {
          const res = await fetch(API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ spaceId }),
          });
          if (!res.ok) throw new Error(`Server responded with ${res.status}`);

          const created = (await res.json()) as RawSavedItem;
          // Replace the optimistic placeholder with the real record
          setSavedItems((prev) =>
            prev.map((item) => (item.id === optimistic.id ? created : item)),
          );
        } catch (err) {
          // Revert optimistic add
          setSavedItems((prev) =>
            prev.filter((item) => item.id !== optimistic.id),
          );
          setError(err instanceof Error ? err.message : 'Failed to save item');
        }
      }
    },
    [savedItems],
  );

  return { savedItems, loading, error, isSaved, toggleSave };
}
