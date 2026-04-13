import type { Space, SortOption } from '@/types';

/**
 * Returns a new sorted array of spaces without mutating the input.
 *
 * | SortOption      | Behaviour                              |
 * |-----------------|----------------------------------------|
 * | price_asc       | Cheapest first (pricePerHour ↑)        |
 * | price_desc      | Most expensive first (pricePerHour ↓)  |
 * | rating_desc     | Highest-rated first (rating ↓)         |
 * | capacity_asc    | Smallest capacity first                |
 * | capacity_desc   | Largest capacity first                 |
 * | newest          | Most recently created first            |
 */
export function sortSpaces(spaces: Space[], sortBy: SortOption): Space[] {
  const copy = [...spaces];

  switch (sortBy) {
    case 'price_asc':
      return copy.sort((a, b) => a.pricePerHour - b.pricePerHour);

    case 'price_desc':
      return copy.sort((a, b) => b.pricePerHour - a.pricePerHour);

    case 'rating_desc':
      return copy.sort((a, b) => b.rating - a.rating);

    case 'capacity_asc':
      return copy.sort((a, b) => a.capacity - b.capacity);

    case 'capacity_desc':
      return copy.sort((a, b) => b.capacity - a.capacity);

    case 'newest':
      return copy.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }
}
