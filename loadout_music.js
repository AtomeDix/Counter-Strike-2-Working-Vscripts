import { Instance, CSGearSlot } from "cs_script/point_script";

// ╔══════════════════════════════════════════════════════════════╗
//  LOADOUT 1v1 + MUSIC + GAME MODES
//  ┌─ Armes/Couteaux par équipe (ConVars natifs + respawn hook)
//  ├─ Music Player
//  └─ Game Modes (oneshot, headshot, lowgrav, etc.)
//
//  Tapez !help en jeu pour la liste complète des commandes.
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
//  UTILITAIRES
// ════════════════════════════════════════════════════════════
function _log(msg)  { Instance.Msg(`[loadout] ${msg}\n`); }
function _say(msg)  { Instance.ServerCommand(`say ${msg}`); }
function _cmd(c)    { Instance.ServerCommand(c); }

const TEAM_T  = 2;
const TEAM_CT = 3;
const CANDIDATE_OUTPUTS = ["OnPressed", "OnUse", "OnPlayerUse", "OnStartTouch"];
const connections = [];

function _fire(name, input, value = "", activator = null) {
    Instance.EntFireAtName({ name, input, value, activator });
}
function _glow(name, colorStr) {
    if (!name) return;
    if (colorStr) { _fire(name, "SetGlowOverride", colorStr); _fire(name, "StartGlowing"); }
    else          { _fire(name, "StopGlowing"); }
}
function _flashGlow(name, color) {
    _glow(name, color);
    scheduler.setTimeout(0.4, () => _glow(name, null));
}

function _wireButton(entityName, handler) {
    const ent = Instance.FindEntityByName(entityName);
    if (!ent) return;
    for (const out of CANDIDATE_OUTPUTS) {
        try {
            const h = Instance.ConnectOutput(ent, out, (ctx) => {
                try { handler(_resolvePlayer(ctx?.activator)); }
                catch(e) { _log(`Error [${entityName}]: ${e}`); }
            });
            if (h !== undefined) connections.push(h);
        } catch {}
    }
}

function _resolvePlayer(entity) {
    if (!entity) return null;
    try {
        let ctrl, pawn;
        if (typeof entity.GetPlayerController === "function") {
            pawn = entity; ctrl = entity.GetPlayerController();
        } else if (typeof entity.GetPlayerPawn === "function") {
            ctrl = entity; pawn = entity.GetPlayerPawn();
        }
        if (!ctrl || !pawn) return null;
        if (ctrl.IsBot?.()) return null;
        const team = pawn.GetTeamNumber?.();
        if (team !== TEAM_T && team !== TEAM_CT) return null;
        return { team, ctrl, pawn };
    } catch { return null; }
}

function _resolveCtrlPawn(entity) {
    if (!entity) return null;
    try {
        let ctrl, pawn;
        if (typeof entity.GetPlayerController === "function") {
            pawn = entity; ctrl = entity.GetPlayerController();
        } else {
            ctrl = entity; pawn = entity.GetPlayerPawn?.();
        }
        if (!ctrl || !pawn) return null;
        return { ctrl, pawn };
    } catch { return null; }
}

function _getPlayerByTeam(team) {
    for (let slot = 0; slot < 64; slot++) {
        try {
            const ctrl = Instance.GetPlayerController(slot);
            if (!ctrl || ctrl.IsBot?.()) continue;
            const pawn = ctrl.GetPlayerPawn?.();
            if (pawn && pawn.GetTeamNumber?.() === team) return { ctrl, pawn };
        } catch {}
    }
    return null;
}

function _getName(ctrl) {
    try { return ctrl?.GetName?.() ?? "Player"; } catch { return "Player"; }
}

/** Envoyer plusieurs lignes chat espacées pour éviter le rate-limit. */
function _sayLines(lines) {
    let delay = 0;
    for (const line of lines) {
        const d = delay;
        scheduler.setTimeout(d, () => _say(line));
        delay += 0.28;
    }
}


