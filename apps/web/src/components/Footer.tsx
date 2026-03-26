import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-primary/10 bg-sage-dark mt-16">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="text-center mb-6">
          <p className="font-heading text-xl text-primary font-semibold mb-2">Heilkueche</p>
          <p className="text-sm text-charcoal-light">
            Gesund essen. Besser leben.
          </p>
          <p className="text-xs text-charcoal-light mt-1">
            Ernaehrung gezielt bei Gesundheitsthemen einsetzen.
          </p>
        </div>
        <div className="bg-accent/10 border border-accent/30 rounded-xl p-3 mb-6 max-w-md mx-auto">
          <p className="text-xs text-charcoal-light text-center">
            Diese App ersetzt keine aerztliche Beratung. Bei gesundheitlichen Beschwerden wenden Sie sich bitte an Ihren Arzt oder Ihre Aerztin.
          </p>
        </div>
        <div className="flex justify-center gap-6 mb-4 text-xs text-charcoal-light">
          <Link href="/datenschutz" className="hover:text-primary transition-colors">Datenschutz</Link>
          <Link href="/impressum" className="hover:text-primary transition-colors">Impressum</Link>
          <Link href="/feedback" className="hover:text-primary transition-colors">Rueckmeldung</Link>
        </div>
        <p className="text-center text-xs text-charcoal-light">
          &copy; {new Date().getFullYear()} nice&apos;n&apos;easy — Cloud, AI &amp; Automation
        </p>
      </div>
    </footer>
  );
}
