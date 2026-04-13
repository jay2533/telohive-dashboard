import type { FilterState, Space } from '@/types';

/**
 * Applies all active filters to `spaces` using AND logic across filter types.
 *
 * - categories / cities: OR within the array ("any of these")
 * - amenities: AND within the array (space must have every listed amenity)
 * - priceRange / capacityRange: inclusive bounds
 * - minRating: space.rating >= minRating
 * - searchQuery: case-insensitive substring match on name, description, or city
 *
 * An empty array inside an active filter is treated as "no restriction" for
 * that field, so callers don't have to guard each field themselves.
 */
export function applyFilters(spaces: Space[], filters: FilterState): Space[] {
  if (filters.kind === 'empty') return spaces;

  const {
    categories,
    cities,
    priceRange,
    capacityRange,
    amenities,
    minRating,
    searchQuery,
  } = filters;

  const query = searchQuery.trim().toLowerCase();

  return spaces.filter((space) => {
    // Category — skip if no categories selected
    if (
      categories.length > 0 &&
      !categories.includes(space.category)
    ) {
      return false;
    }

    // City — skip if no cities selected
    if (cities.length > 0 && !cities.includes(space.city)) {
      return false;
    }

    // Price range (inclusive)
    if (priceRange !== null) {
      const [min, max] = priceRange;
      if (space.pricePerHour < min || space.pricePerHour > max) return false;
    }

    // Capacity range (inclusive)
    if (capacityRange !== null) {
      const [min, max] = capacityRange;
      if (space.capacity < min || space.capacity > max) return false;
    }

    // Amenities — space must have ALL selected amenities
    if (
      amenities.length > 0 &&
      !amenities.every((a) => space.amenities.includes(a))
    ) {
      return false;
    }

    // Minimum rating
    if (minRating !== null && space.rating < minRating) return false;

    // Search query — name, description, or city
    if (
      query.length > 0 &&
      !space.name.toLowerCase().includes(query) &&
      !space.description.toLowerCase().includes(query) &&
      !space.city.toLowerCase().includes(query)
    ) {
      return false;
    }

    return true;
  });
}
