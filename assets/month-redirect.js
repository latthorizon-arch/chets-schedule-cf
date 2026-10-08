/* month-redirect.js — auto-redirect to current month.
   Site active month is set here. Auto-updated by chets_monthly_rollover.sh.
   ACTIVE_MONTH = 10 (ЖОВТЕНЬ 2026 — поточний місяць).
   З 1 листопада: var ACTIVE_MONTH = 11; + bash chets_monthly_rollover.sh 2026-11
*/
(function() {
  // ACTIVE month for the site — auto-updated by chets_monthly_rollover.sh
  var ACTIVE_MONTH = 10;  // ЖОВТЕНЬ 2026

  var path = window.location.pathname;
  var activeLink = document.querySelector('.month-switch a.active, .daily-month-switch a.active, .month-menu a.active, .month-tabs a.active');
  if (activeLink) {
    var activeHref = activeLink.getAttribute('href') || '';
    var m = activeHref.match(/2026-(\d{2})\.html$/);
    if (m && parseInt(m[1], 10) === ACTIVE_MONTH) return; // already on current
  }

  // Build redirect target
  var redirect = null;
  var cur = ACTIVE_MONTH;
  var monthStr = cur < 10 ? '0' + cur : '' + cur;

  // Головна
  if (path === '/' || path === '' || path.endsWith('/index.html')) {
    redirect = '/months/2026-' + monthStr + '.html';
  }
  // Щоденний
  else if (path === '/daily.html' || /\/daily\.html$/.test(path)) {
    redirect = '/daily/2026-' + monthStr + '.html';
  }
  // Дільниці
  else if (path === '/districts.html' || /\/districts\.html$/.test(path)) {
    redirect = '/districts/2026-' + monthStr + '.html';
  }
  // Квиток контролера (timesheet)
  else if (/\/timesheet\.html$/.test(path)) {
    redirect = '/tickets/2026-' + monthStr + '-summary.html';
  }
  // Транспорт
  else if (/\/transport\.html$/.test(path)) {
    redirect = '/transport.html';
  }
  // Відпустки
  else if (/\/vacations\.html$/.test(path)) {
    redirect = '/vacations/2026-' + monthStr + '.html';
  }
  // СТТ
  else if (/\/stt\.html$/.test(path)) {
    redirect = '/stt/2026-' + monthStr + '.html';
  }
  // Проблеми
  else if (/\/problems\.html$/.test(path)) {
    redirect = '/problems.html';
  }

  if (redirect && redirect !== path) {
    window.location.replace(redirect);
  }
})();
