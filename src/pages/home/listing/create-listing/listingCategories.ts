import {
  BedDouble,
  Building,
  Building2,
  CakeSlice,
  Coffee,
  Crown,
  DoorOpen,
  House,
  Hotel,
  KeyRound,
  ShipWheel,
  Soup,
  Store,
  TentTree,
  Trees,
  Truck,
  Umbrella,
  Users,
  Utensils,
  UtensilsCrossed,
  Warehouse,
  Wine,
  type LucideIcon
} from 'lucide-react';

export type ListingInformationSection = {
  id: string;
  title: string;
  description: string;
  fields: string[];
};

export type ListingCategory = {
  id: 'hotel' | 'restaurant' | 'private-room';
  label: string;
  shortDescription: string;
  icon: LucideIcon;
  optionsTitle: string;
  options: ListingCategoryOption[];
  informationSections: ListingInformationSection[];
};

export type ListingCategoryOption = {
  id: string;
  label: string;
  icon: LucideIcon;
};

export const listingCategories: ListingCategory[] = [
  {
    id: 'hotel',
    label: 'Hotel',
    shortDescription: 'A hotel, boutique stay, lodge, resort, or guesthouse with managed rooms.',
    icon: Building2,
    optionsTitle: 'What kind of hotel or stay are you listing?',
    options: [
      { id: 'hotel', label: 'Hotel', icon: Hotel },
      { id: 'house', label: 'House', icon: House },
      { id: 'apartment', label: 'Apartment', icon: Building2 },
      { id: 'barn', label: 'Barn', icon: Warehouse },
      { id: 'bed-and-breakfast', label: 'Bed & breakfast', icon: BedDouble },
      { id: 'boutique-hotel', label: 'Boutique hotel', icon: Store },
      { id: 'guesthouse', label: 'Guesthouse', icon: DoorOpen },
      { id: 'hostel', label: 'Hostel', icon: Users },
      { id: 'lodge', label: 'Lodge', icon: TentTree },
      { id: 'resort', label: 'Resort', icon: Umbrella },
      { id: 'villa', label: 'Villa', icon: Trees },
      { id: 'houseboat', label: 'Houseboat', icon: ShipWheel }
    ],
    informationSections: [
      {
        id: 'hotel-identity',
        title: 'Hotel identity',
        description: 'Introduce the property and what makes the stay distinctive.',
        fields: ['Hotel name', 'Property style', 'Star category', 'Short story or description']
      },
      {
        id: 'hotel-capacity',
        title: 'Rooms & capacity',
        description: 'Explain the available rooms and how many guests can stay.',
        fields: ['Room types', 'Number of rooms', 'Beds and bathrooms', 'Maximum guests']
      },
      {
        id: 'hotel-experience',
        title: 'Guest experience',
        description: 'Highlight the services that make the hotel memorable.',
        fields: ['Amenities', 'Hotel services', 'Accessibility', 'Languages spoken']
      },
      {
        id: 'hotel-operations',
        title: 'Stay details',
        description: 'Set expectations before guests reserve.',
        fields: ['Check-in and checkout', 'House policies', 'Cancellation rules', 'Guest support']
      }
    ]
  },
  {
    id: 'restaurant',
    label: 'Restaurant',
    shortDescription: 'A restaurant, café, bar, food venue, or hosted dining experience.',
    icon: UtensilsCrossed,
    optionsTitle: 'What kind of food venue are you listing?',
    options: [
      { id: 'restaurant', label: 'Restaurant', icon: UtensilsCrossed },
      { id: 'cafe', label: 'Café', icon: Coffee },
      { id: 'bar', label: 'Bar', icon: Wine },
      { id: 'bakery', label: 'Bakery', icon: CakeSlice },
      { id: 'bistro', label: 'Bistro', icon: Soup },
      { id: 'fast-food', label: 'Fast food', icon: Utensils },
      { id: 'food-truck', label: 'Food truck', icon: Truck },
      { id: 'buffet', label: 'Buffet', icon: Store },
      { id: 'fine-dining', label: 'Fine dining', icon: Crown },
      { id: 'rooftop', label: 'Rooftop venue', icon: Building },
      { id: 'private-dining', label: 'Private dining', icon: KeyRound },
      { id: 'pop-up', label: 'Pop-up kitchen', icon: TentTree }
    ],
    informationSections: [
      {
        id: 'restaurant-identity',
        title: 'Concept & cuisine',
        description: 'Help guests quickly understand the food and personality of the venue.',
        fields: ['Restaurant name', 'Cuisine types', 'Dining concept', 'Price range']
      },
      {
        id: 'restaurant-menu',
        title: 'Menu highlights',
        description: 'Show what guests should be excited to order.',
        fields: ['Signature dishes', 'Menu', 'Dietary options', 'Food and drink photos']
      },
      {
        id: 'restaurant-experience',
        title: 'Dining experience',
        description: 'Describe the atmosphere and ways guests can dine.',
        fields: ['Atmosphere', 'Seating capacity', 'Indoor or outdoor seating', 'Accessibility']
      },
      {
        id: 'restaurant-operations',
        title: 'Service details',
        description: 'Provide the practical information needed to plan a visit.',
        fields: ['Opening hours', 'Reservations', 'Takeaway or delivery', 'Venue policies']
      }
    ]
  },
  {
    id: 'private-room',
    label: 'Private room',
    shortDescription: 'A private sleeping space inside a home with some areas that may be shared.',
    icon: BedDouble,
    optionsTitle: 'Where is the private room located?',
    options: [
      { id: 'room-in-house', label: 'Room in a house', icon: House },
      { id: 'room-in-apartment', label: 'Room in an apartment', icon: Building2 },
      { id: 'guest-suite', label: 'Guest suite', icon: KeyRound },
      { id: 'room-in-guesthouse', label: 'Room in a guesthouse', icon: DoorOpen },
      { id: 'room-in-hotel', label: 'Room in a hotel', icon: Hotel },
      { id: 'room-in-hostel', label: 'Room in a hostel', icon: Users },
      { id: 'room-in-villa', label: 'Room in a villa', icon: Trees },
      { id: 'room-in-lodge', label: 'Room in a lodge', icon: TentTree },
      { id: 'studio-room', label: 'Studio room', icon: BedDouble },
      { id: 'serviced-room', label: 'Serviced room', icon: Building },
      { id: 'room-on-farm', label: 'Room on a farm', icon: Warehouse },
      { id: 'room-on-houseboat', label: 'Room on a houseboat', icon: ShipWheel }
    ],
    informationSections: [
      {
        id: 'room-identity',
        title: 'Room & property',
        description: 'Describe the room and the home it belongs to.',
        fields: ['Property type', 'Room description', 'Floor and access', 'Level of privacy']
      },
      {
        id: 'room-capacity',
        title: 'Sleeping arrangements',
        description: 'Make the sleeping setup clear before guests book.',
        fields: ['Maximum guests', 'Bed types', 'Private or shared bathroom', 'Room size']
      },
      {
        id: 'room-shared-spaces',
        title: 'Shared spaces',
        description: 'Tell guests which parts of the home they can use.',
        fields: ['Shared rooms', 'Kitchen access', 'Host presence', 'Private entrance']
      },
      {
        id: 'room-experience',
        title: 'Comfort & expectations',
        description: 'Share the comforts, rules, and local experience.',
        fields: ['Room amenities', 'House rules', 'Check-in and checkout', 'Neighborhood highlights']
      }
    ]
  }
];

export const getListingCategory = (categoryId: string | null) =>
  listingCategories.find(({ id }) => id === categoryId);
