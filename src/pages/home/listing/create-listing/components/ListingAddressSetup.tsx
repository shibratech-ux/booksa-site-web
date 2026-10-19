import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { IconButton } from '@/components/ui/IconButton';
import { ShimmerImage } from '@/components/ui/ShimmerImage';
import { updateCurrentUserDraft } from '@/services/listing-draft.service';
import { ROUTES, STORAGE_KEYS } from '@/utils/constants';
import housePhoto from '@/assets/images/listing-setup-house.webp';
import { AddressSearchDialog } from './AddressSearchDialog';

export function ListingAddressSetup({ listingId, onClose }: { listingId?: string; onClose: () => void }) {
  const { t } = useTranslation('dashboard');
  const { t: tCommon } = useTranslation('common');
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  return (
    <main className="relative min-h-dvh bg-[var(--color-surface)] text-[var(--color-text-primary)] md:grid md:grid-cols-2">
      <div className="relative h-[50dvh] bg-[var(--color-surface-muted)] md:sticky md:top-0 md:h-dvh">
        <ShimmerImage
          src={housePhoto}
          alt=""
          fetchPriority="high"
          className="h-full w-full object-cover object-center"
        />
      </div>

      <IconButton
        icon={<X className="h-5 w-5" aria-hidden="true" />}
        label={tCommon('actions.close')}
        variant="muted"
        onClick={onClose}
        disabled={isSavingAddress}
        className="absolute right-4 top-[max(16px,env(safe-area-inset-top))] z-10 bg-[var(--color-surface)]/80 backdrop-blur-sm md:right-6 md:top-6"
      />

      <motion.section
        initial={reducedMotion ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.3 }}
        className="flex min-h-[50dvh] flex-col items-center px-6 pb-[max(20px,env(safe-area-inset-bottom))] pt-12 text-center md:min-h-dvh md:justify-center md:px-10 md:py-20 lg:px-16"
        aria-labelledby="listing-address-heading"
      >
        <h1 id="listing-address-heading" className="max-w-sm text-3xl font-bold leading-tight tracking-tight lg:text-4xl">
          {t('listingSetup.addressTitle')}
        </h1>
        <p className="mt-4 max-w-sm text-base leading-6 text-[var(--color-text-secondary)]">
          {t('listingSetup.addressIntroduction')}
        </p>

        <button
          type="button"
          onClick={() => setIsAddressDialogOpen(true)}
          aria-haspopup="dialog"
          disabled={isSavingAddress}
          aria-busy={isSavingAddress}
          className="mt-10 flex min-h-14 w-full max-w-md items-center gap-3 rounded-search border border-[var(--color-text-secondary)] bg-[var(--color-surface)] px-4 text-left text-sm transition hover:border-[var(--color-text-primary)] hover:bg-[var(--color-surface-muted)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-text-primary)] disabled:cursor-wait disabled:opacity-50 md:mt-12"
        >
          <Search className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span className="text-[var(--color-text-secondary)]">{isSavingAddress ? tCommon('states.loading') : t('listingSetup.enterAddress')}</span>
        </button>

        <p className="mt-auto pt-6 text-xs leading-5 text-[var(--color-text-secondary)] md:mt-0 md:pt-8 md:text-sm">
          {t('listingSetup.notListingHome')}{' '}
          <a href={ROUTES.experiences} className="inline-flex min-h-11 items-center font-semibold text-[var(--color-text-primary)] underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-4">
            {t('listingSetup.experience')}
          </a>{' '}
          {t('listingSetup.or')}{' '}
          <a href={ROUTES.services} className="inline-flex min-h-11 items-center font-semibold text-[var(--color-text-primary)] underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-4">
            {t('listingSetup.service')}
          </a>
        </p>
      </motion.section>

      <AddressSearchDialog
        open={isAddressDialogOpen}
        initialQuery=""
        onClose={() => setIsAddressDialogOpen(false)}
        onSelect={async (location, details) => {
          if (isSavingAddress) return;
          setIsSavingAddress(true);
          const confirmedLocation = {
            address: details,
            location: { ...location, city: details.city, region: details.region, country: details.country, countryCode: details.countryCode }
          };

          try {
            if (listingId) {
              await updateCurrentUserDraft(listingId, {
                confirmedLocation,
                resumePath: '/host/listing/create',
                resumePage: 'setup'
              });
            }
            window.sessionStorage.setItem(STORAGE_KEYS.listingDraftLocation, JSON.stringify(confirmedLocation));
            navigate(ROUTES.hostListingFirstSection, { state: { listingId, confirmedLocation } });
          } catch (error) {
            console.error('Unable to save the listing address.', error);
            toast.error(t('listingSetup.createError'));
          } finally {
            setIsSavingAddress(false);
          }
        }}
      />
    </main>
  );
}
