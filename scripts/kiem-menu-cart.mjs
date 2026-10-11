import fs from 'node:fs';
import assert from 'node:assert/strict';
import { dungKhung, cho } from './lib/trinh-duyet.mjs';
const items=JSON.parse(fs.readFileSync('data/menu-items.json','utf8'));
const soup=items.find(x=>x.nr==='1');
const fixed=items.find(x=>x.available&&typeof x.price==='number'&&!x.variants?.length&&!x.sizes?.length&&x.category==='vorspeisen');
const unknown=items.find(x=>x.price===null&&!x.variants?.length&&!x.sizes?.length);
const b=await dungKhung();
fs.mkdirSync('_w-agent/menu-cart',{recursive:true});
const url='http://127.0.0.1:3160/de/speisekarte';
const ready="return !!document.querySelector('[data-cart-toggle]') && document.querySelectorAll('[data-so-mon] li[data-mon]').length===207";
async function select(key){await b.js(`const e=document.querySelector('[data-purchase-option]');e.value=${JSON.stringify(key)};e.dispatchEvent(new Event('change',{bubbles:true}));return e.value`);await cho(100);}
async function shot(name){const r=await b.cmd('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync('_w-agent/menu-cart/'+name+'.png',Buffer.from(r.data,'base64'));}
try{
 await b.khoKhung(1440,900);await b.go(url,{san:ready});
 await b.bam('#tab-suppen');
 await b.bam(`[data-mon="${soup.id}"] [data-add-dish]`);
 assert(await b.js("return document.querySelector('[data-purchase-add]').disabled"),'must select variant');
 await select('variant:B');await b.bam('[data-purchase-add]');await cho(80);
 assert(await b.js("return [...document.body.children].some(e=>e.tagName==='IMG'&&e.getAttribute('aria-hidden')==='true')"),'food fly animation');
 await cho(900);await b.bam('[data-cart-toggle]');
 assert.equal(await b.js("return document.querySelector('[data-cart-total]').textContent.trim()"),'5,90 €');
 assert(await b.js("return document.querySelector('[data-cart-line]').textContent.includes('B ·')"));
 await b.bam('[data-cart-line] button[aria-label^="Mehr"]');
 assert.equal(await b.js("return document.querySelector('[data-cart-total]').textContent.trim()"),'11,80 €');
 assert.equal(await b.js("return document.querySelector('[data-cart-dialog] a[href^=\"tel:\"]').getAttribute('href')"),'tel:+491622979999');
 await shot('cart-desktop');await b.bamPhim('Escape');
 assert(await b.js("return !document.querySelector('[data-cart-dialog]').open"));
 await b.go(url,{san:ready});
 assert.equal(await b.js("return document.querySelector('[data-cart-count]').textContent"),'2','persisted cart');
 await b.bam('#tab-suppen');await b.bam(`[data-mon="${soup.id}"] [data-add-dish]`);await select('variant:A');await b.bam('[data-purchase-add]');await cho(900);
 await b.bam('[data-cart-toggle]');
 assert.equal(await b.js("return document.querySelectorAll('[data-cart-line]').length"),2,'separate variants');
 assert.equal(await b.js("return document.querySelector('[data-cart-total]').textContent.trim()"),'16,70 €');
 await b.bam('[data-cart-line] button[aria-label^="Weniger"]');
 assert.equal(await b.js("return document.querySelector('[data-cart-total]').textContent.trim()"),'10,80 €');
 await b.bam('[data-cart-line] button[aria-label$="entfernen"]');
 assert.equal(await b.js("return document.querySelector('[data-cart-total]').textContent.trim()"),'4,90 €');
 await b.bamPhim('Escape');
 await b.bam('#tab-'+fixed.category);await b.bam(`[data-mon="${fixed.id}"] [data-add-dish]`);await cho(900);
 assert.equal(await b.js("return document.querySelector('[data-cart-count]').textContent"),'2','direct add');
 await b.go(url+'?dish='+unknown.id,{san:"return !!document.querySelector('dialog[open]')"});
 assert(await b.js("return !document.querySelector('[data-purchase-add]') && !!document.querySelector('dialog[open] a[href^=\"tel:\"]')"),'unknown price must not become zero');
 await b.bamPhim('Escape');
 for(const [w,h] of [[1920,1000],[1440,900],[390,844]]){
  await b.khoKhung(w,h);await b.go(url,{san:ready});await b.bam('#tab-suppen');await cho(250);
  const r=await b.js(`const ul=document.querySelector('#bang-suppen ul'),cards=[...ul.querySelectorAll('[data-mon]')].map(e=>e.getBoundingClientRect()),u=ul.getBoundingClientRect();return {n:cards.length,left:cards[0].left-u.left,right:u.right-cards.at(-1).right,rows:cards.map(e=>Math.round(e.top)),overflow:document.documentElement.scrollWidth>innerWidth,nested:document.querySelectorAll('button button').length}`);
  console.log(w,r);assert.equal(r.n,3);assert(!r.overflow);assert.equal(r.nested,0);
  if(w>700){assert(r.left<2&&r.right<2);assert.equal(new Set(r.rows).size,1);}
  await b.js("document.querySelector('#bang-suppen').scrollIntoView({block:'start'});return true");await shot('suppen-'+w);
  await b.bam('[data-cart-toggle]');await shot('cart-'+w);assert(await b.js("const d=document.querySelector('[data-cart-dialog]').getBoundingClientRect();return d.left>=0&&d.right<=innerWidth&&d.height<=innerHeight"));await b.bamPhim('Escape');
 }
 await b.cmd('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 await b.bam('#tab-'+fixed.category);await b.bam(`[data-mon="${fixed.id}"] [data-add-dish]`);await cho(100);
 assert(!await b.js("return [...document.body.children].some(e=>e.tagName==='IMG'&&e.getAttribute('aria-hidden')==='true')"));
 console.log('PASS variants, exact totals, quantities, persistence, direct add, flight, reduced motion, unknown price, desktop/mobile full-width grid',b.loiConsole());
}finally{b.dong();}
