'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { SkeletonCard } from '@/components/ui/SkeletonLoader';
import BackButton from '@/components/BackButton';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface Condition {
  id: string;
  name: string;
  description: string;
  icon: string;
  tags: string[];
}

export default function ConditionsPage() {
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/conditions`)
      .then(r => r.json())
      .then(d => setConditions(d.conditions || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <BackButton />
      <div className="mb-8 text-center">
        <h1 className="font-heading text-4xl text-charcoal mb-3">Gesundheitsthemen</h1>
        <p className="text-charcoal-light max-w-xl mx-auto">
          Waehle ein Gesundheitsthema, um zu erfahren, welche Ernaehrung helfen kann
          und welche Rezepte dazu passen.
        </p>
      </div>

      {/* Disclaimer */}
      <div className="bg-accent/10 border border-accent/30 rounded-xl p-4 mb-8 max-w-2xl mx-auto">
        <p className="text-xs text-charcoal-light text-center">
          Diese App ersetzt keine aerztliche Beratung. Bei gesundheitlichen Beschwerden wenden Sie sich bitte an Ihren Arzt oder Ihre Aerztin.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : conditions.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🩺</div>
          <h3 className="font-heading text-xl text-charcoal mb-2">Noch keine Gesundheitsthemen verfuegbar</h3>
          <p className="text-charcoal-light text-sm">Daten werden geladen...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {conditions.map(c => (
            <Link key={c.id} href={`/conditions/detail?id=${c.id}`} className="group block">
              <Card className="h-full text-center py-8 px-4 group-hover:shadow-card-hover group-hover:border-primary/20 border border-transparent transition-all">
                <div className="text-5xl mb-4">{c.icon}</div>
                <h3 className="font-heading text-lg font-semibold text-charcoal mb-2">{c.name}</h3>
                <p className="text-charcoal-light text-sm leading-relaxed line-clamp-3">{c.description}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
