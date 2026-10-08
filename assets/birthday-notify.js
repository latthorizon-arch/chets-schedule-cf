/* birthday-notify.js — Червона кнопка "ДР" на головній
   Показується з 8:00 ранку за Києвом коли в когось день народження.
   Горить ВЕСЬ ДЕНЬ до опівночі (без кліку, не зникає).
   Формат: ДР: Прізвище І.Б. (ДД.ММ — X років)

   Vlad's rule (09.09.2026):
   - 8:00 за Києвом — з'являється
   - Горить весь день до 23:59
   - Опівночі — автоматично зникає
   - Якщо в когось ще ДН — показується новий
   - Якщо наступного дня немає ДН — кнопка не з'являється
*/

(function() {
  // Kyiv now as Date object
  function kyivNow() {
    return new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Kyiv' }));
  }

  // Kyiv date key (YYYY-MM-DD)
  function todayKyivKey() {
    var parts = new Intl.DateTimeFormat('uk-UA', {
      timeZone: 'Europe/Kyiv',
      year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(new Date());
    var y = '', m = '', d = '';
    for (var i = 0; i < parts.length; i++) {
      if (parts[i].type === 'year') y = parts[i].value;
      else if (parts[i].type === 'month') m = parts[i].value;
      else if (parts[i].type === 'day') d = parts[i].value;
    }
    return y + '-' + m + '-' + d;
  }

  // Kyiv hour (0-23)
  function kyivHour() {
    var hStr = new Intl.DateTimeFormat('uk-UA', {
      timeZone: 'Europe/Kyiv', hour: '2-digit', hour12: false
    }).format(new Date());
    return parseInt(hStr, 10);
  }

  // Kyiv day & month (for matching birthdays)
  function kyivDayMonth() {
    var parts = new Intl.DateTimeFormat('uk-UA', {
      timeZone: 'Europe/Kyiv', day: '2-digit', month: '2-digit'
    }).formatToParts(new Date());
    var day = 0, month = 0;
    for (var i = 0; i < parts.length; i++) {
      if (parts[i].type === 'day') day = parseInt(parts[i].value, 10);
      else if (parts[i].type === 'month') month = parseInt(parts[i].value, 10);
    }
    return { day: day, month: month };
  }

  // Kyiv year (for age calculation)
  function kyivYear() {
    return parseInt(new Intl.DateTimeFormat('uk-UA', {
      timeZone: 'Europe/Kyiv', year: 'numeric'
    }).format(new Date()), 10);
  }

  // Compute age (years since birth date)
  function calcAge(birthYear) {
    var y = kyivYear();
    var age = y - birthYear;
    return age;
  }

  // Find today's birthdays
  function todaysBirthdays() {
    if (!window.__BIRTHDAYS__) return [];
    var dm = kyivDayMonth();
    return window.__BIRTHDAYS__.filter(function(b) {
      return b.day === dm.day && b.month === dm.month;
    });
  }

  // Show button — labels like "ДР: Касьяненко О.А. (05.02 — 57 років)"
  function showButton(birthdays) {
    if (!birthdays.length) return;
    var btn = document.getElementById('birthdayBtn');
    if (!btn) return;

    var labels = birthdays.map(function(b) {
      var age = calcAge(b.year);
      // Де "5 років" / "21 рік" / "22 роки" / "23 роки"
      var ageWord = pluralAge(age);
      var ddmm = (b.day < 10 ? '0' + b.day : b.day) + '.' + (b.month < 10 ? '0' + b.month : b.month);
      return b.name + ' (' + ddmm + ' — ' + age + ' ' + ageWord + ')';
    });
    btn.textContent = '🎂 ДР: ' + labels.join('; ');
    btn.setAttribute('data-date-key', todayKyivKey());
    btn.style.display = 'inline-block';
  }

  // Ukrainian plural for "рік/роки/років"
  function pluralAge(n) {
    var mod10 = n % 10;
    var mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return 'рік';
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'роки';
    return 'років';
  }

  function hideButton() {
    var btn = document.getElementById('birthdayBtn');
    if (btn) btn.style.display = 'none';
  }

  // Main init — show button when conditions met
  function init() {
    var birthdays = todaysBirthdays();
    var hour = kyivHour();

    // No birthday today OR before 8:00 → hide
    if (!birthdays.length || hour < 8) {
      hideButton();
      startTimeWatcher();
      return;
    }

    showButton(birthdays);
    startTimeWatcher();
  }

  // Watcher: re-evaluate every 60s
  var _watchInterval = null;
  function startTimeWatcher() {
    if (_watchInterval) return;
    _watchInterval = setInterval(function() {
      init(); // re-evaluate based on updated Kyiv time
    }, 60000); // every minute
  }

  // Inject button HTML (positioned under site-logos, right side)
  function injectButton() {
    if (document.getElementById('birthdayBtn')) return;
    var btn = document.createElement('button');
    btn.id = 'birthdayBtn';
    btn.type = 'button';
    btn.style.cssText = [
      'display:none',
      'position:fixed',
      'top:62px',
      'right:14px',
      'z-index:1100',
      'background:#dc2626',
      'color:#fff',
      'border:none',
      'border-radius:12px',
      'padding:10px 14px',
      'font-weight:900',
      'font-size:13px',
      'cursor:default',
      'box-shadow:0 4px 12px rgba(220,38,38,.45)',
      'max-width:380px',
      'overflow:hidden',
      'text-overflow:ellipsis',
      'line-height:1.3',
      'animation:birthdayPulse 1.6s ease-in-out infinite',
      'white-space:normal',
      'text-align:left'
    ].join(';');
    // No click handler — кнопка не зникає
    document.body.appendChild(btn);

    // CSS animation
    var style = document.createElement('style');
    style.textContent = '@keyframes birthdayPulse{0%,100%{transform:scale(1);box-shadow:0 4px 12px rgba(220,38,38,.45)}50%{transform:scale(1.04);box-shadow:0 6px 18px rgba(220,38,38,.65)}}';
    document.head.appendChild(style);
  }

  function loadBirthdays() {
    return fetch('/assets/data/controller-birthdays.json')
      .then(function(r) { return r.json(); })
      .then(function(data) {
        window.__BIRTHDAYS__ = data;
        injectButton();
        init();
      })
      .catch(function(err) {
        console.warn('Birthday data load failed:', err);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadBirthdays);
  } else {
    loadBirthdays();
  }
})();
