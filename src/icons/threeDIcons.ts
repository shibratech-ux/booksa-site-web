export const THREE_D_ICONS_ORIGIN =
  import.meta.env.VITE_3DICONS_BASE_URL ??
  'https://bvconuycpdvgzbvbkijl.supabase.co/storage/v1/object/public/sizes';

export const threeDIconSlugs = {
  hotel: 'fa6099-travel',
  privateRoom: 'a63030-moon',
  restaurant: '7fb19c-cup',
  artStudio: 'fcbbf1-painting-kit',
  greenery: '2c84d9-leaf',
  outdoor: 'fa6099-travel',
  office: '5f20be-computer',
  sunlight: '801da3-sun',
  photography: '5656e5-camera',
  recreation: '8034f3-sphere',
  gym: '10c35a-gym',
  music: '331e9c-music',
  games: '616eaf-chess',
  verification: 'b91186-shield',
  pastTrips: 'fa6099-travel',
  connectionPerson: 'a14880-boy',
  hostPerson: '2dfe27-girl',
  reservationNotebook: '628100-notebook',
  attentionCalendar: '0ef25b-calender'
} as const;

export type ThreeDIconName = keyof typeof threeDIconSlugs;
export type ThreeDIconAngle = 'dynamic' | 'front' | 'iso';
export type ThreeDIconPalette = 'clay' | 'color' | 'gradient' | 'premium';
export type ThreeDIconSize = 20 | 60 | 100 | 200 | 400 | 500;

type ThreeDIconOptions = {
  angle?: ThreeDIconAngle;
  palette?: ThreeDIconPalette;
  size?: ThreeDIconSize;
};

export function getThreeDIconUrl(
  name: ThreeDIconName,
  { angle = 'dynamic', palette = 'color', size = 100 }: ThreeDIconOptions = {}
) {
  const origin = THREE_D_ICONS_ORIGIN.replace(/\/$/, '');
  return `${origin}/${threeDIconSlugs[name]}/${angle}/${size}/${palette}.webp`;
}
