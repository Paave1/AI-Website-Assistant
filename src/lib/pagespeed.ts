export type PSIResult = {lcp: number | null; score: number | null};

export async function getPageSpeed(url: string): Promise<PSIResult | null> {
  const key = process.env.PAGESPEED_API_KEY;
  if (!key) return null;
  try {
    const endpoint = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
    endpoint.searchParams.set('url', url);
    endpoint.searchParams.set('key', key);
    endpoint.searchParams.set('strategy', 'mobile');
    const res = await fetch(endpoint.toString());
    if (!res.ok) return null;
    const data = await res.json();
    const lcp = data?.lighthouseResult?.audits?.['largest-contentful-paint']?.numericValue ?? null;
    const score = Math.round((data?.lighthouseResult?.categories?.performance?.score ?? 0) * 100);
    return {lcp, score: Number.isFinite(score) ? score : null};
  } catch {
    return null;
  }
}



