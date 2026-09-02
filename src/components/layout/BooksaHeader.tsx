import BooksaLogo from "./BooksaLogo";
import {
  SearchRegular,
  DismissRegular,
} from "@fluentui/react-icons";
import { FiHelpCircle, FiMenu } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import { useEffect, useId, useRef, useState } from "react";
import appleLogo from "@/assets/images/appel-logo.png";
import googleLogo from "@/assets/images/google-logo.png";
import { useTheme } from "@/theme/useTheme";
import { ROUTES } from "@/utils/constants";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/language/LanguageSwitcher";
import { getFirebaseAuthErrorKey } from "@/utils/firebaseErrors";
import { ThreeDIcon } from "@/components/ui/ThreeDIcon";
import type { ThreeDIconName } from "@/icons/threeDIcons";
import { ShimmerImage } from "@/components/ui/ShimmerImage";
import MarketplaceMobileNav from "@/components/layout/MarketplaceMobileNav";

type NavigationItem = {
  label: string;
  labelKey: "home" | "hotel" | "privateRoom" | "restaurant";
  icon: ThreeDIconName;
  path: string;
  badge?: string;
};

const navigationItems: NavigationItem[] = [
  {
    label: "All",
    labelKey: "home",
    icon: "hotel",
    path: ROUTES.home,
  },
  {
    label: "Hotel",
    labelKey: "hotel",
    icon: "privateRoom",
    path: ROUTES.homes,
  },
  {
    label: "Private Room",
    labelKey: "privateRoom",
    icon: "artStudio",
    path: ROUTES.experiences,
  },
  {
    label: "Restaurant",
    labelKey: "restaurant",
    icon: "restaurant",
    path: ROUTES.services,
  },
] as const;

const activeTabUnderline = {
  type: "spring",
  stiffness: 520,
  damping: 34,
  mass: 0.8,
} as const;

function isNavigationItemActive(item: NavigationItem, pathname: string) {
  return item.label === "All"
    ? pathname === ROUTES.home
    : item.path !== ROUTES.home && pathname === item.path;
}

const searchFieldItems = [
  { labelKey: "where", valueKey: "searchDestinations" },
  { labelKey: "when", valueKey: "addDates" },
  { labelKey: "who", valueKey: "addGuests" },
] as const;

function SearchField({ collapsed = false }: { collapsed?: boolean }) {
  const { theme } = useTheme();
  const { t } = useTranslation("navigation");
  const isCompact = collapsed;

  return (
    <motion.button
      type="button"
      aria-label={t("searchAll")}
      layout
      animate={{
        width: isCompact ? "42%" : "100%",
        maxWidth: isCompact ? 440 : 850,
        height: isCompact ? 48 : "auto",
      }}
      transition={{ type: "spring", stiffness: 260, damping: 30, mass: 1 }}
      className={`search-surface flex items-center text-left transition hover:shadow-[var(--shadow-md)] ${
        isCompact ? "mx-6 w-full justify-between px-0 lg:mx-10" : "w-full"
      }`}
      style={{
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
      }}
    >
      <div
        className={`flex w-full items-center ${
          isCompact
            ? "px-1.5 py-1.5 lg:px-2.5 lg:py-2.5"
            : "px-1.5 py-1.5 sm:px-3 sm:py-3"
        }`}
      >
        {searchFieldItems.map((field, index) => (
          <div key={field.labelKey} className="flex min-w-0 flex-1 items-center">
            <div
              className={`min-w-0 ${isCompact ? "px-3 py-1" : "px-5 py-1.5"}`}
            >
              <p
                className={`font-semibold ${isCompact ? "text-[10.92px] lg:text-[10.08px]" : "text-[11.76px] lg:text-[10.92px]"}`}
                style={{ color: theme.colors.textPrimary }}
              >
                {t(field.labelKey)}
              </p>
              <p
                className={`truncate ${isCompact ? "text-[10.92px] lg:text-[10.08px]" : "text-[11.76px] lg:text-[10.92px]"}`}
                style={{ color: theme.colors.textSecondary }}
              >
                {t(field.valueKey)}
              </p>
            </div>

            {index < 2 ? (
              <div
                className="hidden h-9 w-px sm:block"
                aria-hidden="true"
                style={{ backgroundColor: theme.colors.border }}
              />
            ) : null}
          </div>
        ))}

        <span
          className={`ml-2 inline-flex shrink-0 items-center justify-center rounded-full text-white ${
            isCompact ? "h-10 w-10" : "h-12 w-12"
          }`}
          style={{ backgroundColor: theme.colors.primary[500] }}
        >
          <SearchRegular
            className={isCompact ? "h-4 w-4" : "h-5 w-5"}
            aria-hidden="true"
          />
        </span>
      </div>
    </motion.button>
  );
}

