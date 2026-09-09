import { MailRegular } from '@fluentui/react-icons';

export interface RememberedUserLoginProps {
  name: string;
  email: string;
  avatarUrl?: string;
  loginLabel: string;
  notYouLabel: string;
  loginNotice: string;
  onLogin: () => void;
  onNotYou: () => void;
}

function maskEmail(email: string) {
  const [localPart, domain] = email.split('@');

  if (!domain) return email;

  const visibleCharacter = localPart.charAt(0);
  const hiddenCharacters = '*'.repeat(Math.max(3, localPart.length - 1));
  return `${visibleCharacter}${hiddenCharacters}@${domain}`;
}

export function RememberedUserLogin({
  name,
  email,
  avatarUrl,
  loginLabel,
  notYouLabel,
  loginNotice,
  onLogin,
  onNotYou
}: RememberedUserLoginProps) {
  const firstName = name.trim().split(' ')[0] || 'Booksa guest';
  const initial = name.trim().charAt(0).toUpperCase() || 'B';

  return (
    <section className="auth-panel hidden flex-col items-center text-center sm:flex">
      {avatarUrl ? (
        <img src={avatarUrl} alt="" className="h-16 w-16 rounded-full object-cover" />
      ) : (
        <div className="grid h-[57.2px] w-[57.2px] place-items-center rounded-full bg-[#fae4f3] text-lg font-semibold text-[#a51472]">
          {initial}
        </div>
      )}

      <h1 className="mt-3 text-2xl font-semibold tracking-[-0.025em]">
        Welcome back, {firstName}
      </h1>

      <p className="mt-3 flex items-center justify-center gap-2 text-[13px] text-slate-600">
        <MailRegular className="h-4 w-4" aria-hidden="true" />
        <span>{email ? maskEmail(email) : 'Email unavailable'}</span>
      </p>

      <p className="mt-8 text-xs text-slate-400">{loginNotice}</p>

      <button
        type="button"
        onClick={onLogin}
        className="mt-3 h-12 w-full rounded-button bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-primary-700)] text-[13px] font-semibold text-white shadow-sm transition hover:brightness-95 sm:h-12"
      >
        {loginLabel}
      </button>

      <button
        type="button"
        onClick={onNotYou}
        className="mt-5 text-[13px] font-medium text-slate-800 underline-offset-4 hover:underline"
      >
        {notYouLabel}
      </button>
    </section>
  );
}
