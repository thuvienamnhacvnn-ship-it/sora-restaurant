import fs from "node:fs";
import { dungKhung, cho } from "./lib/trinh-duyet.mjs";

const b = await dungKhung();
const out = "_w-agent/lam-lai/tiep-quan";
fs.mkdirSync(out, { recursive: true });
const records = [];
try {
  for (const route of ["speisekarte", "galerie", "ueber-uns"]) {
    for (const width of [1920, 1440, 1280, 1024, 390]) {
      await b.khoKhung(width, width === 390 ? 844 : 900);
      await b.go(`http://localhost:3160/de/${route}`);
      await b.choTới("return document.images.length > 4 && [...document.images].filter(i=>i.getBoundingClientRect().width > 0).every(i=>i.complete);", 120000);
      await cho(500);
      const geometry = await b.js(`
        const box = el => {const r=el?.getBoundingClientRect();return r?[r.x,r.y,r.width,r.height]:null;};
        const main = document.querySelector('main');
        const hero = main.querySelector('section');
        const filter = main.querySelector('[role="group"]');
        return {width:innerWidth,scroll:document.documentElement.scrollWidth,hero:box(hero),filter:box(filter),sections:[...main.querySelectorAll('section')].slice(0,4).map(box)};
      `);
      records.push({route, width, ...geometry, errors:b.loiConsole()});
      console.log(JSON.stringify(records.at(-1)));
      if ([1920,1440,390].includes(width)) {
        const shot = await b.cmd("Page.captureScreenshot", {format:"png",captureBeyondViewport:false}, 30000);
        fs.writeFileSync(`${out}/${route}-${width}.png`, Buffer.from(shot.data,"base64"));
      }
    }
  }
  await b.khoKhung(390,844);
  await b.go("http://localhost:3160/de/galerie");
  await b.choTới("return document.querySelectorAll('button[aria-label*=\"vergr\"]').length===13;");
  await b.bam('button[aria-label*="vergr"]');
  const locked = await b.js("return document.body.style.overflow==='hidden' && document.querySelector('dialog').open;");
  await b.js("document.querySelector('dialog > div > div').click();");
  await cho(300);
  const closed = await b.js("return !document.querySelector('dialog').open && document.body.style.overflow!=='hidden';");
  console.log({lightboxLock:locked,lightboxBackdrop:closed});
  fs.writeFileSync(`${out}/responsive.json`,JSON.stringify(records,null,2));
  if(records.some(r=>r.scroll>r.width||r.errors.length)||!locked||!closed)process.exitCode=1;
} finally { b.dong(); }
