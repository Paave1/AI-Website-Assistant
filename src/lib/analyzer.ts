import {load} from 'cheerio';

export type Signals = {
  hasHTTPS: boolean;
  hasViewportMeta: boolean;
  title: string | null;
  metaDescription: string | null;
  h1: string | null;
  canonical: string | null;
  robots: string | null;
  favicon: boolean;
  hreflang: string[];
  hasCookieWords: boolean;
  privacyPolicyUrlFound: boolean;
  imgCount: number;
  avgImgBytesApprox: number | null;
  scriptCount: number;
  pageSpeed?: {lcp: number | null; score: number | null};
};

export async function fetchHtml(url: string, timeoutMs = 15000): Promise<string> {
  const controller = new AbortController();
  const to = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      // Undici fetch is global in Node 18+
      headers: {
        'User-Agent': 'AI Website Assistant/1.0 (+https://example.com)'
      }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(to);
  }
}

export function extractSignals(html: string, url: string): Signals {
  const $ = load(html);
  const title = $('title').first().text().trim() || null;
  const metaDescription = $('meta[name="description"]').attr('content') || null;
  const h1 = $('h1').first().text().trim() || null;
  const canonical = $('link[rel="canonical"]').attr('href') || null;
  const robots = $('meta[name="robots"]').attr('content') || null;
  const favicon = Boolean(
    $('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]').length
  );
  const hasViewportMeta = Boolean($('meta[name="viewport"]').length);
  const hreflang = $('link[rel="alternate"][hreflang]')
    .map((_, el) => $(el).attr('hreflang') || '')
    .get()
    .filter(Boolean);
  const bodyText = $('body').text().toLowerCase();
  const hasCookieWords = /(cookie|eväste|gdpr|consent)/i.test(bodyText);
  const privacyPolicyUrlFound = $('a[href*="privacy" i], a[href*="tietosuoja" i]').length > 0;
  const imgTags = $('img');
  const imgCount = imgTags.length;
  const scriptCount = $('script').length;

  // Approx image bytes via heuristic on data-src or width/height; very rough
  let totalApprox = 0;
  let counted = 0;
  imgTags.each((_, el) => {
    const width = Number($(el).attr('width') || 0);
    const height = Number($(el).attr('height') || 0);
    if (width && height) {
      totalApprox += width * height * 0.25; // 0.25 bytes per pixel heuristic
      counted += 1;
    }
  });
  const avgImgBytesApprox = counted ? Math.round(totalApprox / counted) : null;

  const hasHTTPS = /^https:\/\//i.test(url);

  return {
    hasHTTPS,
    hasViewportMeta,
    title,
    metaDescription,
    h1,
    canonical,
    robots,
    favicon,
    hreflang,
    hasCookieWords,
    privacyPolicyUrlFound,
    imgCount,
    avgImgBytesApprox,
    scriptCount
  };
}


