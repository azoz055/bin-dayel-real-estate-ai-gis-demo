import { useMemo, useState } from 'react';
import { Bot, Building2, CheckCircle2, FileText, Layers, MapPin, Menu, ShieldCheck, Sparkles, Target, X } from 'lucide-react';
import { parcels } from './data/parcels';
import type { ChatMessage, Parcel } from './types';
import { analyzeParcel, formatSar, getScoreColor } from './lib/analysis';
import { answerQuestion } from './lib/assistant';
import MapView from './components/MapView';
import AiChat from './components/AiChat';
import ParcelPanel from './components/ParcelPanel';

const heroStats = [
  { label: 'قطعة أرض ديمو', value: parcels.length.toLocaleString('ar-SA'), icon: MapPin },
  { label: 'طبقات تحليل', value: '٤', icon: Layers },
  { label: 'مساعد AI', value: 'بن دايل', icon: Bot },
  { label: 'جاهز للجوال', value: 'نعم', icon: ShieldCheck }
];

export default function App() {
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(parcels[10]);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
  const analysis = useMemo(() => selectedParcel ? analyzeParcel(selectedParcel) : null, [selectedParcel]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'أنا بن دايل، مساعدك لتحليل الأراضي. اختر قطعة من الخريطة واسألني: حلل الأرض، ما المخاطر؟ أعطني ملخص للإدارة.' }
  ]);

  function handleSelect(parcel: Parcel) {
    setSelectedParcel(parcel);
    setMobilePanelOpen(true);
    const result = analyzeParcel(parcel);
    setMessages((prev): ChatMessage[] => [
      ...prev,
      { role: 'assistant' as const, content: `تم تحديد ${parcel.name} (${parcel.id}). ${result.summary}` }
    ].slice(-8));
  }

  function sendMessage(text: string) {
    const reply = answerQuestion(text, selectedParcel, analysis);
    setMessages((prev): ChatMessage[] => [...prev, { role: 'user' as const, content: text }, { role: 'assistant' as const, content: reply }].slice(-10));
  }

  function openExecutiveReport() {
    if (!selectedParcel || !analysis) return;
    const html = `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>تقرير ${selectedParcel.id}</title><style>body{font-family:Arial,Tahoma,sans-serif;background:#f8fafc;color:#0f172a;padding:32px;line-height:1.8}.card{background:white;border:1px solid #e2e8f0;border-radius:20px;padding:24px;margin:16px 0;box-shadow:0 12px 35px #0f172a14}.brand{color:#0f766e}.score{font-size:56px;font-weight:900;color:${getScoreColor(analysis.overallScore)}}li{margin:8px 0}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.metric{background:#f1f5f9;padding:14px;border-radius:14px}@media print{button{display:none}}</style></head><body><h1 class="brand">عبدالعزيز بن دايل - منصة بن دايل هويتي</h1><p>تقرير تنفيذي ديمو لتحليل قطعة أرض. البيانات تجريبية وليست رسمية.</p><div class="card"><h2>${selectedParcel.name} - ${selectedParcel.id}</h2><div class="score">${analysis.overallScore}/100</div><p>${analysis.executiveBrief}</p></div><div class="grid"><div class="metric">المساحة<br><b>${selectedParcel.areaSqm.toLocaleString('ar-SA')} م²</b></div><div class="metric">الحي<br><b>${selectedParcel.district}</b></div><div class="metric">الاستخدام<br><b>${selectedParcel.landUse}</b></div><div class="metric">القيمة ديمو<br><b>${formatSar(selectedParcel.estimatedValueSar)}</b></div></div><div class="card"><h3>النتائج</h3><ul>${analysis.findings.map(f => `<li>${f}</li>`).join('')}</ul></div><div class="card"><h3>المخاطر والتنبيهات</h3><ul>${analysis.warnings.map(f => `<li>${f}</li>`).join('')}</ul></div><div class="card"><h3>الإجراءات المقترحة</h3><ul>${analysis.recommendedActions.map(f => `<li>${f}</li>`).join('')}</ul></div><button onclick="print()">طباعة / حفظ PDF</button></body></html>`;
    const w = window.open('', '_blank');
    w?.document.write(html);
    w?.document.close();
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark">BD</div>
          <div>
            <div className="eyebrow">منصة دمو عقارية ذكية</div>
            <h1>عبدالعزيز بن دايل</h1>
            <p>بن دايل هويتي وبصمتي في تحليل الأراضي</p>
          </div>
        </div>
        <div className="top-actions">
          <span className="demo-badge"><Sparkles size={16}/> Demo Saudi GIS</span>
          <button className="mobile-toggle" onClick={() => setMobilePanelOpen(true)}><Menu size={20}/> التحليل</button>
        </div>
      </header>

      <section className="hero">
        <div>
          <span className="pill"><ShieldCheck size={16}/> يعمل كدمو آمن بدون بيانات سجل حقيقية</span>
          <h2>خريطة أراضي سعودية + طبقات + تحليل مكاني + مساعد AI عربي</h2>
          <p>حدد أي قطعة أرض على الخريطة وشاهد تحليل فوري لقابلية التطوير، المخاطر، التنظيم، الوصول، والقيمة الديمو. مناسب للعرض على الإدارة كنموذج لما يمكن تنفيذه داخل منظومة مغلقة بـ ArcGIS Enterprise وArcPy.</p>
        </div>
        <div className="hero-grid">
          {heroStats.map((s) => <div className="stat-card" key={s.label}><s.icon size={22}/><strong>{s.value}</strong><span>{s.label}</span></div>)}
        </div>
      </section>

      <main className="workspace">
        <section className="map-card">
          <div className="map-toolbar">
            <div><h3><MapPin size={20}/> خريطة قطع أراضي - الرياض ديمو</h3><p>اضغط على أي قطعة لبدء التحليل</p></div>
            <div className="legend"><span className="dot green"></span>عالي <span className="dot amber"></span>متوسط <span className="dot red"></span>مراجعة</div>
          </div>
          <MapView parcels={parcels} selectedParcel={selectedParcel} onSelect={handleSelect} />
        </section>

        <aside className={`side-panel ${mobilePanelOpen ? 'open' : ''}`}>
          <button className="close-mobile" onClick={() => setMobilePanelOpen(false)}><X size={20}/></button>
          <div className="panel-section identity-card">
            <div className="identity-icon"><Target size={26}/></div>
            <div>
              <h3>بن دايل هويتي</h3>
              <p>AI GIS Assistant by عبدالعزيز بن دايل</p>
            </div>
          </div>
          <ParcelPanel parcel={selectedParcel} analysis={analysis} onReport={openExecutiveReport} />
          <AiChat messages={messages} onSend={sendMessage} />
        </aside>
      </main>

      <section className="enterprise-note">
        <div><Building2 size={26}/><h3>رسالة العرض للإدارة</h3></div>
        <p>هذا الدمو يستخدم بيانات سعودية تجريبية لإثبات التجربة. في النسخة الداخلية يتم ربط نفس الواجهة بـ ArcGIS Enterprise وArcPy وطبقات السجل العقاري الحقيقية حسب الصلاحيات، مع تشغيل AI محلي داخل الشبكة المغلقة.</p>
        <div className="check-row"><span><CheckCircle2 size={16}/> لا يرسل بيانات حساسة للخارج</span><span><CheckCircle2 size={16}/> قابل للجوال</span><span><CheckCircle2 size={16}/> قابل للتحويل لـ ArcPy</span><span><CheckCircle2 size={16}/> تقرير تنفيذي</span></div>
      </section>
    </div>
  );
}
