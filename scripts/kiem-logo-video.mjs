import fs from 'node:fs';
import assert from 'node:assert/strict';
import { dungKhung, cho } from './lib/trinh-duyet.mjs';
const b=await dungKhung();
try {
  for(const safari of [false,true]) {
    await b.cmd('Network.setUserAgentOverride',{userAgent:safari?'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1':'Mozilla/5.0 Chrome/130.0.0.0 Safari/537.36'});
    await b.khoKhung(390,844);
    await b.go('http://127.0.0.1:3160/de/',{san:"return document.querySelector('.sora-mobile-home-brand [data-sora-logo]')?.dataset.ready==='true'"});
    const inspect="const logo=document.querySelector('.sora-mobile-home-brand [data-sora-logo]'),v=logo.querySelector('video'),c=logo.querySelector('canvas');const ctx=c.getContext('2d');return {mode:logo.dataset.mode,ready:logo.dataset.ready,time:v.currentTime,paused:v.paused,muted:v.muted,inline:v.playsInline,loop:v.loop,src:v.currentSrc,alpha:ctx.getImageData(0,0,1,1).data[3],center:ctx.getImageData(c.width/2,c.height/2,1,1).data[3],width:logo.getBoundingClientRect().width,overflow:document.documentElement.scrollWidth>innerWidth};";
    const a=await b.js(inspect);await cho(900);const d=await b.js(inspect);
    assert(!a.paused&&a.muted&&a.inline&&a.loop);assert(d.time>a.time);assert.equal(a.mode,safari?'packed':'native');assert(!a.overflow);
    if(safari){assert(a.alpha<8);assert(a.center>100);}
    const shot=await b.cmd('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync('_w-agent/mobile-app/logo-'+(safari?'safari-path':'webm')+'.png',Buffer.from(shot.data,'base64'));
    console.log('PASS',safari?'Safari codec/compositor path (Chromium emulation)':'native WebM',d);
    await b.js("document.querySelector('.sora-mobile-home-brand [data-sora-logo]').style.display='none'");await cho(300);
    assert(await b.js("return document.querySelector('.sora-mobile-home-brand video').paused"));
  }
  console.log('Browser console',b.loiConsole());
}finally{b.dong();}
