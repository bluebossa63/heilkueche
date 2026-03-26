/**
 * Seed script for Heilkueche Cosmos DB
 * Creates database, containers, health conditions, wissen articles, and recipes.
 *
 * Usage: node seed-heilkueche.js
 */

// Load .env manually
const fs = require('fs');
const path = require('path');
// Try multiple locations for .env
const envPaths = [
  path.join(__dirname, '.env'),
  path.join(__dirname, '..', 'api', '.env'),
];
const envPath = envPaths.find(p => fs.existsSync(p));
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const key = trimmed.substring(0, eqIdx).trim();
      const val = trimmed.substring(eqIdx + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  }
}
const { CosmosClient } = require('@azure/cosmos');
const { v4: uuidv4 } = require('uuid');

const COSMOS_ENDPOINT = process.env.COSMOS_ENDPOINT;
const COSMOS_KEY = process.env.COSMOS_KEY;
const DB_NAME = process.env.COSMOS_DB_NAME || 'heilkueche';

const client = new CosmosClient({ endpoint: COSMOS_ENDPOINT, key: COSMOS_KEY });

async function createDatabaseAndContainers() {
  console.log(`Creating database: ${DB_NAME}...`);
  const { database } = await client.databases.createIfNotExists({ id: DB_NAME });

  const containers = [
    { id: 'recipes', partitionKey: '/category' },
    { id: 'meal-plans', partitionKey: '/userId' },
    { id: 'users', partitionKey: '/id' },
    { id: 'comments', partitionKey: '/recipeId' },
    { id: 'shopping-lists', partitionKey: '/userId' },
    { id: 'daily-logs', partitionKey: '/userId' },
    { id: 'conditions', partitionKey: '/id' },
    { id: 'wissen', partitionKey: '/id' },
  ];

  for (const c of containers) {
    console.log(`  Creating container: ${c.id}...`);
    await database.containers.createIfNotExists({
      id: c.id,
      partitionKey: { paths: [c.partitionKey] },
    });
  }

  return database;
}

