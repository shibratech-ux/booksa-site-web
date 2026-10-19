import {
  BedDouble,
  Caravan,
  Castle,
  Circle,
  Container,
  Fence,
  Mountain,
  Pizza,
  Sailboat,
  Tent,
  Tractor,
  TreePine,
  Wind,
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
      { id: 'house', label: 'House', icon: House },
      { id: 'apartment', label: 'Apartment', icon: Building2 },
      { id: 'barn', label: 'Barn', icon: Warehouse },
      { id: 'bed-and-breakfast', label: 'Bed & breakfast', icon: Coffee },
      { id: 'boat', label: 'Boat', icon: Sailboat },
      { id: 'cabin', label: 'Cabin', icon: House },
      { id: 'camper-rv', label: 'Camper/RV', icon: Caravan },
      { id: 'casa-particular', label: 'Casa particular', icon: Building },
      { id: 'castle', label: 'Castle', icon: Castle },
      { id: 'cave', label: 'Cave', icon: Mountain },
      { id: 'container', label: 'Container', icon: Container },
      { id: 'cycladic-home', label: 'Cycladic home', icon: Building2 },
      { id: 'dammuso', label: 'Dammuso', icon: House },
      { id: 'dome', label: 'Dome', icon: Circle },
      { id: 'earth-home', label: 'Earth home', icon: Mountain },
      { id: 'farm', label: 'Farm', icon: Tractor },
      { id: 'guesthouse', label: 'Guesthouse', icon: DoorOpen },
      { id: 'hotel', label: 'Hotel', icon: Hotel },
      { id: 'houseboat', label: 'Houseboat', icon: ShipWheel },
      { id: 'minsu', label: 'Minsu', icon: House },
      { id: 'riad', label: 'Riad', icon: Fence },
      { id: 'ryokan', label: 'Ryokan', icon: Building2 },
      { id: 'shepherds-hut', label: 'Shepherd’s hut', icon: House },
      { id: 'tent', label: 'Tent', icon: Tent },
      { id: 'tiny-home', label: 'Tiny home', icon: House },
      { id: 'tower', label: 'Tower', icon: Building },
      { id: 'treehouse', label: 'Treehouse', icon: TreePine },
      { id: 'trullo', label: 'Trullo', icon: House },
      { id: 'windmill', label: 'Windmill', icon: Wind },
      { id: 'yurt', label: 'Yurt', icon: TentTree },
      { id: 'boutique-hotel', label: 'Boutique hotel', icon: Store },
      { id: 'hostel', label: 'Hostel', icon: Users },
      { id: 'lodge', label: 'Lodge', icon: TentTree },
      { id: 'resort', label: 'Resort', icon: Umbrella },
      { id: 'villa', label: 'Villa', icon: Trees }
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
      { id: 'cafe', label: 'Cafe', icon: Coffee },
      { id: 'bar', label: 'Bar', icon: Wine },
      { id: 'bistro', label: 'Bistro', icon: Soup },
      { id: 'diner', label: 'Diner', icon: Store },
      { id: 'food-truck', label: 'Food truck', icon: Truck },
      { id: 'bakery', label: 'Bakery', icon: CakeSlice },
      { id: 'pub', label: 'Pub', icon: Wine },
      { id: 'fast-food', label: 'Fast food', icon: Utensils },
      { id: 'brasserie', label: 'Brasserie', icon: Store },
      { id: 'canteen', label: 'Canteen', icon: Utensils },
      { id: 'dessert-shop', label: 'Dessert shop', icon: CakeSlice },
      { id: 'fine-dining', label: 'Fine dining', icon: Crown },
      { id: 'market-stall', label: 'Market stall', icon: Store },
      { id: 'lounge', label: 'Lounge', icon: Wine },
      { id: 'pizzeria', label: 'Pizzeria', icon: Pizza },
      { id: 'tea-house', label: 'Tea house', icon: Coffee },
      { id: 'tavern', label: 'Tavern', icon: Store },
      { id: 'snack-bar', label: 'Snack bar', icon: Soup },
      { id: 'buffet', label: 'Buffet', icon: Store },
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
      { id: 'bedroom', label: 'Bedroom', icon: BedDouble },
      { id: 'guest-suite', label: 'Guest suite', icon: KeyRound },
      { id: 'shared-room', label: 'Shared room', icon: Users },
      { id: 'room-in-apartment', label: 'Apartment room', icon: Building2 },
      { id: 'room-in-house', label: 'House room', icon: House },
      { id: 'room-in-guesthouse', label: 'Guesthouse room', icon: DoorOpen },
      { id: 'room-in-hotel', label: 'Hotel room', icon: Hotel },
      { id: 'room-in-hostel', label: 'Hostel room', icon: Users },
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
