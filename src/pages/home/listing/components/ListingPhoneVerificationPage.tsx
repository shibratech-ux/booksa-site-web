import { useEffect, useRef, useState, type FormEvent } from 'react';
import { CheckCircle2, MessageSquareText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BackButton } from '@/components/ui/BackButton';
import { PHONE_OTP_RESEND_COOLDOWN_MS, PHONE_OTP_TTL_MS, phoneNumberSchema, phonePinSchema } from '@/domain/phone-verification';
import { createPhoneVerification, PhoneVerificationError, type PhoneVerification, type PhoneVerificationErrorCode, type SimulatedPhoneOtp } from '@/services/phone-verification.service';
import { useAuthStore } from '@/store/auth.store';

const primaryButton = 'min-h-12 w-full rounded-button bg-[var(--color-text-primary)] px-6 font-semibold text-[var(--color-surface)] enabled:hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 disabled:cursor-not-allowed disabled:opacity-40';
const textButton = 'min-h-11 rounded-button font-semibold underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 disabled:opacity-40';

export function ListingPhoneVerificationPage({ initialPhone, onBack, onComplete }: {
  initialPhone?: string;
  onBack: () => void;
  onComplete: () => void;
}) {
  const { t } = useTranslation('dashboard');
  const userId = useAuthStore(state => state.user?.id);
  const [step, setStep] = useState<'phone' | 'code' | 'success'>('phone');
  const [phone, setPhone] = useState(initialPhone || '+243');
  const [sentPhone, setSentPhone] = useState('');
  const [otp, setOtp] = useState<SimulatedPhoneOtp | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState<PhoneVerificationErrorCode | null>(null);
  const [busy, setBusy] = useState(false);
  const [sending, setSending] = useState(false);
  const [ready, setReady] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const controllerRef = useRef<PhoneVerification | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const mounted = useRef(false);
  const busyRef = useRef(false);

  useEffect(() => {
    mounted.current = true;
    setReady(false);
    setError(null);
    try {
      if (!userId) throw new PhoneVerificationError('session');
      controllerRef.current = createPhoneVerification(userId);
      setReady(true);
    } catch (failure) {
      setError(failure instanceof PhoneVerificationError ? failure.code : 'generic');
    }
    return () => { mounted.current = false; controllerRef.current?.dispose(); controllerRef.current = null; };
  }, [userId, attempt]);

  useEffect(() => { headingRef.current?.focus(); }, [step]);
  const coolingDown = cooldown > 0;
  useEffect(() => {
    if (!coolingDown) return;
    const timer = window.setInterval(() => setCooldown(value => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [coolingDown]);

  const run = async (action: (controller: PhoneVerification) => Promise<void>) => {
    const controller = controllerRef.current;
    if (busyRef.current || !controller) return;
    busyRef.current = true;
    setBusy(true);
    setError(null);
    try { await action(controller); } catch (failure) {
      if (!mounted.current || controllerRef.current !== controller) return;
      const code = failure instanceof PhoneVerificationError ? failure.code : 'generic';
      setError(code);
      if (failure instanceof PhoneVerificationError && failure.retryAfterSeconds) setCooldown(failure.retryAfterSeconds);
      // A spent challenge cannot be retried; the user needs a new code.
      if (code === 'expired' || code === 'attempts') { setOtp(null); setPin(''); }
    } finally {
      busyRef.current = false;
      if (mounted.current && controllerRef.current === controller) setBusy(false);
    }
  };
  const send = () => run(async controller => {
    if (cooldown > 0) return;
    setSending(true);
    try {
      const sent = await controller.send(step === 'code' ? sentPhone : phone);
      if (!mounted.current || controllerRef.current !== controller) return;
      setCooldown(PHONE_OTP_RESEND_COOLDOWN_MS / 1000);
      setSentPhone(sent.phoneNumber);
      setOtp(sent);
      setPin('');
      setStep('code');
    } finally {
      if (mounted.current && controllerRef.current === controller) setSending(false);
    }
  });
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (step === 'phone') { void send(); return; }
    if (step === 'code') void run(async controller => {
      await controller.confirm(pin);
      if (mounted.current && controllerRef.current === controller) setStep('success');
    });
  };
  const valid = step === 'phone' ? phoneNumberSchema.safeParse(phone).success && cooldown === 0
    : step === 'code' ? Boolean(otp) && phonePinSchema.safeParse(pin).success : true;
  const title = step === 'phone' ? 'title' : step === 'code' ? 'codeTitle' : 'successTitle';

  return (
    <section aria-labelledby="listing-phone-title" className="flex min-h-dvh flex-col bg-[var(--color-surface)] text-[var(--color-text-primary)]">
      <div className="mx-auto w-full max-w-[600px] flex-1 px-5 pb-8 pt-4 sm:px-6 sm:pt-8">
        <BackButton label={t('phoneVerification.back')} onClick={onBack} disabled={busy && !sending} className="-ml-3" />
        <h1 id="listing-phone-title" ref={headingRef} tabIndex={-1} className="mt-4 text-2xl font-semibold leading-tight tracking-tight outline-none sm:mt-6 sm:text-[32px]">{t(`phoneVerification.${title}`)}</h1>
        <p className="mt-3 text-base leading-6 text-[var(--color-text-secondary)]">
          {t(`phoneVerification.${step === 'phone' ? 'description' : step === 'code' ? 'codeDescription' : 'successDescription'}`, { phone: sentPhone })}
        </p>

        <form id="listing-phone-form" onSubmit={submit} aria-busy={busy} className="mt-7 space-y-4">
          {step === 'phone' ? <>
            <div className="rounded-card border border-[var(--color-border)] px-4 py-3 focus-within:outline focus-within:outline-2 focus-within:outline-[var(--color-text-primary)]">
              <label htmlFor="listing-phone" className="block text-xs text-[var(--color-text-secondary)]">{t('phoneVerification.phoneLabel')}</label>
              <input id="listing-phone" type="tel" inputMode="tel" autoComplete="tel" value={phone} maxLength={30} disabled={busy || !ready} onChange={event => { setPhone(event.target.value); setError(null); }} aria-invalid={error === 'invalidPhone' || undefined} aria-describedby={error === 'invalidPhone' ? 'listing-phone-help listing-phone-error' : 'listing-phone-help'} className="min-h-11 w-full bg-transparent text-base outline-none" dir="ltr" required />
            </div>
            <p id="listing-phone-help" className="text-sm leading-5 text-[var(--color-text-secondary)]">{t('phoneVerification.phoneHelp')}</p>
            <p className="text-xs leading-5 text-[var(--color-text-secondary)]">{t('phoneVerification.consent')}</p>
          </> : null}
          {step === 'code' ? <>
            {/* TODO(design): simulated SMS inbox; replace once a real SMS provider is wired in. */}
            {otp ? <div role="status" className="rounded-card border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4">
              <p className="flex items-center gap-2 text-xs font-semibold text-[var(--color-text-secondary)]">
                <MessageSquareText aria-hidden="true" strokeWidth={1.5} />
                {t('phoneVerification.simulatedSms.label')}
              </p>
              <p className="mt-2 text-sm leading-6">{t('phoneVerification.simulatedSms.body', { code: otp.code, minutes: PHONE_OTP_TTL_MS / 60000 })}</p>
              <button type="button" disabled={busy} onClick={() => { setPin(otp.code); setError(null); }} className={`${textButton} mt-1 text-sm`}>{t('phoneVerification.simulatedSms.fill')}</button>
            </div> : null}
            <label htmlFor="listing-phone-pin" className="block text-sm font-semibold">{t('phoneVerification.codeLabel')}</label>
            <input id="listing-phone-pin" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={pin} onChange={event => { setPin(event.target.value.replace(/\D/g, '').slice(0, 6)); setError(null); }} disabled={busy} aria-invalid={error === 'invalidCode' || error === 'expired' || undefined} aria-describedby={error === 'invalidCode' || error === 'expired' ? 'listing-phone-pin-help listing-phone-error' : 'listing-phone-pin-help'} required className="min-h-16 w-full rounded-card border border-[var(--color-border)] bg-transparent px-4 text-center text-2xl tracking-[0.5em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-text-primary)]" dir="ltr" />
            <p id="listing-phone-pin-help" className="text-sm leading-5 text-[var(--color-text-secondary)]">{t('phoneVerification.codeHelp')}</p>
            <div className="flex flex-wrap items-center justify-between gap-x-4">
              <button type="button" disabled={busy || coolingDown} onClick={() => void send()} className={textButton}>{t('phoneVerification.resend')}</button>
              <button type="button" disabled={busy} onClick={() => { setStep('phone'); setOtp(null); setPin(''); setError(null); }} className={textButton}>{t('phoneVerification.change')}</button>
            </div>
          </> : null}
          {coolingDown && (step === 'phone' || step === 'code') ? <p className="text-sm text-[var(--color-text-secondary)]">{t('phoneVerification.cooldown', { seconds: cooldown })}</p> : null}
          {step === 'success' ? <CheckCircle2 aria-hidden="true" className="h-12 w-12 text-[var(--color-success)]" strokeWidth={1.5} /> : null}
          {error ? <p id="listing-phone-error" role="alert" className="rounded-card bg-[var(--color-surface-muted)] p-4 text-sm leading-6">{t(`phoneVerification.errors.${error}`)}</p> : null}
          {!ready ? <button type="button" onClick={() => setAttempt(value => value + 1)} className={textButton}>{t('listingPublishSteps.retry')}</button> : null}
          {busy ? <p role="status" className="text-sm text-[var(--color-text-secondary)]">{t(sending ? 'phoneVerification.sending' : 'phoneVerification.verifying')}</p> : null}
        </form>
      </div>
      <footer className="sticky bottom-0 border-t border-[var(--color-border-subtle)] bg-[var(--color-surface)] pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto w-full max-w-[600px] px-5 py-3 sm:px-6">
          {step === 'success' ? <button type="button" onClick={onComplete} className={primaryButton}>{t('phoneVerification.done')}</button>
            : <button type="submit" form="listing-phone-form" disabled={busy || !ready || !valid} className={primaryButton}>{t(`phoneVerification.${busy ? 'working' : step === 'phone' ? 'send' : 'verify'}`)}</button>}
        </div>
      </footer>
    </section>
  );
}
