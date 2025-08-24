import {PrismaClient} from '@/generated/prisma';

const prisma = new PrismaClient();

export default async function ReportPage({params}: {params: {id: string}}) {
  const scan = await prisma.scan.findUnique({where: {id: params.id}});
  if (!scan) {
    return (
      <main className="min-h-svh flex items-center justify-center p-6">
        <div className="text-center text-gray-600">Report not found</div>
      </main>
    );
  }
  const summary = scan.aiSummary as unknown as {good?: string[]; issues?: string[]; steps?: string[]};

  return (
    <main className="p-6 max-w-4xl mx-auto space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">{scan.url}</h1>
          <p className="text-sm text-gray-500">{new Date(scan.createdAt).toLocaleString()}</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold">{scan.score}</div>
          <div className="text-xs text-gray-500">Score</div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="border rounded-lg p-4 bg-white">
          <h2 className="font-semibold mb-2">Good</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            {(summary.good || []).length ? (
              (summary.good || []).map((item, i) => <li key={i}>{item}</li>)
            ) : (
              <li className="list-none text-gray-500">No items</li>
            )}
          </ul>
        </div>
        <div className="border rounded-lg p-4 bg-white">
          <h2 className="font-semibold mb-2">Issues</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            {(summary.issues || []).length ? (
              (summary.issues || []).map((item, i) => <li key={i}>{item}</li>)
            ) : (
              <li className="list-none text-gray-500">No items</li>
            )}
          </ul>
        </div>
        <div className="border rounded-lg p-4 bg-white">
          <h2 className="font-semibold mb-2">Steps</h2>
          <ol className="list-decimal pl-5 space-y-1 text-sm">
            {(summary.steps || []).length ? (
              (summary.steps || []).map((item, i) => <li key={i}>{item}</li>)
            ) : (
              <li className="list-none text-gray-500">No steps</li>
            )}
          </ol>
        </div>
      </section>
    </main>
  );
}



