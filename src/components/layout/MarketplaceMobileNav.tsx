import { useEffect, useRef, useState } from 'react';
import { CircleUserRound, Luggage, MessageSquare, Heart, User, Search } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { ROUTES } from '@/utils/constants';

export default function MarketplaceMobileNav() {
  const [isVisible, setIsVisible] = useState(true);
  const previousScrollY = useRef(0);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();
  const isProfile = location.pathname === ROUTES.hostProfile;
  const isMessages = location.pathname === ROUTES.messages;
  const isTrips = location.pathname === ROUTES.trips;
  const isExplore =
    location.pathname === ROUTES.home ||
    location.pathname === ROUTES.homes ||
    location.pathname === ROUTES.experiences ||
    location.pathname === ROUTES.services ||
    location.pathname === ROUTES.seeAll ||
    location.pathname === ROUTES.seeAllMap;

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = Math.max(window.scrollY, 0);
      const difference = currentScrollY - previousScrollY.current;

      if (currentScrollY < 24 || difference < -4) {
        setIsVisible(true);
      } else if (difference > 4) {
        setIsVisible(false);
      }

      previousScrollY.current = currentScrollY;
    };

    setIsVisible(true);
    previousScrollY.current = Math.max(window.scrollY, 0);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  return (
    <nav
      className={`fixed inset-x-0 bottom-0 z-40 grid h-[calc(64px+env(safe-area-inset-bottom))] border-t border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface)_95%,transparent)] pb-[env(safe-area-inset-bottom)] backdrop-blur-xl transition-transform duration-300 motion-reduce:transition-none sm:hidden ${
        isAuthenticated ? 'grid-cols-5 px-2' : 'grid-cols-3 px-8'
      } ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}
      aria-label="Mobile marketplace navigation"
      aria-hidden={!isVisible}
      style={{ visibility: isVisible ? 'visible' : 'hidden' }}
    >
      <Link
        to={ROUTES.home}
        className={`flex flex-col items-center justify-center gap-1 px-1 text-[11px] font-medium leading-4 ${
          isExplore ? 'font-semibold text-[var(--color-primary-500)]' : 'text-[var(--color-text-secondary)]'
        }`}
        aria-current={isExplore ? 'page' : undefined}
      >
        <Search className="h-5 w-5" aria-hidden="true" />
        <span>Explore</span>
      </Link>

      <button
        type="button"
        className="flex flex-col items-center justify-center gap-1 px-1 text-[11px] font-medium leading-4 text-[var(--color-text-secondary)]"
      >
        <Heart className="h-5 w-5" aria-hidden="true" />
        <span>Wishlists</span>
      </button>

      {isAuthenticated ? (
        <>
          <Link
            to={ROUTES.trips}
            className={`flex flex-col items-center justify-center gap-1 px-1 text-[11px] font-medium leading-4 ${
              isTrips ? 'font-semibold text-[var(--color-primary-500)]' : 'text-[var(--color-text-secondary)]'
            }`}
            aria-current={isTrips ? 'page' : undefined}
          >
            <Luggage className="h-5 w-5 stroke-[1.5]" />
            <span>Trips</span>
          </Link>
          <Link
            to={ROUTES.messages}
            className={`flex flex-col items-center justify-center gap-1 px-1 text-[11px] font-medium leading-4 ${
              isMessages ? 'font-semibold text-[var(--color-primary-500)]' : 'text-[var(--color-text-secondary)]'
            }`}
            aria-current={isMessages ? 'page' : undefined}
          >
            <MessageSquare className="h-5 w-5 stroke-[1.5]" />
            <span>Messages</span>
          </Link>
          <Link
            to={ROUTES.hostProfile}
            className={`flex flex-col items-center justify-center gap-1 px-1 text-[11px] font-medium leading-4 ${
              isProfile ? 'font-semibold text-[var(--color-primary-500)]' : 'text-[var(--color-text-secondary)]'
            }`}
            aria-current={isProfile ? 'page' : undefined}
          >
            <CircleUserRound className="h-5 w-5 stroke-[1.5]" />
            <span>Profile</span>
          </Link>
        </>
      ) : (
        <Link
          to={ROUTES.login}
          className="flex flex-col items-center justify-center gap-1 px-1 text-[11px] font-medium leading-4 text-[var(--color-text-secondary)]"
        >
          <User className="h-5 w-5" aria-hidden="true" />
          <span>Log in</span>
        </Link>
      )}
    </nav>
  );
}
