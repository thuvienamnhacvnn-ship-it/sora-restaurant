import fs from 'node:fs';
import { dungKhung, cho } from './lib/trinh-duyet.mjs';
const b = await dungKhung();
fs.mkdirSync('_w-agent/one-screen', { recursive: true });
try {
  for (const [w, h] of [[1920,1080],[1440,900],[1280,720],[1024,768],[390,844]]) {
    await b.khoKhung(w,h);
    await b.go('http://localhost:3160/de', {san: "return document.querySelectorAll('.sora-the-dm').length===5"});
    await cho(2300);
    await b.js("const root=[...document.querySelectorAll('[data-hero-dish]')].find(e=>e.getBoundingClientRect().width>0);root.querySelector('button').click();return true");
    await cho(250);
    const plates = await b.js("const root=[...document.querySelectorAll('[data-hero-dish]')].find(e=>e.getBoundingClientRect().width>0);const p=[...root.querySelectorAll('[data-plate]')];return p.length===2 && p[0].getBoundingClientRect().width>p[1].getBoundingClientRect().width && p.every(e=>e.querySelector('img').complete)");
    if (!plates) throw Error('Two differently sized plates must be visible '+w);
    const result = await b.js("return {w:innerWidth,h:innerHeight,sw:document.documentElement.scrollWidth,sh:document.documentElement.scrollHeight,cards:[...document.querySelectorAll('.sora-the-dm')].map(e=>{const r=e.getBoundingClientRect();return {top:r.top,bottom:r.bottom,height:r.height}})}");
    console.log(w, JSON.stringify(result));
    const shot = await b.cmd('Page.captureScreenshot', {format:'png',captureBeyondViewport:false});
    fs.writeFileSync('_w-agent/one-screen/'+w+'.png',Buffer.from(shot.data,'base64'));
    if (result.sh>h+1 || result.sw>w || result.cards.some(r=>r.bottom>h+1 || r.height<30)) throw Error('overflow '+w);
  }
  console.log('PASS', b.loiConsole());
} finally {b.dong();}
