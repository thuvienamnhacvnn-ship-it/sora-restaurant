import fs from 'node:fs';
import { dungKhung, cho } from './lib/trinh-duyet.mjs';
const b=await dungKhung();
fs.mkdirSync('_w-agent/magic-titles',{recursive:true});
try {
 for (const [w,h] of (process.argv.includes('--mobile') ? [[390,844]] : [[1440,900],[390,844]])) {
  await b.khoKhung(w,h);
  for(const path of ['speisekarte','reservierung','galerie','ueber-uns','kontakt']) {
   await b.go('http://127.0.0.1:3160/de/'+path,{san:"return !!document.querySelector('[data-magic-title] img')"});
   await cho(300);
   const r=await b.js(`const t=document.querySelector('[data-magic-title] img'),banner=t.closest('[data-menu-hero],[data-subpage-banner]'),a=t.getBoundingClientRect(),c=banner.getBoundingClientRect(); const input=banner.querySelector('input'); return {width:a.width,height:a.height,cx:Math.abs(a.x+a.width/2-c.x-c.width/2),cy:Math.abs(a.y+a.height/2-c.y-c.height/2),fits:a.x>=c.x&&a.right<=c.right+1&&a.y>=c.y&&a.bottom<=c.bottom,overlap:input?a.bottom>input.getBoundingClientRect().top:false,animation:getComputedStyle(t).animationName,overflow:document.documentElement.scrollWidth>innerWidth};`);
   console.log(w,path,r);
   if(r.cx>2||r.cy>2||!r.fits||r.overlap||r.overflow||r.animation!=='none')throw Error('Invalid title '+path+' '+w);
   const shot=await b.cmd('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync('_w-agent/magic-titles/'+path+'-'+w+'.png',Buffer.from(shot.data,'base64'));
  }
 }
 console.log('PASS all five banner titles',b.loiConsole());
}finally{b.dong();}
