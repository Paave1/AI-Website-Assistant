"use client";
import {useState} from 'react';
import {useRouter} from 'next/navigation';

type Lang = 'fi' | 'en';

export default function UrlForm() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [lang, setLang] = useState<Lang>('en');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({url, lang})
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Request failed');
      router.push(`/report/${data.scanId}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex items-center gap-2">
        <input
          required
          type="url"
          placeholder="https://your-site.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
        />
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value as Lang)}
          className="border border-gray-300 rounded-md px-3 py-2 bg-white"
        >
          <option value="en">EN</option>
          <option value="fi">FI</option>
        </select>
        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white rounded-md px-4 py-2 disabled:opacity-60"
        >
          {loading ? 'Analyzing…' : 'Analyze'}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </form>
  );
}