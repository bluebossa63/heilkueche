'use client';
import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AvatarUpload } from '@/components/AvatarUpload';
import { RecipeCard } from '@/components/RecipeCard';
import { api } from '@/lib/api';
import BackButton from '@/components/BackButton';

const DIETARY_OPTIONS = ['vegan', 'vegetarian', 'gluten-free', 'dairy-free', 'nut-free', 'low-carb', 'high-protein'];
const DIETARY_LABELS: Record<string, string> = {
  'vegan': 'vegan', 'vegetarian': 'vegetarisch', 'gluten-free': 'glutenfrei',
  'dairy-free': 'laktosefrei', 'nut-free': 'nussfrei', 'low-carb': 'kohlenhydratarm', 'high-protein': 'proteinreich',
};

const HEALTH_CONDITIONS = [
  { id: 'bluthochdruck', label: 'Bluthochdruck', icon: '❤️' },
  { id: 'diabetes-typ-2', label: 'Diabetes Typ 2', icon: '🩸' },
  { id: 'hohes-cholesterin', label: 'Hohes Cholesterin', icon: '🫀' },
  { id: 'verdauungsbeschwerden', label: 'Verdauungsbeschwerden', icon: '🫁' },
  { id: 'entzuendungen-arthrose', label: 'Entzündungen / Arthrose', icon: '🦴' },
  { id: 'eisenmangel', label: 'Eisenmangel', icon: '🔴' },
  { id: 'uebergewicht', label: 'Übergewicht', icon: '⚖️' },
  { id: 'migraene', label: 'Migräne', icon: '🧠' },
];

const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Wenig aktiv (Büroarbeit)' },
  { value: 'light', label: 'Leicht aktiv (1-2x Sport/Woche)' },
  { value: 'moderate', label: 'Mässig aktiv (3-5x Sport/Woche)' },
  { value: 'active', label: 'Sehr aktiv (täglicher Sport)' },
  { value: 'very_active', label: 'Extrem aktiv (Leistungssport)' },
];

