import { useEffect, useRef, useState } from 'react';
import { HeartRegular, PersonRegular, SearchRegular } from '@fluentui/react-icons';
import { CircleUserRound, Luggage, MessageSquare } from 'lucide-react';
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
    location.pathname === ROUTES.seeAll;

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

    previousScrollY.current = Math.max(window.scrollY, 0);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed inset-x-0 bottom-0 z-40 grid h-[72.6px] border-t border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface)_95%,transparent)] pb-[env(safe-area-inset-bottom)] backdrop-blur-xl transition-transform duration-300 sm:hidden ${
        isAuthenticated ? 'grid-cols-5 px-2' : 'grid-cols-3 px-8'
      } ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}
      aria-label="Mobile marketplace navigation"
      aria-hidden={!isVisible}
    >
      <Link
        to={ROUTES.home}
        className={`flex flex-col items-center justify-center gap-1 text-[10.584px] font-medium ${
          isExplore ? 'font-semibold text-[var(--color-primary-500)]' : 'text-[var(--color-text-secondary)]'
        }`}
        aria-current={isExplore ? 'page' : undefined}
      >
        <SearchRegular className="h-2.5 w-2.5" />
        <span>Explore</span>
      </Link>

      <button
        type="button"
        className="flex flex-col items-center justify-center gap-1 text-[10.584px] font-medium text-[var(--color-text-secondary)]"
      >
        <HeartRegular className="h-5 w-5" />
        <span>Wishlists</span>
      </button>

      {isAuthenticated ? (
        <>
          <Link
            to={ROUTES.trips}
            className={`flex flex-col items-center justify-center gap-1 text-[10.584px] font-medium ${
              isTrips ? 'font-semibold text-[var(--color-primary-500)]' : 'text-[var(--color-text-secondary)]'
            }`}
            aria-current={isTrips ? 'page' : undefined}
          >
            <Luggage className={`h-5 w-5 ${isTrips ? 'stroke-[2.4]' : 'stroke-[1.7]'}`} />
            <span>Trips</span>
          </Link>
          <Link
            to={ROUTES.messages}
            className={`flex flex-col items-center justify-center gap-1 text-[10.584px] font-medium ${
              isMessages ? 'font-semibold text-[var(--color-primary-500)]' : 'text-[var(--color-text-secondary)]'
            }`}
            aria-current={isMessages ? 'page' : undefined}
          >
            <MessageSquare className={`h-5 w-5 ${isMessages ? 'stroke-[2.4]' : 'stroke-[1.7]'}`} />
            <span>Messages</span>
          </Link>
          <Link
            to={ROUTES.hostProfile}
            className={`flex flex-col items-center justify-center gap-1 text-[10.584px] font-medium ${
              isProfile ? 'font-semibold text-[var(--color-primary-500)]' : 'text-[var(--color-text-secondary)]'
            }`}
            aria-current={isProfile ? 'page' : undefined}
          >
            <CircleUserRound className={`h-5 w-5 ${isProfile ? 'stroke-[2.4]' : 'stroke-[1.7]'}`} />
            <span>Profile</span>
          </Link>
        </>
      ) : (
        <Link
          to={ROUTES.login}
          className="flex flex-col items-center justify-center gap-1 text-[10.584px] font-medium text-[var(--color-text-secondary)]"
        >
          <PersonRegular className="h-5 w-5" />
          <span>Log in</span>
        </Link>
      )}
    </nav>
  );
}
