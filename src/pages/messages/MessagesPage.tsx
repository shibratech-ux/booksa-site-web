import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessagesSquare, Search, Settings, X } from 'lucide-react';
import MarketplaceMobileNav from '@/components/layout/MarketplaceMobileNav';

const messageFilters = ['All', 'Hosting', 'Traveling', 'Support'] as const;
type MessageFilter = (typeof messageFilters)[number];

export default function MessagesPage() {
  const [activeFilter, setActiveFilter] = useState<MessageFilter>('All');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isSettingsOpen) return;

    const closeSettings = (event: MouseEvent) => {
      if (!settingsRef.current?.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    };

    document.addEventListener('mousedown', closeSettings);
    return () => document.removeEventListener('mousedown', closeSettings);
  }, [isSettingsOpen]);

  return (
    <main className="min-h-dvh bg-white pb-[calc(66px+env(safe-area-inset-bottom))] text-[#222222]">
      <section className="mx-auto min-h-[calc(100dvh-66px)] w-full max-w-[836px] px-6 pb-12 pt-16 sm:px-10 sm:pt-12">
        <header className="relative flex items-center justify-between gap-4">
          <h1 className="text-[25.872px] font-semibold leading-none tracking-[-0.035em] sm:text-2xl">
            Messages
          </h1>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setIsSearchOpen((open) => !open);
                setIsSettingsOpen(false);
              }}
              aria-label={isSearchOpen ? 'Close message search' : 'Search messages'}
              aria-expanded={isSearchOpen}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-[#f7f7f7] text-[#222222] transition hover:bg-[#eeeeee]"
            >
              {isSearchOpen ? (
                <X className="h-[18.7px] w-[18.7px] stroke-[1.8]" aria-hidden="true" />
              ) : (
                <Search className="h-[9.35px] w-[9.35px] stroke-[1.8]" aria-hidden="true" />
              )}
            </button>

            <div ref={settingsRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsSettingsOpen((open) => !open);
                  setIsSearchOpen(false);
                }}
                aria-label="Message settings"
                aria-expanded={isSettingsOpen}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-[#f7f7f7] text-[#222222] transition hover:bg-[#eeeeee]"
              >
                <Settings className="h-[18.7px] w-[18.7px] stroke-[1.8]" aria-hidden="true" />
              </button>

              <AnimatePresence>
                {isSettingsOpen ? (
                  <motion.div
                    initial={{ opacity: 0, y: -5, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -5, scale: 0.98 }}
                    transition={{ duration: 0.16 }}
                    role="menu"
                    className="absolute right-0 top-11 z-20 w-48 overflow-hidden rounded-sm border border-slate-200 bg-white p-1.5 text-[14.112px] shadow-[0_12px_35px_rgba(15,23,42,0.14)]"
                  >
                    <button type="button" role="menuitem" className="w-full rounded-md px-3 py-2.5 text-left hover:bg-slate-50">
                      Notification settings
                    </button>
                    <button type="button" role="menuitem" className="w-full rounded-md px-3 py-2.5 text-left hover:bg-slate-50">
                      Archived messages
                    </button>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <AnimatePresence initial={false}>
          {isSearchOpen ? (
            <motion.label
              initial={{ height: 0, opacity: 0, marginTop: 0 }}
              animate={{ height: 42, opacity: 1, marginTop: 16 }}
              exit={{ height: 0, opacity: 0, marginTop: 0 }}
              className="flex items-center gap-2 overflow-hidden rounded-md border border-slate-300 px-4"
            >
              <Search className="h-2 w-2 shrink-0 text-slate-500" aria-hidden="true" />
              <span className="sr-only">Search messages</span>
              <input
                autoFocus
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search messages"
                className="min-w-0 flex-1 bg-transparent text-[14.112px] outline-none placeholder:text-slate-400"
              />
            </motion.label>
          ) : null}
        </AnimatePresence>

        <div
          role="tablist"
          aria-label="Filter messages"
          className="mt-6 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {messageFilters.map((filter) => {
            const isActive = activeFilter === filter;

            return (
              <button
                key={filter}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveFilter(filter)}
                className={`h-9 shrink-0 rounded-md px-4 text-[11.76px] font-medium transition sm:text-[12.936px] ${
                  isActive
                    ? 'bg-[#222222] text-white'
                    : 'bg-[#f7f7f7] text-[#222222] hover:bg-[#eeeeee]'
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>

        <motion.div
          key={`${activeFilter}-${search}`}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          role="tabpanel"
          className="mx-auto flex max-w-[341px] flex-col items-center pt-12 text-center sm:pt-16"
        >
          <MessagesSquare className="h-7 w-7 stroke-[1.55]" aria-hidden="true" />
          <h2 className="mt-5 text-[14.112px] font-semibold tracking-[-0.01em] sm:text-[15.288px]">
            You don’t have any messages
          </h2>
          <p className="mt-2 text-[11.76px] leading-[1.45] text-[#6a6a6a] sm:text-[12.936px]">
            When you receive a new message, it will
            <br className="hidden min-[340px]:block" /> appear here.
          </p>
        </motion.div>
      </section>

      <MarketplaceMobileNav />
    </main>
  );
}
