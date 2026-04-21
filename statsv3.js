import { Instance } from "cs_script/point_script";

// ╔══════════════════════════════════════════════════════════════╗
//  STATS SCRIPT — 1v1 Training Map
//
//  ── CE QUI EST TRACKÉ ─────────────────────────────────────────
//  • Kills             → OnPlayerKill  (filtre : attaquant humain)
//  • Headshots         → OnPlayerKill  (champ headshot)
//  • Shots fired       → OnGunFire     (filtre : owner humain)
//  • Damage dealt      → OnPlayerDamage (filtre : attaquant humain)
//  • KPM, HS%, Acc%    → calculés à la volée
//
//  ── ENTITÉS HAMMER REQUISES ──────────────────────────────────
//
//  point_worldtext (une par ligne de stat) :
//    @stats_kills      → "Kills: 0"
//    @stats_hs         → "HS: 0 (0%)"
//    @stats_acc        → "Accuracy: 0%"
//    @stats_kpm        → "KPM: 0.00"
//    @stats_dmg        → "Damage: 0"
//    @stats_time       → "Time: 00:00"
//    @stats_streak     → "Streak: 0 | Best: 0"
//    @stats_timer      → "⏱ --:--"  (affichage compte à rebours)
//
//  func_button ou prop_button :
//    @stats_btn_reset  → appeler Reset
//    @stats_btn_timer  → appeler ToggleTimer (start/stop 30s)
//
//  ── RÉSUMÉ CHAT ───────────────────────────────────────────────
//  À la fin du timer 30s, le script imprime les stats du
//  passage dans le chat (kills/hs/acc/kpm/dmg sur 30s).
// ╚══════════════════════════════════════════════════════════════╝


// ════════════════════════════════════════════════════════════
//  SCHEDULER
// ════════════════════════════════════════════════════════════
const scheduler = (() => {
    let tasks = [], running = false;
    function tick() {
        const now   = Instance.GetGameTime();
        const ready = tasks.filter(t => t.at <= now);
        tasks       = tasks.filter(t => t.at > now);
        for (const t of ready) {
            try { t.fn(); } catch(e) { Instance.Msg(`[sched] ${e}\n`); }
        }
        if (tasks.length > 0)
            Instance.SetNextThink(tasks.reduce((m, t) => Math.min(m, t.at), Infinity));
        else running = false;
    }
    return {
        setTimeout(delay, fn) {
            const at = Instance.GetGameTime() + Math.max(0, delay);
            tasks.push({ at, fn });
            if (!running) { running = true; Instance.SetThink(tick); }
            Instance.SetNextThink(tasks.reduce((m, t) => Math.min(m, t.at), Infinity));
        }
    };
})();


// ════════════════════════════════════════════════════════════
//  CONFIG
// ════════════════════════════════════════════════════════════
const TIMER_DURATION_SEC = 30;     // durée du timer en secondes
const DISPLAY_REFRESH_SEC = 0.5;   // fréquence de mise à jour de l'affichage
const CANDIDATE_OUTPUTS = ["OnPressed", "OnUse", "OnPlayerUse", "OnStartTouch"];


// ════════════════════════════════════════════════════════════
//  UTILITAIRES
// ════════════════════════════════════════════════════════════
function _log(msg)  { Instance.Msg(`[stats] ${msg}\n`); }
function _say(msg)  { Instance.ServerCommand(`say ${msg}`); }

function _setText(entityName, msg) {
    Instance.EntFireAtName({ name: entityName, input: "SetMessage", value: String(msg) });
}

function _wireButton(entityName, handler) {
    const ent = Instance.FindEntityByName(entityName);
    if (!ent) { _log(`Button not found: ${entityName}`); return; }
    for (const out of CANDIDATE_OUTPUTS) {
        try { Instance.ConnectOutput(ent, out, handler); } catch {}
    }
    _log(`Wired: ${entityName}`);
}

function _pad2(n) { return String(Math.floor(n)).padStart(2, "0"); }

function _fmtTime(totalSecs) {
    const m = Math.floor(totalSecs / 60);
    const s = Math.floor(totalSecs % 60);
    return `${_pad2(m)}:${_pad2(s)}`;
}

function _r1(n) { return Math.round(n * 10) / 10; }
function _r2(n) { return Math.round(n * 100) / 100; }
function _pct(a, b) { return b > 0 ? Math.round((a / b) * 100) : 0; }

