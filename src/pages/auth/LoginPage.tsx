import { useEffect, useState } from 'react';
import {
  ChevronLeftRegular,
  HeartRegular,
  MailRegular,
  PersonFilled,
  SearchRegular
} from '@fluentui/react-icons';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import BooksaLogo from '@/components/layout/BooksaLogo';
import { LoginForm } from '@/components/forms/LoginForm';
import { RememberedUserLogin } from '@/components/auth/RememberedUserLogin';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/auth.store';
import { useAuth } from '@/hooks/useAuth';
import { firebaseAuth } from '@/services/firebase';
import { getUserProfileById } from '@/services/user.service';
import { ROUTES } from '@/utils/constants';
import googleLogo from '@/assets/images/google-logo.png';
import { SocialLoginButtons } from '@/components/auth/SocialLoginButtons';

type UserProfileData = Record<string, unknown>;

function getProfileString(profile: UserProfileData | null, ...fields: string[]) {
  for (const field of fields) {
    const value = profile?.[field];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }

  return undefined;
}

function getProfileName(profile: UserProfileData | null) {
  const name = getProfileString(profile, 'name', 'displayName');
  if (name) return name;

  const firstName = getProfileString(profile, 'firstName');
  const lastName = getProfileString(profile, 'lastName');
  return [firstName, lastName].filter(Boolean).join(' ') || undefined;
}

function maskEmail(email: string) {
  const [localPart, domain] = email.split('@');

  if (!domain) return email;

  const visibleCharacter = localPart.charAt(0);
  const hiddenCharacters = '*'.repeat(Math.max(3, localPart.length - 1));
  return `${visibleCharacter}${hiddenCharacters}@${domain}`;
}

function MobileLoginNavigation() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 grid h-20 grid-cols-3 border-t border-slate-200 bg-white/95 px-8 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl sm:hidden"
      aria-label="Mobile navigation"
    >
      <Link
        to={ROUTES.home}
        className="flex flex-col items-center justify-center gap-1 text-xs font-medium text-slate-500"
      >
        <SearchRegular className="h-5 w-5" />
        <span>Explore</span>
      </Link>
      <button
        type="button"
        className="flex flex-col items-center justify-center gap-1 text-xs font-medium text-slate-500"
      >
        <HeartRegular className="h-5 w-5" />
        <span>Wishlists</span>
      </button>
      <div className="flex flex-col items-center justify-center gap-1 text-xs font-medium text-[var(--color-primary-500)]">
        <PersonFilled className="h-5 w-5" />
        <span>Log in</span>
      </div>
    </nav>
  );
}

function MobileGoogleLogin({
  isLoading,
  error,
  onBack,
  onContinue,
  onTryAnotherWay
}: {
  isLoading: boolean;
  error: string;
  onBack: () => void;
  onContinue: () => void;
  onTryAnotherWay: () => void;
}) {
  return (
    <section className="mx-auto flex w-full max-w-lg flex-col px-5 pb-24 pt-5 sm:hidden">
      <button
        type="button"
        aria-label="Go back"
        onClick={onBack}
        className="inline-flex h-10 max-sm:h-11 max-sm:w-11 w-10 items-center justify-center rounded-full transition active:scale-95"
      >
        <ChevronLeftRegular className="h-5 w-5" aria-hidden="true" />
      </button>

      <div className="flex flex-col items-center text-center">
        <img src={googleLogo} alt="Google" className="mt-2 h-9 w-9 object-contain" />
        <h1 className="mt-3 text-[28px] font-semibold tracking-[-0.035em]">Log in with Google</h1>
        <p className="mt-1 max-w-[286px] text-md leading-[1.45] text-slate-500">
          You logged in to Booksa this way in the past.
        </p>
      </div>

      <div className="mt-12 grid gap-3">
        <button
          type="button"
          disabled={isLoading}
          onClick={onContinue}
          className="inline-flex h-11 w-full items-center justify-center gap-2.5 rounded-button bg-neutral-900 text-md font-semibold text-white transition active:scale-[0.99] disabled:cursor-wait disabled:opacity-60"
        >
          <img src={googleLogo} alt="" aria-hidden="true" className="h-4 w-4 object-contain" />
          {isLoading ? 'Connecting…' : 'Continue with Google'}
        </button>
        <button
          type="button"
          disabled={isLoading}
          onClick={onTryAnotherWay}
          className="h-11 w-full rounded-button bg-slate-100 text-md font-semibold transition active:scale-[0.99] disabled:opacity-60"
        >
          Try another way
        </button>
      </div>

      {error ? <p className="mt-3 text-center text-[13px] text-red-600" role="alert">{error}</p> : null}
    </section>
  );
}