const CONDITIONS = [
  {
    id: 'bluthochdruck',
    name: 'Bluthochdruck',
    description: 'Bluthochdruck (Hypertonie) betrifft viele Menschen. Die richtige Ernaehrung kann einen grossen Beitrag zur Senkung des Blutdrucks leisten. Die DASH-Diaet ist wissenschaftlich belegt und setzt auf salzarme, kaliumreiche Kost.',
    whatToEat: [
      'Viel frisches Gemuese und Obst (kaliumreich)',
      'Vollkornprodukte (Haferflocken, Vollkornbrot, brauner Reis)',
      'Huelsenfruechte (Linsen, Kichererbsen, Bohnen)',
      'Fettarme Milchprodukte (Joghurt, Quark)',
      'Fetter Fisch (Lachs, Makrele) — reich an Omega-3',
      'Nuesse und Samen (ungesalzen)',
      'Kaliumreiche Lebensmittel: Bananen, Kartoffeln, Spinat',
      'Knoblauch, Zwiebeln, Kurkuma',
    ],
    whatToAvoid: [
      'Salz und stark gesalzene Lebensmittel (max. 5g/Tag)',
      'Verarbeitetes Fleisch (Wurst, Schinken, Speck)',
      'Fertiggerichte und Fast Food',
      'Salzige Snacks (Chips, Salzgebaeck)',
      'Uebermassiger Alkoholkonsum',
      'Suesse Getraenke und Limonaden',
      'Koffein in grossen Mengen',
    ],
    tips: [
      'Kochen Sie mit Kraeutern und Gewuerzen statt Salz',
      'Lesen Sie Naehrwertetiketten — verstecktes Salz findet sich ueberall',
      'Bewegen Sie sich regelmaessig (mind. 30 Min./Tag)',
      'Messen Sie Ihren Blutdruck regelmaessig',
      'Reduzieren Sie Stress durch Entspannungsuebungen',
      'Halten Sie ein gesundes Koerpergewicht',
    ],
    icon: '❤️',
    tags: ['herzfreundlich'],
  },
  {
    id: 'diabetes-typ-2',
    name: 'Diabetes Typ 2',
    description: 'Bei Diabetes Typ 2 ist die Kontrolle des Blutzuckerspiegels zentral. Eine blutzuckerfreundliche Ernaehrung mit niedrigem glykaemischem Index hilft, den Blutzucker stabil zu halten und Komplikationen vorzubeugen.',
    whatToEat: [
      'Gemuese in grossen Mengen (Brokkoli, Spinat, Zucchetti)',
      'Vollkornprodukte statt Weissmehl',
      'Huelsenfruechte (langsam verdauliche Kohlenhydrate)',
      'Beeren und Obst mit niedrigem GI (Aepfel, Birnen)',
      'Mageres Eiweiss (Poulet, Fisch, Tofu)',
      'Gesunde Fette (Olivenoel, Avocado, Nuesse)',
      'Zimt — kann den Blutzucker positiv beeinflussen',
      'Ballaststoffreiche Lebensmittel',
    ],
    whatToAvoid: [
      'Zucker und suesse Getraenke',
      'Weissmehlprodukte (Weissbrot, Pasta aus Weissmehl)',
      'Stark verarbeitete Lebensmittel',
      'Suessigkeiten und Desserts in grossen Mengen',
      'Fruchtsaefte (hoher Zuckergehalt)',
      'Alkohol (beeinflusst den Blutzucker)',
      'Fettreiche Fertigprodukte',
    ],
    tips: [
      'Essen Sie regelmaessig und vermeiden Sie lange Nuechternphasen',
      'Kombinieren Sie Kohlenhydrate immer mit Eiweiss oder Fett',
      'Achten Sie auf den glykaemischen Index der Lebensmittel',
      'Bewegen Sie sich nach den Mahlzeiten (z.B. 15 Min. Spaziergang)',
      'Messen Sie regelmaessig Ihren Blutzucker',
      'Planen Sie Ihre Mahlzeiten im Voraus',
    ],
    icon: '🩸',
    tags: ['blutzuckerfreundlich'],
  },
  {
    id: 'hohes-cholesterin',
    name: 'Hohes Cholesterin',
    description: 'Erhoehte Cholesterinwerte sind ein Risikofaktor fuer Herz-Kreislauf-Erkrankungen. Durch die richtige Ernaehrung mit herzgesunden Fetten und Ballaststoffen laesst sich der Cholesterinspiegel positiv beeinflussen.',
    whatToEat: [
      'Haferflocken und Haferkleie (Beta-Glucan senkt Cholesterin)',
      'Huelsenfruechte (Bohnen, Linsen, Kichererbsen)',
      'Nuesse (Walnuesse, Mandeln — in Massen)',
      'Fetter Fisch (Lachs, Hering, Makrele)',
      'Olivenoel und Rapsoel',
      'Avocados',
      'Soja und Sojaprodukte',
      'Obst und Gemuese (besonders Aepfel, Auberginen, Okra)',
    ],
    whatToAvoid: [
      'Gesaettigte Fette (fettes Fleisch, Butter, Sahne)',
      'Transfette (Margarine, Frittiertes, Backwaren)',
      'Verarbeitetes Fleisch (Wurst, Salami)',
      'Vollfett-Milchprodukte in grossen Mengen',
      'Fast Food und frittierte Speisen',
      'Kokosoel und Palmoel (reich an gesaettigten Fetten)',
      'Eigelb in grossen Mengen (massvoll OK)',
    ],
    tips: [
      'Ersetzen Sie Butter durch Olivenoel',
      'Essen Sie taeglich eine Handvoll Nuesse',
      'Starten Sie den Tag mit Haferflocken',
      'Kochen Sie oefter mit Huelsenfruechten',
      'Bewegen Sie sich regelmaessig',
      'Lassen Sie Ihre Cholesterinwerte jaehrlich kontrollieren',
    ],
    icon: '🫀',
    tags: ['cholesterinsenkend'],
  },
  {
    id: 'verdauungsbeschwerden',
    name: 'Verdauungsbeschwerden',
    description: 'Verdauungsprobleme wie Blaehungen, Verstopfung oder Reizdarm koennen die Lebensqualitaet stark beeintraechtigen. Eine ballaststoffreiche, probiotische Ernaehrung unterstuetzt die Darmgesundheit.',
    whatToEat: [
      'Ballaststoffreiche Lebensmittel (langsam steigern)',
      'Probiotische Lebensmittel (Joghurt, Kefir, Sauerkraut)',
      'Leicht verdauliches Gemuese (Karotten, Zucchetti, Kuerbis)',
      'Vollkornprodukte (in Massen)',
      'Ingwer und Pfefferminztee',
      'Fenchel und Anis',
      'Leinsamen und Chiasamen (mit viel Wasser)',
      'Fermentierte Lebensmittel (Kimchi, Miso)',
    ],
    whatToAvoid: [
      'Stark blaehende Lebensmittel (Kohl, Zwiebeln — bei Empfindlichkeit)',
      'Stark fetthaltige Speisen',
      'Kohlensaeure und suesse Getraenke',
      'Stark verarbeitete Lebensmittel',
      'Alkohol und Koffein in grossen Mengen',
      'Zu grosse Mahlzeiten',
      'Hastiges Essen',
    ],
    tips: [
      'Essen Sie langsam und kauen Sie gruendlich',
      'Trinken Sie ausreichend Wasser (min. 1.5 Liter)',
      'Fuehren Sie ein Ernaehrungstagebuch bei Beschwerden',
      'Bewegen Sie sich regelmaessig — foerdert die Verdauung',
      'Essen Sie zu regelmaessigen Zeiten',
      'Steigern Sie Ballaststoffe langsam, um Blaehungen zu vermeiden',
    ],
    icon: '🫁',
    tags: ['verdauungsfoerdernd'],
  },
  {
    id: 'entzuendungen-arthrose',
    name: 'Entzuendungen & Arthrose',
    description: 'Chronische Entzuendungen spielen bei Arthrose und vielen anderen Erkrankungen eine zentrale Rolle. Eine entzuendungshemmende Ernaehrung mit Omega-3-Fettsaeuren und Antioxidantien kann Schmerzen lindern und Entzuendungen reduzieren.',
    whatToEat: [
      'Fetter Fisch (Lachs, Makrele, Sardinen) — Omega-3',
      'Kurkuma mit schwarzem Pfeffer (Curcumin)',
      'Ingwer (frisch oder als Tee)',
      'Beeren (Heidelbeeren, Kirschen, Brombeeren)',
      'Gruenes Blattgemuese (Spinat, Gruenkohl)',
      'Walnuesse und Leinsamen',
      'Olivenoel (extra vergine)',
      'Brokkoli und Blumenkohl',
    ],
    whatToAvoid: [
      'Zucker und Suessigkeiten (foerdern Entzuendungen)',
      'Stark verarbeitete Lebensmittel',
      'Transfette und frittierte Speisen',
      'Rotes Fleisch in grossen Mengen',
      'Verarbeitetes Fleisch (Wurst, Speck)',
      'Weissmehlprodukte',
      'Alkohol',
      'Omega-6-reiche Pflanzenoele (Sonnenblumenoel)',
    ],
    tips: [
      'Integrieren Sie taeglich Kurkuma in Ihre Ernaehrung',
      'Essen Sie 2-3x pro Woche fetten Fisch',
      'Ersetzen Sie Sonnenblumenoel durch Olivenoel oder Rapsoel',
      'Bewegen Sie sich trotz Schmerzen — schonende Bewegung hilft',
      'Achten Sie auf ein gesundes Koerpergewicht',
      'Probieren Sie goldene Milch (Kurkuma-Latte)',
    ],
    icon: '🦴',
    tags: ['entzuendungshemmend'],
  },
  {
    id: 'eisenmangel',
    name: 'Eisenmangel',
    description: 'Eisenmangel ist der weltweit haeufigste Naehrstoffmangel und fuehrt zu Muedigkeit, Konzentrationsstoerungen und Blaesse. Ueber die Ernaehrung und kluge Kombinationen laesst sich die Eisenaufnahme deutlich verbessern.',
    whatToEat: [
      'Rotes Fleisch und Leber (beste Eisenquelle)',
      'Huelsenfruechte (Linsen, Kichererbsen, weisse Bohnen)',
      'Dunkelgruenes Blattgemuese (Spinat, Mangold)',
      'Kuerbiskerne und Sesam',
      'Haferflocken und Hirse',
      'Tofu und Tempeh',
      'Vitamin-C-reiche Lebensmittel zur besseren Aufnahme',
      'Randen (Rote Beete)',
    ],
    whatToAvoid: [
      'Kaffee und Tee direkt zu den Mahlzeiten',
      'Milchprodukte gleichzeitig mit eisenreichen Speisen',
      'Zu viele Vollkornprodukte auf einmal (Phytinsaeure)',
      'Cola und Phosphat-haltige Getraenke',
    ],
    tips: [
      'Kombinieren Sie eisenreiche Speisen immer mit Vitamin C (Paprika, Zitrone)',
      'Trinken Sie Kaffee/Tee erst 30-60 Min. nach dem Essen',
      'Weichen Sie Huelsenfruechte vor dem Kochen ein',
      'Kochen Sie in Gusseisen-Toepfen — erhoeht den Eisengehalt',
      'Lassen Sie Ihre Eisenwerte regelmaessig kontrollieren',
      'Bei starkem Mangel sprechen Sie mit Ihrem Arzt ueber Supplemente',
    ],
    icon: '🔴',
    tags: ['eisenreich'],
  },
  {
    id: 'uebergewicht',
    name: 'Uebergewicht',
    description: 'Ein gesundes Gewicht zu erreichen ist keine Frage von Crash-Diaeten, sondern von nachhaltigen Ernaehrungsgewohnheiten. Saettigende, naehrstoffreiche Lebensmittel helfen, ohne Hunger abzunehmen.',
    whatToEat: [
      'Viel Gemuese (kalorienarm, naehrstoffreich)',
      'Eiweissreiche Lebensmittel (saettigen laenger)',
      'Huelsenfruechte (Ballaststoffe + Eiweiss)',
      'Vollkornprodukte in Massen',
      'Mageres Fleisch, Fisch, Eier',
      'Nuesse in kleinen Mengen (saettigend)',
      'Beeren als suesse Alternative',
      'Wasser und ungesuessten Tee',
    ],
    whatToAvoid: [
      'Suesse Getraenke und Fruchtsaefte',
      'Stark verarbeitete Lebensmittel',
      'Grosse Portionen Kohlenhydrate',
      'Fast Food und Fertiggerichte',
      'Suessigkeiten und Snacks',
      'Alkohol (leere Kalorien)',
      'Essen aus Langeweile oder Stress',
    ],
    tips: [
      'Essen Sie bewusst und ohne Ablenkung',
      'Verwenden Sie kleinere Teller',
      'Planen Sie Ihre Mahlzeiten im Voraus',
      'Trinken Sie vor dem Essen ein Glas Wasser',
      'Bewegen Sie sich taeglich mindestens 30 Minuten',
      'Setzen Sie sich realistische Ziele (0.5-1 kg pro Woche)',
      'Verzichten Sie nicht auf ganze Lebensmittelgruppen',
    ],
    icon: '⚖️',
    tags: ['kalorienarm'],
  },
  {
    id: 'migraene',
    name: 'Migraene',
    description: 'Migraene kann durch bestimmte Lebensmittel ausgeloest oder verschlimmert werden. Eine triggerarme, magnesiumreiche Ernaehrung kann die Haeufigkeit und Staerke der Anfaelle reduzieren.',
    whatToEat: [
      'Magnesiumreiche Lebensmittel (Nuesse, Samen, Spinat)',
      'Frisches, unverarbeitetes Essen',
      'Vollkornprodukte',
      'Frisches Gemuese und Obst',
      'Ingwer (kann Uebelkeit bei Migraene lindern)',
      'Ausreichend Wasser (Dehydration ist ein Trigger)',
      'Regelmaessige Mahlzeiten (stabiler Blutzucker)',
      'Riboflavin-reiche Lebensmittel (Mandeln, Eier, Lachs)',
    ],
    whatToAvoid: [
      'Gereifter Kaese (Tyramin)',
      'Alkohol, besonders Rotwein',
      'Schokolade (bei manchen ein Trigger)',
      'Verarbeitetes Fleisch (Nitrate)',
      'Glutamat (MSG) in Fertiggerichten',
      'Aspartam und kuenstliche Suessungsmittel',
      'Zitrusfruechte (bei manchen ein Trigger)',
      'Koffein in grossen oder schwankenden Mengen',
    ],
    tips: [
      'Fuehren Sie ein Migraene-Tagebuch mit Ernaehrungsprotokoll',
      'Essen Sie regelmaessig — Mahlzeiten nicht auslassen',
      'Trinken Sie mindestens 2 Liter Wasser taeglich',
      'Schlafen Sie regelmaessig und ausreichend',
      'Identifizieren Sie Ihre persoenlichen Trigger-Lebensmittel',
      'Supplementieren Sie ggf. Magnesium (nach Ruecksprache mit dem Arzt)',
    ],
    icon: '🧠',
    tags: ['migraenefreundlich'],
  },
];

