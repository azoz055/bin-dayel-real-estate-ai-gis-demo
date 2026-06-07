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

export const parcels: Parcel[] = Array.from({ length: 216 }, (_, i) => {
  const row = Math.floor(i / 18);
  const col = i % 18;
  const isPremium = i % 19 === 4 || i % 23 === 7;
  const lat = 24.748 + row * 0.0032 + (col % 3) * 0.0005;
  const lng = 46.598 + col * 0.00345 + (row % 2) * 0.00042;
  const landUse = isPremium ? (i % 2 === 0 ? 'استثماري' : 'مختلط') : landUses[(i + row) % landUses.length];
  const district = districts[(row + col) % districts.length];
  const riskLevel = isPremium ? 'منخفض' : risks[(i + (col > 13 ? 1 : 0)) % risks.length];
  const area = isPremium ? 2_800 + ((i * 211) % 4_200) : 620 + ((i * 137) % 4_900);
  const frontage = isPremium ? 36 + ((i * 5) % 28) : 18 + ((i * 7) % 42);
  const depth = Math.round(area / frontage);
  const mainRoad = isPremium ? 25 + ((i * 17) % 115) : 35 + ((i * 53) % 980);
  const metro = isPremium ? 120 + ((i * 31) % 520) : 160 + ((i * 89) % 3_600);
  const quality = isPremium ? 92 + (i % 7) : 72 + ((i * 11) % 27);
  const value = Math.round(area * (isPremium ? 6_200 + ((i * 127) % 2_300) : 2_400 + ((i * 317) % 4_800)));
  return makeParcel(
    i + 1,
    lat,
    lng,
    district,
    landUse,
    landUse === 'مختلط' ? 'M-3 تطوير مختلط' : landUse === 'تجاري' ? 'C-2 تجاري محوري' : landUse === 'استثماري' ? 'INV-1 استثماري' : landUse === 'خدمات' ? 'SVC خدمات عامة' : 'R-2 سكني متوسط الكثافة',
    riskLevel,
    isPremium ? 'مباشر' : accesses[(i + 2) % accesses.length],
    isPremium ? 'استثماري' : owners[(i + 1) % owners.length],
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
