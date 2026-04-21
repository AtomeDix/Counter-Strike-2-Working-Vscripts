import { Instance, CSGearSlot } from "cs_script/point_script";

// ╔══════════════════════════════════════════════════════════════╗
//  TRAINING MAP — SCRIPT COMPLET
//  ┌─ Module 1 : Bot Control (ADAD, Crouch, Teams)
//  ├─ Module 2 : Weapon & Knife Selection (joueur T)
//  └─ Module 3 : Music Player (point_soundevent playlist)
//
//  ── BOUTONS HAMMER ATTENDUS ──────────────────────────────────
//  Bots   : @bot_btn_adad  @bot_btn_adad_easy/medium/hard
//           @bot_btn_crouch  @bot_btn_crouch_easy/medium/hard
//  Armes  : @weapon_btn_<key>   (ex: @weapon_btn_ak47)
//  Couteau: @knife_btn_<key>    (ex: @knife_btn_karambit)
//  Musique: @music_btn_play  @music_btn_pause  @music_btn_stop
//           @music_btn_prev  @music_btn_next
//           @music_btn_shuffle  @music_btn_repeat  (optionnel)
//           @music_display  (point_worldtext, optionnel)
//           @music_btn_track_01 … (accès direct, optionnel)
// ╚══════════════════════════════════════════════════════════════╝


// ════════════════════════════════════════════════════════════
//  SCHEDULER  (partagé par tous les modules)
// ════════════════════════════════════════════════════════════
const scheduler = (() => {
    let tasks = [], running = false;
    function tick() {
        const now = Instance.GetGameTime();
        const ready = tasks.filter(t => t.at <= now);
        tasks = tasks.filter(t => t.at > now);
        for (const t of ready) { try { t.fn(); } catch(e) { Instance.Msg(`[scheduler] ${e}\n`); } }
        if (tasks.length > 0) Instance.SetNextThink(tasks.reduce((m,t) => Math.min(m,t.at), Infinity));
        else running = false;
    }
    return {
        setTimeout(delay, fn) {
            const at = Instance.GetGameTime() + Math.max(0, delay);
            tasks.push({ at, fn });
            if (!running) { running = true; Instance.SetThink(tick); }
            Instance.SetNextThink(tasks.reduce((m,t) => Math.min(m,t.at), Infinity));
        }
    };
})();


// ════════════════════════════════════════════════════════════
//  UTILITAIRES PARTAGÉS
// ════════════════════════════════════════════════════════════
let DEBUG = false;
function _log(msg)   { Instance.Msg(`[training] ${msg}\n`); }
function _debug(msg) { if (DEBUG) _log(msg); }
function _say(msg)   { Instance.ServerCommand(`say ${msg}`); }
function _cmd(c)     { Instance.ServerCommand(c); }

const CANDIDATE_OUTPUTS = ["OnPressed", "OnUse", "OnPlayerUse", "OnStartTouch"];

function _fire(name, input, value = "", delay = 0) {
    Instance.EntFireAtName({ name, input, value, delay });
}

function _glow(name, colorStr) {
    if (!name) return;
    if (colorStr) {
        _fire(name, "SetGlowOverride", colorStr);
        _fire(name, "StartGlowing");
    } else {
        _fire(name, "StopGlowing");
    }
}

function _wireButton(entityName, handler) {
    const ent = Instance.FindEntityByName(entityName);
    if (!ent) { _debug(`Button not found: ${entityName}`); return; }
    let n = 0;
    for (const out of CANDIDATE_OUTPUTS) {
        try {
            Instance.ConnectOutput(ent, out, () => {
                try { handler(); } catch(e) { _log(`Handler error [${entityName}]: ${e}`); }
            });
            n++;
        } catch {}
    }
    _debug(`Wired: ${entityName} (${n})`);
}

function _flashGlow(entityName, colorStr) {
    _glow(entityName, colorStr);
    scheduler.setTimeout(0.4, () => _glow(entityName, null));
}


// ════════════════════════════════════════════════════════════
//  CONSTANTES — ÉQUIPES
// ════════════════════════════════════════════════════════════
const TEAM_T  = 2;
const TEAM_CT = 3;


