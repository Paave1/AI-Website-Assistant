import {describe, it, expect} from 'vitest';
import {computeScore} from '@/lib/score';

describe('computeScore', () => {
  it('awards points for meta, mobile, https, gdpr and speed', () => {
    const score = computeScore({
      hasHTTPS: true,
      hasViewportMeta: true,
      title: 'Title',
      metaDescription: 'Desc',
      h1: 'H1',
      canonical: null,
      robots: null,
      favicon: true,
      hreflang: [],
      hasCookieWords: true,
      privacyPolicyUrlFound: true,
      imgCount: 3,
      avgImgBytesApprox: 150000,
      scriptCount: 5
    });
    expect(score).toBeGreaterThanOrEqual(80);
    expect(score).toBeLessThanOrEqual(100);
  });
});



