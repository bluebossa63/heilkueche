'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { SkeletonCard } from '@/components/ui/SkeletonLoader';
import BackButton from '@/components/BackButton';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  icon?: string;
  readingTimeMinutes?: number;
}

// Fallback articles (always shown, even without API data)
const STATIC_ARTICLES: Article[] = [
  {
    id: 'ernaehrung-grundlagen',
    title: 'Ernährung und Gesundheit: Die Grundlagen',
    summary: 'Wie beeinflusst unsere Ernährung die Gesundheit? Ein Überblick über die wichtigsten Zusammenhänge.',
    content: `Unsere Ernährung hat einen enormen Einfluss auf unsere Gesundheit. Was wir essen, beeinflusst nicht nur unser Gewicht, sondern auch unseren Blutdruck, Blutzucker, Cholesterinspiegel und sogar Entzündungsprozesse im Körper.

Eine ausgewogene Ernährung mit viel Gemüse, Obst, Vollkornprodukten, gesunden Fetten und magerem Eiweiss kann das Risiko für viele chronische Krankheiten senken. Dabei geht es nicht um Verzicht, sondern um bewusste Entscheidungen.

Wichtige Grundsätze:
- Iss möglichst naturbelassene Lebensmittel
- Achte auf Vielfalt und Farbe auf dem Teller
- Reduziere stark verarbeitete Lebensmittel
- Trinke ausreichend Wasser (1.5-2 Liter täglich)
- Achte auf regelmässige Mahlzeiten`,
    category: 'Grundlagen',
    icon: '📚',
  },
  {
    id: 'mediterrane-ernaehrung',
    title: 'Die mediterrane Ernährung',
    summary: 'Warum die Mittelmeerdiät als eine der gesündesten Ernährungsweisen gilt.',
    content: `Die mediterrane Ernährung gilt als eine der bestuntersuchten und gesündesten Ernährungsformen weltweit. Sie basiert auf den traditionellen Essgewohnheiten der Mittelmeerländer.

Kernelemente:
- Reichlich Olivenöl als Hauptfettquelle
- Viel Gemüse, Obst, Hülsenfrüchte und Nüsse
- Vollkornprodukte statt Weissmehl
- Regelmässig Fisch und Meeresfrüchte
- Massvoll Milchprodukte (vor allem Joghurt und Käse)
- Wenig rotes Fleisch
- Kräutern und Gewürzen statt Salz

Nachgewiesene Vorteile:
- Senkt das Risiko für Herz-Kreislauf-Erkrankungen
- Hilft bei der Blutzuckerkontrolle
- Wirkt entzündungshemmend
- Kann das Risiko für bestimmte Krebsarten reduzieren`,
    category: 'Ernährungsformen',
    icon: '🫒',
  },
  {
    id: 'entzuendungen-ernaehrung',
    title: 'Entzündungen und Ernährung',
    summary: 'Wie bestimmte Lebensmittel Entzündungen fördern oder hemmen können.',
    content: `Chronische Entzündungen spielen bei vielen Erkrankungen eine Rolle — von Arthrose über Herzerkrankungen bis hin zu Diabetes. Die Ernährung kann Entzündungen sowohl fördern als auch hemmen.

Entzündungshemmende Lebensmittel:
- Fetter Fisch (Lachs, Makrele, Sardinen) — reich an Omega-3
- Beeren (Heidelbeeren, Erdbeeren, Himbeeren)
- Grünes Blattgemüse (Spinat, Grünkohl)
- Nüsse (besonders Walnüsse)
- Olivenöl (extra vergine)
- Kurkuma und Ingwer
- Dunkle Schokolade (mind. 70% Kakao)

Entzündungsfördernde Lebensmittel:
- Zucker und süsse Getränke
- Transfette und stark verarbeitete Öle
- Stark verarbeitetes Fleisch (Wurst, Speck)
- Weissmehlprodukte
- Alkohol im Übermass`,
    category: 'Gesundheit',
    icon: '🔬',
  },
  {
    id: 'ballaststoffe',
    title: 'Ballaststoffe: Unterschätzter Gesundheitshelfer',
    summary: 'Warum Ballaststoffe so wichtig sind und wie man mehr davon in den Alltag integriert.',
    content: `Ballaststoffe sind unverdauliche Pflanzenfasern, die eine Schlüsselrolle für unsere Gesundheit spielen. Die meisten Menschen essen deutlich zu wenig davon — empfohlen werden mindestens 30g pro Tag.

Vorteile von Ballaststoffen:
- Fördern eine gesunde Verdauung
- Helfen bei der Blutzuckerkontrolle
- Senken den Cholesterinspiegel
- Sättigen länger und helfen beim Gewichtsmanagement
- Füttern die nützlichen Darmbakterien

Gute Ballaststoffquellen:
- Hülsenfrüchte (Linsen, Bohnen, Kichererbsen)
- Vollkornprodukte (Haferflocken, Vollkornbrot)
- Gemüse (Brokkoli, Rüebli, Artischocken)
- Obst (Äpfel, Birnen, Beeren)
- Nüsse und Samen (Leinsamen, Chiasamen)

Tipp: Steigern Sie die Ballaststoffzufuhr langsam und trinken Sie ausreichend Wasser.`,
    category: 'Nährstoffe',
    icon: '🌾',
  },
  {
    id: 'dash-diaet',
    title: 'DASH-Diät gegen Bluthochdruck',
    summary: 'Die wissenschaftlich fundierte Ernährung zur Senkung des Blutdrucks.',
    content: `Die DASH-Diät (Dietary Approaches to Stop Hypertension) wurde speziell zur Senkung des Blutdrucks entwickelt und ist eine der am besten erforschten Ernährungsformen.

Grundprinzipien:
- Natriumzufuhr reduzieren (max. 1500-2300 mg/Tag)
- Viel Kalium, Magnesium und Calcium
- Reich an Obst und Gemüse (8-10 Portionen/Tag)
- Vollkornprodukte bevorzugen
- Mageres Eiweiss (Geflügel, Fisch, Hülsenfrüchte)
- Fettarme Milchprodukte
- Nüsse und Samen in Massen
- Wenig Zucker und Süssspeisen

Studien zeigen, dass die DASH-Diät den systolischen Blutdruck um 8-14 mmHg senken kann — vergleichbar mit einem Blutdruckmedikament.

Wichtig: Sprechen Sie Ernährungsänderungen bei bestehendem Bluthochdruck immer mit Ihrem Arzt ab.`,
    category: 'Gesundheit',
    icon: '❤️',
  },
  {
    id: 'eisen-ernaehrung',
    title: 'Eisen: So beugen Sie Eisenmangel vor',
    summary: 'Wie Sie Ihren Eisenbedarf über die Ernährung decken und die Aufnahme verbessern.',
    content: `Eisen ist ein lebenswichtiges Spurenelement, das für den Sauerstofftransport im Blut unverzichtbar ist. Eisenmangel ist weltweit eine der häufigsten Nährstoffmängel.

Gute Eisenquellen:
- Häm-Eisen (tierisch, besser aufnehmbar): rotes Fleisch, Leber, Muscheln
- Nicht-Häm-Eisen (pflanzlich): Linsen, Kichererbsen, Spinat, Tofu, Kürbiskerne, Haferflocken

Tipps zur besseren Eisenaufnahme:
- Vitamin C verbessert die Aufnahme: Paprika, Zitrusfrüchte, Kiwi
- Kaffee und Tee hemmen die Aufnahme — Abstand zu Mahlzeiten halten
- Calcium hemmt die Aufnahme — Milchprodukte nicht gleichzeitig essen
- Eingeweichte Hülsenfrüchte und Vollkornprodukte sind besser verfügbar

Risikogruppen:
- Frauen im gebärfähigen Alter
- Schwangere
- Veganer und Vegetarier
- Sportler

Tipp: Lassen Sie Ihre Eisenwerte regelmässig beim Arzt überprüfen.`,
    category: 'Nährstoffe',
    icon: '🔴',
  },
];

