import { SearchDialog } from "@/components/home/SearchDialog";
import BooksaLogo from "./BooksaLogo";
import {
  CircleHelp,
  CircleUserRound,
  House,
  Menu,
  Search,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useId, useRef, useState } from "react";
import { useTheme } from "@/theme/useTheme";
import { ROUTES } from "@/utils/constants";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/language/LanguageSwitcher";
import { AccountLoginDialog } from "@/components/auth/AccountLoginDialog";
import { firebaseAuth } from "@/services/firebase";
import MarketplaceMobileNav from "@/components/layout/MarketplaceMobileNav";

type NavigationItem = {
  label: string;
  labelKey: "all" | "hotel" | "room" | "restaurant";
  emoji: string;
  path: string;
  badge?: string;
};

const navigationItems: NavigationItem[] = [
  {
    label: "All",
    labelKey: "all",
    emoji: "🏆",
    path: ROUTES.home,
  },
  {
    label: "Hotel",
    labelKey: "hotel",
    emoji: "🏠",
    path: ROUTES.homes,
  },
  {
    label: "Room",
    labelKey: "room",
    emoji: "🛏️",
    path: ROUTES.rooms,
  },
  {
    label: "Restaurant",
    labelKey: "restaurant",
    emoji: "🛎️",
    path: ROUTES.restaurants,
  },
] as const;

const activeTabUnderline = {
  type: "spring",
  stiffness: 520,
  damping: 34,
  mass: 0.8,
} as const;

const DESKTOP_HEADER_EXPANDED_HEIGHT = 200;
const DESKTOP_HEADER_COLLAPSED_HEIGHT = 80;
const DESKTOP_HEADER_COLLAPSE_OFFSET = 40;

