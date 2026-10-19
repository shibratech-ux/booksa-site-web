import { useEffect, useRef, useState } from 'react';
import { CircleHelp, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { CustomTypeOptions } from 'i18next';
import { BackButton } from '@/components/ui/BackButton';
import { parseListingAmenityIds } from '@/domain/listing';
import { getListingCategory } from '../create-listing/listingCategories';
import { getAmenityGroups } from '../create-listing/components/AmenitiesStep';

type Mode = 'view' | 'edit' | 'add';
type AmenitiesCopy = CustomTypeOptions['resources']['dashboard']['listingAmenities'];

export function ListingAmenitiesPage({ amenityIds, categoryId, onBack, onSave }: {
  amenityIds: string[];
  categoryId: unknown;
  onBack: () => void;
  onSave: (amenityIds: string[]) => Promise<void>;
}) {
  const { t, i18n } = useTranslation('dashboard');
  const category = getListingCategory(typeof categoryId === 'string' ? categoryId : null);
  const groups = category ? getAmenityGroups(category) : [];
  const catalog = groups.flatMap(group => group.amenities);
  const [mode, setMode] = useState<Mode>('view');
  const [draft, setDraft] = useState<string[]>([]);
  const [editingIds, setEditingIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const savingRef = useRef(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const isEditing = mode !== 'view';
  const ids = mode === 'edit' ? editingIds : amenityIds;
  const selected = [...new Set(ids)].map(id => catalog.find(amenity => amenity.id === id) ?? { id, icon: CircleHelp });
  const labelFor = (id: string): string => catalog.some(amenity => amenity.id === id)
    ? t(`listingAmenities.labels.${id as keyof AmenitiesCopy['labels']}`) : t('listingAmenities.unknown');
  selected.sort((first, second) => labelFor(first.id).localeCompare(labelFor(second.id), i18n.language));
  const changed = draft.length !== amenityIds.length || draft.some(id => !amenityIds.includes(id));
  const canSave = isEditing && changed && !isSaving && parseListingAmenityIds({ listingCategory: categoryId }, draft) !== null;

  useEffect(() => { headingRef.current?.focus(); }, [mode]);

  const begin = (next: Mode) => {
    if (savingRef.current) return;
    setDraft([...amenityIds]);
    setEditingIds([...amenityIds]);
    setSaveError(false);
    setMode(next);
  };
  const back = () => {
    if (savingRef.current) return;
    if (isEditing) setMode('view');
    else onBack();
  };
  const save = async () => {
    if (!canSave || savingRef.current) return;
    savingRef.current = true;
    setIsSaving(true);
    setSaveError(false);
    try {
      await onSave(draft);
      setMode('view');
    } catch {
      setSaveError(true);
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  };

  const renderRow = ({ id, icon: Icon }: (typeof selected)[number]) => {
    const descriptionKey = `listingAmenities.descriptions.${id as keyof AmenitiesCopy['descriptions']}` as const;
    const description = ['essentials', 'cooking-basics', 'hot-water', 'tv'].includes(id) ? t(descriptionKey) : null;
    const content = (
      <>
        <Icon className="mt-0.5 h-6 w-6 shrink-0" strokeWidth={1.5} aria-hidden="true" />
        <span className="min-w-0 flex-1">
          <span className="block text-base leading-6">{labelFor(id)}</span>
          {description ? <span className="mt-0.5 block text-sm leading-5 text-[var(--color-text-secondary)]">{description}</span> : null}
        </span>
      </>
    );
    return (
      <li key={id}>
        {isEditing ? (
          <label className={`flex min-h-20 items-start gap-4 rounded-button py-5 ${isSaving ? 'opacity-60' : 'cursor-pointer'}`}>
            {content}
            <input
              type="checkbox"
              checked={draft.includes(id)}
              disabled={isSaving}
              aria-label={labelFor(id)}
              onChange={() => {
                setDraft(current => current.includes(id) ? current.filter(value => value !== id) : [...current, id]);
                setSaveError(false);
              }}
              className="mt-1 h-5 w-5 shrink-0 accent-[var(--color-text-primary)]"
            />
          </label>
        ) : <div className="flex min-h-20 items-start gap-4 py-5">{content}</div>}
      </li>
    );
  };

  return (
    <section aria-labelledby="listing-amenities-heading" className="flex min-h-[calc(100dvh-96px)] flex-col bg-[var(--color-surface)] text-[var(--color-text-primary)] [&_button:focus-visible]:outline [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-offset-2 [&_button:focus-visible]:outline-[var(--color-text-primary)]">
      <div className="mx-auto w-full max-w-2xl flex-1 px-5 pb-28 pt-5 sm:px-10 sm:pt-8 md:pb-10">
        <header className="flex items-center justify-between">
          <BackButton onClick={back} disabled={isSaving} label={isEditing ? t('listingAmenities.backToAmenities') : t('listingAmenities.back')} className="-ml-3" />
          {!isEditing ? (
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => begin('edit')} disabled={!category || amenityIds.length === 0} className="min-h-11 rounded-button px-3 text-sm font-semibold transition hover:bg-[var(--color-surface-muted)] disabled:opacity-40">{t('listingAmenities.edit')}</button>
              <button type="button" onClick={() => begin('add')} disabled={!category} aria-label={t('listingAmenities.add')} className="inline-flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-[var(--color-surface-muted)] disabled:opacity-40">
                <Plus className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          ) : null}
        </header>
        <h1 id="listing-amenities-heading" ref={headingRef} tabIndex={-1} className="mt-5 text-2xl font-semibold tracking-tight outline-none">{mode === 'add' ? t('listingAmenities.add') : t('listingAmenities.heading')}</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{isEditing ? t('listingAmenities.select') : t('listingAmenities.subtitle')}</p>
        {!category ? <p role="status" className="mt-6 text-sm text-[var(--color-text-secondary)]">{t('listingAmenities.unavailable')}</p> : null}
        {mode === 'add' ? (
          <div className="mt-8 space-y-6">
            {groups.map(group => (
              <section key={group.id} aria-labelledby={`amenities-group-${group.id}`}>
                <h2 id={`amenities-group-${group.id}`} className="text-lg font-semibold">{t(`listingAmenities.groups.${group.id as keyof AmenitiesCopy['groups']}`)}</h2>
                <ul className="mt-2">{group.amenities.map(renderRow)}</ul>
              </section>
            ))}
          </div>
        ) : selected.length ? <ul className="mt-6">{selected.map(renderRow)}</ul> : <p role="status" className="mt-10 text-sm text-[var(--color-text-secondary)]">{t('listingAmenities.empty')}</p>}
        {saveError ? <p role="alert" className="mt-6 text-sm text-[var(--color-danger)]">{t('listingAmenities.saveError')}</p> : null}
      </div>
      {isEditing ? (
        <footer className="sticky bottom-[calc(72px+env(safe-area-inset-bottom))] z-10 border-t border-[var(--color-border-subtle)] bg-[var(--color-surface)] pb-[max(16px,env(safe-area-inset-bottom))] pt-4 md:bottom-0">
          <div className="mx-auto flex w-full max-w-2xl items-center justify-between px-5 sm:px-10">
            <button type="button" onClick={back} disabled={isSaving} className="min-h-11 rounded-button px-2 font-semibold underline disabled:opacity-50">{t('editorSheet.cancel')}</button>
            <button type="button" onClick={() => void save()} disabled={!canSave} aria-busy={isSaving} className="min-h-12 rounded-button bg-[var(--color-text-primary)] px-6 font-semibold text-[var(--color-surface)] disabled:opacity-40">{isSaving ? t('editorSheet.saving') : t('editorSheet.save')}</button>
          </div>
        </footer>
      ) : null}
    </section>
  );
}
