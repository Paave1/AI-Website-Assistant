export const runtime = 'nodejs';
import {NextRequest, NextResponse} from 'next/server';
import {z} from 'zod';
import {load} from 'cheerio';
import OpenAI from 'openai';
import {PrismaClient, Prisma} from '@prisma/client';

const prisma = new PrismaClient();

type Lang = 'fi' | 'en';

type Signals = {
  hasHTTPS: boolean;
  hasViewportMeta: boolean;
  title: string | null;
  metaDescription: string | null;
  h1: string | null;
  canonical: string | null;
  robots: string | null;
  favicon: boolean;
};

type AISummary = {good: string[]; issues: string[]; steps: string[]};

const BodySchema = z.object({
  url: z.string().min(1),
  lang: z.enum(['fi', 'en']).optional()
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = BodySchema.parse(json);

    // Normalize & validate URL
    const normalizedUrl = normalizeUrl(parsed.url);
    new URL(normalizedUrl); // throws if invalid
    const lang: Lang = (parsed.lang ?? 'en') as Lang;

    // Fetch HTML with timeout (15s)
    const html = await fetchWithTimeout(normalizedUrl, 15000);

    // Parse signals with cheerio
    const signals = extractSignals(html, normalizedUrl);

    // Simple scoring (5 x 20)
    const score = computeSimpleScore(signals);

    // AI summary (OpenAI). If no API key, use a deterministic fallback
    const aiSummary = await generateAISummary(normalizedUrl, lang, signals);

    // Persist to DB
    const created = await prisma.scan.create({
      data: {
        url: normalizedUrl,
        email: null,
        lang,
        rawFindings: signals as Prisma.InputJsonValue,
        aiSummary: aiSummary as Prisma.InputJsonValue,
        score
      }
    });

    return NextResponse.json({scanId: created.id, aiSummary, score});
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Bad Request';
    return NextResponse.json({error: message}, {status: 400});
  }
}

function normalizeUrl(input: string): string {
  let raw = input.trim();
  if (!/^https?:\/\//i.test(raw)) raw = 'https://' + raw;
  try {
    const u = new URL(raw);
    u.hash = '';
    return u.toString();
  } catch {
    return raw; // will be validated by URL constructor in POST
  }
}

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'AI Website Assistant/1.0'
      }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

function extractSignals(html: string, url: string): Signals {
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
  const hasHTTPS = /^https:\/\//i.test(url);

  return {hasHTTPS, hasViewportMeta, title, metaDescription, h1, canonical, robots, favicon};
}

function computeSimpleScore(s: Signals): number {
  let score = 0;
  if (s.hasHTTPS) score += 20;
  if (s.hasViewportMeta) score += 20;
  if (s.title && s.metaDescription) score += 20;
  if (s.h1) score += 20;
  if (s.favicon) score += 20;
  return score;
}

async function generateAISummary(url: string, lang: Lang, signals: Signals): Promise<AISummary> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    // Fallback concise summary
    const good: string[] = [];
    if (signals.hasHTTPS) good.push(lang === 'fi' ? 'HTTPS käytössä' : 'HTTPS enabled');
    if (signals.hasViewportMeta) good.push(lang === 'fi' ? 'Mobiili-viewport löytyy' : 'Viewport set for mobile');
    if (signals.favicon) good.push(lang === 'fi' ? 'Favicon asetettu' : 'Favicon present');
    const issues: string[] = [];
    if (!signals.title || !signals.metaDescription)
      issues.push(lang === 'fi' ? 'Puuttuva tai heikko otsikko/kuvaus' : 'Missing/weak title or description');
    if (!signals.h1) issues.push(lang === 'fi' ? 'Puuttuva H1-otsikko' : 'Missing H1 heading');
    const steps = [
      lang === 'fi' ? 'Lisää selkeä H1 ja kuvaava meta description.' : 'Add a clear H1 and descriptive meta description.',
      lang === 'fi' ? 'Varmista mobiili-viewport ja favicon.' : 'Ensure mobile viewport and favicon.',
      lang === 'fi' ? 'Pidä etusivun viesti ytimekkäänä.' : 'Keep your homepage message concise.'
    ];
    return {good: good.slice(0, 4), issues: issues.slice(0, 6), steps: steps.slice(0, 3)};
  }

  const client = new OpenAI({apiKey: key});
  const system = 'You are a website audit assistant for Finnish small businesses. Be concise, concrete, and practical.';
  const userPayload = {
    lang,
    url,
    signals
  };
  const res = await client.chat.completions.create({
    model: 'gpt-4.1-mini',
    temperature: 0.2,
    response_format: {type: 'json_object'},
    messages: [
      {role: 'system', content: system},
      {
        role: 'user',
        content:
          'Return only valid JSON with keys {"good":[], "issues":[], "steps":[]} and limits: good<=4, issues<=6, steps=3. Use the specified language.\n' +
          JSON.stringify(userPayload)
      }
    ]
  });
  const content = res.choices[0]?.message?.content || '{}';
  let parsed: AISummary = {good: [], issues: [], steps: []};
  try {
    parsed = JSON.parse(content);
  } catch {}
  parsed.good = (parsed.good || []).slice(0, 4);
  parsed.issues = (parsed.issues || []).slice(0, 6);
  parsed.steps = (parsed.steps || []).slice(0, 3);
  return parsed;
}
