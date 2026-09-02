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
    <section className="mx-auto hidden w-full max-w-[275px] flex-col items-center pt-[92.4px] text-center sm:flex sm:max-w-[385px] sm:pt-28">
      {avatarUrl ? (
        <img src={avatarUrl} alt="" className="h-[57.2px] w-[57.2px] rounded-sm object-cover" />
      ) : (
        <div className="grid h-[57.2px] w-[57.2px] place-items-center rounded-sm bg-[#fae4f3] text-lg font-semibold text-[#a51472]">
          {initial}
        </div>
      )}

      <h1 className="mt-3 text-[22.344px] font-semibold tracking-[-0.025em]">
        Welcome back, {firstName}
      </h1>

      <p className="mt-3 flex items-center justify-center gap-2 text-[12.936px] text-slate-600">
        <MailRegular className="h-4 w-4" aria-hidden="true" />
        <span>{email ? maskEmail(email) : 'Email unavailable'}</span>
      </p>

      <p className="mt-8 text-[9.408px] text-slate-400">{loginNotice}</p>

      <button
        type="button"
        onClick={onLogin}
        className="mt-3 h-8 w-full rounded-md bg-gradient-to-r from-[#ef174f] to-[#dd0970] text-[12.936px] font-semibold text-white shadow-sm transition hover:brightness-95 sm:h-11"
      >
        {loginLabel}
      </button>

      <button
        type="button"
        onClick={onNotYou}
        className="mt-5 text-[12.936px] font-medium text-slate-800 underline-offset-4 hover:underline"
      >
        {notYouLabel}
      </button>
    </section>
  );
}
