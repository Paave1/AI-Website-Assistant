import {PrismaClient} from '@prisma/client';
import Link from 'next/link';
import PdfButton from '@/components/PdfButton';

const prisma = new PrismaClient();

export default async function ReportPage({params}: {params: {id: string}}) {
  const scan = await prisma.scan.findUnique({where: {id: params.id}});
  if (!scan) return <main className="p-6">Not found</main>;
  const summary = scan.aiSummary as {good: string[]; issues: string[]; steps: string[]};
  const signals = scan.rawFindings as {
    hasHTTPS: boolean;
    hasViewportMeta: boolean;
    title: string | null;
    metaDescription: string | null;
    h1: string | null;
    scriptCount: number;
    imgCount: number;
    hasCookieWords: boolean;
    privacyPolicyUrlFound: boolean;
  };
  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Report</h1>
        <Link className="underline" href="/en">New analysis</Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <section className="border rounded p-4">
          <h2 className="font-semibold mb-2">Tech</h2>
          <ul className="text-sm space-y-1">
            <li>HTTPS: {signals.hasHTTPS ? 'Yes' : 'No'}</li>
            <li>Viewport meta: {signals.hasViewportMeta ? 'Yes' : 'No'}</li>
            <li>Scripts: {signals.scriptCount}</li>
            <li>Images: {signals.imgCount}</li>
          </ul>
        </section>
        <section className="border rounded p-4">
          <h2 className="font-semibold mb-2">Content</h2>
          <ul className="text-sm space-y-1">
            <li>Title: {signals.title || '-'}</li>
            <li>Description: {signals.metaDescription || '-'}</li>
            <li>H1: {signals.h1 || '-'}</li>
          </ul>
        </section>
        <section className="border rounded p-4">
          <h2 className="font-semibold mb-2">GDPR & Trust</h2>
          <ul className="text-sm space-y-1">
            <li>Cookie banner hints: {signals.hasCookieWords ? 'Detected' : 'Missing'}</li>
            <li>Privacy policy link: {signals.privacyPolicyUrlFound ? 'Found' : 'Not found'}</li>
          </ul>
        </section>
        <section className="border rounded p-4">
          <h2 className="font-semibold mb-2">AI Summary</h2>
          <div className="text-sm">
            <h3 className="font-semibold mt-2">What&apos;s good</h3>
            <ul className="list-disc pl-5">
              {(summary.good || []).map((g: string, i: number) => (
                <li key={i}>{g}</li>
              ))}
            </ul>
            <h3 className="font-semibold mt-2">Issues</h3>
            <ul className="list-disc pl-5">
              {(summary.issues || []).map((g: string, i: number) => (
                <li key={i}>{g}</li>
              ))}
            </ul>
            <h3 className="font-semibold mt-2">Next steps</h3>
            <ol className="list-decimal pl-5">
              {(summary.steps || []).map((g: string, i: number) => (
                <li key={i}>{g}</li>
              ))}
            </ol>
          </div>
        </section>
      </div>
      <div className="border rounded p-4">Overall score: {scan.score}</div>
      <div className="">
        <PdfButton data={{url: scan.url, aiSummary: summary}} />
      </div>
    </main>
  );
}


