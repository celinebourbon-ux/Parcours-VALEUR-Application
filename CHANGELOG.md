# CHANGELOG — App V.A.L.E.U.R©

## Audit & Correction — Passe 2 — 2026-03-11

---

### module2.html — 5 bugs critiques corrigés

**Bug 1 — Barre de progression orpheline** : les éléments `.pb-step` (L, E, U, R) flottaient sans parent et la lettre V était absente. Remplacement complet du bloc par un `<div id="progress-bar"><div class="pb-steps">` avec les 6 étapes V·A·L·E·U·R correctement structurées (done/active/locked). Progression affichée à 33% (module 2 = 2e sur 6).

**Bug 2 — `id="scroll-line"` manquant** : ajout de `<div id="scroll-line">` fixe en haut du `<body>` avant le progress-bar. Le JS à la ligne 1850 (`document.getElementById('scroll-line').style.width`) ne provoquait plus d'erreur null.

**Bug 3 — Double déclaration `var breathPhase`** : la seconde déclaration (ligne 1920, `var breathPhase=0,breathTimer=null,breathRunning=false`) contenait `breathPhase` qui était déjà déclaré ligne 1450. Suppression du `var breathPhase=0,` de la seconde déclaration.

**Bug 4 — Double définition `launchConfetti()`** : deux versions coexistaient — une DOM-based (ligne 1847, `confetti-piece` divs) et une canvas-based (ligne 1977). La canvas-based écrasait l'autre silencieusement. Remplacement de la première par un commentaire `/* [launchConfetti() définie dans le bloc suivant] */`.

**Bug 5 — `VALEUR_PROGRESS.render('module2')` dans le template PDF** : l'appel était dans un HTML généré ouvert dans une nouvelle fenêtre (sans `valeur-config.js` chargé). Ajout d'une garde `if(typeof VALEUR_PROGRESS!=='undefined'){...}` pour éviter `ReferenceError`.

**Bonus — `<header class="module-header">` supprimé** : cet élément était caché via `display:none!important` mais occupait du DOM. Remplacé par un commentaire. La hero `.valeur-hero` prend le relais.

**Bonus — Dot navigation corrigée** : les `onclick="scrollToSection(n)"` utilisaient un scroll basé sur `data-section` alors que module2 gère la navigation par show/hide. Mis à jour en `jumpSection(1-4)` compatible avec `goToSection()`.

**Bonus — Bouton "Terminer" dupliqué** : le bouton dans `.quiz-results` appelait `VALEUR_PROGRESS.complete('module2'); showCelebration()`. Le bouton dans `.section-nav` appelait uniquement `showCelebration()`. Suppression du bouton dans quiz-results, mise à jour du bouton section-nav en `completeModule();showCelebration()` (complète le localStorage + VALEUR_PROGRESS + célébration).

**Bonus — Typographie** : `body{font-family:'Segoe UI',system-ui}` → `'Jost', sans-serif; font-weight:300; font-size:16px`. Ajout de `h1,h2,h3 { font-family:'Cormorant Garamond',serif }`.

### Navigation — Standardisation des URLs de retour

Uniformisation vers `https://celinebourbon-ux.github.io/HomePageAppliValeur/dashboard.html` :
- **module2.html** : 3 occurrences de `HomePageAppliValeur/"` → `/dashboard.html"`
- **module5.html** : bouton "Retour à l'accueil" et redirect auth → `/dashboard.html`
- **module6.html** : bouton ⌂ progress bar + lien popup-final → `/dashboard.html`
- **module1.html** : redirect `window.location.href` (no-session) → `/dashboard.html`

### valeur-design-system.css — Ajouts

**Section 18 — Typographie premium** : tailles minimales appliquées globalement :
- Corps `.acc-body`, `p`, `li`, etc. → `font-size: 16px`
- Labels `.p-label`, `.pb-name` → `12px`
- Copyright → `11px`
- Boutons `.btn-prev/.btn-next` → `font-size: 16px; padding: 14px 32px`
- Headings → `font-family: 'Cormorant Garamond', serif`

**Section 19 — Composant `#progress-bar` (`.pb-steps`)** : styles unifiés pour la barre V·A·L·E·U·R en-tête de chaque module. États `done` (or), `active` (couleur `--mc`), `locked` (muted). Fond glassmorphism sticky.

**Section 20 — `#scroll-line`** : élément de progression du scroll, gradient or, z-index 9999.

---

## Audit & Correction — Passe 1 — 2026-03-11

---

## AXE 1 — Bugs de progression (critiques)

### valeur-config.js
- **`isM0Done()` fallback** (l. 65) : ajout d'un check direct `localStorage.getItem('valeur_module0_complete') === 'true'` avant la vérification email-spécifique. Garantit que la complétion de M0 est correctement détectée par la barre de progression.

### module0.html
- **Bug A+C** (l. 894) : `localStorage.setItem('VALEUR_module0_complete','1')` → `localStorage.setItem('valeur_module0_complete','true')`. Correction de la casse (MAJUSCULES → minuscules) et standardisation de la valeur (`'1'` → `'true'`). Ce bug empêchait le déverrouillage du Module 1.

### module1.html
- **completeModule()** (l. 1359) : ajout de `localStorage.setItem('valeur_module1_complete','true')` et `VALEUR_PROGRESS.complete('module1')`. Correction du texte copié-collé "Module 3 Validé" → "Module 1 — VOIR — Validé !".

### module2.html
- **completeModule()** (l. 1957) : ajout de `localStorage.setItem('valeur_module2_complete','true')` et `VALEUR_PROGRESS.complete('module2')`. Correction du texte "Module 3 Validé" → "Module 2 — ACCUEILLIR — Validé !".