const RECIPES = [
  // herzfreundlich
  {
    title: 'Mediterraner Lachssalat',
    description: 'Herzhafter Salat mit gegrilltem Lachs, Oliven und Avocado — reich an Omega-3-Fettsaeuren.',
    category: 'lunch',
    tags: ['proteinreich', 'schnell'],
    healthTags: ['herzfreundlich', 'entzuendungshemmend', 'cholesterinsenkend'],
    prepTimeMinutes: 15,
    cookTimeMinutes: 10,
    servings: 2,
    ingredients: [
      { name: 'Lachsfilet', quantity: 300, unit: 'g', calories: 540, proteinG: 60, fatG: 33, carbsG: 0 },
      { name: 'Blattsalat gemischt', quantity: 150, unit: 'g', calories: 25, proteinG: 2, fatG: 0, carbsG: 4 },
      { name: 'Avocado', quantity: 1, unit: 'Stueck', calories: 240, proteinG: 3, fatG: 22, carbsG: 12 },
      { name: 'Cherrytomaten', quantity: 200, unit: 'g', calories: 36, proteinG: 2, fatG: 0, carbsG: 8 },
      { name: 'Oliven', quantity: 50, unit: 'g', calories: 75, proteinG: 1, fatG: 7, carbsG: 2 },
      { name: 'Olivenoel', quantity: 2, unit: 'EL', calories: 180, proteinG: 0, fatG: 20, carbsG: 0 },
      { name: 'Zitronensaft', quantity: 2, unit: 'EL', calories: 8, proteinG: 0, fatG: 0, carbsG: 3 },
    ],
    instructions: [
      'Lachs salzen und in einer Pfanne mit wenig Olivenoel 3-4 Min. pro Seite braten.',
      'Salat, Tomaten und Oliven auf Tellern anrichten.',
      'Avocado halbieren, entkernen und in Scheiben schneiden.',
      'Lachs in Stuecke brechen und ueber den Salat verteilen.',
      'Mit Olivenoel und Zitronensaft betraeufeln. Mit Pfeffer wuerzen.',
    ],
    estimatedCostEur: 12.50,
  },
  {
    title: 'Hafer-Bananen-Porridge',
    description: 'Cremiges Porridge mit Banane und Walnuessen — kaliumreich und herzgesund.',
    category: 'breakfast',
    tags: ['vegan', 'schnell', 'ballaststoffreich'],
    healthTags: ['herzfreundlich', 'cholesterinsenkend', 'verdauungsfoerdernd'],
    prepTimeMinutes: 5,
    cookTimeMinutes: 10,
    servings: 1,
    ingredients: [
      { name: 'Haferflocken', quantity: 60, unit: 'g', calories: 228, proteinG: 8, fatG: 4, carbsG: 40 },
      { name: 'Pflanzenmilch', quantity: 250, unit: 'ml', calories: 40, proteinG: 1, fatG: 2, carbsG: 3 },
      { name: 'Banane', quantity: 1, unit: 'Stueck', calories: 105, proteinG: 1, fatG: 0, carbsG: 27 },
      { name: 'Walnuesse', quantity: 15, unit: 'g', calories: 100, proteinG: 2, fatG: 10, carbsG: 2 },
      { name: 'Zimt', quantity: 1, unit: 'Prise', calories: 0, proteinG: 0, fatG: 0, carbsG: 0 },
    ],
    instructions: [
      'Haferflocken mit Pflanzenmilch in einem Topf aufkochen.',
      'Auf mittlerer Hitze 5-7 Min. koecheln lassen, regelmaessig umruehren.',
      'Banane in Scheiben schneiden.',
      'Porridge in eine Schuessel geben, mit Bananenscheiben, Walnuessen und Zimt toppen.',
    ],
    estimatedCostEur: 2.80,
  },
  // blutzuckerfreundlich
  {
    title: 'Linsen-Gemuese-Eintopf',
    description: 'Nahrhafter Eintopf mit roten Linsen und Saisongemuese — niedriger GI, reich an Ballaststoffen.',
    category: 'dinner',
    tags: ['vegan', 'mealprep', 'gueenstig'],
    healthTags: ['blutzuckerfreundlich', 'verdauungsfoerdernd', 'kalorienarm'],
    prepTimeMinutes: 10,
    cookTimeMinutes: 25,
    servings: 4,
    ingredients: [
      { name: 'Rote Linsen', quantity: 200, unit: 'g', calories: 680, proteinG: 48, fatG: 2, carbsG: 108 },
      { name: 'Karotten', quantity: 3, unit: 'Stueck', calories: 75, proteinG: 2, fatG: 0, carbsG: 18 },
      { name: 'Zucchetti', quantity: 1, unit: 'Stueck', calories: 30, proteinG: 2, fatG: 0, carbsG: 6 },
      { name: 'Zwiebel', quantity: 1, unit: 'Stueck', calories: 40, proteinG: 1, fatG: 0, carbsG: 9 },
      { name: 'Knoblauch', quantity: 2, unit: 'Zehen', calories: 8, proteinG: 0, fatG: 0, carbsG: 2 },
      { name: 'Gemusebruehe', quantity: 800, unit: 'ml', calories: 20, proteinG: 1, fatG: 0, carbsG: 4 },
      { name: 'Kurkuma', quantity: 1, unit: 'TL', calories: 8, proteinG: 0, fatG: 0, carbsG: 2 },
      { name: 'Kreuzkuemmel', quantity: 1, unit: 'TL', calories: 8, proteinG: 0, fatG: 0, carbsG: 1 },
    ],
    instructions: [
      'Zwiebel und Knoblauch hacken, in Olivenoel anschwitzen.',
      'Karotten und Zucchetti wuerfeln, dazugeben und 2 Min. anbraten.',
      'Linsen, Gemusebruehe und Gewuerze hinzufuegen.',
      '20-25 Min. koecheln lassen bis die Linsen weich sind.',
      'Mit Salz und Pfeffer abschmecken. Optional mit Zitronensaft verfeinern.',
    ],
    estimatedCostEur: 5.00,
  },
  {
    title: 'Poulet mit Brokkoli und Quinoa',
    description: 'Proteinreiches Gericht mit niedrigem GI — ideal fuer stabilen Blutzucker.',
    category: 'dinner',
    tags: ['proteinreich', 'glutenfrei'],
    healthTags: ['blutzuckerfreundlich', 'kalorienarm'],
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    servings: 2,
    ingredients: [
      { name: 'Pouletbrust', quantity: 300, unit: 'g', calories: 330, proteinG: 63, fatG: 7, carbsG: 0 },
      { name: 'Brokkoli', quantity: 300, unit: 'g', calories: 90, proteinG: 9, fatG: 1, carbsG: 12 },
      { name: 'Quinoa', quantity: 150, unit: 'g', calories: 555, proteinG: 20, fatG: 9, carbsG: 97 },
      { name: 'Olivenoel', quantity: 1, unit: 'EL', calories: 90, proteinG: 0, fatG: 10, carbsG: 0 },
      { name: 'Zitrone', quantity: 1, unit: 'Stueck', calories: 17, proteinG: 1, fatG: 0, carbsG: 5 },
    ],
    instructions: [
      'Quinoa nach Packungsanleitung kochen.',
      'Pouletbrust in Streifen schneiden, in Olivenoel anbraten.',
      'Brokkoli in Roeschen teilen, in Salzwasser 5 Min. daempfen.',
      'Alles zusammen anrichten, mit Zitronensaft betraeufeln.',
    ],
    estimatedCostEur: 8.50,
  },
  // cholesterinsenkend
  {
    title: 'Haferflocken-Bowl mit Beeren',
    description: 'Beta-Glucan aus Haferflocken senkt nachweislich den Cholesterinspiegel.',
    category: 'breakfast',
    tags: ['vegetarisch', 'schnell', 'ballaststoffreich'],
    healthTags: ['cholesterinsenkend', 'herzfreundlich', 'verdauungsfoerdernd'],
    prepTimeMinutes: 5,
    cookTimeMinutes: 5,
    servings: 1,
    ingredients: [
      { name: 'Haferflocken', quantity: 60, unit: 'g', calories: 228, proteinG: 8, fatG: 4, carbsG: 40 },
      { name: 'Milch fettarm', quantity: 200, unit: 'ml', calories: 90, proteinG: 7, fatG: 3, carbsG: 10 },
      { name: 'Heidelbeeren', quantity: 80, unit: 'g', calories: 46, proteinG: 1, fatG: 0, carbsG: 12 },
      { name: 'Mandeln', quantity: 15, unit: 'g', calories: 87, proteinG: 3, fatG: 7, carbsG: 3 },
      { name: 'Leinsamen', quantity: 10, unit: 'g', calories: 55, proteinG: 2, fatG: 4, carbsG: 3 },
    ],
    instructions: [
      'Haferflocken mit Milch aufkochen, 3-5 Min. koecheln lassen.',
      'In eine Schuessel geben.',
      'Mit Heidelbeeren, Mandeln und Leinsamen toppen.',
    ],
    estimatedCostEur: 3.20,
  },
  {
    title: 'Bohnen-Avocado-Wrap',
    description: 'Sattmacher-Wrap mit schwarzen Bohnen und Avocado — herzgesunde Fette und Ballaststoffe.',
    category: 'lunch',
    tags: ['vegan', 'schnell'],
    healthTags: ['cholesterinsenkend', 'herzfreundlich', 'verdauungsfoerdernd'],
    prepTimeMinutes: 10,
    cookTimeMinutes: 5,
    servings: 2,
    ingredients: [
      { name: 'Vollkorn-Tortillas', quantity: 2, unit: 'Stueck', calories: 260, proteinG: 8, fatG: 6, carbsG: 44 },
      { name: 'Schwarze Bohnen (Dose)', quantity: 200, unit: 'g', calories: 250, proteinG: 16, fatG: 1, carbsG: 40 },
      { name: 'Avocado', quantity: 1, unit: 'Stueck', calories: 240, proteinG: 3, fatG: 22, carbsG: 12 },
      { name: 'Tomate', quantity: 1, unit: 'Stueck', calories: 20, proteinG: 1, fatG: 0, carbsG: 4 },
      { name: 'Rucola', quantity: 40, unit: 'g', calories: 10, proteinG: 1, fatG: 0, carbsG: 1 },
      { name: 'Limettensaft', quantity: 1, unit: 'EL', calories: 4, proteinG: 0, fatG: 0, carbsG: 1 },
    ],
    instructions: [
      'Bohnen abgiessen und leicht erwaermen.',
      'Avocado zerdrucken und mit Limettensaft vermischen.',
      'Tomate in Wuerfel schneiden.',
      'Tortillas erwaermen, mit Avocado bestreichen.',
      'Bohnen, Tomate und Rucola darauf verteilen, einrollen.',
    ],
    estimatedCostEur: 5.50,
  },
  // verdauungsfoerdernd
  {
    title: 'Joghurt-Bowl mit Leinsamen und Apfel',
    description: 'Probiotischer Joghurt mit praebiotischen Leinsamen — gut fuer die Darmgesundheit.',
    category: 'breakfast',
    tags: ['vegetarisch', 'schnell'],
    healthTags: ['verdauungsfoerdernd', 'cholesterinsenkend'],
    prepTimeMinutes: 5,
    cookTimeMinutes: 0,
    servings: 1,
    ingredients: [
      { name: 'Naturjoghurt', quantity: 200, unit: 'g', calories: 120, proteinG: 10, fatG: 5, carbsG: 8 },
      { name: 'Apfel', quantity: 1, unit: 'Stueck', calories: 80, proteinG: 0, fatG: 0, carbsG: 21 },
      { name: 'Leinsamen geschrotet', quantity: 15, unit: 'g', calories: 80, proteinG: 3, fatG: 6, carbsG: 4 },
      { name: 'Honig', quantity: 1, unit: 'TL', calories: 20, proteinG: 0, fatG: 0, carbsG: 5 },
    ],
    instructions: [
      'Joghurt in eine Schuessel geben.',
      'Apfel waschen, entkernen und in Stuecke schneiden.',
      'Apfelstuecke auf dem Joghurt verteilen.',
      'Mit Leinsamen und Honig toppen.',
    ],
    estimatedCostEur: 2.50,
  },
  {
    title: 'Kuerbissuppe mit Ingwer',
    description: 'Sanfte Suppe, leicht verdaulich und entzuendungshemmend dank Ingwer.',
    category: 'dinner',
    tags: ['vegan', 'mealprep'],
    healthTags: ['verdauungsfoerdernd', 'entzuendungshemmend', 'kalorienarm'],
    prepTimeMinutes: 10,
    cookTimeMinutes: 25,
    servings: 4,
    ingredients: [
      { name: 'Hokaido-Kuerbis', quantity: 800, unit: 'g', calories: 200, proteinG: 8, fatG: 1, carbsG: 52 },
      { name: 'Ingwer frisch', quantity: 20, unit: 'g', calories: 16, proteinG: 0, fatG: 0, carbsG: 4 },
      { name: 'Zwiebel', quantity: 1, unit: 'Stueck', calories: 40, proteinG: 1, fatG: 0, carbsG: 9 },
      { name: 'Kokosmilch', quantity: 200, unit: 'ml', calories: 380, proteinG: 4, fatG: 38, carbsG: 6 },
      { name: 'Gemusebruehe', quantity: 500, unit: 'ml', calories: 12, proteinG: 0, fatG: 0, carbsG: 2 },
    ],
    instructions: [
      'Kuerbis waschen, entkernen und wuerfeln (Schale kann dranbleiben).',
      'Zwiebel und Ingwer hacken, in Olivenoel anschwitzen.',
      'Kuerbis dazugeben, mit Bruehe ablöschen.',
      '20 Min. koecheln lassen, dann puerieren.',
      'Kokosmilch einruehren, abschmecken.',
    ],
    estimatedCostEur: 5.80,
  },
  // entzuendungshemmend
  {
    title: 'Kurkuma-Lachs mit Spinat',
    description: 'Omega-3-reicher Lachs mit entzuendungshemmendem Kurkuma und Spinat.',
    category: 'dinner',
    tags: ['proteinreich', 'glutenfrei'],
    healthTags: ['entzuendungshemmend', 'herzfreundlich', 'eisenreich'],
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    servings: 2,
    ingredients: [
      { name: 'Lachsfilet', quantity: 300, unit: 'g', calories: 540, proteinG: 60, fatG: 33, carbsG: 0 },
      { name: 'Blattspinat', quantity: 200, unit: 'g', calories: 46, proteinG: 6, fatG: 1, carbsG: 6 },
      { name: 'Kurkuma gemahlen', quantity: 1, unit: 'TL', calories: 8, proteinG: 0, fatG: 0, carbsG: 2 },
      { name: 'Schwarzer Pfeffer', quantity: 1, unit: 'Prise', calories: 0, proteinG: 0, fatG: 0, carbsG: 0 },
      { name: 'Knoblauch', quantity: 2, unit: 'Zehen', calories: 8, proteinG: 0, fatG: 0, carbsG: 2 },
      { name: 'Olivenoel', quantity: 2, unit: 'EL', calories: 180, proteinG: 0, fatG: 20, carbsG: 0 },
    ],
    instructions: [
      'Lachs mit Kurkuma und Pfeffer einreiben.',
      'In Olivenoel bei mittlerer Hitze 4 Min. pro Seite braten.',
      'Knoblauch hacken, in einer zweiten Pfanne anduensten.',
      'Spinat dazugeben, zusammenfallen lassen.',
      'Lachs auf dem Spinatbett anrichten.',
    ],
    estimatedCostEur: 11.00,
  },
  {
    title: 'Goldene Milch (Kurkuma-Latte)',
    description: 'Wohlig warmes Getraenk mit Kurkuma und Ingwer — die Entzuendungsbremse.',
    category: 'snack',
    tags: ['vegan', 'schnell'],
    healthTags: ['entzuendungshemmend'],
    prepTimeMinutes: 5,
    cookTimeMinutes: 5,
    servings: 1,
    ingredients: [
      { name: 'Pflanzenmilch', quantity: 250, unit: 'ml', calories: 40, proteinG: 1, fatG: 2, carbsG: 3 },
      { name: 'Kurkuma gemahlen', quantity: 1, unit: 'TL', calories: 8, proteinG: 0, fatG: 0, carbsG: 2 },
      { name: 'Ingwer frisch gerieben', quantity: 5, unit: 'g', calories: 4, proteinG: 0, fatG: 0, carbsG: 1 },
      { name: 'Zimt', quantity: 1, unit: 'Prise', calories: 0, proteinG: 0, fatG: 0, carbsG: 0 },
      { name: 'Schwarzer Pfeffer', quantity: 1, unit: 'Prise', calories: 0, proteinG: 0, fatG: 0, carbsG: 0 },
      { name: 'Honig oder Agavendicksaft', quantity: 1, unit: 'TL', calories: 20, proteinG: 0, fatG: 0, carbsG: 5 },
    ],
    instructions: [
      'Pflanzenmilch in einem Topf erwaermen.',
      'Kurkuma, Ingwer, Zimt und Pfeffer einruehren.',
      '2-3 Min. leicht koecheln lassen.',
      'In eine Tasse abseihen, mit Honig suessen.',
    ],
    estimatedCostEur: 1.50,
  },
  // eisenreich
  {
    title: 'Linsensalat mit Paprika und Petersilie',
    description: 'Eisenreicher Salat mit Linsen und Vitamin C aus Paprika fuer optimale Eisenaufnahme.',
    category: 'lunch',
    tags: ['vegan', 'mealprep'],
    healthTags: ['eisenreich', 'blutzuckerfreundlich', 'verdauungsfoerdernd'],
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    servings: 3,
    ingredients: [
      { name: 'Beluga-Linsen', quantity: 200, unit: 'g', calories: 640, proteinG: 50, fatG: 2, carbsG: 100 },
      { name: 'Rote Paprika', quantity: 2, unit: 'Stueck', calories: 60, proteinG: 2, fatG: 0, carbsG: 14 },
      { name: 'Petersilie frisch', quantity: 30, unit: 'g', calories: 10, proteinG: 1, fatG: 0, carbsG: 2 },
      { name: 'Zitronensaft', quantity: 3, unit: 'EL', calories: 12, proteinG: 0, fatG: 0, carbsG: 4 },
      { name: 'Olivenoel', quantity: 2, unit: 'EL', calories: 180, proteinG: 0, fatG: 20, carbsG: 0 },
      { name: 'Kreuzkuemmel', quantity: 1, unit: 'TL', calories: 8, proteinG: 0, fatG: 0, carbsG: 1 },
    ],
    instructions: [
      'Linsen in Salzwasser 15-20 Min. kochen, abgiessen und abkuehlen lassen.',
      'Paprika in kleine Wuerfel schneiden.',
      'Petersilie fein hacken.',
      'Alles vermengen, mit Olivenoel, Zitronensaft und Kreuzkuemmel wuerzen.',
    ],
    estimatedCostEur: 4.50,
  },
  {
    title: 'Spinat-Kichererbsen-Curry',
    description: 'Aromatisches Curry mit eisenreichem Spinat und Kichererbsen.',
    category: 'dinner',
    tags: ['vegan', 'mealprep'],
    healthTags: ['eisenreich', 'entzuendungshemmend', 'verdauungsfoerdernd'],
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    servings: 3,
    ingredients: [
      { name: 'Kichererbsen (Dose)', quantity: 400, unit: 'g', calories: 450, proteinG: 24, fatG: 6, carbsG: 72 },
      { name: 'Blattspinat', quantity: 300, unit: 'g', calories: 69, proteinG: 9, fatG: 1, carbsG: 10 },
      { name: 'Kokosmilch', quantity: 200, unit: 'ml', calories: 380, proteinG: 4, fatG: 38, carbsG: 6 },
      { name: 'Zwiebel', quantity: 1, unit: 'Stueck', calories: 40, proteinG: 1, fatG: 0, carbsG: 9 },
      { name: 'Currypulver', quantity: 2, unit: 'TL', calories: 14, proteinG: 1, fatG: 1, carbsG: 2 },
      { name: 'Kurkuma', quantity: 1, unit: 'TL', calories: 8, proteinG: 0, fatG: 0, carbsG: 2 },
      { name: 'Ingwer frisch', quantity: 10, unit: 'g', calories: 8, proteinG: 0, fatG: 0, carbsG: 2 },
    ],
    instructions: [
      'Zwiebel und Ingwer hacken, in Oel anschwitzen.',
      'Curry und Kurkuma dazugeben, 1 Min. roesten.',
      'Kichererbsen und Kokosmilch einruehren.',
      '10 Min. koecheln lassen.',
      'Spinat unterheben, zusammenfallen lassen.',
      'Mit Reis oder Naan servieren.',
    ],
    estimatedCostEur: 6.00,
  },
  // kalorienarm
  {
    title: 'Zucchetti-Nudeln mit Tomatensauce',
    description: 'Leichte Alternative zu Pasta — Zucchetti-Spaghetti mit frischer Tomatensauce.',
    category: 'dinner',
    tags: ['vegan', 'lowcarb', 'schnell'],
    healthTags: ['kalorienarm', 'verdauungsfoerdernd'],
    prepTimeMinutes: 10,
    cookTimeMinutes: 10,
    servings: 2,
    ingredients: [
      { name: 'Zucchetti', quantity: 3, unit: 'Stueck', calories: 90, proteinG: 6, fatG: 0, carbsG: 18 },
      { name: 'Cherrytomaten', quantity: 300, unit: 'g', calories: 54, proteinG: 3, fatG: 0, carbsG: 12 },
      { name: 'Knoblauch', quantity: 2, unit: 'Zehen', calories: 8, proteinG: 0, fatG: 0, carbsG: 2 },
      { name: 'Olivenoel', quantity: 1, unit: 'EL', calories: 90, proteinG: 0, fatG: 10, carbsG: 0 },
      { name: 'Basilikum frisch', quantity: 10, unit: 'Blaetter', calories: 2, proteinG: 0, fatG: 0, carbsG: 0 },
    ],
    instructions: [
      'Zucchetti mit einem Spiralschneider oder Schaeler in Nudeln schneiden.',
      'Knoblauch hacken, in Olivenoel anschwitzen.',
      'Tomaten halbieren, dazugeben und 5 Min. koecheln.',
      'Zucchetti-Nudeln kurz in der Sauce erwaermen.',
      'Mit frischem Basilikum servieren.',
    ],
    estimatedCostEur: 4.00,
  },
  {
    title: 'Griechischer Gurken-Tomaten-Salat',
    description: 'Erfrischender Salat mit Feta, Gurke und Tomaten — leicht und saettigend.',
    category: 'lunch',
    tags: ['vegetarisch', 'schnell', 'glutenfrei'],
    healthTags: ['kalorienarm'],
    prepTimeMinutes: 10,
    cookTimeMinutes: 0,
    servings: 2,
    ingredients: [
      { name: 'Salatgurke', quantity: 1, unit: 'Stueck', calories: 30, proteinG: 1, fatG: 0, carbsG: 7 },
      { name: 'Tomaten', quantity: 3, unit: 'Stueck', calories: 60, proteinG: 3, fatG: 0, carbsG: 12 },
      { name: 'Feta', quantity: 100, unit: 'g', calories: 260, proteinG: 14, fatG: 21, carbsG: 4 },
      { name: 'Oliven', quantity: 50, unit: 'g', calories: 75, proteinG: 1, fatG: 7, carbsG: 2 },
      { name: 'Rote Zwiebel', quantity: 1, unit: 'Stueck', calories: 40, proteinG: 1, fatG: 0, carbsG: 9 },
      { name: 'Olivenoel', quantity: 2, unit: 'EL', calories: 180, proteinG: 0, fatG: 20, carbsG: 0 },
      { name: 'Oregano', quantity: 1, unit: 'TL', calories: 3, proteinG: 0, fatG: 0, carbsG: 1 },
    ],
    instructions: [
      'Gurke und Tomaten in Stuecke schneiden.',
      'Zwiebel in duenne Ringe schneiden.',
      'Feta wuerfeln.',
      'Alles zusammen anrichten, mit Oliven, Olivenoel und Oregano wuerzen.',
    ],
    estimatedCostEur: 5.00,
  },
  // migraenefreundlich
  {
    title: 'Quinoa-Salat mit Avocado und Kuerbiskernen',
    description: 'Magnesiumreicher Salat mit Quinoa und Kuerbiskernen — gut gegen Migraene.',
    category: 'lunch',
    tags: ['vegan', 'glutenfrei'],
    healthTags: ['migraenefreundlich', 'eisenreich'],
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    servings: 2,
    ingredients: [
      { name: 'Quinoa', quantity: 150, unit: 'g', calories: 555, proteinG: 20, fatG: 9, carbsG: 97 },
      { name: 'Avocado', quantity: 1, unit: 'Stueck', calories: 240, proteinG: 3, fatG: 22, carbsG: 12 },
      { name: 'Kuerbiskerne', quantity: 30, unit: 'g', calories: 170, proteinG: 9, fatG: 14, carbsG: 3 },
      { name: 'Gurke', quantity: 1, unit: 'Stueck', calories: 30, proteinG: 1, fatG: 0, carbsG: 7 },
      { name: 'Minze frisch', quantity: 10, unit: 'Blaetter', calories: 2, proteinG: 0, fatG: 0, carbsG: 0 },
      { name: 'Olivenoel', quantity: 2, unit: 'EL', calories: 180, proteinG: 0, fatG: 20, carbsG: 0 },
    ],
    instructions: [
      'Quinoa nach Packungsanleitung kochen, abkuehlen lassen.',
      'Gurke wuerfeln, Avocado in Scheiben schneiden.',
      'Minze hacken.',
      'Alles vermengen, mit Olivenoel und Zitronensaft wuerzen.',
      'Mit Kuerbiskernen toppen.',
    ],
    estimatedCostEur: 6.50,
  },
  {
    title: 'Lachs mit Suesskartoffel-Pueree',
    description: 'Omega-3 und Magnesium — beides wichtig bei Migraene.',
    category: 'dinner',
    tags: ['proteinreich', 'glutenfrei'],
    healthTags: ['migraenefreundlich', 'herzfreundlich', 'entzuendungshemmend'],
    prepTimeMinutes: 10,
    cookTimeMinutes: 25,
    servings: 2,
    ingredients: [
      { name: 'Lachsfilet', quantity: 300, unit: 'g', calories: 540, proteinG: 60, fatG: 33, carbsG: 0 },
      { name: 'Suesskartoffeln', quantity: 400, unit: 'g', calories: 344, proteinG: 6, fatG: 0, carbsG: 80 },
      { name: 'Olivenoel', quantity: 1, unit: 'EL', calories: 90, proteinG: 0, fatG: 10, carbsG: 0 },
      { name: 'Muskatnuss', quantity: 1, unit: 'Prise', calories: 0, proteinG: 0, fatG: 0, carbsG: 0 },
    ],
    instructions: [
      'Suesskartoffeln schaelen, wuerfeln und in Salzwasser 15 Min. kochen.',
      'Lachs in Olivenoel 4 Min. pro Seite braten.',
      'Suesskartoffeln abgiessen und mit einer Gabel zu Pueree zerdrucken.',
      'Mit Muskatnuss, Salz und Pfeffer wuerzen.',
      'Lachs auf dem Pueree anrichten.',
    ],
    estimatedCostEur: 10.00,
  },
  // More recipes for variety
  {
    title: 'Overnight Oats mit Chiasamen',
    description: 'Praktisches Fruehstueck zum Vorbereiten — ballaststoffreich und saettigend.',
    category: 'breakfast',
    tags: ['vegan', 'mealprep'],
    healthTags: ['verdauungsfoerdernd', 'cholesterinsenkend', 'blutzuckerfreundlich'],
    prepTimeMinutes: 5,
    cookTimeMinutes: 0,
    servings: 1,
    ingredients: [
      { name: 'Haferflocken', quantity: 50, unit: 'g', calories: 190, proteinG: 7, fatG: 3, carbsG: 33 },
      { name: 'Chiasamen', quantity: 15, unit: 'g', calories: 73, proteinG: 2, fatG: 5, carbsG: 6 },
      { name: 'Pflanzenmilch', quantity: 200, unit: 'ml', calories: 40, proteinG: 1, fatG: 2, carbsG: 3 },
      { name: 'Himbeeren', quantity: 80, unit: 'g', calories: 42, proteinG: 1, fatG: 0, carbsG: 10 },
    ],
    instructions: [
      'Haferflocken, Chiasamen und Pflanzenmilch in einem Glas vermengen.',
      'Abgedeckt ueber Nacht im Kuehlschrank quellen lassen.',
      'Am Morgen mit Himbeeren toppen. Fertig!',
    ],
    estimatedCostEur: 2.50,
  },
  {
    title: 'Gemuese-Frittata',
    description: 'Eiweissreiche Frittata mit Saisongemuese — schnell und vielseitig.',
    category: 'lunch',
    tags: ['vegetarisch', 'glutenfrei', 'schnell'],
    healthTags: ['kalorienarm', 'blutzuckerfreundlich'],
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    servings: 3,
    ingredients: [
      { name: 'Eier', quantity: 6, unit: 'Stueck', calories: 420, proteinG: 36, fatG: 30, carbsG: 4 },
      { name: 'Peperoni', quantity: 1, unit: 'Stueck', calories: 30, proteinG: 1, fatG: 0, carbsG: 7 },
      { name: 'Zucchetti', quantity: 1, unit: 'Stueck', calories: 30, proteinG: 2, fatG: 0, carbsG: 6 },
      { name: 'Feta', quantity: 50, unit: 'g', calories: 130, proteinG: 7, fatG: 10, carbsG: 2 },
      { name: 'Kraeutermischung', quantity: 1, unit: 'EL', calories: 3, proteinG: 0, fatG: 0, carbsG: 1 },
    ],
    instructions: [
      'Ofen auf 180 Grad vorheizen.',
      'Peperoni und Zucchetti in Wuerfel schneiden, in einer ofenfesten Pfanne anbraten.',
      'Eier verquirlen, mit Kraeutern wuerzen.',
      'Eier ueber das Gemuese giessen, Feta darueber broeseeln.',
      '12-15 Min. im Ofen backen bis die Frittata fest ist.',
    ],
    estimatedCostEur: 4.50,
  },
  {
    title: 'Randen-Hummus mit Rohkost',
    description: 'Farbenfroher Dip mit Randen und Kichererbsen — eisenreich und lecker.',
    category: 'snack',
    tags: ['vegan', 'glutenfrei'],
    healthTags: ['eisenreich', 'herzfreundlich', 'verdauungsfoerdernd'],
    prepTimeMinutes: 10,
    cookTimeMinutes: 0,
    servings: 4,
    ingredients: [
      { name: 'Kichererbsen (Dose)', quantity: 400, unit: 'g', calories: 450, proteinG: 24, fatG: 6, carbsG: 72 },
      { name: 'Gekochte Randen', quantity: 200, unit: 'g', calories: 86, proteinG: 3, fatG: 0, carbsG: 20 },
      { name: 'Tahini', quantity: 2, unit: 'EL', calories: 180, proteinG: 5, fatG: 16, carbsG: 6 },
      { name: 'Zitronensaft', quantity: 2, unit: 'EL', calories: 8, proteinG: 0, fatG: 0, carbsG: 3 },
      { name: 'Knoblauch', quantity: 1, unit: 'Zehe', calories: 4, proteinG: 0, fatG: 0, carbsG: 1 },
      { name: 'Karotten und Gurke zum Dippen', quantity: 200, unit: 'g', calories: 50, proteinG: 1, fatG: 0, carbsG: 12 },
    ],
    instructions: [
      'Kichererbsen, Randen, Tahini, Zitronensaft und Knoblauch in einen Mixer geben.',
      'Alles glatt puerieren, bei Bedarf etwas Wasser dazugeben.',
      'Mit Salz abschmecken.',
      'Mit Rohkoststicks aus Karotten und Gurke servieren.',
    ],
    estimatedCostEur: 4.00,
  },
  {
    title: 'Gebackener Kabeljau mit Kraeuterkruste',
    description: 'Leichter Fisch mit Kraeutern — schonend fuer Magen und Blutzucker.',
    category: 'dinner',
    tags: ['proteinreich', 'schnell'],
    healthTags: ['kalorienarm', 'blutzuckerfreundlich', 'herzfreundlich'],
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    servings: 2,
    ingredients: [
      { name: 'Kabeljaufilet', quantity: 300, unit: 'g', calories: 240, proteinG: 51, fatG: 2, carbsG: 0 },
      { name: 'Vollkorn-Paniermehl', quantity: 30, unit: 'g', calories: 100, proteinG: 4, fatG: 2, carbsG: 18 },
      { name: 'Petersilie', quantity: 20, unit: 'g', calories: 7, proteinG: 1, fatG: 0, carbsG: 1 },
      { name: 'Zitrone', quantity: 1, unit: 'Stueck', calories: 17, proteinG: 1, fatG: 0, carbsG: 5 },
      { name: 'Olivenoel', quantity: 1, unit: 'EL', calories: 90, proteinG: 0, fatG: 10, carbsG: 0 },
    ],
    instructions: [
      'Ofen auf 200 Grad vorheizen.',
      'Paniermehl mit gehackter Petersilie und Olivenoel mischen.',
      'Fischfilets in eine Auflaufform legen.',
      'Kraeutermischung darauf verteilen.',
      '15-20 Min. im Ofen backen.',
      'Mit Zitronenspalten servieren.',
    ],
    estimatedCostEur: 9.00,
  },
  {
    title: 'Gruener Smoothie mit Spinat und Mango',
    description: 'Vitaminbombe mit Eisen aus Spinat und Vitamin C aus Mango fuer bessere Aufnahme.',
    category: 'smoothie',
    tags: ['vegan', 'schnell'],
    healthTags: ['eisenreich', 'entzuendungshemmend', 'verdauungsfoerdernd'],
    prepTimeMinutes: 5,
    cookTimeMinutes: 0,
    servings: 1,
    ingredients: [
      { name: 'Blattspinat', quantity: 60, unit: 'g', calories: 14, proteinG: 2, fatG: 0, carbsG: 2 },
      { name: 'Mango (gefroren)', quantity: 100, unit: 'g', calories: 60, proteinG: 1, fatG: 0, carbsG: 15 },
      { name: 'Banane', quantity: 1, unit: 'Stueck', calories: 105, proteinG: 1, fatG: 0, carbsG: 27 },
      { name: 'Pflanzenmilch', quantity: 200, unit: 'ml', calories: 40, proteinG: 1, fatG: 2, carbsG: 3 },
      { name: 'Leinsamen', quantity: 10, unit: 'g', calories: 55, proteinG: 2, fatG: 4, carbsG: 3 },
    ],
    instructions: [
      'Alle Zutaten in einen Mixer geben.',
      'Auf hoechster Stufe 1-2 Min. mixen.',
      'Sofort geniessen.',
    ],
    estimatedCostEur: 3.00,
  },
  {
    title: 'Edamame-Bowl mit braunem Reis',
    description: 'Proteinreiche japanisch inspirierte Bowl mit Edamame und Gemuese.',
    category: 'lunch',
    tags: ['vegan', 'proteinreich'],
    healthTags: ['herzfreundlich', 'blutzuckerfreundlich', 'cholesterinsenkend'],
    prepTimeMinutes: 10,
    cookTimeMinutes: 25,
    servings: 2,
    ingredients: [
      { name: 'Brauner Reis', quantity: 150, unit: 'g', calories: 540, proteinG: 11, fatG: 4, carbsG: 113 },
      { name: 'Edamame', quantity: 150, unit: 'g', calories: 180, proteinG: 16, fatG: 8, carbsG: 8 },
      { name: 'Karotten', quantity: 2, unit: 'Stueck', calories: 50, proteinG: 1, fatG: 0, carbsG: 12 },
      { name: 'Avocado', quantity: 1, unit: 'Stueck', calories: 240, proteinG: 3, fatG: 22, carbsG: 12 },
      { name: 'Sojasauce natriumarm', quantity: 2, unit: 'EL', calories: 20, proteinG: 2, fatG: 0, carbsG: 2 },
      { name: 'Sesam', quantity: 10, unit: 'g', calories: 58, proteinG: 2, fatG: 5, carbsG: 2 },
    ],
    instructions: [
      'Reis nach Packungsanleitung kochen.',
      'Edamame 3-4 Min. in kochendem Wasser garen.',
      'Karotten in Streifen schneiden, Avocado in Scheiben.',
      'Alles in einer Bowl anrichten.',
      'Mit Sojasauce betraeufeln und Sesam bestreuen.',
    ],
    estimatedCostEur: 7.00,
  },
  {
    title: 'Beerensmoothie-Bowl',
    description: 'Antioxidantien-reiche Bowl mit gemischten Beeren und Nuessen.',
    category: 'breakfast',
    tags: ['vegan', 'glutenfrei'],
    healthTags: ['entzuendungshemmend', 'herzfreundlich'],
    prepTimeMinutes: 10,
    cookTimeMinutes: 0,
    servings: 1,
    ingredients: [
      { name: 'Gemischte Beeren (gefroren)', quantity: 150, unit: 'g', calories: 75, proteinG: 1, fatG: 0, carbsG: 18 },
      { name: 'Banane', quantity: 1, unit: 'Stueck', calories: 105, proteinG: 1, fatG: 0, carbsG: 27 },
      { name: 'Pflanzenmilch', quantity: 100, unit: 'ml', calories: 20, proteinG: 0, fatG: 1, carbsG: 2 },
      { name: 'Walnuesse', quantity: 15, unit: 'g', calories: 100, proteinG: 2, fatG: 10, carbsG: 2 },
      { name: 'Kokosflocken', quantity: 10, unit: 'g', calories: 65, proteinG: 1, fatG: 6, carbsG: 2 },
    ],
    instructions: [
      'Beeren, Banane und Pflanzenmilch zu einer dicken Creme mixen.',
      'In eine Schuessel giessen.',
      'Mit Walnuessen und Kokosflocken dekorieren.',
    ],
    estimatedCostEur: 3.50,
  },
  {
    title: 'Ratatouille',
    description: 'Provenzalisches Gemuese-Schmorgericht — kalorienarm und naehrstoffreich.',
    category: 'dinner',
    tags: ['vegan', 'mealprep', 'glutenfrei'],
    healthTags: ['kalorienarm', 'herzfreundlich', 'verdauungsfoerdernd'],
    prepTimeMinutes: 15,
    cookTimeMinutes: 30,
    servings: 4,
    ingredients: [
      { name: 'Aubergine', quantity: 1, unit: 'Stueck', calories: 35, proteinG: 1, fatG: 0, carbsG: 9 },
      { name: 'Zucchetti', quantity: 2, unit: 'Stueck', calories: 60, proteinG: 4, fatG: 0, carbsG: 12 },
      { name: 'Peperoni rot', quantity: 2, unit: 'Stueck', calories: 60, proteinG: 2, fatG: 0, carbsG: 14 },
      { name: 'Tomaten', quantity: 4, unit: 'Stueck', calories: 80, proteinG: 4, fatG: 0, carbsG: 16 },
      { name: 'Zwiebel', quantity: 1, unit: 'Stueck', calories: 40, proteinG: 1, fatG: 0, carbsG: 9 },
      { name: 'Knoblauch', quantity: 3, unit: 'Zehen', calories: 12, proteinG: 1, fatG: 0, carbsG: 3 },
      { name: 'Olivenoel', quantity: 3, unit: 'EL', calories: 270, proteinG: 0, fatG: 30, carbsG: 0 },
      { name: 'Herbes de Provence', quantity: 2, unit: 'TL', calories: 5, proteinG: 0, fatG: 0, carbsG: 1 },
    ],
    instructions: [
      'Alles Gemuese in gleichmaessige Wuerfel schneiden.',
      'Zwiebel und Knoblauch in Olivenoel anschwitzen.',
      'Aubergine dazugeben, 5 Min. anbraten.',
      'Restliches Gemuese und Kraeuter hinzufuegen.',
      '25-30 Min. bei mittlerer Hitze schmoren lassen.',
      'Mit Salz und Pfeffer abschmecken.',
    ],
    estimatedCostEur: 6.00,
  },
  {
    title: 'Makrele mit Fenchel-Orangen-Salat',
    description: 'Omega-3-reiche Makrele mit verdauungsfoerderndem Fenchel.',
    category: 'dinner',
    tags: ['proteinreich', 'glutenfrei'],
    healthTags: ['herzfreundlich', 'entzuendungshemmend', 'verdauungsfoerdernd'],
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    servings: 2,
    ingredients: [
      { name: 'Makrelenfilet', quantity: 300, unit: 'g', calories: 600, proteinG: 54, fatG: 42, carbsG: 0 },
      { name: 'Fenchel', quantity: 1, unit: 'Stueck', calories: 30, proteinG: 1, fatG: 0, carbsG: 7 },
      { name: 'Orange', quantity: 1, unit: 'Stueck', calories: 62, proteinG: 1, fatG: 0, carbsG: 15 },
      { name: 'Olivenoel', quantity: 1, unit: 'EL', calories: 90, proteinG: 0, fatG: 10, carbsG: 0 },
    ],
    instructions: [
      'Makrele im Ofen bei 200 Grad 12-15 Min. garen.',
      'Fenchel in feine Scheiben hobeln.',
      'Orange filetieren.',
      'Fenchel und Orangen vermengen, mit Olivenoel betraeufeln.',
      'Makrele auf dem Salat anrichten.',
    ],
    estimatedCostEur: 8.50,
  },
  {
    title: 'Kichererbsen-Gemuese-Pfanne',
    description: 'Bunte Pfanne mit Kichererbsen — eiweissreich und ballaststoffreich.',
    category: 'lunch',
    tags: ['vegan', 'schnell'],
    healthTags: ['blutzuckerfreundlich', 'eisenreich', 'verdauungsfoerdernd'],
    prepTimeMinutes: 10,
    cookTimeMinutes: 12,
    servings: 2,
    ingredients: [
      { name: 'Kichererbsen (Dose)', quantity: 400, unit: 'g', calories: 450, proteinG: 24, fatG: 6, carbsG: 72 },
      { name: 'Brokkoli', quantity: 200, unit: 'g', calories: 60, proteinG: 6, fatG: 1, carbsG: 8 },
      { name: 'Peperoni gelb', quantity: 1, unit: 'Stueck', calories: 30, proteinG: 1, fatG: 0, carbsG: 7 },
      { name: 'Paprikapulver', quantity: 1, unit: 'TL', calories: 6, proteinG: 0, fatG: 0, carbsG: 1 },
      { name: 'Olivenoel', quantity: 1, unit: 'EL', calories: 90, proteinG: 0, fatG: 10, carbsG: 0 },
    ],
    instructions: [
      'Brokkoli in Roeschen teilen, Peperoni in Streifen schneiden.',
      'Gemuese in Olivenoel 5 Min. anbraten.',
      'Kichererbsen abgiessen und dazugeben.',
      'Paprikapulver und Gewuerze einstreuen.',
      'Noch 5 Min. braten. Heiss servieren.',
    ],
    estimatedCostEur: 4.50,
  },
  {
    title: 'Hirse-Kuerbis-Risotto',
    description: 'Glutenfreies Risotto mit Hirse und Kuerbis — eisenreich und wohltuend.',
    category: 'dinner',
    tags: ['glutenfrei', 'vegetarisch'],
    healthTags: ['eisenreich', 'verdauungsfoerdernd'],
    prepTimeMinutes: 10,
    cookTimeMinutes: 25,
    servings: 3,
    ingredients: [
      { name: 'Hirse', quantity: 180, unit: 'g', calories: 630, proteinG: 20, fatG: 6, carbsG: 130 },
      { name: 'Kuerbis', quantity: 300, unit: 'g', calories: 78, proteinG: 3, fatG: 0, carbsG: 20 },
      { name: 'Gemusebruehe', quantity: 500, unit: 'ml', calories: 12, proteinG: 0, fatG: 0, carbsG: 2 },
      { name: 'Parmesan', quantity: 30, unit: 'g', calories: 120, proteinG: 10, fatG: 8, carbsG: 1 },
      { name: 'Salbei frisch', quantity: 5, unit: 'Blaetter', calories: 2, proteinG: 0, fatG: 0, carbsG: 0 },
    ],
    instructions: [
      'Hirse unter fliessendem Wasser waschen.',
      'Kuerbis schaelen und wuerfeln.',
      'Kuerbis in etwas Oel anschwitzen, Hirse dazugeben.',
      'Bruehe nach und nach einruehren, wie bei Risotto.',
      '20-25 Min. koecheln bis Hirse weich ist.',
      'Parmesan und Salbei unterruehren.',
    ],
    estimatedCostEur: 5.50,
  },
  {
    title: 'Walnuss-Dattel-Energieballs',
    description: 'Natuerlicher Snack mit Magnesium und gesunden Fetten — ohne Industriezucker.',
    category: 'snack',
    tags: ['vegan', 'mealprep', 'glutenfrei'],
    healthTags: ['migraenefreundlich', 'entzuendungshemmend'],
    prepTimeMinutes: 10,
    cookTimeMinutes: 0,
    servings: 12,
    ingredients: [
      { name: 'Walnuesse', quantity: 100, unit: 'g', calories: 654, proteinG: 15, fatG: 65, carbsG: 14 },
      { name: 'Datteln entsteint', quantity: 100, unit: 'g', calories: 277, proteinG: 2, fatG: 0, carbsG: 75 },
      { name: 'Kakao (ungesuesst)', quantity: 2, unit: 'EL', calories: 24, proteinG: 2, fatG: 2, carbsG: 3 },
      { name: 'Kokosraspel', quantity: 30, unit: 'g', calories: 195, proteinG: 2, fatG: 19, carbsG: 6 },
    ],
    instructions: [
      'Walnuesse und Datteln in einen Mixer geben, grob zerkleinern.',
      'Kakao dazugeben, nochmals kurz mixen.',
      'Aus der Masse kleine Kugeln formen.',
      'In Kokosraspeln rollen.',
      'Im Kuehlschrank fest werden lassen.',
    ],
    estimatedCostEur: 5.00,
  },
  {
    title: 'Susskartoffel-Linsen-Dal',
    description: 'Wuerzig-cremiges Dal mit Suesskartoffeln — saettigend und naehrstoffreich.',
    category: 'dinner',
    tags: ['vegan', 'mealprep'],
    healthTags: ['blutzuckerfreundlich', 'eisenreich', 'entzuendungshemmend'],
    prepTimeMinutes: 10,
    cookTimeMinutes: 30,
    servings: 4,
    ingredients: [
      { name: 'Rote Linsen', quantity: 200, unit: 'g', calories: 680, proteinG: 48, fatG: 2, carbsG: 108 },
      { name: 'Suesskartoffel', quantity: 300, unit: 'g', calories: 258, proteinG: 5, fatG: 0, carbsG: 60 },
      { name: 'Kokosmilch', quantity: 200, unit: 'ml', calories: 380, proteinG: 4, fatG: 38, carbsG: 6 },
      { name: 'Garam Masala', quantity: 2, unit: 'TL', calories: 10, proteinG: 0, fatG: 0, carbsG: 2 },
      { name: 'Kurkuma', quantity: 1, unit: 'TL', calories: 8, proteinG: 0, fatG: 0, carbsG: 2 },
      { name: 'Ingwer', quantity: 10, unit: 'g', calories: 8, proteinG: 0, fatG: 0, carbsG: 2 },
      { name: 'Gemusebruehe', quantity: 400, unit: 'ml', calories: 10, proteinG: 0, fatG: 0, carbsG: 2 },
    ],
    instructions: [
      'Suesskartoffel schaelen und wuerfeln.',
      'Ingwer hacken, mit Gewuerzen in Oel anroesten.',
      'Linsen, Suesskartoffeln und Bruehe dazugeben.',
      '20 Min. koecheln lassen.',
      'Kokosmilch einruehren.',
      'Abschmecken und mit Reis oder Naan servieren.',
    ],
    estimatedCostEur: 6.50,
  },
];