// ════════════════════════════════════════════════════════════
//  ARMES
// ════════════════════════════════════════════════════════════
const WEAPONS = {
    // ── Rifles / SMGs / Heavy ─────────────────────────────────
    ak47:          { classname: "weapon_ak47",          slot: 0,
                     cvT: "mp_t_default_primary",  cvCT: "mp_ct_default_primary",
                     aliases: ["!ak","!ak47"] },
    m4a1:          { classname: "weapon_m4a1",          slot: 0,
                     cvT: "mp_t_default_primary",  cvCT: "mp_ct_default_primary",
                     aliases: ["!m4","!m4a1","!m4a4"] },
    m4a1_silencer: { classname: "weapon_m4a1_silencer", slot: 0,
                     cvT: "mp_t_default_primary",  cvCT: "mp_ct_default_primary",
                     aliases: ["!m4s","!m4a1s","!m4silencer"] },
    awp:           { classname: "weapon_awp",           slot: 0,
                     cvT: "mp_t_default_primary",  cvCT: "mp_ct_default_primary",
                     aliases: ["!awp"] },
    sg556:         { classname: "weapon_sg556",         slot: 0,
                     cvT: "mp_t_default_primary",  cvCT: "mp_ct_default_primary",
                     aliases: ["!sg","!sg553","!sg556"] },
    aug:           { classname: "weapon_aug",           slot: 0,
                     cvT: "mp_t_default_primary",  cvCT: "mp_ct_default_primary",
                     aliases: ["!aug"] },
    ssg08:         { classname: "weapon_ssg08",         slot: 0,
                     cvT: "mp_t_default_primary",  cvCT: "mp_ct_default_primary",
                     aliases: ["!scout","!ssg","!ssg08"] },
    famas:         { classname: "weapon_famas",         slot: 0,
                     cvT: "mp_t_default_primary",  cvCT: "mp_ct_default_primary",
                     aliases: ["!famas"] },
    galilar:       { classname: "weapon_galilar",       slot: 0,
                     cvT: "mp_t_default_primary",  cvCT: "mp_ct_default_primary",
                     aliases: ["!galil","!galilar"] },
    mp9:           { classname: "weapon_mp9",           slot: 0,
                     cvT: "mp_t_default_primary",  cvCT: "mp_ct_default_primary",
                     aliases: ["!mp9"] },
    mac10:         { classname: "weapon_mac10",         slot: 0,
                     cvT: "mp_t_default_primary",  cvCT: "mp_ct_default_primary",
                     aliases: ["!mac10","!mac"] },
    mp7:           { classname: "weapon_mp7",           slot: 0,
                     cvT: "mp_t_default_primary",  cvCT: "mp_ct_default_primary",
                     aliases: ["!mp7"] },
    ump45:         { classname: "weapon_ump45",         slot: 0,
                     cvT: "mp_t_default_primary",  cvCT: "mp_ct_default_primary",
                     aliases: ["!ump","!ump45"] },
    p90:           { classname: "weapon_p90",           slot: 0,
                     cvT: "mp_t_default_primary",  cvCT: "mp_ct_default_primary",
                     aliases: ["!p90"] },
    bizon:         { classname: "weapon_bizon",         slot: 0,
                     cvT: "mp_t_default_primary",  cvCT: "mp_ct_default_primary",
                     aliases: ["!bizon"] },
    mp5sd:         { classname: "weapon_mp5sd",         slot: 0,
                     cvT: "mp_t_default_primary",  cvCT: "mp_ct_default_primary",
                     aliases: ["!mp5","!mp5sd"] },
    nova:          { classname: "weapon_nova",          slot: 0,
                     cvT: "mp_t_default_primary",  cvCT: "mp_ct_default_primary",
                     aliases: ["!nova"] },
    xm1014:        { classname: "weapon_xm1014",        slot: 0,
                     cvT: "mp_t_default_primary",  cvCT: "mp_ct_default_primary",
                     aliases: ["!xm","!xm1014"] },
    sawedoff:      { classname: "weapon_sawedoff",      slot: 0,
                     cvT: "mp_t_default_primary",  cvCT: "mp_ct_default_primary",
                     aliases: ["!sawedoff","!sawed"] },
    mag7:          { classname: "weapon_mag7",          slot: 0,
                     cvT: "mp_t_default_primary",  cvCT: "mp_ct_default_primary",
                     aliases: ["!mag7","!mag"] },
    negev:         { classname: "weapon_negev",         slot: 0,
                     cvT: "mp_t_default_primary",  cvCT: "mp_ct_default_primary",
                     aliases: ["!negev"] },
    m249:          { classname: "weapon_m249",          slot: 0,
                     cvT: "mp_t_default_primary",  cvCT: "mp_ct_default_primary",
                     aliases: ["!m249"] },
    // ── Pistolets ─────────────────────────────────────────────
    deagle:        { classname: "weapon_deagle",        slot: 1,
                     cvT: "mp_t_default_secondary", cvCT: "mp_ct_default_secondary",
                     aliases: ["!deagle","!dgl","!eagle"] },
    usp_silencer:  { classname: "weapon_usp_silencer",  slot: 1,
                     cvT: "mp_t_default_secondary", cvCT: "mp_ct_default_secondary",
                     aliases: ["!usp","!usps"] },
    glock:         { classname: "weapon_glock",         slot: 1,
                     cvT: "mp_t_default_secondary", cvCT: "mp_ct_default_secondary",
                     aliases: ["!glock"] },
    hkp2000:       { classname: "weapon_hkp2000",       slot: 1,
                     cvT: "mp_t_default_secondary", cvCT: "mp_ct_default_secondary",
                     aliases: ["!p2000","!hkp2000"] },
    p250:          { classname: "weapon_p250",          slot: 1,
                     cvT: "mp_t_default_secondary", cvCT: "mp_ct_default_secondary",
                     aliases: ["!p250"] },
    fiveseven:     { classname: "weapon_fiveseven",     slot: 1,
                     cvT: "mp_t_default_secondary", cvCT: "mp_ct_default_secondary",
                     aliases: ["!57","!fiveseven"] },
    tec9:          { classname: "weapon_tec9",          slot: 1,
                     cvT: "mp_t_default_secondary", cvCT: "mp_ct_default_secondary",
                     aliases: ["!tec9","!tec"] },
    cz75a:         { classname: "weapon_cz75a",         slot: 1,
                     cvT: "mp_t_default_secondary", cvCT: "mp_ct_default_secondary",
                     aliases: ["!cz","!cz75"] },
    revolver:      { classname: "weapon_revolver",      slot: 1,
                     cvT: "mp_t_default_secondary", cvCT: "mp_ct_default_secondary",
                     aliases: ["!revolver","!r8"] },
};