function MobileRememberedLogin({
  name,
  email,
  avatarUrl,
  onLogin,
  onNotYou
}: {
  name: string;
  email: string;
  avatarUrl?: string;
  onLogin: () => void;
  onNotYou: () => void;
}) {
  const firstName = name.trim().split(' ')[0] || 'Booksa guest';
  const initial = name.trim().charAt(0).toUpperCase() || 'B';

  return (
    <section className="mx-auto flex w-full max-w-lg flex-col items-center px-5 pb-24 pt-12 text-center sm:hidden">
      {avatarUrl ? (
        <img src={avatarUrl} alt="" className="h-16 w-16 rounded-full object-cover" />
      ) : (
        <div className="grid h-16 w-16 place-items-center rounded-full bg-[#fae4f3] text-2xl font-semibold text-[#a51472]">
          {initial}
        </div>
      )}

      <h1 className="mt-4 text-[28px] font-semibold tracking-[-0.04em]">Welcome back, {firstName}</h1>
      <p className="mt-6 flex items-center justify-center gap-2 text-md text-slate-800">
        <MailRegular className="h-5 w-5" aria-hidden="true" />
        <span>{email ? maskEmail(email) : 'Email unavailable'}</span>
      </p>

      <p className="mt-10 text-xs text-slate-400">We may email or text you a code to log you in.</p>
      <Button
        type="button"
        onClick={onLogin}
        whileHover={{}}
        whileTap={{ scale: 0.99 }}
        className="mt-3 h-11 w-full rounded-button bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-primary-700)] text-md font-semibold text-white shadow-sm transition active:scale-[0.99]"
      >
        Log in
      </Button>
      <button
        type="button"
        onClick={onNotYou}
        className="mt-7 text-md font-semibold text-slate-800 active:opacity-60"
      >
        Not you?
      </button>
    </section>
  );
}

