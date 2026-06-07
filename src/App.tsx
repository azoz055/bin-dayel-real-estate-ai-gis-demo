import { useMemo, useState } from 'react';
import {
  Activity,
  BarChart3,
  Bot,
  Building2,
  CheckCircle2,
  ChevronUp,
  FileText,
  Layers,
  MapPin,
  PanelRightOpen,
  Search,
  Sparkles,
  X,
  Zap
} from 'lucide-react';
import { parcels } from './data/parcels';
import type { ChatMessage, Parcel } from './types';
import { analyzeParcel, formatSar, getScoreColor } from './lib/analysis';
import { answerQuestion } from './lib/assistant';
import MapView from './components/MapView';
import AiChat from './components/AiChat';
import ParcelPanel from './components/ParcelPanel';

type WorkspaceTool = 'analysis' | 'ai' | 'layers' | 'report';

const systemStats = [
  { label: 'قطع مرئية', value: parcels.length.toLocaleString('ar-SA') },
  { label: 'مؤشرات تحليل', value: '٤' },
  { label: 'زمن الاستجابة', value: 'فوري' }
];

const tools: Array<{ id: WorkspaceTool; label: string; hint: string; icon: typeof Bot }> = [
  { id: 'ai', label: 'بن دايل AI', hint: 'شات وتحليل ذكي', icon: Bot },
  { id: 'analysis', label: 'تحليل القطعة', hint: 'درجة ومؤشرات', icon: BarChart3 },
  { id: 'layers', label: 'الطبقات', hint: 'قطع/تنظيم/مخاطر', icon: Layers },
  { id: 'report', label: 'تقرير تنفيذي', hint: 'طباعة أو PDF', icon: FileText }
];

