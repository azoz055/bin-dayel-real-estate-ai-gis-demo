import type { AnalysisResult, Parcel } from '../types';
import { analyzeParcel, formatSar } from './analysis';

function includesAny(text: string, words: string[]): boolean {
  return words.some((w) => text.includes(w));
}

function parcelLine(parcel: Parcel, rank?: number): string {
  const a = analyzeParcel(parcel);
  const prefix = rank ? `${rank}) ` : '';
  return `${prefix}${parcel.name} (${parcel.id}) - ${parcel.district}: درجة ${a.overallScore}/100، ${a.developmentPotential}، استخدام ${parcel.landUse}، مخاطر ${parcel.riskLevel}، قيمة تقديرية ${formatSar(parcel.estimatedValueSar)}.`;
}

function rankParcels(parcels: Parcel[]): Parcel[] {
  return [...parcels].sort((a, b) => {
    const aa = analyzeParcel(a);
    const bb = analyzeParcel(b);
    return bb.overallScore - aa.overallScore || b.estimatedValueSar - a.estimatedValueSar || b.areaSqm - a.areaSqm;
  });
}

function findParcelByQuestion(question: string, parcels: Parcel[]): Parcel | null {
  const normalized = question.toUpperCase().replace(/\s+/g, '');
  const idMatch = normalized.match(/RYD-?0*(\d{1,4})/);
  if (idMatch) {
    const wanted = `RYD-${idMatch[1].padStart(4, '0')}`;
    return parcels.find((p) => p.id === wanted) ?? null;
  }
  const numberMatch = question.match(/(?:قطعة|ارض|أرض)\s*(\d{1,2})/);
  if (numberMatch) {
    const wanted = `RYD-${numberMatch[1].padStart(4, '0')}`;
    return parcels.find((p) => p.id === wanted) ?? null;
  }
  return parcels.find((p) => question.includes(p.district) || question.includes(p.name)) ?? null;
}

