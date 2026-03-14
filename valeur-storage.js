/*
 ╔═══════════════════════════════════════════════════════════╗
 ║   V.A.L.E.U.R© — VALEUR-STORAGE.JS                        ║
 ║   SOURCE UNIQUE pour toutes les clés localStorage          ║
 ║   © Céline Bourbon — Tous droits réservés                ║
 ╚═══════════════════════════════════════════════════════════╝

  PROBLÈMES RÉSOLUS :
  - 3 clés différentes pour le journal (unifié en 1 seule)
  - Clés de complétion incohérentes entre dashboard et modules
  - Aucune gestion d'erreur quand localStorage est plein (Safari privé)
*/

var VL = (function() {

  /* ── CLÉS OFFICIELLES (ne plus jamais les écrire à la main ailleurs) */
  var KEYS = {
    auth:        'valeur_auth',
    email:       'valeur_email',
    welcomed:    'valeur_welcomed',
    journal:     'valeur_journal',      /* CLÉ UNIQUE — remplace valeur_journal_v2 */
    module0:     'valeur_module0_complete',
    module1:     'valeur_module1_complete',
    module2:     'valeur_module2_complete',
    module3:     'valeur_module3_complete',
    module4:     'valeur_module4_complete',
    module5:     'valeur_module5_complete',
    module6:     'valeur_module6_complete',
    progress:    function(id) { return 'valeur_module' + id + '_progress'; }
  };

  /* ── LECTURE SÉCURISÉE */
  function get(key) {
    try { return localStorage.getItem(key); }
    catch(e) { console.warn('[VL] localStorage.getItem failed:', e); return null; }
  }

  /* ── ÉCRITURE SÉCURISÉE */
  function set(key, value) {
    try { localStorage.setItem(key, value); return true; }
    catch(e) {
      console.warn('[VL] localStorage.setItem failed (full?):', e);
      return false;
    }
  }

  /* ── SUPPRESSION SÉCURISÉE */
  function remove(key) {
    try { localStorage.removeItem(key); }
    catch(e) {}
  }

  /* ── AUTH */
  function isLoggedIn()  { return !!get(KEYS.auth); }
  function getEmail()    { return get(KEYS.email) || ''; }
  function logout() {
    remove(KEYS.auth);
    window.location.href = 'login.html';
  }

  /* ── MODULES : COMPLÉTION */
  function isComplete(id) {
    /* Accepte aussi les anciennes clés pour la migration */
    return !!get(KEYS['module' + id])
      || !!get('VALEUR_module' + id + '_complete')  /* ancienne clé module0 */
      || !!get('valeur_progress_v2')  /* fallback lecture v2 */
        && _readV2('module' + id);
  }

  function _readV2(key) {
    try {
      var p = JSON.parse(get('valeur_progress_v2') || '{}');
      return !!p[key];
    } catch(e) { return false; }
  }

  function markComplete(id) {
    /* Écrit la clé officielle ET les deux anciennes pour compatibilité rétroactive */
    set(KEYS['module' + id], '1');
    set('VALEUR_module' + id + '_complete', '1');  /* compat module0 */
    /* Met aussi à jour la clé progress_v2 utilisée dans module0 */
    try {
      var p = JSON.parse(get('valeur_progress_v2') || '{}');
      p['module' + id] = true;
      p['module' + id + '_complete'] = true;
      set('valeur_progress_v2', JSON.stringify(p));
    } catch(e) {}
    /* Déclenche un événement storage pour que le dashboard se mette à jour */
    try {
      window.dispatchEvent(new StorageEvent('storage', {
        key: KEYS['module' + id],
        newValue: '1'
      }));
    } catch(e) {}
  }

  function isUnlocked(id) {
    if (id === 0) return true;
    return isComplete(id - 1);
  }

  function getProgress(id) {
    var p = get(KEYS.progress(id));
    return p ? parseInt(p, 10) : 0;
  }

  function setProgress(id, pct) {
    set(KEYS.progress(id), String(pct));
  }

  function getCompletedList() {
    var list = [];
    for (var i = 0; i <= 6; i++) {
      if (isComplete(i)) list.push(i);
    }
    return list;
  }

  /* ── JOURNAL (clé UNIQUE) */
  function getJournal() {
    try {
      var raw = get(KEYS.journal);
      if (!raw) return _migrateJournal();
      return JSON.parse(raw);
    } catch(e) { return []; }
  }

  /* Migration silencieuse des anciennes entrées (valeur_journal_v2) */
  function _migrateJournal() {
    var entries = [];
    /* Tente de récupérer l'ancien journal v2 */
    try {
      var v2 = JSON.parse(get('valeur_journal_v2') || '[]');
      if (v2.length) {
        /* Normalise le format */
        entries = v2.map(function(e) {
          return {
            text: e.text || '',
            date: e.date || new Date().toISOString(),
            module: e.module || ''
          };
        });
        saveJournal(entries);
        /* Nettoie l'ancienne clé */
        remove('valeur_journal_v2');
      }
    } catch(e) {}
    return entries;
  }

  function saveJournal(entries) {
    try { set(KEYS.journal, JSON.stringify(entries)); }
    catch(e) { console.warn('[VL] Journal save failed:', e); }
  }

  function addJournalEntry(text, moduleName) {
    var entries = getJournal();
    entries.unshift({
      text: text,
      date: new Date().toISOString(),
      module: moduleName || ''
    });
    saveJournal(entries);
    return entries;
  }

  /* ── FORMATAGE DE DATE (fr-FR unifié) */
  function formatDate(isoString) {
    try {
      var d = new Date(isoString);
      return d.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch(e) { return isoString; }
  }

  function formatDateTime(isoString) {
    try {
      var d = new Date(isoString);
      return d.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch(e) { return isoString; }
  }

  /* ── MODALE (remplace confirm() natif) */
  function showModal(opts) {
    /*
      opts = {
        title:     string,
        message:   string,
        confirmLabel: string (défaut: "Oui, continuer"),
        cancelLabel:  string (défaut: "Pas maintenant"),
        onConfirm: function,
        onCancel:  function (optionnel)
      }
    */
    var overlay = document.getElementById('vl-modal-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'vl-modal-overlay';
      overlay.className = 'vl-modal-overlay';
      overlay.innerHTML = [
        '<div class="vl-modal" id="vl-modal">',
          '<div class="vl-modal-icon" id="vl-modal-icon"></div>',
          '<h3 id="vl-modal-title"></h3>',
          '<p id="vl-modal-message"></p>',
          '<div class="vl-modal-actions" id="vl-modal-actions"></div>',
        '</div>'
      ].join('');
      document.body.appendChild(overlay);
    }

    document.getElementById('vl-modal-icon').textContent    = opts.icon || '🎉';
    document.getElementById('vl-modal-title').textContent   = opts.title || '';
    document.getElementById('vl-modal-message').textContent = opts.message || '';

    var actions = document.getElementById('vl-modal-actions');
    actions.innerHTML = '';

    var btnConfirm = document.createElement('button');
    btnConfirm.className = 'btn-primary';
    btnConfirm.style.cssText = 'padding:14px 28px;font-size:.9rem;border-radius:12px;';
    btnConfirm.textContent = opts.confirmLabel || 'Oui, continuer →';
    btnConfirm.onclick = function() {
      _closeModal();
      if (opts.onConfirm) opts.onConfirm();
    };

    var btnCancel = document.createElement('button');
    btnCancel.className = 'btn-secondary';
    btnCancel.style.cssText = 'padding:14px 24px;font-size:.9rem;border-radius:12px;';
    btnCancel.textContent = opts.cancelLabel || 'Pas maintenant';
    btnCancel.onclick = function() {
      _closeModal();
      if (opts.onCancel) opts.onCancel();
    };

    actions.appendChild(btnConfirm);
    actions.appendChild(btnCancel);

    overlay.classList.add('open');
  }

  function _closeModal() {
    var overlay = document.getElementById('vl-modal-overlay');
    if (overlay) overlay.classList.remove('open');
  }

  /* ── TOAST (unifié, toujours sous la topbar) */
  function toast(msg, duration) {
    var t = document.getElementById('toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'toast';
      t.className = 'toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(function() {
      t.classList.remove('show');
    }, duration || 2800);
  }

  /* ── API PUBLIQUE */
  return {
    /* Auth */
    isLoggedIn:    isLoggedIn,
    getEmail:      getEmail,
    logout:        logout,
    requireAuth:   function() {
      if (!isLoggedIn()) { window.location.href = 'login.html'; return false; }
      return true;
    },

    /* Modules */
    isComplete:      isComplete,
    markComplete:    markComplete,
    isUnlocked:      isUnlocked,
    getProgress:     getProgress,
    setProgress:     setProgress,
    getCompletedList: getCompletedList,

    /* Journal */
    getJournal:      getJournal,
    saveJournal:     saveJournal,
    addJournalEntry: addJournalEntry,

    /* UI */
    toast:      toast,
    showModal:  showModal,
    closeModal: _closeModal,

    /* Utils */
    formatDate:     formatDate,
    formatDateTime: formatDateTime,

    /* Accès brut si nécessaire */
    get: get,
    set: set,
    KEYS: KEYS
  };

})();
