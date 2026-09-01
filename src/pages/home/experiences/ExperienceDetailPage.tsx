import React, { useEffect, useState } from 'react';
import {
  Accessibility,
  CheckCircle2,
  CalendarX,
  ChevronLeft,
  ChevronRight,
  Activity,
  Globe,
  Heart,
  MapPin,
  Share2,
  Star,
  Coffee,
  Users,
} from 'lucide-react';
import { createPortal } from 'react-dom';
import BooksaLogo from '@/components/layout/BooksaLogo';
import { navigationIcons } from '@/icons/navigation.icons';
import { useTheme } from '@/theme/useTheme';
import { ShimmerImage } from '@/components/ui/ShimmerImage';

interface ExperienceProps {
  title?: string;
  hostName?: string;
  hostDescription?: string;
  price?: number;
  rating?: number;
  reviews?: number;
  location?: string;
  state?: string;
  images?: string[];
}

const defaultImages = [
  'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1556910103-1c02745a872f?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1607532941433-304659e8198a?auto=format&fit=crop&q=80&w=1200'
];

const highlights = [
  {
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    title: 'Hosted by 逹也',
    description: 'Founder of EAST GREEN MATCHA'
  },
  {
    icon: MapPin,
    title: 'Jinnan Paircity building 502 room',
    description: 'Shibuya, Tokyo Prefecture'
  },
];

const whatYoullDo = [
  {
    title: 'Prepare the tea space',
    description: 'Start with a calm, warm introduction and the tools needed for the ceremony.'
  },
  {
    title: 'Whisk premium matcha',
    description: 'Learn the rhythm, texture, and technique that creates a smooth bowl of matcha.'
  },
  {
    title: 'Taste and slow down',
    description: 'Finish by savoring the tea and understanding the story behind the craft.'
  }
];

const bookingSlots = [
  {
    day: 'Sunday, August 16',
    time: '12:30 - 2:30 PM',
    note: '2 spots left',
    active: true
  },
  {
    day: 'Sunday, September 13',
    time: '12:30 - 2:30 PM',
    note: 'Sold out',
    active: false
  }
];

const reviewItems = [
  {
    name: 'Jennifer',
    location: 'United States',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200',
    date: 'Today',
    text: 'Amazing'
  },
  {
    name: 'David',
    location: 'United States',
    avatarInitial: 'D',
    avatarTone: 'indigo',
    date: 'May 2026',
    text: 'A truly fun Dumpling experience with Chef, and a fun tour of Silver oak. Then the perfect pairing of sauces to the wines. Loved it would recommend to anyone.'
  },
  {
    name: 'Hilary',
    location: 'San Francisco, CA',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    date: 'April 2026',
    text: 'Loved this class so much that I gifted it to my mom and dad! Such a fun and delicious experience! Thank you so much!'
  },
  {
    name: 'Kelley',
    location: 'Vacaville, CA',
    avatarInitial: 'K',
    avatarTone: 'rose',
    date: 'April 2026',
    text: 'This was such a fun class. Small group of 6. Great instructions from the Chef and her staff. Wonderful wine along the way and most importantly delicious dumplings!!!'
  }
] as const;

const moreExperiences = [
  {
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&q=80&w=800',
    title: 'Explore Tokyo’s music scene with an insider',
    category: 'Performances',
    duration: '3.5 hours',
    price: '$59',
    rating: '4.96'
  },
  {
    image: 'https://images.unsplash.com/photo-1498579809087-ef1e558fd1da?auto=format&fit=crop&q=80&w=800',
    title: 'Roll your own nigiri, tamagoyaki sushi and Maki',
    category: 'Cooking',
    duration: '2 hours',
    price: '$56',
    rating: '4.94'
  },
  {
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800',
    title: 'Tokyo: Shinjuku Local Bar & Izakaya Crawl Tour',
    category: 'Food tours',
    duration: '3 hours',
    price: '$37',
    rating: '4.82'
  },
  {
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=800',
    title: 'Explore Tokyo by go-kart (Driving Documents...',
    category: 'Outdoors',
    duration: '2 hours',
    price: '$81',
    rating: '4.82'
  }
] as const;

