import { useState } from 'react';
import { FiMenu, FiMessageSquare } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bell,
  ChevronRight,
  CircleHelp,
  FileText,
  Gift,
  Hand,
  LogOut,
  Repeat2,
  Settings,
  UserRound,
  UserRoundPlus,
  UsersRound,
  type LucideIcon
} from 'lucide-react';
import BooksaLogo from '@/components/layout/BooksaLogo';
import { HostAccountDrawer } from '@/components/layout/HostAccountDrawer';
import MarketplaceMobileNav from '@/components/layout/MarketplaceMobileNav';
import { ThreeDIcon } from '@/components/ui/ThreeDIcon';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/utils/constants';

const profileNavigation = [
  { icon: '●', label: 'À propos de moi' },
  { icon: '🧳', label: 'Voyages passés' },
  { icon: '🧑‍🤝‍🧑', label: 'Relations' }
] as const;

const hostNavigation = ['Aujourd’hui', 'Calendrier', 'Annonces', 'Messages'] as const;

type ProfileMenuItem = {
  label: string;
  icon: LucideIcon;
  action?: 'account' | 'profile' | 'logout';
};

const primaryProfileMenu: ProfileMenuItem[] = [
  { label: 'Account settings', icon: Settings, action: 'account' },
  { label: 'View profile', icon: UserRound, action: 'profile' },
  { label: 'Privacy', icon: Hand, action: 'account' },
  { label: 'Get help', icon: CircleHelp }
];

const secondaryProfileMenu: ProfileMenuItem[] = [
  { label: 'Refer a host', icon: UserRoundPlus },
  { label: 'Find a co-host', icon: UsersRound },
  { label: 'Gift cards', icon: Gift },
  { label: 'Legal', icon: FileText },
  { label: 'Log out', icon: LogOut, action: 'logout' }
];

