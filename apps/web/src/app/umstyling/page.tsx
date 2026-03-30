import Link from 'next/link';

export default function UmstylingPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <h1 className="font-heading text-2xl text-charcoal mb-4">Seite nicht verfügbar</h1>
      <p className="text-charcoal-light mb-6">Diese Funktion ist in Heilküche nicht enthalten.</p>
      <Link href="/" className="btn-primary">Zur Startseite</Link>
    </div>
  );
}
