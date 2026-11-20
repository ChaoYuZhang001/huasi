import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {existsSync, mkdtempSync, readFileSync, rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';
import worker from '../server/worker.js';

const root=fileURLToPath(new URL('../',import.meta.url));

test('Pages ships the playable client, identifies the primary site and excludes development files',t=>{
 const scratch=mkdtempSync(join(tmpdir(),'sansi-pages-'));
 t.after(()=>rmSync(scratch,{recursive:true,force:true}));
 const site=join(scratch,'huasi');
 execFileSync('python3',['tools/prepare-pages.py',site],{cwd:root});
 for(const name of ['README.md','tests','server','tools','art','wrangler.jsonc','.github','.assetsignore','tex/512/granite_tile/color.jpg']){
  assert(!existsSync(join(site,name)),name);
 }
 for(const name of ['manifest.webmanifest','og.jpg','huashan-temple.html','world/entry.css','characters/visitor-female.glb','tex/512/granite_tile/color-temple.webp','tex/CREDITS.md','vendor/LICENSE-three.txt']){
  assert.deepEqual(readFileSync(join(site,name)),readFileSync(join(root,name)));
 }
 const primary=readFileSync(join(root,'index.html'),'utf8'),mirror=readFileSync(join(site,'index.html'),'utf8');
 assert(!primary.includes('name="robots" content="noindex'));
 assert.equal(mirror.replace('<meta name="robots" content="noindex, follow">\n',''),primary);
 assert.notEqual(mirror,primary);
 for(const tag of ['<link rel="canonical" href="https://sansitemple.com/">','<meta property="og:url" content="https://sansitemple.com/">','<meta property="og:image" content="https://sansitemple.com/og.jpg">','<meta name="twitter:image" content="https://sansitemple.com/og.jpg">']){
  assert(primary.includes(tag),tag);
 }
});

test('old Worker bookmarks redirect once with their query on the same origin',async()=>{
 for(const path of ['/huashan-temple.html','/huashan-temple','/huashan-temple/']){
  const response=await worker.fetch(new Request('https://www.sansitemple.com'+path+'?lang=en'),{});
  assert.equal(response.status,301);
  assert.equal(response.headers.get('location'),'https://www.sansitemple.com/?lang=en');
 }
});
