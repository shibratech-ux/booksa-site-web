import { AddRegular, MaximizeRegular, SubtractRegular } from '@fluentui/react-icons';
import { useMemo, useState, type ReactNode } from 'react';

export type MapPoint = {
  latitude: number;
  longitude: number;
};

export type MapBounds = {
  north: number;
  east: number;
  south: number;
  west: number;
};

export type BooksaMapMarker = MapPoint & {
  id: string;
  label: string;
  ariaLabel?: string;
};

type BooksaMapProps = {
  center: MapPoint;
  title: string;
  className?: string;
  initialZoom?: number;
  minZoom?: number;
  maxZoom?: number;
  initialBounds?: MapBounds;
  markers?: BooksaMapMarker[];
  interactive?: boolean;
  showControls?: boolean;
  showExpandControl?: boolean;
  children?: ReactNode;
  renderMarker?: (marker: BooksaMapMarker) => ReactNode;
};

function defaultBounds(center: MapPoint, zoom: number): MapBounds {
  const scale = 2 ** (15 - zoom);
  const latitudeDelta = 0.008 * scale;
  const longitudeDelta = 0.012 * scale;

  return {
    north: center.latitude + latitudeDelta,
    east: center.longitude + longitudeDelta,
    south: center.latitude - latitudeDelta,
    west: center.longitude - longitudeDelta
  };
}

function boundsAtZoom(bounds: MapBounds, center: MapPoint, initialZoom: number, zoom: number): MapBounds {
  const scale = 2 ** (zoom - initialZoom);
  const latitudeSpan = (bounds.north - bounds.south) / scale;
  const longitudeSpan = (bounds.east - bounds.west) / scale;

  return {
    north: center.latitude + latitudeSpan / 2,
    east: center.longitude + longitudeSpan / 2,
    south: center.latitude - latitudeSpan / 2,
    west: center.longitude - longitudeSpan / 2
  };
}

function markerPosition(marker: BooksaMapMarker, bounds: MapBounds) {
  return {
    left: `${((marker.longitude - bounds.west) / (bounds.east - bounds.west)) * 100}%`,
    top: `${((bounds.north - marker.latitude) / (bounds.north - bounds.south)) * 100}%`
  };
}

export function BooksaMap({
  center,
  title,
  className = '',
  initialZoom = 15,
  minZoom = 11,
  maxZoom = 18,
  initialBounds,
  markers = [],
  interactive = true,
  showControls = true,
  showExpandControl = true,
  children,
  renderMarker
}: BooksaMapProps) {
  const [zoom, setZoom] = useState<number>(initialZoom);
  const baseBounds = useMemo(
    () => initialBounds ?? defaultBounds(center, initialZoom),
    [center.latitude, center.longitude, initialBounds, initialZoom]
  );
  const bounds = boundsAtZoom(baseBounds, center, initialZoom, zoom);
  const mapUrl = useMemo(() => {
    const bbox = [bounds.west, bounds.south, bounds.east, bounds.north].join(',');
    return `https://www.openstreetmap.org/export/embed.html?${new URLSearchParams({ bbox, layer: 'mapnik' }).toString()}`;
  }, [bounds.east, bounds.north, bounds.south, bounds.west]);
  const visibleMarkers = markers.filter((marker) =>
    marker.latitude <= bounds.north &&
    marker.latitude >= bounds.south &&
    marker.longitude <= bounds.east &&
    marker.longitude >= bounds.west
  );

  const openExpandedMap = () => {
    window.open(
      `https://www.openstreetmap.org/#map=${zoom}/${center.latitude}/${center.longitude}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <div className={`relative overflow-hidden bg-[#e9e7e2] ${className}`.trim()}>
      <iframe
        key={mapUrl}
        title={title}
        src={mapUrl}
        className={`absolute inset-0 h-full w-full border-0 ${interactive ? '' : 'pointer-events-none'}`}
        loading="eager"
        referrerPolicy="strict-origin-when-cross-origin"
      />

      {visibleMarkers.map((marker) => (
        <div
          key={marker.id}
          className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
          style={markerPosition(marker, bounds)}
        >
          {renderMarker ? (
            renderMarker(marker)
          ) : (
            <span
              aria-label={marker.ariaLabel ?? marker.label}
              className="block rounded-full border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-900 shadow-[0_2px_7px_rgba(0,0,0,0.24)]"
            >
              {marker.label}
            </span>
          )}
        </div>
      ))}

      {children}

      {showControls ? (
        <div className="absolute right-4 top-4 z-20 flex flex-col overflow-hidden rounded-full bg-white text-neutral-900 shadow-md">
          {showExpandControl ? (
            <button type="button" aria-label="Expand map" onClick={openExpandedMap} className="inline-flex h-12 w-12 items-center justify-center border-b border-neutral-200">
              <MaximizeRegular className="h-5 w-5" />
            </button>
          ) : null}
          <button type="button" aria-label="Zoom in" disabled={zoom >= maxZoom} onClick={() => setZoom((value) => Math.min(maxZoom, value + 1))} className="inline-flex h-12 w-12 items-center justify-center border-b border-neutral-200 disabled:opacity-35">
            <AddRegular className="h-5 w-5" />
          </button>
          <button type="button" aria-label="Zoom out" disabled={zoom <= minZoom} onClick={() => setZoom((value) => Math.max(minZoom, value - 1))} className="inline-flex h-12 w-12 items-center justify-center disabled:opacity-35">
            <SubtractRegular className="h-5 w-5" />
          </button>
        </div>
      ) : null}

      <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="absolute bottom-1 left-2 z-20 rounded bg-white/90 px-1.5 py-0.5 text-[9px] text-neutral-700">
        © OpenStreetMap contributors
      </a>
    </div>
  );
}