// ════════════════════════════════════════════════════════════
//  CONSTANTES — BOTS
// ════════════════════════════════════════════════════════════
const ADAD_LEVELS   = [null, "easy", "medium", "hard"];
const CROUCH_LEVELS = [null, "easy", "medium", "hard"];
const CROUCH_INTERVALS = { easy: 2.0, medium: 1.0, hard: 0.35 };

const ADAD_PARAMS = {
    easy:   { interval: 1.2, speed: 200, label: "Easy"   },
    medium: { interval: 0.6, speed: 250, label: "Medium" },
    hard:   { interval: 0.3, speed: 250, label: "Hard"   },
};

const GLOW_BOT = {
    adad_easy:     "0 210 100",
    adad_medium:   "210 140 0",
    adad_hard:     "220 30  0",
    crouch_easy:   "0 140 255",
    crouch_medium: "140 0 230",
    crouch_hard:   "220 0 140",
};


// ════════════════════════════════════════════════════════════
//  CONSTANTES — ARMES & COUTEAUX
// ════════════════════════════════════════════════════════════
const KNIFE_Z_OFFSET = 48;

const KNIVES = {
    karambit:  { subclass: 507, label: "★ Karambit"       },
    butterfly: { subclass: 515, label: "★ Butterfly Knife" },
    m9:        { subclass: 508, label: "★ M9 Bayonet"      },
    bayonet:   { subclass: 500, label: "★ Bayonet"         },
    huntsman:  { subclass: 509, label: "★ Huntsman Knife"  },
    flip:      { subclass: 505, label: "★ Flip Knife"      },
    gut:       { subclass: 506, label: "★ Gut Knife"       },
    bowie:     { subclass: 514, label: "★ Bowie Knife"     },
    shadow:    { subclass: 516, label: "★ Shadow Daggers"  },
    falchion:  { subclass: 512, label: "★ Falchion Knife"  },
    navaja:    { subclass: 520, label: "★ Navaja Knife"    },
    stiletto:  { subclass: 522, label: "★ Stiletto Knife"  },
    talon:     { subclass: 523, label: "★ Talon Knife"     },
    ursus:     { subclass: 519, label: "★ Ursus Knife"     },
    skeleton:  { subclass: 525, label: "★ Skeleton Knife"  },
    paracord:  { subclass: 517, label: "★ Paracord Knife"  },
    survival:  { subclass: 518, label: "★ Survival Knife"  },
    classic:   { subclass: 503, label: "★ Classic Knife"   },
    outdoor:   { subclass: 521, label: "★ Nomad Knife"     },
    kukri:     { subclass: 526, label: "★ Kukri Knife"     },
};

// slot: 0 = primaire, 1 = secondaire
const WEAPONS = {
    ak47:          { classname: "weapon_ak47",          slot: 0 },
    m4a1:          { classname: "weapon_m4a1",          slot: 0 },
    m4a1_silencer: { classname: "weapon_m4a1_silencer", slot: 0 },
    awp:           { classname: "weapon_awp",           slot: 0 },
    sg556:         { classname: "weapon_sg556",         slot: 0 },
    aug:           { classname: "weapon_aug",           slot: 0 },
    ssg08:         { classname: "weapon_ssg08",         slot: 0 },
    famas:         { classname: "weapon_famas",         slot: 0 },
    galilar:       { classname: "weapon_galilar",       slot: 0 },
    deagle:        { classname: "weapon_deagle",        slot: 1 },
    usp_silencer:  { classname: "weapon_usp_silencer",  slot: 1 },
    glock:         { classname: "weapon_glock",         slot: 1 },
    hkp2000:       { classname: "weapon_hkp2000",       slot: 1 },
    p250:          { classname: "weapon_p250",          slot: 1 },
    fiveseven:     { classname: "weapon_fiveseven",     slot: 1 },
    tec9:          { classname: "weapon_tec9",          slot: 1 },
    cz75a:         { classname: "weapon_cz75a",         slot: 1 },
    revolver:      { classname: "weapon_revolver",      slot: 1 },
    mp9:           { classname: "weapon_mp9",           slot: 0 },
    mac10:         { classname: "weapon_mac10",         slot: 0 },
    mp7:           { classname: "weapon_mp7",           slot: 0 },
    ump45:         { classname: "weapon_ump45",         slot: 0 },
    p90:           { classname: "weapon_p90",           slot: 0 },
    bizon:         { classname: "weapon_bizon",         slot: 0 },
    mp5sd:         { classname: "weapon_mp5sd",         slot: 0 },
    nova:          { classname: "weapon_nova",          slot: 0 },
    xm1014:        { classname: "weapon_xm1014",        slot: 0 },
    sawedoff:      { classname: "weapon_sawedoff",      slot: 0 },
    mag7:          { classname: "weapon_mag7",          slot: 0 },
    negev:         { classname: "weapon_negev",         slot: 0 },
    m249:          { classname: "weapon_m249",          slot: 0 },
};

