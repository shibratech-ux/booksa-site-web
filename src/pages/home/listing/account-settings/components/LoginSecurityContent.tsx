import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FiLock, FiMonitor } from 'react-icons/fi';
import { firebaseAuth } from '@/services/firebase';
import { updateLoggedInUserPassword } from '@/services/auth.service';
import { useTranslation } from 'react-i18next';
import { getFirebaseAuthErrorKey } from '@/utils/firebaseErrors';
import { formatDateTime } from '@/utils/formatters';

type SecurityTab = 'login' | 'shared-access';

function getDeviceName() {
  if (typeof navigator === 'undefined') return 'Current device';
  const agent = navigator.userAgent;
  const platform = /Android/i.test(agent)
    ? 'Android'
    : /iPhone|iPad/i.test(agent)
      ? 'iOS'
      : /Mac/i.test(agent)
        ? 'macOS'
        : /Windows/i.test(agent)
          ? 'Windows'
          : 'Device';
  const browser = /Edg/i.test(agent)
    ? 'Edge'
    : /Chrome/i.test(agent)
      ? 'Chrome'
      : /Safari/i.test(agent)
        ? 'Safari'
        : /Firefox/i.test(agent)
          ? 'Firefox'
          : 'Browser';

  return `${platform} · ${browser}`;
}