function MobileLoginOptions({
  identifier,
  formError,
  socialError,
  isSocialLoading,
  onIdentifierChange,
  onContinue,
  onGoogle,
  onApple
}: {
  identifier: string;
  formError: string;
  socialError: string;
  isSocialLoading: boolean;
  onIdentifierChange: (value: string) => void;
  onContinue: () => void;
  onGoogle: () => void;
  onApple: () => void;
}) {
  return (
    <section className="mx-auto flex w-full max-w-lg flex-col items-center px-5 pb-24 pt-12 sm:hidden">
      <BooksaLogo className="h-9 w-[110px]" />
      <h1 className="mt-4 text-center text-[28px] font-semibold tracking-[-0.035em]">Log in or sign up</h1>

      <form
        className="mt-7 w-full"
        onSubmit={(event) => {
          event.preventDefault();
          onContinue();
        }}
      >
        <label htmlFor="mobile-login-identifier" className="sr-only">Phone number or email</label>
        <input
          id="mobile-login-identifier"
          type="text"
          inputMode="email"
          autoComplete="username"
          value={identifier}
          onChange={(event) => onIdentifierChange(event.target.value)}
          placeholder="Phone number or email"
          aria-invalid={Boolean(formError)}
          aria-describedby={formError ? 'mobile-login-identifier-error' : undefined}
          className="h-14 w-full rounded-field border border-slate-400 bg-white px-4 text-base sm:text-md text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
        />
        {formError ? <p id="mobile-login-identifier-error" className="mt-1.5 text-xs text-red-600">{formError}</p> : null}
        <Button
          type="submit"
          whileHover={{}}
          whileTap={{ scale: 0.99 }}
          className="mt-3 h-11 w-full rounded-button bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-primary-700)] text-md font-semibold text-white shadow-sm transition active:scale-[0.99]"
        >
          Continue
        </Button>
      </form>

      <div className="my-4 flex w-full items-center gap-3 text-[13px] text-slate-600">
        <span className="h-px flex-1 bg-slate-200" />
        <span>or</span>
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <SocialLoginButtons loading={isSocialLoading} onGoogle={onGoogle} onApple={onApple} />

      {socialError ? <p className="mt-3 text-center text-xs text-red-600" role="alert">{socialError}</p> : null}
    </section>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithGoogle } = useAuth();
  const user = useAuthStore((state) => state.user);
  const lastUser = useAuthStore((state) => state.lastUser);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const forgetLastUser = useAuthStore((state) => state.forgetLastUser);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(
    () => firebaseAuth?.currentUser ?? null
  );
  const [firebaseProfile, setFirebaseProfile] = useState<UserProfileData | null>(null);
  const [hasResolvedFirebaseUser, setHasResolvedFirebaseUser] = useState(!firebaseAuth);
  const [showFullLogin, setShowFullLogin] = useState(false);
  const [showGoogleLogin, setShowGoogleLogin] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [formError, setFormError] = useState('');
  const [socialError, setSocialError] = useState('');
  const [isSocialLoading, setIsSocialLoading] = useState(false);
  const storeUserForCurrentSession = user?.id === firebaseUser?.uid ? user : null;
  const authenticatedUser = firebaseUser
    ? {
        id: firebaseUser.uid,
        name:
          firebaseUser.displayName?.trim() ||
          getProfileName(firebaseProfile) ||
          storeUserForCurrentSession?.name ||
          'Utilisateur Booksa',
        email:
          firebaseUser.email?.trim() ||
          getProfileString(firebaseProfile, 'email') ||
          storeUserForCurrentSession?.email ||
          '',
        avatarUrl:
          firebaseUser.photoURL?.trim() ||
          getProfileString(firebaseProfile, 'avatarUrl', 'photoURL', 'photoUrl') ||
          storeUserForCurrentSession?.avatarUrl
      }
    : null;
  const rememberedUser = authenticatedUser ?? (
    firebaseAuth && hasResolvedFirebaseUser ? lastUser : user ?? lastUser
  );
  const hasActiveSession = Boolean(authenticatedUser) || (!firebaseAuth && isAuthenticated);
  const requestedPath = (location.state as { from?: { pathname?: string } } | null)?.from
    ?.pathname;

  useEffect(() => {
    if (!firebaseAuth) return;

    let isActive = true;
    let profileRequestId = 0;

    const unsubscribe = onAuthStateChanged(firebaseAuth, (currentUser) => {
      const requestId = ++profileRequestId;
      setFirebaseUser(currentUser);
      setFirebaseProfile(null);
      setHasResolvedFirebaseUser(true);

      if (!currentUser) return;

      getUserProfileById(currentUser.uid)
        .then((profile) => {
          if (isActive && requestId === profileRequestId) setFirebaseProfile(profile);
        })
        .catch((error) => {
          console.error('Unable to retrieve the connected user profile.', error);
        });
    });

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, []);

  const handleGoogleLogin = async () => {
    if (isSocialLoading) return;
    setSocialError('');
    setIsSocialLoading(true);

    try {
      await loginWithGoogle();
      navigate(requestedPath ?? ROUTES.home, { replace: true });
    } catch {
      setSocialError('Google sign-in could not be completed.');
    } finally {
      setIsSocialLoading(false);
    }
  };

  const openCredentialLogin = () => {
    setShowGoogleLogin(false);
    setShowFullLogin(true);
    setShowCredentials(false);
  };

  const continueWithIdentifier = () => {
    const value = identifier.trim();
    if (!value) {
      setFormError('Enter your phone number or email.');
      return;
    }

    setFormError('');
    setShowCredentials(true);
  };

  if (rememberedUser && !showFullLogin) {
    return (
      <main className="relative flow-root min-h-screen bg-white px-0 pb-24 text-slate-900 sm:px-6">
        {showGoogleLogin ? (
          <MobileGoogleLogin
            isLoading={isSocialLoading}
            error={socialError}
            onBack={openCredentialLogin}
            onContinue={() => void handleGoogleLogin()}
            onTryAnotherWay={openCredentialLogin}
          />
        ) : (
          <MobileRememberedLogin
            name={rememberedUser.name}
            email={rememberedUser.email}
            avatarUrl={rememberedUser.avatarUrl}
            onLogin={() => {
              if (hasActiveSession) {
                navigate(requestedPath ?? ROUTES.home, { replace: true });
                return;
              }

              setIdentifier(rememberedUser.email);
              setShowGoogleLogin(true);
            }}
            onNotYou={() => {
              forgetLastUser();
              setShowGoogleLogin(false);
              setShowFullLogin(true);
              setShowCredentials(false);
            }}
          />
        )}

        <RememberedUserLogin
          name={rememberedUser.name}
          email={rememberedUser.email}
          avatarUrl={rememberedUser.avatarUrl}
          loginLabel="Log in"
          notYouLabel="Not you?"
          loginNotice="We may email or text you a code to log you in."
          onLogin={() => {
            if (hasActiveSession) {
              navigate(requestedPath ?? ROUTES.home, { replace: true });
              return;
            }

            setShowFullLogin(true);
            setIdentifier(rememberedUser.email);
            setShowCredentials(true);
          }}
          onNotYou={() => {
            forgetLastUser();
            setShowFullLogin(true);
            setShowCredentials(false);
          }}
        />

        <MobileLoginNavigation />
      </main>
    );
  }

  if (showCredentials) {
    return (
      <main className="relative flow-root min-h-screen bg-white px-6 pb-24 pt-16 text-slate-900">
        <section className="auth-panel">
          <div className="flex justify-center">
            <BooksaLogo className="h-10 w-[101.2px]" />
          </div>
          <h1 className="mt-5 text-center text-xl font-semibold tracking-[-0.025em]">
            Log in to continue
          </h1>
          <div className="mt-7 rounded-card border border-slate-200 bg-white p-5 shadow-sm">
            <LoginForm defaultEmail={identifier} />
          </div>
          <button
            type="button"
            onClick={() => setShowCredentials(false)}
            className="mx-auto mt-5 block text-[13px] font-medium text-slate-600 hover:text-slate-900"
          >
            Use another method
          </button>
        </section>
        <MobileLoginNavigation />
      </main>
    );
  }

  return (
    <main className="relative flow-root min-h-screen bg-white px-0 pb-24 text-slate-900 sm:px-6">
      <MobileLoginOptions
        identifier={identifier}
        formError={formError}
        socialError={socialError}
        isSocialLoading={isSocialLoading}
        onIdentifierChange={(value) => {
          setIdentifier(value);
          if (formError) setFormError('');
        }}
        onContinue={continueWithIdentifier}
        onGoogle={() => void handleGoogleLogin()}
        onApple={() => setSocialError('Apple sign-in is not available yet.')}
      />

      <section className="auth-panel hidden flex-col items-center sm:flex">
        <BooksaLogo className="h-8 w-[74.8px]" />

        <h1 className="mt-4 text-center text-2xl font-semibold tracking-[-0.025em]">
          Log in or sign up
        </h1>

        <form
          className="mt-6 w-full"
          onSubmit={(event) => {
            event.preventDefault();
            continueWithIdentifier();
          }}
        >
          <label htmlFor="login-identifier" className="sr-only">
            Phone number or email
          </label>
          <input
            id="login-identifier"
            type="text"
            inputMode="email"
            autoComplete="username"
            value={identifier}
            onChange={(event) => {
              setIdentifier(event.target.value);
              if (formError) setFormError('');
            }}
            placeholder="Phone number or email"
            aria-invalid={Boolean(formError)}
            aria-describedby={formError ? 'login-identifier-error' : undefined}
            className="h-14 w-full rounded-field border border-slate-400 bg-white px-4 text-base text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 sm:h-14"
          />
          {formError ? (
            <p id="login-identifier-error" className="mt-1.5 text-xs text-red-600">
              {formError}
            </p>
          ) : null}

          <Button
            type="submit"
            size="lg"
            className="mt-3 w-full rounded-button"
          >
            Continue
          </Button>
        </form>

        <div className="my-3 flex w-full items-center gap-3 text-xs text-slate-600">
          <span className="h-px flex-1 bg-slate-200" />
          <span>or</span>
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <SocialLoginButtons
          loading={isSocialLoading}
          onGoogle={() => void handleGoogleLogin()}
          onApple={() => setSocialError('Apple sign-in is not available yet.')}
        />

        {socialError ? (
          <p className="mt-3 text-center text-xs text-red-600" role="alert">
            {socialError}
          </p>
        ) : null}
      </section>

      <MobileLoginNavigation />
    </main>
  );
}