const GLOW_WEAPON = "0 180 255";
const WEAPON_ALIAS_MAP = {};
for (const [key, data] of Object.entries(WEAPONS)) {
    for (const a of (data.aliases ?? [])) WEAPON_ALIAS_MAP[a] = key;
}


// ════════════════════════════════════════════════════════════
//  COUTEAUX
// ════════════════════════════════════════════════════════════
const KNIFE_Z_OFFSET = 48;

const KNIVES = {
    karambit:  { subclass: 507, label: "★ Karambit",
                 aliases: ["!karambit","!kara"] },
    butterfly: { subclass: 515, label: "★ Butterfly Knife",
                 aliases: ["!butterfly","!bfly"] },
    m9:        { subclass: 508, label: "★ M9 Bayonet",
                 aliases: ["!m9","!m9bay"] },
    bayonet:   { subclass: 500, label: "★ Bayonet",
                 aliases: ["!bayonet","!bay"] },
    huntsman:  { subclass: 509, label: "★ Huntsman Knife",
                 aliases: ["!huntsman","!hunt"] },
    flip:      { subclass: 505, label: "★ Flip Knife",
                 aliases: ["!flip"] },
    gut:       { subclass: 506, label: "★ Gut Knife",
                 aliases: ["!gut"] },
    bowie:     { subclass: 514, label: "★ Bowie Knife",
                 aliases: ["!bowie"] },
    shadow:    { subclass: 516, label: "★ Shadow Daggers",
                 aliases: ["!shadow","!daggers"] },
    falchion:  { subclass: 512, label: "★ Falchion Knife",
                 aliases: ["!falchion"] },
    navaja:    { subclass: 520, label: "★ Navaja Knife",
                 aliases: ["!navaja"] },
    stiletto:  { subclass: 522, label: "★ Stiletto Knife",
                 aliases: ["!stiletto"] },
    talon:     { subclass: 523, label: "★ Talon Knife",
                 aliases: ["!talon"] },
    ursus:     { subclass: 519, label: "★ Ursus Knife",
                 aliases: ["!ursus"] },
    skeleton:  { subclass: 525, label: "★ Skeleton Knife",
                 aliases: ["!skeleton","!skele"] },
    paracord:  { subclass: 517, label: "★ Paracord Knife",
                 aliases: ["!paracord","!cord"] },
    survival:  { subclass: 518, label: "★ Survival Knife",
                 aliases: ["!survival"] },
    classic:   { subclass: 503, label: "★ Classic Knife",
                 aliases: ["!classic"] },
    outdoor:   { subclass: 521, label: "★ Nomad Knife",
                 aliases: ["!nomad","!outdoor"] },
    kukri:     { subclass: 526, label: "★ Kukri Knife",
                 aliases: ["!kukri"] },
};

const GLOW_KNIFE = "255 180 0";
const KNIFE_ALIAS_MAP = {};
for (const [key, data] of Object.entries(KNIVES)) {
    for (const a of (data.aliases ?? [])) KNIFE_ALIAS_MAP[a] = key;
}


// ════════════════════════════════════════════════════════════
//  MUSIQUE
// ════════════════════════════════════════════════════════════
const TRACKS = [
    { entity: "@music_track_01", name: "Tell you straight" },
    { entity: "@music_track_02", name: "Outer space"       },
    { entity: "@music_track_03", name: "We ride"           },
    { entity: "@music_track_04", name: "Reda guitare"      },
    { entity: "@music_track_05", name: "Run"               },
    { entity: "@music_track_06", name: "Ne me parle plus"  },
    { entity: "@music_track_07", name: "Flare"             },
    // { entity: "@music_track_08", name: "Nouveau titre" },
];

const GLOW_PLAY    = "0 220 100";
const GLOW_PAUSE   = "220 180 0";
const GLOW_STOP    = "180 40  0";
const GLOW_NAV     = "0 160 255";
const GLOW_SHUFFLE = "180 0 220";
const GLOW_REPEAT  = "0 200 220";

const music = {
    index: 0, playing: false, paused: false, shuffle: false, repeat: false,
};


// ════════════════════════════════════════════════════════════
//  STATE — loadout + game modes
// ════════════════════════════════════════════════════════════
const teamState = {
    [TEAM_T]:  { weaponKey: null, prevWpnBtn: null, knifeKey: null, prevKnifeBtn: null },
    [TEAM_CT]: { weaponKey: null, prevWpnBtn: null, knifeKey: null, prevKnifeBtn: null },
};

