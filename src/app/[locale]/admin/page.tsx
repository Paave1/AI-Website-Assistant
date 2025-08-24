import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

type ScanRow = {
  id: string;
  url: string;
  email: string | null;
  score: number;
  lang: string;
  createdAt: Date;
};

function toCsv(rows: ScanRow[]): string {
  if (!rows.length) return '';
  const headers = ['date', 'url', 'email', 'score', 'lang'] as const;
  const lines = [headers.join(',')];
  for (const row of rows) {
    const values = [
      JSON.stringify(new Date(row.createdAt).toISOString()),
      JSON.stringify(row.url),
      JSON.stringify(row.email ?? ''),
      JSON.stringify(row.score),
      JSON.stringify(row.lang)
    ];
    lines.push(values.join(','));
  }
  return lines.join('\n');
}

export default async function AdminPage() {
  const scans = await prisma.scan.findMany({
    orderBy: {createdAt: 'desc'},
    take: 50,
    select: {id: true, url: true, email: true, score: true, lang: true, createdAt: true}
  });
  const csv = toCsv(scans);
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Admin</h1>
      <table className="w-full text-sm border">
        <thead>
          <tr className="bg-gray-50">
            <th className="p-2 text-left">Date</th>
            <th className="p-2 text-left">URL</th>
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-left">Score</th>
            <th className="p-2 text-left">Lang</th>
          </tr>
        </thead>
        <tbody>
          {scans.map((s) => (
            <tr key={s.id} className="border-t">
              <td className="p-2">{new Date(s.createdAt).toLocaleString()}</td>
              <td className="p-2">{s.url}</td>
              <td className="p-2">{s.email || '-'}</td>
              <td className="p-2">{s.score}</td>
              <td className="p-2">{s.lang}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <form method="post" action={`data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`}>
        <button className="bg-black text-white px-3 py-2 rounded" type="submit">Export CSV</button>
      </form>
    </main>
  );
}


