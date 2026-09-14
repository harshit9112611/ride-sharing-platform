import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import { LOCATION_COORDS } from '../../utils/constants';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default marker icons (known Vite issue)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Haversine fallback (used if OSRM fails)
function haversineKm([lat1, lng1], [lat2, lng2]) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// Component to auto-fit bounds when route changes
function FitBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions?.length > 1) {
      map.fitBounds(positions, { padding: [30, 30] });
    }
  }, [positions, map]);
  return null;
}

export default function RideMap({ source, destination }) {
  const sourceCoord = LOCATION_COORDS[source];
  const destCoord = LOCATION_COORDS[destination];

  const [routePath, setRoutePath] = useState(null);
  const [distanceKm, setDistanceKm] = useState(null);
  const [durationMin, setDurationMin] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!sourceCoord || !destCoord) {
      setRoutePath(null);
      setDistanceKm(null);
      setDurationMin(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const fetchRoute = async () => {
      try {
        // OSRM expects {lng},{lat};{lng},{lat}
        const url =
          `https://router.project-osrm.org/route/v1/driving/` +
          `${sourceCoord[1]},${sourceCoord[0]};${destCoord[1]},${destCoord[0]}` +
          `?overview=full&geometries=geojson`;

        const res = await fetch(url);
        if (!res.ok) throw new Error('OSRM failed');
        const data = await res.json();

        const route = data.routes?.[0];
        if (!route?.geometry?.coordinates?.length) throw new Error('No route');

        // Convert [lng, lat] → [lat, lng] for Leaflet
        const coords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

        if (!cancelled) {
          setRoutePath(coords);
          setDistanceKm((route.distance / 1000).toFixed(1));
          setDurationMin(Math.round(route.duration / 60));
        }
      } catch (e) {
        if (!cancelled) {
          // Fallback: straight line + Haversine distance
          setRoutePath([sourceCoord, destCoord]);
          setDistanceKm(haversineKm(sourceCoord, destCoord).toFixed(1));
          setDurationMin(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchRoute();
    return () => {
      cancelled = true;
    };
  }, [source, destination, sourceCoord, destCoord]);

  if (!sourceCoord || !destCoord) return null;

  const center = [
    (sourceCoord[0] + destCoord[0]) / 2,
    (sourceCoord[1] + destCoord[1]) / 2,
  ];

  const positions = routePath || [sourceCoord, destCoord];

  return (
    <div className="relative rounded-xl overflow-hidden border border-border">
      {/* Info badge */}
      <div className="absolute top-2 left-2 z-[1000] rounded-lg bg-white/95 px-3 py-1.5 text-xs font-semibold text-primary shadow flex flex-col gap-0.5">
        <span>
          {loading ? 'Calculating route…' : `Distance: ~${distanceKm} km`}
        </span>
        {!loading && durationMin != null && (
          <span className="text-[10px] font-normal text-text-secondary">
            Est. drive: ~{durationMin} min
          </span>
        )}
      </div>

      <MapContainer
        center={center}
        zoom={12}
        style={{ height: '320px', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={sourceCoord}>
          <Popup>Pickup: {source}</Popup>
        </Marker>

        <Marker position={destCoord}>
          <Popup>Destination: {destination}</Popup>
        </Marker>

        {routePath && (
          <Polyline
            positions={routePath}
            pathOptions={{
              color: '#2563EB',
              weight: 5,
              opacity: 0.85,
            }}
          />
        )}

        <FitBounds positions={positions} />
      </MapContainer>
    </div>
  );
}