export function LoginSecurityContent() {
  const { t, i18n } = useTranslation('auth');
  const { t: tErrors } = useTranslation('errors');
  const [activeTab, setActiveTab] = useState<SecurityTab>('login');
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordUpdated, setPasswordUpdated] = useState(false);
  const newPasswordRef = useRef<HTMLInputElement>(null);
  const providers = firebaseAuth?.currentUser?.providerData.map((provider) => provider.providerId) ?? [];
  const hasPassword = providers.includes('password') || passwordUpdated;
  const hasGoogle = providers.includes('google.com');
  const currentDevice = useMemo(() => getDeviceName(), []);
  const currentSessionTime = useMemo(
    () => formatDateTime(new Date(), i18n.resolvedLanguage),
    [i18n.resolvedLanguage]
  );

  useEffect(() => {
    if (!isEditingPassword) return;
    const animationFrame = window.requestAnimationFrame(() => newPasswordRef.current?.focus());
    return () => window.cancelAnimationFrame(animationFrame);
  }, [isEditingPassword]);

  const closePasswordEditor = () => {
    if (isUpdatingPassword) return;
    setIsEditingPassword(false);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError(null);
  };

  const handlePasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordError(null);
    setPasswordMessage(null);

    if (newPassword.length < 6) {
      setPasswordError(t('validation.passwordMinLength', { count: 6 }));
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(t('validation.passwordMismatch'));
      return;
    }

    setIsUpdatingPassword(true);

    try {
      await updateLoggedInUserPassword(newPassword);
      setPasswordUpdated(true);
      setPasswordMessage(t('passwordUpdated'));
      setIsEditingPassword(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Password update failed.', error);
      setPasswordError(tErrors(getFirebaseAuthErrorKey(error)));
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="mx-auto max-w-[760px]">
      <h2 className="text-[23.52px] font-semibold tracking-[-0.035em] sm:text-[25.2px]">Login &amp; security</h2>

      <div className="mt-6 flex border-b border-[var(--color-border)]" role="tablist" aria-label="Login and security settings">
        {([
          ['login', 'Login'],
          ['shared-access', 'Shared access']
        ] as const).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={activeTab === id}
            onClick={() => setActiveTab(id)}
            className={`relative px-4 pb-3 text-sm font-medium transition first:pl-0 ${
              activeTab === id ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'
            }`}
          >
            {label}
            {activeTab === id ? (
              <motion.span
                layoutId="security-tab-indicator"
                className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-[var(--color-text-primary)] first:left-0"
              />
            ) : null}
          </button>
        ))}
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'login' ? (
          <div>
            <section className="pt-8">
              <h3 className="text-2xl font-semibold tracking-[-0.03em]">Login</h3>
              <div className="mt-7 border-y border-[var(--color-border)] py-6">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <h4 className="font-semibold">Password</h4>
                    {!isEditingPassword ? (
                      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                        {hasPassword ? 'Created' : 'Not created'}
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={isEditingPassword ? closePasswordEditor : () => {
                      setPasswordMessage(null);
                      setIsEditingPassword(true);
                    }}
                    disabled={isUpdatingPassword}
                    className="text-sm font-semibold underline underline-offset-2 disabled:cursor-wait disabled:opacity-50"
                  >
                    {isEditingPassword ? 'Cancel' : hasPassword ? 'Update' : 'Create'}
                  </button>
                </div>

                <motion.div
                  initial={false}
                  animate={{
                    height: isEditingPassword ? 'auto' : 0,
                    opacity: isEditingPassword ? 1 : 0,
                    y: isEditingPassword ? 0 : -6
                  }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  aria-hidden={!isEditingPassword}
                  className={`overflow-hidden ${isEditingPassword ? '' : 'pointer-events-none'}`}
                >
                  <form onSubmit={(event) => void handlePasswordSubmit(event)} className="pt-7">
                    <label className="block">
                      <span className="mb-2 block">New password</span>
                      <input
                        ref={newPasswordRef}
                        type="password"
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                        autoComplete="new-password"
                        disabled={isUpdatingPassword}
                        tabIndex={isEditingPassword ? 0 : -1}
                        className="h-12 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 outline-none transition focus:border-2 focus:border-[var(--color-text-primary)]"
                      />
                    </label>
                    <label className="mt-3 block">
                      <span className="mb-2 block">Confirm password</span>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        autoComplete="new-password"
                        disabled={isUpdatingPassword}
                        tabIndex={isEditingPassword ? 0 : -1}
                        className="h-12 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 outline-none transition focus:border-2 focus:border-[var(--color-text-primary)]"
                      />
                    </label>

                    {passwordError ? (
                      <p role="alert" className="mt-3 text-sm font-medium text-[var(--color-danger)]">
                        {passwordError}
                      </p>
                    ) : null}

                    <button
                      type="submit"
                      disabled={isUpdatingPassword}
                      tabIndex={isEditingPassword ? 0 : -1}
                      className="mt-4 min-h-12 rounded-[var(--radius-md)] bg-[var(--color-text-primary)] px-6 font-semibold text-[var(--color-surface)] transition hover:opacity-85 disabled:cursor-wait disabled:opacity-60"
                    >
                      {isUpdatingPassword ? 'Updating…' : 'Update password'}
                    </button>
                  </form>
                </motion.div>

                {passwordMessage ? (
                  <p role="status" className="mt-3 text-sm font-medium text-[var(--color-success)]">
                    {passwordMessage}
                  </p>
                ) : null}
              </div>
            </section>

            <section className="pt-16">
              <h3 className="text-2xl font-semibold tracking-[-0.03em]">Social accounts</h3>
              <div className="mt-7 flex items-start justify-between gap-6 border-y border-[var(--color-border)] py-6">
                <div>
                  <h4 className="font-semibold">Google</h4>
                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                    {hasGoogle ? 'Connected' : 'Not connected'}
                  </p>
                </div>
                <button type="button" className="text-sm font-semibold underline underline-offset-2">
                  {hasGoogle ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            </section>

            <section className="pt-16">
              <h3 className="text-2xl font-semibold tracking-[-0.03em]">Device history</h3>
              <div className="mt-7 border-y border-[var(--color-border)] py-6">
                <div className="flex items-center gap-4">
                  <FiMonitor className="h-7 w-7 shrink-0" aria-hidden="true" />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold">{currentDevice}</h4>
                      <span className="rounded-sm bg-[var(--color-surface-muted)] px-2 py-1 text-[8.4px] font-semibold uppercase">
                        Current session
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{currentSessionTime}</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="py-16">
              <h3 className="text-2xl font-semibold tracking-[-0.03em]">Account</h3>
              <div className="mt-7 flex items-start justify-between gap-6 border-y border-[var(--color-border)] py-6">
                <div>
                  <h4 className="font-semibold">Account deactivation</h4>
                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">This action cannot be undone</p>
                </div>
                <button type="button" className="text-sm font-semibold underline underline-offset-2">
                  Deactivate
                </button>
              </div>
            </section>
          </div>
        ) : (
          <section className="pt-8">
            <h3 className="text-2xl font-semibold tracking-[-0.03em]">Shared access</h3>
            <p className="mt-7 border-t border-[var(--color-border)] pt-4 leading-5">
              Review each request carefully before approving access. We’ll email your employee or co-worker a 4-digit code that lets them log into your account with their trusted device.
            </p>

            <article className="mt-12 flex gap-5 rounded-[var(--radius-lg)] border border-[var(--color-border)] p-6">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-pink-500 text-pink-500">
                <FiLock className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h4 className="text-lg font-semibold">Adding devices from people you trust</h4>
                <p className="mt-1 text-sm leading-5 text-[var(--color-text-secondary)]">
                  When you approve a request, you grant someone full access to your account. They’ll be able to change reservations and send messages on your behalf.
                </p>
              </div>
            </article>
          </section>
        )}
      </motion.div>
    </div>
  );
}