const aboutText =
  "I’m Tatsuya. My family hails from Shizuoka Prefecture, which is renowned for its tea-growing tradition. I grew up on a tea farm that's been in my family for four generations, and in 2023, I founded East Green Matcha to share the finest matcha made from first-flush leaves with travelers from around the world. I can't wait to share my expertise and passion for the art of tea with you.";

const scheduleTimes = [
  {
    time: '10:00 - 11:15 AM',
    priceLabel: '$37 / guest',
    availability: '3 spots available',
    active: true
  },
  {
    time: '1:00 - 2:15 PM',
    priceLabel: '$37 / guest',
    availability: '3 spots available',
    active: true
  },
  {
    time: '3:00 - 4:15 PM',
    priceLabel: '$37 / guest',
    availability: 'Sold out',
    active: false
  }
];

function ReviewsSection() {
  return (
    <section className="pt-2">
      <h2 className="mb-6 text-[18.48px] font-medium tracking-tight text-gray-950 sm:text-[20.16px]">
        <span className="inline-flex items-center gap-2">
          <Star className="h-5 w-5 fill-current text-gray-950" />
          5.0 · 11 reviews
        </span>
      </h2>

      <div className="mt-8 grid gap-x-16 gap-y-14 md:grid-cols-2">
        {reviewItems.map((review) => (
          <article key={review.name} className="max-w-[360px]">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-rose-100 text-sm font-semibold text-rose-700">
                {'avatarUrl' in review ? (
                  <ShimmerImage src={review.avatarUrl} alt={review.name} className="h-full w-full object-cover" />
                ) : (
                  <span className={review.avatarTone === 'indigo' ? 'text-indigo-700' : 'text-rose-700'}>{review.avatarInitial}</span>
                )}
              </div>
              <div>
                <h3 className="text-xs font-semibold text-gray-950">{review.name}</h3>
                <p className="text-xs text-gray-500">{review.location}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-[8.4px] text-gray-700">
              <span className="leading-none">★★★★★</span>
              <span>· {review.date}</span>
            </div>

            <p className="mt-3 text-xs font-medium leading-5 text-gray-700">{review.text}</p>
          </article>
        ))}
      </div>

      <button
        type="button"
        className="mt-8 rounded-lg border border-gray-900 px-5 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
      >
        Show all 11 reviews
      </button>
    </section>
  );
}

