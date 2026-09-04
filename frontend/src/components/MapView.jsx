import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMapEvents, Marker } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import { PriorityBadge } from './PriorityBadge.jsx';

const BAND_COLORS = {
  Critical: '#b3271e',
  High: '#a6600f',
  Medium: '#1c5f8c',
  Low: '#4a7a52'
};

const pinIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [22, 36],
  iconAnchor: [11, 36]
});

function ClickCapture({ onPick }) {
  useMapEvents({
    click(e) {
      onPick?.({ lat: e.latlng.lat, lng: e.latlng.lng });
    }
  });
  return null;
}

export default function MapView({
  cases = [],
  center = [19.3, 75.5],
  zoom = 7,
  height = 480,
  pickable = false,
  onPick = null,
  pickedLocation = null
}) {
  return (
    <div style={{ height }} className="rounded-card overflow-hidden border border-border">
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {pickable && <ClickCapture onPick={onPick} />}
        {pickable && pickedLocation && <Marker position={[pickedLocation.lat, pickedLocation.lng]} icon={pinIcon} />}

        {cases.map((c) => (
          <CircleMarker
            key={c.caseId}
            center={[c.location.lat, c.location.lng]}
            radius={c.isDuplicateCluster ? 10 : 7}
            pathOptions={{
              color: BAND_COLORS[c.priorityBand] || BAND_COLORS.Medium,
              fillColor: BAND_COLORS[c.priorityBand] || BAND_COLORS.Medium,
              fillOpacity: 0.55,
              weight: 2
            }}
          >
            <Popup>
              <div className="text-xs space-y-1.5 min-w-[180px]">
                <div className="font-mono text-[10px] text-gray-500">{c.caseId}</div>
                <div className="font-semibold text-sm">{c.title}</div>
                <div>{c.city}{c.ward ? `, ${c.ward}` : ''}</div>
                <div className="flex items-center gap-1">
                  <span className="font-medium">Priority:</span> {c.priorityBand} ({c.priorityScore}/100)
                </div>
                <div>{c.citizenReports} report(s) · {c.status}</div>
                <Link to={`/case/${encodeURIComponent(c.caseId)}`} className="text-blue-700 font-medium underline">
                  View case
                </Link>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}

export function MapLegend() {
  return (
    <div className="flex items-center gap-4 flex-wrap text-xs text-ink-soft">
      {Object.entries(BAND_COLORS).map(([band, color]) => (
        <span key={band} className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
          {band}
        </span>
      ))}
    </div>
  );
}