async function seedConditions(database) {
  console.log('\nSeeding health conditions...');
  const container = database.container('conditions');
  for (const condition of CONDITIONS) {
    try {
      await container.items.upsert(condition);
      console.log(`  + ${condition.name}`);
    } catch (err) {
      console.error(`  ! Error creating ${condition.name}: ${err.message}`);
    }
  }
}

async function seedRecipes(database) {
  console.log('\nSeeding recipes...');
  const container = database.container('recipes');
  const now = new Date().toISOString();

  for (const recipe of RECIPES) {
    const nutrition = recipe.ingredients.reduce((acc, ing) => ({
      calories: acc.calories + (ing.calories || 0),
      proteinG: acc.proteinG + (ing.proteinG || 0),
      carbsG: acc.carbsG + (ing.carbsG || 0),
      fatG: acc.fatG + (ing.fatG || 0),
      fiberG: acc.fiberG + (ing.fiberG || 0),
    }), { calories: 0, proteinG: 0, carbsG: 0, fatG: 0, fiberG: 0 });

    const doc = {
      id: uuidv4(),
      ...recipe,
      nutrition,
      authorId: 'system',
      createdAt: now,
      updatedAt: now,
    };

    try {
      await container.items.upsert(doc);
      console.log(`  + ${recipe.title}`);
    } catch (err) {
      console.error(`  ! Error creating ${recipe.title}: ${err.message}`);
    }
  }
}

async function main() {
  console.log('=== Heilkueche Seed Script ===\n');
  try {
    const database = await createDatabaseAndContainers();
    await seedConditions(database);
    await seedRecipes(database);
    console.log('\nDone! Heilkueche database seeded successfully.');
  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
}

main();
