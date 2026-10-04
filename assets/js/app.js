/* ==========================================================
   Umra Mandiri — app.js
   Semua konten diambil dari data/packages.json.
   Tidak ada library eksternal.
   ========================================================== */
(() => {
  'use strict';

  const DATA_URL = 'data/packages.json';
  const state = { pax: 2, nightsMk: 5, nightsMd: 4, hotelMk: null, hotelMd: null, services: new Set() };
  let DATA = null;

  /* ---------- Util ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const rupiah = (n) => 'Rp ' + Math.round(n).toLocaleString('id-ID');

  function el(tag, attrs = {}, ...kids) {
    const node = document.createElement(tag);
    for (const [key, val] of Object.entries(attrs)) {
      if (val === false || val == null) continue;
      if (key === 'class') node.className = val;
      else if (key === 'text') node.textContent = val;
      else if (key.startsWith('on')) node.addEventListener(key.slice(2), val);
      else node.setAttribute(key, val === true ? '' : val);
    }
    kids.flat().forEach((kid) => {
      if (kid == null || kid === false) return;
      node.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
    });
    return node;
  }
  const clear = (node) => { while (node.firstChild) node.removeChild(node.firstChild); };

  const hotelById = (id) => DATA.hotels.find((h) => h.id === id);
  const serviceById = (id) => DATA.services.find((s) => s.id === id);
  const hotelsIn = (city) => DATA.hotels.filter((h) => h.city === city);
  const unitLabel = (unit) => (unit === 'per_group' ? 'per rombongan' : 'per orang');
  const stars = (n) => '★'.repeat(n);

  function waLink(text) {
    const number = String(DATA.site.whatsapp || '').replace(/\D/g, '');
    const base = 'https://wa.me/' + number;
    return text ? base + '?text=' + encodeURIComponent(text) : base;
  }

  /* ---------- Hitung biaya ---------- */
  function computeTrip({ pax, nightsMk, nightsMd, hotelMk, hotelMd, services }) {
    const lines = [];
    const mk = hotelById(hotelMk);
    const md = hotelById(hotelMd);

    if (mk && nightsMk > 0) {
      lines.push({
        label: `${mk.name}, ${nightsMk} malam × ${pax} orang`,
        amount: mk.pricePerPersonNight * nightsMk * pax
      });
    }
    if (md && nightsMd > 0) {
      lines.push({
        label: `${md.name}, ${nightsMd} malam × ${pax} orang`,
        amount: md.pricePerPersonNight * nightsMd * pax
      });
    }
    [...services].forEach((id) => {
      const svc = serviceById(id);
      if (!svc) return;
      if (svc.unit === 'per_group') {
        lines.push({ label: `${svc.name} (per rombongan)`, amount: svc.price });
      } else {
        lines.push({ label: `${svc.name} × ${pax} orang`, amount: svc.price * pax });
      }
    });

    const total = lines.reduce((sum, l) => sum + l.amount, 0);
    return { lines, total };
  }

  function packageTrip(pkg, pax) {
    return computeTrip({
      pax,
      nightsMk: pkg.nightsMakkah,
      nightsMd: pkg.nightsMadinah,
      hotelMk: pkg.hotelMakkah,
      hotelMd: pkg.hotelMadinah,
      services: new Set(pkg.services)
    });
  }

  function packagePerPerson(pkg) {
    const pax = DATA.site.defaultQuotePax || 4;
    const { total } = packageTrip(pkg, pax);
    return Math.max(0, total / pax - (pkg.discountPerPerson || 0));
  }

  /* ---------- Situs: brand, kontak, hero ---------- */
  function applySite() {
    const s = DATA.site;
    document.querySelectorAll('[data-brand]').forEach((n) => { n.textContent = s.brand; });
    document.querySelectorAll('[data-wa-link]').forEach((a) => {
      a.href = waLink(`Assalamu'alaikum ${s.brand}, saya ingin bertanya tentang umrah mandiri.`);
    });
    $('#hero-title').textContent = s.heroTitle;
    $('#hero-text').textContent = s.heroText;
    const points = $('#hero-points');
    clear(points);
    (s.heroPoints || []).forEach((p) => points.append(el('li', { text: p })));
    $('#year').textContent = new Date().getFullYear();
    if (s.license) $('#license').textContent = s.license;
  }

  function renderSteps() {
    const list = $('#steps');
    clear(list);
    (DATA.site.steps || []).forEach((step) => {
      list.append(el('li', {}, el('h3', { text: step.title }), el('p', { text: step.text })));
    });
  }

  function renderContact() {
    const s = DATA.site;
    const list = $('#contact-list');
    clear(list);
    const add = (term, value) => {
      if (!value) return;
      list.append(el('dt', { text: term }), el('dd', {}, value));
    };
    add('WhatsApp', el('a', { href: waLink(), target: '_blank', rel: 'noopener', text: '+' + String(s.whatsapp).replace(/\D/g, '') }));
    add('Email', el('a', { href: 'mailto:' + s.email, text: s.email }));
    add('Jam layanan', s.serviceHours);
    add('Alamat', s.address);
    if (s.instagram) {
      add('Instagram', el('a', { href: s.instagram, target: '_blank', rel: 'noopener', text: s.instagram.replace(/^https?:\/\//, '') }));
    }
  }

  /* ---------- Kalkulator ---------- */
  function fillNights(select, from, to, selected) {
    clear(select);
    for (let n = from; n <= to; n++) {
      select.append(el('option', { value: n, selected: n === selected }, `${n} malam`));
    }
  }

  function fillHotels(select, city, selectedId) {
    clear(select);
    hotelsIn(city).forEach((h) => {
      select.append(el('option', { value: h.id, selected: h.id === selectedId },
        `${h.name} (${stars(h.stars)}) — ${rupiah(h.pricePerPersonNight)}/malam`));
    });
  }

  function buildCalc() {
    const mkList = hotelsIn('makkah');
    const mdList = hotelsIn('madinah');
    state.hotelMk = (mkList[1] || mkList[0] || {}).id || null;
    state.hotelMd = (mdList[1] || mdList[0] || {}).id || null;
    state.services = new Set(DATA.services.filter((s) => s.defaultOn).map((s) => s.id));

    fillNights($('#nights-mk'), 2, 14, state.nightsMk);
    fillNights($('#nights-md'), 2, 10, state.nightsMd);
    fillHotels($('#hotel-mk'), 'makkah', state.hotelMk);
    fillHotels($('#hotel-md'), 'madinah', state.hotelMd);
    renderCalcServices();

    $('#pax-minus').addEventListener('click', () => { state.pax = Math.max(1, state.pax - 1); updateCalc(); });
    $('#pax-plus').addEventListener('click', () => { state.pax = Math.min(10, state.pax + 1); updateCalc(); });
    $('#nights-mk').addEventListener('change', (e) => { state.nightsMk = Number(e.target.value); updateCalc(); });
    $('#nights-md').addEventListener('change', (e) => { state.nightsMd = Number(e.target.value); updateCalc(); });
    $('#hotel-mk').addEventListener('change', (e) => { state.hotelMk = e.target.value; updateCalc(); });
    $('#hotel-md').addEventListener('change', (e) => { state.hotelMd = e.target.value; updateCalc(); });

    updateCalc();
  }

  function renderCalcServices() {
    const box = $('#calc-services');
    clear(box);
    DATA.services.forEach((svc) => {
      const input = el('input', { type: 'checkbox', value: svc.id, checked: state.services.has(svc.id) });
      input.addEventListener('change', () => {
        if (input.checked) state.services.add(svc.id); else state.services.delete(svc.id);
        updateCalc();
      });
      box.append(el('label', { class: 'check' }, input,
        el('span', { class: 'check-text' },
          svc.name,
          el('span', { class: 'check-price', text: `${rupiah(svc.price)} ${unitLabel(svc.unit)}` }))));
    });
  }

  function syncCalcControls() {
    $('#nights-mk').value = String(state.nightsMk);
    $('#nights-md').value = String(state.nightsMd);
    $('#hotel-mk').value = state.hotelMk;
    $('#hotel-md').value = state.hotelMd;
    document.querySelectorAll('#calc-services input').forEach((i) => { i.checked = state.services.has(i.value); });
  }

  function whatsappMessage(trip) {
    const mk = hotelById(state.hotelMk);
    const md = hotelById(state.hotelMd);
    const svc = [...state.services].map((id) => (serviceById(id) || {}).name).filter(Boolean);
    return [
      `Assalamu'alaikum ${DATA.site.brand}, saya ingin menanyakan rencana umrah berikut:`,
      '',
      `Jumlah jamaah: ${state.pax} orang`,
      `Makkah: ${mk ? mk.name : '-'}, ${state.nightsMk} malam`,
      `Madinah: ${md ? md.name : '-'}, ${state.nightsMd} malam`,
      `Layanan: ${svc.length ? svc.join(', ') : 'tidak ada'}`,
      `Estimasi: ${rupiah(trip.total)}`,
      '',
      'Mohon dibantu cek ketersediaan dan harga finalnya. Terima kasih.'
    ].join('\n');
  }

  function updateCalc() {
    $('#pax-value').textContent = state.pax;
    $('#pax-minus').disabled = state.pax <= 1;
    $('#pax-plus').disabled = state.pax >= 10;

    const trip = computeTrip(state);
    $('#total').textContent = rupiah(trip.total);
    $('#per-person').textContent = state.pax > 1
      ? `Sekitar ${rupiah(trip.total / state.pax)} per orang`
      : 'Untuk 1 orang';

    const list = $('#breakdown-list');
    clear(list);
    trip.lines.forEach((l) => {
      list.append(el('li', {}, el('span', { text: l.label }), el('span', { text: rupiah(l.amount) })));
    });
    $('#send-wa').href = waLink(whatsappMessage(trip));
  }

  /* ---------- Paket ---------- */
  function renderPackages() {
    const box = $('#package-list');
    clear(box);
    DATA.packages.forEach((pkg) => {
      const mk = hotelById(pkg.hotelMakkah);
      const md = hotelById(pkg.hotelMadinah);
      const card = el('article', { class: 'card' + (pkg.popular ? ' popular' : '') },
        pkg.popular ? el('span', { class: 'badge', text: 'Paling banyak dipilih' }) : null,
        el('p', { class: 'duration', text: `${pkg.days} hari · ${pkg.nightsMakkah} malam Makkah, ${pkg.nightsMadinah} malam Madinah` }),
        el('h3', { text: pkg.name }),
        el('p', { class: 'tagline', text: pkg.tagline }),
        el('ul', { class: 'bullets' }, (pkg.highlights || []).map((t) => el('li', { text: t }))),
        el('div', {},
          el('p', { class: 'price-from', text: 'Mulai dari' }),
          el('p', { class: 'price-big' }, rupiah(packagePerPerson(pkg)), ' ', el('small', { text: '/ orang' }))),
        el('button', {
          type: 'button', class: 'btn btn-ghost',
          'aria-label': `Lihat detail paket ${pkg.name}`,
          onclick: () => openPackage(pkg.id)
        }, 'Lihat detail')
      );
      if (mk && md) card.setAttribute('data-hotels', `${mk.name} / ${md.name}`);
      box.append(card);
    });
  }

  function openPackage(id, updateHash = true) {
    const pkg = DATA.packages.find((p) => p.id === id);
    if (!pkg) return;
    const dialog = $('#pkg-dialog');
    const body = $('#dlg-body');
    clear(body);

    const quotePax = DATA.site.defaultQuotePax || 4;
    const trip = packageTrip(pkg, quotePax);
    const discount = (pkg.discountPerPerson || 0) * quotePax;
    const rows = trip.lines.map((l) => el('tr', {}, el('td', { text: l.label }), el('td', { text: rupiah(l.amount) })));
    if (discount > 0) rows.push(el('tr', {}, el('td', { text: 'Potongan paket' }), el('td', { text: '− ' + rupiah(discount) })));

    const useBtn = el('button', { type: 'button', class: 'btn', onclick: () => applyPackageToCalc(pkg) }, 'Pakai di kalkulator');
    const askBtn = el('a', {
      class: 'btn btn-ghost', target: '_blank', rel: 'noopener',
      href: waLink(`Assalamu'alaikum ${DATA.site.brand}, saya tertarik dengan paket ${pkg.name} (${pkg.days} hari). Mohon info ketersediaan dan harga finalnya.`)
    }, 'Tanya lewat WhatsApp');

    body.append(
      el('div', { class: 'dlg-head' },
        el('div', {},
          el('h3', { id: 'dlg-title', text: pkg.name }),
          el('p', { class: 'tagline', text: pkg.tagline })),
        el('button', { type: 'button', class: 'dlg-close', 'aria-label': 'Tutup', onclick: () => dialog.close() }, '×')),
      el('div', { class: 'dlg-sections' },
        el('section', {}, el('h4', { text: 'Jadwal perjalanan' }),
          el('ul', { class: 'timeline' }, (pkg.itinerary || []).map((i) =>
            el('li', {}, el('strong', { text: i.day }), el('span', { text: i.title }))))),
        el('section', {}, el('h4', { text: 'Sudah termasuk' }),
          el('ul', { class: 'plain-list' }, [
            `${pkg.nightsMakkah} malam di ${(hotelById(pkg.hotelMakkah) || {}).name || 'Makkah'}`,
            `${pkg.nightsMadinah} malam di ${(hotelById(pkg.hotelMadinah) || {}).name || 'Madinah'}`,
            ...pkg.services.map((sid) => (serviceById(sid) || {}).name).filter(Boolean)
          ].map((t) => el('li', { text: t })))),
        el('section', {}, el('h4', { text: `Rincian biaya (asumsi ${quotePax} jamaah)` }),
          el('table', { class: 'cost-table' }, el('tbody', {}, rows)),
          el('p', { class: 'price-big', style: 'margin-top:12px' }, rupiah(packagePerPerson(pkg)), ' ', el('small', { text: '/ orang' })))
      ),
      pkg.notes ? el('p', { class: 'dlg-note', text: pkg.notes }) : null,
      el('div', { class: 'dlg-actions' }, useBtn, askBtn)
    );

    if (!dialog.open) dialog.showModal();
    if (updateHash) history.replaceState(null, '', '#paket-' + pkg.id);
  }

  function applyPackageToCalc(pkg) {
    state.nightsMk = pkg.nightsMakkah;
    state.nightsMd = pkg.nightsMadinah;
    state.hotelMk = pkg.hotelMakkah;
    state.hotelMd = pkg.hotelMadinah;
    state.services = new Set(pkg.services);
    fillNights($('#nights-mk'), 2, Math.max(14, pkg.nightsMakkah), state.nightsMk);
    fillNights($('#nights-md'), 2, Math.max(10, pkg.nightsMadinah), state.nightsMd);
    syncCalcControls();
    updateCalc();
    $('#pkg-dialog').close();
    $('#rencana').scrollIntoView({ behavior: 'smooth' });
  }

  /* ---------- Hotel ---------- */
  function renderHotels(city) {
    const box = $('#hotel-list');
    clear(box);
    hotelsIn(city).forEach((h) => {
      box.append(el('article', { class: 'hotel' },
        el('div', { class: 'hotel-head' },
          el('h3', { text: h.name }),
          el('span', { class: 'stars', 'aria-label': `Bintang ${h.stars}`, text: stars(h.stars) })),
        el('p', { class: 'distance', text: h.distance }),
        el('ul', { class: 'chips' }, (h.facilities || []).map((f) => el('li', { text: f }))),
        el('p', { class: 'hotel-price' }, rupiah(h.pricePerPersonNight), ' ', el('small', { text: '/ orang / malam' }))));
    });
  }

  function wireTabs() {
    const tabs = [...document.querySelectorAll('.tabs [role="tab"]')];
    const panel = $('#hotel-list');
    const select = (tab) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
      });
      panel.setAttribute('aria-labelledby', tab.id);
      renderHotels(tab.dataset.city);
    };
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(tab));
      tab.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
        select(next);
        next.focus();
      });
    });
    renderHotels('makkah');
  }

  /* ---------- Layanan, testimoni, FAQ ---------- */
  function renderServices() {
    const list = $('#service-list');
    clear(list);
    DATA.services.forEach((s) => {
      list.append(el('li', { class: 'service' },
        el('div', {}, el('h3', { text: s.name }), el('p', { text: s.description })),
        el('p', { class: 'service-price' }, rupiah(s.price), ' ', el('small', { text: unitLabel(s.unit) }))));
    });
  }

  function renderTestimonials() {
    const t = DATA.testimonials;
    const section = $('#testimoni');
    if (!t || !t.enabled || !(t.items || []).length) { section.hidden = true; return; }
    section.hidden = false;
    const box = $('#quote-list');
    clear(box);
    t.items.forEach((q) => {
      box.append(el('blockquote', { class: 'quote', style: 'margin:0' },
        el('p', { text: q.text }),
        el('footer', { text: [q.name, q.city].filter(Boolean).join(', ') })));
    });
  }

  function renderFaq() {
    const box = $('#faq-list');
    clear(box);
    DATA.faq.forEach((item) => {
      box.append(el('details', {}, el('summary', { text: item.q }), el('p', { text: item.a })));
    });
  }

  /* ---------- Dialog ---------- */
  function wireDialog() {
    const dialog = $('#pkg-dialog');
    dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
    dialog.addEventListener('close', () => {
      if (location.hash.startsWith('#paket-')) history.replaceState(null, '', '#paket');
    });
  }

  function openFromHash() {
    if (location.hash.startsWith('#paket-')) openPackage(location.hash.slice('#paket-'.length), false);
  }

  /* ---------- Mulai ---------- */
  function init(data) {
    DATA = data;
    applySite();
    renderSteps();
    buildCalc();
    renderPackages();
    wireTabs();
    renderServices();
    renderTestimonials();
    renderFaq();
    renderContact();
    wireDialog();
    openFromHash();
    window.addEventListener('hashchange', openFromHash);
  }

  function showError() {
    const box = $('#load-error');
    box.hidden = false;
    box.textContent = 'Data paket belum bisa dimuat. Jika membuka file langsung dari komputer, jalankan lewat server lokal (lihat README), atau hubungi kami lewat WhatsApp.';
  }

  fetch(DATA_URL, { cache: 'no-cache' })
    .then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(init)
    .catch((err) => { console.error(err); showError(); });
})();
