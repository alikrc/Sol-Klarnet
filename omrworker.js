// Nota okuyucu Worker'ı: resimden okuma arayüzü dondurmasın diye ayrı iş parçacığında yapılır. Yalnızca Çevir
// sekmesinde resim seçilince açılır (convert.js); sayfada <script> olarak yüklenmez.
// İleti: { jobId, pages:[{ data, width, height }], opts? } → { jobId, progress } … { jobId, result } ya da { jobId, error }
importScripts("core.js", "learn.js", "repertoire.js", "omrtemplates.js", "omr.js");

onmessage = e => {
  const { jobId, pages, opts } = e.data || {};
  try{
    const result = OMR.readPages(pages || [], opts || {}, (done, total) => postMessage({ jobId, progress: done/total }));
    postMessage({ jobId, result });
  }catch(err){
    postMessage({ jobId, error: String((err && err.message) || err) });
  }
};