### module3.html
- **Bug B** — **completeModule()** (l. 1866) : ajout de `localStorage.setItem('valeur_module3_complete','true')` et `VALEUR_PROGRESS.complete('module3')`. La fonction n'écrivait aucune clé localStorage, rendant le déverrouillage du Module 4 impossible.

### module4.html
- **completeModule()** (l. 2207) : ajout de `localStorage.setItem('valeur_module4_complete','true')` et `VALEUR_PROGRESS.complete('module4')`. Correction du texte "Module 3 Validé" → "Module 4 — EXPLORER — Validé !".

### module5.html
- **completeModule()** (l. 1614) : ajout de `localStorage.setItem('valeur_module5_complete','true')` et `VALEUR_PROGRESS.complete('module5')`. Correction du texte "Module 3 Validé" → "Module 5 — UNIFIER — Validé !".

### module6.html
- **Bug CRITIQUE — fonctions dupliquées** (l. 1530 + 1701) : la deuxième déclaration de `function completeModule()` écrasait la première (code mort). La première définissait le `localStorage.setItem`, la seconde ne faisait que les effets visuels. **Fusion des deux** : suppression du premier bloc (l. 1530-1534), réécriture du second (l. 1701) avec : `localStorage.setItem('valeur_module6_complete','true')`, `VALEUR_PROGRESS.complete('module6')`, affichage du `popup-final`, confettis, toast, et correction du texte "Module 3 Validé" → "Module 6 — RENFORCER — Validé !".
- **`launchConfetti()` dupliqué** (l. 1537 + 1711) : suppression du premier bloc (DOM-based, écrasé par le second canvas-based).

---

## AXE 2 — Cohérence visuelle

### module0.html
- **CSS variables** : ajout de `--mod:#8FA3BC`, `--mod-light:#B8C9D8`, `--mod-glow`, `--mod-glass`, `--mc:#8FA3BC`, `--mc-glow` dans `:root`. Couleur du module "Comprendre" (gris-bleu neutre) conforme à la spec.
- **Aurora orb1** : couleur changée de `var(--violet)` → `var(--mod)` (gris-bleu #8FA3BC) pour correspondre à la couleur du module.
- **Copyright** : texte enrichi avec titre de psychologue, titre du livre et éditeur : "© Méthode V.A.L.E.U.R© · Céline Bourbon, Psychologue · *De la peur à la joie d'être soi*, Éd. L'Harmattan · Tous droits réservés".

### module1.html
- **CSS variables** : ajout de `--mc:#E05555`, `--mc-glow:rgba(224,85,85,.45)` dans `:root`.
- **Anti-copy** (l. 1266) : ajout des listeners `selectstart` (avec exemption TEXTAREA/INPUT/SELECT) et `dragstart`. Mise à jour de `copy` pour exempter TEXTAREA/INPUT. Simplification du listener `keydown`.

### module2.html
- **CSS variables** : ajout de `--mc:#E07C3A`, `--mc-glow:rgba(224,124,58,.45)` dans `:root`.
- **Anti-copy** (l. 1864) : ajout des listeners `selectstart` (avec exemption TEXTAREA/INPUT/SELECT) et `dragstart`. Mise à jour de `copy` pour exempter TEXTAREA/INPUT.

### module3.html
- **CSS variables** : ajout de `--mc:#D4AC0D`, `--mc-glow:rgba(212,172,13,.45)` dans `:root`.
- **Anti-copy** (l. 1773) : ajout des listeners `selectstart` (avec exemption TEXTAREA/INPUT/SELECT) et `dragstart`. Mise à jour de `copy` pour exempter TEXTAREA/INPUT.

### module4.html
- **CSS variables** : ajout de `--mc:#38A169`, `--mc-glow:rgba(56,161,105,.45)` dans `:root`.
- **Anti-copy** (l. 2114) : ajout des listeners `selectstart` (avec exemption TEXTAREA/INPUT/SELECT) et `dragstart`. Mise à jour de `copy` pour exempter TEXTAREA/INPUT.

### module5.html
- **CSS variables** : ajout de `--mc:#3A8FE0`, `--mc-glow:rgba(58,143,224,.45)` dans `:root`.
- **Anti-copy** (l. 1521) : ajout des listeners `selectstart` (avec exemption TEXTAREA/INPUT/SELECT) et `dragstart`. Mise à jour de `copy` pour exempter TEXTAREA/INPUT.

### module6.html
- **CSS variables** : ajout de `--mc:#8A5CF6`, `--mc-glow:rgba(138,92,246,.45)` dans `:root`.
- **Anti-copy** (l. 1583) : ajout des listeners `selectstart` (avec exemption TEXTAREA/INPUT/SELECT) et `dragstart`. Mise à jour de `copy` pour exempter TEXTAREA/INPUT.

---

## Récapitulatif standard appliqué

Chaque module appelle désormais en fin de complétion :
1. `localStorage.setItem('valeur_module[N]_complete', 'true')` — clé directe pour le système de déverrouillage
2. `VALEUR_PROGRESS.complete('module[N]')` — mise à jour barre de progression + clés email-spécifiques
3. Confettis + toast + indicateur visuel (bouton, unlock-preview)

## Vérification de la chaîne complète

```
M0 complété → valeur_module0_complete = 'true' → M1 déverrouillé ✓
M1 complété → valeur_module1_complete = 'true' → M2 déverrouillé ✓
M2 complété → valeur_module2_complete = 'true' → M3 déverrouillé ✓
M3 complété → valeur_module3_complete = 'true' → M4 déverrouillé ✓
M4 complété → valeur_module4_complete = 'true' → M5 déverrouillé ✓
M5 complété → valeur_module5_complete = 'true' → M6 déverrouillé ✓
M6 complété → valeur_module6_complete = 'true' → 100% progression ✓
```
