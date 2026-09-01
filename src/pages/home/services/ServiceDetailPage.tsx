import {
  CameraSparklesRegular,
  CopyRegular,
  ChevronDownRegular,
  DismissRegular,
  AccessibilityRegular,
  HatGraduationRegular,
  HeartRegular,
  PeopleRegular,
  CalendarRegular,
  SearchRegular,
  ShareRegular,
  RibbonStarRegular,
  StarFilled
} from '@fluentui/react-icons';
import dayjs from 'dayjs';
import { useEffect, useMemo, useRef, useState, type MutableRefObject, type RefObject } from 'react';
import { useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import BooksaHeader from '@/components/layout/BooksaHeader';
import Footer from '@/components/layout/Footer';
import { ShimmerImage } from '@/components/ui/ShimmerImage';
import { BooksaMap } from '@/components/maps/BooksaMap';
import { useTheme } from '@/theme/useTheme';
import { getServiceDetailBySlug } from './serviceData';
import { formatCurrency, formatDate } from '@/utils/formatters';



type Experience = {
  id: number;
  title: string;
  description: string;
  price: number;
  duration: string;
  image: string;
};

const experiences: Experience[] = [
  {
    id: 1,
    title: 'Portraits rapides',
    description:
      'Durée : 30 minutes. Capturez vos moments à Milan lors d’une séance photo détendue à la Galleria Vittorio Emanuele II, puis...',
    price: 56,
    duration: '30 mins',
    image: 'https://images.unsplash.com/photo-1556911073-a517e752729c?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 2,
    title: 'Séance portrait prolongée',
    description:
      'Durée : 1 heure. Vivez une séance portrait premium à Milan dans trois lieux superbes : la Galleria, le Duomo et un endroit caché pour...',
    price: 114,
    duration: '1 hr',
    image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 3,
    title: 'Photographie en robe fluide',
    description:
      'Durée : 1 heure. Entrez dans une séance photo de rêve à Milan avec une robe fluide dans des lieux emblématiques comme le Duomo et la Galleria. Sentez-vous élégante...',
    price: 228,
    duration: '1 hr',
    image: 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=400&q=80'
  }
];

const CDF_PER_USD = 2321;

function formatExperiencePriceInCdf(priceInUsd: number) {
  const converted = Math.round(priceInUsd * CDF_PER_USD);
  return formatCurrency(converted, 'CDF');
}

const scheduleExperiences = [
  {
    id: 1,
    title: 'Mini séance Eiffel',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=320&q=80',
    price: '$46 / invité',
    meta: 'Minimum 137 $ · 30 min',
    times: ['6 h 00', '6 h 30', '7 h 00', '8 h 30', '10 h 00', '10 h 30', '11 h 00', '11 h 30']
  },
  {
    id: 2,
    title: 'Kinshasa Cinematic Photo & Video',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=320&q=80',
    price: '$572 / groupe',
    meta: '1 h 30',
    times: ['6 h 00', '10 h 00', '10 h 30', '21 h 00', '21 h 30']
  }
];

function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label="Fermer la fenêtre"
      onClick={onClick}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full text-neutral-700 transition hover:bg-black/5 hover:text-neutral-900"
    >
      <DismissRegular className="h-5 w-5" />
    </button>
  );
}

function TimePill({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="inline-flex h-10 items-center justify-center rounded-xl border border-neutral-200 px-4 text-[10.92px] font-medium text-neutral-900 transition hover:border-neutral-300 hover:bg-neutral-50"
    >
      {label}
    </button>
  );
}

function useIsSmallScreen() {
  const [isSmallScreen, setIsSmallScreen] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.innerWidth < 612;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 611px)');
    const updateIsSmallScreen = () => setIsSmallScreen(mediaQuery.matches);

    updateIsSmallScreen();
    mediaQuery.addEventListener('change', updateIsSmallScreen);

    return () => mediaQuery.removeEventListener('change', updateIsSmallScreen);
  }, []);

  return isSmallScreen;
}

