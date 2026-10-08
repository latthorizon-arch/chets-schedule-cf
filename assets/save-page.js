(function () {
  'use strict';

  let selectedElement = null;
  let selecting = false;

  function cleanText(text) {
    return (text || '').replace(/[\n\r\t]+/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function slugify(text) {
    const map = {
      'Графік контролерів': 'grafik-kontroleriv', 'Добовий графік': 'dobovyi-grafik',
      'Щоденний графік': 'shchodennyi-grafik', 'Квиток контролера': 'kvytok-kontrolera',
      'Потреби': 'potreby', 'Проблеми': 'problemy', 'Відпустки': 'vidpustky',
      'Дільниця': 'dilnytsia', 'Звіт СТТ': 'zvit-stt', 'Архів': 'arkhiv'
    };
    let value = cleanText(text);
    Object.keys(map).forEach(key => { value = value.replace(key, map[key]); });
    return value.toLowerCase().replace(/[📋🚌🎫📦📝⚠️✅]/g, '')
      .replace(/[^a-z0-9а-яіїєґё\-\.]+/giu, '-').replace(/^-+|-+$/g, '').slice(0, 90) || 'kp-chets-dokument';
  }

  function pageLabel() {
    const h1 = document.querySelector('h1');
    const current = document.querySelector('.month-current, .date-pill, .subtitle');
    const base = cleanText(h1 ? h1.textContent : document.title || 'КП ЧЕТС');
    const extra = cleanText(current ? current.textContent : '');
    return extra && !base.includes(extra) ? base + ' — ' + extra : base;
  }

  function fileBaseName() {
    const path = location.pathname.replace(/^\/+|\/+$/g, '').replace(/\//g, '-').replace(/\.html$/i, '');
    return (path ? 'kp-chets-' + path : 'kp-chets-grafik') + '-' + slugify(pageLabel());
  }

  function printProfile() {
    const path = location.pathname;
    const title = cleanText((document.querySelector('h1') || {}).textContent || '');
    const monthly = path === '/' || path === '/index.html' || path.startsWith('/months/');
    const daily = path === '/daily.html' || path.startsWith('/daily/') || /Добовий графік|Щоденні графіки/.test(title);
    if (monthly) return { cls: 'save-page-monthly', scale: 0.72, page: 'A4 landscape', note: 'Місячний графік автоматично зменшується і розкладається приблизно на 2 листки.' };
    if (daily) return { cls: 'save-page-daily', scale: 0.82, page: 'A4 portrait', note: 'Щоденний графік автоматично стискається, щоб поміститися на 1 листок.' };
    return { cls: 'save-page-normal', scale: 0.92, page: 'A4 portrait', note: 'Документ автоматично підганяється під аркуш.' };
  }

  function applyPrintProfile() {
    const profile = printProfile();
    document.documentElement.style.setProperty('--save-page-scale', String(profile.scale));
    let dyn = document.getElementById('savePageDynamicPrintRules');
    if (!dyn) {
      dyn = document.createElement('style');
      dyn.id = 'savePageDynamicPrintRules';
      document.head.appendChild(dyn);
    }
    dyn.textContent = `@media print{@page{size:${profile.page};margin:7mm}}`;
    document.body.classList.remove('save-page-monthly', 'save-page-daily', 'save-page-normal');
    document.body.classList.add(profile.cls);
    const note = document.getElementById('savePageAutoFitNote');
    if (note) note.textContent = profile.note;
    return profile;
  }

  function printTargetFor(node) {
    if (!node || node.closest('#savePagePanel')) return null;
    return node.closest('table,.calendar-card,.calendar-panel,.summary-card,.ticket-card,.report-card,.month-card,.need-card,section,article,.table-wrap,.index-grid') || node.closest('.container');
  }

  function setSelected(el) {
    if (selectedElement) selectedElement.classList.remove('save-page-selected-part');
    selectedElement = el || null;
    if (selectedElement) selectedElement.classList.add('save-page-selected-part');
    const label = document.querySelector('#savePageSelectedLabel');
    if (label) label.textContent = selectedElement ? 'Вибрано частину: ' + cleanText((selectedElement.querySelector('h1,h2,h3,.title,.calendar-title') || selectedElement).textContent).slice(0, 70) : 'Буде збережено весь документ';
  }

  function createPrintOnlyClone() {
    const old = document.getElementById('savePagePrintOnly');
    if (old) old.remove();
    if (!selectedElement) return;
    const wrap = document.createElement('div');
    wrap.id = 'savePagePrintOnly';
    const clone = selectedElement.cloneNode(true);
    clone.classList.remove('save-page-selected-part');
    wrap.appendChild(clone);
    document.body.appendChild(wrap);
  }

  function clearPrintOnlyClone() {
    const old = document.getElementById('savePagePrintOnly');
    if (old) old.remove();
  }

  function addPrintRules() {
    if (document.getElementById('savePagePrintRules')) return;
    const style = document.createElement('style');
    style.id = 'savePagePrintRules';
    style.textContent = `
      :root{--save-page-scale:.92}
      .save-page-panel{margin:28px auto 8px;padding:16px;border:1px solid #cbd5e1;border-radius:16px;background:#f8fafc;display:flex;flex-direction:column;align-items:center;gap:10px;max-width:860px;text-align:center;box-shadow:0 8px 22px rgba(15,23,42,.08)}
      .save-page-btn,.save-page-print-btn{appearance:none;border:0;border-radius:999px;background:#1f4e9e;color:#fff;font-weight:900;font-size:16px;padding:13px 24px;box-shadow:0 5px 16px rgba(31,78,158,.25);cursor:pointer;min-width:220px}
      .save-page-print-btn{background:#15803d}.save-page-btn:active,.save-page-print-btn:active{transform:translateY(1px)}
      .save-page-note,.save-page-setup,.save-page-fallback{display:none!important}
      #savePagePrintOnly{display:none}
      @media print{
        .save-page-panel,.save-page-panel *{display:none!important}
        body{background:#fff!important;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
        body.save-page-printing .container,body.save-page-printing #savePagePrintOnly{box-shadow:none!important;border-radius:0!important;transform:scale(var(--save-page-scale));transform-origin:top left;width:calc(100% / var(--save-page-scale));max-width:calc(100% / var(--save-page-scale));margin-left:0!important;margin-right:0!important;padding-top:4px!important}
        body.save-page-printing.save-page-daily .container{padding:6px!important}
        body.save-page-printing.save-page-daily .site-logos,body.save-page-printing.save-page-daily .nav,body.save-page-printing.save-page-daily .footer{display:none!important}
        body.save-page-printing.save-page-daily h1{font-size:20px!important;margin:2px 0 4px!important}
        body.save-page-printing.save-page-daily .subtitle{margin-bottom:6px!important;font-size:11px!important}
        body.save-page-printing.save-page-daily table{font-size:10px!important}
        body.save-page-printing.save-page-daily td,body.save-page-printing.save-page-daily th{padding:3px 4px!important}
        body.save-page-printing.save-page-monthly .container{padding:6px!important}
        body.save-page-printing.save-page-monthly .nav,body.save-page-printing.save-page-monthly .site-logos,body.save-page-printing.save-page-monthly .footer{display:none!important}
        body.save-page-printing.save-page-monthly h1{font-size:18px!important;margin:2px 0!important}
        body.save-page-printing.save-page-monthly .month-switch,body.save-page-printing.save-page-monthly .legend,body.save-page-printing.save-page-monthly .subtitle{display:none!important}
        body.save-page-printing.save-page-monthly table{font-size:8px!important;page-break-inside:auto!important}
        body.save-page-printing.save-page-monthly tr{page-break-inside:avoid!important;break-inside:avoid!important}
        body.save-page-printing.save-page-monthly td,body.save-page-printing.save-page-monthly th{padding:2px 1px!important;height:14px!important;min-width:18px!important}
        body.save-page-printing.save-page-monthly .name{min-width:110px!important;max-width:120px!important;white-space:normal!important}
        body.save-page-printing.save-page-print-selected .container{display:none!important}
        body.save-page-printing.save-page-print-selected #savePagePrintOnly{display:block!important}
      }
      @media(max-width:700px){.save-page-panel{margin:20px 4px 6px;padding:14px 10px}.save-page-btn,.save-page-print-btn{width:100%;font-size:15px}.save-page-note{font-size:11px}}
    `;
    document.head.appendChild(style);
  }

  function startSelection(panel) {
    selecting = true;
    document.body.classList.add('save-page-selecting');
    panel.classList.remove('open');
  }

  document.addEventListener('click', function (ev) {
    if (!selecting) return;
    const target = printTargetFor(ev.target);
    if (!target) return;
    ev.preventDefault(); ev.stopPropagation();
    selecting = false;
    document.body.classList.remove('save-page-selecting');
    setSelected(target);
    const panel = document.getElementById('savePagePanel');
    if (panel) { panel.classList.add('open'); panel.scrollIntoView({behavior:'smooth',block:'center'}); }
  }, true);

  function createPanel() {
    if (document.getElementById('savePagePanel')) return;
    addPrintRules();
    const profile = applyPrintProfile();
    const panel = document.createElement('section');
    panel.id = 'savePagePanel';
    panel.className = 'save-page-panel';
    panel.innerHTML = `
      <button type="button" class="save-page-btn">💾 Зберегти сторінку</button>
    `;
    panel.querySelector('.save-page-btn').addEventListener('click', function () {
      const oldTitle = document.title;
      document.title = fileBaseName();
      applyPrintProfile();
      createPrintOnlyClone();
      document.body.classList.add('save-page-printing');
      window.print();
      setTimeout(() => {
        document.title = oldTitle;
        document.body.classList.remove('save-page-printing','save-page-print-selected','save-page-monthly','save-page-daily','save-page-normal');
        clearPrintOnlyClone();
        applyPrintProfile();
      }, 1500);
    });
    (document.querySelector('.container') || document.body).appendChild(panel);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', createPanel);
  else createPanel();
})();
