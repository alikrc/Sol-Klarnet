// Video testleri: kütüphane verisi tutarlı mı, derslere bağlanan videolar var mı, sayfaya ve önbelleğe giriyor mu.
// test.js sonunda run(ok) ile çağrılır.

function run(ok){
  const fs = require('fs'), path = require('path');
  const rd = f => fs.readFileSync(path.join(__dirname, f), 'utf8');
  const V = require('./videos.js');
  const D = require('./lessons.js');
  const L = require('./learn.js');
  console.log('\n[47] Videolar');
  const ids = V.VIDEOS.map(v => v.id);
  ok(ids.length >= 100 && new Set(ids).size === ids.length && ids.every(id => /^[\w-]{11}$/.test(id)), `${ids.length} video, kimlikler tekil ve YouTube biciminde`);
  const cats = V.VIDEO_CATS.map(c => c.id);
  const bad = V.VIDEOS.filter(v => !v.title || !/^\d+:\d\d$/.test(v.dur) || !cats.includes(v.cat) || (v.by && !V.VIDEO_BY[v.by]) || (v.makam && !L.makamById(v.makam)));
  ok(!bad.length, 'her videonun basligi, suresi, gecerli kategorisi, calani ve makami var', bad.map(v => v.id).join());
  ok(cats.every(c => V.VIDEOS.some(v => v.cat === c)), 'her kategoride video var');
  const lessonIds = D.LESSONS.map(l => l.id);
  const badL = Object.entries(V.LESSON_VIDEOS).filter(([id, vs]) => !lessonIds.includes(id) || !vs.length || vs.length > 3 || vs.some(x => !V.videoById(x)) || new Set(vs).size !== vs.length);
  ok(!badL.length, 'derslere 1-3 video baglaniyor, ders ve videolar var', badL.map(x => x[0]).join());
  const mkLessons = D.LESSONS.filter(l => l.unit === 'makam' && V.VIDEOS.some(v => v.makam === l.makam));
  ok(mkLessons.every(l => V.videosForLesson(l.id).length), 'videosu olan her makam dersinde video kutusu var', mkLessons.filter(l => !V.videosForLesson(l.id).length).map(l => l.id).join());
  const row = V.videoRowsHtml([V.videoById('Ityldl_Pv0c')]);
  ok(row.includes('href="https://www.youtube.com/watch?v=Ityldl_Pv0c"') && row.includes('target="_blank"') && row.includes('rel="noopener"'), 'video satiri YouTube baglantisi, yeni pencerede');
  ok(V.videoRowsHtml([{ id:'x', title:'<b>', by:'', dur:'1:00' }]).includes('&lt;b&gt;'), 'basliklar kacisli');
  const html = rd('index.html'), sw = rd('sw.js');
  ok(/lessons\.js"><\/script>\s*<script src="videos\.js">/.test(html) && sw.includes('"videos.js"') && rd('scripts/build-web.js').includes('"videos.js"'), 'videos.js sayfada (lessons.js ardindan), onbellekte ve pakette');
  ok(rd('practice.js').includes('["lessons","videos"]') && rd('lessonview.js').includes('TRAINERS.videos'), 'Videolar sekmesi Dersler grubunda');
}

module.exports = { run };
