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

  /* BACKGROUND MUSIC ---------------------------------------------------------
     By default an original, gentle instrumental (tanpura-style drone with a
     soft melody in raga Mohanam) is generated live with the Web Audio API, so
     no audio file or licence is needed. To use a licensed recording instead,
     place it in assets/audio/ and set the path, e.g. 'assets/audio/music.mp3'. */
  var MUSIC_FILE = '';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------------
     HEADER, NAVIGATION, BACK-TO-TOP
     ------------------------------------------------------------------------ */
  var header = document.getElementById('siteHeader');
  var navToggle = document.getElementById('navToggle');
  var nav = document.getElementById('siteNav');
  var backToTop = document.getElementById('backToTop');

  function setNav(open) {
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.querySelector('.sr-only').textContent = open ? 'Close menu' : 'Open menu';
    nav.classList.toggle('is-open', open);
    if (open) header.classList.add('is-solid');
    else onScroll();
  }

  navToggle.addEventListener('click', function () {
    setNav(navToggle.getAttribute('aria-expanded') !== 'true');
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) setNav(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      setNav(false);
      navToggle.focus();
    }
  });
  document.addEventListener('click', function (e) {
    if (nav.classList.contains('is-open') && !header.contains(e.target)) setNav(false);
  });

  var ticking = false;
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    header.classList.toggle('is-solid', y > 60 || nav.classList.contains('is-open'));
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

  /* ------------------------------------------------------------------------
     OPTIONAL BACKGROUND MUSIC (never autoplays)
     ------------------------------------------------------------------------ */
  var musicBtn = document.getElementById('musicToggle');
  var muteBtn = document.getElementById('muteToggle');

  function createFilePlayer(src) {
    var audio = new Audio(src);
    audio.loop = true;
    audio.preload = 'none';
    audio.volume = 0.6;
    return {
      play: function () { return audio.play(); },
      pause: function () { audio.pause(); },
      setMuted: function (m) { audio.muted = m; }
    };
  }

  /** Original generative instrumental: tanpura-style drone (Pa–Sa–Sa–Sa)
   *  with a soft bell-like melody wandering through raga Mohanam. */
  function createSynthPlayer() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    var ctx = null, master, muteGain, bus, scheduler = null;
    var nextDrone = 0, nextMelody = 0, droneStep = 0, melodyIdx = 4;
    var SA = 146.83; // D3
    var DRONE = [0.75, 1, 1, 0.5];
    var SCALE = [1, 9 / 8, 5 / 4, 3 / 2, 5 / 3, 2, 9 / 4, 5 / 2, 3, 10 / 3]; // S R G P D S' R' G' P' D'

    function setup() {
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.0001;
      muteGain = ctx.createGain();
      bus = ctx.createGain();
      var tone = ctx.createBiquadFilter();
      tone.type = 'lowpass';
      tone.frequency.value = 2600;
      var delay = ctx.createDelay(1.5);
      delay.delayTime.value = 0.45;
      var feedback = ctx.createGain();
      feedback.gain.value = 0.33;
      var wet = ctx.createGain();
      wet.gain.value = 0.3;

      bus.connect(tone);
      tone.connect(master);
      tone.connect(delay);
      delay.connect(feedback);
      feedback.connect(delay);
      delay.connect(wet);
      wet.connect(master);
      master.connect(muteGain);
      muteGain.connect(ctx.destination);
    }

    function pluck(freq, t, vol, dur) {
      var o = ctx.createOscillator();
      var f = ctx.createBiquadFilter();
      var g = ctx.createGain();
      o.type = 'sawtooth';
      o.frequency.value = freq;
      f.type = 'lowpass';
      f.Q.value = 2;
      f.frequency.setValueAtTime(freq * 7, t);
      f.frequency.exponentialRampToValueAtTime(freq * 1.6, t + dur);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(f); f.connect(g); g.connect(bus);
      o.start(t); o.stop(t + dur + 0.05);
    }

    function bell(freq, t, vol, dur) {
      [[1, vol], [2.01, vol * 0.25], [3.0, vol * 0.08]].forEach(function (p) {
        var o = ctx.createOscillator();
        var g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = freq * p[0];
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(p[1], t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur / p[0]);
        o.connect(g); g.connect(bus);
        o.start(t); o.stop(t + dur + 0.05);
      });
    }

    function schedule() {
      var horizon = ctx.currentTime + 0.6;
      while (nextDrone < horizon) {
        pluck(SA * DRONE[droneStep % DRONE.length], nextDrone, 0.045, 3.4);
        nextDrone += 1.2;
        droneStep++;
      }
      while (nextMelody < horizon) {
        if (Math.random() < 0.82) {
          var step = [-2, -1, -1, 0, 1, 1, 2][Math.floor(Math.random() * 7)];
          melodyIdx = Math.max(0, Math.min(SCALE.length - 1, melodyIdx + step));
          bell(SA * 2 * SCALE[melodyIdx], nextMelody, 0.05, 2.6);
        }
        nextMelody += [0.6, 0.6, 1.2, 1.2, 1.8, 2.4][Math.floor(Math.random() * 6)];
      }
    }

    return {
      play: function () {
        if (!ctx) setup();
        return ctx.resume().then(function () {
          var now = ctx.currentTime;
          if (!scheduler) {
            nextDrone = now + 0.1;
            nextMelody = now + 1.2;
            scheduler = window.setInterval(schedule, 150);
            schedule();
          }
          master.gain.cancelScheduledValues(now);
          master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), now);
          master.gain.exponentialRampToValueAtTime(0.7, now + 1.5);
        });
      },
      pause: function () {
        if (!ctx) return;
        var now = ctx.currentTime;
        master.gain.cancelScheduledValues(now);
        master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), now);
        master.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
        window.clearInterval(scheduler);
        scheduler = null;
        window.setTimeout(function () {
          if (!scheduler && ctx.state === 'running') ctx.suspend();
        }, 600);
      },
      setMuted: function (m) {
        if (muteGain) muteGain.gain.setTargetAtTime(m ? 0 : 1, ctx.currentTime, 0.05);
      }
    };
  }

  var player = MUSIC_FILE ? createFilePlayer(MUSIC_FILE) : createSynthPlayer();
  var playing = false;
  var muted = false;
  var resumeOnVisible = false;

  function updateMusicUi() {
    musicBtn.setAttribute('aria-pressed', String(playing));
    musicBtn.setAttribute('aria-label', playing ? 'Pause background music' : 'Play background music');
    muteBtn.setAttribute('aria-pressed', String(muted));
    muteBtn.setAttribute('aria-label', muted ? 'Unmute music' : 'Mute music');
    muteBtn.hidden = !playing && !muted;
  }

  if (!player) {
    // Web Audio unsupported and no file configured: hide controls; site works without music.
    musicBtn.closest('.music-controls').hidden = true;
  } else {
    musicBtn.addEventListener('click', function () {
      if (playing) {
        player.pause();
        playing = false;
        updateMusicUi();
      } else {
        Promise.resolve(player.play()).then(function () {
          playing = true;
          player.setMuted(muted);
          updateMusicUi();
        }).catch(function () {
          playing = false;
          updateMusicUi();
        });
      }
    });
    muteBtn.addEventListener('click', function () {
      muted = !muted;
      player.setMuted(muted);
      updateMusicUi();
    });
    // Pause when the tab is hidden (e.g. switching back to WhatsApp).
    document.addEventListener('visibilitychange', function () {
      if (document.hidden && playing) {
        player.pause(); playing = false; resumeOnVisible = true; updateMusicUi();
      } else if (!document.hidden && resumeOnVisible) {
        resumeOnVisible = false;
        Promise.resolve(player.play()).then(function () { playing = true; updateMusicUi(); }).catch(function () {});
      }
    });
    updateMusicUi();
  }
})();