const GLOW_WEAPON = "0 180 255";
const GLOW_KNIFE  = "255 180 0";


// ════════════════════════════════════════════════════════════
//  CONSTANTES — MUSIQUE
//  ► Ajouter une piste : une seule ligne dans TRACKS
// ════════════════════════════════════════════════════════════
const TRACKS = [
    { entity: "@music_track_01", name: "Tell you straight"  },
    { entity: "@music_track_02", name: "Outer space"        },
    { entity: "@music_track_03", name: "We ride"            },
    { entity: "@music_track_04", name: "Reda guitare"       },
    { entity: "@music_track_05", name: "Run"                },
    { entity: "@music_track_06", name: "Ne me parle plus"   },
    { entity: "@music_track_07", name: "Flare"              },
    // { entity: "@music_track_08", name: "Nouveau titre" },
];

const GLOW_PLAY    = "0 220 100";
const GLOW_PAUSE   = "220 180 0";
const GLOW_STOP    = "180 40  0";
const GLOW_NAV     = "0 160 255";
const GLOW_SHUFFLE = "180 0 220";
const GLOW_REPEAT  = "0 200 220";


// ════════════════════════════════════════════════════════════
//  STATE GLOBAL
// ════════════════════════════════════════════════════════════
const state = {
    // ── Bot ──────────────────────────────────────────────────
    adad:           null,
    adadGeneration: 0,
    adadDirection:  "left",
    crouch:         null,
    crouchState:    false,
    // ── Loadout ──────────────────────────────────────────────
    weapon:         null,
    knife:          null,
    prevWeaponBtn:  null,
    prevKnifeBtn:   null,
    // ── Music ────────────────────────────────────────────────
    musicIndex:     0,
    musicPlaying:   false,
    musicPaused:    false,
    musicShuffle:   false,
    musicRepeat:    false,
    // ── Init ─────────────────────────────────────────────────
    restarted:      false,
    initialized:    false,
};


// ════════════════════════════════════════════════════════════
//  MODULE 1 — BOT CONTROL
// ════════════════════════════════════════════════════════════

// ── Helpers bots ─────────────────────────────────────────────

function _getPlayerPawn() {
    for (let slot = 0; slot < 64; slot++) {
        try {
            const ctrl = Instance.GetPlayerController(slot);
            if (!ctrl || ctrl.IsBot?.()) continue;
            const pawn = ctrl.GetPlayerPawn?.();
            if (pawn && pawn.GetTeamNumber?.() === TEAM_T) return pawn;
        } catch {}
    }
    return null;
}

function _getBots() {
    const result = [];
    for (let slot = 0; slot < 64; slot++) {
        try {
            const ctrl = Instance.GetPlayerController(slot);
            if (!ctrl?.IsBot?.()) continue;
            const pawn = ctrl.GetPlayerPawn?.();
            if (pawn) result.push({ ctrl, pawn });
        } catch {}
    }
    return result;
}

// ── Équipes ───────────────────────────────────────────────────

function enforceTeams() {
    _cmd("mp_autoteambalance 0");
    _cmd("mp_limitteams 0");
    for (let slot = 0; slot < 64; slot++) {
        try {
            const ctrl = Instance.GetPlayerController(slot);
            if (!ctrl) continue;
            const pawn = ctrl.GetPlayerPawn?.();
            if (!pawn) continue;
            if (ctrl.IsBot?.()) {
                if (pawn.GetTeamNumber?.() !== TEAM_CT) ctrl.JoinTeam?.(TEAM_CT);
            } else {
                if (pawn.GetTeamNumber?.() !== TEAM_T) ctrl.JoinTeam?.(TEAM_T);
            }
        } catch {}
    }
    _debug("Teams enforced: bots→CT player→T");
}

