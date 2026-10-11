import fs from "node:fs";
import { dungKhung, cho } from "./lib/trinh-duyet.mjs";
const b = await dungKhung();
const shots = "_w-agent/trang-chu-v2/shots/codex-two-thirds";
fs.mkdirSync(shots, { recursive: true });
try {
  await b.khoKhung(1920, 1080);
  await b.go("http://localhost:3160/de", { san: "return document.querySelectorAll('[data-hero-dish]').length === 2" });
  const check = async (label, code) => { const result = await b.js(code); console.log(label, result); if (!result) throw new Error(label); };
  await b.bam('button[aria-label="Gerichte pausieren / abspielen"]');
  await check("banner two-thirds size", "const r=document.querySelector('.sora-tc-hero').getBoundingClientRect();return Math.abs(r.height-innerHeight*2/3)<3 && getComputedStyle(document.querySelector('.sora-tc-hero-nen')).objectFit==='cover'");
  await b.bam('button[aria-label="HAUPTGERICHTE"]');
  await check("select group", "return document.querySelector('[data-hero-dish]').dataset.dishCategory==='hauptgerichte' && document.querySelector('button[aria-label=HAUPTGERICHTE]').getAttribute('aria-pressed')==='true'");
  const before = await b.js("return document.querySelector('[data-hero-dish]').dataset.heroDish");
  await b.bam('button[aria-label="GETRÄNKE"]');
  await check("empty drinks retain dish", `return document.querySelector('[data-hero-dish]').dataset.heroDish===${JSON.stringify(before)}`);
  await b.bam('button[aria-label="Nächstes Gericht"]');
  await check("next stays selected group", `return document.querySelector('[data-hero-dish]').dataset.dishCategory==='hauptgerichte' && document.querySelector('[data-hero-dish]').dataset.heroDish!==${JSON.stringify(before)}`);
  await b.bam('button[aria-label="HAUPTGERICHTE"]');
  await check("second click clears group", "return document.querySelector('button[aria-label=HAUPTGERICHTE]').getAttribute('aria-pressed')==='false'");
  await check("category links preserved", "return [...document.querySelectorAll('.sora-the-dm-nut')].length===5 && [...document.querySelectorAll('.sora-the-dm-nut')].every(a=>a.tagName==='A' && a.href.includes('/de/speisekarte?kategorie='))");
  await b.bam('button[aria-label="Gerichte pausieren / abspielen"]');
  const running = await b.js("return document.querySelector('[data-hero-dish]').dataset.heroDish");
  await cho(6500);
  await check("automatic rotation", `return document.querySelector('[data-hero-dish]').dataset.heroDish!==${JSON.stringify(running)}`);
  await b.bam('button[aria-label="Gerichte pausieren / abspielen"]');
  for (const [width, height, name] of [[1920,1080,"home-1920"],[1440,900,"home-1440"],[390,844,"home-390"]]) {
    await b.khoKhung(width,height); await cho(300);
    await check(`no overflow ${width}`, "return document.documentElement.scrollWidth===document.documentElement.clientWidth");
    const shot = await b.cmd("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(`${shots}/${name}.png`, Buffer.from(shot.data,"base64"));
  }
  console.log("console", b.loiConsole());
} finally { b.dong(); }
