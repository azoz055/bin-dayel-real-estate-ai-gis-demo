export type LandUse = 'سكني' | 'تجاري' | 'مختلط' | 'خدمات' | 'استثماري';
export type RiskLevel = 'منخفض' | 'متوسط' | 'مرتفع';

export interface Parcel {
  id: string;
  name: string;
  district: string;
  coordinates: [number, number][]; // [lat, lng]
  areaSqm: number;
  frontageM: number;
  depthM: number;
  landUse: LandUse;
  zoning: string;
  roadAccess: 'مباشر' | 'قريب' | 'داخلي';
  distanceToMainRoadM: number;
  distanceToMetroM: number;
  riskLevel: RiskLevel;
  dataQuality: number;
  ownerType: 'خاص' | 'حكومي' | 'استثماري';
  estimatedValueSar: number;
}

export interface AnalysisResult {
  parcelId: string;
  overallScore: number;
  developmentPotential: 'عالي' | 'متوسط' | 'محدود';
  riskScore: number;
  accessibilityScore: number;
  regulationScore: number;
  dataQualityScore: number;
  valueIndicator: 'ممتاز' | 'جيد' | 'متوسط' | 'يحتاج مراجعة';
  summary: string;
  findings: string[];
  warnings: string[];
  recommendedActions: string[];
  executiveBrief: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