// État des modes de jeu actifs
const modes = {
    oneshot:  false,   // dégâts x999 partout
    headshot: false,   // dégâts corps = 0, tête = normal
    lowgrav:  false,   // sv_gravity 200
    highgrav: false,   // sv_gravity 1600
    fastrun:  false,   // sv_maxspeed 500
    infammo:  false,   // sv_infinite_ammo 1
    noflash:  false,   // sv_flashbang_screen 0
    knifeon:  false,   // couteau uniquement (on enlève toutes les armes)
};

// Glow des boutons de mode (optionnel — si tu places ces boutons en map)
const GLOW_MODE_ON  = "0 255 160";
const GLOW_MODE_OFF = null;


// ════════════════════════════════════════════════════════════
//  MODULE — ARMES (ConVars natifs)
// ════════════════════════════════════════════════════════════

function setWeapon(player, key) {
    if (!player) return;
    const data = WEAPONS[key];
    if (!data) { _log(`Unknown weapon: ${key}`); return; }

    const { team, ctrl, pawn } = player;
    const ts   = teamState[team];
    const cvar = team === TEAM_T ? data.cvT : data.cvCT;

    _cmd(`${cvar} "${data.classname}"`);

    try {
        const existing = pawn.FindWeaponBySlot?.(data.slot);
        if (existing) pawn.DestroyWeapon?.(existing);
        pawn.GiveNamedItem?.(data.classname, true);
        scheduler.setTimeout(0.06, () => {
            try {
                const w = pawn.FindWeapon?.(data.classname) ?? pawn.FindWeaponBySlot?.(data.slot);
                if (w) pawn.SwitchToWeapon?.(w);
            } catch {}
        });
    } catch(e) { _log(`Give weapon error: ${e}`); }

    if (ts.prevWpnBtn) _glow(ts.prevWpnBtn, null);
    ts.weaponKey  = key;
    ts.prevWpnBtn = `@weapon_btn_${key}`;
    _glow(ts.prevWpnBtn, GLOW_WEAPON);

    const tl = team === TEAM_T ? "T" : "CT";
    _say(`[Loadout] [${tl}] ${_getName(ctrl)} → ${data.classname.replace("weapon_","").toUpperCase()}`);
}


// ════════════════════════════════════════════════════════════
//  MODULE — COUTEAUX
// ════════════════════════════════════════════════════════════

function _applyKnifeToPawn(pawn, knifeKey, attempt = 0) {
    const knife = KNIVES[knifeKey];
    if (!knife || !pawn) return;
    try {
        const crouching = pawn.IsCrouched?.() || pawn.IsCrouching?.();
        if (crouching) {
            _cmd(`subclass_change ${knife.subclass} weapon_knife`);
        } else {
            const existing = pawn.FindWeaponBySlot?.(CSGearSlot.KNIFE);
            if (existing) {
                pawn.DestroyWeapon?.(existing);
            } else if (attempt < 8) {
                scheduler.setTimeout(0.12, () => _applyKnifeToPawn(pawn, knifeKey, attempt + 1));
                return;
            }
            const o = pawn.GetAbsOrigin?.();
            if (o) {
                _cmd(`subclass_create ${knife.subclass} {"origin" "${Math.round(o.x)} ${Math.round(o.y)} ${Math.round(o.z + KNIFE_Z_OFFSET)}"}`);
            }
        }
        scheduler.setTimeout(0.1, () => {
            try {
                const k = pawn.FindWeaponBySlot?.(CSGearSlot.KNIFE);
                if (k) pawn.SwitchToWeapon?.(k);
            } catch {}
        });
    } catch(e) { _log(`Apply knife error: ${e}`); }
}

function setKnife(player, key) {
    if (!player) return;
    const knife = KNIVES[key];
    if (!knife) { _log(`Unknown knife: ${key}`); return; }

    const { team, ctrl, pawn } = player;
    const ts = teamState[team];

    ts.knifeKey = key;
    _applyKnifeToPawn(pawn, key);

    if (ts.prevKnifeBtn) _glow(ts.prevKnifeBtn, null);
    ts.prevKnifeBtn = `@knife_btn_${key}`;
    _glow(ts.prevKnifeBtn, GLOW_KNIFE);

    const tl = team === TEAM_T ? "T" : "CT";
    _say(`[Loadout] [${tl}] ${_getName(ctrl)} → ${knife.label}`);
}

function restoreAllKnives(delay = 0.5) {
    for (const team of [TEAM_T, TEAM_CT]) {
        const ts = teamState[team];
        if (!ts.knifeKey) continue;
        const kk = ts.knifeKey;
        scheduler.setTimeout(delay, () => {
            const found = _getPlayerByTeam(team);
            if (found) _applyKnifeToPawn(found.pawn, kk);
        });
    }
}

