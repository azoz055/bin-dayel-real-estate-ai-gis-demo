import type { AnalysisResult, Parcel } from '../types';
import { formatSar } from './analysis';

function includesAny(text: string, words: string[]): boolean {
  return words.some((w) => text.includes(w));
}

export function answerQuestion(question: string, parcel: Parcel | null, analysis: AnalysisResult | null): string {
  const q = question.trim().toLowerCase();
  if (!q) return 'اكتب سؤالك عن الأرض المحددة، وأنا بن دايل أشرح لك التحليل بشكل مختصر وواضح.';
  if (!parcel || !analysis) return 'حدد قطعة أرض من الخريطة أولاً، وبعدها أقدر أحللها لك وأعطيك ملخص تنفيذي ومخاطر وفرص التطوير.';

  if (includesAny(q, ['ملخص', 'ادارة', 'الإدارة', 'تنفيذي', 'مختصر'])) {
    return `${analysis.executiveBrief}\n\nصياغة للعرض: يمكن داخل المنظومة المغلقة ربط ArcGIS Enterprise وArcPy مع بن دايل AI محلي لتقديم نفس التجربة بصلاحيات مؤسسية.`;
  }
  if (includesAny(q, ['مخاطر', 'خطر', 'سيول', 'قيود', 'تعارض'])) {
    const warnings = analysis.warnings.length ? analysis.warnings.join('\n') : 'لا توجد تنبيهات عالية حالياً، لكن يوصى بمراجعة الطبقات قبل القرار النهائي.';
    return `تحليل المخاطر للقطعة ${parcel.id}: مستوى المخاطر ${parcel.riskLevel}، ومؤشر المخاطر ${analysis.riskScore}/100.\n\n${warnings}\n\nالإجراء المقترح: ${analysis.recommendedActions[2]}`;
  }
  if (includesAny(q, ['قيمة', 'سعر', 'استثمار', 'عوائد', 'فرصة'])) {
    return `كمؤشر استثماري: القيمة التقديرية ${formatSar(parcel.estimatedValueSar)}، ومؤشر القيمة "${analysis.valueIndicator}"، وقابلية التطوير "${analysis.developmentPotential}" بدرجة ${analysis.overallScore}/100. هذه قراءة تحليلية أولية وتحتاج اعتماد القنوات الرسمية قبل أي قرار.`;
  }
  if (includesAny(q, ['ليش', 'لماذا', 'سبب', 'كيف حسبت', 'درجة'])) {
    return `سبب الدرجة ${analysis.overallScore}/100 هو دمج عدة مؤشرات: الوصول ${analysis.accessibilityScore}/100، التنظيم ${analysis.regulationScore}/100، المخاطر ${analysis.riskScore}/100، وجودة البيانات ${analysis.dataQualityScore}/100.\n\nأبرز الملاحظات:\n${analysis.findings.map((f) => `- ${f}`).join('\n')}`;
  }
  if (includesAny(q, ['ناقص', 'البيانات', 'جودة', 'اعتماد'])) {
    return `جودة بيانات هذه القطعة ${analysis.dataQualityScore}/100. قبل الاعتماد الرسمي نحتاج: مطابقة الحدود، مراجعة الصك/الملكية، التحقق من الاشتراطات التنظيمية، وتشغيل ArcPy داخل البيئة الرسمية.`;
  }
  if (includesAny(q, ['تقرير', 'اطبع', 'pdf'])) {
    return 'تقدر تضغط زر "تقرير تنفيذي" في لوحة القطعة. التقرير الحالي HTML قابل للطباعة، وفي النسخة الداخلية نقدر نحوله PDF رسمي مع شعار الجهة وتوقيع رقمي.';
  }
  const caution = analysis.warnings[0] ?? 'راجع طبقات الموقع قبل اتخاذ القرار النهائي.';
  return `أنا بن دايل AI. تحليلي للقطعة ${parcel.id}: ${analysis.summary}\n\nأهم ٣ نقاط:\n1) ${analysis.findings[0]}\n2) ${analysis.findings[2]}\n3) ${caution}\n\nاسألني مثلاً: "اعطني ملخص للإدارة" أو "ما المخاطر؟" أو "ليش الدرجة كذا؟"`;
}
