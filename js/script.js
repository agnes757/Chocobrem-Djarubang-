/* ==========================================================================
   CHOCOBREM DJARUBANG — script.js (JavaScript vanilla)
   Dipakai bersama oleh semua halaman. Setiap fitur memeriksa dulu apakah
   elemennya ada di halaman tersebut, jadi aman dimuat di mana saja.

   Isi:
   1. Konfigurasi & data produk (satu-satunya sumber harga)
   2. Utilitas (format Rupiah, escape HTML)
   3. Keranjang (LocalStorage)
   4. Toast / notifikasi
   5. Navigasi mobile
   6. Katalog: render kartu, filter, modal detail
   7. Halaman keranjang
   8. Halaman checkout + pesan WhatsApp
   9. FAQ accordion
  10. Lightbox testimoni
  11. Animasi muncul saat scroll
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- 1. KONFIGURASI & DATA ---------- */
  var WA_NUMBER = '6285335382335';
  var CART_KEY = 'chocobrem.cart.v1';

  // Harga resmi. Ubah di sini saja; seluruh halaman mengikuti.
  // CATATAN: foto "box-isi6-tertutup.jpg" belum diterima. Sementara foto utama
  // kotak hadiah memakai box-isi6-terbuka.jpg. Setelah file tertutup ada, taruh di
  // /assets lalu ubah `image` dan `gallery` di bawah.
  var PRODUCTS = [
    {
      id: 'milk', filter: 'milk', tag: 'Milk', tagClass: 'milk',
      name: 'Chocobrem Djarubang Milk Chocolate', variant: 'Milk Chocolate',
      weight: '100 gram', price: 15000, unit: 'pcs',
      image: 'assets/milk.jpg', gallery: ['assets/milk.jpg'],
      desc: 'Brem khas Madiun dengan lapisan cokelat susu. Pilihan varian rasa cokelat susu dari Chocobrem Djarubang.'
    },
    {
      id: 'dark', filter: 'dark', tag: 'Dark', tagClass: 'dark',
      name: 'Chocobrem Djarubang Dark Chocolate', variant: 'Dark Chocolate',
      weight: '100 gram', price: 15000, unit: 'pcs',
      image: 'assets/dark.jpg', gallery: ['assets/dark.jpg'],
      desc: 'Brem khas Madiun dengan lapisan cokelat hitam. Pilihan varian dengan karakter rasa dark chocolate.'
    },
    {
      id: 'white', filter: 'white', tag: 'White', tagClass: 'white',
      name: 'Chocobrem Djarubang White Chocolate', variant: 'White Chocolate',
      weight: '100 gram', price: 15000, unit: 'pcs',
      image: 'assets/white.jpg', gallery: ['assets/white.jpg'],
      desc: 'Brem khas Madiun dengan lapisan cokelat putih yang creamy. Pilihan varian white chocolate.'
    },
    {
      id: 'strawberry', filter: 'strawberry', tag: 'Strawberry', tagClass: 'strawberry',
      name: 'Chocobrem Djarubang Strawberry', variant: 'Strawberry',
      weight: '100 gram', price: 15000, unit: 'pcs',
      image: 'assets/strawberry.jpg', gallery: ['assets/strawberry.jpg'],
      desc: 'Brem khas Madiun dengan lapisan cokelat berpadu sentuhan rasa stroberi.'
    },
    {
      id: 'kotak-hadiah', filter: 'kotak', tag: 'Kotak Hadiah', tagClass: 'gift',
      name: 'Kotak Hadiah Chocobrem Djarubang', variant: 'Kotak Hadiah (isi 6 pcs)',
      weight: 'Isi 6 pcs · @39 gram', price: 35000, unit: 'kotak',
      extra: [['Isi', '6 pcs'], ['Berat per pcs', '39 gram'], ['Berat total', '245 gram']],
      image: 'assets/box-isi6-terbuka.jpg', gallery: ['assets/box-isi6-terbuka.jpg'],
      desc: 'Kotak berisi 6 pcs Chocobrem Djarubang, pilihan untuk dihadiahkan kepada keluarga, teman, maupun orang terdekat.'
    }
  ];
  var FILTERS = [
    ['semua', 'Semua'], ['milk', 'Milk Chocolate'], ['dark', 'Dark Chocolate'],
    ['white', 'White Chocolate'], ['strawberry', 'Strawberry'], ['kotak', 'Kotak Hadiah']
  ];

  /* ---------- 2. UTILITAS ---------- */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function rupiah(n) { return 'Rp' + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function byId(id) { for (var i = 0; i < PRODUCTS.length; i++) if (PRODUCTS[i].id === id) return PRODUCTS[i]; return null; }
  function clampQty(n) { n = parseInt(n, 10); if (isNaN(n) || n < 1) return 1; return n > 99 ? 99 : n; }

  var ICON = {
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h2.2l2.1 10.2a2 2 0 0 0 2 1.6h7.5a2 2 0 0 0 1.9-1.5L20.5 8H6.2"/><circle cx="10" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 1.8h6a2 2 0 0 0 2-1.8L18 7M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    wa: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.95L2 22l5.2-1.5A9.9 9.9 0 1 0 12.04 2zm0 1.8a8.1 8.1 0 1 1-4.3 15l-.3-.2-3 .9.9-2.9-.2-.3A8.1 8.1 0 0 1 12.04 3.8zM8.6 7.6c-.2 0-.5.1-.7.3-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.2 5 4.4 2.5 1 3 .8 3.5.7.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.2-.3-.3-.6-.4l-1.9-.9c-.3-.1-.5-.1-.7.1l-.9 1.1c-.2.2-.3.2-.6.1-.3-.2-1.2-.5-2.3-1.4-.8-.8-1.4-1.7-1.5-2-.2-.3 0-.4.1-.6l.5-.5.3-.5c.1-.2 0-.4 0-.5l-.9-2.1c-.2-.5-.4-.5-.6-.5h-.6z"/></svg>'
  };

  /* ---------- 3. KERANJANG (LocalStorage) ---------- */
  var Cart = {
    read: function () {
      try {
        var raw = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
        if (!Array.isArray(raw)) return [];
        return raw.filter(function (it) { return it && byId(it.id); })
          .map(function (it) { return { id: it.id, qty: clampQty(it.qty) }; });
      } catch (e) { return []; }
    },
    write: function (items) {
      try { localStorage.setItem(CART_KEY, JSON.stringify(items)); } catch (e) { /* mode privat: abaikan */ }
      Cart.refresh();
    },
    add: function (id, qty) {
      var items = Cart.read(), found = false;
      qty = clampQty(qty);
      items.forEach(function (it) { if (it.id === id) { it.qty = clampQty(it.qty + qty); found = true; } });
      if (!found) items.push({ id: id, qty: qty });
      Cart.write(items);
    },
    setQty: function (id, qty) {
      var items = Cart.read();
      items.forEach(function (it) { if (it.id === id) it.qty = clampQty(qty); });
      Cart.write(items);
    },
    remove: function (id) { Cart.write(Cart.read().filter(function (it) { return it.id !== id; })); },
    clear: function () { Cart.write([]); },
    count: function () { return Cart.read().reduce(function (s, it) { return s + it.qty; }, 0); },
    lines: function () {
      return Cart.read().map(function (it) {
        var p = byId(it.id);
        return { product: p, qty: it.qty, subtotal: p.price * it.qty };
      });
    },
    total: function () { return Cart.lines().reduce(function (s, l) { return s + l.subtotal; }, 0); },
    refresh: function () {
      var n = Cart.count();
      $$('[data-cart-count]').forEach(function (el) {
        el.textContent = n > 99 ? '99+' : String(n);
        el.setAttribute('data-zero', n === 0 ? 'true' : 'false');
      });
      $$('.cart-link').forEach(function (a) { a.setAttribute('aria-label', 'Keranjang, ' + n + ' item'); });
    }
  };
  function bumpCart() {
    var el = $('.cart-link'); if (!el) return;
    el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
  }
  window.addEventListener('storage', function (e) { if (e.key === CART_KEY) { Cart.refresh(); if (typeof renderCartPage === 'function') renderCartPage(); if (typeof renderCheckout === 'function') renderCheckout(); } });

  /* ---------- 4. TOAST ---------- */
  var toastWrap;
  function toast(message, linkHref, linkText) {
    if (!toastWrap) {
      toastWrap = document.createElement('div');
      toastWrap.className = 'toast-wrap';
      toastWrap.setAttribute('role', 'status');
      toastWrap.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastWrap);
    }
    var t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = '<span class="toast-ic">' + ICON.check + '</span><span>' + esc(message) + '</span>' +
      (linkHref ? '<a href="' + esc(linkHref) + '">' + esc(linkText || 'Lihat') + '</a>' : '');
    toastWrap.appendChild(t);
    while (toastWrap.children.length > 3) toastWrap.removeChild(toastWrap.firstChild);
    setTimeout(function () {
      t.classList.add('is-out');
      setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 260);
    }, 2800);
  }
  function addToCartWithFeedback(id, qty) {
    var p = byId(id); if (!p) return;
    qty = clampQty(qty);
    Cart.add(id, qty); bumpCart();
    toast(qty + ' × ' + p.name + ' ditambahkan', 'keranjang.html', 'Lihat keranjang');
  }

  /* ---------- 5. NAVIGASI MOBILE ---------- */
  function initNav() {
    var nav = $('.site-nav'), btn = $('.nav-toggle');
    if (!nav || !btn) return;
    function setOpen(open) {
      nav.classList.toggle('nav-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
    }
    btn.addEventListener('click', function () { setOpen(!nav.classList.contains('nav-open')); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
    document.addEventListener('click', function (e) { if (!nav.contains(e.target)) setOpen(false); });
    window.addEventListener('resize', function () { if (window.innerWidth > 1120) setOpen(false); });
  }

  /* ---------- 6. KATALOG ---------- */
  function cardHTML(p, opts) {
    opts = opts || {};
    var meta = p.id === 'kotak-hadiah' ? p.weight : p.weight + ' · ' + p.variant;
    return '<article class="pcard reveal" data-id="' + p.id + '" data-filter="' + p.filter + '">' +
      '<button type="button" class="pcard-media" data-detail="' + p.id + '" aria-label="Lihat detail ' + esc(p.name) + '">' +
      '<span class="ptag ptag--' + p.tagClass + '">' + esc(p.tag) + '</span>' +
      '<img src="' + p.image + '" alt="Kemasan ' + esc(p.name) + '" loading="lazy" width="896" height="1200"></button>' +
      '<div class="pcard-body">' +
      '<h3 class="pcard-name">' + esc(p.name) + '</h3>' +
      '<p class="pcard-meta">' + esc(meta) + '</p>' +
      '<p class="pcard-price">' + rupiah(p.price) + ' <small>/ ' + p.unit + '</small></p>' +
      '<div class="pcard-actions">' +
      (opts.simple
        ? '<a class="btn btn-ghost btn-sm" href="menu.html?detail=' + p.id + '">Lihat Produk</a>'
        : '<div class="pcard-row">' + qtyHTML(p.id) +
          '<button type="button" class="btn btn-ghost btn-sm" data-detail="' + p.id + '">Detail</button></div>' +
          '<button type="button" class="btn btn-primary btn-sm" data-add="' + p.id + '">' + ICON.cart + 'Tambah ke Keranjang</button>') +
      '</div></div></article>';
  }
  function qtyHTML(id) {
    return '<div class="qty" role="group" aria-label="Jumlah">' +
      '<button type="button" data-qty-minus aria-label="Kurangi jumlah">−</button>' +
      '<input type="number" inputmode="numeric" min="1" max="99" value="1" aria-label="Jumlah" data-qty-input>' +
      '<button type="button" data-qty-plus aria-label="Tambah jumlah">+</button></div>';
  }
  function bindQty(root) {
    root.addEventListener('click', function (e) {
      var m = e.target.closest('[data-qty-minus]'), p = e.target.closest('[data-qty-plus]');
      if (!m && !p) return;
      var inp = (m || p).parentNode.querySelector('[data-qty-input]');
      inp.value = clampQty(parseInt(inp.value, 10) + (p ? 1 : -1));
    });
    root.addEventListener('change', function (e) {
      if (e.target.matches('[data-qty-input]')) e.target.value = clampQty(e.target.value);
    });
  }

  function initFeatured() {
    var box = $('#featured-products'); if (!box) return;
    box.innerHTML = ['milk', 'strawberry', 'kotak-hadiah'].map(function (id) { return cardHTML(byId(id), { simple: true }); }).join('');
  }

  var modal, modalLast;
  function buildModal() {
    modal = document.createElement('div');
    modal.className = 'modal'; modal.id = 'product-modal';
    modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true'); modal.setAttribute('aria-labelledby', 'modal-title');
    modal.innerHTML = '<div class="modal-panel"><button type="button" class="modal-close" aria-label="Tutup detail">×</button>' +
      '<div class="modal-gallery"><div class="modal-main"><img alt="" id="modal-img"></div><div class="modal-thumbs" id="modal-thumbs"></div></div>' +
      '<div class="modal-info"><span class="ptag" id="modal-tag" style="position:static;align-self:flex-start"></span>' +
      '<h2 id="modal-title"></h2><p id="modal-desc" class="lead" style="margin:0"></p>' +
      '<dl class="spec-list" id="modal-specs"></dl>' +
      '<div class="modal-buy"><div class="qty" role="group" aria-label="Jumlah"><button type="button" data-qty-minus aria-label="Kurangi jumlah">−</button><input type="number" inputmode="numeric" min="1" max="99" value="1" aria-label="Jumlah" data-qty-input><button type="button" data-qty-plus aria-label="Tambah jumlah">+</button></div>' +
      '<button type="button" class="btn btn-primary" id="modal-add">' + ICON.cart + 'Tambah ke Keranjang</button></div></div></div>';
    document.body.appendChild(modal);
    bindQty(modal);
    modal.addEventListener('click', function (e) { if (e.target === modal || e.target.closest('.modal-close')) closeModal(); });
    modal.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var f = $$('button, input, a[href]', modal).filter(function (x) { return !x.disabled && x.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal(); });
    $('#modal-add').addEventListener('click', function () {
      var id = modal.getAttribute('data-id');
      addToCartWithFeedback(id, $('[data-qty-input]', modal).value);
      closeModal();
    });
  }
  function openModal(id, trigger) {
    var p = byId(id); if (!p) return;
    if (!modal) buildModal();
    modalLast = trigger || document.activeElement;
    modal.setAttribute('data-id', id);
    var tag = $('#modal-tag'); tag.textContent = p.tag; tag.className = 'ptag ptag--' + p.tagClass;
    $('#modal-title').textContent = p.name;
    $('#modal-desc').textContent = p.desc;
    var specs = p.extra ? p.extra.slice() : [['Berat', p.weight]];
    if (!p.extra) specs.unshift(['Varian', p.variant]);
    specs.push(['Satuan', p.unit]);
    specs.push(['Harga', rupiah(p.price) + ' / ' + p.unit]);
    $('#modal-specs').innerHTML = specs.map(function (s) { return '<div><dt>' + esc(s[0]) + '</dt><dd>' + esc(s[1]) + '</dd></div>'; }).join('');
    var img = $('#modal-img'), thumbs = $('#modal-thumbs');
    function show(i) { img.src = p.gallery[i]; img.alt = 'Foto ' + p.name; $$('button', thumbs).forEach(function (b, k) { b.setAttribute('aria-current', k === i ? 'true' : 'false'); }); }
    thumbs.innerHTML = p.gallery.length > 1 ? p.gallery.map(function (g, i) { return '<button type="button" aria-label="Foto ' + (i + 1) + '"><img src="' + g + '" alt=""></button>'; }).join('') : '';
    $$('button', thumbs).forEach(function (b, i) { b.addEventListener('click', function () { show(i); }); });
    show(0);
    $('[data-qty-input]', modal).value = 1;
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    $('.modal-close', modal).focus();
  }
  function closeModal() {
    if (!modal) return;
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
    if (modalLast && modalLast.focus) modalLast.focus();
    if (/[?&]detail=/.test(location.search) && history.replaceState) history.replaceState(null, '', location.pathname);
  }

  function initCatalog() {
    var grid = $('#catalog-grid'); if (!grid) return;
    var bar = $('#filter-bar');
    grid.innerHTML = PRODUCTS.map(function (p) { return cardHTML(p); }).join('');
    bindQty(grid);
    bar.innerHTML = FILTERS.map(function (f, i) { return '<button type="button" class="chip-btn" data-f="' + f[0] + '" aria-pressed="' + (i === 0) + '">' + f[1] + '</button>'; }).join('');
    function apply(f) {
      var shown = 0;
      $$('.pcard', grid).forEach(function (c) {
        var ok = f === 'semua' || c.getAttribute('data-filter') === f;
        c.hidden = !ok; if (ok) { shown++; c.classList.add('is-in'); }
      });
      $$('.chip-btn', bar).forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-f') === f ? 'true' : 'false'); });
      var live = $('#filter-count'); if (live) live.textContent = shown + ' produk ditampilkan';
    }
    bar.addEventListener('click', function (e) { var b = e.target.closest('.chip-btn'); if (b) apply(b.getAttribute('data-f')); });
    grid.addEventListener('click', function (e) {
      var d = e.target.closest('[data-detail]'), a = e.target.closest('[data-add]');
      if (d) openModal(d.getAttribute('data-detail'), d);
      if (a) {
        var card = a.closest('.pcard');
        addToCartWithFeedback(a.getAttribute('data-add'), $('[data-qty-input]', card).value);
        $('[data-qty-input]', card).value = 1;
      }
    });
    var m = location.search.match(/[?&]detail=([\w-]+)/);
    if (m && byId(m[1])) setTimeout(function () { openModal(m[1]); }, 120);
    var fm = location.search.match(/[?&]filter=([\w-]+)/);
    if (fm) apply(fm[1]);
  }

  /* ---------- 7. HALAMAN KERANJANG ---------- */
  var renderCartPage = null;
  function initCartPage() {
    var host = $('#cart-root'); if (!host) return;
    renderCartPage = function () {
      var lines = Cart.lines();
      if (!lines.length) {
        host.innerHTML = '<div class="empty-state"><img src="assets/djarubang-maskot.png" alt="" width="130"><h2>Keranjangmu masih kosong</h2>' +
          '<p>Yuk pilih Chocobrem favoritmu dulu di katalog, lalu tambahkan ke keranjang.</p>' +
          '<a class="btn btn-primary" href="menu.html">Lihat Katalog Produk</a></div>';
        return;
      }
      var n = Cart.count();
      host.innerHTML = '<div class="cart-layout"><div><a class="back-link" href="menu.html"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>Kembali ke katalog</a>' +
        '<div class="cart-items">' + lines.map(function (l) {
          var p = l.product;
          return '<article class="citem" data-id="' + p.id + '"><div class="citem-img"><img src="' + p.image + '" alt="' + esc(p.name) + '"></div>' +
            '<div><h3>' + esc(p.name) + '</h3><p class="citem-price">' + rupiah(p.price) + ' / ' + p.unit + '</p>' +
            '<div class="citem-ctl"><div class="qty" role="group" aria-label="Jumlah ' + esc(p.name) + '">' +
            '<button type="button" data-minus aria-label="Kurangi jumlah">−</button>' +
            '<input type="number" inputmode="numeric" min="1" max="99" value="' + l.qty + '" aria-label="Jumlah" data-input>' +
            '<button type="button" data-plus aria-label="Tambah jumlah">+</button></div></div></div>' +
            '<div class="citem-side"><span class="citem-total">' + rupiah(l.subtotal) + '</span>' +
            '<button type="button" class="icon-btn" data-remove aria-label="Hapus ' + esc(p.name) + ' dari keranjang">' + ICON.trash + '</button></div></article>';
        }).join('') + '</div></div>' +
        '<aside class="summary" aria-label="Ringkasan belanja"><h2>Ringkasan Belanja</h2>' +
        '<div class="sum-line"><span>Jumlah item</span><span>' + n + ' item</span></div>' +
        lines.map(function (l) { return '<div class="sum-line"><span>' + esc(l.product.variant) + ' × ' + l.qty + '</span><span>' + rupiah(l.subtotal) + '</span></div>'; }).join('') +
        '<div class="sum-total"><span>Total belanja</span><span>' + rupiah(Cart.total()) + '</span></div>' +
        '<a class="btn btn-primary btn-block" href="checkout.html">Lanjut ke Checkout</a>' +
        '<p class="summary-note">Ongkos kirim, pembayaran, dan ketersediaan stok dikonfirmasi langsung oleh admin melalui WhatsApp.</p></aside></div>';
    };
    host.addEventListener('click', function (e) {
      var row = e.target.closest('.citem'); if (!row) return;
      var id = row.getAttribute('data-id'), cur = Cart.read().filter(function (i) { return i.id === id; })[0];
      if (!cur) return;
      if (e.target.closest('[data-plus]')) { Cart.setQty(id, cur.qty + 1); renderCartPage(); }
      else if (e.target.closest('[data-minus]')) { if (cur.qty > 1) { Cart.setQty(id, cur.qty - 1); renderCartPage(); } }
      else if (e.target.closest('[data-remove]')) { var p = byId(id); Cart.remove(id); renderCartPage(); toast(p.variant + ' dihapus dari keranjang'); }
    });
    host.addEventListener('change', function (e) {
      if (!e.target.matches('[data-input]')) return;
      Cart.setQty(e.target.closest('.citem').getAttribute('data-id'), e.target.value); renderCartPage();
    });
    renderCartPage();
  }

  /* ---------- 8. CHECKOUT + WHATSAPP ---------- */
  var renderCheckout = null;
  function buildWhatsAppMessage(data) {
    var lines = Cart.lines(), out = [];
    out.push('Halo Chocobrem, saya ingin melakukan pemesanan.', '');
    out.push('Nama: ' + data.nama);
    out.push('Nomor WhatsApp: ' + data.hp);
    out.push('Alamat: ' + data.alamat, '');
    out.push('Detail pesanan:');
    lines.forEach(function (l) {
      out.push('- ' + l.product.name);
      out.push('  Jumlah: ' + l.qty + ' ' + l.product.unit);
      out.push('  Harga: ' + rupiah(l.product.price) + ' x ' + l.qty + ' = ' + rupiah(l.subtotal));
    });
    out.push('', 'Total pesanan: ' + rupiah(Cart.total()), '');
    out.push('Catatan: ' + (data.catatan || '-'), '', 'Terima kasih.');
    return out.join('\n');
  }
  function waLink(text) { return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text); }

  function initCheckout() {
    var host = $('#checkout-root'); if (!host) return;
    renderCheckout = function () {
      var lines = Cart.lines();
      if (!lines.length) {
        host.innerHTML = '<div class="empty-state"><img src="assets/djarubang-maskot.png" alt="" width="130"><h2>Belum ada produk untuk dipesan</h2>' +
          '<p>Keranjangmu kosong. Pilih produk di katalog terlebih dulu, ya.</p><a class="btn btn-primary" href="menu.html">Lihat Katalog Produk</a></div>';
        return;
      }
      // pertahankan isian jika dirender ulang
      var keep = {};
      ['nama', 'hp', 'alamat', 'catatan'].forEach(function (k) { var el = $('#f-' + k); if (el) keep[k] = el.value; });
      host.innerHTML = '<div class="cart-layout"><div><a class="back-link" href="keranjang.html"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>Kembali ke keranjang</a>' +
        '<form class="form-card" id="checkout-form" novalidate><h2>Data Pemesan</h2>' +
        field('nama', 'Nama pelanggan', 'text', 'Nama lengkap', 'name', 'Nama wajib diisi.') +
        field('hp', 'Nomor WhatsApp', 'tel', 'Contoh: 081234567890', 'tel', 'Masukkan nomor yang valid: diawali 08, hanya angka, maksimal 13 angka.', 'Admin akan menghubungi nomor ini untuk konfirmasi.') +
        '<div class="field" id="g-alamat"><label for="f-alamat">Alamat pengiriman</label><textarea id="f-alamat" name="alamat" autocomplete="street-address" placeholder="Jalan, nomor, kelurahan, kecamatan, kota, kode pos" required></textarea><p class="field-error" id="e-alamat">Alamat pengiriman wajib diisi.</p></div>' +
        '<div class="field" id="g-catatan"><label for="f-catatan">Catatan pesanan <small>(opsional)</small></label><textarea id="f-catatan" name="catatan" placeholder="Contoh: mohon dikemas aman untuk hadiah"></textarea></div>' +
        '<button type="submit" class="btn btn-primary btn-block">' + ICON.wa + 'Pesan melalui WhatsApp</button>' +
        '<div class="alert" id="wa-alert" role="status"></div></form></div>' +
        '<aside class="summary" aria-label="Ringkasan pesanan"><h2>Ringkasan Pesanan</h2><ul class="summary-items">' +
        lines.map(function (l) {
          return '<li><span>' + esc(l.product.name) + '<small>' + l.qty + ' ' + l.product.unit + ' × ' + rupiah(l.product.price) + '</small></span><b>' + rupiah(l.subtotal) + '</b></li>';
        }).join('') + '</ul>' +
        '<div class="sum-total"><span>Total belanja</span><span>' + rupiah(Cart.total()) + '</span></div>' +
        '<p class="summary-note">Website ini tidak memproses pembayaran. Pesanan dikirim ke admin lewat WhatsApp; pembayaran, stok, dan pengiriman dikonfirmasi langsung oleh admin.</p></aside></div>';
      Object.keys(keep).forEach(function (k) { $('#f-' + k).value = keep[k]; });
      var hpEl = $('#f-hp'); hpEl.setAttribute('maxlength', '13'); hpEl.setAttribute('inputmode', 'numeric');
      hpEl.addEventListener('input', function () { hpEl.value = hpEl.value.replace(/\D/g, '').slice(0, 13); });
      $('#checkout-form').addEventListener('submit', onSubmit);
      $$('#checkout-form input, #checkout-form textarea').forEach(function (el) {
        el.addEventListener('input', function () { var g = el.closest('.field'); if (g) g.classList.remove('has-error'); });
      });
    };
    function field(key, label, type, ph, ac, err, hint) {
      return '<div class="field" id="g-' + key + '"><label for="f-' + key + '">' + label + '</label>' +
        '<input id="f-' + key + '" name="' + key + '" type="' + type + '" autocomplete="' + ac + '" placeholder="' + ph + '" required>' +
        (hint ? '<p class="field-hint">' + hint + '</p>' : '') + '<p class="field-error" id="e-' + key + '">' + err + '</p></div>';
    }
    function onSubmit(e) {
      e.preventDefault();
      var d = { nama: $('#f-nama').value.trim(), hp: $('#f-hp').value.trim(), alamat: $('#f-alamat').value.trim(), catatan: $('#f-catatan').value.trim() };
      var digits = d.hp.replace(/[^\d]/g, '');
      var bad = { nama: !d.nama, hp: !/^08\d{7,11}$/.test(d.hp), alamat: !d.alamat };
      var firstBad = null;
      ['nama', 'hp', 'alamat'].forEach(function (k) {
        $('#g-' + k).classList.toggle('has-error', bad[k]);
        if (bad[k] && !firstBad) firstBad = $('#f-' + k);
      });
      if (firstBad) { firstBad.focus(); return; }
      if (!Cart.lines().length) { renderCheckout(); return; }
      var url = waLink(buildWhatsAppMessage(d));
      var w = window.open(url, '_blank', 'noopener');
      var al = $('#wa-alert');
      al.innerHTML = 'WhatsApp dibuka dengan pesan pesananmu. Pesanan baru dianggap diterima setelah admin membalas dan mengonfirmasi. ' +
        'Jika WhatsApp tidak terbuka, <a href="' + esc(url) + '" target="_blank" rel="noopener">klik di sini</a>.';
      al.classList.add('is-show');
      if (!w) { /* popup diblokir: tautan manual sudah ditampilkan */ }
    }
    renderCheckout();
  }

  /* ---------- 9. FAQ ACCORDION ---------- */
  function initFaq() {
    var items = $$('.faq-item'); if (!items.length) return;
    function setOpen(item, open) {
      item.classList.toggle('is-open', open);
      $('.faq-q', item).setAttribute('aria-expanded', open ? 'true' : 'false');
      var inner = $('.faq-a > div', item);
      if (open) inner.removeAttribute('inert'); else inner.setAttribute('inert', '');
    }
    items.forEach(function (item, i) {
      var q = $('.faq-q', item), a = $('.faq-a', item);
      q.id = q.id || 'faq-q' + i; a.id = a.id || 'faq-a' + i;
      q.setAttribute('aria-controls', a.id); a.setAttribute('role', 'region'); a.setAttribute('aria-labelledby', q.id);
      setOpen(item, false);
      q.addEventListener('click', function () {
        var willOpen = !item.classList.contains('is-open');
        items.forEach(function (o) { if (o !== item) setOpen(o, false); });
        setOpen(item, willOpen);
      });
    });
    if (location.hash) { var t = $(location.hash); if (t && t.classList.contains('faq-item')) setOpen(t, true); }
  }

  /* ---------- 10. LIGHTBOX ---------- */
  function initLightbox() {
    var triggers = $$('[data-lightbox]'); if (!triggers.length) return;
    var lb = document.createElement('div');
    lb.className = 'lightbox'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Foto ulasan diperbesar');
    lb.innerHTML = '<button type="button" class="lb-btn lb-close" aria-label="Tutup">×</button>' +
      '<button type="button" class="lb-btn lb-prev" aria-label="Sebelumnya">‹</button><img alt="">' +
      '<button type="button" class="lb-btn lb-next" aria-label="Berikutnya">›</button><span class="lb-count"></span>';
    document.body.appendChild(lb);
    var img = $('img', lb), count = $('.lb-count', lb), idx = 0, last = null;
    var list = triggers.map(function (t) { return { src: t.getAttribute('data-lightbox'), alt: t.getAttribute('data-alt') || '' }; });
    function show(i) {
      idx = (i + list.length) % list.length;
      img.src = list[idx].src; img.alt = list[idx].alt; count.textContent = (idx + 1) + ' / ' + list.length;
    }
    function open(i, t) { last = t; show(i); lb.classList.add('is-open'); document.body.style.overflow = 'hidden'; $('.lb-close', lb).focus(); }
    function close() { lb.classList.remove('is-open'); document.body.style.overflow = ''; if (last) last.focus(); }
    triggers.forEach(function (t, i) { t.addEventListener('click', function () { open(i, t); }); });
    lb.addEventListener('click', function (e) {
      if (e.target === lb || e.target.closest('.lb-close')) close();
      else if (e.target.closest('.lb-prev')) show(idx - 1);
      else if (e.target.closest('.lb-next')) show(idx + 1);
    });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') close(); else if (e.key === 'ArrowLeft') show(idx - 1); else if (e.key === 'ArrowRight') show(idx + 1);
    });
    var sx = null;
    lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) { if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1)); sx = null; });
  }

  /* ---------- 11. REVEAL SAAT SCROLL ---------- */
  function initReveal() {
    var els = $$('.reveal:not(.is-in)');
    if (!('IntersectionObserver' in window)) { els.forEach(function (el) { el.classList.add('is-in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    els.forEach(function (el, i) { el.style.transitionDelay = (i % 4) * 70 + 'ms'; io.observe(el); });
  }

  /* ---------- INIT ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    Cart.refresh();
    initNav();
    initFeatured();
    initCatalog();
    initCartPage();
    initCheckout();
    initFaq();
    initLightbox();
    initReveal();
  });
  window.Chocobrem = { Cart: Cart, PRODUCTS: PRODUCTS, rupiah: rupiah, buildWhatsAppMessage: buildWhatsAppMessage };
})();