// ── ADAD ──────────────────────────────────────────────────────

function _clearAdadGlows() {
    ADAD_LEVELS.filter(Boolean).forEach(l => _glow(`@bot_btn_adad_${l}`, null));
}

function _adadLoop(generation) {
    if (generation !== state.adadGeneration || !state.adad) return;

    const params = ADAD_PARAMS[state.adad];
    for (const { pawn } of _getBots()) {
        try {
            const pos    = pawn.GetAbsOrigin?.();
            const angles = pawn.GetEyeAngles?.();
            if (!pos || !angles) continue;
            const yaw = angles.yaw * (Math.PI / 180);
            const sign = state.adadDirection === "left" ? 1 : -1;
            pawn.Teleport?.(pos, null, {
                x: Math.cos(yaw + sign * Math.PI / 2) * params.speed,
                y: Math.sin(yaw + sign * Math.PI / 2) * params.speed,
                z: 0,
            });
        } catch {}
    }
    state.adadDirection = state.adadDirection === "left" ? "right" : "left";
    scheduler.setTimeout(params.interval, () => _adadLoop(generation));
}

function setAdad(level) {
    state.adadGeneration++;
    state.adad          = level;
    state.adadDirection = "left";
    _clearAdadGlows();

    if (!level) {
        for (const { pawn } of _getBots()) {
            try {
                const pos = pawn.GetAbsOrigin?.();
                if (pos) pawn.Teleport?.(pos, null, { x: 0, y: 0, z: 0 });
            } catch {}
        }
        _say("[Training] ADAD: OFF");
        return;
    }

    const colors = { easy: GLOW_BOT.adad_easy, medium: GLOW_BOT.adad_medium, hard: GLOW_BOT.adad_hard };
    _glow(`@bot_btn_adad_${level}`, colors[level]);
    _adadLoop(state.adadGeneration);
    _say(`[Training] ADAD: ${ADAD_PARAMS[level].label}`);
}

function cycleAdad() {
    setAdad(ADAD_LEVELS[(ADAD_LEVELS.indexOf(state.adad) + 1) % ADAD_LEVELS.length]);
}

// ── Crouch ────────────────────────────────────────────────────

function _clearCrouchGlows() {
    CROUCH_LEVELS.filter(Boolean).forEach(l => _glow(`@bot_btn_crouch_${l}`, null));
}

function _runCrouchLoop(intervalSec) {
    if (!state.crouch) return;
    state.crouchState = !state.crouchState;
    _cmd(`bot_crouch ${state.crouchState ? 1 : 0}`);
    scheduler.setTimeout(intervalSec, () => _runCrouchLoop(intervalSec));
}

function setCrouch(level) {
    state.crouch = level;
    _clearCrouchGlows();
    if (!level) {
        _cmd("bot_crouch 0");
        _say("[Training] Crouch: OFF");
        return;
    }
    const interval = CROUCH_INTERVALS[level];
    const colors   = { easy: GLOW_BOT.crouch_easy, medium: GLOW_BOT.crouch_medium, hard: GLOW_BOT.crouch_hard };
    _glow(`@bot_btn_crouch_${level}`, colors[level]);
    state.crouchState = false;
    _cmd("bot_crouch 1");
    scheduler.setTimeout(interval, () => _runCrouchLoop(interval));
    _say(`[Training] Crouch: ${level.toUpperCase()}`);
}

function cycleCrouch() {
    setCrouch(CROUCH_LEVELS[(CROUCH_LEVELS.indexOf(state.crouch) + 1) % CROUCH_LEVELS.length]);
}


// ════════════════════════════════════════════════════════════
//  MODULE 2 — LOADOUT (armes & couteaux)
// ════════════════════════════════════════════════════════════