export function answerQuestion(question: string, parcel: Parcel | null, analysis: AnalysisResult | null, allParcels: Parcel[] = []): string {
  const q = question.trim().toLowerCase();
  const targetParcel = findParcelByQuestion(question, allParcels) ?? parcel;
  const targetAnalysis = targetParcel ? analyzeParcel(targetParcel) : analysis;

  if (!q) return 'اكتب سؤالك عن الأرض أو قل: عطني أفضل أرض، قارن لي الأراضي، حلل RYD-0011.';

  if (includesAny(q, ['افضل', 'أفضل', 'احسن', 'أحسن', 'اقوى', 'أقوى', 'رشح', 'ترشح', 'اختار', 'اختر', 'الأولى', 'الاولى', 'top', 'best'])) {
    if (!allParcels.length) return 'أحتاج قائمة القطع حتى أرتب لك أفضل أرض.';
    const ranked = rankParcels(allParcels);
    const top = ranked[0];
    const topAnalysis = analyzeParcel(top);
    return `أفضل أرض حالياً هي ${top.name} (${top.id}) في ${top.district}.\n\nالسبب: حصلت على ${topAnalysis.overallScore}/100، قابلية التطوير ${topAnalysis.developmentPotential}، استخدام ${top.landUse}، مخاطر ${top.riskLevel}، وقيمة تقديرية ${formatSar(top.estimatedValueSar)}.\n\nأفضل ٣ قطع حسب النموذج:\n${ranked.slice(0, 3).map((p, i) => parcelLine(p, i + 1)).join('\n')}\n\nإذا تبي أختار حسب معيار محدد قل لي: أفضل استثمار، أقل مخاطر، أكبر مساحة، أو أقرب طريق.`;
  }

  if (includesAny(q, ['قارن', 'مقارنة', 'رتب', 'ترتيب', 'كل الاراضي', 'كل الأراضي', 'القطع'])) {
    if (!allParcels.length) return 'أحتاج قائمة القطع حتى أقارنها لك.';
    const ranked = rankParcels(allParcels).slice(0, 5);
    return `ترتيب أفضل ٥ قطع حسب الدرجة المركبة:\n${ranked.map((p, i) => parcelLine(p, i + 1)).join('\n')}\n\nالترتيب يحسب الوصول، التنظيم، المخاطر، شكل القطعة، وجودة البيانات.`;
  }

  if (includesAny(q, ['أقل مخاطر', 'اقل مخاطر', 'منخفضة المخاطر', 'آمن', 'امن'])) {
    const lowRisk = [...allParcels]
      .sort((a, b) => analyzeParcel(b).riskScore - analyzeParcel(a).riskScore || analyzeParcel(b).overallScore - analyzeParcel(a).overallScore)
      .slice(0, 3);
    return `أفضل القطع من ناحية انخفاض المخاطر:\n${lowRisk.map((p, i) => parcelLine(p, i + 1)).join('\n')}`;
  }

  if (includesAny(q, ['اكبر', 'أكبر', 'مساحة'])) {
    const largest = [...allParcels].sort((a, b) => b.areaSqm - a.areaSqm).slice(0, 3);
    return `أكبر ٣ قطع مساحة:\n${largest.map((p, i) => parcelLine(p, i + 1)).join('\n')}`;
  }

  if (!targetParcel || !targetAnalysis) return 'حدد قطعة من الخريطة أو اكتب رقمها مثل RYD-0011، وأقدر أحللها لك مباشرة. وتقدر تسألني: عطني أفضل أرض.';

  if (includesAny(q, ['حلل', 'تحليل', 'اشرح', 'قيم', 'قيّم', 'وش رايك', 'رأيك'])) {
    const warnings = targetAnalysis.warnings.length ? `\n\nتنبيهات:\n${targetAnalysis.warnings.map((w) => `- ${w}`).join('\n')}` : '';
    return `تحليل ${targetParcel.name} (${targetParcel.id}):\nالدرجة ${targetAnalysis.overallScore}/100 وقابلية التطوير ${targetAnalysis.developmentPotential}.\n\nالعوامل المهمة:\n${targetAnalysis.findings.map((f) => `- ${f}`).join('\n')}\n\nالتوصية: ${targetAnalysis.recommendedActions[2]}${warnings}`;
  }

  if (includesAny(q, ['ملخص', 'ادارة', 'الإدارة', 'تنفيذي', 'مختصر'])) {
    return `${targetAnalysis.executiveBrief}\n\nصياغة للعرض: يمكن داخل المنظومة المغلقة ربط ArcGIS Enterprise وArcPy مع بن دايل AI محلي لتقديم نفس التجربة بصلاحيات مؤسسية.`;
  }

  if (includesAny(q, ['مخاطر', 'خطر', 'سيول', 'قيود', 'تعارض'])) {
    const warnings = targetAnalysis.warnings.length ? targetAnalysis.warnings.join('\n') : 'لا توجد تنبيهات عالية حالياً، لكن يوصى بمراجعة الطبقات قبل القرار النهائي.';
    return `تحليل المخاطر للقطعة ${targetParcel.id}: مستوى المخاطر ${targetParcel.riskLevel}، ومؤشر المخاطر ${targetAnalysis.riskScore}/100.\n\n${warnings}\n\nالإجراء المقترح: ${targetAnalysis.recommendedActions[2]}`;
  }

  if (includesAny(q, ['قيمة', 'سعر', 'استثمار', 'عوائد', 'فرصة'])) {
    return `كمؤشر استثماري: القيمة التقديرية ${formatSar(targetParcel.estimatedValueSar)}، ومؤشر القيمة "${targetAnalysis.valueIndicator}"، وقابلية التطوير "${targetAnalysis.developmentPotential}" بدرجة ${targetAnalysis.overallScore}/100. هذه قراءة تحليلية أولية وتحتاج اعتماد القنوات الرسمية قبل أي قرار.`;
  }

  if (includesAny(q, ['ليش', 'لماذا', 'سبب', 'كيف حسبت', 'درجة'])) {
    return `سبب الدرجة ${targetAnalysis.overallScore}/100 هو دمج عدة مؤشرات: الوصول ${targetAnalysis.accessibilityScore}/100، التنظيم ${targetAnalysis.regulationScore}/100، المخاطر ${targetAnalysis.riskScore}/100، وجودة البيانات ${targetAnalysis.dataQualityScore}/100.\n\nأبرز الملاحظات:\n${targetAnalysis.findings.map((f) => `- ${f}`).join('\n')}`;
  }

  if (includesAny(q, ['ناقص', 'البيانات', 'جودة', 'اعتماد'])) {
    return `جودة بيانات هذه القطعة ${targetAnalysis.dataQualityScore}/100. قبل الاعتماد النهائي نحتاج: مطابقة الحدود، مراجعة الصك/الملكية، التحقق من الاشتراطات التنظيمية، وتشغيل ArcPy داخل البيئة الداخلية.`;
  }

  if (includesAny(q, ['تقرير', 'اطبع', 'pdf'])) {
    return 'اضغط زر تقرير تنفيذي من الوظائف أو لوحة التحليل. التقرير يفتح كصفحة قابلة للطباعة أو الحفظ PDF.';
  }

  const caution = targetAnalysis.warnings[0] ?? 'راجع طبقات الموقع قبل اتخاذ القرار النهائي.';
  return `أنا بن دايل AI. فهمت سؤالك عن ${targetParcel.name} (${targetParcel.id}).\n${targetAnalysis.summary}\n\nأهم ٣ نقاط:\n1) ${targetAnalysis.findings[0]}\n2) ${targetAnalysis.findings[2]}\n3) ${caution}\n\nأقدر أيضاً أجاوب: عطني أفضل أرض، قارن القطع، أقل مخاطر، أكبر مساحة.`;
}