export default function WissenPage() {
  const [apiArticles, setApiArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/wissen`)
      .then(r => r.json())
      .then(d => setApiArticles(d.articles || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const articles = [...apiArticles, ...STATIC_ARTICLES.filter(s => !apiArticles.find(a => a.id === s.id))];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <BackButton />
      <div className="mb-8 text-center">
        <h1 className="font-heading text-4xl text-charcoal mb-3">Wissen</h1>
        <p className="text-charcoal-light max-w-xl mx-auto">
          Fundiertes Ernährungswissen — einfach erklärt. Verstehe die Zusammenhänge zwischen dem, was du isst, und deiner Gesundheit.
        </p>
      </div>

      {/* Disclaimer */}
      <div className="bg-accent/10 border border-accent/30 rounded-xl p-4 mb-8">
        <p className="text-xs text-charcoal-light text-center">
          Diese Informationen dienen der allgemeinen Aufklärung und ersetzen keine ärztliche Beratung.
        </p>
      </div>

      <div className="space-y-4">
        {articles.map(article => {
          const isExpanded = expandedId === article.id;
          return (
            <Card key={article.id} className="overflow-hidden">
              <button
                onClick={() => setExpandedId(isExpanded ? null : article.id)}
                className="w-full text-left p-6 flex items-start gap-4 hover:bg-sage/50 transition-colors"
              >
                {article.icon && <span className="text-3xl shrink-0">{article.icon}</span>}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                      {article.category}
                    </span>
                    {article.readingTimeMinutes && (
                      <span className="text-xs text-charcoal-light">{article.readingTimeMinutes} Min. Lesezeit</span>
                    )}
                  </div>
                  <h2 className="font-heading text-lg text-charcoal mb-1">{article.title}</h2>
                  <p className="text-charcoal-light text-sm leading-relaxed">{article.summary}</p>
                </div>
                <span className={`text-charcoal-light text-lg transition-transform shrink-0 ${isExpanded ? 'rotate-180' : ''}`}>
                  &#9660;
                </span>
              </button>
              {isExpanded && (
                <div className="px-6 pb-6 pt-2 border-t border-sage-dark">
                  <div className="space-y-3">
                    {article.content.split('\n\n').map((paragraph, i) => {
                      // Markdown h2 headings
                      if (paragraph.startsWith('## ')) {
                        return <h3 key={i} className="font-heading text-base font-semibold text-charcoal mt-4 mb-1">{paragraph.replace(/^## /, '')}</h3>;
                      }
                      // Markdown h3 headings
                      if (paragraph.startsWith('### ')) {
                        return <h4 key={i} className="font-semibold text-sm text-charcoal mt-3 mb-1">{paragraph.replace(/^### /, '')}</h4>;
                      }
                      // Bullet list paragraphs
                      const lines = paragraph.split('\n');
                      const isList = lines.some(l => l.startsWith('- ') || l.startsWith('* ') || l.match(/^\d+\. /));
                      if (isList) {
                        return (
                          <ul key={i} className="space-y-1">
                            {lines.filter(Boolean).map((line, j) => {
                              const text = line.replace(/^[-*] /, '').replace(/^\d+\. /, '').replace(/\*\*(.*?)\*\*/g, '$1');
                              return (
                                <li key={j} className="text-sm text-charcoal-light flex items-start gap-2">
                                  <span className="text-primary mt-0.5 shrink-0">&#8226;</span>
                                  {text}
                                </li>
                              );
                            })}
                          </ul>
                        );
                      }
                      // Plain text (strip bold markdown)
                      const text = paragraph.replace(/\*\*(.*?)\*\*/g, '$1');
                      return <p key={i} className="text-sm text-charcoal-light leading-relaxed">{text}</p>;
                    })}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
