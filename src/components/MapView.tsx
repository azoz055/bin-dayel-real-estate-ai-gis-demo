import { useEffect } from 'react';
import L from 'leaflet';
import type { Parcel } from '../types';
import { analyzeParcel, getScoreColor } from '../lib/analysis';
import { riskZones, zoningZones } from '../data/parcels';

interface Props { parcels: Parcel[]; selectedParcel: Parcel | null; onSelect: (parcel: Parcel) => void; }

export default function MapView({ parcels, selectedParcel, onSelect }: Props) {
  useEffect(() => {
    const map = L.map('map', { zoomControl: false, attributionControl: false }).setView([24.772, 46.64], 13);
    L.control.zoom({ position: 'bottomleft' }).addTo(map);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 20 }).addTo(map);

    const zoningGroup = L.layerGroup().addTo(map);
    zoningZones.forEach((z) => {
      L.rectangle(z.bounds as L.LatLngBoundsExpression, { color: z.color, weight: 1, fillColor: z.color, fillOpacity: 0.09, dashArray: '6 6' })
        .bindTooltip(z.name)
        .addTo(zoningGroup);
    });
    const riskGroup = L.layerGroup().addTo(map);
    riskZones.forEach((r) => {
      L.circle(r.center as L.LatLngExpression, { radius: r.radiusM, color: r.color, weight: 1, fillColor: r.color, fillOpacity: 0.08 })
        .bindTooltip(r.name)
        .addTo(riskGroup);
    });
    const parcelGroup = L.layerGroup().addTo(map);
    const bounds: L.LatLngTuple[] = [];
    parcels.forEach((parcel) => {
      const score = analyzeParcel(parcel).overallScore;
      const isSelected = selectedParcel?.id === parcel.id;
      const polygon = L.polygon(parcel.coordinates as L.LatLngExpression[], {
        color: isSelected ? '#38bdf8' : getScoreColor(score),
        weight: isSelected ? 4 : 2,
        fillColor: getScoreColor(score),
        fillOpacity: isSelected ? 0.48 : 0.26
      });
      polygon.bindTooltip(`<b>${parcel.id}</b><br>${parcel.district}<br>Score ${score}/100`, { direction: 'top' });
      polygon.on('click', () => onSelect(parcel));
      polygon.addTo(parcelGroup);
      parcel.coordinates.forEach((c) => bounds.push(c as L.LatLngTuple));
    });
    if (bounds.length) map.fitBounds(bounds, { padding: [25, 25] });
    const overlays = { 'قطع الأراضي': parcelGroup, 'النطاقات التنظيمية': zoningGroup, 'نطاقات المخاطر': riskGroup };
    L.control.layers(undefined, overlays, { position: 'topright', collapsed: false }).addTo(map);
    return () => { map.remove(); };
  }, [parcels, selectedParcel?.id, onSelect]);

  return <div id="map" className="map" />;
}
