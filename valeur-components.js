/**
 * V.A.L.E.U.R© — Composants UI Unifiés v2
 * Accordéon + Journal + Toast + Confetti + Navigation
 * © Céline Bourbon — Tous droits réservés
 */

/* ══════════════════════════════════════════════════════
   1. ACCORDÉON INTRA-MODULE
══════════════════════════════════════════════════════ */
function pbInitAccordion() {
  const items = document.querySelectorAll('.pb-accordion-item, .accordion-item');
  if (!items.length) return;

  items.forEach((item, index) => {
    const btn = item.querySelector('.pb-accordion-btn, .accordion-btn');
    const content = item.querySelector('.pb-accordion-content, .accordion-content');
    if (!btn || !content) return;

    // Ouvrir la première section par défaut
    if (index === 0) {
      item.classList.add('open');
      content.style.maxHeight = content.scrollHeight + 'px';
      content.style.opacity = '1';
      btn.setAttribute('aria-expanded', 'true');
    } else {
      btn.setAttribute('aria-expanded', 'false');
    }

    btn.addEventListener('click', function () {
      const isOpen = item.classList.contains('open');

      // Fermer tous les autres
      items.forEach(other => {
        if (other !== item && other.classList.contains('open')) {
          other.classList.remove('open');
          const otherContent = other.querySelector('.pb-accordion-content, .accordion-content');
          const otherBtn = other.querySelector('.pb-accordion-btn, .accordion-btn');
          if (otherContent) { otherContent.style.maxHeight = '0'; otherContent.style.opacity = '0'; }
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle l'élément cliqué
      item.classList.toggle('open', !isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));

      if (!isOpen) {
        content.style.maxHeight = content.scrollHeight + 'px';
        content.style.opacity = '1';
        // Smooth scroll vers la section ouverte
        setTimeout(() => { item.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 150);
        // Highlight temporaire (gold)
        item.style.borderColor = 'rgba(201,168,76,0.45)';
        setTimeout(() => { item.style.borderColor = ''; }, 900);
        // Marquer section comme vue
        _openedSections.add(index);
      } else {
        content.style.maxHeight = '0';
        content.style.opacity = '0';
      }

      updateIntraProgress();
    });
  });

  // Marquer la première section comme vue au chargement
  _openedSections.add(0);
  updateIntraProgress();
}

/* ══════════════════════════════════════════════════════
   2. PROGRESSION INTRA-MODULE
══════════════════════════════════════════════════════ */
const _openedSections = new Set();

function updateIntraProgress() {
  const items = document.querySelectorAll('.pb-accordion-item, .accordion-item');
  const total = items.length;
  if (!total) return;

  const openIdx = Array.from(items).findIndex(it => it.classList.contains('open'));
  const current = openIdx >= 0 ? openIdx + 1 : 0;

  // Label texte
  const label = document.querySelector('.pb-intra-label');
  if (label) label.textContent = `Section ${current} / ${total}`;

  // Barre fill (basée sur les sections ouvertes = vues)
  const fill = document.querySelector('.pb-intra-bar-fill');
  if (fill) fill.style.width = ((_openedSections.size / total) * 100) + '%';

  checkModuleCompletion(total);
}

/* ══════════════════════════════════════════════════════
   3. VÉRIFICATION COMPLÉTION MODULE
══════════════════════════════════════════════════════ */
function checkModuleCompletion(total) {
  if (!total) return;
  if (_openedSections.size < total) return;

  const moduleId = document.body.dataset.module || 'module0';
  const userEmail = localStorage.getItem('valeur_user_email') || 'default';
  const key = `valeur_done_${moduleId}_${userEmail}`;

  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, Date.now().toString());

    // Célébration
    setTimeout(() => {
      pbConfetti({ particleCount: 100, spread: 70 });
      pbToast('🎉 Bravo ! Module complété avec succès !', 'success', 5000);
    }, 400);

    updateProgressCircles();
  }
}

/* ══════════════════════════════════════════════════════
   4. CERCLES DE PROGRESSION GLOBALE
══════════════════════════════════════════════════════ */
function updateProgressCircles() {
  const userEmail = localStorage.getItem('valeur_user_email') || 'default';
  const circles = document.querySelectorAll('.pb-circle-step');
  circles.forEach((circle, idx) => {
    const done = localStorage.getItem(`valeur_done_module${idx}_${userEmail}`);
    if (done) {
      circle.classList.remove('active');
      circle.classList.add('done');
    }
  });
}

/* ══════════════════════════════════════════════════════
   5. JOURNAL DE BORD UNIFIÉ
══════════════════════════════════════════════════════ */
function pbInitJournal() {
  const fab  = document.querySelector('.pb-journal-fab, #journal-fab, .journal-fab');
  const drawer = document.querySelector('.pb-journal-drawer, .pb-drawer');
  const overlay = document.querySelector('.pb-journal-overlay, .pb-drawer-overlay');
  const textarea = document.querySelector('#pb-journal-input, .pb-journal-input');
  const charCount = document.querySelector('.pb-char-count');
  const btnSave  = document.querySelector('.pb-btn-save');
  const btnClear = document.querySelector('.pb-btn-clear');

  if (!fab || !drawer) return;

  const moduleId   = document.body.dataset.module || 'module0';
  const userEmail  = localStorage.getItem('valeur_user_email') || 'default';
  const storageKey = `valeur_journal_${moduleId}_${userEmail}`;

  // Charger texte sauvegardé
  if (textarea) {
    const saved = localStorage.getItem(storageKey) || '';
    textarea.value = saved;
    if (charCount) charCount.textContent = `${saved.length} / 1500`;
  }

  const openDrawer = () => {
    drawer.classList.add('open');
    if (overlay) overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (textarea) setTimeout(() => textarea.focus(), 300);
  };

  const closeDrawer = () => {
    drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
  };

  fab.addEventListener('click', openDrawer);
  if (overlay) overlay.addEventListener('click', closeDrawer);

  const closeBtn = drawer.querySelector('.pb-drawer-close');
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

  // Compteur caractères
  if (textarea && charCount) {
    textarea.addEventListener('input', () => {
      const len = textarea.value.length;
      charCount.textContent = `${len} / 1500`;
      charCount.style.color = len > 1400 ? 'var(--c-red)' : len > 1200 ? 'var(--c-orange)' : 'var(--text-dim)';
    });
  }

  // Sauvegarder
  if (btnSave && textarea) {
    btnSave.addEventListener('click', () => {
      localStorage.setItem(storageKey, textarea.value);
      pbToast('✓ Journal sauvegardé', 'success');
      closeDrawer();
    });
    // Auto-save toutes les 30s
    setInterval(() => {
      if (textarea.value.trim()) localStorage.setItem(storageKey, textarea.value);
    }, 30000);
  }

  // Effacer
  if (btnClear && textarea) {
    btnClear.addEventListener('click', () => {
      if (textarea.value.trim() && !confirm('Effacer votre journal pour ce module ?')) return;
      textarea.value = '';
      if (charCount) charCount.textContent = '0 / 1500';
      localStorage.removeItem(storageKey);
      pbToast('Journal effacé', 'info');
    });
  }

  // Fermer avec Echap
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) closeDrawer();
  });
}

