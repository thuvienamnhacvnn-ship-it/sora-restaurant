import fs from 'node:fs';
import assert from 'node:assert/strict';
import {dungKhung,cho} from './lib/trinh-duyet.mjs';
const b=await dungKhung();fs.mkdirSync('_w-agent/reservation-redesign',{recursive:true});
try{
 for(const[w,h]of [[1440,1000],[1280,900],[1024,900],[390,844]]){
  await b.khoKhung(w,h);await b.go('http://127.0.0.1:3160/de/reservierung',{san:"return !!document.querySelector('[data-reservation-layout]') && !!document.querySelector('[data-lich]')"});await cho(250);
  const r=await b.js("const h=document.querySelector('h1'),r=h.querySelector('img').getBoundingClientRect(),b=h.closest('section').getBoundingClientRect();return {title:h.textContent,titleFits:r.left>=b.left&&r.right<=b.right&&r.top>=b.top&&r.bottom<=b.bottom,centered:Math.abs((r.left+r.right-b.left-b.right)/2)<2,overflow:document.documentElement.scrollWidth>innerWidth,areas:document.querySelectorAll('[data-khu-vuc]').length}");console.log(w,r);assert(r.titleFits);assert(r.centered);assert(!r.overflow);assert.equal(r.title,'Reservierung');assert.equal(r.areas,2);
  await b.bam('[data-lich] button:not(:disabled)[aria-pressed]');await b.bam('[data-luoi-gio] button');await b.bam('button[aria-label="Mehr Gäste"]');await b.bam('[data-khu-vuc="bar"]');
  await b.nhapO('textarea','Test · Fensterplatz, wenn möglich');
  const selected=await b.js("return {guests:document.querySelector('[data-so-khach]').getAttribute('data-so-khach'),summary:document.querySelector('[data-tom-tat]').textContent,phone:document.querySelector('[data-tom-tat] a[href^=\"tel:\"]').getAttribute('href'),past:[...document.querySelectorAll('[data-lich] button[aria-pressed]')].filter(e=>e.disabled).every(e=>e.getAttribute('aria-pressed')==='false')} ");assert.equal(selected.guests,'3');assert(selected.summary.includes('18:00'));assert(selected.summary.includes('Bar'));assert(selected.summary.includes('Test · Fensterplatz'));assert.equal(selected.phone,'tel:+491622979999');assert(selected.past);
  await b.js('window.scrollTo(0,0);return true');const shot=await b.cmd('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});fs.writeFileSync('_w-agent/reservation-redesign/'+w+'.png',Buffer.from(shot.data,'base64'));
 }
 console.log('PASS reservation title, responsive layout, calendar/time/guest/area/notes, correct phone',b.loiConsole());
}finally{b.dong();}
