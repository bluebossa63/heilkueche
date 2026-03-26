'use client';

const CATEGORIES = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'smoothie'] as const;
const CATEGORY_LABELS: Record<string, string> = {
  breakfast: 'Fruehstueck', lunch: 'Mittagessen', dinner: 'Abendessen',
  snack: 'Snack', dessert: 'Dessert', smoothie: 'Smoothie',
};

const TAGS = [
  { id: 'vegan', label: 'Vegan' },
  { id: 'vegetarisch', label: 'Vegetarisch' },
  { id: 'proteinreich', label: 'Proteinreich' },
  { id: 'schnell', label: 'Schnell' },
  { id: 'ballaststoffreich', label: 'Ballaststoffreich' },
  { id: 'lowcarb', label: 'Low Carb' },
  { id: 'glutenfrei', label: 'Glutenfrei' },
  { id: 'schweiz', label: 'Schweiz' },
];

const HEALTH_TAGS = [
  { id: 'herzfreundlich', label: '❤️ Herzfreundlich' },
  { id: 'blutzuckerfreundlich', label: '🩸 Blutzuckerfreundlich' },
  { id: 'entzuendungshemmend', label: '🦴 Entzuendungshemmend' },
  { id: 'eisenreich', label: '🔴 Eisenreich' },
  { id: 'cholesterinsenkend', label: '🫀 Cholesterinsenkend' },
  { id: 'verdauungsfoerdernd', label: '🫁 Verdauungsfoerdernd' },
  { id: 'kalorienarm', label: '⚖️ Kalorienarm' },
  { id: 'migraenefreundlich', label: '🧠 Migraenefreundlich' },
];

export interface Filters {
  category: string;
  tag: string;
  healthTag: string;
  maxCalories: number;
  maxPrepTime: number;
  maxCost: number;
}

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
}

export function FilterPanel({ filters, onChange }: Props) {
  const set = (key: keyof Filters, value: any) => onChange({ ...filters, [key]: value });

  return (
    <div className="bg-white rounded-2xl shadow-card p-5 flex flex-col gap-5">
      {/* Category chips */}
      <div>
        <p className="text-xs font-semibold text-charcoal-light uppercase tracking-wide mb-2">Kategorie</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => set('category', '')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${!filters.category ? 'bg-primary text-white' : 'bg-sage-dark text-charcoal-light hover:bg-primary/10'}`}
          >
            Alle
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => set('category', filters.category === cat ? '' : cat)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filters.category === cat ? 'bg-primary text-white' : 'bg-sage-dark text-charcoal-light hover:bg-primary/10'}`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Health tag chips */}
      <div>
        <p className="text-xs font-semibold text-charcoal-light uppercase tracking-wide mb-2">Gesundheit</p>
        <div className="flex flex-wrap gap-1.5">
          {HEALTH_TAGS.map(tag => (
            <button
              key={tag.id}
              onClick={() => set('healthTag', filters.healthTag === tag.id ? '' : tag.id)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${filters.healthTag === tag.id ? 'bg-primary text-white' : 'bg-sage-dark text-charcoal-light hover:bg-primary/10'}`}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      {/* General tag chips */}
      <div>
        <p className="text-xs font-semibold text-charcoal-light uppercase tracking-wide mb-2">Eigenschaft</p>
        <div className="flex flex-wrap gap-1.5">
          {TAGS.map(tag => (
            <button
              key={tag.id}
              onClick={() => set('tag', filters.tag === tag.id ? '' : tag.id)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${filters.tag === tag.id ? 'bg-secondary text-white' : 'bg-sage-dark text-charcoal-light hover:bg-secondary/10'}`}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sliders */}
      <div>
        <p className="text-xs font-semibold text-charcoal-light uppercase tracking-wide mb-2">
          Max. Kalorien <span className="text-primary">{filters.maxCalories === 1500 ? 'Beliebig' : `${filters.maxCalories} kcal`}</span>
        </p>
        <input type="range" min={100} max={1500} step={50} value={filters.maxCalories}
          onChange={e => set('maxCalories', Number(e.target.value))}
          className="w-full accent-primary" />
      </div>

      <div>
        <p className="text-xs font-semibold text-charcoal-light uppercase tracking-wide mb-2">
          Max. Vorbereitungszeit <span className="text-primary">{filters.maxPrepTime === 120 ? 'Beliebig' : `${filters.maxPrepTime} min`}</span>
        </p>
        <input type="range" min={5} max={120} step={5} value={filters.maxPrepTime}
          onChange={e => set('maxPrepTime', Number(e.target.value))}
          className="w-full accent-primary" />
      </div>

      <div>
        <p className="text-xs font-semibold text-charcoal-light uppercase tracking-wide mb-2">
          Max. Kosten <span className="text-primary">{filters.maxCost === 30 ? 'Beliebig' : `CHF ${filters.maxCost}`}</span>
        </p>
        <input type="range" min={1} max={30} step={1} value={filters.maxCost}
          onChange={e => set('maxCost', Number(e.target.value))}
          className="w-full accent-primary" />
      </div>

      <button
        onClick={() => onChange({ category: '', tag: '', healthTag: '', maxCalories: 1500, maxPrepTime: 120, maxCost: 30 })}
        className="text-xs text-charcoal-light hover:text-primary transition-colors text-left"
      >
        Filter zuruecksetzen
      </button>
    </div>
  );
}
