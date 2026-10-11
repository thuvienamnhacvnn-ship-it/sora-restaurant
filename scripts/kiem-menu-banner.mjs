import fs from 'node:fs';
import { dungKhung, cho } from './lib/trinh-duyet.mjs';
const b=await dungKhung();
fs.mkdirSync('_w-agent/menu-banner',{recursive:true});
try {
 for(const [w,h] of [[1440,900],[390,844]]) {
  await b.khoKhung(w,h);
  await b.go('http://127.0.0.1:3160/de/speisekarte',{san:"return !!document.querySelector('[data-menu-hero]') && document.querySelectorAll('[data-so-mon] li[data-mon]').length===207"});
  await cho(1300);
  const result=await b.js(`const hero=document.querySelector('[data-menu-hero]'),r=hero.getBoundingClientRect(),card=document.querySelector('[data-danh-muc]').getBoundingClientRect();return {overflow:document.documentElement.scrollWidth>innerWidth, chefBanner:!!document.querySelector('[data-chef]'),gap:card.top-r.bottom,controlsInside:[...hero.querySelectorAll('input,button')].every(e=>{const a=e.getBoundingClientRect();return a.top>=r.top && a.bottom<=r.bottom+1}),sidebarBlossom:[...document.querySelectorAll('aside [style]')].some(e=>e.style.backgroundImage.includes('cherry-blossoms'))}`);
  console.log(w,result);
  if(result.overflow||result.chefBanner||result.sidebarBlossom||!result.controlsInside||result.gap>12)throw Error('Layout failed '+w);
  const shot=await b.cmd('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync('_w-agent/menu-banner/'+w+'.png',Buffer.from(shot.data,'base64'));
  await b.bam('#tab-sushi');
  if(!await b.js("return document.querySelector('#tab-sushi').getAttribute('aria-selected')==='true'"))throw Error('Sushi filter failed');
  await b.bam('#tab-alle');
  await b.nhapO('input[type=search]','pho');
  if(!await b.js("return Number(document.querySelector('[data-ket-qua]')?.getAttribute('data-ket-qua'))>0"))throw Error('Search failed');
 }
 console.log('PASS menu banner, categories, search',b.loiConsole());
}finally{b.dong();}
