import fs from 'node:fs';
import {dungKhung} from './lib/trinh-duyet.mjs';
const b=await dungKhung();
try {
 for(const w of [1440,390]) {
  await b.khoKhung(w,900);
  for(const page of ['ueber-uns','kontakt']) {
   await b.go('http://127.0.0.1:3160/de/'+page);
   const result=await b.js(`return {overflow:document.documentElement.scrollWidth>innerWidth,headings:[...document.querySelectorAll('main h2')].filter(e=>!e.closest('[data-subpage-banner],[class*=bannerTitle]')&&e.getBoundingClientRect().height>5).map(e=>{const r=e.getBoundingClientRect();const p=e.closest('[class*="sectionPanel"],.sora-card,[class*="experience"]');const a=p?.getBoundingClientRect();return {text:e.textContent,inFrame:!!a&&r.left>=a.left&&r.right<=a.right+1&&r.top>=a.top&&r.bottom<=a.bottom+1}})};`);
   console.log(page,w,JSON.stringify(result));
   if(result.overflow||result.headings.some(x=>!x.inFrame))throw Error('Layout bounds');
   await b.js("window.scrollTo(0,240);return true");
   const shot=await b.cmd('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
   fs.writeFileSync('_w-agent/codex-qa/'+page+'-titles-'+w+'.png',Buffer.from(shot.data,'base64'));
  }
 }
 console.log('Console',b.loiConsole());
} finally {b.dong();}