/* ══════════════════════════════════════════════════════
   6. TOAST NOTIFICATIONS
══════════════════════════════════════════════════════ */
function pbToast(message, type = 'success', duration = 3000) {
  let toast = document.getElementById('pb-toast-global');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'pb-toast-global';
    toast.className = 'pb-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.className = `pb-toast ${type}`;
  toast.offsetHeight; // force reflow
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), duration);
}

/* ══════════════════════════════════════════════════════
   7. CONFETTI (Complétion Module)
══════════════════════════════════════════════════════ */
function pbConfetti(opts = {}) {
  const { particleCount = 80, spread = 60, duration = 3200 } = opts;
  let canvas = document.getElementById('pb-confetti-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'pb-confetti-canvas';
    Object.assign(canvas.style, { position:'fixed', top:'0', left:'0', width:'100%', height:'100%', pointerEvents:'none', zIndex:'9999' });
    document.body.appendChild(canvas);
  }
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');
  const colors = ['#C9A84C','#F0D080','#2ECC71','#3182CE','#E74C3C','#8E44AD','#F1C40F'];
  const particles = Array.from({ length: particleCount }, () => ({
    x: Math.random() * canvas.width,
    y: -20,
    w: Math.random() * 10 + 4,
    h: Math.random() * 6 + 3,
    color: colors[Math.floor(Math.random() * colors.length)],
    rot: Math.random() * 360,
    rotSpeed: (Math.random() - 0.5) * 8,
    vx: (Math.random() - 0.5) * spread * 0.2,
    vy: Math.random() * 3 + 2,
  }));

  let start = null;
  const animate = ts => {
    if (!start) start = ts;
    const elapsed = ts - start;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.rot += p.rotSpeed;
      const alpha = Math.max(0, 1 - elapsed / duration);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
      ctx.rotate(p.rot * Math.PI / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    if (elapsed < duration) requestAnimationFrame(animate);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  };
  requestAnimationFrame(animate);
}

/* ══════════════════════════════════════════════════════
   8. INITIALISATION GLOBALE
══════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function () {
  pbInitAccordion();
  pbInitJournal();
  updateProgressCircles();

  // Animation d'entrée
  const container = document.querySelector('.module-container, .container');
  if (container) {
    container.style.opacity = '0';
    container.style.transform = 'translateY(24px)';
    requestAnimationFrame(() => {
      container.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      container.style.opacity = '1';
      container.style.transform = 'none';
    });
  }
});