// Emoji glyphs carry their own colors, so inactive tabs are muted with
// grayscale + opacity instead of the text color used by lucide icons.
function CategoryEmoji({
  emoji,
  isActive,
  className = "",
}: {
  emoji: string;
  isActive: boolean;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block select-none leading-none transition duration-200 group-hover:opacity-100 group-hover:grayscale-0 ${
        isActive ? "" : "opacity-70 grayscale"
      } ${className}`}
    >
      {emoji}
    </span>
  );
}

function isNavigationItemActive(item: NavigationItem, pathname: string) {
  return item.label === "All"
    ? pathname === ROUTES.home
    : item.path !== ROUTES.home && pathname === item.path;
}

type SearchSegment = {
  id: "where" | "when" | "who";
  labelKey: "where" | "when" | "who";
  valueKey: "searchDestinations" | "addDates" | "addGuests" | "anywhere" | "anytime";
};

const searchSegments: SearchSegment[] = [
  { id: "where", labelKey: "where", valueKey: "searchDestinations" },
  { id: "when", labelKey: "when", valueKey: "addDates" },
  { id: "who", labelKey: "who", valueKey: "addGuests" },
];

const compactSearchSegments: SearchSegment[] = [
  { id: "where", labelKey: "where", valueKey: "anywhere" },
  { id: "when", labelKey: "when", valueKey: "anytime" },
  { id: "who", labelKey: "who", valueKey: "addGuests" },
];

// Segmented search pill: each segment highlights on its own, and the
// dividers on either side of the hovered/focused segment fade out so the
// highlight reads as one continuous shape.
function SearchField({ collapsed = false, onSearch }: { collapsed?: boolean; onSearch: (section: "where" | "when" | "who") => void }) {
  const { theme } = useTheme();
  const { t } = useTranslation("navigation");
  const isCompact = collapsed;
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const segments = isCompact ? compactSearchSegments : searchSegments;
  const lastIndex = segments.length - 1;

  return (
    <motion.div
      role="search"
      aria-label={t("searchAll")}
      layout
      animate={{
        width: "100%",
        maxWidth: isCompact ? 376 : 850,
        height: isCompact ? 48 : 66,
      }}
      transition={{ type: "spring", stiffness: 260, damping: 30, mass: 1 }}
      className="booksa-header-search flex min-h-0 w-full items-center rounded-full border transition-shadow hover:shadow-[var(--shadow-md)]"
      style={{
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
      }}
      onMouseLeave={() => setActiveIndex(null)}
    >
      <div className={`flex h-full w-full items-center ${isCompact ? "p-[3px]" : ""}`}>
        {segments.map((segment, index) => {
          const isLast = index === lastIndex;
          const hideDivider =
            isLast || activeIndex === index || activeIndex === index + 1;
          const label = t(segment.labelKey);
          const value = t(segment.valueKey);

          return (
            <div key={segment.id} className="flex h-full min-w-0 flex-1 items-center">
              <div
                className={`flex h-full min-w-0 flex-1 items-center rounded-full transition-colors duration-150 hover:bg-[var(--color-surface-muted)] ${
                  isLast ? (isCompact ? "pr-[2px]" : "pr-2") : ""
                }`}
                onMouseEnter={() => setActiveIndex(index)}
                onFocus={() => setActiveIndex(index)}
                onBlur={() => setActiveIndex(null)}
              >
                <button
                  type="button"
                  aria-label={`${label}: ${value}`}
                  onClick={() => onSearch(segment.id)}
                  className={`flex h-full min-w-0 flex-1 cursor-pointer items-center rounded-full text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--color-text-primary)] ${
                    isCompact ? "justify-center gap-1.5 px-3" : "flex-col items-start justify-center px-6"
                  }`}
                >
                  {isCompact ? (
                    <>
                      {index === 0 ? (
                        <House className="h-5 w-5 shrink-0" aria-hidden="true" />
                      ) : null}
                      <span
                        className="truncate text-[12px] font-semibold leading-none"
                        style={{ color: theme.colors.textPrimary }}
                      >
                        {value}
                      </span>
                    </>
                  ) : (
                    <>
                      <span
                        className="text-xs font-semibold"
                        style={{ color: theme.colors.textPrimary }}
                      >
                        {label}
                      </span>
                      <span
                        className="mt-0.5 w-full truncate text-sm"
                        style={{ color: theme.colors.textSecondary }}
                      >
                        {value}
                      </span>
                    </>
                  )}
                </button>

                {isLast ? (
                  <button
                    type="button"
                    aria-label={t("searchAll")}
                    onClick={() => onSearch("where")}
                    className={`inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full text-white transition-transform duration-150 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-text-primary)] ${
                      isCompact ? "h-[38px] w-[38px]" : "h-12 w-12"
                    }`}
                    style={{ backgroundColor: theme.colors.primary[500] }}
                  >
                    <Search
                      className={isCompact ? "h-[15px] w-[15px]" : "h-[18px] w-[18px]"}
                      aria-hidden="true"
                    />
                  </button>
                ) : null}
              </div>

              {!isLast ? (
                <span
                  className={`w-px shrink-0 transition-opacity duration-150 ${
                    isCompact ? "h-6" : "h-8"
                  } ${hideDivider ? "opacity-0" : "opacity-100"}`}
                  aria-hidden="true"
                  style={{ backgroundColor: theme.colors.border }}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

function HeaderMenu({
  compact = false,
  onLogin,
  onHostAccess,
}: {
  compact?: boolean;
  onLogin: () => void;
  onHostAccess: () => void;
}) {
  const { theme } = useTheme();
  const { t } = useTranslation("navigation");
  const [isOpen, setIsOpen] = useState(false);
  const menuId = useId();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleMouseDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const openLogin = () => {
    setIsOpen(false);
    onLogin();
  };

  const openHostListings = () => {
    setIsOpen(false);
    onHostAccess();
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-label={t("menu")}
        aria-controls={menuId}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={() => setIsOpen((open) => !open)}
        className={`inline-flex items-center justify-center rounded-full transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 ${
          compact ? "h-10 max-sm:h-11 max-sm:w-11 w-10" : "h-10 w-10"
        }`}
        style={{
          backgroundColor: theme.colors.surfaceMuted,
          color: theme.colors.textPrimary,
          "--tw-ring-color": theme.colors.primary[500],
        } as React.CSSProperties}
      >
        <Menu className="h-4 w-4" aria-hidden="true" />
      </button>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            id={menuId}
            role="menu"
            aria-label={t("accountMenu")}
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute right-0 top-full z-50 mt-3 w-72 max-w-[calc(100vw-32px)] overflow-hidden rounded-menu border py-2 text-left shadow-[var(--shadow-lg)]"
            style={{
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              color: theme.colors.textPrimary,
            }}
          >
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-3 px-5 py-3 text-md transition hover:opacity-70"
            >
              <CircleHelp className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span>{t("helpCenter")}</span>
            </button>

            <div className="mx-5 h-px" style={{ backgroundColor: theme.colors.border }} />

            <button
              type="button"
              role="menuitem"
              onClick={openHostListings}
              className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left transition hover:opacity-75"
            >
              <span className="min-w-0">
                <span className="block text-md font-semibold leading-5">{t("becomeHost")}</span>
                <span
                  className="mt-0.5 block text-xs leading-4"
                  style={{ color: theme.colors.textSecondary }}
                >
                  It&apos;s easy to start hosting and earn extra income.
                </span>
              </span>
              <span className="shrink-0 text-3xl leading-none" aria-hidden="true">
                🧑‍💼
              </span>
            </button>

            <div className="mx-5 h-px" style={{ backgroundColor: theme.colors.border }} />

            {["Refer a Host", "Find a co-host", "Gift cards"].map((label) => (
              <button
                key={label}
                type="button"
                role="menuitem"
                className="block w-full px-5 py-2.5 text-left text-md transition hover:opacity-70"
              >
                {label}
              </button>
            ))}

            <div className="mx-5 my-1 h-px" style={{ backgroundColor: theme.colors.border }} />

            <button
              type="button"
              role="menuitem"
              onClick={openLogin}
              className="block w-full px-5 py-3 text-left text-md transition hover:opacity-70"
            >
              Log in or sign up
            </button>
            <div className="mt-1 border-t border-[var(--color-border)] px-5 pt-3 pb-1">
              <LanguageSwitcher compact />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function CompactMobileHeader({ onSearch }: { onSearch: () => void }) {
  const { theme } = useTheme();
  const { t } = useTranslation("navigation");
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-[1540px] pb-3 pt-3 lg:hidden">
      <div className="px-4">
      <button
        type="button"
        aria-label={t("searchAll")}
        onClick={onSearch}
        className="mx-auto flex min-h-11 w-full max-w-[462px] items-center justify-center gap-2 rounded-full border px-4 py-[calc(var(--spacing)*3.9)] text-sm font-semibold shadow-[0_3px_14px_rgba(15,23,42,0.12)]"
        style={{
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          color: theme.colors.textPrimary,
        }}
      >
        <Search
          className="h-5 w-5 shrink-0"
          aria-hidden="true"
          style={{ color: theme.colors.textPrimary }}
        />
        <span>{t("startSearch")}</span>
      </button>
      </div>

      <nav
        aria-label={t("primary")}
        className="mt-3 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {navigationItems.map((item) => {
          const isActive = isNavigationItemActive(item, location.pathname);

          return (
            <button
              key={t(item.labelKey)}
              type="button"
              aria-current={isActive ? "page" : undefined}
              className="group relative flex h-12 shrink-0 cursor-pointer items-center gap-2 rounded-button border-b-2 px-2"
              onClick={() => navigate(item.path)}
              style={{
                backgroundColor: theme.colors.surface,
                borderColor: isActive ? theme.colors.textPrimary : "transparent",
                color: isActive
                  ? theme.colors.textPrimary
                  : theme.colors.textSecondary,
              }}
            >
              <span className="relative inline-flex items-center justify-center">
                <CategoryEmoji emoji={item.emoji} isActive={isActive} className="text-xl" />
                {item.badge ? (
                  <span
                    className="absolute -right-5 -top-2 rounded-full px-1.5 py-0.5 text-xs font-bold tracking-[0.14em] text-white shadow-sm"
                    style={{ backgroundColor: theme.colors.textPrimary }}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </span>

              <span className="text-sm font-semibold leading-none">
                {t(item.labelKey)}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default function BooksaHeader({ showMobileNavigation = true }: { showMobileNavigation?: boolean }) {
  const { theme } = useTheme();
  const { t } = useTranslation("navigation");
  const { isAuthenticated, user, clearUser } = useAuth();
  const [checkingSession, setCheckingSession] = useState(false);
  const [failedAvatar, setFailedAvatar] = useState<string | null>(null);
  const sessionCheck = useRef(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(
    () => typeof window !== "undefined" && window.scrollY > DESKTOP_HEADER_COLLAPSE_OFFSET,
  );
  const [searchSection, setSearchSection] = useState<"where" | "when" | "who" | null>(null);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [authDestination, setAuthDestination] = useState<string | null>(null);

  useEffect(() => {
    const updateHeaderState = () => {
      setIsCollapsed(window.scrollY > DESKTOP_HEADER_COLLAPSE_OFFSET);
    };

    updateHeaderState();
    window.addEventListener("scroll", updateHeaderState, { passive: true });

    return () => window.removeEventListener("scroll", updateHeaderState);
  }, []);

  function handleNavigate(path: string) {
    setIsCollapsed(false);
    window.scrollTo({ top: 0, behavior: "auto" });
    navigate(path);
  }

  function openLogin(destination: string | null = null) {
    setAuthDestination(destination);
    setIsLoginDialogOpen(true);
  }

  async function handleAccountAccess() {
    if (sessionCheck.current) return;
    sessionCheck.current = true;
    setCheckingSession(true);
    try {
      await firebaseAuth?.authStateReady();
      const currentUser = firebaseAuth?.currentUser;
      if (!currentUser) throw new Error('No active session');
      await currentUser.getIdToken();
      if (firebaseAuth?.currentUser?.uid !== currentUser.uid) throw new Error('Session changed');
      navigate(ROUTES.hostProfile);
    } catch {
      clearUser();
      openLogin(ROUTES.hostProfile);
    } finally {
      sessionCheck.current = false;
      setCheckingSession(false);
    }
  }

  function handleHostAccess() {
    if (isAuthenticated) {
      navigate(ROUTES.hostListings);
      return;
    }

    openLogin(ROUTES.hostListings);
  }

  function handleAuthenticated() {
    setIsLoginDialogOpen(false);

    if (authDestination) {
      navigate(authDestination);
    }

    setAuthDestination(null);
  }

  return (
    <header
      className={`booksa-marketplace-header sticky top-0 z-30 border-b transition-shadow duration-300 ${
        isCollapsed ? "shadow-[0_2px_12px_rgba(15,23,42,0.08)]" : "shadow-none"
      }`}
      style={{
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
      }}
    >
      <motion.div
        className="marketplace-reference-container mx-auto hidden overflow-visible lg:block"
        animate={{
          height: isCollapsed
            ? DESKTOP_HEADER_COLLAPSED_HEIGHT
            : DESKTOP_HEADER_EXPANDED_HEIGHT,
          paddingTop: isCollapsed ? 0 : 24,
        }}
        initial={false}
        transition={{ type: "spring", stiffness: 280, damping: 32, mass: 0.9 }}
      >
        <motion.div
          className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-4 xl:gap-6"
          animate={{
            alignItems: "center",
            height: isCollapsed ? 80 : 52,
          }}
          transition={{ type: "spring", stiffness: 280, damping: 32, mass: 0.9 }}
        >
          <BooksaLogo className="h-10 w-[104px] justify-self-start" />

          <AnimatePresence mode="wait" initial={false}>
            {isCollapsed ? (
              <motion.div
                key="compact-search"
                className="w-[376px]"
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                <SearchField collapsed onSearch={setSearchSection} />
              </motion.div>
            ) : (
              <motion.nav
                key="category-navigation"
                aria-label={t("primary")}
                className="flex h-full items-center justify-center gap-5 xl:gap-8"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                {navigationItems.map((item) => {
                  const isActive = isNavigationItemActive(item, location.pathname);
                  return (
                    <button
                      key={t(item.labelKey)}
                      type="button"
                      aria-current={isActive ? "page" : undefined}
                      className="group relative flex h-full shrink-0 cursor-pointer items-center rounded-button px-1 transition"
                      onClick={() => handleNavigate(item.path)}
                      style={{
                        color: isActive
                          ? theme.colors.textPrimary
                          : theme.colors.textSecondary,
                      }}
                    >
                      <span className="flex items-center gap-2 text-sm font-semibold">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center transition-transform duration-200 group-hover:-translate-y-1" aria-hidden="true">
                          <CategoryEmoji emoji={item.emoji} isActive={isActive} className="text-2xl" />
                        </span>
                        <span className="relative">
                          {t(item.labelKey)}
                          {item.badge ? (
                            <span
                              className="absolute -right-8 -top-3 rounded-full px-1.5 py-0.5 text-xs font-bold tracking-[0.14em] text-white shadow-sm"
                              style={{ backgroundColor: theme.colors.textPrimary }}
                            >
                              {item.badge}
                            </span>
                          ) : null}
                        </span>
                      </span>

                      {isActive ? (
                        <motion.span
                          layoutId="booksa-desktop-active-tab"
                          transition={activeTabUnderline}
                          className="absolute inset-x-0 -bottom-0.5 h-[3px] rounded-full"
                          style={{ backgroundColor: theme.colors.textPrimary }}
                        />
                      ) : (
                        null
                      )}
                    </button>
                  );
                })}
              </motion.nav>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-self-end gap-3">
            <button
              type="button"
              className="hidden whitespace-nowrap rounded-full px-2 py-3 text-sm font-semibold xl:inline-flex transition hover:bg-[var(--color-surface-muted)] xl:px-3"
              style={{ color: theme.colors.textPrimary }}
              onClick={handleHostAccess}
            >
              {t("becomeHost")}
            </button>
            <button
              type="button"
              aria-label={t("account")}
              onClick={handleAccountAccess}
              disabled={checkingSession}
              aria-busy={checkingSession}
              className="inline-flex h-10 max-sm:h-11 max-sm:w-11 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-muted)] transition hover:bg-[var(--color-border)]"
            >
              {isAuthenticated && user ? (
                user.avatarUrl && failedAvatar !== user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover" onError={() => setFailedAvatar(user.avatarUrl ?? null)} />
                ) : (
                  <span className="text-base font-semibold" aria-hidden="true">{user.name.trim().charAt(0).toUpperCase() || 'B'}</span>
                )
              ) : <CircleUserRound className="h-6 w-6" aria-hidden="true" />}
            </button>

            <HeaderMenu onLogin={() => openLogin()} onHostAccess={handleHostAccess} />
          </div>
        </motion.div>

        <AnimatePresence initial={false}>
          {!isCollapsed ? (
            <motion.div
              key="expanded-search"
              className="flex justify-center overflow-visible"
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 66, marginTop: 26 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 30, mass: 0.95 }}
            >
              <SearchField onSearch={setSearchSection} />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>

      <div className="mx-auto flex max-w-[1540px] items-center justify-between gap-4 px-4 py-3 max-[611px]:hidden lg:hidden">
        <BooksaLogo className="h-8 w-[105.6px]" />

        <div className="flex items-center gap-2">
          <LanguageSwitcher compact />
          <HeaderMenu compact onLogin={() => openLogin()} onHostAccess={handleHostAccess} />
        </div>
      </div>

      <div className="lg:hidden">
        <CompactMobileHeader onSearch={() => setSearchSection("where")} />
      </div>

      <SearchDialog open={searchSection !== null} initialSection={searchSection ?? "where"} onClose={() => setSearchSection(null)} />
      <AccountLoginDialog
        open={isLoginDialogOpen}
        onClose={() => {
          setIsLoginDialogOpen(false);
          setAuthDestination(null);
        }}
        onAuthenticated={handleAuthenticated}
      />
      {showMobileNavigation ? <MarketplaceMobileNav /> : null}
    </header>
  );
}