function ScheduleContent({
  compact,
  onClose,
  monthsScrollerRef,
  monthSectionRefs,
  selectedButtonRef,
  selectedDate,
  scheduleMonths,
  setSelectedDate,
  setVisibleMonth,
  today,
  visibleMonth
}: {
  compact: boolean;
  onClose: () => void;
  monthsScrollerRef: RefObject<HTMLDivElement>;
  monthSectionRefs: MutableRefObject<(HTMLElement | null)[]>;
  selectedButtonRef: RefObject<HTMLButtonElement>;
  selectedDate: Date | undefined;
  scheduleMonths: dayjs.Dayjs[];
  setSelectedDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  setVisibleMonth: React.Dispatch<React.SetStateAction<dayjs.Dayjs>>;
  today: dayjs.Dayjs;
  visibleMonth: dayjs.Dayjs;
}) {
  const contentShellClassName = compact
    ? 'fixed inset-x-0 bottom-0 z-50 flex max-h-[90vh] flex-col overflow-hidden rounded-t-3xl bg-white px-5 pb-[calc(env(safe-area-inset-bottom)+20px)] pt-4 shadow-[0_-12px_40px_rgba(0,0,0,0.16)]'
    : 'relative flex max-h-[90vh] w-full max-w-[680px] flex-col overflow-hidden rounded-3xl bg-white px-6 py-6 shadow-[var(--shadow-xl)] sm:px-8 sm:py-8';

  return (
    <div
      className={contentShellClassName}
      onClick={(event) => event.stopPropagation()}
    >
      <div className={compact ? 'mx-auto h-1.5 w-12 rounded-full bg-neutral-300' : 'absolute right-4 top-4 sm:right-5 sm:top-5'}>
        {compact ? null : <CloseButton onClick={onClose} />}
      </div>

      {compact ? (
        <div className="mt-4 flex items-start justify-between gap-4">
          <div className="min-w-0 pr-12">
            <h2 className="text-[16.8px] font-medium tracking-tight text-neutral-900">
              Planifiez votre séance photo
            </h2>
            <p className="mt-1 text-[10.92px] text-neutral-500">Choisissez vos dates et horaires ci-dessous.</p>
          </div>
          <button
            type="button"
            aria-label="Fermer la fenêtre"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-neutral-700 transition hover:bg-black/5 hover:text-neutral-900"
          >
            <DismissRegular className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <div className="pr-12 sm:pr-16">
          <h2 className="text-[17.64px] font-medium tracking-tight text-neutral-900 sm:text-[16.8px]">
            Planifiez votre séance photo
          </h2>
        </div>
      )}

      <div className={`mt-6 flex items-center justify-between border-b border-neutral-200 pb-5 ${compact ? 'mt-5' : ''}`}>
        <p className="text-[11.76px] font-medium leading-none text-neutral-900">1 invité</p>

        <div className="flex items-center gap-3 text-neutral-900">
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-2xl leading-none text-neutral-300 transition hover:text-neutral-500"
          >
            −
          </button>
          <span className="min-w-5 text-center text-[8.4px] font-medium leading-none">1</span>
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-md leading-none transition hover:text-neutral-500"
          >
            +
          </button>
        </div>
      </div>

      <div className="mt-5 border-b border-neutral-200 pb-5">
        <div className="flex items-center justify-between">
          <AnimatePresence mode="wait" initial={false}>
            <motion.h3
              key={visibleMonth.format('YYYY-MM')}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="text-[11.76px] font-medium text-neutral-900"
            >
              {formatDate(visibleMonth.toDate(), undefined, { month: 'long', year: 'numeric' })}
            </motion.h3>
          </AnimatePresence>
          <CalendarRegular className="h-5 w-5 text-neutral-700" />
        </div>

        <div ref={monthsScrollerRef} className="mt-5 overflow-x-auto pb-1 pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex min-w-max snap-x snap-mandatory">
            {scheduleMonths.map((month, index) => {
              const daysInMonth = month.daysInMonth();
              const monthDays = Array.from({ length: daysInMonth }, (_, dayIndex) => {
                const date = month.startOf('month').add(dayIndex, 'day');

                return {
                  date,
                  dayLabel: ['S', 'M', 'T', 'W', 'T', 'F', 'S'][date.day()]
                };
              });

              return (
                <section
                  key={month.format('YYYY-MM')}
                  ref={(element) => {
                    monthSectionRefs.current[index] = element;
                  }}
                  className="shrink-0 snap-start rounded-xl border border-slate-200 bg-white px-4 py-4"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="text-[11.76px] font-medium text-neutral-900">{formatDate(month.toDate(), undefined, { month: 'long', year: 'numeric' })}</h4>
                    <CalendarRegular className="h-5 w-5 text-neutral-700" />
                  </div>

                  <div className="flex gap-3 overflow-x-auto pb-1 pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {monthDays.map((item) => {
                      const isSelected = selectedDate ? dayjs(selectedDate).isSame(item.date, 'day') : false;
                      const isPast = item.date.isBefore(today, 'day');

                      return (
                        <button
                          key={item.date.format('YYYY-MM-DD')}
                          type="button"
                          ref={isSelected ? selectedButtonRef : null}
                          onClick={() => setSelectedDate(item.date.toDate())}
                          className={[
                            'flex min-w-[56px] shrink-0 flex-col items-center rounded-xl px-3 py-3 text-center transition',
                            isSelected
                              ? 'text-neutral-900'
                              : isPast
                                ? 'text-neutral-300'
                                : 'text-neutral-900 hover:bg-neutral-100'
                          ].join(' ')}
                        >
                          <span className="text-[9.24px] font-medium uppercase leading-none tracking-[0.08em] text-inherit">
                            {item.dayLabel}
                          </span>
                          <span
                            className={[
                              'mt-2 inline-flex h-10 w-10 items-center justify-center rounded-full text-[10.92px] font-semibold leading-none transition',
                              isSelected ? 'bg-neutral-900 text-white' : 'text-inherit'
                            ].join(' ')}
                          >
                            {item.date.format('D')}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 min-h-0 flex-1 space-y-6 overflow-y-auto pr-1 pb-1">
        {scheduleExperiences.map((experience) => (
          <article key={experience.id} className="space-y-4">
            <div className="flex items-start gap-4">
              <ShimmerImage
                src={experience.image}
                alt={experience.title}
                className="h-16 w-16 shrink-0 rounded-[16px] object-cover"
              />
              <div className="min-w-0">
                <h3 className="text-[12.6px] font-semibold leading-5 text-neutral-900">{experience.title}</h3>
                <p className="mt-1 text-[11.76px] text-neutral-600">
                  <span className="font-semibold text-neutral-900">{experience.price}</span> · {experience.meta}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {experience.times.map((time) => (
                <TimePill key={`${experience.id}-${time}`} label={time} />
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function ScheduleDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const isSmallScreen = useIsSmallScreen();
  const [today] = useState(() => dayjs().startOf('day'));
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(today.toDate());
  const [visibleMonth, setVisibleMonth] = useState(() => today.startOf('month'));
  const monthsScrollerRef = useRef<HTMLDivElement | null>(null);
  const monthSectionRefs = useRef<(HTMLElement | null)[]>([]);
  const selectedButtonRef = useRef<HTMLButtonElement | null>(null);
  const scheduleMonths = useMemo(
    () => Array.from({ length: 4 }, (_, index) => today.startOf('month').add(index, 'month')),
    [today]
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setSelectedDate(today.toDate());
    setVisibleMonth(today.startOf('month'));

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open, today]);

  useEffect(() => {
    if (!open) {
      return;
    }

    selectedButtonRef.current?.scrollIntoView({
      block: 'nearest',
      inline: 'center',
      behavior: 'smooth'
    });
  }, [open, selectedDate]);

  useEffect(() => {
    if (!open || !monthsScrollerRef.current) {
      return;
    }

    const scroller = monthsScrollerRef.current;

    const updateVisibleMonth = () => {
      const scrollerRect = scroller.getBoundingClientRect();
      const scrollerCenter = scrollerRect.left + scrollerRect.width / 2;

      let closestMonth = scheduleMonths[0];
      let closestDistance = Number.POSITIVE_INFINITY;

      monthSectionRefs.current.forEach((section, index) => {
        if (!section) {
          return;
        }

        const rect = section.getBoundingClientRect();
        const sectionCenter = rect.left + rect.width / 2;
        const distance = Math.abs(sectionCenter - scrollerCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestMonth = scheduleMonths[index];
        }
      });

      setVisibleMonth(closestMonth.startOf('month'));
    };

    updateVisibleMonth();
    scroller.addEventListener('scroll', updateVisibleMonth, { passive: true });
    window.addEventListener('resize', updateVisibleMonth);

    return () => {
      scroller.removeEventListener('scroll', updateVisibleMonth);
      window.removeEventListener('resize', updateVisibleMonth);
    };
  }, [open, scheduleMonths]);

  if (!open) {
    return null;
  }

  if (isSmallScreen) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Planifiez votre séance photo"
        className="fixed inset-0 z-50 bg-black/35 backdrop-blur-[2px]"
        onClick={onClose}
      >
        <ScheduleContent
          compact
          onClose={onClose}
          monthsScrollerRef={monthsScrollerRef}
          monthSectionRefs={monthSectionRefs}
          selectedButtonRef={selectedButtonRef}
          selectedDate={selectedDate}
          scheduleMonths={scheduleMonths}
          setSelectedDate={setSelectedDate}
          setVisibleMonth={setVisibleMonth}
          today={today}
          visibleMonth={visibleMonth}
        />
      </div>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Planifiez votre séance photo"
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/35 px-4 py-6 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <ScheduleContent
        compact={false}
        onClose={onClose}
        monthsScrollerRef={monthsScrollerRef}
        monthSectionRefs={monthSectionRefs}
        selectedButtonRef={selectedButtonRef}
        selectedDate={selectedDate}
        scheduleMonths={scheduleMonths}
        setSelectedDate={setSelectedDate}
        setVisibleMonth={setVisibleMonth}
        today={today}
        visibleMonth={visibleMonth}
      />
    </div>
  );
}

function ExperienceList() {
  return (
    <section className="w-full px-3">
      <div className="mx-auto flex max-w-3xl flex-col gap-5">
        {experiences.map((item) => (
          <article
            key={item.id}
            className="flex min-h-[150px] items-center gap-5 rounded-2xl border border-gray-100 bg-white p-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-sm)]"
          >
            <ShimmerImage
              src={item.image}
              alt={item.title}
              className="h-[136px] w-[144px] shrink-0 rounded-[14px] object-cover"
            />

            <div className="min-w-0 flex-1 pr-3">
              <h3 className="mb-1 text-[10.92px] font-semibold text-neutral-900 max-[611px]:text-[10.08px]">{item.title}</h3>

              <p className="line-clamp-2 text-[10.08px] leading-4 text-neutral-600 max-[611px]:text-[9.24px] max-[611px]:leading-4">
                {item.description}
              </p>

              <div className="mt-4 flex items-center gap-1 text-[9.24px] text-neutral-500 max-[611px]:text-[8.4px]">
                <span className="font-bold text-neutral-900">{formatExperiencePriceInCdf(item.price)}</span>
                <span>/ invité</span>
                <span className="mx-1">·</span>
                <span>{item.duration}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function PortfolioBlock({ heroImage }: { heroImage: string }) {
  const portfolioImages = [
    heroImage,
    'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=80'
  ];

  return (
    <section className="w-full px-3 py-6">
      <div className="mx-auto max-w-3xl border-t border-gray-200 pt-8">
        <h2 className="text-[17.64px] font-semibold tracking-tight text-neutral-900">Mon portfolio</h2>

        <div className="mt-5 grid gap-1.5 sm:grid-cols-[minmax(0,1.85fr)_minmax(0,1fr)]">
          <button
            type="button"
            className="group relative overflow-hidden rounded-2xl bg-slate-100"
          >
            <ShimmerImage
              src={portfolioImages[0]}
              alt="Portfolio highlight"
              className="h-full min-h-[430px] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            />
          </button>

          <div className="grid gap-1.5">
            {portfolioImages.slice(1).map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                className="group relative overflow-hidden rounded-[14px] bg-slate-100"
              >
                <ShimmerImage
                  src={image}
                  alt={`Détail du portfolio ${index + 1}`}
                  className="h-full min-h-[199px] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                />

                {index === 1 ? (
                  <span className="absolute bottom-4 right-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#d8c2a0] text-gray-900 shadow-[0_10px_22px_rgba(15,23,42,0.16)]">
                    <CopyRegular className="h-5 w-5" />
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function WhereYoullGoBlock({ city, placeLabel }: { city: string; placeLabel: string }) {
  return (
    <section className="w-full px-3 py-6">
      <div className="mx-auto max-w-3xl border-t border-gray-200 pt-8">
        <h2 className="text-[17.64px] font-semibold tracking-tight text-neutral-900">Où vous irez</h2>
        <p className="mt-2 text-[11.76px] text-neutral-500">{city}</p>

        <BooksaMap
          center={{ latitude: 45.4642, longitude: 9.19 }}
          initialZoom={11}
          title={`Carte de ${placeLabel}`}
          className="mt-6 h-[350px] rounded-2xl border border-slate-200"
        >
          <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-neutral-900 shadow-[0_12px_24px_rgba(15,23,42,0.18)]">
              <span className="h-3 w-3 rounded-full bg-white" />
            </span>
            <span className="mt-2 rounded-full bg-white/90 px-4 py-1.5 text-sm font-medium text-neutral-900 shadow-sm">
              {placeLabel}
            </span>
          </div>

        </BooksaMap>
      </div>
    </section>
  );
}

type Review = {
  id: number;
  name: string;
  location: string;
  avatar: string;
  text: string;
};

const reviews: Review[] = [
  {
    id: 1,
    name: 'Hedy',
    location: 'Milan, Italy',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop',
    text:
      'C’était ma deuxième réservation avec Victor, et une fois encore l’expérience a été formidable. Cette fois, nous avons exploré une autre partie de la ville, ce qui a donné aux photos une atmosphère totalement nouvelle. Victor a toujou...'
  },
  {
    id: 2,
    name: 'Amir',
    location: 'Turin, Italy',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop',
    text:
      "Une expérience légendaire ! Le photographe était extrêmement professionnel, poli, ponctuel et excellent pour capturer le moment parfait. Je suis folle de mes photos ! Je n’ai jamais vu un tel talent, un vrai maître. Vivement recommandé..."
  },
  {
    id: 3,
    name: 'Anahita',
    location: 'Milan, Italy',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop',
    text:
      'C’était l’une des meilleures séances photo que j’aie jamais vécues. Le photographe a été incroyablement professionnel, patient et attentionné tout au long de la séance. Ce qui m’a le plus impressionnée, c’est leur...'
  },
  {
    id: 4,
    name: 'Niloufar',
    location: 'Milan, Italy',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop',
    text:
      'Victor était incroyable ! Nous avons photographié devant le Duomo di Milano et les photos étaient absolument magnifiques. Il était sympathique, professionnel et a rendu tout cela très simple. Je recommande vivement ! ☆☆☆☆☆'
  }
];

function ReviewsBlock({ onShowReviews }: { onShowReviews: () => void }) {
  return (
    <section className="w-full px-3 py-6 pt-10">
      <div className="mx-auto max-w-3xl border-t border-gray-200 pt-8">
        <h2 className="text-[17.64px] font-semibold tracking-tight text-neutral-900">
          ★ 5.0 · 14 avis
        </h2>

        <div className="-mx-4 flex w-screen gap-0 overflow-x-auto pb-2 pt-4 [scrollbar-width:none] md:mx-0 md:grid md:w-auto md:grid-cols-2 md:gap-x-12 md:gap-y-10 md:overflow-visible [&::-webkit-scrollbar]:hidden">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="w-screen shrink-0 border-r border-slate-200 px-4 pr-6 md:w-auto md:shrink md:border-r-0 md:px-0 md:pr-0"
            >
              <div className="flex items-center gap-3">
                <ShimmerImage
                  src={review.avatar}
                  alt={review.name}
                  className="h-10 w-10 shrink-0 rounded-full object-cover"
                />
                <div className="min-w-0">
                  <h3 className="text-[11.76px] font-normal leading-5 text-neutral-900">{review.name}</h3>
                  <p className="text-[10.92px] text-neutral-500">{review.location}</p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <p className="text-[10.92px] text-neutral-800">★★★★★ · il y a 3 semaines</p>
                <p className="text-[10.08px] leading-6 text-neutral-900 line-clamp-4">{review.text}</p>
                <button type="button" className="text-[10.08px] font-semibold text-neutral-900 underline underline-offset-2">
                  Voir plus
                </button>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={onShowReviews}
            className="w-full rounded-full bg-gray-100 px-6 py-3 text-[12.6px] font-medium text-gray-900 transition hover:bg-gray-200 sm:max-w-[640px]"
          >
            Voir les avis
          </button>
        </div>
      </div>
    </section>
  );
}

function ReviewsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Reviews dialog"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[900px] rounded-3xl bg-white px-6 py-6 shadow-[var(--shadow-xl)] sm:px-8 sm:py-8"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Fermer les avis"
          onClick={onClose}
          className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-700 transition hover:bg-gray-100"
        >
          <DismissRegular className="h-5 w-5" />
        </button>

        <div className="flex items-start justify-between gap-4 pr-12">
          <h2 className="text-[15.12px] font-medium tracking-tight text-neutral-900">
            ★ 5.0 · 14 avis
          </h2>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-[11.76px] font-medium text-gray-800 shadow-sm"
          >
            Plus récents
            <ChevronDownRegular className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 flex items-center gap-3 rounded-full border border-gray-200 px-4 py-3">
          <SearchRegular className="h-5 w-5 text-gray-500" />
          <input
            type="text"
            placeholder="Rechercher dans tous les avis"
            className="w-full bg-transparent text-[12.6px] text-gray-900 outline-none placeholder:text-gray-500"
          />
        </div>

        <div className="mt-8 max-h-[62vh] space-y-8 overflow-y-auto pr-1">
          {reviews.slice(0, 2).map((review) => (
            <article key={review.id} className="border-b border-gray-200 pb-8 last:border-b-0 last:pb-0">
              <div className="flex items-start gap-3">
                <ShimmerImage
                  src={review.avatar}
                  alt={review.name}
                  className="h-11 w-11 shrink-0 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-[13.44px] font-semibold leading-5 text-neutral-900">{review.name}</h3>
                  <p className="text-[10.92px] text-neutral-500">{review.location}</p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <p className="text-[10.92px] text-neutral-800">★★★★★ · 3 weeks ago</p>
                <p className="text-[11.76px] leading-5 text-neutral-900">{review.text.replace('...', '')}</p>
                <button
                  type="button"
                  className="text-[10.92px] font-semibold text-neutral-900 underline underline-offset-2"
                >
                  Voir plus
                </button>
                {review.id === 2 ? (
                  <p className="pt-2 text-[10.92px] text-neutral-500">
                    Traduit de l’italien.{' '}
                    <button type="button" className="underline underline-offset-2">
                      Voir l’original
                    </button>
                  </p>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

function QualificationsBlock({ avatarImage }: { avatarImage: string }) {
  return (
    <section className="w-full px-3 py-6">
      <div className="mx-auto max-w-3xl border-t border-gray-200 pt-8">
        <h2 className="text-[17.64px] font-semibold tracking-tight text-neutral-900">Mes qualifications</h2>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
          <div className="rounded-2xl border border-slate-200 bg-white px-8 py-10 text-center">
            <div className="mx-auto h-24 w-24 overflow-hidden rounded-full">
              <ShimmerImage
                src={avatarImage}
                alt="Victor"
                className="h-full w-full object-cover"
              />
            </div>
              <h3 className="mt-6 text-[20.16px] font-semibold leading-none text-neutral-900">Victor</h3>
            <p className="mt-2 text-[10.08px] font-normal text-neutral-500">Photographe</p>
          </div>

          <div className="space-y-6">
            {[
              {
                icon: CameraSparklesRegular,
                title: '8 ans d’expérience',
                text: 'Je suis photographe professionnel, spécialisé dans le portrait et la photographie lifestyle.'
              },
              {
                icon: RibbonStarRegular,
                title: 'Moment fort de carrière',
                text: 'J’ai travaillé avec divers médias et photographié des voyageurs pour créer des images mémorables.'
              },
              {
                icon: HatGraduationRegular,
                title: 'Études et formation',
                text: 'Je poursuis actuellement un master à Milan pour développer mes compétences.'
              }
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.title} className="flex items-start gap-4">
                  <Icon className="mt-1 h-6 w-6 shrink-0 text-neutral-900" />
                  <div>
                    <h4 className="text-[11.76px] font-medium text-neutral-900">{item.title}</h4>
                    <p className="mt-1 text-[10.92px] leading-5 text-neutral-600">{item.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            type="button"
            className="w-full rounded-full bg-[#f1f1f1] px-6 py-3 text-[10.08px] font-medium text-neutral-900 transition hover:bg-[#e8e8e8] sm:max-w-[640px]"
          >
            Envoyer un message à Victor
          </button>
        </div>

        <p className="mx-auto mt-6 max-w-xl text-center text-[11.76px] leading-6 text-neutral-500">
          Pour mieux protéger votre paiement, utilisez toujours Booksa pour envoyer de l’argent et communiquer avec les hôtes.
        </p>
      </div>
    </section>
  );
}

function ThingsToKnowBlock() {
  const items = [
    {
      icon: PeopleRegular,
      title: 'Conditions pour les voyageurs',
      text: 'Les voyageurs âgés de 2 ans et plus peuvent participer.'
    },
    {
      icon: AccessibilityRegular,
      title: 'Accessibilité',
      text: 'Options en langue des signes',
      linkLabel: 'En savoir plus'
    },
    {
      icon: CalendarRegular,
      title: 'Politique d’annulation',
      text: 'Annulez au moins 1 jour avant l’heure de début pour un remboursement complet.'
    }
  ];

  return (
    <section className="w-full px-3 py-6">
      <div className="mx-auto max-w-3xl border-t border-gray-200 pt-8">
        <h2 className="text-[17.64px] font-semibold tracking-tight text-neutral-900">À savoir</h2>

        <div className="mt-8 grid gap-x-16 gap-y-12 sm:grid-cols-2">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <article key={item.title} className="max-w-[260px]">
                <Icon className="h-7 w-7 text-neutral-900" />
                <h3 className="mt-4 text-[11.76px] font-semibold text-neutral-900">{item.title}</h3>
                <p className="mt-1 text-[10.92px] leading-5 text-neutral-600">
                  {item.text}{' '}
                  {'linkLabel' in item ? (
                    <button type="button" className="underline underline-offset-2">
                      {item.linkLabel}
                    </button>
                  ) : null}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function QualityTrustBlock() {
  return (
    <section className="w-full px-3 py-6">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-[32px] bg-[#f5f2ec] px-6 py-16 text-center shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:px-10">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#f2c14f] shadow-[0_14px_24px_rgba(15,23,42,0.16)] ring-8 ring-[#e2b43f]/25">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-[#a66f11] bg-[#f6cf63] text-[#8a5b09] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
              <StarFilled className="h-7 w-7" />
            </div>
          </div>

          <h2 className="mx-auto mt-8 max-w-2xl text-[24.36px] font-semibold leading-tight tracking-tight text-neutral-900 sm:text-[27.72px]">
            Les photographes sur Booksa sont sélectionnés pour leur qualité
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-[12.6px] leading-7 text-neutral-600">
            Les photographes sont évalués selon leur expérience professionnelle, la qualité de leur portfolio et leur
            réputation d’excellence.{' '}
            <button type="button" className="underline underline-offset-2">
              En savoir plus
            </button>
          </p>
        </div>

        <p className="mt-8 text-center text-[10.92px] text-neutral-500">
          Un problème ?{' '}
          <button type="button" className="underline underline-offset-2">
            Signaler cette annonce
          </button>
        </p>
      </div>
    </section>
  );
}

function BookingSummaryCard({ onShowDates, price }: { onShowDates: () => void; price: string }) {
  const { theme } = useTheme();

  return (
    <div
      className="flex w-full max-w-[420px] flex-row overflow-hidden rounded-[30px] max-[611px]:rounded-[100px] border shadow-[0_18px_42px_rgba(15,23,42,0.10)] sm:flex-row max-[611px]:w-full max-[611px]:max-w-[460px] max-[611px]:items-stretch max-[611px]:rounded-[26px] xl:ml-[12%]"
      style={{
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border
      }}
    >
      <div
        className="min-w-0 flex-1 border-b px-5 py-4 max-[611px]:border-b-0 max-[611px]:border-r max-[611px]:px-4 max-[611px]:py-2.5 sm:border-b-0 sm:border-r sm:px-6 sm:py-5"
        style={{ borderColor: theme.colors.border }}
      >
        <div className="space-y-1">
          <p className="text-base font-medium leading-none max-[611px]:text-[10.92px] sm:text-sm" style={{ color: theme.colors.textPrimary }}>
            {price}
          </p>
          <p className="text-[8.4px] font-medium leading-none max-[611px]:text-[7.56px]" style={{ color: theme.colors.primary[500] }}>
            Annulation gratuite
          </p>
        </div>
      </div>
      <div className="flex items-center justify-center bg-[color-mix(in_srgb,var(--color-primary-500)_8%,transparent)] px-5 py-4 max-[611px]:px-4 max-[611px]:py-2.5 sm:px-6 sm:py-0">
        <button
          type="button"
          className="w-full rounded-full px-5 py-5 text-sm font-semibold leading-none text-white shadow-[0_10px_22px_rgba(15,23,42,0.14)] transition hover:opacity-90 sm:w-auto max-[611px]:min-w-[96px] max-[611px]:px-4 max-[611px]:py-4 max-[611px]:text-md"
          style={{ backgroundColor: theme.colors.primary[500] }}
          onClick={onShowDates}
        >
          Voir les dates
        </button>
      </div>
    </div>
  );
}

function ServiceHeroPanel({
  description,
  hostAvatarImage,
  hostName,
  service,
  rating,
  reviewCount,
  summary,
  title
}: {
  description: string;
  hostAvatarImage: string;
  hostName: string;
  service: ReturnType<typeof getServiceDetailBySlug>;
  rating: string;
  reviewCount: string;
  summary: string;
  title: string;
}) {
  return (
    <>
      <div className="relative overflow-visible max-[611px]:mx-0 max-[611px]:w-full max-[611px]:max-w-none">
        <div className="overflow-hidden sm:rounded-[34px] max-[611px]:rounded-none shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          <ShimmerImage src={service.heroImage} alt={title} className="h-[198px] w-full object-cover max-[611px]:h-[210px]" />
        </div>

        <div className="absolute left-1/2 top-full z-10 h-20 w-20 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border-4 border-white shadow-[0_10px_24px_rgba(15,23,42,0.12)] max-[611px]:border-0 max-[611px]:shadow-none">
          <ShimmerImage src={hostAvatarImage} alt={hostName} className="h-full w-full object-cover" />
        </div>
      </div>

      <div className="mx-auto max-w-[380px] space-y-5 px-6 pt-8 text-center max-[611px]:pt-12 sm:px-0">
        <div className="space-y-3">
          <h1 className="text-3xl px-2 font-semibold tracking-tight text-gray-900 sm:text-3xl">{title}</h1>
          <p className="mx-auto max-w-lg text-[11.76px] leading-5 text-gray-500 sm:text-[12.6px] sm:leading-6">
            {description}
          </p>
        </div>

        <div className="space-y-1 text-[10.08px] text-gray-700">
          <p>
            ★ {rating} • {reviewCount} • {service.hostRole} à {service.city}
          </p>
          <p className="text-gray-500 text-[10.08px]">{summary}</p>
        </div>
      </div>
    </>
  );
}

function ServiceSections({
  hostAvatarImage,
  heroImage,
  onShowReviews
}: {
  hostAvatarImage: string;
  heroImage: string;
  onShowReviews: () => void;
}) {
  return (
    <>
      <ExperienceList />
      <ReviewsBlock onShowReviews={onShowReviews} />
      <QualificationsBlock avatarImage={hostAvatarImage} />
      <PortfolioBlock heroImage={heroImage} />
      <WhereYoullGoBlock city="20122, Milan, Lombardie, Italie" placeLabel="Chez Victor" />
      <ThingsToKnowBlock />
      <QualityTrustBlock />
    </>
  );
}

function DesktopServiceDetailLayout({
  service,
  onShowDates,
  onShowReviews
}: {
  service: ReturnType<typeof getServiceDetailBySlug>;
  onShowDates: () => void;
  onShowReviews: () => void;
}) {
  return (
    <div className="hidden lg:block">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)]">
        <section className="relative space-y-6 lg:sticky lg:top-8 lg:flex lg:min-h-[calc(51vh-4rem)] lg:flex-col lg:pb-[96px] lg:self-start">
          <ServiceHeroPanel
            description={service.description}
            hostAvatarImage={service.hostAvatarImage}
            hostName={service.hostName}
            service={service}
            rating={service.rating}
            reviewCount={service.reviewCount}
            summary={service.summary}
            title={service.title}
          />

          <BookingSummaryCard price={service.price} onShowDates={onShowDates} />
        </section>

        <section className="relative space-y-2 lg:relative">
          <ServiceSections hostAvatarImage={service.hostAvatarImage} heroImage={service.heroImage} onShowReviews={onShowReviews} />
        </section>
      </div>
    </div>
  );
}

function MobileServiceDetailLayout({
  service,
  onShowDates,
  onShowReviews
}: {
  service: ReturnType<typeof getServiceDetailBySlug>;
  onShowDates: () => void;
  onShowReviews: () => void;
}) {
  return (
    <div className="lg:hidden">
      <section className="relative space-y-6">
        <ServiceHeroPanel
          description={service.description}
          hostAvatarImage={service.hostAvatarImage}
          hostName={service.hostName}
          service={service}
          rating={service.rating}
          reviewCount={service.reviewCount}
          summary={service.summary}
          title={service.title}
        />
      </section>

      <div className="relative top-0 mt-4 space-y-6">
        <ServiceSections hostAvatarImage={service.hostAvatarImage} heroImage={service.heroImage} onShowReviews={onShowReviews} />
      </div>

      <div className="pointer-events-none fixed bottom-[10px] left-4 right-4 z-50">
        <div className="pointer-events-auto mx-auto w-full max-w-[420px] rounded-[24px] p-2">
          <BookingSummaryCard price={service.price} onShowDates={onShowDates} />
        </div>
      </div>
    </div>
  );
}

export default function ServiceDetailPage() {
  const { serviceId } = useParams();
  const service = getServiceDetailBySlug(serviceId);
  const [showReviews, setShowReviews] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <BooksaHeader />

      <main className="relative px-32 py-6 max-[611px]:px-0 max-[611px]:py-0 max-[611px]:pb-[170px]">
        <div className="mx-auto max-w-[1500px] px-4 max-[611px]:px-0 sm:px-6 lg:px-8">
          <MobileServiceDetailLayout
            service={service}
            onShowDates={() => setShowScheduleDialog(true)}
            onShowReviews={() => setShowReviews(true)}
          />
          <DesktopServiceDetailLayout
            service={service}
            onShowDates={() => setShowScheduleDialog(true)}
            onShowReviews={() => setShowReviews(true)}
          />
        </div>
      </main>

      <ScheduleDialog open={showScheduleDialog} onClose={() => setShowScheduleDialog(false)} />
      <ReviewsDialog open={showReviews} onClose={() => setShowReviews(false)} />
      <Footer />
    </div>
  );
}
