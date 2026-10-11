import fs from 'node:fs';
import { dungKhung, cho } from './lib/trinh-duyet.mjs';
const b=await dungKhung();fs.mkdirSync('_w-agent/about-offers',{recursive:true});
const base='http://127.0.0.1:3160/de';
try {
 for(const [w,h] of [[1440,1000],[390,844]]) {
  await b.khoKhung(w,h);
  await b.go(base+'/ueber-uns',{san:"return document.querySelectorAll('[data-offer]').length===2"});await cho(500);
  const overview=await b.js("return {offers:document.querySelectorAll('[data-offer]').length,overflow:document.documentElement.scrollWidth>innerWidth,links:[...document.querySelectorAll('[data-offer] a')].map(e=>e.getAttribute('href'))}");
  console.log('overview',w,overview);if(overview.overflow||overview.offers!==2)throw Error('Overview');
  let shot=await b.cmd('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync('_w-agent/about-offers/overview-'+w+'.png',Buffer.from(shot.data,'base64'));
  await b.go(base+'/ueber-uns/aktion/eroeffnung',{san:"return !!document.querySelector('#amount-eroeffnung')"});
  await b.nhapO('#amount-eroeffnung','200');
  const opening=await b.js("return [...document.querySelectorAll('[aria-live]')].map(e=>e.textContent).join(' ')");if(!opening.includes('20,00')||!opening.includes('180,00'))throw Error('10% calculation '+opening);
  if((await b.doTran()).scroll>w)throw Error('Detail overflow');
  shot=await b.cmd('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync('_w-agent/about-offers/opening-'+w+'.png',Buffer.from(shot.data,'base64'));
  await b.go(base+'/ueber-uns/aktion/sushi-geschenk',{san:"return !!document.querySelector('#amount-sushi-geschenk')"});
  await b.nhapO('#amount-sushi-geschenk','100');let result=await b.js("return document.querySelector('[aria-live]').textContent");if(result.includes('Dein Geschenk:'))throw Error('Gift wrongly applies at exactly 100');
  await b.nhapO('#amount-sushi-geschenk','100,01');result=await b.js("return document.querySelector('[aria-live]').textContent");if(!result.includes('Dein Geschenk:')||!result.includes('15,00'))throw Error('Gift missing over 100');
 }
 for(const section of ['angebote','neuheiten','beliebte','erlebnis']) {
  await b.go(base+'/ueber-uns/'+section,{san:"return !!document.querySelector('nav[aria-label=\"SoRa entdecken\"]')"});
  const current=await b.js("return document.querySelector('nav[aria-label=\"SoRa entdecken\"] [aria-current]')?.getAttribute('href')");if(current!==`/de/ueber-uns/${section}`)throw Error('Section navigation '+section);
  if((await b.doTran()).scroll>390)throw Error('Section overflow '+section);
 }
 await b.go(base+'/master-chef',{san:"return !!document.querySelector('[data-chef-recommendations]')"});
 await b.bam('button[aria-pressed]:nth-child(4)');
 const count=await b.js("return document.querySelectorAll('[data-chef-recommendations] a').length");if(count!==3)throw Error('Chef suggestions '+count);
 await b.js("window.fetch=async()=>({ok:true,json:async()=>({nguon:'menu',monIds:[],canHoiNhanVien:false})});return true");
 await b.nhapO('#chef-question','Welche vegetarischen Gerichte gibt es?');await b.bam('button[type=submit]');
 const answer=await b.js("return document.querySelectorAll('article a[href*=\"dish=\"]').length");if(answer<1)throw Error('Chef text fallback');
 console.log('PASS offers, 10% calculation, strict sushi threshold, sections, chef',b.loiConsole());
}finally{b.dong();}
