import fs from "node:fs";
import { dungKhung, soKetQua } from "./lib/trinh-duyet.mjs";

const b = await dungKhung();
const s = soKetQua();
try {
  await b.khoKhung(390, 844, true);
  await b.go("http://localhost:3160/de/kontakt");
  await b.bam('header button[aria-expanded]');
  s.ghi("mobile menu opens as modal", await b.js("return !!document.querySelector('[role=dialog][aria-modal=true]');"));
  s.ghi("background scroll locked", await b.js("return document.body.style.overflow === 'hidden';"));
  await b.js("const d=document.querySelector('[role=dialog]'); const links=d.querySelectorAll('a,button'); links[links.length-1].focus(); return 1;");
  await b.cmd("Input.dispatchKeyEvent", {type:"keyDown", key:"Tab", code:"Tab", windowsVirtualKeyCode:9});
  await b.cmd("Input.dispatchKeyEvent", {type:"keyUp", key:"Tab", code:"Tab", windowsVirtualKeyCode:9});
  s.ghi("Tab remains in menu", await b.js("return document.querySelector('[role=dialog]').contains(document.activeElement);"));
  await b.bamPhim("Escape");
  s.ghi("Escape closes menu + restores scrolling", await b.js("return !document.querySelector('[role=dialog]') && document.body.style.overflow !== 'hidden';"));
  await b.bam('header button[aria-expanded]');
  await b.bam('[role=dialog] a[aria-current=page]');
  s.ghi("current page link closes mobile menu", await b.js("return !document.querySelector('[role=dialog]');"));

  await b.bam('button.fixed[aria-label="Master Chef"]');
  s.ghi("Chef opens + locks scrolling", await b.js("return !!document.querySelector('[role=dialog]') && document.body.style.overflow === 'hidden';"));
  s.ghi("Chef empty message cannot submit", await b.js("return !!document.querySelector('[role=dialog] button[type=submit]')?.disabled;"));
  await b.bamPhim("Escape");
  s.ghi("Chef Escape closes", await b.js("return !document.querySelector('[role=dialog]');"));
  s.ghi("mobile no horizontal overflow", (await b.doTran()).scroll === 390);

  await b.khoKhung(1440,900);
  await b.go("http://localhost:3160/de/kontakt");
  await b.bam('button[aria-controls], button[aria-label="Customer Care"]');
  // Support label is translated; locate its icon by the actual rail button.
  if (!await b.js("return !!document.getElementById('sora-phone-support');")) {
    await b.js("const rail=[...document.querySelectorAll('div.fixed')].find(x=>x.className.includes('w-[84px]')); const buttons=rail?.querySelectorAll('button'); buttons?.[buttons.length-1]?.click(); return 1;");
  }
  await b.choTới("return !!document.getElementById('sora-phone-support');",8000);
  s.ghi("support panel opens", await b.js("return !!document.getElementById('sora-phone-support');"));
  await b.bamPhim("Escape");
  s.ghi("support Escape closes", await b.js("return !document.getElementById('sora-phone-support');"));
  s.ghi("no browser errors", b.loiConsole().length === 0, b.loiConsole().join(" | "));
  fs.mkdirSync("_w-agent/codex-qa",{recursive:true});
  const shot=await b.cmd("Page.captureScreenshot",{format:"png",captureBeyondViewport:false});
  fs.writeFileSync("_w-agent/codex-qa/contact-shared-1440.png",Buffer.from(shot.data,"base64"));
  const result=s.in();
  process.exitCode=result.ma;
} finally { b.dong(); }