Instance.OnPlayerSpawn?.((ctx) => {
    try {
        const entity = ctx?.player ?? ctx?.entity;
        if (!entity) return;
        const rp = _resolveCtrlPawn(entity);
        if (!rp || rp.ctrl.IsBot?.()) return;

        const team = rp.pawn.GetTeamNumber?.();
        if (team !== TEAM_T && team !== TEAM_CT) return;

        const knifeKey = teamState[team].knifeKey;
        if (!knifeKey) return;

        scheduler.setTimeout(0.5, () => {
            try {
                const freshPawn = rp.ctrl.GetPlayerPawn?.();
                if (freshPawn) _applyKnifeToPawn(freshPawn, knifeKey);
            } catch {}
        });
    } catch(e) { _log(`OnPlayerSpawn error: ${e}`); }
});


// ════════════════════════════════════════════════════════════
//  MODULE — GAME MODES
//
//  Chaque mode est un simple toggle.
//  _setMode(key, fn_on, fn_off) gère l'état + le message.
//  Les modes sont indépendants — plusieurs peuvent être actifs.
// ════════════════════════════════════════════════════════════

function _setMode(key, label, fn_on, fn_off) {
    modes[key] = !modes[key];
    if (modes[key]) {
        fn_on();
        _say(`[Mode] ✔ ${label} ACTIVÉ`);
        _glow(`@mode_btn_${key}`, GLOW_MODE_ON);
    } else {
        fn_off();
        _say(`[Mode] ✘ ${label} désactivé`);
        _glow(`@mode_btn_${key}`, GLOW_MODE_OFF);
    }
}

// ── ONE SHOT — tout dégât est fatal ──────────────────────────
function modeOneShot() {
    _setMode("oneshot", "ONE SHOT",
        () => {
            _cmd("mp_damage_scale_ct_head 999");
            _cmd("mp_damage_scale_ct_body 999");
            _cmd("mp_damage_scale_t_head 999");
            _cmd("mp_damage_scale_t_body 999");
        },
        () => {
            _cmd("mp_damage_scale_ct_head 1");
            _cmd("mp_damage_scale_ct_body 1");
            _cmd("mp_damage_scale_t_head 1");
            _cmd("mp_damage_scale_t_body 1");
        }
    );
}

// ── HEADSHOT ONLY — dégâts corps = 0 ─────────────────────────
function modeHeadshot() {
    _setMode("headshot", "HEADSHOT ONLY",
        () => {
            _cmd("mp_damage_scale_ct_head 1");
            _cmd("mp_damage_scale_ct_body 0");
            _cmd("mp_damage_scale_t_head 1");
            _cmd("mp_damage_scale_t_body 0");
        },
        () => {
            _cmd("mp_damage_scale_ct_head 1");
            _cmd("mp_damage_scale_ct_body 1");
            _cmd("mp_damage_scale_t_head 1");
            _cmd("mp_damage_scale_t_body 1");
        }
    );
}

// ── LOW GRAVITY ───────────────────────────────────────────────
function modeLowGrav() {
    // Si highgrav est actif, le désactiver d'abord
    if (modes.highgrav) {
        modes.highgrav = false;
        _glow("@mode_btn_highgrav", GLOW_MODE_OFF);
    }
    _setMode("lowgrav", "LOW GRAVITY",
        () => _cmd("sv_gravity 200"),
        () => _cmd("sv_gravity 800")
    );
}

// ── HIGH GRAVITY ──────────────────────────────────────────────
function modeHighGrav() {
    if (modes.lowgrav) {
        modes.lowgrav = false;
        _glow("@mode_btn_lowgrav", GLOW_MODE_OFF);
    }
    _setMode("highgrav", "HIGH GRAVITY",
        () => _cmd("sv_gravity 1600"),
        () => _cmd("sv_gravity 800")
    );
}

// ── FAST RUN ──────────────────────────────────────────────────
function modeFastRun() {
    _setMode("fastrun", "FAST RUN",
        () => {
            _cmd("sv_maxspeed 500");
            _cmd("sv_staminajumpcost 0");
            _cmd("sv_staminalandcost 0");
        },
        () => {
            _cmd("sv_maxspeed 320");
            _cmd("sv_staminajumpcost 0.08");
            _cmd("sv_staminalandcost 0.05");
        }
    );
}

// ── INFINITE AMMO ─────────────────────────────────────────────
function modeInfAmmo() {
    _setMode("infammo", "INFINITE AMMO",
        () => _cmd("sv_infinite_ammo 1"),
        () => _cmd("sv_infinite_ammo 0")
    );
}

// ── NO FLASH ─────────────────────────────────────────────────
function modeNoFlash() {
    _setMode("noflash", "NO FLASH",
        () => _cmd("sv_flashbang_screen 0"),
        () => _cmd("sv_flashbang_screen 1")
    );
}

