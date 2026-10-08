/* vacations-auto-month.js — activate current month tab in vacations.html on load.
   vacations.html uses <a onclick="showVacMonth(N)">. This script auto-clicks
   the current month link on DOMContentLoaded.

   ACTIVE_MONTH = 10 (ЖОВТЕНЬ 2026) — встановлено server-side з rollover на 01.10.2026
*/
(function() {
  // Активний місяць (можна змінити тут або через month-redirect.js ACTIVE_MONTH)
  var cur = 10;  // ЖОВТЕНЬ — поточний місяць

  function activate() {
    var links = document.querySelectorAll('.month-switch a, .month-switch button, .month-menu a, .month-menu button, .month-tabs a, .month-tabs button');
    links.forEach(function(a) {
      var onclick = a.getAttribute('onclick') || '';
      var m = onclick.match(/\((\d{1,2})\)/);
      if (m) {
        var n = parseInt(m[1], 10);
        if (n === cur) {
          a.click();
        }
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', activate);
  } else {
    activate();
  }
})();
