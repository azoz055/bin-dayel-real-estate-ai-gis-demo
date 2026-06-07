import type { Parcel } from '../types';

function makeParcel(
  id: number,
  lat: number,
  lng: number,
  district: string,
  landUse: Parcel['landUse'],
  zoning: string,
  riskLevel: Parcel['riskLevel'],
  roadAccess: Parcel['roadAccess'],
  ownerType: Parcel['ownerType'],
  areaSqm: number,
  frontageM: number,
  depthM: number,
  mainRoad: number,
  metro: number,
  quality: number,
  value: number
): Parcel {
  const h = Math.sqrt(areaSqm) / 111_320 * 0.74;
  const w = Math.sqrt(areaSqm) / 111_320 * 1.05;
  return {
    id: `RYD-${String(id).padStart(4, '0')}`,
    name: `قطعة ${String(id).padStart(2, '0')}`,
    district,
    coordinates: [
      [lat - h, lng - w],
      [lat - h, lng + w],
      [lat + h, lng + w],
      [lat + h, lng - w]
    ],
    areaSqm,
    frontageM,
    depthM,
    landUse,
    zoning,
    roadAccess,
    distanceToMainRoadM: mainRoad,
    distanceToMetroM: metro,
    riskLevel,
    dataQuality: quality,
    ownerType,
    estimatedValueSar: value
  };
}

const districts = ['الملقا', 'العقيق', 'النرجس', 'الياسمين', 'الصحافة', 'حطين', 'العارض', 'القيروان'];
const landUses: Parcel['landUse'][] = ['سكني', 'تجاري', 'مختلط', 'خدمات', 'استثماري'];
const risks: Parcel['riskLevel'][] = ['منخفض', 'متوسط', 'مرتفع'];
const accesses: Parcel['roadAccess'][] = ['مباشر', 'قريب', 'داخلي'];
const owners: Parcel['ownerType'][] = ['خاص', 'حكومي', 'استثماري'];

export const parcels: Parcel[] = Array.from({ length: 72 }, (_, i) => {
  const row = Math.floor(i / 9);
  const col = i % 9;
  const lat = 24.755 + row * 0.0042 + (col % 2) * 0.00055;
  const lng = 46.61 + col * 0.0062 + (row % 2) * 0.00045;
  const landUse = landUses[(i + row) % landUses.length];
  const district = districts[(row + col) % districts.length];
  const riskLevel = risks[(i + (col > 6 ? 1 : 0)) % risks.length];
  const area = 520 + ((i * 137) % 3900);
  const frontage = 18 + ((i * 7) % 38);
  const depth = Math.round(area / frontage);
  const mainRoad = 35 + ((i * 53) % 920);
  const metro = 140 + ((i * 89) % 3100);
  const quality = 72 + ((i * 11) % 27);
  const value = Math.round(area * (2200 + ((i * 317) % 4600)));
  return makeParcel(
    i + 1,
    lat,
    lng,
    district,
    landUse,
    landUse === 'مختلط' ? 'M-3 تطوير مختلط' : landUse === 'تجاري' ? 'C-2 تجاري محوري' : landUse === 'استثماري' ? 'INV-1 استثماري' : landUse === 'خدمات' ? 'SVC خدمات عامة' : 'R-2 سكني متوسط الكثافة',
    riskLevel,
    accesses[(i + 2) % accesses.length],
    owners[(i + 1) % owners.length],
    area,
    frontage,
    depth,
    mainRoad,
    metro,
    quality,
    value
  );
});

export const zoningZones = [
  { id: 'Z-MIX', name: 'نطاق تطوير مختلط', color: '#8b5cf6', bounds: [[24.765, 46.615], [24.795, 46.665]] as [number, number][] },
  { id: 'Z-COM', name: 'محور تجاري', color: '#f59e0b', bounds: [[24.748, 46.646], [24.79, 46.672]] as [number, number][] },
  { id: 'Z-RES', name: 'نطاق سكني', color: '#22c55e', bounds: [[24.746, 46.603], [24.777, 46.636]] as [number, number][] }
];

export const riskZones = [
  { id: 'R-01', name: 'نطاق سيول', level: 'متوسط', color: '#ef4444', center: [24.777, 46.661] as [number, number], radiusM: 850 },
  { id: 'R-02', name: 'نطاق ضوضاء طريق رئيسي', level: 'منخفض', color: '#f97316', center: [24.757, 46.622] as [number, number], radiusM: 650 }
];