function LoginSignupDialog({
  open,
  onClose,
  onAuthenticated,
}: {
  open: boolean;
  onClose: () => void;
  onAuthenticated: () => void;
}) {
  const { theme } = useTheme();
  const { t } = useTranslation("auth");
  const { t: tCommon } = useTranslation("common");
  const { t: tErrors } = useTranslation("errors");
  const { login, loginWithGoogle } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [googleError, setGoogleError] = useState("");
  const titleId = useId();

  const handleEmailLogin = async () => {
    setEmailError("");

    if (!identifier.trim() || !password) {
      setEmailError(t("dialogMissingCredentials"));
      return;
    }

    setIsEmailLoading(true);

    try {
      await login({ email: identifier.trim(), password });
      onAuthenticated();
    } catch (error) {
      console.error("Email authentication failed.", error);
      setEmailError(tErrors(getFirebaseAuthErrorKey(error)));
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleError("");
    setIsGoogleLoading(true);

    try {
      await loginWithGoogle();
      onAuthenticated();
    } catch (error) {
      const code =
        typeof error === "object" && error !== null && "code" in error
          ? String(error.code)
          : "";

      if (code === "auth/popup-closed-by-user") {
        setGoogleError(t("googleCancelled"));
      } else if (code === "auth/popup-blocked") {
        setGoogleError(t("googleBlocked"));
      } else {
        setGoogleError(t("googleFailed"));
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  useEffect(() => {
    if (!open || typeof document === "undefined") return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6 backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="relative w-full max-w-[460px] rounded-3xl px-5 pb-6 pt-5 shadow-[var(--shadow-xl)] sm:px-6 sm:pb-7 sm:pt-6"
            style={{
              backgroundColor: theme.colors.surface,
              border: `1px solid ${theme.colors.border}`,
            }}
          >
        <button
          type="button"
          onClick={onClose}
          aria-label={tCommon("actions.close")}
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full transition"
          style={{ color: theme.colors.textSecondary }}
        >
          <DismissRegular className="h-4 w-4" aria-hidden="true" />
        </button>

        <form
          className="mx-auto flex max-w-[360px] flex-col items-stretch"
          onSubmit={(event) => {
            event.preventDefault();
            void handleEmailLogin();
          }}
        >
          <div className="mb-4 flex justify-center">
            <BooksaLogo className="h-10 w-[110px]" />
          </div>

          <h2
            id={titleId}
            className="text-center text-[21px] font-semibold tracking-[-0.02em] sm:text-[23.52px]"
            style={{ color: theme.colors.textPrimary }}
          >
            {t("dialogTitle")}
          </h2>

          <div className="mt-6">
            <input
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              type="email"
              autoComplete="email"
              placeholder={t("email")}
              className="h-[60px] w-full rounded-2xl border px-4 text-[13.44px] outline-none transition placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-primary-500)]"
              style={{
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.border,
                color: theme.colors.textPrimary,
                caretColor: theme.colors.primary[500],
              }}
            />
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              autoComplete="current-password"
              placeholder={t("password")}
              className="mt-3 h-[60px] w-full rounded-2xl border px-4 text-[13.44px] outline-none transition placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-primary-500)]"
              style={{
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.border,
                color: theme.colors.textPrimary,
                caretColor: theme.colors.primary[500],
              }}
            />
          </div>

          <p
            className="mt-3 text-[10.92px] leading-5"
            style={{ color: theme.colors.textSecondary }}
          >
            {t("privacyLead")}{" "}
            <a
              href="#"
              className="font-semibold underline underline-offset-2"
              style={{ color: theme.colors.textPrimary }}
            >
              {t("privacyPolicy")}
            </a>
          </p>

          <button
            type="submit"
            disabled={isEmailLoading || isGoogleLoading}
            aria-busy={isEmailLoading}
            className="mt-4 inline-flex h-12 items-center justify-center rounded-[14px] text-[13.44px] font-semibold text-white transition hover:opacity-95 disabled:cursor-wait disabled:opacity-60"
            style={{
              backgroundImage: `linear-gradient(90deg, ${theme.colors.primary[500]} 0%, ${theme.colors.secondary} 100%)`,
            }}
          >
            {isEmailLoading ? t("signingIn") : tCommon("actions.continue")}
          </button>

          <div
            className="mt-4 flex items-center gap-3"
            style={{ color: theme.colors.textSecondary }}
          >
            <span
              className="h-px flex-1"
              style={{ backgroundColor: theme.colors.border }}
            />
            <span className="text-sm">{t("or")}</span>
            <span
              className="h-px flex-1"
              style={{ backgroundColor: theme.colors.border }}
            />
          </div>

          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              type="button"
              aria-label={t("continueGoogle")}
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              aria-busy={isGoogleLoading}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border text-[15.12px] shadow-sm transition hover:opacity-80 disabled:cursor-wait disabled:opacity-50"
              style={{
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                color: theme.colors.textSecondary,
              }}
            >
              <ShimmerImage
                src={googleLogo}
                alt=""
                aria-hidden="true"
                className="h-6 w-6 object-contain"
              />
            </button>
            <button
              type="button"
              aria-label={t("continueApple")}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border text-[15.12px] shadow-sm transition"
              style={{
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                color: theme.colors.textPrimary,
              }}
            >
              <ShimmerImage
                src={appleLogo}
                alt=""
                aria-hidden="true"
                className="h-15 w-15 object-contain"
              />
            </button>
          </div>
          {googleError ? (
            <p
              role="alert"
              className="mt-3 text-center text-[10.92px] text-[var(--color-danger)]"
            >
              {googleError}
            </p>
          ) : null}
          {emailError ? (
            <p role="alert" className="mt-3 text-center text-[10.92px] text-[var(--color-danger)]">
              {emailError}
            </p>
          ) : null}
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
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
          compact ? "h-9 w-9" : "h-10 w-10"
        }`}
        style={{
          backgroundColor: theme.colors.surface,
          color: theme.colors.textSecondary,
          "--tw-ring-color": theme.colors.primary[500],
        } as React.CSSProperties}
      >
        <FiMenu className="h-4 w-4" aria-hidden="true" />
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
            className="absolute right-0 top-full z-50 mt-3 w-[264px] overflow-hidden rounded-2xl border py-2 text-left shadow-[var(--shadow-lg)]"
            style={{
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              color: theme.colors.textPrimary,
            }}
          >
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-3 px-5 py-3 text-[12.6px] transition hover:opacity-70"
            >
              <FiHelpCircle className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
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
                <span className="block text-[12.6px] font-semibold leading-5">{t("becomeHost")}</span>
                <span
                  className="mt-0.5 block text-[10.08px] leading-4"
                  style={{ color: theme.colors.textSecondary }}
                >
                  It&apos;s easy to start hosting and earn extra income.
                </span>
              </span>
              <span className="shrink-0 text-[30.24px] leading-none" aria-hidden="true">
                🧑‍💼
              </span>
            </button>

            <div className="mx-5 h-px" style={{ backgroundColor: theme.colors.border }} />

            {["Refer a Host", "Find a co-host", "Gift cards"].map((label) => (
              <button
                key={label}
                type="button"
                role="menuitem"
                className="block w-full px-5 py-2.5 text-left text-[12.6px] transition hover:opacity-70"
              >
                {label}
              </button>
            ))}

            <div className="mx-5 my-1 h-px" style={{ backgroundColor: theme.colors.border }} />

            <button
              type="button"
              role="menuitem"
              onClick={openLogin}
              className="block w-full px-5 py-3 text-left text-[12.6px] transition hover:opacity-70"
            >
              Log in or sign up
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function CompactMobileHeader() {
  const { theme } = useTheme();
  const { t } = useTranslation("navigation");
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-[1400px] pb-3 pt-3 lg:hidden">
      <div className="px-4">
      <button
        type="button"
        aria-label={t("searchAll")}
        className="mx-auto flex h-11 w-full max-w-[420px] items-center justify-center gap-2 rounded-full border px-4 text-[12px] font-semibold shadow-[0_3px_14px_rgba(15,23,42,0.12)]"
        style={{
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          color: theme.colors.textPrimary,
        }}
      >
        <SearchRegular
          className="h-4 w-4 shrink-0"
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
              key={item.label}
              type="button"
              className="relative flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3 shadow-[0_2px_7px_rgba(15,23,42,0.10)]"
              onClick={() => navigate(item.path)}
              style={{
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                color: isActive
                  ? theme.colors.textPrimary
                  : theme.colors.textSecondary,
              }}
            >
              <span className="relative inline-flex items-center justify-center">
                <ThreeDIcon
                  name={item.icon}
                  className="h-[18px] w-[18px] object-contain"
                />
                {item.badge ? (
                  <span
                    className="absolute -right-5 -top-2 rounded-full px-1.5 py-0.5 text-[6.72px] font-bold tracking-[0.14em] text-white shadow-sm"
                    style={{ backgroundColor: theme.colors.textPrimary }}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </span>

              <span className="text-[10.5px] font-medium leading-none">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default function BooksaHeader() {
  const { theme } = useTheme();
  const { t } = useTranslation("navigation");
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [authDestination, setAuthDestination] = useState<string | null>(null);

  useEffect(() => {
    const updateCollapseState = () => {
      setIsCollapsed(window.scrollY > 24);
    };

    updateCollapseState();
    window.addEventListener("scroll", updateCollapseState, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateCollapseState);
    };
  }, []);

  function handleNavigate(path: string) {
    navigate(path);
  }

  function openLogin(destination: string | null = null) {
    setAuthDestination(destination);
    setIsLoginDialogOpen(true);
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
      className="sticky top-0 z-30 border-b"
      style={{
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
      }}
    >
      <motion.div
        className="mx-auto hidden max-w-[1400px] overflow-visible px-4 lg:block lg:px-8"
        animate={{
          minHeight: isCollapsed ? 68 : 184,
          paddingTop: isCollapsed ? 8 : 24,
          paddingBottom: isCollapsed ? 10 : 0,
        }}
        transition={{ type: "spring", stiffness: 220, damping: 28, mass: 1.05 }}
      >
        <motion.div
          className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-4 xl:gap-6"
          animate={{ alignItems: isCollapsed ? "center" : "flex-start" }}
          transition={{
            type: "spring",
            stiffness: 220,
            damping: 28,
            mass: 1.05,
          }}
        >
          <BooksaLogo className="h-10 w-[108px] justify-self-start" />

          <nav
            aria-label={t("primary")}
            className="flex items-start justify-center gap-4 pt-1 xl:gap-8"
          >
            {navigationItems.map((item) => {
              const isActive = isNavigationItemActive(item, location.pathname);

              return (
                <button
                  key={item.label}
                  type="button"
                  className="relative flex cursor-pointer flex-col items-center gap-1 transition"
                  onClick={() => handleNavigate(item.path)}
                  style={{
                    color: isActive
                      ? theme.colors.textPrimary
                      : theme.colors.textSecondary,
                  }}
                >
                  <span className="flex items-center gap-1.5 text-[11.76px] font-medium">
                    <ThreeDIcon
                      name={item.icon}
                      className="h-7 w-7 object-contain"
                    />
                    <span className="relative">
                      {item.label}
                      {item.badge ? (
                        <span
                          className="absolute -right-8 -top-3 rounded-full px-1.5 py-0.5 text-[7.56px] font-bold tracking-[0.14em] text-white shadow-sm"
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
                      className="mt-2 h-0.5 w-20 rounded-full"
                      style={{ backgroundColor: theme.colors.textPrimary }}
                    />
                  ) : (
                    <span className="mt-2 h-0.5 w-20 rounded-full bg-transparent" />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center justify-self-end gap-2 pt-1">
            <button
              type="button"
              className="rounded-full px-4 py-2 text-[12.6px] font-medium transition hover:opacity-90"
              style={{ color: theme.colors.textPrimary }}
              onClick={handleHostAccess}
            >
              {t("becomeHost")}
            </button>
            <LanguageSwitcher compact />

            <HeaderMenu onLogin={() => openLogin()} onHostAccess={handleHostAccess} />
          </div>
        </motion.div>

        <motion.div
          className="flex justify-center overflow-hidden"
          animate={{
            opacity: isCollapsed ? 0 : 1,
            height: isCollapsed ? 0 : "auto",
            marginTop: isCollapsed ? 0 : 20,
            paddingBottom: isCollapsed ? 0 : 20,
          }}
          transition={{
            type: "spring",
            stiffness: 180,
            damping: 24,
            mass: 1.1,
          }}
        >
          <SearchField collapsed={isCollapsed} />
        </motion.div>
      </motion.div>

      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-3 max-[611px]:hidden lg:hidden">
        <BooksaLogo className="h-8 w-[96px]" />

        <div className="flex items-center gap-2">
          <LanguageSwitcher compact />
          <HeaderMenu compact onLogin={() => openLogin()} onHostAccess={handleHostAccess} />
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 pb-3 max-[611px]:hidden lg:hidden">
        <button
          type="button"
          aria-label={t("searchAll")}
          className="search-surface flex w-full items-center justify-between gap-4 px-4 text-left"
          style={{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          }}
        >
          <div>
            <p
              className="text-[10.92px] font-semibold"
              style={{ color: theme.colors.textPrimary }}
            >
              {t("whereGoing")}
            </p>
            <p
              className="text-[10.08px]"
              style={{ color: theme.colors.textSecondary }}
            >
              {t("searchAll")}
            </p>
          </div>
          <span
            className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white"
            style={{ backgroundColor: theme.colors.primary[500] }}
          >
            <SearchRegular className="h-4 w-4" aria-hidden="true" />
          </span>
        </button>
      </div>

      <div className="hidden max-[611px]:block">
        <CompactMobileHeader />
      </div>

      <LoginSignupDialog
        open={isLoginDialogOpen}
        onClose={() => {
          setIsLoginDialogOpen(false);
          setAuthDestination(null);
        }}
        onAuthenticated={handleAuthenticated}
      />
      <MarketplaceMobileNav />
    </header>
  );
}
