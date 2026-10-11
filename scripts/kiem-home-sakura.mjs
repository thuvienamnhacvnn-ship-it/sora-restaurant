import fs from 'node:fs';
import assert from 'node:assert/strict';
import { dungKhung, cho } from './lib/trinh-duyet.mjs';
const b = await dungKhung();
try {
  await b.khoKhung(390,844);
  await b.go('http://127.0.0.1:3160/de/', {san:"return !!document.querySelector('.sora-mobile-home-stone')"});
  await cho(1400);
  const inspect = "const layers=[...document.querySelectorAll('.sora-tc-canh-roi')];const p=layers.find(e=>getComputedStyle(e).display!=='none');return {count:p.children.length,mask:getComputedStyle(p).maskImage,transform:getComputedStyle(p.firstElementChild).transform,animation:getComputedStyle(p.firstElementChild).animationName,overflow:document.documentElement.scrollWidth>innerWidth};";
  const a=await b.js(inspect);await cho(700);const c=await b.js(inspect);
  console.log('Petal evidence',a,c);
  assert(a.count>=30);assert.equal(a.mask,'none');assert.notEqual(a.transform,c.transform);assert.notEqual(a.animation,'none');assert(!a.overflow);
  const shot=await b.cmd('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
  fs.writeFileSync('_w-agent/mobile-app/home-sakura.png',Buffer.from(shot.data,'base64'));
  console.log('PASS dense unmasked petals animate across mobile home',c);
} finally {b.dong();}
