import fs from "node:fs";
const folder = "generated-artifacts/site-locales";
const languages = ["fr", "ar", "es", "pt", "sw", "zh"];
const sources = JSON.parse(fs.readFileSync(`${folder}/source.json`, "utf8"));
const dictionaries = Object.fromEntries(languages.map(lang => [lang, {}]));
for (let i = 0; i < sources.length; i += 80) {
  const name = String(i / 80).padStart(3, "0");
  const translated = JSON.parse(fs.readFileSync(`${folder}/translated-${name}.json`, "utf8"));
  const batch = sources.slice(i, i + 80);
  for (const lang of languages) {
    if (translated[lang]?.length !== batch.length) throw new Error(`Translation batch ${name}: ${lang} has wrong length.`);
    batch.forEach((phrase, index) => {
      const value = translated[lang][index];
      if (typeof value !== "string" || !value.trim()) throw new Error(`Empty translation ${lang} ${name}:${index}`);
      dictionaries[lang][phrase] = value;
    });
  }
}
const target = "artifacts/web/src/lib/locales";
fs.mkdirSync(target, { recursive: true });
for (const language of languages) fs.writeFileSync(`${target}/${language}.json`, JSON.stringify(dictionaries[language]));
console.log(`Compiled ${sources.length} source phrases into ${languages.length} local catalogues.`);
