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
  icon: string;
}

// Fallback articles (always shown, even without API data)
const STATIC_ARTICLES: Article[] = [
  {
    id: 'ernaehrung-grundlagen',
    title: 'Ernaehrung und Gesundheit: Die Grundlagen',
    summary: 'Wie beeinflusst unsere Ernaehrung die Gesundheit? Ein Ueberblick ueber die wichtigsten Zusammenhaenge.',
    content: `Unsere Ernaehrung hat einen enormen Einfluss auf unsere Gesundheit. Was wir essen, beeinflusst nicht nur unser Gewicht, sondern auch unseren Blutdruck, Blutzucker, Cholesterinspiegel und sogar Entzuendungsprozesse im Koerper.

Eine ausgewogene Ernaehrung mit viel Gemuese, Obst, Vollkornprodukten, gesunden Fetten und magerem Eiweiss kann das Risiko fuer viele chronische Krankheiten senken. Dabei geht es nicht um Verzicht, sondern um bewusste Entscheidungen.

Wichtige Grundsaetze:
- Iss moeglichst naturbelassene Lebensmittel
- Achte auf Vielfalt und Farbe auf dem Teller
- Reduziere stark verarbeitete Lebensmittel
- Trinke ausreichend Wasser (1.5-2 Liter taeglich)
- Achte auf regelmaessige Mahlzeiten`,
    category: 'Grundlagen',
    icon: '📚',
  },
  {
    id: 'mediterrane-ernaehrung',
    title: 'Die mediterrane Ernaehrung',
    summary: 'Warum die Mittelmeerdiaet als eine der gesuendesten Ernaehrungsweisen gilt.',
    content: `Die mediterrane Ernaehrung gilt als eine der bestuntersuchten und gesuendesten Ernaehrungsformen weltweit. Sie basiert auf den traditionellen Essgewohnheiten der Mittelmeerlaender.

Kernelemente:
- Reichlich Olivenoel als Hauptfettquelle
- Viel Gemuese, Obst, Huelsenfruechte und Nuesse
- Vollkornprodukte statt Weissmehl
- Regelmaessig Fisch und Meeresfruechte
- Massvoll Milchprodukte (vor allem Joghurt und Kaese)
- Wenig rotes Fleisch
- Kraeutern und Gewuerzen statt Salz

Nachgewiesene Vorteile:
- Senkt das Risiko fuer Herz-Kreislauf-Erkrankungen
- Hilft bei der Blutzuckerkontrolle
- Wirkt entzuendungshemmend
- Kann das Risiko fuer bestimmte Krebsarten reduzieren`,
    category: 'Ernaehrungsformen',
    icon: '🫒',
  },
  {
    id: 'entzuendungen-ernaehrung',
    title: 'Entzuendungen und Ernaehrung',
    summary: 'Wie bestimmte Lebensmittel Entzuendungen foerdern oder hemmen koennen.',
    content: `Chronische Entzuendungen spielen bei vielen Erkrankungen eine Rolle — von Arthrose ueber Herzerkrankungen bis hin zu Diabetes. Die Ernaehrung kann Entzuendungen sowohl foerdern als auch hemmen.

Entzuendungshemmende Lebensmittel:
- Fetter Fisch (Lachs, Makrele, Sardinen) — reich an Omega-3
- Beeren (Heidelbeeren, Erdbeeren, Himbeeren)
- Gruenes Blattgemuese (Spinat, Gruenkohl)
- Nuesse (besonders Walnuesse)
- Olivenoel (extra vergine)
- Kurkuma und Ingwer
- Dunkle Schokolade (mind. 70% Kakao)

Entzuendungsfoerdernde Lebensmittel:
- Zucker und suesse Getraenke
- Transfette und stark verarbeitete Oele
- Stark verarbeitetes Fleisch (Wurst, Speck)
- Weissmehlprodukte
- Alkohol im Uebermass`,
    category: 'Gesundheit',
    icon: '🔬',
  },
  {
    id: 'ballaststoffe',
    title: 'Ballaststoffe: Unterschaetzter Gesundheitshelfer',
    summary: 'Warum Ballaststoffe so wichtig sind und wie man mehr davon in den Alltag integriert.',
    content: `Ballaststoffe sind unverdauliche Pflanzenfasern, die eine Schluesselrolle fuer unsere Gesundheit spielen. Die meisten Menschen essen deutlich zu wenig davon — empfohlen werden mindestens 30g pro Tag.

Vorteile von Ballaststoffen:
- Foerdern eine gesunde Verdauung
- Helfen bei der Blutzuckerkontrolle
- Senken den Cholesterinspiegel
- Saettigen laenger und helfen beim Gewichtsmanagement
- Fuettern die nuetzlichen Darmbakterien

Gute Ballaststoffquellen:
- Huelsenfruechte (Linsen, Bohnen, Kichererbsen)
- Vollkornprodukte (Haferflocken, Vollkornbrot)
- Gemuese (Brokkoli, Ruebli, Artischocken)
- Obst (Aepfel, Birnen, Beeren)
- Nuesse und Samen (Leinsamen, Chiasamen)

Tipp: Steigern Sie die Ballaststoffzufuhr langsam und trinken Sie ausreichend Wasser.`,
    category: 'Naehrstoffe',
    icon: '🌾',
  },
  {
    id: 'dash-diaet',
    title: 'DASH-Diaet gegen Bluthochdruck',
    summary: 'Die wissenschaftlich fundierte Ernaehrung zur Senkung des Blutdrucks.',
    content: `Die DASH-Diaet (Dietary Approaches to Stop Hypertension) wurde speziell zur Senkung des Blutdrucks entwickelt und ist eine der am besten erforschten Ernaehrungsformen.

Grundprinzipien:
- Natriumzufuhr reduzieren (max. 1500-2300 mg/Tag)
- Viel Kalium, Magnesium und Calcium
- Reich an Obst und Gemuese (8-10 Portionen/Tag)
- Vollkornprodukte bevorzugen
- Mageres Eiweiss (Geflügel, Fisch, Huelsenfruechte)
- Fettarme Milchprodukte
- Nuesse und Samen in Massen
- Wenig Zucker und Suessspeisen

Studien zeigen, dass die DASH-Diaet den systolischen Blutdruck um 8-14 mmHg senken kann — vergleichbar mit einem Blutdruckmedikament.

Wichtig: Sprechen Sie Ernaehrungsaenderungen bei bestehendem Bluthochdruck immer mit Ihrem Arzt ab.`,
    category: 'Gesundheit',
    icon: '❤️',
  },
  {
    id: 'eisen-ernaehrung',
    title: 'Eisen: So beugen Sie Eisenmangel vor',
    summary: 'Wie Sie Ihren Eisenbedarf ueber die Ernaehrung decken und die Aufnahme verbessern.',
    content: `Eisen ist ein lebenswichtiges Spurenelement, das fuer den Sauerstofftransport im Blut unverzichtbar ist. Eisenmangel ist weltweit eine der haeufigsten Naehrstoffmaengel.

Gute Eisenquellen:
- Haem-Eisen (tierisch, besser aufnehmbar): rotes Fleisch, Leber, Muscheln
- Nicht-Haem-Eisen (pflanzlich): Linsen, Kichererbsen, Spinat, Tofu, Kuerbiskerne, Haferflocken

Tipps zur besseren Eisenaufnahme:
- Vitamin C verbessert die Aufnahme: Paprika, Zitrusfrüchte, Kiwi
- Kaffee und Tee hemmen die Aufnahme — Abstand zu Mahlzeiten halten
- Calcium hemmt die Aufnahme — Milchprodukte nicht gleichzeitig essen
- Eingeweichte Huelsenfruechte und Vollkornprodukte sind besser verfuegbar

Risikogruppen:
- Frauen im gebaerfaehigen Alter
- Schwangere
- Veganer und Vegetarier
- Sportler

Tipp: Lassen Sie Ihre Eisenwerte regelmaessig beim Arzt ueberpruefen.`,
    category: 'Naehrstoffe',
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
          Fundiertes Ernaehrungswissen — einfach erklaert. Verstehe die Zusammenhaenge zwischen dem, was du isst, und deiner Gesundheit.
        </p>
      </div>

      {/* Disclaimer */}
      <div className="bg-accent/10 border border-accent/30 rounded-xl p-4 mb-8">
        <p className="text-xs text-charcoal-light text-center">
          Diese Informationen dienen der allgemeinen Aufklaerung und ersetzen keine aerztliche Beratung.
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
                <span className="text-3xl shrink-0">{article.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                      {article.category}
                    </span>
                  </div>
                  <h2 className="font-heading text-lg text-charcoal mb-1">{article.title}</h2>
                  <p className="text-charcoal-light text-sm leading-relaxed">{article.summary}</p>
                </div>
                <span className={`text-charcoal-light text-lg transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                  &#9660;
                </span>
              </button>
              {isExpanded && (
                <div className="px-6 pb-6 pt-2 border-t border-sage-dark">
                  <div className="prose prose-sm max-w-none">
                    {article.content.split('\n\n').map((paragraph, i) => {
                      if (paragraph.includes(':\n') || paragraph.endsWith(':')) {
                        const [title, ...items] = paragraph.split('\n');
                        return (
                          <div key={i} className="mb-4">
                            <p className="font-semibold text-charcoal mb-2">{title}</p>
                            <ul className="space-y-1">
                              {items.filter(Boolean).map((item, j) => (
                                <li key={j} className="text-sm text-charcoal-light flex items-start gap-2">
                                  <span className="text-primary mt-0.5 shrink-0">&#8226;</span>
                                  {item.replace(/^- /, '')}
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      }
                      return <p key={i} className="text-sm text-charcoal-light leading-relaxed mb-3">{paragraph}</p>;
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
