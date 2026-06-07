import type { AnalysisResult, Parcel } from '../types';

export function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

export function formatSar(value: number): string {
  return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', maximumFractionDigits: 0 }).format(value);
}

export function analyzeParcel(parcel: Parcel): AnalysisResult {
  const accessibilityScore = clamp(
    (parcel.roadAccess === 'مباشر' ? 95 : parcel.roadAccess === 'قريب' ? 82 : 62) - parcel.distanceToMainRoadM / 35 - parcel.distanceToMetroM / 180
  );
  const riskPenalty = parcel.riskLevel === 'مرتفع' ? 36 : parcel.riskLevel === 'متوسط' ? 18 : 5;
  const riskScore = clamp(100 - riskPenalty);
  const regulationScore = clamp(
    parcel.landUse === 'مختلط' || parcel.landUse === 'استثماري' ? 90 : parcel.landUse === 'تجاري' ? 86 : parcel.landUse === 'خدمات' ? 72 : 76
  );
  const geometryScore = clamp((parcel.frontageM >= 25 ? 88 : 72) + (parcel.areaSqm >= 1000 ? 8 : 0) - (parcel.depthM > 120 ? 8 : 0));
  const dataQualityScore = clamp(parcel.dataQuality);
  const overallScore = clamp(accessibilityScore * 0.26 + riskScore * 0.22 + regulationScore * 0.24 + geometryScore * 0.16 + dataQualityScore * 0.12);
  const developmentPotential = overallScore >= 80 ? 'عالي' : overallScore >= 62 ? 'متوسط' : 'محدود';
  const valueIndicator = overallScore >= 84 ? 'ممتاز' : overallScore >= 72 ? 'جيد' : overallScore >= 58 ? 'متوسط' : 'يحتاج مراجعة';
  const findings = [
    `القطعة تقع في حي ${parcel.district} ضمن تصنيف ${parcel.zoning}.`,
    `المساحة ${parcel.areaSqm.toLocaleString('ar-SA')} م² بواجهة ${parcel.frontageM.toLocaleString('ar-SA')} م وعمق تقريبي ${parcel.depthM.toLocaleString('ar-SA')} م.`,
    parcel.distanceToMainRoadM <= 150 ? 'قرب ممتاز من طريق رئيسي يعزز سهولة الوصول.' : parcel.distanceToMainRoadM <= 500 ? 'القرب من الطريق الرئيسي جيد ويحتاج دراسة مداخل.' : 'المسافة عن الطريق الرئيسي مرتفعة نسبياً وقد تؤثر على الجاذبية.',
    parcel.distanceToMetroM <= 700 ? 'قريبة من محور نقل عام ديمو، وهذا يرفع جاذبية التطوير.' : 'لا توجد محطة نقل عام قريبة ضمن نطاق الديمو.',
    `قيمة تقديرية ديمو: ${formatSar(parcel.estimatedValueSar)}.`
  ];
  const warnings = [
    'هذه بيانات ديمو وليست بيانات سجل عقاري رسمية.',
    ...(parcel.riskLevel !== 'منخفض' ? [`يوجد مستوى مخاطر ${parcel.riskLevel} ويحتاج تحقق من طبقات المخاطر الرسمية.`] : []),
    ...(parcel.dataQuality < 82 ? ['جودة البيانات أقل من المستوى المثالي؛ يفضل مراجعة الحدود والصفات قبل القرار.'] : [])
  ];
  const recommendedActions = [
    'مطابقة حدود القطعة مع المصدر الرسمي داخل ArcGIS Enterprise.',
    'تشغيل تحليل ArcPy الرسمي للتقاطعات التنظيمية والاشتراطات.',
    parcel.riskLevel === 'مرتفع' ? 'طلب مراجعة تفصيلية للمخاطر قبل اعتماد أي توصية.' : 'إعداد تقرير مختصر لصاحب القرار مع فرص التطوير والقيود.',
    'مراجعة الصلاحيات قبل مشاركة أي بيانات حقيقية.'
  ];
  const summary = `تقييم القطعة ${parcel.id}: قابلية التطوير ${developmentPotential} بدرجة ${overallScore}/100. الاستخدام ${parcel.landUse}، المخاطر ${parcel.riskLevel}، والوصول ${parcel.roadAccess}.`;
  const executiveBrief = `ملخص تنفيذي: القطعة ${parcel.name} في ${parcel.district} تظهر كفرصة ${developmentPotential} للتطوير حسب بيانات الديمو. أهم عوامل القوة: التصنيف ${parcel.zoning}، مساحة ${parcel.areaSqm.toLocaleString('ar-SA')} م²، ومؤشر وصول ${accessibilityScore}/100. أهم نقطة مراجعة: مستوى المخاطر ${parcel.riskLevel} وجودة البيانات ${dataQualityScore}/100.`;
  return { parcelId: parcel.id, overallScore, developmentPotential, riskScore, accessibilityScore, regulationScore, dataQualityScore, valueIndicator, summary, findings, warnings, recommendedActions, executiveBrief };
}

export function getScoreColor(score: number): string {
  if (score >= 80) return '#22c55e';
  if (score >= 65) return '#f59e0b';
  return '#ef4444';
}
