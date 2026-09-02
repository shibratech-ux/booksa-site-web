import { useEffect, useState } from 'react';
import { FiFileText, FiShield, FiSmartphone } from 'react-icons/fi';
import { updateLoggedInUserProfile } from '@/services/user.service';

const benefits = [
  { icon: FiSmartphone, title: 'Simplified expensing', description: 'We’ll send work trip receipts to your work inbox for easy expensing.' },
  { icon: FiFileText, title: 'Trip description', description: 'Add an expense code and business purpose to work trips.' },
  { icon: FiShield, title: 'Keep personal trips private', description: 'Your company can only get info about trips you mark for work at checkout.' }
];

export function TravelForWorkContent({
  initialWorkEmail,
  onWorkEmailSaved
}: {
  initialWorkEmail?: string;
  onWorkEmailSaved?: (email: string) => void;
}) {
  const [workEmail, setWorkEmail] = useState(initialWorkEmail ?? '');
  const [savedEmail, setSavedEmail] = useState(initialWorkEmail ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    setWorkEmail(initialWorkEmail ?? '');
    setSavedEmail(initialWorkEmail ?? '');
  }, [initialWorkEmail]);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(workEmail.trim());
  const canSave = isValidEmail && workEmail.trim() !== savedEmail && !isSaving;

  const saveWorkEmail = async () => {
    if (!canSave) return;
    const nextEmail = workEmail.trim();
    setIsSaving(true);
    setSaveError(null);
    setSaveMessage(null);

    try {
      await updateLoggedInUserProfile({ 'workSettings.email': nextEmail });
      setSavedEmail(nextEmail);
      setWorkEmail(nextEmail);
      onWorkEmailSaved?.(nextEmail);
      setSaveMessage('Your work email was added successfully.');
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Unable to add your work email.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-[836px]">
      <h2 className="text-[32.928px] font-semibold tracking-[-0.035em] sm:text-[35.28px]">Travel for work</h2>
      <section className="pt-6">
        <h3 className="text-2xl font-semibold tracking-[-0.03em]">Join Booksa for Work</h3>
        <p className="mt-4 text-lg leading-7">Add your work email to get seamless expensing and exclusive offers on work trips.</p>
        <label htmlFor="work-email" className="mt-8 block font-semibold">Work email address</label>
        <input
          id="work-email"
          type="email"
          value={workEmail}
          onChange={(event) => {
            setWorkEmail(event.target.value);
            setSaveError(null);
            setSaveMessage(null);
          }}
          onKeyDown={(event) => { if (event.key === 'Enter') void saveWorkEmail(); }}
          autoComplete="email"
          disabled={isSaving}
          className="mt-3 h-12 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-4 outline-none transition focus:border-2 focus:border-[var(--color-text-primary)]"
        />
        <button
          type="button"
          onClick={() => void saveWorkEmail()}
          disabled={!canSave}
          className="mt-2 min-h-12 rounded-md bg-[var(--color-text-primary)] px-6 font-semibold text-[var(--color-surface)] transition hover:opacity-85 disabled:cursor-default disabled:bg-[var(--color-surface-muted)] disabled:text-[var(--color-text-secondary)] disabled:opacity-60"
        >
          {isSaving ? 'Adding…' : 'Add work email'}
        </button>
        {saveError ? <p role="alert" className="mt-3 text-sm text-[var(--color-danger)]">{saveError}</p> : null}
        {saveMessage ? <p role="status" className="mt-3 text-sm text-[var(--color-success)]">{saveMessage}</p> : null}
      </section>

      <section aria-label="Booksa for Work benefits" className="mt-12 rounded-sm border border-[var(--color-border)] px-6 sm:px-7">
        {benefits.map(({ icon: Icon, title, description }, index) => (
          <article key={title} className={`flex gap-5 py-6 ${index < benefits.length - 1 ? 'border-b border-[var(--color-border)]' : ''}`}>
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-pink-500 text-pink-500">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-lg font-semibold tracking-[-0.02em]">{title}</h3>
              <p className="mt-1 text-sm leading-5 text-[var(--color-text-secondary)]">{description}</p>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