function setWeapon(key) {
    const data = WEAPONS[key];
    if (!data) { _log(`Unknown weapon: ${key}`); return; }
    const pawn = _getPlayerPawn();
    if (!pawn) { _log("setWeapon: player not found."); return; }

    // Supprimer l'arme existante dans le même slot
    try {
        const existing = pawn.FindWeaponBySlot?.(data.slot);
        if (existing) pawn.DestroyWeapon?.(existing);
    } catch {}

    state.weapon = key;
    pawn.GiveNamedItem?.(data.classname, true);

    scheduler.setTimeout(0.06, () => {
        try {
            const p = _getPlayerPawn();
            if (!p) return;
            const w = p.FindWeapon?.(data.classname) ?? p.FindWeaponBySlot?.(data.slot);
            if (w) p.SwitchToWeapon?.(w);
        } catch {}
    });

    if (state.prevWeaponBtn) _glow(state.prevWeaponBtn, null);
    _glow(`@weapon_btn_${key}`, GLOW_WEAPON);
    state.prevWeaponBtn = `@weapon_btn_${key}`;

    _say(`[Training] Weapon: ${data.classname.replace("weapon_","").toUpperCase()}`);
}

function setKnife(key) {
    const knife = KNIVES[key];
    if (!knife) { _log(`Unknown knife: ${key}`); return; }
    const pawn = _getPlayerPawn();
    if (!pawn) { _log("setKnife: player not found."); return; }

    const crouching = pawn.IsCrouched?.() || pawn.IsCrouching?.();
    if (crouching) {
        _cmd(`subclass_change ${knife.subclass} weapon_knife`);
    } else {
        const k = pawn.FindWeaponBySlot?.(CSGearSlot.KNIFE);
        if (k) pawn.DestroyWeapon?.(k);
        const o = pawn.GetAbsOrigin?.();
        if (o) _cmd(`subclass_create ${knife.subclass} {"origin" "${Math.round(o.x)} ${Math.round(o.y)} ${Math.round(o.z + KNIFE_Z_OFFSET)}"}`);
    }

    scheduler.setTimeout(0.08, () => {
        try {
            const p = _getPlayerPawn();
            if (!p) return;
            const k = p.FindWeaponBySlot?.(CSGearSlot.KNIFE);
            if (k) p.SwitchToWeapon?.(k);
        } catch {}
    });

    state.knife = key;
    if (state.prevKnifeBtn) _glow(state.prevKnifeBtn, null);
    _glow(`@knife_btn_${key}`, GLOW_KNIFE);
    state.prevKnifeBtn = `@knife_btn_${key}`;

    _say(`[Training] Knife: ${knife.label}`);
}


// ════════════════════════════════════════════════════════════
//  MODULE 3 — MUSIC PLAYER
// ════════════════════════════════════════════════════════════

function _updateMusicDisplay() {
    if (!TRACKS.length) return;
    const t      = TRACKS[state.musicIndex];
    const status = state.musicPlaying ? "▶" : state.musicPaused ? "⏸" : "⏹";
    const shuf   = state.musicShuffle ? " [SHUFFLE]" : "";
    const rep    = state.musicRepeat  ? " [REPEAT]"  : "";
    _fire("@music_display", "SetMessage",
        `${status} ${t.name} (${state.musicIndex + 1}/${TRACKS.length})${shuf}${rep}`);
}

function _stopAllSounds() {
    for (const t of TRACKS) _fire(t.entity, "StopSound");
}

function _musicNextIndex() {
    if (state.musicRepeat)  return state.musicIndex;
    if (state.musicShuffle) {
        if (TRACKS.length <= 1) return 0;
        let next;
        do { next = Math.floor(Math.random() * TRACKS.length); }
        while (next === state.musicIndex);
        return next;
    }
    return (state.musicIndex + 1) % TRACKS.length;
}

function _musicPrevIndex() {
    if (state.musicRepeat)  return state.musicIndex;
    if (state.musicShuffle) return _musicNextIndex();
    return (state.musicIndex - 1 + TRACKS.length) % TRACKS.length;
}

function _startCurrentTrack() {
    if (!TRACKS.length) return;
    _stopAllSounds();
    const t           = TRACKS[state.musicIndex];
    state.musicPlaying = true;
    state.musicPaused  = false;
    _fire(t.entity, "StartSound");
    _glow("@music_btn_play",  GLOW_PLAY);
    _glow("@music_btn_pause", null);
    _glow("@music_btn_stop",  null);
    _updateMusicDisplay();
    _say(`[Music] ▶ ${t.name}  (${state.musicIndex + 1}/${TRACKS.length})`);
}

