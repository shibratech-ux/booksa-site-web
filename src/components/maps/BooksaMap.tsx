import { Plus, Maximize, Minus } from 'lucide-react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';

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
  controlLayout?: 'stacked' | 'split';
  basemap?: 'openstreetmap' | 'google-roadmap';
  appearance?: 'standard' | 'soft';
  children?: ReactNode;
  renderMarker?: (marker: BooksaMapMarker) => ReactNode;
};

function checkWebGLSupport(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

function latLngToTileFraction(lat: number, lon: number, zoom: number) {
  const n = 2 ** zoom;
  const x = ((lon + 180) / 360) * n;
  const clampedLat = Math.max(-85.0511, Math.min(85.0511, lat));
  const latRad = (clampedLat * Math.PI) / 180;
  const y = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n;
  return { x, y };
}

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
  controlLayout = 'stacked',
  basemap = 'openstreetmap',
  appearance = 'standard',
  children,
  renderMarker
}: BooksaMapProps) {
  const [zoom, setZoom] = useState<number>(initialZoom);
  const [isWebGLSupported, setIsWebGLSupported] = useState<boolean>(true);
  // VITE_GOOGLE_MAPS_API_KEY is the name set in .env.local and Netlify; the EMBED name is kept for older env files.
  const googleEmbedKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? import.meta.env.VITE_GOOGLE_MAPS_EMBED_API_KEY)?.trim();
  const useGoogleRoadmap = basemap === 'google-roadmap' && Boolean(googleEmbedKey);
  const imageryStyle = appearance === 'soft' && !useGoogleRoadmap ? { filter: 'saturate(0.72) contrast(0.94) brightness(1.04)' } : undefined;

  useEffect(() => {
    setIsWebGLSupported(checkWebGLSupport());
  }, []);

  const baseBounds = useMemo(
    () => initialBounds ?? defaultBounds(center, initialZoom),
    [center.latitude, center.longitude, initialBounds, initialZoom]
  );
  const bounds = boundsAtZoom(baseBounds, center, initialZoom, zoom);
  const mapUrl = useMemo(() => {
    if (useGoogleRoadmap && googleEmbedKey) {
      const query = new URLSearchParams({
        key: googleEmbedKey,
        center: `${center.latitude},${center.longitude}`,
        zoom: String(zoom),
        maptype: 'roadmap'
      });
      return `https://www.google.com/maps/embed/v1/view?${query.toString()}`;
    }
    const query = new URLSearchParams({
      bbox: `${bounds.west},${bounds.south},${bounds.east},${bounds.north}`,
      layer: 'mapnik'
    });

    return `https://www.openstreetmap.org/export/embed.html?${query.toString()}`;
  }, [bounds.east, bounds.north, bounds.south, bounds.west, center.latitude, center.longitude, googleEmbedKey, useGoogleRoadmap, zoom]);

  const centerTile = useMemo(
    () => latLngToTileFraction(center.latitude, center.longitude, zoom),
    [center.latitude, center.longitude, zoom]
  );

  const rasterTiles = useMemo(() => {
    const numTiles = 2 ** zoom;
    const baseX = Math.floor(centerTile.x);
    const baseY = Math.floor(centerTile.y);
    const fracX = centerTile.x - baseX;
    const fracY = centerTile.y - baseY;
    const tiles: Array<{ key: string; url: string; left: number; top: number }> = [];

    for (let dx = -2; dx <= 2; dx++) {
      for (let dy = -2; dy <= 2; dy++) {
        const tileX = (baseX + dx + numTiles) % numTiles;
        const tileY = baseY + dy;
        if (tileY >= 0 && tileY < numTiles) {
          tiles.push({
            key: `${zoom}-${tileX}-${tileY}`,
            url: `https://tile.openstreetmap.org/${zoom}/${tileX}/${tileY}.png`,
            left: (dx - fracX) * 256,
            top: (dy - fracY) * 256
          });
        }
      }
    }
    return tiles;
  }, [centerTile.x, centerTile.y, zoom]);

  const visibleMarkers = markers.filter((marker) =>
    marker.latitude <= bounds.north &&
    marker.latitude >= bounds.south &&
    marker.longitude <= bounds.east &&
    marker.longitude >= bounds.west
  );

  const openExpandedMap = () => {
    window.open(
      useGoogleRoadmap
        ? `https://www.google.com/maps/search/?api=1&query=${center.latitude},${center.longitude}`
        : `https://www.openstreetmap.org/?mlat=${center.latitude}&mlon=${center.longitude}#map=${zoom}/${center.latitude}/${center.longitude}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <div className={`relative overflow-hidden rounded-[19px] bg-[#e9e7e2] ${className}`.trim()}>
      {useGoogleRoadmap || isWebGLSupported ? (
        <iframe
          key={mapUrl}
          title={title}
          src={mapUrl}
          className={`absolute inset-0 h-full w-full border-0 ${interactive ? '' : 'pointer-events-none'}`}
          style={imageryStyle}
          loading="eager"
          referrerPolicy={useGoogleRoadmap ? 'no-referrer-when-downgrade' : 'no-referrer'}
          allowFullScreen
        />
      ) : (
        <div
          className={`absolute inset-0 h-full w-full overflow-hidden select-none bg-[#e9e7e2] ${interactive ? '' : 'pointer-events-none'}`}
          role="img"
          aria-label={title}
        >
          <div className="absolute left-1/2 top-1/2 h-0 w-0" style={imageryStyle}>
            {rasterTiles.map((tile) => (
              <img
                key={tile.key}
                src={tile.url}
                alt=""
                loading="eager"
                draggable={false}
                referrerPolicy="strict-origin-when-cross-origin"
                className="absolute max-w-none pointer-events-none"
                style={{
                  width: 256,
                  height: 256,
                  left: tile.left,
                  top: tile.top
                }}
              />
            ))}
          </div>
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-1 right-2 z-20 rounded bg-white/80 px-1.5 py-0.5 text-[10px] text-neutral-600 hover:underline pointer-events-auto"
          >
            © OpenStreetMap contributors
          </a>
        </div>
      )}

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
              className="block rounded-pill border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-900 shadow-[0_2px_7px_rgba(0,0,0,0.24)]"
            >
              {marker.label}
            </span>
          )}
        </div>
      ))}

      {children}

      {showControls ? (
        <div className={`absolute right-4 top-4 z-20 flex flex-col text-neutral-900 ${controlLayout === 'split' ? 'gap-3' : 'overflow-hidden rounded-sm bg-white shadow-md'}`}>
          {showExpandControl ? (
            <button
              type="button"
              aria-label="Expand map"
              onClick={openExpandedMap}
              className={`inline-flex items-center justify-center bg-white shadow-md ${controlLayout === 'split' ? 'h-[44px] w-[44px] rounded-full' : 'h-12 w-12 border-b border-neutral-200'}`}
            >
              <Maximize className="h-5 w-5" aria-hidden="true" />
            </button>
          ) : null}
          <div className={`flex flex-col overflow-hidden bg-white shadow-md ${controlLayout === 'split' ? 'rounded-full' : ''}`}>
            <button type="button" aria-label="Zoom in" disabled={zoom >= maxZoom} onClick={() => setZoom((value) => Math.min(maxZoom, value + 1))} className={`inline-flex items-center justify-center border-b border-neutral-200 disabled:opacity-35 ${controlLayout === 'split' ? 'h-[44px] w-[44px]' : 'h-12 w-12'}`}>
              <Plus className="h-5 w-5" aria-hidden="true" />
            </button>
            <button type="button" aria-label="Zoom out" disabled={zoom <= minZoom} onClick={() => setZoom((value) => Math.max(minZoom, value - 1))} className={`inline-flex items-center justify-center disabled:opacity-35 ${controlLayout === 'split' ? 'h-[44px] w-[44px]' : 'h-12 w-12'}`}>
              <Minus className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
