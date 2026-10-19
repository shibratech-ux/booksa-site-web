// Builds the Photo tour cards from the listing's photo labels and its room counts, and resolves each
// room's illustration from src/assets/images/phototour. Pure apart from the asset URL map.

const illustrationModules = import.meta.glob<string>('/src/assets/images/phototour/*.png', {
  eager: true,
  import: 'default',
  query: '?url'
});

/** Room choices share the same asset catalog as the photo-tour cards. */
export const photoTourRoomDestinations = Object.entries(illustrationModules)
  .map(([path, imageUrl]) => {
    const name = decodeURIComponent(path.split('/').pop() ?? '').replace(/\.png$/i, '');
    return { label: name === 'Childrens playroom' ? "Children's playroom" : name, imageUrl };
  })
  .filter(({ label }) => label && !label.startsWith('Screenshot_'))
  .sort((first, second) => first.label.localeCompare(second.label));

// "Full bathroom" → URL, keyed by lower-case file name without extension.
const ILLUSTRATIONS = new Map(
  Object.entries(illustrationModules).map(([path, url]) => [
    decodeURIComponent(path.split('/').pop() ?? '').replace(/\.png$/i, '').toLowerCase(),
    url
  ])
);

// Labels that don't match a file name directly.
const ILLUSTRATION_ALIASES: Record<string, string> = {
  'sleeping area': 'bedroom',
  'main space': 'living room',
  'entire place': 'living room',
  'private room': 'bedroom',
  'shared room': 'bedroom',
  kitchen: 'full kitchen',
  bathroom: 'full bathroom',
  "children's playroom": 'childrens playroom',
  'dining room': 'dining area',
  backyard: 'garden'
};

export const UNASSIGNED_LABEL = 'Unassigned';

/** Illustration for a room label: drops "Shared"/"Private" and trailing numbers, then matches a file. */
export function photoTourIllustration(label: string): string | undefined {
  const base = label
    .trim()
    .toLowerCase()
    .replace(/^(shared|private|dedicated)\s+/, '')
    .replace(/\s+\d+$/, '');
  return ILLUSTRATIONS.get(base) ?? ILLUSTRATIONS.get(ILLUSTRATION_ALIASES[base] ?? '');
}

export type PhotoTourRoom = {
  id: string;
  label: string;
  photoUrls: string[];
  illustrationUrl?: string;
  isAdditional?: boolean;
};

type BathroomTypes = { privateAttachedBathrooms?: unknown; dedicatedBathrooms?: unknown; sharedBathrooms?: unknown };

const count = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) && value > 0 ? Math.floor(value) : 0);

/** Rooms the listing should show, from its bedroom and bathroom counts (Airbnb-style names). */
export function expectedPhotoTourRooms({ bedrooms, bathrooms, bathroomTypes }: {
  bedrooms: number;
  bathrooms: number;
  bathroomTypes?: BathroomTypes;
}): string[] {
  const bedroomLabels = bedrooms <= 1
    ? (bedrooms === 1 ? ['Bedroom'] : [])
    : Array.from({ length: bedrooms }, (_, index) => `Bedroom ${index + 1}`);

  const ownBathrooms = count(bathroomTypes?.privateAttachedBathrooms) + count(bathroomTypes?.dedicatedBathrooms);
  const sharedBathrooms = count(bathroomTypes?.sharedBathrooms);
  const fullKinds = ownBathrooms + sharedBathrooms > 0
    ? [...Array<string>(ownBathrooms).fill('Full bathroom'), ...Array<string>(sharedBathrooms).fill('Shared full bathroom')]
    : Array<string>(Math.floor(bathrooms)).fill('Full bathroom');
  // Numbering runs across private and shared bathrooms ("Full bathroom 1", "Shared full bathroom 2").
  const bathroomLabels = fullKinds.length > 1 ? fullKinds.map((kind, index) => `${kind} ${index + 1}`) : fullKinds;
  if (bathrooms % 1 >= 0.5) bathroomLabels.push('Half bathroom');

  return [...bedroomLabels, ...bathroomLabels];
}

/**
 * Cards in display order: labelled rooms in first-photo order, then expected rooms with no photos yet,
 * then "Additional photos" for unassigned photos.
 */
export function buildPhotoTourRooms(photoUrls: string[], photoLabels: string[], expectedRooms: string[]): PhotoTourRoom[] {
  const byLabel = new Map<string, PhotoTourRoom>();
  const unassigned: string[] = [];

  photoUrls.forEach((url, index) => {
    const label = photoLabels[index]?.trim();
    if (!label || label === UNASSIGNED_LABEL) {
      unassigned.push(url);
      return;
    }
    const key = label.toLowerCase();
    const room = byLabel.get(key) ?? { id: `room-${key}`, label, photoUrls: [], illustrationUrl: photoTourIllustration(label) };
    room.photoUrls.push(url);
    byLabel.set(key, room);
  });

  for (const label of expectedRooms) {
    const key = label.toLowerCase();
    if (!byLabel.has(key)) byLabel.set(key, { id: `room-${key}`, label, photoUrls: [], illustrationUrl: photoTourIllustration(label) });
  }

  const rooms = [...byLabel.values()];
  if (unassigned.length > 0) rooms.push({ id: 'additional', label: '', photoUrls: unassigned, isAdditional: true });
  return rooms;
}