function MoreExperiencesSection() {
  return (
    <section className="pt-16">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-[18.48px] font-medium tracking-tight text-gray-950 sm:text-[23.52px]">
          <span className="inline-flex items-center gap-3">
            More experiences in Shibuya
  
          </span>
        </h2>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-900 transition hover:bg-gray-200"
            aria-label="Previous experiences"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-900 transition hover:bg-gray-200"
            aria-label="Next experiences"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {moreExperiences.map((experience) => (
          <article key={experience.title} className="space-y-3">
            <div className="aspect-[1] overflow-hidden rounded-[24px] bg-gray-100 shadow-sm">
              <ShimmerImage src={experience.image} alt={experience.title} className="h-full w-full object-cover" />
            </div>

            <div className="space-y-1">
              <h3 className="text-[10.92px] font-medium leading-4 text-gray-950">{experience.title}</h3>
              <p className="text-xs text-gray-500">
                {experience.category} · {experience.duration}
              </p>
              <p className="text-xs text-gray-700">
                From <span className="font-medium">{experience.price}</span> / guest · ★ {experience.rating}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function AboutSection({ hostName = '逹也', hostDescription = 'Founder of EAST GREEN MATCHA' }: { hostName?: string; hostDescription?: string }) {
  return (
    <section className="pt-16">
      <h2 className="mb-6 text-[18.48px] font-medium tracking-tight text-gray-950 sm:text-[20.16px]">About me</h2>

      <div className="grid gap-8 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start">
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-100 bg-white px-6 py-8 text-center">
            <div className="mx-auto h-24 w-24 overflow-hidden rounded-full">
              <ShimmerImage
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300"
                alt={hostName}
                className="h-full w-full object-cover"
              />
            </div>
            <p className="mt-5 text-4xl font-semibold tracking-tight text-gray-950">{hostName}</p>
            <p className="mt-2 text-sm text-gray-500">{hostDescription}</p>
          </div>

          <button
            type="button"
            className="flex h-14 w-full items-center justify-center rounded-2xl bg-gray-100 px-6 text-sm font-semibold text-gray-900 transition hover:bg-gray-200"
          >
            Message {hostName}
          </button>

          <p className="mx-auto max-w-[340px] text-center text-[9.24px] leading-5 text-gray-500">
            To help protect your payment, always use Booksa to send money and communicate with hosts.
          </p>
        </div>

        <div className="max-w-[740px]">
          <p className="text-[12.6px] leading-7 text-gray-800">{aboutText}</p>
        </div>
      </div>
    </section>
  );
}

function ThingsToKnowSection() {
  const items = [
    {
      icon: Users,
      title: 'Guest requirements',
      description: 'Guests ages 14 and up can attend, up to 3 guests total.'
    },
    {
      icon: Activity,
      title: 'Activity level',
      description: 'The activity level for this experience is light and the skill level is beginner.'
    },
    {
      icon: CheckCircle2,
      title: "What's included",
      description: 'All drinks listed on the page'
    },
    {
      icon: Accessibility,
      title: 'Accessibility',
      description: (
        <>
          Message your host for details. <span className="underline">Learn more</span>
        </>
      )
    },
    {
      icon: CalendarX,
      title: 'Cancellation policy',
      description: 'Cancel at least 1 day before the start time for a full refund.'
    }
  ] as const;

  return (
    <section className="pt-16">
      <div className="border-t border-gray-200 pt-10">
        <h2 className="mb-8 text-[18.48px] font-semibold tracking-tight text-gray-950 sm:text-[23.52px]">Things to know</h2>

        <div className="grid gap-x-14 gap-y-14 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <article key={item.title} className="max-w-[320px]">
                <Icon className="h-7 w-7 text-gray-900" />
                <h3 className="mt-5 text-[12.6px] font-semibold text-gray-950">{item.title}</h3>
                <p className="mt-2 text-[12.6px] leading-6 text-gray-500">{item.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const ExperienceListing: React.FC<ExperienceProps> = ({
  title = 'Savor Premium Matcha in a tea ceremony in Shibuya',
  hostName = '逹也',
  hostDescription = 'Founder of EAST GREEN MATCHA',
  price = 37,
  rating = 5.0,
  reviews = 447,
  location = 'Shibuya',
  state = 'Tokyo Prefecture',
  images = defaultImages
}) => {
  const { theme } = useTheme();
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const galleryImages = [
    images[0] ?? defaultImages[0],
    images[1] ?? defaultImages[1],
    images[2] ?? defaultImages[2],
    images[3] ?? defaultImages[3]
  ];
  const pageStyles = {
    backgroundColor: theme.colors.background,
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.plusJakartaSans.join(', ')
  } as const;
  const surfaceStyles = {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border
  } as const;
  const headingStyles = {
    fontSize: `clamp(0.84rem, 1.68vw, ${theme.typography.headings.h1})`,
    lineHeight: 1.1,
    letterSpacing: '-0.03em'
  } as const;

  useEffect(() => {
    if (!isScheduleOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsScheduleOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isScheduleOpen]);

  return (
    <div className="min-h-screen" style={pageStyles}>
      <header
        className="sticky top-0 z-30 border-b backdrop-blur"
        style={{
          ...surfaceStyles,
          backgroundColor: `${theme.colors.surface}f2`
        }}
      >
        <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <BooksaLogo className="h-10 w-[110px]" />

          <div
            className="hidden items-center rounded-full border shadow-[var(--shadow-sm)] md:flex"
            style={surfaceStyles}
          >
            <button
              className="flex items-center gap-2 border-r px-4 py-3 text-sm font-medium"
              style={{ borderColor: theme.colors.border }}
            >
              <span>🎈</span>
              <span>Anywhere</span>
            </button>
            <button className="border-r px-4 py-3 text-sm font-medium" style={{ borderColor: theme.colors.border }}>
              Anytime
            </button>
            <button className="px-4 py-3 text-sm font-medium">Add guests</button>
            <button
              className="m-1 flex h-10 w-10 items-center justify-center rounded-full text-white"
              style={{ backgroundColor: theme.colors.primary[500] }}
            >
              <navigationIcons.search className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button className="hidden rounded-full px-4 py-2 text-sm font-medium transition hover:bg-black/5 md:block">
              Become a host
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-black/5">
              <Globe className="h-4 w-4" />
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-black/5">
              <navigationIcons.menu className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1340px] px-10 py-10 sm:px-8 lg:px-12">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_430px] xl:gap-10">
          <section className="space-y-8">
            <div className="grid gap-2 overflow-hidden rounded-2xl md:grid-cols-2 md:grid-rows-2">
              <div className="aspect-[0.98] overflow-hidden rounded-tl-[32px]">
                <ShimmerImage src={galleryImages[0]} alt="Experience photo 1" className="h-full w-full object-cover" />
              </div>
              <div className="aspect-[0.98] overflow-hidden rounded-tr-[32px]">
                <ShimmerImage src={galleryImages[1]} alt="Experience photo 2" className="h-full w-full object-cover" />
              </div>
              <div className="aspect-[0.98] overflow-hidden rounded-bl-[32px]">
                <ShimmerImage src={galleryImages[2]} alt="Experience photo 3" className="h-full w-full object-cover" />
              </div>
              <div className="relative aspect-[0.98] overflow-hidden rounded-br-[32px]">
                <ShimmerImage src={galleryImages[3]} alt="Experience photo 4" className="h-full w-full object-cover" />
                <button
                  type="button"
                  className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#d3a8a2] text-gray-900 shadow-lg transition hover:scale-105"
                  aria-label="View photos"
                >
                  <Share2 className="h-2.5 w-2.5" />
                </button>
              </div>
            </div>

            <section className="space-y-5 px-1">
              <h2 className="text-[23.52px] font-semibold tracking-tight text-gray-950 sm:text-[26.88px]" style={{ color: theme.colors.textPrimary }}>
                What you’ll do
              </h2>
              <div className="space-y-5">
                {whatYoullDo.map((step, index) => (
                  <div key={step.title} className="flex gap-4">
                    <div
                      className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
                      style={{ backgroundColor: `${theme.colors.primary[50]}99`, color: theme.colors.primary[700] }}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-md font-medium text-gray-950" style={{ color: theme.colors.textPrimary }}>
                        {step.title}
                      </h3>
                      <p className="mt-1 max-w-2xl text-xs leading-6" style={{ color: theme.colors.textSecondary }}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <ReviewsSection />
            <MoreExperiencesSection />
            <AboutSection hostName={hostName} hostDescription={hostDescription} />
          </section>

          <aside className="space-y-8 xl:pt-1">
            <section
              className="pb-2 pt-0"
            >
              <div className="space-y-5 text-center">
                <h1 className="mx-auto max-w-[19ch] font-semibold text-gray-950" style={headingStyles}>
                  {title}
                </h1>

                <p className="mx-auto max-w-[520px] font-light text-[12.6px] leading-6" style={{ color: theme.colors.textSecondary }}>
                  With the recent matcha boom, true quality is harder to find. I come from four generations of tea farmers. In my tea room, whisk your own bowl of premium matcha and slow down through a Japanese ritual.
                </p>

                <div className="space-y-1 text-xs" style={{ color: theme.colors.textSecondary }}>
                  <div className="flex items-center justify-center gap-2">
                    <Star className="h-2.5 w-2.5 fill-current" style={{ color: theme.colors.textPrimary }} />
                    <span className="font-medium">{rating.toFixed(1)}</span>
                    <span  className='text-xs' >·</span>
                    <span>{reviews} reviews</span>
                  </div>
                  <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
                    {location} · Cultural tours
                  </p>
                </div>

                <div className="flex items-center justify-center gap-6 pt-1">
                  <button className="rounded-full p-2 transition hover:bg-black/5" aria-label="Share">
                    <Share2 className="h-5 w-5" />
                  </button>
                  <button className="rounded-full p-2 transition hover:bg-black/5" aria-label="Save">
                    <Heart className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="my-8 border-t" style={{ borderColor: theme.colors.border }} />

              <div className="space-y-5">
                {highlights.map((item) => {
                  return (
                    <div key={item.title} className="flex items-start gap-4">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border shadow-sm"
                        style={{ borderColor: theme.colors.border, backgroundColor: theme.colors.surface }}
                      >
                        {'avatarUrl' in item ? (
                          <ShimmerImage src={item.avatarUrl} alt={item.title} className="h-full w-full object-cover" />
                        ) : (
                          <MapPin className="h-5 w-5" style={{ color: theme.colors.textSecondary }} />
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-950" style={{ color: theme.colors.textPrimary }}>
                          {item.title}
                        </h3>
                        <p className="mt-0.5 text-[10.08px] leading-5" style={{ color: theme.colors.textSecondary }}>
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section
              className="dashboard-card dashboard-card-elevated sticky top-28 rounded-2xl p-6"
            >
              <div className="flex items-end justify-between gap-4 pb-4">
                <div>
                  <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                    From <span className="text-[11.76px] font-semibold underline" style={{ color: theme.colors.textPrimary }}>${price}</span>
                  </p>
                  <p className="text-[8.4px] font-normal" style={{ color: theme.colors.primary[500] }}>
                    Free cancellation
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsScheduleOpen(true)}
                  className="rounded-full px-6 py-3 text-sm font-semibold text-white transition hover:brightness-95"
                  style={{ backgroundColor: theme.colors.primary[500] }}
                >
                  Show dates
                </button>
              </div>

              <div className="space-y-3 border-t pt-4" style={{ borderColor: theme.colors.border }}>
                {bookingSlots.map((slot) => (
                  <div
                    key={slot.day}
                    className={`flex items-start justify-between rounded-2xl border p-4 ${
                      slot.active ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50/70 opacity-70'
                    }`}
                    style={slot.active ? { borderColor: theme.colors.border, backgroundColor: theme.colors.surface } : undefined}
                  >
                    <div>
                      <h4 className={`text-sm font-semibold ${slot.active ? '' : 'text-gray-400'}`} style={slot.active ? { color: theme.colors.textPrimary } : undefined}>
                        {slot.day}
                      </h4>
                      <p className={`mt-1 text-sm ${slot.active ? '' : 'text-gray-400'}`} style={slot.active ? { color: theme.colors.textSecondary } : undefined}>
                        {slot.time}
                      </p>
                    </div>
                    <span className="text-sm font-semibold" style={{ color: slot.active ? theme.colors.primary[500] : theme.colors.textSecondary }}>
                      {slot.note}
                    </span>
                  </div>
                ))}
              </div>
            </section>

          </aside>
        </div>

        <ThingsToKnowSection />
      </main>

      {isScheduleOpen && typeof document !== 'undefined'
        ? createPortal(
            <div
              className="fixed inset-0 z-[60] flex items-center justify-center px-3 py-6 backdrop-blur-[2px]"
              style={{ backgroundColor: 'rgba(2, 6, 23, 0.72)' }}
            >
              <div
                className="dashboard-card dashboard-card-elevated relative flex max-h-[calc(100vh-3rem)] w-full max-w-[590px] flex-col overflow-hidden rounded-3xl"
              >
                <button
                  type="button"
                  onClick={() => setIsScheduleOpen(false)}
                  className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full transition hover:text-gray-900"
                  style={{ color: theme.colors.textSecondary }}
                  aria-label="Close dialog"
                >
                  <navigationIcons.close className="h-5 w-5" />
                </button>

                <div className="border-b px-6 pb-5 pt-8" style={{ borderColor: theme.colors.border }}>
                  <h2 className="text-[11.76px] font-semibold tracking-tight" style={{ color: theme.colors.textPrimary }}>
                    Select a time
                  </h2>
                </div>

                <div className="border-b px-6 py-5" style={{ borderColor: theme.colors.border }}>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[7.56px] font-semibold" style={{ color: theme.colors.textPrimary }}>
                        1 adult
                      </p>
                      <p className="text-[6.72px]" style={{ color: theme.colors.textSecondary }}>
                        Age 14+
                      </p>
                    </div>
                    <div className="flex items-center gap-5 text-sm" style={{ color: theme.colors.textSecondary }}>
                      <button type="button" className="leading-none transition hover:text-gray-900" aria-label="Decrease guests">
                        −
                      </button>
                      <span className="text-[7.56px] font-semibold" style={{ color: theme.colors.textPrimary }}>
                        1
                      </span>
                      <button type="button" className="leading-none transition hover:text-gray-900" aria-label="Increase guests">
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className="border-b px-6 py-5" style={{ borderColor: theme.colors.border }}>
                  <div className="flex items-center justify-between">
                    <p className="text-[8.4px] font-semibold" style={{ color: theme.colors.textPrimary }}>
                      July 2026
                    </p>
                    <button type="button" className="rounded-full p-2 transition hover:bg-black/5" aria-label="Open calendar" style={{ color: theme.colors.textSecondary }}>
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="5" width="18" height="16" rx="2" />
                        <path d="M8 3v4M16 3v4M3 11h18" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5">
                  <p className="mb-4 text-[8.4px] font-semibold" style={{ color: theme.colors.textPrimary }}>
                    Tomorrow, July 15
                  </p>
                  <div className="space-y-3">
                    {scheduleTimes.map((slot) => (
                      <button
                        key={slot.time}
                        type="button"
                        className={`flex w-full items-center justify-between rounded-[20px] border px-5 py-4 text-left transition ${
                          slot.active
                            ? 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                            : 'border-gray-100 bg-gray-50 text-gray-400'
                        }`}
                        style={slot.active ? { borderColor: theme.colors.border, backgroundColor: theme.colors.surface } : undefined}
                      >
                        <div>
                          <p className={`text-sm ${slot.active ? '' : 'text-gray-400 line-through'}`} style={slot.active ? { color: theme.colors.textPrimary } : undefined}>
                            {slot.time}
                          </p>
                          <p className="mt-1 text-[8.4px] font-medium" style={{ color: theme.colors.textPrimary }}>
                            {slot.priceLabel}
                          </p>
                          <p className="text-[8.4px]" style={{ color: theme.colors.textSecondary }}>
                            Private pricing available
                          </p>
                        </div>
                        <p className="text-[8.4px] font-medium" style={{ color: theme.colors.textSecondary }}>
                          {slot.availability}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t px-6 py-4" style={{ borderColor: theme.colors.border }}>
                  <p className="text-[8.4px]" style={{ color: theme.colors.textSecondary }}>
                    <span className="font-semibold underline" style={{ color: theme.colors.textPrimary }}>
                      ${price}
                    </span>{' '}
                    for 1 guest
                  </p>
                  <button
                    type="button"
                    className="rounded-full px-8 py-3 text-xs font-semibold text-white transition hover:brightness-95"
                    style={{ backgroundColor: theme.colors.primary[500] }}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
};

export default ExperienceListing;
