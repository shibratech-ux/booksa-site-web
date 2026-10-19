import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SelectField } from '@/components/ui/SelectField';
import { formatTime } from '@/utils/formatters';
import { EditorBottomSheet } from './EditorBottomSheet';

// TODO(team): agree on arrival-guide fields with Flutter before adding Firestore writes.
export type CheckInOutTimes = { start: string; end: string; checkout: string };
export const DEFAULT_CHECK_IN_OUT_TIMES: CheckInOutTimes = { start: '15:00', end: 'flexible', checkout: '11:00' };
const TIME_OPTIONS = Array.from({ length: 48 }, (_, index) => `${String(Math.floor(index / 2)).padStart(2, '0')}:${index % 2 ? '30' : '00'}`);

export function formatArrivalTime(value: string, language?: string) {
  const [hour, minute] = value.split(':').map(Number);
  return formatTime(new Date(2000, 0, 1, hour, minute), language);
}

function ArrivalTimeField({ label, value, onChange, flexible = false }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  flexible?: boolean;
}) {
  const id = useId();
  const { t, i18n } = useTranslation('dashboard');
  return (
    <div className="relative">
      <label htmlFor={id} className="pointer-events-none absolute left-3 top-2 z-10 text-xs text-[var(--color-text-secondary)]">{label}</label>
      <SelectField id={id} value={value} onChange={event => onChange(event.target.value)} className="h-14! rounded-none! border-0! pb-2! pt-6! focus:ring-inset">
        {flexible ? <option value="flexible">{t('checkInOutSheet.flexible')}</option> : null}
        {TIME_OPTIONS.map(time => <option key={time} value={time}>{formatArrivalTime(time, i18n.language)}</option>)}
      </SelectField>
    </div>
  );
}

export function ListingCheckInOutSheet({ open, times, onClose, onSave }: {
  open: boolean;
  times: CheckInOutTimes;
  onClose: () => void;
  onSave: (times: CheckInOutTimes) => void;
}) {
  const { t } = useTranslation('dashboard');
  const [value, setValue] = useState(times);
  const savingRef = useRef(false);
  useEffect(() => {
    if (open) {
      setValue(times);
      savingRef.current = false;
    }
  }, [open, times]);
  const canSave = value.start !== times.start || value.end !== times.end || value.checkout !== times.checkout;
  const update = (field: keyof CheckInOutTimes, next: string) => setValue(current => ({ ...current, [field]: next }));

  return (
    <EditorBottomSheet
      open={open}
      compact
      heading={t('arrivalGuide.sections.checkInOut')}
      closeLabel={t('checkInOutSheet.close')}
      isSaving={false}
      canSave={canSave}
      onClose={onClose}
      onSave={() => {
        if (!canSave || savingRef.current) return;
        savingRef.current = true;
        onSave({ ...value });
      }}
      bodyClassName="pb-6 pt-4"
    >
      <fieldset>
        <legend className="mb-3 text-sm font-semibold">{t('checkInOutSheet.window')}</legend>
        <div className="overflow-hidden rounded-field border border-[var(--color-border)]">
          <ArrivalTimeField label={t('checkInOutSheet.start')} value={value.start} onChange={next => update('start', next)} />
          <div className="border-t border-[var(--color-border)]">
            <ArrivalTimeField label={t('checkInOutSheet.end')} value={value.end} onChange={next => update('end', next)} flexible />
          </div>
        </div>
      </fieldset>
      <fieldset className="mt-8">
        <legend className="mb-3 text-sm font-semibold">{t('arrivalGuide.checkout')}</legend>
        <div className="overflow-hidden rounded-field border border-[var(--color-border)]">
          <ArrivalTimeField label={t('checkInOutSheet.time')} value={value.checkout} onChange={next => update('checkout', next)} />
        </div>
      </fieldset>
      <p className="mt-4 text-xs leading-5 text-[var(--color-text-secondary)]">{t('checkInOutSheet.localOnly')}</p>
    </EditorBottomSheet>
  );
}
