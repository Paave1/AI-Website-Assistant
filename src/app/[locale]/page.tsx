import {useTranslations} from 'next-intl';
import Link from 'next/link';
import UrlForm from '@/components/UrlForm';

export default function Landing() {
  const t = useTranslations('landing');
  return (
    <main className="min-h-svh flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-3xl sm:text-5xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground text-base sm:text-lg">{t('subtitle')}</p>
        </div>
        <UrlForm />
        <div className="mt-3 space-x-3 text-sm text-center">
          <Link className="underline" href="/en">EN</Link>
          <Link className="underline" href="/fi">FI</Link>
        </div>
      </div>
    </main>
  );
}