/**
 * Vérifie si une entité (pawn ou controller) est un joueur
 * humain (non-bot). Retourne le pawn si oui, null sinon.
 */
function _isHumanPawn(entity) {
    if (!entity) return null;
    try {
        let ctrl, pawn;
        if (typeof entity.GetPlayerController === "function") {
            pawn = entity;
            ctrl = entity.GetPlayerController();
        } else if (typeof entity.GetPlayerPawn === "function") {
            ctrl = entity;
            pawn = entity.GetPlayerPawn();
        } else {
            return null;
        }
        if (!ctrl || ctrl.IsBot?.()) return null;
        return pawn ?? null;
    } catch { return null; }
}


// ════════════════════════════════════════════════════════════
//  STATS — STRUCTURE
//
//  On distingue deux niveaux :
//    • session : depuis le dernier Reset (totaux affichés à l'écran)
//    • snapshot : pris au démarrage du timer (pour calculer le delta)
// ════════════════════════════════════════════════════════════

function _newStats() {
    return {
        kills:      0,
        headshots:  0,
        shots:      0,   // coups tirés
        damage:     0,   // dégâts infligés
        streak:     0,
        bestStreak: 0,
        startTime:  null,  // null = pas encore de premier kill/tir
    };
}

let session  = _newStats();
let snapshot = null;  // pris au démarrage du timer


// ════════════════════════════════════════════════════════════
//  TIMER
// ════════════════════════════════════════════════════════════
let timerRunning    = false;
let timerStartedAt  = 0;      // Instance.GetGameTime() au départ
let timerGeneration = 0;      // pour annuler le loop si on stoppe


function _timerEnd() {
    if (!timerRunning) return;
    timerRunning = false;

    // Calculer le delta entre snapshot et maintenant
    const delta = {
        kills:     session.kills     - (snapshot?.kills     ?? 0),
        headshots: session.headshots - (snapshot?.headshots ?? 0),
        shots:     session.shots     - (snapshot?.shots     ?? 0),
        damage:    session.damage    - (snapshot?.damage    ?? 0),
    };

    const acc    = _pct(delta.kills, delta.shots);
    const hsPct  = _pct(delta.headshots, delta.kills);
    const kpm    = _r2(delta.kills / (TIMER_DURATION_SEC / 60));

    // Afficher le résultat dans le chat
    const lines = [
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        `[ STATS — ${TIMER_DURATION_SEC}s ]`,
        `Kills: ${delta.kills}  |  Headshots: ${delta.headshots} (${hsPct}%)`,
        `Shots: ${delta.shots}  |  Accuracy: ${acc}%`,
        `KPM: ${kpm}  |  Damage: ${delta.damage}`,
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    ];

    let delay = 0;
    for (const line of lines) {
        const d = delay;
        scheduler.setTimeout(d, () => _say(line));
        delay += 0.28;
    }

    snapshot = null;
    _setText("@stats_timer", `⏱ --:--`);
    _log("Timer ended.");
}

function _timerTick(generation) {
    if (!timerRunning || generation !== timerGeneration) return;

    const elapsed   = Instance.GetGameTime() - timerStartedAt;
    const remaining = TIMER_DURATION_SEC - elapsed;

    if (remaining <= 0) {
        _setText("@stats_timer", "⏱ 00:00");
        _timerEnd();
        return;
    }

    _setText("@stats_timer", `⏱ ${_fmtTime(remaining)}`);
    scheduler.setTimeout(0.25, () => _timerTick(generation));
}

function startTimer() {
    if (timerRunning) {
        // Stop le timer en cours sans imprimer les résultats
        timerRunning = false;
        timerGeneration++;
        snapshot = null;
        _setText("@stats_timer", "⏱ --:--");
        _say("[Stats] Timer annulé.");
        _log("Timer stopped manually.");
        return;
    }

    // Prendre un snapshot des stats actuelles
    snapshot = {
        kills:     session.kills,
        headshots: session.headshots,
        shots:     session.shots,
        damage:    session.damage,
    };

    timerRunning   = true;
    timerStartedAt = Instance.GetGameTime();
    timerGeneration++;

    const gen = timerGeneration;
    _say(`[Stats] ⏱ Timer démarré — ${TIMER_DURATION_SEC}s !`);
    _log(`Timer started (gen ${gen}).`);

    // Lancer le loop de tick
    _timerTick(gen);
}


