'use client';

import { useEffect, useRef, useState } from 'react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { SpaceCard } from './SpaceCard';
import type { Space } from '@/types';

// ── Constants ─────────────────────────────────────────────────────────────────

/** Estimated height (px) of a single card row including the gap beneath it. */
const ESTIMATED_ROW_HEIGHT = 430;
const GAP = 24; // gap-6

// ── Helpers ───────────────────────────────────────────────────────────────────

function getColumnCount(width: number): number {
  if (width < 500) return 1;   // ~viewport < 640 (no sidebar)
  if (width < 720) return 2;   // ~viewport 640–1024 (no sidebar)
  if (width < 960) return 3;   // ~viewport 1024–1280 (sidebar subtracts ~304px)
  return 4;                    // ~viewport > 1280
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface VirtualizedGridProps {
  spaces: Space[];
  isLoading?: boolean;
  skeletonCount?: number;
  isSaved: (spaceId: number) => boolean;
  onToggleSave: (spaceId: number) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function VirtualizedGrid({
  spaces,
  isLoading = false,
  skeletonCount = 8,
  isSaved,
  onToggleSave,
}: VirtualizedGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(1);

  // ── Responsive column count via ResizeObserver ──────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const obs = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      setColumns(getColumnCount(width));
    });

    obs.observe(el);
    setColumns(getColumnCount(el.getBoundingClientRect().width));

    return () => obs.disconnect();
  }, []);

  // ── Loading skeleton (non-virtualised — ephemeral state) ─────────────────
  if (isLoading) {
    return (
      <div
        ref={containerRef}
        style={{
          display: 'grid',
          gap: GAP,
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <SpaceCard key={i} isLoading />
        ))}
      </div>
    );
  }

  // ── Virtualised grid ──────────────────────────────────────────────────────
  const rows = chunk(spaces, columns);

  return (
    <div ref={containerRef}>
      <VirtualRows
        rows={rows}
        columns={columns}
        containerRef={containerRef}
        isSaved={isSaved}
        onToggleSave={onToggleSave}
      />
    </div>
  );
}

// ── Inner component: calls virtualizer unconditionally ────────────────────────

interface VirtualRowsProps {
  rows: Space[][];
  columns: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
  isSaved: (spaceId: number) => boolean;
  onToggleSave: (spaceId: number) => void;
}

function VirtualRows({
  rows,
  columns,
  containerRef,
  isSaved,
  onToggleSave,
}: VirtualRowsProps) {
  const virtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => ESTIMATED_ROW_HEIGHT,
    overscan: 3,
    scrollMargin: containerRef.current?.offsetTop ?? 0,
  });

  const items = virtualizer.getVirtualItems();
  const scrollMargin = virtualizer.options.scrollMargin;

  return (
    <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
      {items.map((virtualRow) => {
        const rowSpaces = rows[virtualRow.index];
        if (!rowSpaces) return null;

        return (
          <div
            key={virtualRow.key}
            data-index={virtualRow.index}
            ref={virtualizer.measureElement}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualRow.start - scrollMargin}px)`,
              paddingBottom: GAP,
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                gap: GAP,
              }}
            >
              {rowSpaces.map((space) => (
                <SpaceCard
                  key={space.id}
                  space={space}
                  isSaved={isSaved(Number(space.id))}
                  onToggleSave={() => onToggleSave(Number(space.id))}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