function musicPlay() {
    if (!TRACKS.length) return;
    if (state.musicPaused) {
        const t           = TRACKS[state.musicIndex];
        state.musicPlaying = true;
        state.musicPaused  = false;
        _fire(t.entity, "StartSound");
        _glow("@music_btn_play",  GLOW_PLAY);
        _glow("@music_btn_pause", null);
        _updateMusicDisplay();
        _say(`[Music] ▶ Resumed: ${t.name}`);
    } else {
        _startCurrentTrack();
    }
}

function musicPause() {
    if (!state.musicPlaying) return;
    const t            = TRACKS[state.musicIndex];
    state.musicPlaying  = false;
    state.musicPaused   = true;
    _fire(t.entity, "StopSound");
    _glow("@music_btn_play",  null);
    _glow("@music_btn_pause", GLOW_PAUSE);
    _updateMusicDisplay();
    _say(`[Music] ⏸ ${t.name}`);
}

function musicStop() {
    _stopAllSounds();
    state.musicPlaying = false;
    state.musicPaused  = false;
    _glow("@music_btn_play",  null);
    _glow("@music_btn_pause", null);
    _glow("@music_btn_stop",  GLOW_STOP);
    _updateMusicDisplay();
    scheduler.setTimeout(0.6, () => _glow("@music_btn_stop", null));
    _say("[Music] ⏹ Stopped.");
}

function musicNext() {
    state.musicIndex = _musicNextIndex();
    _flashGlow("@music_btn_next", GLOW_NAV);
    _startCurrentTrack();
}

function musicPrev() {
    state.musicIndex = _musicPrevIndex();
    _flashGlow("@music_btn_prev", GLOW_NAV);
    _startCurrentTrack();
}

function musicToggleShuffle() {
    state.musicShuffle = !state.musicShuffle;
    _glow("@music_btn_shuffle", state.musicShuffle ? GLOW_SHUFFLE : null);
    _updateMusicDisplay();
    _say(`[Music] Shuffle: ${state.musicShuffle ? "ON" : "OFF"}`);
}

function musicToggleRepeat() {
    state.musicRepeat = !state.musicRepeat;
    _glow("@music_btn_repeat", state.musicRepeat ? GLOW_REPEAT : null);
    _updateMusicDisplay();
    _say(`[Music] Repeat: ${state.musicRepeat ? "ON" : "OFF"}`);
}

function musicGoTo(index) {
    if (index < 0 || index >= TRACKS.length) return;
    state.musicIndex = index;
    _startCurrentTrack();
}


// ════════════════════════════════════════════════════════════
//  CÂBLAGE BOUTONS
// ════════════════════════════════════════════════════════════

function wireAllButtons() {
    _log("Wiring all buttons...");

    // ── ADAD ─────────────────────────────────────────────────
    _wireButton("@bot_btn_adad",        () => cycleAdad());
    _wireButton("@bot_btn_adad_easy",   () => setAdad("easy"));
    _wireButton("@bot_btn_adad_medium", () => setAdad("medium"));
    _wireButton("@bot_btn_adad_hard",   () => setAdad("hard"));

    // ── Crouch ───────────────────────────────────────────────
    _wireButton("@bot_btn_crouch",        () => cycleCrouch());
    _wireButton("@bot_btn_crouch_easy",   () => setCrouch("easy"));
    _wireButton("@bot_btn_crouch_medium", () => setCrouch("medium"));
    _wireButton("@bot_btn_crouch_hard",   () => setCrouch("hard"));

    // ── Armes ────────────────────────────────────────────────
    for (const k of Object.keys(WEAPONS)) _wireButton(`@weapon_btn_${k}`, () => setWeapon(k));

    // ── Couteaux ─────────────────────────────────────────────
    for (const k of Object.keys(KNIVES)) _wireButton(`@knife_btn_${k}`, () => setKnife(k));

    // ── Musique ──────────────────────────────────────────────
    _wireButton("@music_btn_play",    () => musicPlay());
    _wireButton("@music_btn_pause",   () => musicPause());
    _wireButton("@music_btn_stop",    () => musicStop());
    _wireButton("@music_btn_next",    () => musicNext());
    _wireButton("@music_btn_prev",    () => musicPrev());
    _wireButton("@music_btn_shuffle", () => musicToggleShuffle());
    _wireButton("@music_btn_repeat",  () => musicToggleRepeat());

    // Accès direct par piste : @music_btn_track_01 … @music_btn_track_07
    for (let i = 0; i < TRACKS.length; i++) {
        const idx = i;
        _wireButton(`@music_btn_track_${String(idx + 1).padStart(2, "0")}`, () => musicGoTo(idx));
    }

    _log("All buttons wired.");
}


