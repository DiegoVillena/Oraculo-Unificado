const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'js', 'i18n', 'locales');

const translations = {
  es: {
    "en": "en", "solDesc": "Tu esencia y vitalidad.", "lunaDesc": "Tu mundo emocional.",
    "ascendente": "Ascendente", "ascDesc": "Tu máscara social.", "mcDesc": "Tu vocación.",
    "aspectosDest": "Aspectos destacados", "parteFortuna": "Parte de la Fortuna"
  },
  en: {
    "en": "in", "solDesc": "Your essence and vitality.", "lunaDesc": "Your emotional world.",
    "ascendente": "Ascendant", "ascDesc": "Your social mask.", "mcDesc": "Your vocation.",
    "aspectosDest": "Highlight aspects", "parteFortuna": "Part of Fortune"
  },
  pt: {
    "en": "em", "solDesc": "Sua essência e vitalidade.", "lunaDesc": "Seu mundo emocional.",
    "ascendente": "Ascendente", "ascDesc": "Sua máscara social.", "mcDesc": "Sua vocação.",
    "aspectosDest": "Aspectos destacados", "parteFortuna": "Parte da Fortuna"
  },
  fr: {
    "en": "en", "solDesc": "Ton essence et vitalité.", "lunaDesc": "Ton monde émotionnel.",
    "ascendente": "Ascendant", "ascDesc": "Ton masque social.", "mcDesc": "Ta vocation.",
    "aspectosDest": "Aspects marquants", "parteFortuna": "Part de Fortune"
  },
  de: {
    "en": "in", "solDesc": "Dein Wesen und deine Vitalität.", "lunaDesc": "Deine emotionale Welt.",
    "ascendente": "Aszendent", "ascDesc": "Deine soziale Maske.", "mcDesc": "Deine Berufung.",
    "aspectosDest": "Hervorzuhebende Aspekte", "parteFortuna": "Glückspunkt"
  },
  it: {
    "en": "in", "solDesc": "La tua essenza e vitalità.", "lunaDesc": "Il tuo mondo emotivo.",
    "ascendente": "Ascendente", "ascDesc": "La tua maschera sociale.", "mcDesc": "La tua vocazione.",
    "aspectosDest": "Aspetti destacati", "parteFortuna": "Parte di Fortuna"
  }
};

for (const [lang, vals] of Object.entries(translations)) {
  const fn = path.join(dir, lang + '.json');
  const data = JSON.parse(fs.readFileSync(fn, 'utf-8'));
  if (!data.astrologia) data.astrologia = {};
  for (const [k, v] of Object.entries(vals)) {
    data.astrologia[k] = v;
  }
  fs.writeFileSync(fn, JSON.stringify(data, null, 2), 'utf-8');
  console.log(lang + ': claves de astrologia añadidas');
}