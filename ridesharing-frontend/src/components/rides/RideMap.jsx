import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { LOCATION_COORDS } from '../../utils/constants';

// Fix Leaflet's default icon path issues in Vite/Webpack
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function haversineDistance(coords1, coords2) {
  function toRad(x) {
    return x * Math.PI / 180;
  }
  const lon1 = coords1[1];
  const lat1 = coords1[0];
  const lon2 = coords2[1];
  const lat2 = coords2[0];

  const R = 6371; // km
  const x1 = lat2 - lat1;
  const dLat = toRad(x1);
  const x2 = lon2 - lon1;
  const dLon = toRad(x2);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function MapUpdater({ sourceCoords, destCoords }) {
  const map = useMap();
  useEffect(() => {
    if (sourceCoords && destCoords) {
      const bounds = L.latLngBounds([sourceCoords, destCoords]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [sourceCoords, destCoords, map]);
  return null;
}

export default function RideMap({ source, destination }) {
  const sourceCoords = LOCATION_COORDS[source];
  const destCoords = LOCATION_COORDS[destination];
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    if (sourceCoords && destCoords) {
      setDistance(haversineDistance(sourceCoords, destCoords).toFixed(1));
    }
  }, [sourceCoords, destCoords]);

  if (!sourceCoords || !destCoords) {
    return null;
  }

  return (
    <div className="relative mt-5 h-48 w-full overflow-hidden rounded-xl border border-border sm:h-64">
      <div className="absolute top-2 right-2 z-[400] rounded-lg bg-white px-3 py-1.5 text-sm font-semibold shadow-md">
        {distance} km
      </div>
      <MapContainer
        center={sourceCoords}
        zoom={13}
        scrollWheelZoom={false}
        className="h-full w-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={sourceCoords} />
        <Marker position={destCoords} />
        <Polyline positions={[sourceCoords, destCoords]} color="#1E40AF" weight={4} opacity={0.7} />
        <MapUpdater sourceCoords={sourceCoords} destCoords={destCoords} />
      </MapContainer>
    </div>
  );
}
