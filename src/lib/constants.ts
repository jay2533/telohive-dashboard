export const CATEGORIES = [
  'coworking',
  'private-office',
  'meeting-room',
  'event-space',
  'studio',
  'workshop',
  'podcast-studio',
  'photo-studio',
] as const;

export type Category = (typeof CATEGORIES)[number];

export const AMENITIES = [
  'wifi',
  'parking',
  'coffee',
  'kitchen',
  'air-conditioning',
  'projector',
  'whiteboard',
  'phone-booth',
  'standing-desk',
  'locker',
  'shower',
  'bike-storage',
  'reception',
  'printing',
  '24-7-access',
] as const;

export type Amenity = (typeof AMENITIES)[number];
