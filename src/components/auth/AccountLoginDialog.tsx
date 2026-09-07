import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeftRegular, DismissRegular, MailRegular } from '@fluentui/react-icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { getFirebaseAuthErrorKey, logFirebaseAuthError } from '@/utils/firebaseErrors';
import googleLogo from '@/assets/images/google-logo.png';

interface AccountLoginDialogProps {
  open: boolean;
  onClose: () => void;
  onAuthenticated: () => void;
}

type LoginStep = 'welcome' | 'google' | 'credentials';

function maskEmail(email: string) {
  const [name, domain] = email.split('@');
  if (!domain) return '';
  return `${name.charAt(0)}***${name.length > 1 ? name.slice(-1) : ''}@${domain}`;
}

function AccountLoginPanel({ onClose, onAuthenticated }: Omit<AccountLoginDialogProps, 'open'>) {
  const { lastUser, forgetLastUser, login, loginWithGoogle } = useAuth();
  const { t } = useTranslation('auth');
  const { t: tCommon } = useTranslation('common');
  const { t: tErrors } = useTranslation('errors');
  const [step, setStep] = useState<LoginStep>(lastUser ? 'welcome' : 'google');
  const [identifier, setIdentifier] = useState(lastUser?.email ?? '');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState<'email' | 'google' | null>(null);
  const [error, setError] = useState('');
  const [avatarFailed, setAvatarFailed] = useState(false);
  const pendingRef = useRef(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  const titleId = useId();
  const errorId = useId();
  const reducedMotion = useReducedMotion();
  const firstName = lastUser?.name.trim().split(/\s+/)[0] || 'Booksa';
  const maskedEmail = maskEmail(lastUser?.email ?? '');

  useEffect(() => { closeRef.current = onClose; }, [onClose]);

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        if (!pendingRef.current) closeRef.current();
      }
      if (event.key !== 'Tab') return;
      const controls = Array.from(panelRef.current?.querySelectorAll<HTMLElement>(
        'button:not(:disabled), input:not(:disabled), a[href], select:not(:disabled), [tabindex="0"]'
      ) ?? []).filter((element) => element.getClientRects().length > 0);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (!first) {
        event.preventDefault();
      } else if (event.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      previousFocus?.focus();
    };
  }, []);

  useEffect(() => { panelRef.current?.focus(); }, [step]);

  function changeStep(nextStep: LoginStep) {
    if (pendingRef.current) return;
    setError('');
    setStep(nextStep);
  }

  async function authenticate(method: 'email' | 'google') {
    if (pendingRef.current) return;
    setError('');
    if (method === 'email' && (!identifier.trim() || !password)) {
      setError(t('dialogMissingCredentials'));
      return;
    }
    pendingRef.current = true;
    setPending(method);
    try {
      if (method === 'google') await loginWithGoogle();
      else await login({ email: identifier.trim(), password });
      onAuthenticated();
    } catch (authError) {
      if (method === 'google') {
        const code = authError && typeof authError === 'object' && 'code' in authError ? authError.code : '';
        setError(t(code === 'auth/popup-closed-by-user' ? 'googleCancelled' : code === 'auth/popup-blocked' ? 'googleBlocked' : 'googleFailed'));
      } else {
        logFirebaseAuthError('Email authentication failed:', authError);
        setError(tErrors(getFirebaseAuthErrorKey(authError)));
      }
    } finally {
      pendingRef.current = false;
      setPending(null);
    }
  }

  const actionClassName = 'h-12 min-h-12 w-full rounded-md text-base font-semibold';

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.18 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !pendingRef.current) onClose();
      }}
    >
      <motion.div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={error ? errorId : undefined}
        aria-busy={pending !== null}
        initial={{ opacity: 0, y: reducedMotion ? 0 : 24, scale: reducedMotion ? 1 : 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: reducedMotion ? 0 : 18, scale: reducedMotion ? 1 : 0.98 }}
        transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 360, damping: 30 }}
        className="relative max-h-[calc(100dvh-32px)] w-full max-w-[480px] overflow-y-auto rounded-[32px] bg-[var(--color-surface)] px-6 pb-6 pt-16 text-[var(--color-text-primary)] shadow-[var(--shadow-xl)] outline-none"
      >
        {step !== 'welcome' ? (
          <button
            type="button"
            onClick={() => changeStep(step === 'google' && lastUser ? 'welcome' : step === 'credentials' ? 'google' : 'credentials')}
            disabled={pending !== null}
            aria-label={t('accountDialog.back')}
            className="absolute left-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-[var(--color-surface-muted)] disabled:opacity-50"
          >
            <ArrowLeftRegular className="h-5 w-5" aria-hidden="true" />
          </button>
        ) : null}
        <button
          type="button"
          onClick={onClose}
          disabled={pending !== null}
          aria-label={tCommon('actions.close')}
          className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-[var(--color-surface-muted)] disabled:opacity-50"
        >
          <DismissRegular className="h-5 w-5" aria-hidden="true" />
        </button>

        {step === 'welcome' ? (
          <div className="flex min-h-[400px] flex-col items-center text-center">
            {lastUser?.avatarUrl && !avatarFailed ? (
              <img src={lastUser.avatarUrl} alt="" onError={() => setAvatarFailed(true)} className="h-20 w-20 rounded-full object-cover" />
            ) : (
              <div className="grid h-20 w-20 place-items-center rounded-full bg-[#fae6f4] text-[28px] font-semibold text-[#9a2084]" aria-hidden="true">
                {firstName.charAt(0).toUpperCase()}
              </div>
            )}
            <h2 id={titleId} className="mt-2 text-[26px] font-semibold leading-8 tracking-[-0.035em]">
              {t('accountDialog.welcome', { name: firstName })}
            </h2>
            {maskedEmail ? (
              <p className="mt-7 flex max-w-full items-center justify-center gap-3 text-base">
                <MailRegular className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span className="break-all">{maskedEmail}</span>
              </p>
            ) : null}
            <div className="mt-auto w-full pt-16">
              <p className="mb-4 text-xs leading-4 text-[var(--color-text-secondary)]">{t('accountDialog.loginNotice')}</p>
              <Button onClick={() => changeStep('google')} className={`${actionClassName} bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-primary-700)]`}>
                {t('accountDialog.logIn')}
              </Button>
              <button
                type="button"
                onClick={() => {
                  forgetLastUser();
                  setIdentifier('');
                  setPassword('');
                  changeStep('credentials');
                }}
                className="mt-4 min-h-12 rounded-xl px-6 text-base font-semibold transition hover:bg-[var(--color-surface-muted)]"
              >
                {t('accountDialog.notYou')}
              </button>
            </div>
          </div>
        ) : step === 'google' ? (
          <div className="flex min-h-[400px] flex-col items-center text-center">
            <img src={googleLogo} alt="" className="h-10 w-10 object-contain" />
            <h2 id={titleId} className="mt-2 text-[26px] font-semibold leading-8 tracking-[-0.035em]">{t('accountDialog.googleTitle')}</h2>
            <p className="mt-2 text-base leading-6 text-[var(--color-text-secondary)]">{t('accountDialog.googleDescription')}</p>
            <div className="mt-auto grid w-full gap-4 pt-16">
              {error ? <p id={errorId} role="alert" className="text-sm text-[var(--color-danger)]">{error}</p> : null}
              <Button
                variant="ghost"
                onClick={() => void authenticate('google')}
                loading={pending === 'google'}
                disabled={pending !== null}
                className={`${actionClassName} hover:brightness-95`}
                style={{ backgroundColor: 'var(--color-text-primary)', color: 'var(--color-surface)' }}
                leftIcon={<img src={googleLogo} alt="" className="h-4 w-4 object-contain" />}
              >
                {t('continueGoogle')}
              </Button>
              <Button variant="ghost" disabled={pending !== null} onClick={() => changeStep('credentials')} className={actionClassName} style={{ backgroundColor: 'var(--color-surface-muted)' }}>
                {t('accountDialog.tryAnotherWay')}
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={(event) => { event.preventDefault(); void authenticate('email'); }} className="space-y-4">
            <h2 id={titleId} className="mb-6 text-center text-[26px] font-semibold tracking-[-0.035em]">{t('dialogTitle')}</h2>
            <Input label={t('email')} type="email" autoComplete="email" value={identifier} onChange={(event) => setIdentifier(event.target.value)} disabled={pending !== null} />
            <Input label={t('password')} type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} disabled={pending !== null} />
            {error ? <p id={errorId} role="alert" className="text-sm text-[var(--color-danger)]">{error}</p> : null}
            <p className="text-xs leading-5 text-[var(--color-text-secondary)]">{t('privacyLead')}</p>
            <Button type="submit" loading={pending === 'email'} disabled={pending !== null} className={actionClassName}>{pending === 'email' ? t('signingIn') : tCommon('actions.continue')}</Button>
            <div className="flex items-center gap-4 text-xs text-[var(--color-text-secondary)]"><span className="h-px flex-1 bg-[var(--color-border)]" />{t('or')}<span className="h-px flex-1 bg-[var(--color-border)]" /></div>
            <Button variant="outline" disabled={pending !== null} onClick={() => changeStep('google')} className={actionClassName} leftIcon={<img src={googleLogo} alt="" className="h-5 w-5 object-contain" />}>{t('continueGoogle')}</Button>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}

export function AccountLoginDialog({ open, onClose, onAuthenticated }: AccountLoginDialogProps) {
  if (typeof document === 'undefined') return null;
  return createPortal(
    <AnimatePresence>{open ? <AccountLoginPanel onClose={onClose} onAuthenticated={onAuthenticated} /> : null}</AnimatePresence>,
    document.body
  );
}