// ════════════════════════════════════════════════════════════
//  INIT RESTART (une seule fois au chargement)
// ════════════════════════════════════════════════════════════

function doInitRestart() {
    if (state.restarted) return;
    state.restarted = true;

    scheduler.setTimeout(1.0, () => {
        _cmd("mp_restartgame 1");
        _log("mp_restartgame 1 fired.");
        scheduler.setTimeout(3.0, () => {
            enforceTeams();
            wireAllButtons();
            _updateMusicDisplay();
            state.initialized = true;
            _say("★ Training map successfully loaded! ★");
            _say("Bots: CT  |  You: T  |  Bot control + Loadout + Music ready.");
            _log("Init complete.");
        });
    });
}


// ════════════════════════════════════════════════════════════
//  SCRIPT INPUTS (Hammer I/O)
// ════════════════════════════════════════════════════════════

// Global
Instance.OnScriptInput("Init",         () => doInitRestart());
Instance.OnScriptInput("OnMapSpawn",   () => { if (!state.initialized) wireAllButtons(); });
Instance.OnScriptInput("WireAll",      () => wireAllButtons());
Instance.OnScriptInput("EnforceTeams", () => enforceTeams());
Instance.OnScriptInput("DebugToggle",  () => { DEBUG = !DEBUG; _say(`Debug: ${DEBUG?"ON":"OFF"}`); });

// ADAD
Instance.OnScriptInput("CycleAdad",     () => cycleAdad());
Instance.OnScriptInput("SetAdadOff",    () => setAdad(null));
Instance.OnScriptInput("SetAdadEasy",   () => setAdad("easy"));
Instance.OnScriptInput("SetAdadMedium", () => setAdad("medium"));
Instance.OnScriptInput("SetAdadHard",   () => setAdad("hard"));

// Crouch
Instance.OnScriptInput("CycleCrouch",     () => cycleCrouch());
Instance.OnScriptInput("SetCrouchOff",    () => setCrouch(null));
Instance.OnScriptInput("SetCrouchEasy",   () => setCrouch("easy"));
Instance.OnScriptInput("SetCrouchMedium", () => setCrouch("medium"));
Instance.OnScriptInput("SetCrouchHard",   () => setCrouch("hard"));

// Loadout
for (const k of Object.keys(WEAPONS)) Instance.OnScriptInput(`SetWeapon_${k}`, () => setWeapon(k));
for (const k of Object.keys(KNIVES))  Instance.OnScriptInput(`SetKnife_${k}`,  () => setKnife(k));

// Musique
Instance.OnScriptInput("MusicPlay",          () => musicPlay());
Instance.OnScriptInput("MusicPause",         () => musicPause());
Instance.OnScriptInput("MusicStop",          () => musicStop());
Instance.OnScriptInput("MusicNext",          () => musicNext());
Instance.OnScriptInput("MusicPrev",          () => musicPrev());
Instance.OnScriptInput("MusicToggleShuffle", () => musicToggleShuffle());
Instance.OnScriptInput("MusicToggleRepeat",  () => musicToggleRepeat());


// ════════════════════════════════════════════════════════════
//  LIFECYCLE
// ════════════════════════════════════════════════════════════

Instance.OnActivate(() => {
    _log("Script activated.");
    doInitRestart();
});

Instance.OnRoundStart(() => {
    enforceTeams();
    // Relancer ADAD si actif (les bots viennent de respawn)
    if (state.adad) {
        const lvl = state.adad;
        state.adad = null;
        setAdad(lvl);
    }
    // Relancer la boucle crouch si active
    if (state.crouch) {
        const lvl = state.crouch;
        state.crouch = null;
        setCrouch(lvl);
    }
});

Instance.OnScriptReload({
    before: () => {
        _stopAllSounds();
        _log("Reloading...");
    },
    after: () => {
        wireAllButtons();
        _updateMusicDisplay();
        _log("Reloaded.");
    },
});

_log(`training_full.js loaded — ${TRACKS.length} track(s), ${Object.keys(WEAPONS).length} weapons, ${Object.keys(KNIVES).length} knives.`);
