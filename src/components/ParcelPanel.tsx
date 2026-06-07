import { AlertTriangle, BarChart3, FileText, LandPlot, Navigation, Shield, TrendingUp } from 'lucide-react';
import type { AnalysisResult, Parcel } from '../types';
import { formatSar, getScoreColor } from '../lib/analysis';

interface Props { parcel: Parcel | null; analysis: AnalysisResult | null; onReport: () => void; }

function Metric({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: any; color?: string }) {
  return <div className="metric"><Icon size={18} style={{ color }} /><span>{label}</span><strong>{value}</strong></div>;
}

export default function ParcelPanel({ parcel, analysis, onReport }: Props) {
  if (!parcel || !analysis) return <div className="panel-section"><h3>اختر قطعة أرض</h3><p>اضغط على قطعة من الخريطة لعرض التحليل.</p></div>;
  return (
    <div className="panel-section">
      <div className="parcel-title"><div><span className="muted">القطعة المحددة</span><h2>{parcel.name}</h2><p>{parcel.id} · {parcel.district}</p></div><button className="report-btn" onClick={onReport}><FileText size={16}/> تقرير تنفيذي</button></div>
      <div className="score-ring" style={{ '--score-color': getScoreColor(analysis.overallScore), '--p': analysis.overallScore } as React.CSSProperties}>
        <div><strong>{analysis.overallScore}</strong><span>/100</span><p>قابلية التطوير: {analysis.developmentPotential}</p></div>
      </div>
      <div className="metrics-grid">
        <Metric icon={LandPlot} label="المساحة" value={`${parcel.areaSqm.toLocaleString('ar-SA')} م²`} color="#38bdf8" />
        <Metric icon={TrendingUp} label="القيمة ديمو" value={formatSar(parcel.estimatedValueSar)} color="#22c55e" />
        <Metric icon={Navigation} label="الطريق" value={`${parcel.distanceToMainRoadM.toLocaleString('ar-SA')} م`} color="#f59e0b" />
        <Metric icon={Shield} label="المخاطر" value={parcel.riskLevel} color="#ef4444" />
      </div>
      <div className="analysis-card"><h4><BarChart3 size={17}/> ملخص بن دايل</h4><p>{analysis.summary}</p></div>
      <div className="mini-bars">
        {[['الوصول', analysis.accessibilityScore], ['التنظيم', analysis.regulationScore], ['المخاطر', analysis.riskScore], ['جودة البيانات', analysis.dataQualityScore]].map(([label, value]) => <div className="bar-row" key={label as string}><span>{label}</span><div><i style={{ width: `${value}%`, background: getScoreColor(value as number) }} /></div><b>{value}</b></div>)}
      </div>
      <div className="list-card"><h4>أبرز النتائج</h4>{analysis.findings.slice(0, 4).map((f) => <p key={f}>• {f}</p>)}</div>
      <div className="warning-card"><h4><AlertTriangle size={16}/> تنبيهات</h4>{analysis.warnings.map((w) => <p key={w}>• {w}</p>)}</div>
    </div>
  );
}
