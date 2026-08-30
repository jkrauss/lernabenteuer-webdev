/* ============================================================
   Lernabenteuer Webdev — Fortschritts-Tracking
   Vanilla JS, kein Framework: genau die Techniken (querySelector,
   addEventListener, localStorage, JSON), die in diesem Kurs
   gelernt werden. Fortschritt bleibt komplett im Browser (localStorage).
   ============================================================ */
(function () {
  'use strict';

  var STORAGE_KEY = 'lernabenteuer-progress-v1';

  /* XP pro Mission (aus dem Lehrplan v1.0, siehe data-xp im HTML). */
  var MISSION_XP = {
    'M1.1': 100, 'M1.2': 250, 'M1.3': 500, 'N1.1': 100,
    'M2.1': 100, 'M2.2': 250, 'M2.3': 500, 'N2.1': 500,
    'M3.1': 250, 'M3.2': 500, 'N3.1': 100,
    'M4.1': 250, 'M4.2': 500, 'N4.1': 100
  };

  /* Missionen ohne eigene Checkliste: zählen als erledigt, sobald
     die Level-Up-Kriterien des Levels komplett sind. */
  var MISSION_WITHOUT_CHECKS = {
    'N1.1': 'L1', 'N2.1': 'L2', 'N3.1': 'L3', 'N4.1': 'L4'
  };

  var LEVEL_BADGES = {
    1: 'Gerüstbauerin',
    2: 'Gehirnchirurgin',
    3: 'Schildträgerin',
    4: 'Baumeisterin'
  };
  var TOTAL_LEVELS = 4;
  var CORE_XP_TOTAL = 3200;

  /* ---------- State ---------- */

  var state = loadState();

  function defaultState() {
    return {
      checks: {},     /* "M1.1-1": true */
      missions: {},   /* "M1.1": true  (XP vergeben?) */
      badges: {},     /* "1": true     (Level-Badge freigeschaltet?) */
      unlocked: { 1: true }  /* freigeschaltete Level */
    };
  }

  function loadState() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      var parsed = JSON.parse(raw);
      /* sanfte Migration: fehlende Felder ergänzen */
      var base = defaultState();
      return {
        checks: parsed.checks || base.checks,
        missions: parsed.missions || base.missions,
        badges: parsed.badges || base.badges,
        unlocked: parsed.unlocked || base.unlocked
      };
    } catch (err) {
      console.warn('Konnte Fortschritt nicht laden:', err);
      return defaultState();
    }
  }

  function saveState() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.warn('Konnte Fortschritt nicht speichern:', err);
    }
  }

  /* ---------- DOM-Helfer ---------- */

  function $(selector) {
    return document.querySelector(selector);
  }

  function $all(selector) {
    return Array.prototype.slice.call(document.querySelectorAll(selector));
  }

  /* ---------- Level-Logik ---------- */

  function checksOfGroup(group) {
    return $all('input[data-check^="' + group + '-"]');
  }

  function groupDone(group) {
    var boxes = checksOfGroup(group);
    return boxes.length > 0 && boxes.every(function (box) {
      return !!state.checks[box.getAttribute('data-check')];
    });
  }

  function levelCheckGroups(level) {
    /* Missionen M<x.y> + Level-Up-Kriterien L<x> */
    var groups = $all('input[data-check^="M' + level + '."]')
      .map(function (box) { return box.getAttribute('data-check').split('-')[0]; });
    groups.push('L' + level);
    return groups.filter(function (g, i, arr) { return arr.indexOf(g) === i; });
  }

  function levelProgress(level) {
    var boxes = $all('input[data-check^="M' + level + '."], input[data-check^="L' + level + '-"]');
    if (boxes.length === 0) return { done: 0, total: 0, pct: 0 };
    var done = boxes.filter(function (box) {
      return !!state.checks[box.getAttribute('data-check')];
    }).length;
    return { done: done, total: boxes.length, pct: Math.round((done / boxes.length) * 100) };
  }

  function isMissionDone(missionId) {
    if (state.missions[missionId]) return true;
    var noChecks = MISSION_WITHOUT_CHECKS[missionId];
    if (noChecks) return groupDone(noChecks);
    return groupDone(missionId);
  }

  function isLevelComplete(level) {
    var groups = levelCheckGroups(level);
    return groups.length > 0 && groups.every(groupDone);
  }

  /* ---------- XP & Badges ---------- */

  function totalXp() {
    var xp = 0;
    Object.keys(MISSION_XP).forEach(function (id) {
      if (isMissionDone(id)) xp += MISSION_XP[id];
    });
    return xp;
  }

  function badgeCount() {
    var n = 0;
    for (var level = 1; level <= TOTAL_LEVELS; level++) {
      if (state.badges[level]) n++;
    }
    return n;
  }

  function overallProgressPct() {
    var boxes = $all('input[data-check]');
    if (boxes.length === 0) return 0;
    var done = boxes.filter(function (box) {
      return !!state.checks[box.getAttribute('data-check')];
    }).length;
    return Math.round((done / boxes.length) * 100);
  }

  /* ---------- Rendering ---------- */

  function render() {
    /* 1. Neue Badges vergeben (VOR dem HUD-Update, damit der Zähler
          im selben Rendern aktuell ist). */
    for (var lvl = 1; lvl <= TOTAL_LEVELS; lvl++) {
      if (!state.badges[lvl] && isLevelComplete(lvl)) {
        state.badges[lvl] = true;
        var next = lvl + 1;
        if (next <= TOTAL_LEVELS) state.unlocked[next] = true;
        var award = document.createElement('p');
        award.className = 'badge-toast';
        award.setAttribute('role', 'status');
        award.textContent = '🎉 Level ' + lvl + ' geschafft! Badge „' +
          LEVEL_BADGES[lvl] + '“ freigeschaltet!';
        var levelUpBox = $('.level[data-level-section="' + lvl + '"] .level-up');
        if (levelUpBox && !levelUpBox.querySelector('.badge-toast')) {
          levelUpBox.appendChild(award);
        }
      }
    }

    /* 2. Level-Fortschrittsbalken + Labels */
    for (var level = 1; level <= TOTAL_LEVELS; level++) {
      var p = levelProgress(level);
      var bar = $('[data-level-progress-bar="' + level + '"]');
      if (bar) {
        bar.setAttribute('aria-valuenow', String(p.pct));
        var fill = bar.querySelector('.progress-fill');
        if (fill) fill.style.width = p.pct + '%';
      }
      var label = $('[data-level-progress-label="' + level + '"]');
      if (label) {
        label.textContent = p.total > 0
          ? p.done + ' von ' + p.total + ' Aufgaben (' + p.pct + ' %)'
          : 'Noch keine Aufgaben';
      }
      var cardLabel = $('[data-level-card-progress="' + level + '"]');
      if (cardLabel) cardLabel.textContent = p.pct + ' %';
    }

    /* 3. HUD */
    var xp = totalXp();
    var hudXp = $('#hud-xp');
    if (hudXp) hudXp.textContent = String(xp);
    var hudBadges = $('#hud-badges');
    if (hudBadges) hudBadges.textContent = String(badgeCount());
    var hudProgress = $('#hud-progress');
    if (hudProgress) hudProgress.textContent = overallProgressPct() + '\u2009%';

    /* 4. Level-Optik: abgeschlossen / offen */
    $all('.level[data-level-section]').forEach(function (section) {
      var lvl2 = parseInt(section.getAttribute('data-level-section'), 10);
      section.classList.toggle('level-complete', !!state.badges[lvl2]);
      section.classList.toggle('level-locked', !state.unlocked[lvl2]);
    });

    saveState();
  }

  /* ---------- Events ---------- */

  function bindEvents() {
    document.addEventListener('change', function (event) {
      var box = event.target;
      if (!box.matches('input[data-check]')) return;
      var id = box.getAttribute('data-check');
      if (box.checked) {
        state.checks[id] = true;
      } else {
        delete state.checks[id];
      }
      render();
    });
  }

  /* ---------- Start ---------- */

  function restoreCheckboxes() {
    $all('input[data-check]').forEach(function (box) {
      var id = box.getAttribute('data-check');
      box.checked = !!state.checks[id];
    });
  }

  restoreCheckboxes();
  bindEvents();
  render();
})();
