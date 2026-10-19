import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, CreditCard, IdCard, LockKeyhole, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BackButton } from '@/components/ui/BackButton';
import { IconButton } from '@/components/ui/IconButton';
import { ShimmerImage } from '@/components/ui/ShimmerImage';
import { identityDocumentSides, MAX_IDENTITY_DOCUMENT_BYTES, sha256Hex, type IdentityDocumentImage, type IdentityDocumentType } from '@/domain/identity-verification';
import { ListingLegalNamePage } from './ListingLegalNamePage';

type Side = 'front' | 'back';

export function ListingIdentityUploadPage({ countryCode, documentType, onBack, onComplete }: {
  countryCode: string;
  documentType: IdentityDocumentType;
  onBack: () => void;
  onComplete: () => void;
}) {
  const { t } = useTranslation('dashboard');
  const headingRef = useRef<HTMLHeadingElement>(null);
  const urls = useRef<Partial<Record<Side, string>>>({});
  const versions = useRef<Record<Side, number>>({ front: 0, back: 0 });
  const [previews, setPreviews] = useState<Partial<Record<Side, string>>>({});
  // Only fingerprints are submitted; the images themselves stay in this browser tab.
  const [images, setImages] = useState<Partial<Record<Side, IdentityDocumentImage>>>({});
  const [errors, setErrors] = useState<Partial<Record<Side, string>>>({});
  const [pending, setPending] = useState<Partial<Record<Side, boolean>>>({});
  const [showLegalName, setShowLegalName] = useState(false);
  const sides: readonly Side[] = identityDocumentSides(documentType);
  const canContinue = sides.every(side => previews[side] && images[side] && !pending[side] && !errors[side]);

  useEffect(() => {
    const currentUrls = urls.current;
    const currentVersions = versions.current;
    return () => {
      currentVersions.front++;
      currentVersions.back++;
      Object.values(currentUrls).forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  useEffect(() => { if (!showLegalName) headingRef.current?.focus(); }, [showLegalName]);

  const chooseImage = async (side: Side, file: File | undefined) => {
    if (!file) return;
    const version = ++versions.current[side];
    setPending(current => ({ ...current, [side]: false }));
    if (!['image/jpeg', 'image/png'].includes(file.type) || file.size === 0 || file.size > MAX_IDENTITY_DOCUMENT_BYTES) {
      setErrors(current => ({ ...current, [side]: t('identityUpload.invalidFile') }));
      return;
    }

    const url = URL.createObjectURL(file);
    setPending(current => ({ ...current, [side]: true }));
    setErrors(current => ({ ...current, [side]: undefined }));
    try {
      const probe = new window.Image();
      probe.src = url;
      await probe.decode();
      const image: IdentityDocumentImage = { sha256: await sha256Hex(await file.arrayBuffer()), contentType: file.type as IdentityDocumentImage['contentType'], size: file.size };
      if (versions.current[side] !== version) {
        URL.revokeObjectURL(url);
        return;
      }
      const previousUrl = urls.current[side];
      if (previousUrl) URL.revokeObjectURL(previousUrl);
      urls.current[side] = url;
      setPreviews(current => ({ ...current, [side]: url }));
      setImages(current => ({ ...current, [side]: image }));
    } catch {
      URL.revokeObjectURL(url);
      if (versions.current[side] === version) {
        setErrors(current => ({ ...current, [side]: t('identityUpload.unreadableFile') }));
      }
    } finally {
      if (versions.current[side] === version) setPending(current => ({ ...current, [side]: false }));
    }
  };

  const removeImage = (side: Side) => {
    versions.current[side]++;
    const url = urls.current[side];
    if (url) URL.revokeObjectURL(url);
    delete urls.current[side];
    setPreviews(current => ({ ...current, [side]: undefined }));
    setImages(current => ({ ...current, [side]: undefined }));
    setErrors(current => ({ ...current, [side]: undefined }));
    setPending(current => ({ ...current, [side]: false }));
  };

  if (showLegalName && images.front) {
    const documentDetails = {
      countryCode,
      documentType,
      documentImages: documentType === 'passport' || !images.back ? { front: images.front } : { front: images.front, back: images.back }
    };
    return <ListingLegalNamePage document={documentDetails} onClose={() => setShowLegalName(false)} onComplete={onComplete} />;
  }

  return (
    <section className="min-h-dvh bg-[var(--color-surface)] text-[var(--color-text-primary)]">
      <div className="mx-auto w-full max-w-[600px] px-6 pt-4 sm:pt-8">
        <BackButton label={t('identityUpload.back')} onClick={onBack} className="-ml-3" />
        <h1 ref={headingRef} tabIndex={-1} className="mt-3 max-w-md text-2xl font-semibold leading-tight tracking-tight outline-none sm:mt-6 sm:text-[32px]">
          {t(`identityUpload.titles.${documentType}`)}
        </h1>
        <p className="mt-2 max-w-lg text-base leading-5 text-[var(--color-text-secondary)] sm:leading-6">
          {t(`identityUpload.instructions.${documentType}`)}
        </p>

        <div className={`mt-6 grid gap-2 ${documentType === 'passport' ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {sides.map(side => {
            const Icon = side === 'front' ? IdCard : CreditCard;
            const label = documentType === 'passport'
              ? t(previews[side] ? 'identityUpload.replacePassport' : 'identityUpload.uploadPassport')
              : t(`identityUpload.${previews[side] ? 'replace' : 'upload'}.${side}`);
            return (
              <div key={side} className="relative min-w-0">
                <label className="block cursor-pointer">
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    aria-label={label}
                    aria-invalid={Boolean(errors[side])}
                    aria-describedby={errors[side] ? `identity-image-${side}-error` : undefined}
                    className="peer sr-only"
                    onChange={event => {
                      const file = event.target.files?.[0];
                      event.target.value = '';
                      void chooseImage(side, file);
                    }}
                  />
                  <span className="flex min-h-32 flex-col items-center justify-center gap-2 overflow-hidden rounded-field border border-dashed border-[var(--color-text-secondary)] px-2 py-5 text-center transition-colors hover:bg-[var(--color-surface-muted)] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-[var(--color-text-primary)] sm:min-h-40">
                    {previews[side] ? (
                      <ShimmerImage src={previews[side]} alt={t(`identityUpload.preview.${side}`)} className="h-24 w-full object-contain" />
                    ) : <Icon className="h-7 w-7" strokeWidth={1.5} aria-hidden="true" />}
                    <span className="text-base font-semibold leading-5">{pending[side] ? t('identityUpload.checking') : label}</span>
                    <span className="text-xs text-[var(--color-text-secondary)]">{t('identityUpload.formats')}</span>
                  </span>
                </label>
                {previews[side] ? (
                  <IconButton
                    label={t(`identityUpload.remove.${side}`)}
                    onClick={() => removeImage(side)}
                    icon={<X className="h-4 w-4" aria-hidden="true" />}
                    className="absolute right-1 top-1 bg-[var(--color-surface)]"
                  />
                ) : null}
                {errors[side] ? <p id={`identity-image-${side}-error`} role="alert" className="mt-2 text-sm leading-5 text-[var(--color-danger)]">{errors[side]}</p> : null}
              </div>
            );
          })}
        </div>
      </div>

      <footer className="mt-28 border-t border-[var(--color-border-subtle)] pb-[env(safe-area-inset-bottom)] sm:mt-20">
        <div className="mx-auto flex w-full max-w-[600px] items-center justify-between gap-6 px-6 py-3">
          <button type="button" onClick={onBack} className="-ml-3 inline-flex min-h-11 items-center gap-1 rounded-button px-3 font-semibold underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            {t('identityVerification.backLabel')}
          </button>
          <button
            type="button"
            disabled={!canContinue}
            onClick={() => { if (canContinue) setShowLegalName(true); }}
            className="inline-flex min-h-12 items-center gap-1 rounded-button bg-[var(--color-text-primary)] px-5 font-semibold text-[var(--color-surface)] enabled:hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-text-primary)] disabled:cursor-not-allowed disabled:bg-[var(--color-surface-muted)] disabled:text-[var(--color-text-secondary)]"
          >
            <LockKeyhole className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            {t('identityVerification.continue')}
          </button>
        </div>
      </footer>
    </section>
  );
}
