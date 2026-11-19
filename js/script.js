/* ==========================================================================
   Sooraj & Sivakami — Wedding Invitation
   Vanilla JavaScript, no dependencies.
   ========================================================================== */
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  /* ------------------------------------------------------------------------
     CONFIGURATION
     ------------------------------------------------------------------------ */

  // India Standard Time is a fixed UTC+05:30 (no daylight saving).
  var IST_OFFSET_MINUTES = 330;

  /** Convert a wall-clock time in IST to an absolute UTC timestamp (ms).
   *  This is independent of the visitor's own timezone. */
  function istToUtc(year, month, day, hour, minute) {
    return Date.UTC(year, month - 1, day, hour, minute) - IST_OFFSET_MINUTES * 60 * 1000;
  }

  var EVENTS = {
    wedding: {
      start: istToUtc(2027, 1, 31, 10, 30), // Muhurtham 10:30 AM IST
      end: istToUtc(2027, 1, 31, 11, 20),   // Muhurtham ends 11:20 AM IST
      during: 'The auspicious Muhurtham is happening now. Thank you for your blessings!',
      after: 'Sooraj & Sivakami are now married. Thank you for your love and blessings!'
    },
    reception: {
      start: istToUtc(2027, 1, 31, 18, 0),  // 6:00 PM IST
      end: istToUtc(2027, 1, 31, 21, 0),    // 9:00 PM IST
      during: 'The reception is underway at Rajiv Gandhi Town Hall, Chalakudy. Do join us!',
      after: 'Thank you for celebrating with us.'
    }
  };

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------------
     BACK-TO-TOP
     ------------------------------------------------------------------------ */
  var backToTop = document.getElementById('backToTop');

  var ticking = false;
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    backToTop.classList.toggle('is-visible', y > window.innerHeight * 0.9);
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  // Smooth scroll is handled by CSS (scroll-behavior). Move focus to the target
  // section after in-page navigation so keyboard/screen-reader users follow along.
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link) return;
    var id = link.getAttribute('href').slice(1);
    var target = id && document.getElementById(id);
    if (!target) return;
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    window.setTimeout(function () { target.focus({ preventScroll: true }); }, reduceMotion ? 0 : 450);
  });

  /* ------------------------------------------------------------------------
     SCROLL-TRIGGERED REVEAL (Intersection Observer)
     ------------------------------------------------------------------------ */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    // Stagger siblings slightly for an elegant cascade.
    revealEls.forEach(function (el) {
      var siblings = el.parentElement ? el.parentElement.querySelectorAll(':scope > .reveal') : [];
      var index = Array.prototype.indexOf.call(siblings, el);
      if (index > 0) el.style.transitionDelay = Math.min(index * 90, 450) + 'ms';
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ------------------------------------------------------------------------
     COUNTDOWNS (both targets are absolute IST instants)
     ------------------------------------------------------------------------ */
  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function initCountdown(root, event) {
    if (!root) return;
    var grid = root.querySelector('[data-cd-grid]');
    var status = root.querySelector('[data-cd-status]');
    var parts = {
      days: root.querySelector('[data-cd="days"]'),
      hours: root.querySelector('[data-cd="hours"]'),
      minutes: root.querySelector('[data-cd="minutes"]'),
      seconds: root.querySelector('[data-cd="seconds"]')
    };
    var timer = null;
    var lastMessage = '';

    function setPart(el, value) {
      if (el.textContent === value) return;
      el.textContent = value;
      if (!reduceMotion) {
        el.classList.remove('tick');
        void el.offsetWidth; // restart the animation
        el.classList.add('tick');
      }
    }

    function render() {
      var now = Date.now();
      var diff = event.start - now;

      if (diff <= 0) {
        // Countdown complete — never show negative numbers.
        var message = now < event.end ? event.during : event.after;
        if (message !== lastMessage) {
          grid.hidden = true;
          status.textContent = message;
          status.hidden = false;
          lastMessage = message;
        }
        if (now >= event.end && timer) { window.clearInterval(timer); timer = null; }
        return;
      }

      var total = Math.floor(diff / 1000);
      var d = Math.floor(total / 86400);
      var h = Math.floor((total % 86400) / 3600);
      var m = Math.floor((total % 3600) / 60);
      var s = total % 60;
      setPart(parts.days, String(d));
      setPart(parts.hours, pad(h));
      setPart(parts.minutes, pad(m));
      setPart(parts.seconds, pad(s));
    }

    render();
    timer = window.setInterval(render, 1000);
  }

  initCountdown(document.querySelector('[data-countdown="wedding"]'), EVENTS.wedding);
  initCountdown(document.querySelector('[data-countdown="reception"]'), EVENTS.reception);
})();
