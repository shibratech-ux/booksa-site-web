import {
  Accessibility,
  AlarmSmoke,
  Armchair,
  Baby,
  BatteryCharging,
  CakeSlice,
  CalendarClock,
  Car,
  ChefHat,
  Clock,
  Coffee,
  ConciergeBell,
  CookingPot,
  CreditCard,
  Dumbbell,
  Flame,
  GlassWater,
  HousePlug,
  Lamp,
  Martini,
  Music,
  Palmtree,
  Refrigerator,
  Salad,
  ShieldCheck,
  Shirt,
  ShowerHead,
  Snowflake,
  Soup,
  SprayCan,
  Store,
  ThermometerSun,
  Tv,
  UtensilsCrossed,
  Vegan,
  WashingMachine,
  Waves,
  Wifi,
  Wind,
  Wine,
  type LucideIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { ListingCategory } from '../listingCategories';

type Amenity = {
  id: string;
  label: string;
  description?: string;
  icon: LucideIcon;
};

type AmenityGroup = {
  id: string;
  title: string;
  amenities: Amenity[];
};

const stayBasics: AmenityGroup = {
  id: 'basics',
  title: 'Basics',
  amenities: [
    { id: 'air-conditioning', label: 'Air conditioning', icon: Snowflake },
    { id: 'dryer', label: 'Dryer', icon: Wind },
    {
      id: 'essentials',
      label: 'Essentials',
      description: 'Towels, bed sheets, soap, and toilet paper',
      icon: SprayCan
    },
    { id: 'heating', label: 'Heating', icon: ThermometerSun },
    { id: 'hot-water', label: 'Hot water', icon: ShowerHead },
    { id: 'kitchen', label: 'Kitchen', icon: CookingPot },
    { id: 'refrigerator', label: 'Refrigerator', icon: Refrigerator },
    { id: 'tv', label: 'TV', icon: Tv },
    { id: 'washer', label: 'Washer', icon: WashingMachine },
    { id: 'wifi', label: 'Wifi', icon: Wifi }
  ]
};

const stayPopular: AmenityGroup = {
  id: 'popular',
  title: 'Popular',
  amenities: [
    { id: 'coffee-maker', label: 'Coffee maker', icon: Coffee },
    {
      id: 'cooking-basics',
      label: 'Cooking basics',
      description: 'Pots and pans, oil, salt and pepper',
      icon: CookingPot
    },
    { id: 'hair-dryer', label: 'Hair dryer', icon: Wind },
    { id: 'hangers', label: 'Hangers', icon: Shirt },
    { id: 'iron', label: 'Iron', icon: Shirt },
    { id: 'shampoo', label: 'Shampoo', icon: SprayCan }
  ]
};

const stayFeatures: AmenityGroup = {
  id: 'features',
  title: 'Features',
  amenities: [
    { id: 'crib', label: 'Crib', icon: Baby },
    { id: 'dedicated-workspace', label: 'Dedicated workspace', icon: Lamp },
    { id: 'ev-charger', label: 'EV charger', icon: BatteryCharging },
    { id: 'free-parking', label: 'Free parking on premises', icon: Car },
    { id: 'gym', label: 'Gym', icon: Dumbbell },
    { id: 'hot-tub', label: 'Hot tub', icon: Waves },
    { id: 'indoor-fireplace', label: 'Indoor fireplace', icon: Flame },
    { id: 'outdoor-furniture', label: 'Outdoor furniture', icon: Armchair },
    { id: 'pool', label: 'Pool', icon: Waves }
  ]
};

const stayLocationAndSafety: AmenityGroup[] = [
  {
    id: 'location',
    title: 'Location',
    amenities: [
      { id: 'beach-access', label: 'Beach access', icon: Palmtree },
      { id: 'waterfront', label: 'Waterfront', icon: Waves }
    ]
  },
  {
    id: 'safety',
    title: 'Safety',
    amenities: [
      { id: 'carbon-monoxide-alarm', label: 'Carbon monoxide alarm', icon: ShieldCheck },
      { id: 'smoke-alarm', label: 'Smoke alarm', icon: AlarmSmoke }
    ]
  }
];

const hotelGroups: AmenityGroup[] = [
  stayBasics,
  stayPopular,
  stayFeatures,
  {
    id: 'hotel-services',
    title: 'Hotel services',
    amenities: [
      { id: 'front-desk', label: '24-hour front desk', icon: ConciergeBell },
      { id: 'breakfast', label: 'Breakfast', icon: Coffee },
      { id: 'room-service', label: 'Room service', icon: HousePlug }
    ]
  },
  ...stayLocationAndSafety
];

const privateRoomGroups: AmenityGroup[] = [stayBasics, stayPopular, stayFeatures, ...stayLocationAndSafety];

const restaurantGroups: AmenityGroup[] = [
  {
    id: 'dining-basics',
    title: 'Dining basics',
    amenities: [
      { id: 'indoor-seating', label: 'Indoor seating', icon: UtensilsCrossed },
      { id: 'outdoor-seating', label: 'Outdoor seating', icon: Armchair },
      { id: 'air-conditioning', label: 'Air conditioning', icon: Snowflake },
      { id: 'wifi', label: 'Wifi', icon: Wifi },
      { id: 'bar', label: 'Bar', icon: Martini },
      { id: 'coffee', label: 'Coffee', icon: Coffee }
    ]
  },
  {
    id: 'food-and-drink',
    title: 'Food & drink',
    amenities: [
      { id: 'breakfast', label: 'Breakfast', icon: Coffee },
      { id: 'lunch', label: 'Lunch', icon: Salad },
      { id: 'dinner', label: 'Dinner', icon: Soup },
      { id: 'desserts', label: 'Desserts', icon: CakeSlice },
      { id: 'vegetarian-options', label: 'Vegetarian options', icon: Vegan },
      { id: 'alcohol', label: 'Wine and alcohol', icon: Wine }
    ]
  },
  {
    id: 'service-options',
    title: 'Service options',
    amenities: [
      { id: 'reservations', label: 'Reservations', icon: CalendarClock },
      { id: 'takeaway', label: 'Takeaway', icon: Store },
      { id: 'table-service', label: 'Table service', icon: GlassWater },
      { id: 'private-dining', label: 'Private dining', icon: ChefHat },
      { id: 'late-night', label: 'Late-night service', icon: Clock },
      { id: 'live-music', label: 'Live music', icon: Music }
    ]
  },
  {
    id: 'access-and-payment',
    title: 'Access & payment',
    amenities: [
      { id: 'accessible', label: 'Wheelchair accessible', icon: Accessibility },
      { id: 'parking', label: 'Parking', icon: Car },
      { id: 'card-payment', label: 'Card payments', icon: CreditCard }
    ]
  }
];

const getAmenityGroups = (category: ListingCategory) => {
  if (category.id === 'restaurant') return restaurantGroups;
  if (category.id === 'hotel') return hotelGroups;
  return privateRoomGroups;
};

export function AmenitiesStep({
  category,
  selectedAmenities,
  onToggle
}: {
  category: ListingCategory;
  selectedAmenities: string[];
  onToggle: (amenityId: string) => void;
}) {
  const groups = getAmenityGroups(category);
  const description =
    category.id === 'restaurant'
      ? 'Choose the amenities and service options guests can expect. You can add more after you publish your listing.'
      : 'You can add more amenities after you publish your listing.';

  return (
    <motion.section
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="min-h-0 flex-1 overflow-y-auto px-5 pb-8 pt-5 sm:px-10 sm:pb-12"
      aria-labelledby="amenities-title"
    >
      <div className="mx-auto w-full max-w-[640px]">
        <h1
          id="amenities-title"
          className="max-w-[620px] text-[28px] font-semibold leading-tight tracking-tight text-[var(--color-text-primary)] sm:text-4xl"
        >
          Tell guests which amenities they&apos;ll find at your place
        </h1>
        <p className="mt-2 text-base leading-relaxed text-[var(--color-text-secondary)]">{description}</p>

        <div className="mt-8 space-y-10">
          {groups.map((group) => (
            <section key={group.id} aria-labelledby={`amenity-group-${group.id}`}>
              <h2 id={`amenity-group-${group.id}`} className="text-lg font-semibold">
                {group.title}
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                {group.amenities.map(({ id, label, description: amenityDescription, icon: Icon }) => {
                  const selected = selectedAmenities.includes(id);

                  return (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => onToggle(id)}
                      className={`flex min-h-[104px] flex-col items-start rounded-[var(--radius-md)] border bg-[var(--color-surface)] p-4 text-left transition hover:border-[var(--color-text-primary)] sm:min-h-[124px] ${
                        selected
                          ? 'border-[var(--color-text-primary)] ring-2 ring-[var(--color-text-primary)]'
                          : 'border-[var(--color-border)]'
                      }`}
                    >
                      <Icon className="h-7 w-7 shrink-0" strokeWidth={1.8} aria-hidden="true" />
                      <span className="mt-auto pt-4 text-base font-semibold leading-snug">{label}</span>
                      {amenityDescription ? (
                        <span className="mt-1 text-sm leading-snug text-[var(--color-text-secondary)]">
                          {amenityDescription}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
