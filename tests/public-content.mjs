import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { JSDOM } from 'jsdom';

const dom = new JSDOM(`<!doctype html><html><body>
  <a data-managed-nav="frames" hidden>Frames</a><a data-managed-nav="certificates" hidden>Certificates</a>
  <section id="certificates" hidden><div class="credential-slider"></div><p data-cert-empty></p></section>
  <div data-frames-page hidden><div data-managed-frames></div><div class="frames-empty"></div></div>
  <div data-frames-unavailable><p>Loading</p></div>
</body></html>`, { url:'https://portfolio.example/', runScripts:'outside-only', pretendToBeVisual:true });
const w = dom.window;
const m = { bucket:'media',storage_path:'frames/test image.png',mime_type:'image/png' };
let data = {
  sections:[{key:'frames',is_visible:true,in_nav:true},{key:'certificates',is_visible:true,in_nav:true}],
  frames:[{caption:null,image:m},{caption:'<img src=x onerror=alert(1)>',image:m}],
  certificates:[{name:'AI course',issuer:'Learning',description:'Completed',credential_url:'javascript:alert(1)',file:m,thumbnail:null}],
};
let calls=0;
w.fetch=async () => { calls++; return {ok:true,json:async()=>data}; };
w.AbortSignal=AbortSignal;
w.matchMedia=()=>({matches:false});
const source=(await readFile(new URL('../src/lib/managed-content.ts',import.meta.url),'utf8'))
  .replaceAll('import.meta.env.PUBLIC_SUPABASE_URL',JSON.stringify('https://cms.example'))
  .replaceAll('import.meta.env.PUBLIC_SUPABASE_ANON_KEY',JSON.stringify('public-test-key'));
w.eval(ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText);
const settle=()=>new Promise(resolve=>setTimeout(resolve,10));
await settle();
assert.equal(w.document.querySelector('#certificates').hidden,false);
assert.equal(w.document.querySelector('[data-managed-nav="frames"]').hidden,false);
assert.equal(w.document.querySelectorAll('.managed-frame').length,2);
assert.equal(w.document.querySelectorAll('.managed-frame figcaption').length,1);
assert.equal(w.document.querySelector('.managed-frame figcaption img'),null,'Captions are text, never executable HTML');
assert.match(w.document.querySelector('.credential-body a').href,/^https:\/\/cms.example/,'Unsafe credential URL is rejected');
assert.match(w.document.querySelector('.managed-frame img').src,/test%20image.png/);
w.document.dispatchEvent(new w.Event('visibilitychange'));
await settle();
assert.equal(w.document.querySelectorAll('.managed-frame').length,2,'Refresh replaces content without duplicates');
data={sections:[],frames:[],certificates:[]};
w.document.dispatchEvent(new w.Event('visibilitychange'));
await settle();
assert.equal(w.document.querySelector('#certificates').hidden,true);
assert.equal(w.document.querySelector('[data-frames-page]').hidden,true);
assert.equal(w.document.querySelector('[data-managed-nav="frames"]').hidden,true);
assert.equal(w.document.querySelector('[data-managed-nav="certificates"]').hidden,true);
assert.equal(w.document.querySelector('[data-frames-unavailable]').hidden,false);
assert.equal(w.document.querySelectorAll('.credential-card').length,0);
assert.equal(calls,3);
w.close();
console.log('PASS: live sections, nav visibility, optional captions, safe rendering, media URLs, refresh and hidden state.');
