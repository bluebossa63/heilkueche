'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { RecipeCard } from '@/components/RecipeCard';
import { SkeletonCard } from '@/components/ui/SkeletonLoader';
import BackButton from '@/components/BackButton';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface Condition {
  id: string;
  name: string;
  description: string;
  whatToEat: string[];
  whatToAvoid: string[];
  tips: string[];
  icon: string;
  tags: string[];
}

export default function ConditionDetailPage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto px-4 py-8 text-charcoal-light">Laden...</div>}>
      <ConditionDetail />
    </Suspense>
  );
}

function ConditionDetail() {
  const params = useSearchParams();
  const id = params.get('id');
  const [condition, setCondition] = useState<Condition | null>(null);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`${API_BASE}/conditions/${id}`)
      .then(r => r.json())
      .then(d => {
        setCondition(d.condition);
        setRecipes(d.recipes || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-sage-dark rounded-lg w-48" />
          <div className="h-32 bg-sage-dark rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!condition) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">🩺</div>
        <h2 className="font-heading text-2xl text-charcoal mb-2">Gesundheitsthema nicht gefunden</h2>
        <Link href="/conditions" className="text-primary hover:underline">Zurueck zur Uebersicht</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <BackButton />

      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">{condition.icon}</div>
        <h1 className="font-heading text-4xl text-charcoal mb-3">{condition.name}</h1>
        <p className="text-charcoal-light max-w-xl mx-auto leading-relaxed">{condition.description}</p>
      </div>

      {/* Disclaimer */}
      <div className="bg-accent/10 border border-accent/30 rounded-xl p-4 mb-8">
        <p className="text-xs text-charcoal-light text-center">
          Diese App ersetzt keine aerztliche Beratung. Besprechen Sie Ernaehrungsumstellungen immer mit Ihrem Arzt.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* What to eat */}
        <Card className="p-6">
          <h2 className="font-heading text-xl text-primary mb-4 flex items-center gap-2">
            <span className="text-2xl">&#10003;</span> Das tut gut
          </h2>
          <ul className="space-y-2">
            {condition.whatToEat.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-charcoal leading-relaxed">
                <span className="text-primary mt-0.5 shrink-0">&#8226;</span>
                {item}
              </li>
            ))}
          </ul>
        </Card>

        {/* What to avoid */}
        <Card className="p-6">
          <h2 className="font-heading text-xl text-secondary mb-4 flex items-center gap-2">
            <span className="text-2xl">&#10007;</span> Besser meiden
          </h2>
          <ul className="space-y-2">
            {condition.whatToAvoid.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-charcoal leading-relaxed">
                <span className="text-secondary mt-0.5 shrink-0">&#8226;</span>
                {item}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Tips */}
      {condition.tips.length > 0 && (
        <Card className="p-6 mb-8">
          <h2 className="font-heading text-xl text-charcoal mb-4">Praktische Tipps</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {condition.tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3 bg-sage rounded-xl p-3">
                <span className="text-accent text-lg shrink-0">&#9733;</span>
                <p className="text-sm text-charcoal leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Matching recipes */}
      <section>
        <h2 className="font-heading text-2xl text-charcoal mb-4">
          Passende Rezepte ({recipes.length})
        </h2>
        {recipes.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-4xl mb-3">🥗</div>
            <p className="text-charcoal-light">Noch keine passenden Rezepte vorhanden.</p>
            <Link href="/recipes" className="text-primary hover:underline text-sm mt-2 inline-block">
              Alle Rezepte ansehen
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {recipes.map((r: any) => (
              <RecipeCard key={r.id} recipe={r} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