export default function HostProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [displayName, setDisplayName] = useState(user?.name ?? 'Hôte Booksa');
  const [draftName, setDraftName] = useState(displayName);
  const initial = displayName.trim().charAt(0).toUpperCase() || 'H';

  const openHostSection = (item: (typeof hostNavigation)[number]) => {
    if (item === 'Annonces') {
      navigate(ROUTES.hostListingSetup);
      return;
    }

    navigate(ROUTES.hostListings, {
      state: item === 'Messages' ? { section: 'Messages' } : undefined
    });
  };

  const saveProfile = () => {
    const nextName = draftName.trim();
    if (nextName) setDisplayName(nextName);
    setIsEditing(false);
  };

  const handleMobileMenuItem = (item: ProfileMenuItem) => {
    if (item.action === 'account') {
      navigate(ROUTES.hostAccountSettings);
      return;
    }

    if (item.action === 'profile') {
      setIsEditing(true);
      return;
    }

    if (item.action === 'logout') {
      void logout();
    }
  };

  const renderMobileMenu = (items: ProfileMenuItem[]) => (
    <div className="divide-y divide-transparent">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <button
            key={item.label}
            type="button"
            onClick={() => handleMobileMenuItem(item)}
            className="flex min-h-[46.2px] w-full items-center gap-4 text-left text-[14.112px] text-slate-800"
          >
            <Icon className="h-[19.8px] w-[19.8px] shrink-0 stroke-[1.6]" aria-hidden="true" />
            <span className="flex-1">{item.label}</span>
            {item.action !== 'logout' ? (
              <ChevronRight className="h-4 w-4 text-slate-400" aria-hidden="true" />
            ) : null}
          </button>
        );
      })}
    </div>
  );

  return (
    <main className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)]">
      <section className="min-h-screen bg-white px-5 pb-36 pt-7 text-slate-900 lg:hidden">
        <div className="mx-auto max-w-[429px]">
          <div className="flex items-center justify-between">
            <h1 className="text-[28.224px] font-semibold tracking-[-0.035em]">Profile</h1>
            <button
              type="button"
              aria-label="Notifications"
              className="grid h-9 w-9 place-items-center rounded-md bg-slate-50 text-slate-700"
            >
              <Bell className="h-4 w-4 stroke-[1.7]" />
            </button>
          </div>

          <article className="mt-4 flex min-h-[191.4px] flex-col items-center justify-center rounded-sm bg-white px-5 py-6 text-center shadow-[0_8px_28px_rgba(15,23,42,0.10)]">
            <div className="grid h-20 w-20 place-items-center rounded-sm bg-[#f8e0f2] text-[32.928px] font-semibold text-[#9c187c]">
              {initial}
            </div>
            <h2 className="mt-2 text-[27.048px] font-semibold leading-none tracking-[-0.035em]">{displayName.split(' ')[0]}</h2>
            <p className="mt-1 text-[10.584px] text-slate-500">Guest</p>
          </article>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <button type="button" className="relative flex min-h-[136.4px] flex-col items-center justify-center rounded-md bg-white px-3 py-4 shadow-[0_7px_22px_rgba(15,23,42,0.09)]">
              <span className="absolute right-2 top-2 rounded-sm bg-slate-600 px-1.5 py-0.5 text-[7.056px] font-semibold text-white">NEW</span>
              <ThreeDIcon name="pastTrips" sourceSize={100} className="h-14 w-14 object-contain" />
              <span className="mt-2 text-[12.936px] font-medium">Past trips</span>
            </button>
            <button type="button" className="relative flex min-h-[136.4px] flex-col items-center justify-center rounded-md bg-white px-3 py-4 shadow-[0_7px_22px_rgba(15,23,42,0.09)]">
              <span className="absolute right-2 top-2 rounded-sm bg-slate-600 px-1.5 py-0.5 text-[7.056px] font-semibold text-white">NEW</span>
              <ThreeDIcon name="connectionPerson" sourceSize={100} className="h-14 w-14 object-contain" />
              <span className="mt-2 text-[12.936px] font-medium">Connections</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => navigate(ROUTES.hostListingSetup)}
            className="mt-3 flex min-h-[79.2px] w-full items-center gap-4 rounded-md bg-white px-5 text-left shadow-[0_7px_22px_rgba(15,23,42,0.09)]"
          >
            <ThreeDIcon name="hostPerson" sourceSize={100} className="h-12 w-12 shrink-0 object-contain" />
            <span>
              <span className="block text-[14.112px] font-semibold">Become a host</span>
              <span className="mt-0.5 block text-[9.408px] leading-3 text-slate-500">It&apos;s easy to start hosting and earn extra income.</span>
            </span>
          </button>

          <div className="mt-4 border-b border-slate-100 pb-3">
            {renderMobileMenu(primaryProfileMenu)}
          </div>
          <div className="pt-3">
            {renderMobileMenu(secondaryProfileMenu)}
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate(ROUTES.hostListings)}
          className="fixed bottom-[85.8px] left-1/2 z-30 flex h-11 -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-md bg-slate-900 px-7 text-[12.936px] font-medium text-white shadow-lg"
        >
          <Repeat2 className="h-4 w-4" aria-hidden="true" />
          Switch to hosting
        </button>
        <MarketplaceMobileNav />
      </section>

      <header className="hidden border-b border-[var(--color-border)] bg-[var(--color-surface)] lg:block">
        <div className="mx-auto flex min-h-[103.4px] max-w-[1540px] items-center justify-between gap-5 px-5 sm:px-8 lg:px-12">
          <button type="button" onClick={() => navigate(ROUTES.hostListings)} aria-label="Accueil hôte Booksa">
            <BooksaLogo className="h-10 w-[118.8px]" />
          </button>

          <nav aria-label="Navigation hôte" className="hidden items-center gap-8 md:flex">
            {hostNavigation.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => openHostSection(item)}
                className="border-b border-transparent py-2 text-sm text-[var(--color-text-secondary)] transition hover:border-[var(--color-text-primary)] hover:text-[var(--color-text-primary)]"
              >
                {item}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(ROUTES.home)}
              className="hidden text-sm font-semibold transition hover:opacity-70 sm:block"
            >
              Passer en mode voyageur
            </button>
            <button
              type="button"
              aria-label={`Profil de ${displayName}`}
              className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-[var(--color-primary-100)] text-sm font-semibold text-[var(--color-primary-700)]"
            >
              {initial}
            </button>
            <div>
              <button
                type="button"
                aria-label="Menu du compte"
                aria-expanded={isMenuOpen}
                onClick={() => setIsMenuOpen((open) => !open)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-[var(--color-surface-muted)]"
              >
                <FiMenu className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </header>
      <HostAccountDrawer open={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <div className="mx-auto hidden min-h-[calc(100vh-95px)] max-w-[1364px] lg:grid lg:grid-cols-[390px_1fr]">
        <aside className="border-b border-[var(--color-border)] px-5 py-8 sm:px-8 lg:border-b-0 lg:border-r lg:px-12 lg:py-10">
          <h1 className="text-[31.61088px] font-semibold tracking-tight">Profil</h1>
          <nav aria-label="Sections du profil" className="mt-6 flex gap-2 overflow-x-auto lg:flex-col">
            {profileNavigation.map((item, index) => (
              <button
                key={item.label}
                type="button"
                className={`flex min-w-fit items-center gap-4 rounded-md px-5 py-4 text-left font-semibold transition lg:w-full ${
                  index === 0 ? 'bg-[var(--color-surface-muted)]' : 'hover:bg-[var(--color-surface-muted)]'
                }`}
              >
                <span
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-sm text-lg ${
                    index === 0
                      ? 'bg-[var(--color-primary-100)] text-sm text-[var(--color-primary-700)]'
                      : ''
                  }`}
                  aria-hidden="true"
                >
                  {index === 0 ? initial : item.icon}
                </span>
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="px-5 py-8 sm:px-10 lg:px-16 lg:py-10"
        >
          <div className="flex items-center gap-5">
            <h2 className="text-[31.61088px] font-semibold tracking-tight">À propos de moi</h2>
            <button
              type="button"
              onClick={() => setIsEditing((editing) => !editing)}
              className="rounded-md bg-[var(--color-surface-muted)] px-4 py-2 text-sm font-semibold"
            >
              {isEditing ? 'Annuler' : 'Modifier'}
            </button>
          </div>

          <div className="mt-6 grid gap-8 xl:grid-cols-[minmax(280px,345px)_1fr] xl:items-center">
            <article className="flex min-h-[253px] flex-col items-center justify-center rounded-sm bg-[var(--color-surface)] p-6 text-center shadow-[var(--shadow-lg)]">
              <span className="inline-flex h-28 w-28 items-center justify-center rounded-sm bg-[var(--color-primary-100)] text-4xl font-semibold text-[var(--color-primary-700)]">
                {initial}
              </span>
              {isEditing ? (
                <div className="mt-4 flex w-full max-w-[264px] gap-2">
                  <input
                    value={draftName}
                    onChange={(event) => setDraftName(event.target.value)}
                    aria-label="Nom affiché"
                    className="min-w-0 flex-1 rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-center font-semibold outline-none"
                  />
                  <button
                    type="button"
                    onClick={saveProfile}
                    className="rounded-md bg-[var(--color-primary-500)] px-3 py-2 text-sm font-semibold text-white hover:bg-[var(--color-primary-600)]"
                  >
                    Enregistrer
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="mt-4 text-[29.6352px] font-semibold leading-none">{displayName}</h3>
                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Hôte</p>
                </>
              )}
            </article>

            <div className="max-w-sm">
              <h3 className="text-2xl font-semibold">Complétez votre profil</h3>
              <p className="mt-4 text-sm leading-5 text-[var(--color-text-secondary)]">
                Votre profil Booksa joue un rôle important dans chaque réservation. Complétez-le pour permettre aux autres hôtes et voyageurs de mieux vous connaître.
              </p>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="mt-6 rounded-md bg-[var(--color-primary-500)] px-6 py-3.5 font-semibold text-white transition hover:bg-[var(--color-primary-600)]"
              >
                Commencer
              </button>
            </div>
          </div>

          <div className="mt-10 border-t border-[var(--color-border)] pt-10">
            <button type="button" className="flex items-center gap-4 text-left transition hover:opacity-70">
              <FiMessageSquare className="h-6 w-6" aria-hidden="true" />
              <span>Afficher les commentaires que j’ai rédigés</span>
            </button>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
