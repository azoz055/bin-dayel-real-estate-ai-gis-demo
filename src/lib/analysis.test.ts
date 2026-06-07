import { describe, expect, it } from 'vitest';
import { parcels } from '../data/parcels';
import { analyzeParcel } from './analysis';
import { answerQuestion } from './assistant';

describe('analyzeParcel', () => {
  it('returns bounded decision scores and required narrative fields', () => {
    const result = analyzeParcel(parcels[0]);
    expect(result.overallScore).toBeGreaterThanOrEqual(0);
    expect(result.overallScore).toBeLessThanOrEqual(100);
    expect(result.findings.length).toBeGreaterThan(3);
    expect(result.executiveBrief).toContain('ملخص تنفيذي');
  });

  it('assistant requires parcel selection before analysis', () => {
    expect(answerQuestion('حلل الارض', null, null)).toContain('حدد قطعة');
  });

  it('assistant answers executive summary questions using selected parcel analysis', () => {
    const parcel = parcels[2];
    const analysis = analyzeParcel(parcel);
    const answer = answerQuestion('اعطني ملخص للإدارة', parcel, analysis);
    expect(answer).toContain(parcel.district);
    expect(answer).toContain('ArcGIS Enterprise');
  });
});
