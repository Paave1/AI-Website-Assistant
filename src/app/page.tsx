import UrlForm from '@/components/UrlForm';

export default function Home() {
  return (
    <main className="min-h-svh flex items-center justify-center p-6">
      <div className="w-full max-w-3xl text-center space-y-6">
        <h1 className="text-3xl sm:text-5xl font-bold">Check your website in 60 seconds</h1>
        <UrlForm />
      </div>
    </main>
  );
}