function calculateBMI(heightCm: number, weightKg: number): number {
  if (!heightCm || !weightKg) return 0;
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

function getBMICategory(bmi: number): { label: string; color: string } {
  if (bmi === 0) return { label: '', color: '' };
  if (bmi < 18.5) return { label: 'Untergewicht', color: 'text-secondary' };
  if (bmi < 25) return { label: 'Normalgewicht', color: 'text-primary' };
  if (bmi < 30) return { label: 'Übergewicht', color: 'text-accent-dark' };
  return { label: 'Adipositas', color: 'text-red-500' };
}

function calculateDailyCalories(
  weightKg: number, heightCm: number, birthYear: number, activityLevel: string, gender: string
): number {
  if (!weightKg || !heightCm || !birthYear) return 0;
  const age = new Date().getFullYear() - birthYear;
  // Mifflin-St Jeor
  const bmr = gender === 'female'
    ? 10 * weightKg + 6.25 * heightCm - 5 * age - 161
    : 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  const factors: Record<string, number> = {
    sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9,
  };
  return Math.round(bmr * (factors[activityLevel] || 1.375));
}

export default function ProfilePage() {
  return <ProtectedRoute><Profile /></ProtectedRoute>;
}

function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [savedRecipes, setSavedRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Form state
  const [displayName, setDisplayName] = useState('');
  const [dietary, setDietary] = useState<string[]>([]);
  const [healthConditions, setHealthConditions] = useState<string[]>([]);
  const [birthYear, setBirthYear] = useState<number | ''>('');
  const [heightCm, setHeightCm] = useState<number | ''>('');
  const [weightKg, setWeightKg] = useState<number | ''>('');
  const [activityLevel, setActivityLevel] = useState('light');
  const [gender, setGender] = useState('');

  useEffect(() => {
    api.users.me().then(d => {
      const u = d.user;
      setProfile(u);
      setDisplayName(u.displayName || '');
      setDietary(u.dietaryPreferences || []);
      setHealthConditions(u.healthConditions || []);
      setBirthYear(u.birthYear || '');
      setHeightCm(u.heightCm || '');
      setWeightKg(u.weightKg || '');
      setActivityLevel(u.activityLevel || 'light');
      setGender(u.gender || '');
      const ids: string[] = u.savedRecipeIds || [];
      Promise.all(ids.map((id: string) => api.recipes.get(id).then(r => r.recipe).catch(() => null)))
        .then(results => setSavedRecipes(results.filter(Boolean)));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const bmi = calculateBMI(Number(heightCm) || 0, Number(weightKg) || 0);
  const bmiInfo = getBMICategory(bmi);
  const dailyCal = calculateDailyCalories(
    Number(weightKg) || 0, Number(heightCm) || 0, Number(birthYear) || 0, activityLevel, gender
  );

  function toggleDietary(pref: string) {
    setDietary(prev => prev.includes(pref) ? prev.filter(p => p !== pref) : [...prev, pref]);
  }

  function toggleCondition(id: string) {
    setHealthConditions(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const data: Record<string, any> = {
        displayName, dietaryPreferences: dietary, healthConditions, activityLevel, gender,
      };
      if (birthYear) data.birthYear = Number(birthYear);
      if (heightCm) data.heightCm = Number(heightCm);
      if (weightKg) data.weightKg = Number(weightKg);

      const { user } = await api.users.update(data);
      setProfile(user);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally { setSaving(false); }
  }

  async function handleAvatarUploaded(url: string) {
    await api.users.update({ avatarUrl: url });
    setProfile((p: any) => ({ ...p, avatarUrl: url }));
  }

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-center text-charcoal-light">Profil wird geladen...</div>
  );

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <BackButton />
      <h1 className="font-heading text-3xl text-charcoal mb-8">Mein Profil</h1>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Avatar & Name */}
        <div className="card p-6">
          <div className="flex items-center gap-6 mb-6">
            <AvatarUpload current={profile?.avatarUrl} onUploaded={handleAvatarUploaded} />
            <div>
              <p className="font-semibold text-charcoal">{profile?.displayName || 'Anonym'}</p>
              <p className="text-sm text-charcoal-light">{profile?.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1">Anzeigename</label>
              <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
                className="input-field" placeholder="Dein Name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1">Geschlecht</label>
              <select value={gender} onChange={e => setGender(e.target.value)} className="input-field">
                <option value="">-- wählen --</option>
                <option value="female">Weiblich</option>
                <option value="male">Männlich</option>
                <option value="other">Divers</option>
              </select>
            </div>
          </div>
        </div>

        {/* Health Conditions */}
        <div className="card p-6">
          <h2 className="font-heading text-xl text-charcoal mb-2">Meine Gesundheitsthemen</h2>
          <p className="text-sm text-charcoal-light mb-4">
            Wähle deine Gesundheitsthemen, um personalisierte Rezeptempfehlungen zu erhalten.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {HEALTH_CONDITIONS.map(c => (
              <button key={c.id} type="button" onClick={() => toggleCondition(c.id)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all text-center ${
                  healthConditions.includes(c.id)
                    ? 'bg-primary/10 border-primary text-charcoal ring-2 ring-primary/30'
                    : 'bg-white border-charcoal-light/30 text-charcoal-light hover:border-primary/50'
                }`}
              >
                <span className="text-2xl">{c.icon}</span>
                <span className="text-xs font-medium leading-tight">{c.label}</span>
              </button>
            ))}
          </div>
          <div className="bg-accent/10 border border-accent/30 rounded-xl p-3 mt-4">
            <p className="text-xs text-charcoal-light">
              Diese App ersetzt keine ärztliche Beratung. Besprechen Sie Ernährungsumstellungen mit Ihrem Arzt.
            </p>
          </div>
        </div>

        {/* Body & Health */}
        <div className="card p-6">
          <h2 className="font-heading text-xl text-charcoal mb-4">Körper &amp; Gesundheit</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1">Geburtsjahr</label>
              <input type="number" value={birthYear} onChange={e => setBirthYear(e.target.value ? Number(e.target.value) : '')}
                className="input-field" placeholder="z.B. 1985" min="1930" max="2020" />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1">Grösse (cm)</label>
              <input type="number" value={heightCm} onChange={e => setHeightCm(e.target.value ? Number(e.target.value) : '')}
                className="input-field" placeholder="z.B. 172" min="100" max="250" />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1">Gewicht (kg)</label>
              <input type="number" value={weightKg} onChange={e => setWeightKg(e.target.value ? Number(e.target.value) : '')}
                className="input-field" placeholder="z.B. 75" min="30" max="300" step="0.1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1">Aktivitätslevel</label>
              <select value={activityLevel} onChange={e => setActivityLevel(e.target.value)} className="input-field">
                {ACTIVITY_LEVELS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
            </div>
          </div>

          {/* BMI & Daily Calories */}
          {(bmi > 0 || dailyCal > 0) && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              {bmi > 0 && (
                <div className="bg-sage rounded-xl p-4 text-center">
                  <p className="text-xs text-charcoal-light mb-1">BMI</p>
                  <p className="text-2xl font-bold text-primary">{bmi}</p>
                  <p className={`text-xs font-medium mt-1 ${bmiInfo.color}`}>{bmiInfo.label}</p>
                </div>
              )}
              {dailyCal > 0 && (
                <div className="bg-sage rounded-xl p-4 text-center">
                  <p className="text-xs text-charcoal-light mb-1">Täglicher Kalorienbedarf</p>
                  <p className="text-2xl font-bold text-primary">{dailyCal}</p>
                  <p className="text-xs text-charcoal-light mt-1">kcal / Tag</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dietary Preferences */}
        <div className="card p-6">
          <h2 className="font-heading text-xl text-charcoal mb-4">Ernährungsweise</h2>
          <div className="flex flex-wrap gap-2">
            {DIETARY_OPTIONS.map(pref => (
              <button key={pref} type="button" onClick={() => toggleDietary(pref)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  dietary.includes(pref)
                    ? 'bg-primary border-primary text-white'
                    : 'bg-white border-charcoal-light text-charcoal hover:border-primary'
                }`}
              >
                {DIETARY_LABELS[pref] ?? pref}
              </button>
            ))}
          </div>
        </div>

        {/* Save */}
        <button type="submit" disabled={saving} className="btn-primary w-full py-3">
          {saving ? 'Speichern...' : saved ? 'Gespeichert!' : 'Profil speichern'}
        </button>
      </form>

      {/* Saved recipes */}
      <section className="mt-10">
        <h2 className="font-heading text-2xl text-charcoal mb-4">Gespeicherte Rezepte ({savedRecipes.length})</h2>
        {savedRecipes.length === 0 ? (
          <div className="card p-8 text-center text-charcoal-light">
            <p className="text-4xl mb-3">🔖</p>
            <p>Noch keine gespeicherten Rezepte. Markiere ein Rezept mit einem Herz, um es hier zu speichern.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {savedRecipes.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} />)}
          </div>
        )}
      </section>
    </main>
  );
}