// ── KNIFE ONLY — retire toutes les armes primaires/secondaires ─
function modeKnifeOnly() {
    _setMode("knifeon", "KNIFE ONLY",
        () => {
            // Vider les slots arme de chaque joueur
            for (let slot = 0; slot < 64; slot++) {
                try {
                    const ctrl = Instance.GetPlayerController(slot);
                    if (!ctrl) continue;
                    const pawn = ctrl.GetPlayerPawn?.();
                    if (!pawn) continue;
                    const primary   = pawn.FindWeaponBySlot?.(0);
                    const secondary = pawn.FindWeaponBySlot?.(1);
                    if (primary)   pawn.DestroyWeapon?.(primary);
                    if (secondary) pawn.DestroyWeapon?.(secondary);
                } catch {}
            }
            // Empêcher le respawn avec des armes
            _cmd('mp_t_default_primary ""');
            _cmd('mp_ct_default_primary ""');
            _cmd('mp_t_default_secondary ""');
            _cmd('mp_ct_default_secondary ""');
        },
        () => {
            // Remettre les armes sauvegardées
            const wT  = teamState[TEAM_T].weaponKey;
            const wCT = teamState[TEAM_CT].weaponKey;
            if (wT)  _cmd(`${WEAPONS[wT].cvT}  "${WEAPONS[wT].classname}"`);
            if (wCT) _cmd(`${WEAPONS[wCT].cvCT} "${WEAPONS[wCT].classname}"`);
        }
    );
}

// ── RESET TOUS LES MODES ──────────────────────────────────────
function resetAllModes() {
    // Désactiver chaque mode actif
    if (modes.oneshot)  modeOneShot();
    if (modes.headshot) modeHeadshot();
    if (modes.lowgrav)  modeLowGrav();
    if (modes.highgrav) modeHighGrav();
    if (modes.fastrun)  modeFastRun();
    if (modes.infammo)  modeInfAmmo();
    if (modes.noflash)  modeNoFlash();
    if (modes.knifeon)  modeKnifeOnly();
    _say("[Mode] ✔ Tous les modes réinitialisés.");
}

// Alias chat → fonction mode
const MODE_ALIAS_MAP = {
    "!oneshot":  modeOneShot,
    "!1shot":    modeOneShot,
    "!headshot": modeHeadshot,
    "!hs":       modeHeadshot,
    "!hsonly":   modeHeadshot,
    "!lowgrav":  modeLowGrav,
    "!lg":       modeLowGrav,
    "!highgrav": modeHighGrav,
    "!hg":       modeHighGrav,
    "!fastrun":  modeFastRun,
    "!fast":     modeFastRun,
    "!fr":       modeFastRun,
    "!infammo":  modeInfAmmo,
    "!ia":       modeInfAmmo,
    "!noflash":  modeNoFlash,
    "!nf":       modeNoFlash,
    "!knifeonly":modeKnifeOnly,
    "!ko":       modeKnifeOnly,
    "!reset":    resetAllModes,
};


// ════════════════════════════════════════════════════════════
//  COMMANDES CHAT
// ════════════════════════════════════════════════════════════

