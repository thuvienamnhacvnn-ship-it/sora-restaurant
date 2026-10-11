import fs from 'node:fs';
import assert from 'node:assert/strict';
import {dungKhung,cho} from './lib/trinh-duyet.mjs';
const b=await dungKhung();fs.mkdirSync('_w-agent/mobile-app',{recursive:true});
const base='http://127.0.0.1:3160';
async function waitFor(check){for(let i=0;i<50;i++){if(await b.js(check))return;await cho(200);}assert.fail('Timed out waiting for route: '+check);}
async function shot(name){const r=await b.cmd('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync('_w-agent/mobile-app/'+name+'.png',Buffer.from(r.data,'base64'));}
try{
 for(const[w,h]of (process.env.NAV_ONLY ? [] : [[390,844],[320,668],[430,932]])){
  await b.khoKhung(w,h);
  for(const page of ['','speisekarte','reservierung','master-chef','ueber-uns','galerie','kontakt']){
   await b.go(base+'/de/'+page,{san:"return !!document.querySelector('[data-mobile-dock]')"});await cho(200);
   const r=await b.js("const dock=document.querySelector('[data-mobile-dock]'),d=dock.getBoundingClientRect(),header=document.querySelector('[data-mobile-header]').getBoundingClientRect();return {overflow:document.documentElement.scrollWidth>innerWidth,dockFits:d.left>=0&&d.right<=innerWidth&&d.bottom<=innerHeight,headerHeight:header.height,count:dock.children.length,active:dock.querySelectorAll('[aria-current=page]').length,mainTop:document.querySelector('main').getBoundingClientRect().top,scroll:document.documentElement.scrollHeight-innerHeight,titles:[...document.querySelectorAll('[data-magic-title] img')].every(e=>{const r=e.getBoundingClientRect(),b=e.closest('section').getBoundingClientRect();return r.left>=b.left-1&&r.right<=b.right+1&&r.top>=b.top-1&&r.bottom<=b.bottom+1})}");console.log(w,page||'home',r);assert(!r.overflow);assert(r.dockFits);assert(r.titles);assert.equal(r.count,5);assert.equal(r.active,1);if(!page)assert(r.scroll<=2,'home must remain one screen');
   if(!page){const home=await b.js("const brand=document.querySelector('.sora-mobile-home-brand'),r=brand.querySelector('img').getBoundingClientRect(),buttons=[...document.querySelectorAll('.sora-tc-nut')].map(e=>e.getBoundingClientRect());return {logoCentered:Math.abs((r.left+r.right)/2-innerWidth/2)<2,plates:[...document.querySelectorAll('[data-plate]')].filter(e=>e.getClientRects().length).length,tiles:getComputedStyle(document.querySelector('.sora-tc-dm')).display,header:getComputedStyle(document.querySelector('[data-mobile-header]')).display,equal:Math.abs(buttons[0].width-buttons[1].width)<1&&buttons[0].height===buttons[1].height,stacked:buttons[1].top>buttons[0].bottom}");assert(home.logoCentered);assert.equal(home.plates,1);assert.equal(home.tiles,'none');assert.equal(home.header,'none');assert(home.equal&&home.stacked);}
   if(w===390)await shot(page||'home');
  }
 }
 await b.khoKhung(390,844);await b.go(base+'/de/speisekarte',{san:"return !!document.querySelector('[data-mobile-dock]')"});await b.bam('[data-mobile-more]');await cho(300);
 assert(await b.js("const d=document.querySelector('[data-mobile-sheet]');return d.open&&d.contains(document.activeElement)&&d.querySelectorAll('a').length>=10"));await shot('menu-sheet');await b.bamPhim('Escape');assert(await b.js("return !document.querySelector('[data-mobile-sheet]').open"));
 await b.bam('[data-mobile-more]');await b.bam('[data-mobile-sheet] a[href="/de/master-chef"]');await waitFor("return location.pathname==='/de/master-chef'");
 await b.bam('[data-mobile-more]');await b.bam('[data-mobile-sheet] a[href="/de/galerie"]');await waitFor("return location.pathname==='/de/galerie'&&!document.querySelector('[data-mobile-sheet]').open");
 await b.bam('[data-mobile-more]');await b.bam('[data-mobile-cart]');assert(await b.js("return document.querySelector('[data-cart-dialog]').open&&!document.querySelector('[data-mobile-sheet]').open"));await b.bamPhim('Escape');
 await b.bam('[data-mobile-top-cart]');assert(await b.js("return document.querySelector('[data-cart-dialog]').open"));await b.bamPhim('Escape');
 assert(await b.js("const dock=document.querySelector('[data-mobile-dock]');return dock.children[1].getAttribute('href')==='/de/reservierung'&&dock.children[2].getAttribute('href')==='/de/speisekarte'&&dock.children[3].getAttribute('href')==='/de/ueber-uns/angebote'"));
 await b.bam('[data-mobile-dock] a[href="/de/ueber-uns/angebote"]');await waitFor("return location.pathname==='/de/ueber-uns/angebote'");
 await b.khoKhung(1440,900);await b.go(base+'/de/',{san:"return !!document.querySelector('[data-mobile-dock]')"});assert(await b.js("return getComputedStyle(document.querySelector('[data-mobile-dock]')).display==='none'&&document.documentElement.scrollWidth<=innerWidth"));
 console.log('PASS mobile app navigation, sheet/focus/Escape, route transitions, all pages at 3 widths, desktop unchanged',b.loiConsole());
}finally{b.dong();}