// ════════════════════════════════════════════════════════════
//  RESET
// ════════════════════════════════════════════════════════════

function resetStats() {
    // Annuler le timer si actif
    if (timerRunning) {
        timerRunning = false;
        timerGeneration++;
        snapshot = null;
    }

    session = _newStats();

    _setText("@stats_kills",  "Kills: 0");
    _setText("@stats_hs",     "HS: 0 (0%)");
    _setText("@stats_acc",    "Accuracy: 0%");
    _setText("@stats_kpm",    "KPM: 0.00");
    _setText("@stats_dmg",    "Damage: 0");
    _setText("@stats_time",   "Time: 00:00");
    _setText("@stats_streak", "Streak: 0 | Best: 0");
    _setText("@stats_timer",  "⏱ --:--");

    _say("[Stats] ✔ Statistiques réinitialisées.");
    _log("Stats reset.");
}


// ════════════════════════════════════════════════════════════
//  AFFICHAGE — mise à jour des point_worldtext
// ════════════════════════════════════════════════════════════

function _updateDisplay() {
    const now     = Instance.GetGameTime();
    const elapsed = session.startTime !== null ? now - session.startTime : 0;
    const minutes = elapsed / 60;

    const hsPct  = _pct(session.headshots, session.kills);
    const accPct = _pct(session.kills, session.shots);     // kills/shots (taux de kill par tir)
    const kpm    = minutes > 0 ? _r2(session.kills / minutes) : 0;

    _setText("@stats_kills",  `Kills: ${session.kills}`);
    _setText("@stats_hs",     `HS: ${session.headshots} (${hsPct}%)`);
    _setText("@stats_acc",    `Accuracy: ${accPct}%`);
    _setText("@stats_kpm",    `KPM: ${kpm}`);
    _setText("@stats_dmg",    `Damage: ${session.damage}`);
    _setText("@stats_time",   `Time: ${_fmtTime(elapsed)}`);
    _setText("@stats_streak", `Streak: ${session.streak}  |  Best: ${session.bestStreak}`);
}

// Loop de rafraîchissement permanent
function _startDisplayLoop() {
    function loop() {
        _updateDisplay();
        scheduler.setTimeout(DISPLAY_REFRESH_SEC, loop);
    }
    scheduler.setTimeout(DISPLAY_REFRESH_SEC, loop);
}


// ════════════════════════════════════════════════════════════
//  DÉTECTION HEADSHOT — mode DEBUG
//
//  DEBUG_HS = true → affiche les valeurs brutes dans la console
//  CS2 à chaque dégât/kill humain.
//  Ouvre la console CS2 et cherche "[stats]" pour les voir.
//  Une fois le bon hitgroup trouvé, passe DEBUG_HS à false.
// ════════════════════════════════════════════════════════════

const DEBUG_HS = true;  // ← false pour désactiver les logs

let _lastHitWasHead = false;
let _dbgHitgroup    = "?";   // valeur brute du dernier hitgroup reçu
let _dbgHeadshot    = "?";   // valeur brute du dernier headshot reçu


// ════════════════════════════════════════════════════════════
//  ÉVÉNEMENTS — DÉGÂTS
// ════════════════════════════════════════════════════════════

Instance.OnPlayerDamage?.(({ attacker, victim, damage, hitgroup }) => {
    try {
        if (!_isHumanPawn(attacker)) return;

        // Dégâts totaux
        const dmg = typeof damage === "number" ? damage : 0;
        if (dmg > 0) session.damage += Math.round(dmg);

        // Stocker pour debug
        _dbgHitgroup = hitgroup;

        // Tester 1 ET 2 — on ne sait pas encore lequel CS2 utilise
        _lastHitWasHead = (hitgroup === 1 || hitgroup === 2);

        if (DEBUG_HS) {
            Instance.Msg(`[stats][DMG] dmg=${dmg} hitgroup=${hitgroup} typeof=${typeof hitgroup} _lastHitWasHead=${_lastHitWasHead}\n`);
        }

    } catch(e) { _log(`OnPlayerDamage error: ${e}`); }
});


// ════════════════════════════════════════════════════════════
//  ÉVÉNEMENTS — KILLS
// ════════════════════════════════════════════════════════════