Instance.OnPlayerChat?.((ctx) => {
    try {
        const rawText = ctx?.text?.trim();
        if (!rawText) return;
        const text = rawText.toLowerCase();
        const player = ctx?.player;

        // ── !weapons ─────────────────────────────────────────
        if (text === "!weapons") {
            const dest = Instance.FindEntityByName("@weapon_selector");
            if (!dest) { _say("[Loadout] @weapon_selector introuvable !"); return; }
            const destPos    = dest.GetAbsOrigin?.();
            const destAngles = dest.GetAngles?.();
            if (!destPos) return;
            const rp = _resolveCtrlPawn(player);
            if (!rp) return;
            rp.pawn.Teleport?.(destPos, destAngles ?? null, { x: 0, y: 0, z: 0 });
            _say(`[Loadout] ${_getName(rp.ctrl)} → Weapon Selector`);
            return;
        }

        // ── !nades ───────────────────────────────────────────
        if (text === "!nades") {
            const rp = _resolveCtrlPawn(player);
            if (!rp) return;
            const team = rp.pawn.GetTeamNumber?.();
            const fireGrenade = team === TEAM_CT ? "weapon_incgrenade" : "weapon_molotov";
            for (const g of ["weapon_flashbang","weapon_flashbang","weapon_hegrenade", fireGrenade]) {
                try { rp.pawn.GiveNamedItem?.(g, false); } catch {}
            }
            _say(`[Loadout] ${_getName(rp.ctrl)} → 2x Flash + HE + Fire`);
            return;
        }

        // ── !help ─────────────────────────────────────────────
        if (text === "!help") {
            _sayLines([
                "╔═══════════════════════════════════════════╗",
                "║          COMMANDES 1v1 — LOADOUT          ║",
                "╠═══════════════════════════════════════════╣",
                "║  UTILITAIRES                              ║",
                "║  !weapons    Téléport sélecteur d'armes   ║",
                "║  !nades      2x Flash + HE + Molotov      ║",
                "║  !help       Afficher ce menu             ║",
                "╠═══════════════════════════════════════════╣",
                "║  RIFLES & SMGs                            ║",
                "║  !ak  !awp  !m4  !m4s  !scout  !aug       ║",
                "║  !famas  !galil  !sg  !mp9  !mac10        ║",
                "║  !mp7  !ump  !p90  !bizon  !mp5           ║",
                "╠═══════════════════════════════════════════╣",
                "║  SHOTGUNS & HEAVY                         ║",
                "║  !nova  !xm  !sawed  !mag7                ║",
                "║  !negev  !m249                            ║",
                "╠═══════════════════════════════════════════╣",
                "║  PISTOLS                                  ║",
                "║  !deagle  !usp  !glock  !p250  !p2000     ║",
                "║  !57  !tec9  !cz  !r8                     ║",
                "╠═══════════════════════════════════════════╣",
                "║  COUTEAUX                                 ║",
                "║  !karambit  !butterfly  !m9  !bayonet     ║",
                "║  !huntsman  !flip  !gut  !bowie           ║",
                "║  !shadow  !falchion  !navaja  !stiletto   ║",
                "║  !talon  !ursus  !skeleton  !paracord     ║",
                "║  !survival  !classic  !nomad  !kukri      ║",
                "╠═══════════════════════════════════════════╣",
                "║  MODES DE JEU (toggle ON/OFF)             ║",
                "║  !oneshot    Un tir = mort (n'importe où) ║",
                "║  !headshot   Tête only (corps = 0 dmg)    ║",
                "║  !lowgrav    Gravité réduite              ║",
                "║  !highgrav   Gravité élevée               ║",
                "║  !fastrun    Vitesse de déplacement +50%  ║",
                "║  !infammo    Munitions infinies           ║",
                "║  !noflash    Désactiver les flashbang     ║",
                "║  !knifeonly  Couteau uniquement           ║",
                "║  !reset      Tout réinitialiser           ║",
                "╚═══════════════════════════════════════════╝",
            ]);
            return;
        }

        // ── Modes de jeu ──────────────────────────────────────
        if (text in MODE_ALIAS_MAP) {
            MODE_ALIAS_MAP[text]();
            return;
        }

        // ── Commandes armes ───────────────────────────────────
        if (text in WEAPON_ALIAS_MAP) {
            const rp = _resolveCtrlPawn(player);
            if (!rp) return;
            const team = rp.pawn.GetTeamNumber?.();
            if (team !== TEAM_T && team !== TEAM_CT) return;
            setWeapon({ team, ctrl: rp.ctrl, pawn: rp.pawn }, WEAPON_ALIAS_MAP[text]);
            return;
        }

        // ── Commandes couteaux ────────────────────────────────
        if (text in KNIFE_ALIAS_MAP) {
            const rp = _resolveCtrlPawn(player);
            if (!rp) return;
            const team = rp.pawn.GetTeamNumber?.();
            if (team !== TEAM_T && team !== TEAM_CT) return;
            setKnife({ team, ctrl: rp.ctrl, pawn: rp.pawn }, KNIFE_ALIAS_MAP[text]);
            return;
        }

    } catch(e) { _log(`OnPlayerChat error: ${e}`); }
});


// ════════════════════════════════════════════════════════════
//  MUSIC PLAYER
// ════════════════════════════════════════════════════════════

function _updateDisplay() {
    if (!TRACKS.length) return;
    const t = TRACKS[music.index];
    const s = music.playing ? "▶" : music.paused ? "⏸" : "⏹";
    _fire("@music_display", "SetMessage",
        `${s} ${t.name} (${music.index+1}/${TRACKS.length})${music.shuffle?" [SHF]":""}${music.repeat?" [REP]":""}`);
}

function _stopAllSounds() { for (const t of TRACKS) _fire(t.entity, "StopSound"); }

function _nextIdx() {
    if (music.repeat) return music.index;
    if (music.shuffle) {
        if (TRACKS.length <= 1) return 0;
        let n; do { n = Math.floor(Math.random() * TRACKS.length); } while (n === music.index);
        return n;
    }
    return (music.index + 1) % TRACKS.length;
}

function _prevIdx() {
    if (music.repeat) return music.index;
    if (music.shuffle) return _nextIdx();
    return (music.index - 1 + TRACKS.length) % TRACKS.length;
}

function _startTrack() {
    if (!TRACKS.length) return;
    _stopAllSounds();
    const t = TRACKS[music.index];
    music.playing = true; music.paused = false;
    _fire(t.entity, "StartSound");
    _glow("@music_btn_play", GLOW_PLAY);
    _glow("@music_btn_pause", null); _glow("@music_btn_stop", null);
    _updateDisplay();
    _say(`[Music] ▶ ${t.name}  (${music.index+1}/${TRACKS.length})`);
}

