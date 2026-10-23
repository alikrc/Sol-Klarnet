// Hız ve teknik testleri: kalıplar, kayıt, çalışta notalar, hizalama, tempo merdiveni ve dersler.
// test.js sonunda run(ok) ile çağrılır.

function run(ok){
  const S = require('./skills.js');
  console.log('\n[37] Teknik kaliplari');
  {
    const r = S.techPattern({ type:'scale', makam:'rast', sub:2, art:'legato' });
    ok(r.notes.map(n => n.c).join() === '0,9,17,22,31,40,48,53,44,40,31,22,17,9,0' && r.notes.every(n => n.d === 0.5), 'Rast dizisi: cikis (Evc) inis (Acem), sekizlik', r.notes.map(n => n.c).join());
    ok(S.techPattern({ type:'scale', base:60, mode:'major', sub:4, art:'legato' }).notes.map(n => n.w).join() === '60,62,64,65,67,69,71,72,71,69,67,65,64,62,60', 'Do majör gami');
    ok(S.techPattern({ type:'scale', base:57, mode:'minor', sub:2, art:'legato' }).notes.slice(0, 8).map(n => n.w).join() === '57,59,60,62,64,65,67,69', 'La minör gami');
    ok(S.techPattern({ type:'arp', base:67, mode:'major', octaves:2, sub:3, art:'legato' }) === null, 'aralik disi kalip null (iki oktav Sol majör: Re6, Sol6)');
    ok(S.techPattern({ type:'arp', base:57, mode:'minor', sub:2, art:'legato' }).notes.map(n => n.w).join() === '57,60,64,69,64,60,57', 'La minör arpej');
    ok(S.techPattern({ type:'thirds', base:60, mode:'major', sub:2, art:'legato' }).notes.slice(0, 6).map(n => n.w).join() === '60,64,62,65,64,67', 'uclu atlamalar');
    ok(S.techPattern({ type:'groups', base:67, mode:'major', sub:4, art:'legato' }).notes.slice(0, 8).map(n => n.w).join() === '67,69,71,72,69,71,72,74', 'dortlu gruplar');
    ok(S.techPattern({ type:'break', pair:[69,71], sub:2, art:'legato' }).notes.map(n => n.w).join() === '69,71,69,71,69,71,69,71,69', 'register gecisi');
    ok(S.techPattern({ type:'scale', makam:'rast', sub:2, art:'legato' }).label.tr === 'Rast dizisi · sekizlik' && S.patternKey({ type:'scale', makam:'rast', sub:2, art:'legato' }) === 'scale:rast::1:2:legato', 'etiket ve anahtar');
  }
}

module.exports = { run };