Instance.OnPlayerKill?.(({ attacker, victim, headshot }) => {
    try {
        if (!_isHumanPawn(attacker)) return;
        if (attacker === victim) return;

        if (session.startTime === null) {
            session.startTime = Instance.GetGameTime();
        }

        // Stocker pour debug
        _dbgHeadshot = headshot;

        if (DEBUG_HS) {
            Instance.Msg(`[stats][KILL] headshot=${headshot} typeof=${typeof headshot} | _lastHitWasHead=${_lastHitWasHead} | _dbgHitgroup=${_dbgHitgroup}\n`);
        }

        session.kills++;
        session.streak++;
        if (session.streak > session.bestStreak) session.bestStreak = session.streak;

        // Tester toutes les formes possibles
        const isHS = headshot === true
                  || headshot === 1
                  || headshot === "1"
                  || _lastHitWasHead;

        if (isHS) session.headshots++;

        _lastHitWasHead = false;

        _log(`Kill #${session.kills}${isHS ? " (HS)" : ""} streak=${session.streak}`);
        _updateDisplay();

    } catch(e) { _log(`OnPlayerKill error: ${e}`); }
});


// ════════════════════════════════════════════════════════════
//  ÉVÉNEMENTS — MORT DU JOUEUR (streak brisée)
// ════════════════════════════════════════════════════════════

Instance.OnPlayerKill?.(({ attacker, victim }) => {
    try {
        if (_isHumanPawn(victim)) {
            session.streak  = 0;
            _lastHitWasHead = false;
        }
    } catch {}
});


// ════════════════════════════════════════════════════════════
//  ÉVÉNEMENTS — COUPS TIRÉS
//
//  OnGunFire reçoit { weapon }.
//  weapon.GetOwner() renvoie le pawn propriétaire.
//  On filtre pour ne compter que les tirs du joueur humain.
//
//  ⚠️  Les grenades déclenchent aussi OnGunFire — on filtre
//      en vérifiant que le nom de l'arme commence par "weapon_"
//      et n'est pas une nade.
// ════════════════════════════════════════════════════════════

const GRENADE_CLASSNAMES = new Set([
    "weapon_flashbang", "weapon_hegrenade", "weapon_smokegrenade",
    "weapon_molotov", "weapon_incgrenade", "weapon_decoy",
]);

Instance.OnGunFire?.((ctx) => {
    try {
        const weapon = ctx?.weapon;
        if (!weapon) return;

        // Récupérer le pawn propriétaire de l'arme
        const owner = weapon.GetOwner?.();
        if (!_isHumanPawn(owner)) return;

        // Exclure les grenades
        const weaponName = weapon.GetData?.()?.GetName?.() ?? "";
        if (GRENADE_CLASSNAMES.has(weaponName)) return;

        // Démarrer le chrono au premier tir
        if (session.startTime === null) {
            session.startTime = Instance.GetGameTime();
        }

        session.shots++;
    } catch(e) { _log(`OnGunFire error: ${e}`); }
});


// ════════════════════════════════════════════════════════════
//  CÂBLAGE BOUTONS
// ════════════════════════════════════════════════════════════

function wireButtons() {
    _wireButton("@stats_btn_reset", () => resetStats());
    _wireButton("@stats_btn_timer", () => startTimer());
}


// ════════════════════════════════════════════════════════════
//  SCRIPT INPUTS (Hammer I/O)
// ════════════════════════════════════════════════════════════

Instance.OnScriptInput("Init",        () => { wireButtons(); _startDisplayLoop(); });
Instance.OnScriptInput("WireAll",     () => wireButtons());
Instance.OnScriptInput("Reset",       () => resetStats());
Instance.OnScriptInput("StartTimer",  () => startTimer());
Instance.OnScriptInput("ToggleTimer", () => startTimer());


// ════════════════════════════════════════════════════════════
//  LIFECYCLE
// ════════════════════════════════════════════════════════════

Instance.OnActivate(() => {
    _log("Stats script activated.");
    wireButtons();
    resetStats();         // initialise l'affichage proprement
    _startDisplayLoop();  // démarre la boucle de rafraîchissement
});

Instance.OnRoundStart?.(() => {
    // Ne pas reset automatiquement — le joueur gère ça avec le bouton.
    // Par contre on remet le streak à 0 (nouveau round = nouveau départ).
    session.streak = 0;
    _log("Round start — streak reset.");
});

Instance.OnScriptReload({
    before: () => _log("Reloading..."),
    after:  () => {
        wireButtons();
        _startDisplayLoop();
        _updateDisplay();
        _log("Reloaded.");
    },
});

_log("stats.js loaded — waiting for events.");
