(function () {
  var STORAGE_KEY = 'mobileAlertDismissedDate';
  var MOBILE_MAX_WIDTH = 700;

  var alertEl = document.getElementById('mobileAlert');
  if (!alertEl) return;

  var confirmBtn = document.getElementById('mobileAlertConfirm');
  var dontShowCheckbox = document.getElementById('mobileAlertDontShow');

  function todayKey() {
    var d = new Date();
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  }

  function isMobile() {
    return window.innerWidth <= MOBILE_MAX_WIDTH;
  }

  function wasDismissedToday() {
    try {
      return window.localStorage.getItem(STORAGE_KEY) === todayKey();
    } catch (e) {
      return false;
    }
  }

  function open() {
    alertEl.classList.add('is-open');
    alertEl.setAttribute('aria-hidden', 'false');
  }

  function close() {
    alertEl.classList.remove('is-open');
    alertEl.setAttribute('aria-hidden', 'true');
    if (dontShowCheckbox && dontShowCheckbox.checked) {
      try {
        window.localStorage.setItem(STORAGE_KEY, todayKey());
      } catch (e) {}
    }
  }

  if (confirmBtn) confirmBtn.addEventListener('click', close);

  if (isMobile() && !wasDismissedToday()) {
    open();
  }
})();