export default function App() {
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(parcels[10]);
  const [panelOpen, setPanelOpen] = useState(true);
  const [toolMenuOpen, setToolMenuOpen] = useState(false);
  const [activeTool, setActiveTool] = useState<WorkspaceTool>('ai');
  const analysis = useMemo(() => selectedParcel ? analyzeParcel(selectedParcel) : null, [selectedParcel]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'أنا بن دايل AI. اختر قطعة من الخريطة ثم اسألني عن قابلية التطوير، المخاطر، الموقع، أو اطلب ملخص تنفيذي.' }
  ]);

  function handleSelect(parcel: Parcel) {
    setSelectedParcel(parcel);
    setActiveTool('analysis');
    setPanelOpen(true);
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

  function chooseTool(tool: WorkspaceTool) {
    setActiveTool(tool);
    setPanelOpen(true);
    setToolMenuOpen(false);
    if (tool === 'report') openExecutiveReport();
  }

  function openExecutiveReport() {
    if (!selectedParcel || !analysis) return;
    const html = `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>تقرير ${selectedParcel.id} | بن دايل AI</title><style>body{font-family:Arial,Tahoma,sans-serif;background:#07080d;color:#f7f8f8;padding:32px;line-height:1.8}.card{background:#11131d;border:1px solid #ffffff1f;border-radius:22px;padding:24px;margin:16px 0;box-shadow:0 24px 80px #0007}.brand{color:#9ea7ff}.score{font-size:60px;font-weight:900;color:${getScoreColor(analysis.overallScore)}}li{margin:8px 0}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.metric{background:#171a27;padding:14px;border-radius:16px;border:1px solid #ffffff14}button{background:#6d72ff;color:white;border:0;border-radius:12px;padding:12px 18px;font-weight:800}@media print{button{display:none}body{background:white;color:#111}.card,.metric{background:white;color:#111;border-color:#ddd;box-shadow:none}}</style></head><body><h1 class="brand">بن دايل AI</h1><p>تقرير تنفيذي لتحليل قطعة أرض ضمن منصة خرائط عقارية ذكية.</p><div class="card"><h2>${selectedParcel.name} - ${selectedParcel.id}</h2><div class="score">${analysis.overallScore}/100</div><p>${analysis.executiveBrief}</p></div><div class="grid"><div class="metric">المساحة<br><b>${selectedParcel.areaSqm.toLocaleString('ar-SA')} م²</b></div><div class="metric">الحي<br><b>${selectedParcel.district}</b></div><div class="metric">الاستخدام<br><b>${selectedParcel.landUse}</b></div><div class="metric">القيمة التقديرية<br><b>${formatSar(selectedParcel.estimatedValueSar)}</b></div></div><div class="card"><h3>النتائج</h3><ul>${analysis.findings.map(f => `<li>${f}</li>`).join('')}</ul></div><div class="card"><h3>المخاطر والتنبيهات</h3><ul>${analysis.warnings.map(f => `<li>${f}</li>`).join('')}</ul></div><div class="card"><h3>الإجراءات المقترحة</h3><ul>${analysis.recommendedActions.map(f => `<li>${f}</li>`).join('')}</ul></div><button onclick="print()">طباعة / حفظ PDF</button></body></html>`;
    const w = window.open('', '_blank');
    w?.document.write(html);
    w?.document.close();
  }

  const selectedTool = tools.find((tool) => tool.id === activeTool) ?? tools[0];

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark">BD</div>
          <div>
            <div className="eyebrow"><Sparkles size={14}/> Enterprise GIS Intelligence</div>
            <h1>بن دايل AI</h1>
            <p>منصة خريطة وتحليل أراضي بواجهة ذكية حديثة</p>
          </div>
        </div>
        <div className="top-actions">
          <div className="command-search"><Search size={15}/><span>اختر قطعة أو افتح الوظائف</span><kbd>AI</kbd></div>
          <button className="ghost-btn" onClick={() => chooseTool('analysis')}><PanelRightOpen size={18}/> التحليل</button>
        </div>
      </header>

      <main className="map-workspace">
        <section className="map-stage" aria-label="خريطة الأراضي">
          <div className="map-hud hud-top">
            <div>
              <span className="hud-kicker"><Activity size={14}/> Live Spatial View</span>
              <h2>الخريطة أولاً. التحليل عند الطلب.</h2>
              <p>اضغط على أي قطعة أرض، ثم افتح الوظائف للوصول إلى بن دايل AI أو التحليل أو التقرير التنفيذي.</p>
            </div>
            <div className="stats-strip">
              {systemStats.map((item) => <div key={item.label}><strong>{item.value}</strong><span>{item.label}</span></div>)}
            </div>
          </div>

          <MapView parcels={parcels} selectedParcel={selectedParcel} onSelect={handleSelect} />

          <div className="map-hud hud-bottom">
            <div className="selected-chip"><MapPin size={16}/><span>{selectedParcel ? `${selectedParcel.name} · ${selectedParcel.district}` : 'اختر قطعة أرض'}</span></div>
            <div className="legend"><span className="dot green"></span>عالي <span className="dot amber"></span>متوسط <span className="dot red"></span>مراجعة</div>
          </div>
        </section>

        <div className={`function-dock ${toolMenuOpen ? 'open' : ''}`}>
          {toolMenuOpen && <div className="tool-flyout">
            {tools.map((tool) => <button key={tool.id} onClick={() => chooseTool(tool.id)} className={activeTool === tool.id ? 'active' : ''}>
              <tool.icon size={20}/>
              <span><b>{tool.label}</b><small>{tool.hint}</small></span>
            </button>)}
          </div>}
          <button className="function-button" onClick={() => setToolMenuOpen((value) => !value)} aria-expanded={toolMenuOpen}>
            <ChevronUp size={20}/>
            <span>الوظائف</span>
            <Zap size={20}/>
          </button>
        </div>

        <aside className={`floating-panel ${panelOpen ? 'open' : ''}`}>
          <div className="panel-chrome">
            <div className="identity-card compact">
              <div className="identity-icon"><selectedTool.icon size={22}/></div>
              <div>
                <span className="muted">المساحة النشطة</span>
                <h3>{selectedTool.label}</h3>
              </div>
            </div>
            <button className="icon-btn" onClick={() => setPanelOpen(false)}><X size={19}/></button>
          </div>

          {activeTool === 'ai' && <AiChat messages={messages} onSend={sendMessage} />}
          {activeTool === 'analysis' && <ParcelPanel parcel={selectedParcel} analysis={analysis} onReport={openExecutiveReport} />}
          {activeTool === 'layers' && <div className="panel-section layer-lab">
            <h3><Layers size={18}/> إدارة الطبقات</h3>
            <p>من لوحة الخريطة تستطيع تشغيل وإخفاء قطع الأراضي، النطاقات التنظيمية، ونطاقات المخاطر. هذه المساحة مهيأة لاحقاً لإضافة طبقات ArcGIS Enterprise.</p>
            <div className="layer-row"><span className="layer-swatch parcels"></span><b>قطع الأراضي</b><small>تلوين حسب قابلية التطوير</small></div>
            <div className="layer-row"><span className="layer-swatch zoning"></span><b>النطاقات التنظيمية</b><small>حدود تنظيمية فوق الخريطة</small></div>
            <div className="layer-row"><span className="layer-swatch risk"></span><b>نطاقات المخاطر</b><small>مؤشرات مخاطر مكانية</small></div>
          </div>}
          {activeTool === 'report' && <div className="panel-section report-lab">
            <h3><FileText size={18}/> التقرير التنفيذي</h3>
            <p>تم فتح التقرير في نافذة مستقلة. إذا لم تظهر، اضغط الزر أدناه.</p>
            <button className="report-btn wide" onClick={openExecutiveReport}><FileText size={16}/> فتح التقرير</button>
          </div>}
        </aside>
      </main>

      <section className="enterprise-note">
        <div><Building2 size={24}/><h3>تصور النسخة الداخلية</h3></div>
        <p>نفس الواجهة يمكن ربطها داخل منظومة مغلقة مع ArcGIS Enterprise وArcPy ونموذج محلي، مع صلاحيات وطبقات داخلية حسب بيئة العمل.</p>
        <div className="check-row"><span><CheckCircle2 size={16}/> واجهة خريطة أولاً</span><span><CheckCircle2 size={16}/> بن دايل AI</span><span><CheckCircle2 size={16}/> تقارير تنفيذية</span><span><CheckCircle2 size={16}/> جاهز للتوسع المؤسسي</span></div>
      </section>
    </div>
  );
}
