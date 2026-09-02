import { useNavigate } from 'react-router-dom';
import MarketplaceMobileNav from '@/components/layout/MarketplaceMobileNav';
import { BooksaMap } from '@/components/maps/BooksaMap';
import { ThreeDIcon } from '@/components/ui/ThreeDIcon';
import { DEFAULT_MAP_VIEW } from '@/pages/home/listing/seeAllMapDefaults';
import { ROUTES } from '@/utils/constants';

function TripEmptyState() {
  const navigate = useNavigate();

  return (
    <div className="flex h-full flex-col items-center justify-center px-7 pb-5 text-center">
      <div className="relative flex h-[176px] w-[209px] items-center justify-center">
        <span className="select-none text-[108.192px]" aria-hidden="true">🗺️</span>
        <ThreeDIcon
          name="pastTrips"
          sourceSize={200}
          className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_12px_14px_rgba(15,23,42,0.18)]"
        />
      </div>
      <h1 className="mt-2 text-[23.52px] font-semibold tracking-[-0.035em]">Map out your next trip</h1>
      <p className="mt-3 max-w-[308px] text-[14.112px] leading-[1.45] text-slate-500">
        After you book a trip, experience, or service, come back here to see details, explore the map, and save places to visit.
      </p>
      <button
        type="button"
        onClick={() => navigate(ROUTES.home)}
        className="mt-5 h-11 rounded-md bg-[#e9145f] px-6 text-[15.288px] font-semibold text-white shadow-sm transition active:scale-95"
      >
        Get started
      </button>
    </div>
  );
}

export default function TripsPage() {
  return (
    <main className="h-[100dvh] overflow-hidden bg-white text-slate-900">
      <div className="relative h-[calc(100dvh-66px)] sm:hidden">
        <div className="absolute inset-x-0 top-0 h-[341px]">
          <BooksaMap
            title="Map for planning your next Booksa trip"
            center={DEFAULT_MAP_VIEW.center}
            initialBounds={DEFAULT_MAP_VIEW.bounds}
            initialZoom={DEFAULT_MAP_VIEW.zoom}
            minZoom={DEFAULT_MAP_VIEW.minZoom}
            maxZoom={DEFAULT_MAP_VIEW.maxZoom}
            showExpandControl={false}
            className="h-full w-full"
          />
        </div>

        <section className="absolute inset-x-0 bottom-0 top-[341px] z-20 rounded-sm bg-white shadow-[0_-7px_24px_rgba(15,23,42,0.10)]">
          <div className="mx-auto mt-1.5 h-1 w-10 rounded-sm bg-slate-300" />
          <TripEmptyState />
        </section>
      </div>

      <div className="hidden min-h-screen grid-cols-2 sm:grid">
        <BooksaMap
          title="Map for planning your next Booksa trip"
          center={DEFAULT_MAP_VIEW.center}
          initialBounds={DEFAULT_MAP_VIEW.bounds}
          initialZoom={DEFAULT_MAP_VIEW.zoom}
          minZoom={DEFAULT_MAP_VIEW.minZoom}
          maxZoom={DEFAULT_MAP_VIEW.maxZoom}
          showExpandControl={false}
          className="h-screen w-full"
        />
        <section className="bg-white"><TripEmptyState /></section>
      </div>

      <MarketplaceMobileNav />
    </main>
  );
}
