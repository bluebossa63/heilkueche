import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const features = [
  {
    icon: '🩺',
    title: 'Gesundheitsthemen',
    description: 'Entdecke, welche Ernährung bei Bluthochdruck, Diabetes, Cholesterin und mehr hilft.',
    href: '/conditions',
  },
  {
    icon: '🥗',
    title: 'Gesunde Rezepte',
    description: 'Hunderte Rezepte mit Gesundheits-Tags, Nährwertangaben und Kostenübersicht.',
    href: '/recipes',
  },
  {
    icon: '📅',
    title: 'Mahlzeitenplaner',
    description: 'Plane deine Woche mit dem Drag-and-Drop-Planer und behalte den Überblick.',
    href: '/meal-planner',
  },
  {
    icon: '🛒',
    title: 'Smarte Einkaufsliste',
    description: 'Generiere deine Einkaufsliste automatisch aus dem wöchentlichen Mahlzeitenplan.',
    href: '/shopping-list',
  },
  {
    icon: '🧠',
    title: 'Wissen',
    description: 'Verstehe die Zusammenhänge zwischen Ernährung und Gesundheit.',
    href: '/wissen',
  },
  {
    icon: '👤',
    title: 'Dein Profil',
    description: 'Wähle deine Gesundheitsthemen und erhalte personalisierte Empfehlungen.',
    href: '/profile',
  },
];

const conditions = [
  { icon: '❤️', name: 'Bluthochdruck', id: 'bluthochdruck' },
  { icon: '🩸', name: 'Diabetes Typ 2', id: 'diabetes-typ-2' },
  { icon: '🫀', name: 'Hohes Cholesterin', id: 'hohes-cholesterin' },
  { icon: '🦴', name: 'Entzündungen & Arthrose', id: 'entzuendungen-arthrose' },
  { icon: '🫁', name: 'Verdauungsbeschwerden', id: 'verdauungsbeschwerden' },
  { icon: '🔴', name: 'Eisenmangel', id: 'eisenmangel' },
  { icon: '⚖️', name: 'Übergewicht', id: 'uebergewicht' },
  { icon: '🧠', name: 'Migräne', id: 'migraene' },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-16 pb-12 text-center">
        <h1 className="font-heading text-5xl md:text-6xl font-bold text-charcoal leading-tight mb-4">
          Gesund essen.<br />
          <span className="text-primary">Besser leben.</span>
        </h1>
        <p className="text-lg text-charcoal-light max-w-xl mx-auto mb-8">
          Erfahre, welche Ernährung bei deinen Gesundheitsthemen hilft.
          Finde passende Rezepte, plane deine Mahlzeiten und lerne die
          Zusammenhänge zwischen Ernährung und Wohlbefinden kennen.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/conditions">
            <Button size="lg">Gesundheitsthemen entdecken</Button>
          </Link>
          <Link href="/recipes">
            <Button variant="secondary" size="lg">Rezepte durchstöbern</Button>
          </Link>
        </div>
      </section>

      {/* Health Conditions Quick Access */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <h2 className="font-heading text-3xl text-center text-charcoal mb-3">Wobei kann Ernährung helfen?</h2>
        <p className="text-center text-charcoal-light mb-8 max-w-xl mx-auto">
          Wähle ein Gesundheitsthema und erfahre, was du essen solltest und was du besser meidest.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {conditions.map(({ icon, name, id }) => (
            <Link key={id} href={`/conditions/detail?id=${id}`} className="group block">
              <Card className="h-full text-center py-6 px-3 group-hover:shadow-card-hover group-hover:border-primary/20 border border-transparent transition-all">
                <div className="text-4xl mb-3">{icon}</div>
                <h3 className="font-medium text-charcoal text-sm">{name}</h3>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Disclaimer banner */}
      <section className="max-w-3xl mx-auto px-4 pb-12">
        <div className="bg-accent/10 border border-accent/30 rounded-2xl p-6 text-center">
          <p className="text-sm text-charcoal-light">
            <strong className="text-charcoal">Wichtiger Hinweis:</strong> Diese App ersetzt keine ärztliche Beratung.
            Die Informationen dienen der allgemeinen Aufklärung über ernährungsbezogene Zusammenhänge.
            Bei gesundheitlichen Beschwerden wenden Sie sich bitte an Ihren Arzt oder Ihre Ärztin.
          </p>
        </div>
      </section>

      {/* Welcome text */}
      <section className="max-w-3xl mx-auto px-4 pb-16">
        <div className="relative bg-gradient-to-br from-sage via-white to-secondary/5 rounded-3xl p-8 md:p-12 text-center overflow-hidden border border-primary/10">
          <div className="relative z-10">
            <h2 className="font-heading text-2xl md:text-3xl text-charcoal mb-4">
              Ernährung als Schlüssel zur Gesundheit
            </h2>
            <p className="text-charcoal-light leading-relaxed mb-4">
              Was wir essen, beeinflusst unseren Körper mehr als die meisten Menschen denken.
              Ob Bluthochdruck, Diabetes, Cholesterin oder Entzündungen — die richtige Ernährung
              kann einen grossen Unterschied machen.
            </p>
            <p className="text-charcoal-light leading-relaxed mb-4">
              Heilküche hilft dir dabei, die richtigen Lebensmittel für deine Situation zu finden.
              Mit Rezepten, die gezielt auf Gesundheitsthemen abgestimmt sind, einem praktischen
              Mahlzeitenplaner und fundiertem Ernährungswissen.
            </p>
            <p className="text-charcoal leading-relaxed font-medium">
              Für alle Menschen, die ihre Gesundheit durch bewusste Ernährung unterstützen möchten.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <h2 className="font-heading text-3xl text-center text-charcoal mb-10">Alles, was du brauchst</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {features.map(({ icon, title, description, href }) => (
            <Link key={href} href={href} className="group block">
              <Card className="h-full group-hover:shadow-card-hover transition-shadow text-center">
                <div className="text-4xl mb-4">{icon}</div>
                <h3 className="font-heading text-xl font-semibold text-charcoal mb-2">{title}</h3>
                <p className="text-charcoal-light text-sm leading-relaxed">{description}</p>
              </Card>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/conditions">
            <Button size="lg">Jetzt starten</Button>
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <h2 className="font-heading text-2xl text-center text-charcoal mb-8">Was unsere Nutzer sagen</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              quote: 'Seit ich die Rezepte für meinen Bluthochdruck nutze, sind meine Werte deutlich besser. Und das Essen schmeckt trotzdem wunderbar!',
              name: 'Thomas, 52',
              detail: 'Zürich',
            },
            {
              quote: 'Endlich verstehe ich, welche Lebensmittel meinem Körper guttun. Der Mahlzeitenplaner spart mir jede Woche Zeit beim Einkaufen.',
              name: 'Sandra, 44',
              detail: 'Bern',
            },
            {
              quote: 'Als Diabetiker finde ich hier Rezepte, die meinen Blutzucker stabil halten und trotzdem Spass machen. Grossartige App!',
              name: 'Markus, 38',
              detail: 'Basel',
            },
          ].map((t, i) => (
            <Card key={i} className="p-6 text-center">
              <p className="text-charcoal-light text-sm leading-relaxed italic mb-4">&ldquo;{t.quote}&rdquo;</p>
              <p className="font-medium text-charcoal text-sm">{t.name}</p>
              <p className="text-xs text-charcoal-light">{t.detail}</p>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
