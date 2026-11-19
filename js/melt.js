/* Lelehan cokelat + suara + maskot berjalan saat menu navigasi diklik. */
(function () {
  var root = document.documentElement, KEY = 'cbMelt', busy = false;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var snd = new Audio('assets/lelehan-coklat.mp3'); snd.preload = 'auto';

  function clear() { root.classList.remove('melt-go', 'melt-in', 'melt-out'); busy = false; }

  // Halaman tujuan: layar masih tertutup cokelat, lalu mencair hilang.
  if (root.classList.contains('melt-in')) {
    try { sessionStorage.removeItem(KEY); } catch (e) {}
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      root.classList.add('melt-out'); setTimeout(clear, 1000);
    }); });
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('.nav-links a');
    if (!a || reduce || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target && a.target !== '_self') return;
    var href = a.getAttribute('href');
    if (!href || href.charAt(0) === '#' || /^(mailto|tel|javascript):/i.test(href)) return;
    e.preventDefault();
    if (busy) return; busy = true;
    try { sessionStorage.setItem(KEY, '1'); } catch (x) {}
    root.classList.add('melt-go');
    try { snd.currentTime = 0; var p = snd.play(); if (p && p.catch) p.catch(function () {}); } catch (x) {}
    setTimeout(function () { location.href = a.href; }, 2650);
  });

  // Tombol "kembali" dari cache browser: pastikan overlay tidak menempel.
  window.addEventListener('pageshow', function (e) { if (e.persisted) clear(); });
})();
