import fs from 'node:fs';
import {dungKhung,cho} from './lib/trinh-duyet.mjs';
const b=await dungKhung();
try {
  await b.khoKhung(1920,1080);
  await b.go('http://localhost:3160/de',{san:"return document.querySelectorAll('[data-plate]').length===4"});
  await cho(500);
  const setTime=async time=>b.js(`document.getAnimations().forEach(a=>{a.pause();a.currentTime=${time}});return true`);
  await setTime(500);
  const first=await b.js("const r=[...document.querySelectorAll('[data-hero-dish]')].find(e=>e.getBoundingClientRect().width>0);return [...r.querySelectorAll('[data-plate]')].map(e=>parseFloat(getComputedStyle(e.querySelector('img:last-of-type')).opacity))");
  if(!(first[0]>0 && first[1]===0)) throw Error('Plates must appear in sequence '+first);
  for(const time of [500,1600,2800]) {
    await setTime(time);
    const s=await b.cmd('Page.captureScreenshot',{format:'png'});
    fs.writeFileSync('_w-agent/one-screen/magic-'+time+'.png',Buffer.from(s.data,'base64'));
  }
  await b.cmd('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  const reduced=await b.js("const r=[...document.querySelectorAll('[data-hero-dish]')].find(e=>e.getBoundingClientRect().width>0);return [...r.querySelectorAll('[data-plate] img')].every(e=>getComputedStyle(e).animationName==='none')");
  if(!reduced) throw Error('Reduced motion');
  console.log('PASS staggered materialization, light effects, reduced motion',b.loiConsole());
} finally {b.dong()}