function musicPlay() {
    if (!TRACKS.length) return;
    if (music.paused) {
        const t = TRACKS[music.index];
        music.playing = true; music.paused = false;
        _fire(t.entity, "StartSound");
        _glow("@music_btn_play", GLOW_PLAY); _glow("@music_btn_pause", null);
        _updateDisplay(); _say(`[Music] ▶ Resumed: ${t.name}`);
    } else { _startTrack(); }
}
function musicPause() {
    if (!music.playing) return;
    const t = TRACKS[music.index];
    music.playing = false; music.paused = true;
    _fire(t.entity, "StopSound");
    _glow("@music_btn_play", null); _glow("@music_btn_pause", GLOW_PAUSE);
    _updateDisplay(); _say(`[Music] ⏸ ${t.name}`);
}
function musicStop() {
    _stopAllSounds(); music.playing = false; music.paused = false;
    _glow("@music_btn_play", null); _glow("@music_btn_pause", null);
    _glow("@music_btn_stop", GLOW_STOP); _updateDisplay();
    scheduler.setTimeout(0.6, () => _glow("@music_btn_stop", null));
    _say("[Music] ⏹ Stopped.");
}
function musicNext() { music.index = _nextIdx(); _flashGlow("@music_btn_next", GLOW_NAV); _startTrack(); }
function musicPrev() { music.index = _prevIdx(); _flashGlow("@music_btn_prev", GLOW_NAV); _startTrack(); }
function musicToggleShuffle() {
    music.shuffle = !music.shuffle;
    _glow("@music_btn_shuffle", music.shuffle ? GLOW_SHUFFLE : null);
    _updateDisplay(); _say(`[Music] Shuffle: ${music.shuffle?"ON":"OFF"}`);
}
function musicToggleRepeat() {
    music.repeat = !music.repeat;
    _glow("@music_btn_repeat", music.repeat ? GLOW_REPEAT : null);
    _updateDisplay(); _say(`[Music] Repeat: ${music.repeat?"ON":"OFF"}`);
}
function musicGoTo(idx) {
    if (idx < 0 || idx >= TRACKS.length) return;
    music.index = idx; _startTrack();
}


// ════════════════════════════════════════════════════════════
//  CÂBLAGE BOUTONS
//  Appeler wireAllButtons() à chaque round corrige le bug de
//  reset manuel — les connexions sont déconnectées puis
//  recrées proprement.
// ════════════════════════════════════════════════════════════

function wireAllButtons() {
    for (const h of connections) { try { Instance.DisconnectOutput(h); } catch {} }
    connections.length = 0;

    // Armes
    for (const key of Object.keys(WEAPONS)) {
        const k = key;
        _wireButton(`@weapon_btn_${k}`, (p) => setWeapon(p, k));
    }
    // Couteaux
    for (const key of Object.keys(KNIVES)) {
        const k = key;
        _wireButton(`@knife_btn_${k}`, (p) => setKnife(p, k));
    }
    // Modes — boutons optionnels en map
    _wireButton("@mode_btn_oneshot",   () => modeOneShot());
    _wireButton("@mode_btn_headshot",  () => modeHeadshot());
    _wireButton("@mode_btn_lowgrav",   () => modeLowGrav());
    _wireButton("@mode_btn_highgrav",  () => modeHighGrav());
    _wireButton("@mode_btn_fastrun",   () => modeFastRun());
    _wireButton("@mode_btn_infammo",   () => modeInfAmmo());
    _wireButton("@mode_btn_noflash",   () => modeNoFlash());
    _wireButton("@mode_btn_knifeonly", () => modeKnifeOnly());
    _wireButton("@mode_btn_reset",     () => resetAllModes());
    // Musique
    _wireButton("@music_btn_play",     () => musicPlay());
    _wireButton("@music_btn_pause",    () => musicPause());
    _wireButton("@music_btn_stop",     () => musicStop());
    _wireButton("@music_btn_next",     () => musicNext());
    _wireButton("@music_btn_prev",     () => musicPrev());
    _wireButton("@music_btn_shuffle",  () => musicToggleShuffle());
    _wireButton("@music_btn_repeat",   () => musicToggleRepeat());

    for (let i = 0; i < TRACKS.length; i++) {
        const idx = i;
        _wireButton(`@music_btn_track_${String(idx+1).padStart(2,"0")}`, () => musicGoTo(idx));
    }

    _log(`Buttons wired (${connections.length} connections).`);
}


// ════════════════════════════════════════════════════════════
//  SCRIPT INPUTS (Hammer I/O)
// ════════════════════════════════════════════════════════════

Instance.OnScriptInput("Init",    () => wireAllButtons());
Instance.OnScriptInput("WireAll", () => wireAllButtons());
Instance.OnScriptInput("Reset",   () => resetAllModes());

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
    _cmd("mp_buy_anywhere 1");
    _cmd("mp_buytime 99999");
    wireAllButtons();
    _updateDisplay();
    _say("★ 1v1 Oasis ★");
    _say("Type !help to see all commands.");
});

Instance.OnRoundStart(() => {
    _log("Round start — rewiring + restoring knives.");
    wireAllButtons();
    restoreAllKnives(0.8);
});

Instance.OnScriptReload({
    before: () => {
        _stopAllSounds();
        for (const h of connections) { try { Instance.DisconnectOutput(h); } catch {} }
        connections.length = 0;
        _log("Reloading...");
    },
    after: () => {
        wireAllButtons();
        _updateDisplay();
        restoreAllKnives(0.3);
        _log("Reloaded.");
    },
});

_log(`loadout_music.js ready — ${Object.keys(WEAPONS).length} wpns, ${Object.keys(KNIVES).length} knives, ${TRACKS.length} tracks, ${Object.keys(MODE_ALIAS_MAP).length} mode cmds.`);
