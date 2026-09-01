import { FiHome } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { BooksaMap } from '@/components/maps/BooksaMap';
import type { AddressDetails, WorldLocation } from './AddressSearchDialog';

export type ConfirmedListingLocation = {
  address: AddressDetails;
  location: WorldLocation;
};

const formatAddress = (address: AddressDetails) =>
  [
    address.streetAddress,
    address.apartment,
    address.city,
    address.region,
    address.country,
    address.postalCode
  ]
    .filter(Boolean)
    .join(', ');

export function LocationMapStep({ confirmedLocation }: { confirmedLocation: ConfirmedListingLocation }) {
  const { address, location } = confirmedLocation;
  const addressLabel = formatAddress(address);

  return (
    <motion.section
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-5 sm:px-10 sm:pb-8 sm:pt-3"
      aria-labelledby="listing-location-title"
    >
      <div className="mx-auto w-full max-w-[640px]">
        <h1
          id="listing-location-title"
          className="text-left text-[28px] font-semibold leading-tight tracking-tight text-[var(--color-text-primary)] sm:text-center sm:text-4xl"
        >
          Is the pin in the right spot?
        </h1>
        <p className="mt-2 max-w-[520px] text-left text-sm leading-relaxed text-[var(--color-text-secondary)] sm:mx-auto sm:mt-3 sm:text-center sm:text-base">
          Your confirmed address is shown below. Move around the map to check the surrounding area.
        </p>

        <BooksaMap
            center={location}
            initialZoom={15}
            title={`Map showing ${addressLabel}`}
            className="mt-5 h-[min(430px,52dvh)] min-h-[280px] rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-sm)] sm:mt-7 sm:h-[460px] sm:rounded-[var(--radius-xl)]"
          >

          <div className="pointer-events-none absolute left-4 right-4 top-4 rounded-[var(--radius-lg)] bg-[var(--color-surface)] px-5 py-3 text-[var(--color-text-primary)] shadow-[var(--shadow-md)]">
            <span className="block text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
              Confirmed address
            </span>
            <span className="mt-1 block truncate text-base font-semibold">{addressLabel}</span>
          </div>

          <div className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-text-primary)] text-[var(--color-surface)] shadow-[var(--shadow-md)]">
              <FiHome className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="mt-3 whitespace-nowrap rounded-full bg-[var(--color-text-primary)] px-4 py-2 text-sm font-semibold text-[var(--color-surface)] shadow-[var(--shadow-sm)]">
              Drag the map to check the location
            </span>
          </div>

        </BooksaMap>
      </div>
    </motion.section>
  );
}
