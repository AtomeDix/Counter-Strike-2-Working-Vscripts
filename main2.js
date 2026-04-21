import { Instance } from "cs_script/point_script";

const Weapons = Object.freeze({
    weapon_ak47: { className: "weapon_ak47", name: "AK47", capacity: 30 },
    weapon_m4a1: { className: "weapon_m4a1", name: "M4A4", capacity: 30 },
    weapon_m4a1_silencer: { className: "weapon_m4a1_silencer", name: "M4A1-S", capacity: 20 },
    weapon_galilar: { className: "weapon_galilar", name: "Galil AR", capacity: 35 },
    weapon_famas: { className: "weapon_famas", name: "FAMAS", capacity: 25 },
    weapon_aug: { className: "weapon_aug", name: "AUG", capacity: 30 },
    weapon_sg556: { className: "weapon_sg556", name: "SG 553", capacity: 30 },
    weapon_awp: { className: "weapon_awp", name: "AWP", capacity: 5 },
    weapon_ssg08: { className: "weapon_ssg08", name: "Scout", capacity: 10 },
    weapon_scar20: { className: "weapon_scar20", name: "CT Auto", capacity: 20 },
    weapon_g3sg1: { className: "weapon_g3sg1", name: "T Auto", capacity: 20 },
    weapon_nova: { className: "weapon_nova", name: "Nova", capacity: 8 },
    weapon_xm1014: { className: "weapon_xm1014", name: "XM1014", capacity: 6 },
    weapon_sawedoff: { className: "weapon_sawedoff", name: "Sawed-Off", capacity: 7 },
    weapon_mag7: { className: "weapon_mag7", name: "MAG-7", capacity: 5 },
    weapon_m249: { className: "weapon_m249", name: "M249", capacity: 100 },
    weapon_negev: { className: "weapon_negev", name: "Negev", capacity: 150 },
    weapon_mac10: { className: "weapon_mac10", name: "MAC-10", capacity: 30 },
    weapon_mp5sd: { className: "weapon_mp5sd", name: "MP5-SD", capacity: 30 },
    weapon_mp7: { className: "weapon_mp7", name: "MP7", capacity: 30 },
    weapon_mp9: { className: "weapon_mp9", name: "MP9", capacity: 30 },
    weapon_bizon: { className: "weapon_bizon", name: "PP-Bizon", capacity: 64 },
    weapon_p90: { className: "weapon_p90", name: "P90", capacity: 50 },
    weapon_ump45: { className: "weapon_ump45", name: "UMP-45", capacity: 25 },
    weapon_deagle: { className: "weapon_deagle", name: "Desert Eagle", capacity: 7 },
    weapon_elite: { className: "weapon_elite", name: "Dual Berettas", capacity: 30 },
    weapon_fiveseven: { className: "weapon_fiveseven", name: "Five-SeveN", capacity: 20 },
    weapon_glock: { className: "weapon_glock", name: "Glock-18", capacity: 20 },
    weapon_hkp2000: { className: "weapon_hkp2000", name: "P2000", capacity: 13 },
    weapon_p250: { className: "weapon_p250", name: "P250", capacity: 13 },
    weapon_usp_silencer: { className: "weapon_usp_silencer", name: "USP-S", capacity: 12 },
    weapon_tec9: { className: "weapon_tec9", name: "Tec-9", capacity: 18 },
    weapon_cz75a: { className: "weapon_cz75a", name: "CZ75-Auto", capacity: 12 },
    weapon_revolver: { className: "weapon_revolver", name: "R8 Revolver", capacity: 8 },
});

// Slot 0 = primary, slot 1 = secondary
const WeaponSlots = Object.freeze({
    weapon_ak47: 0, weapon_m4a1: 0, weapon_m4a1_silencer: 0, weapon_galilar: 0, weapon_famas: 0,
    weapon_aug: 0, weapon_sg556: 0, weapon_awp: 0, weapon_ssg08: 0, weapon_scar20: 0,
    weapon_g3sg1: 0, weapon_nova: 0, weapon_xm1014: 0, weapon_sawedoff: 0, weapon_mag7: 0,
    weapon_m249: 0, weapon_negev: 0, weapon_mac10: 0, weapon_mp5sd: 0, weapon_mp7: 0,
    weapon_mp9: 0, weapon_bizon: 0, weapon_p90: 0, weapon_ump45: 0,
    weapon_deagle: 1, weapon_elite: 1, weapon_fiveseven: 1, weapon_glock: 1,
    weapon_hkp2000: 1, weapon_p250: 1, weapon_usp_silencer: 1, weapon_tec9: 1,
    weapon_cz75a: 1, weapon_revolver: 1,
});

// Maps set_weapon input name suffix
const WeaponBrushMap = Object.freeze({
    ak47:     { weaponClass: "weapon_ak47",           wallbrush: "ak47_wallbrush" },
    m4a1:     { weaponClass: "weapon_m4a1_silencer",   wallbrush: "m4a1_wallbrush" },
    m4a4:     { weaponClass: "weapon_m4a1",            wallbrush: "m4a4_wallbrush" },
    nova:     { weaponClass: "weapon_nova",            wallbrush: "nova_wallbrush" },
    aug:      { weaponClass: "weapon_aug",             wallbrush: "aug_wallbrush" },
    m249:     { weaponClass: "weapon_m249",            wallbrush: "m249_wallbrush" },
    p90:      { weaponClass: "weapon_p90",             wallbrush: "p90_wallbrush" },
    awp:      { weaponClass: "weapon_awp",             wallbrush: "awp_wallbrush" },
    mac10:    { weaponClass: "weapon_mac10",           wallbrush: "mac10_wallbrush" },
    sawedoff: { weaponClass: "weapon_sawedoff",        wallbrush: "sawedoff_wallbrush" },
    bizon:    { weaponClass: "weapon_bizon",           wallbrush: "bizon_wallbrush" },
    mag7:     { weaponClass: "weapon_mag7",            wallbrush: "mag7_wallbrush" },
    ctauto:   { weaponClass: "weapon_scar20",          wallbrush: "ctauto_wallbrush" },
    famas:    { weaponClass: "weapon_famas",           wallbrush: "famas_wallbrush" },
    mp5:      { weaponClass: "weapon_mp5sd",           wallbrush: "mp5_wallbrush" },
    krieg:    { weaponClass: "weapon_sg556",           wallbrush: "krieg_wallbrush" },
    tauto:    { weaponClass: "weapon_g3sg1",           wallbrush: "tauto_wallbrush" },
    mp7:      { weaponClass: "weapon_mp7",             wallbrush: "mp7_wallbrush" },
    scout:    { weaponClass: "weapon_ssg08",           wallbrush: "scout_wallbrush" },
    galil:    { weaponClass: "weapon_galilar",         wallbrush: "galil_wallbrush" },
    mp9:      { weaponClass: "weapon_mp9",             wallbrush: "mp9_wallbrush" },
    ump:      { weaponClass: "weapon_ump45",           wallbrush: "ump_wallbrush" },
    negev:    { weaponClass: "weapon_negev",           wallbrush: "negev_wallbrush" },
    xm:       { weaponClass: "weapon_xm1014",         wallbrush: "xm_wallbrush" },
    cz:       { weaponClass: "weapon_cz75a",           wallbrush: "cz_wallbrush" },
    deagle:   { weaponClass: "weapon_deagle",          wallbrush: "deagle_wallbrush" },
    duals:    { weaponClass: "weapon_elite",           wallbrush: "duals_wallbrush" },
    fiveseven:{ weaponClass: "weapon_fiveseven",       wallbrush: "fiveseven_wallbrush" },
    glock:    { weaponClass: "weapon_glock",           wallbrush: "glock_wallbrush" },
    p250:     { weaponClass: "weapon_p250",            wallbrush: "p250_wallbrush" },
    usp:      { weaponClass: "weapon_usp_silencer",    wallbrush: "usp_wallbrush" },
    p2000:    { weaponClass: "weapon_hkp2000",         wallbrush: "p2000_wallbrush" },
    r8:       { weaponClass: "weapon_revolver",        wallbrush: "r8_wallbrush" },
    tec9:     { weaponClass: "weapon_tec9",            wallbrush: "tec9_wallbrush" },
});

const WALLBRUSH_COLOR_UNSELECTED = "100 100 100";
const WALLBRUSH_COLOR_SELECTED = "198 120 92";

const AllPrimaryBrushes = Object.values(WeaponBrushMap)
    .filter(entry => WeaponSlots[entry.weaponClass] === 0)
    .map(entry => entry.wallbrush);

const AllSecondaryBrushes = Object.values(WeaponBrushMap)
    .filter(entry => WeaponSlots[entry.weaponClass] === 1)
    .map(entry => entry.wallbrush);

let selectedPrimary = undefined;
let selectedSecondary = undefined;

function setWeapon(weaponKey) {
    const entry = WeaponBrushMap[weaponKey];
    if (!entry) return;

    const { weaponClass, wallbrush } = entry;
    const slot = WeaponSlots[weaponClass];
    const pawn = PlayerPawn.pawn;
    if (!pawn) return;

    // Track selection
    if (slot === 0) {
        selectedPrimary = weaponClass;
    } else {
        selectedSecondary = weaponClass;
    }

    // Remove existing weapon in the same slot
    const existingWeapon = pawn.FindWeaponBySlot(slot);
    if (existingWeapon) {
        pawn.DestroyWeapon(existingWeapon);
    }

    // Give the new weapon
    pawn.GiveNamedItem(weaponClass, true);

    // Switch to the correct slot
    if (slot === 0) {
        Instance.ClientCommand(0, "slot1");
    } else {
        Instance.ClientCommand(0, "slot2");
    }

    // Update wallbrush colors
    const brushGroup = slot === 0 ? AllPrimaryBrushes : AllSecondaryBrushes;
    for (const brush of brushGroup) {
        Instance.ServerCommand(`ent_fire ${brush} color "${WALLBRUSH_COLOR_UNSELECTED}"`, 0.0);
    }
    Instance.ServerCommand(`ent_fire ${wallbrush} color "${WALLBRUSH_COLOR_SELECTED}"`, 0.0);

    saveSettings();
}

const WorldText = Object.freeze({
    best: {
        name: "wt_results_best_name_",
        score: "wt_results_best_score_",
        accuracy: "wt_results_best_accuracy_"
    },
    recent: {
        name: "wt_results_recent_name_",
        score: "wt_results_recent_score_",
        accuracy: "wt_results_recent_accuracy_",
        max: 5
    },
    total: "wt_results_total_"
});

const RenderFlags = {
    RENDER_RECENT: 1,
    RENDER_BEST: 2,
    RENDER_TOTAL_COMPLETED: 4
};

const playerModels = [
    "characters/models/tm_balkan/tm_balkan_varianth.vmdl",
    "characters/models/ctm_fbi/ctm_fbi_variantd.vmdl",
    "characters/models/ctm_fbi/ctm_fbi.vmdl",
    "characters/models/tm_jungle_raider/tm_jungle_raider_variante.vmdl",
    "characters/models/tm_professional/tm_professional_varf.vmdl",
    "characters/models/tm_leet/tm_leet_variantj.vmdl",
    "characters/models/tm_professional/tm_professional_vari.vmdl",
    "characters/models/ctm_fbi/ctm_fbi_variantf.vmdl",
    "characters/models/tm_balkan/tm_balkan_variantg.vmdl",
    "characters/models/ctm_diver/ctm_diver_varianta.vmdl",
    "characters/models/ctm_st6/ctm_st6_varianti.vmdl",
    "characters/models/ctm_fbi/ctm_fbi_varianth.vmdl",
    "characters/models/ctm_fbi/ctm_fbi_variantg.vmdl",
    "characters/models/tm_phoenix/tm_phoenix_varianti.vmdl",
    "characters/models/tm_professional/tm_professional_varf4.vmdl",
    "characters/models/tm_leet/tm_leet_varianti.vmdl",
    "characters/models/ctm_sas/ctm_sas_variantg.vmdl",
    "characters/models/tm_balkan/tm_balkan_variantj.vmdl",
    "characters/models/ctm_fbi/ctm_fbi_variantb.vmdl",
    "characters/models/ctm_fbi/ctm_fbi_variantc.vmdl",
	"characters/models/ctm_sas/ctm_sas.vmdl",
	"characters/models/ctm_sas/ctm_sas.vmdl",
	"characters/models/ctm_sas/ctm_sas.vmdl",
	"characters/models/ctm_sas/ctm_sas.vmdl",
	"characters/models/ctm_sas/ctm_sas.vmdl",
	"characters/models/ctm_sas/ctm_sas.vmdl",
	"characters/models/ctm_sas/ctm_sas.vmdl",
	"characters/models/ctm_sas/ctm_sas.vmdl",
	"characters/models/ctm_sas/ctm_sas.vmdl",
	"characters/models/ctm_sas/ctm_sas.vmdl",
	"characters/models/ctm_sas/ctm_sas.vmdl",
	"characters/models/ctm_sas/ctm_sas.vmdl",
	"characters/models/ctm_sas/ctm_sas.vmdl",
	"characters/models/ctm_sas/ctm_sas.vmdl",
	"characters/models/ctm_sas/ctm_sas.vmdl",
	"characters/models/tm_phoenix/tm_phoenix.vmdl",
	"characters/models/tm_phoenix/tm_phoenix.vmdl",
	"characters/models/tm_phoenix/tm_phoenix.vmdl",
	"characters/models/tm_phoenix/tm_phoenix.vmdl",
	"characters/models/tm_phoenix/tm_phoenix.vmdl",
	"characters/models/tm_phoenix/tm_phoenix.vmdl",
	"characters/models/tm_phoenix/tm_phoenix.vmdl",
	"characters/models/tm_phoenix/tm_phoenix.vmdl",
	"characters/models/tm_phoenix/tm_phoenix.vmdl",
	"characters/models/tm_phoenix/tm_phoenix.vmdl",
	"characters/models/tm_phoenix/tm_phoenix.vmdl",
	"characters/models/tm_phoenix/tm_phoenix.vmdl",
	"characters/models/tm_phoenix/tm_phoenix.vmdl",
	"characters/models/tm_phoenix/tm_phoenix.vmdl",
	"characters/models/tm_phoenix/tm_phoenix.vmdl"
];

const DEFAULT_MODEL = "characters/models/ctm_sas/ctm_sas.vmdl";
let isModelChangeEnabled = true;
const assignedModels = new Map();

let kzGameMode;
let sprayGameMode;
let killGameMode;
let activeGameMode = null;
const Tick = 0.05;

// Settings state
let armorSetting = 1;   // 1 = kevlar only (default), 2 = kevlar + helmet, 3 = no armor
let ammoSetting = 1;    // 1 = infinite ammo (default), 2 = off
let playermodelsSetting = 2; // 1 = off, 2 = on (default)
let hsSetting = 1;      // 1 = off (default), 2 = on

function setArmor() {
    armorSetting = (armorSetting % 3) + 1;
    Instance.ServerCommand(`ent_fire counter_armor setvalue ${armorSetting}`, 0.0);
    saveSettings();
}

function setAmmo() {
    ammoSetting = (ammoSetting % 2) + 1;
    Instance.ServerCommand(`ent_fire counter_ammo setvalue ${ammoSetting}`, 0.0);
    saveSettings();
}

function setPlayermodels() {
    playermodelsSetting = (playermodelsSetting % 2) + 1;
    Instance.ServerCommand(`ent_fire counter_playermodels setvalue ${playermodelsSetting}`, 0.0);
    saveSettings();
}

function setHs() {
    hsSetting = (hsSetting % 2) + 1;
    Instance.ServerCommand(`ent_fire counter_headshot setvalue ${hsSetting}`, 0.0);
    saveSettings();
}

function saveSettings() {
    const data = JSON.stringify({
        primary: selectedPrimary || null,
        secondary: selectedSecondary || null,
        knife: selectedKnifeId !== undefined ? selectedKnifeId : null,
        armor: armorSetting,
        ammo: ammoSetting,
        playermodels: playermodelsSetting,
        hs: hsSetting,
        kzPb: kzGameMode ? kzGameMode.pbTotalSeconds : null,
        killPbTimes: killGameMode ? killGameMode.pbTimes : {},
    });
    Instance.SetSaveData(data);
}

function loadAndApplySettings() {
    const raw = Instance.GetSaveData();
    if (!raw) return;

    let data;
    try {
        data = JSON.parse(raw);
    } catch (e) {
        return;
    }

    const pawn = PlayerPawn.pawn;

    // Restore primary
    if (data.primary) {
        selectedPrimary = data.primary;
        if (pawn) {
            const existing = pawn.FindWeaponBySlot(0);
            if (existing) pawn.DestroyWeapon(existing);
            pawn.GiveNamedItem(selectedPrimary, false);
        }
        for (const brush of AllPrimaryBrushes) {
            Instance.ServerCommand(`ent_fire ${brush} color "${WALLBRUSH_COLOR_UNSELECTED}"`, 0.0);
        }
        const primaryEntry = Object.values(WeaponBrushMap).find(e => e.weaponClass === selectedPrimary);
        if (primaryEntry) {
            Instance.ServerCommand(`ent_fire ${primaryEntry.wallbrush} color "${WALLBRUSH_COLOR_SELECTED}"`, 0.0);
        }
    }

    // Restore secondary
    if (data.secondary) {
        selectedSecondary = data.secondary;
        if (pawn) {
            const existing = pawn.FindWeaponBySlot(1);
            if (existing) pawn.DestroyWeapon(existing);
            pawn.GiveNamedItem(selectedSecondary, false);
        }
        for (const brush of AllSecondaryBrushes) {
            Instance.ServerCommand(`ent_fire ${brush} color "${WALLBRUSH_COLOR_UNSELECTED}"`, 0.0);
        }
        const secondaryEntry = Object.values(WeaponBrushMap).find(e => e.weaponClass === selectedSecondary);
        if (secondaryEntry) {
            Instance.ServerCommand(`ent_fire ${secondaryEntry.wallbrush} color "${WALLBRUSH_COLOR_SELECTED}"`, 0.0);
        }
    }

    // Restore knife
    if (data.knife !== null && data.knife !== undefined) {
        selectedKnifeId = data.knife;
        if (pawn) {
            const existingKnife = pawn.FindWeaponBySlot(2);
            if (existingKnife) pawn.DestroyWeapon(existingKnife);
            giveSelectedKnife(pawn);
        }
        for (const brush of AllKnifeBrushes) {
            Instance.ServerCommand(`ent_fire ${brush} color "${WALLBRUSH_COLOR_UNSELECTED}"`, 0.0);
        }
        const knifeBrush = KnifeBrushMap[data.knife];
        if (knifeBrush) {
            Instance.ServerCommand(`ent_fire ${knifeBrush} color "${WALLBRUSH_COLOR_SELECTED}"`, 0.0);
        }
    }

    // Restore settings
    if (data.armor) {
        armorSetting = data.armor;
        Instance.ServerCommand(`ent_fire counter_armor setvalue ${armorSetting}`, 0.0);
    }
    if (data.ammo) {
        ammoSetting = data.ammo;
        Instance.ServerCommand(`ent_fire counter_ammo setvalue ${ammoSetting}`, 0.0);
    }
    if (data.playermodels) {
        playermodelsSetting = data.playermodels;
        Instance.ServerCommand(`ent_fire counter_playermodels setvalue ${playermodelsSetting}`, 0.0);
    }
    if (data.hs) {
        hsSetting = data.hs;
        Instance.ServerCommand(`ent_fire counter_headshot setvalue ${hsSetting}`, 0.0);
    }

    // Switch to primary
    if (selectedPrimary) {
        Instance.ClientCommand(0, "slot1");
    }

    // Restore KZ personal best
    if (data.kzPb !== null && data.kzPb !== undefined && kzGameMode) {
        kzGameMode.pbTotalSeconds = data.kzPb;
    }

    // Restore Kill mode personal bests
    if (data.killPbTimes && killGameMode) {
        killGameMode.pbTimes = data.killPbTimes;
    }
}

function updateTime() {
    if (kzGameMode) kzGameMode.update();
    if (sprayGameMode) sprayGameMode.update();
    if (killGameMode) killGameMode.update();
    if (activeGameMode) {
        const message = activeGameMode.getHudMessage();
        if (message !== "") {
            const hudEntity = Instance.FindEntityByName("fast_hudhint");
            if (!hudEntity) {
                Instance.ServerCommand(`ent_create env_hudhint {"targetname" "fast_hudhint" "message" "${message}"}`, 0.0);
            }
            Instance.ServerCommand(`ent_fire fast_hudhint ShowHudHint`, Tick);
            Instance.ServerCommand(`ent_fire fast_hudhint kill`, 0.1);
        } else {
            Instance.ServerCommand(`ent_fire fast_hudhint kill`, 0.0);
        }
    }
    Instance.SetNextThink(Instance.GetGameTime() + Tick);
}

function startTimer() {
    if (kzGameMode) {
        Instance.ServerCommand(`ent_fire fast_hudhint kill`, 0.0);
        kzGameMode.start();
        activeGameMode = kzGameMode;
        Instance.SetThink(() => updateTime());
        Instance.SetNextThink(Instance.GetGameTime() + Tick);
    }
}

function stopTimer() {
    if (kzGameMode && kzGameMode.isActive) {
        kzGameMode.stop();
        activeGameMode = null;
        Instance.ServerCommand(`ent_fire fast_hudhint kill`, 0.0);
        Instance.SetThink(null);
    }
}

function restartTimer() {
    if (kzGameMode && kzGameMode.isActive) {
        kzGameMode.restart();
        activeGameMode = null;
        Instance.ServerCommand(`ent_fire fast_hudhint kill`, 0.0);
        Instance.SetThink(null);
    }
}

function incFails() {
    if (kzGameMode && kzGameMode.isActive) {
        kzGameMode.incFails();
    }
}

function targetHit(inputData) {
    if (sprayGameMode) {
        const weaponClass = inputData.value || PlayerPawn.activeWeaponName || "unknown";
        sprayGameMode.targetHit(weaponClass);
    }
}

function weaponFired() {
    if (sprayGameMode && sprayGameMode.isActive) {
        sprayGameMode.weaponFired();
    }
}

function weaponSwitched() {
    if (sprayGameMode && sprayGameMode.isActive) {
        sprayGameMode.resetActiveWeaponData();
        const weaponClass = PlayerPawn.activeWeaponName;
        let normalizedWeaponClass = weaponClass;
        if (weaponClass && !weaponClass.startsWith("weapon_")) {
            normalizedWeaponClass = `weapon_${weaponClass}`;
        }
        if (normalizedWeaponClass in Weapons) {
            const { name, capacity } = Weapons[normalizedWeaponClass];
            sprayGameMode.currentData = { className: normalizedWeaponClass, name, capacity, hits: 0, fired: 0 };
        }
    }
}

function enteredSprayArea() {
    if (sprayGameMode) {
        Instance.ServerCommand(`ent_fire fast_hudhint kill`, 0.0);
        sprayGameMode.updateCurrentSprayArea(true);
        activeGameMode = sprayGameMode;
        const weaponClass = PlayerPawn.activeWeaponName;
        let normalizedWeaponClass = weaponClass;
        if (weaponClass && !weaponClass.startsWith("weapon_")) {
            normalizedWeaponClass = `weapon_${weaponClass}`;
        }
        if (normalizedWeaponClass in Weapons) {
            const { name, capacity } = Weapons[normalizedWeaponClass];
            sprayGameMode.currentData = { className: normalizedWeaponClass, name, capacity, hits: 0, fired: 0 };
        }
        Instance.SetThink(() => updateTime());
        Instance.SetNextThink(Instance.GetGameTime() + Tick);
    }
}

function exitedSprayArea() {
    if (sprayGameMode) {
        sprayGameMode.updateCurrentSprayArea(false);
        sprayGameMode.resetActiveWeaponData();
        activeGameMode = null;
        Instance.ServerCommand(`ent_fire fast_hudhint kill`, 0.0);
        Instance.SetThink(null);
    }
}

function startKill() {
    if (killGameMode) {
        Instance.ServerCommand(`ent_fire fast_hudhint kill`, 0.0);

        const pbTime = killGameMode.pbTimes[killGameMode.targetKills];
        if (pbTime !== undefined && pbTime !== null) {
            const totalSec = pbTime;
            const m = String(Math.floor(totalSec / 60)).padStart(2, '0');
            const remainder = totalSec - Math.floor(totalSec / 60) * 60;
            const sec = String(Math.floor(remainder)).padStart(2, '0');
            const ms = String(Math.floor((remainder - Math.floor(remainder)) * 100)).padStart(2, '0');
            Instance.ServerCommand(`say_team "Personal best ${killGameMode.targetKills} kills: ${m}:${sec}.${ms}"`, 0.0);
        }

        killGameMode.start();
        activeGameMode = killGameMode;
        Instance.SetThink(() => updateTime());
        Instance.SetNextThink(Instance.GetGameTime() + Tick);
    }
}

function stopKill() {
    if (killGameMode && killGameMode.isActive) {
        killGameMode.stop();
        activeGameMode = null;
        Instance.ServerCommand(`ent_fire fast_hudhint kill`, 0.0);
        Instance.SetThink(null);
    }
}

function setKills50() {
    if (killGameMode) {
        killGameMode.setTargetKills(50);
    }
}

function setKills75() {
    if (killGameMode) {
        killGameMode.setTargetKills(75);
    }
}

function setKills100() {
    if (killGameMode) {
        killGameMode.setTargetKills(100);
    }
}

class PlayerPawn {
    static get pawn() {
        const controller = Instance.GetPlayerController(0);
        if (!controller) {
            return null;
        }
        return controller.GetPlayerPawn();
    }

    static findWeaponBySlot(slot) {
        return this.pawn?.FindWeaponBySlot(slot);
    }

    static destroyWeapon(weapon) {
        if (weapon && this.pawn) {
            this.pawn.DestroyWeapon(weapon);
        }
    }

    static giveNamedItem(name, autoDeploy = true) {
        if (this.pawn) {
            this.pawn.GiveNamedItem(name, autoDeploy);
        }
    }

    static get activeWeaponName() {
        const weapon = this.pawn?.GetActiveWeapon();
        return weapon ? weapon.GetData().GetName() : "";
    }
}

const KnifeBrushMap = Object.freeze({
    515: "butterfly_wallbrush",
    507: "karambit_wallbrush",
    508: "m9_wallbrush",
    525: "skeleton_wallbrush",
    521: "nomad_wallbrush",
    500: "bayonet_wallbrush",
    523: "talon_wallbrush",
    503: "classic_wallbrush",
    522: "stiletto_wallbrush",
    505: "flip_wallbrush",
    519: "ursus_wallbrush",
    517: "paracord_wallbrush",
    518: "survival_wallbrush",
    509: "huntsman_wallbrush",
    512: "falchion_wallbrush",
    514: "bowie_wallbrush",
    526: "kukri_wallbrush",
    516: "daggers_wallbrush",
    506: "gut_wallbrush",
    520: "navaja_wallbrush",
});

const AllKnifeBrushes = Object.values(KnifeBrushMap);

let selectedKnifeId = undefined;

function giveSelectedKnife(pawn) {
    pawn.GiveNamedItem("weapon_knife", false);
    const knife = pawn.FindWeaponBySlot(2);
    if (knife && selectedKnifeId !== undefined) {
        Instance.EntFireAtTarget({ target: knife, input: "ChangeSubclass", value: selectedKnifeId });
    }
    Instance.ServerCommand("regenerate_weapon_skins", 0.0);
}

function setCustomKnife(id) {
    selectedKnifeId = id;
    const pawn = PlayerPawn.pawn;
    if (!pawn) return;
    const knifeWeapon = pawn.FindWeaponBySlot(2);
    if (knifeWeapon) pawn.DestroyWeapon(knifeWeapon);
    giveSelectedKnife(pawn);
    Instance.ClientCommand(0, "slot3");

    // Update knife wallbrush colors
    for (const brush of AllKnifeBrushes) {
        Instance.ServerCommand(`ent_fire ${brush} color "${WALLBRUSH_COLOR_UNSELECTED}"`, 0.0);
    }
    const selectedBrush = KnifeBrushMap[id];
    if (selectedBrush) {
        Instance.ServerCommand(`ent_fire ${selectedBrush} color "${WALLBRUSH_COLOR_SELECTED}"`, 0.0);
    }

    saveSettings();
}

function getWeapons() {
    const pawn = PlayerPawn.pawn;
    if (!pawn) return;

    if (!selectedPrimary) setWeapon("ak47");
    if (!selectedSecondary) setWeapon("deagle");

    const existingPrimary = pawn.FindWeaponBySlot(0);
    if (existingPrimary) pawn.DestroyWeapon(existingPrimary);
    pawn.GiveNamedItem(selectedPrimary, false);

    const existingSecondary = pawn.FindWeaponBySlot(1);
    if (existingSecondary) pawn.DestroyWeapon(existingSecondary);
    pawn.GiveNamedItem(selectedSecondary, false);

    if (selectedKnifeId !== undefined) {
        const existingKnife = pawn.FindWeaponBySlot(2);
        if (existingKnife) pawn.DestroyWeapon(existingKnife);
        giveSelectedKnife(pawn);
    }

    Instance.ClientCommand(0, "slot1");
}

class KZGameMode {
    constructor() {
        this.isActive = false;
        this.ms = 0;
        this.sec = 0;
        this.m = 0;
        this.fails = 0;
        this.showingCompletion = false;
        this.completionStep = 0;
        this.finalTime = null;
        this.finalFails = 0;
        this.completionStartTime = 0;
        this.lastUpdateTime = 0;
        this.pbTotalSeconds = null; // stored as total seconds
        this.wasNewPb = false;
    }

    getTotalSeconds() {
        return this.m * 60 + this.sec + this.ms;
    }

    formatSeconds(totalSeconds) {
        const m = Math.floor(totalSeconds / 60);
        const remainder = totalSeconds - m * 60;
        const sec = Math.floor(remainder);
        const ms = Math.floor((remainder - sec) * 100);
        return [
            String(m).padStart(2, '0'),
            String(sec).padStart(2, '0'),
            String(ms).padStart(2, '0')
        ];
    }

    update() {
        if (this.isActive) {
            const currentTime = Instance.GetGameTime();
            if (this.lastUpdateTime > 0) {
                const deltaTime = currentTime - this.lastUpdateTime;
                this.ms += deltaTime;
                while (this.ms >= 1) {
                    this.ms -= 1;
                    this.sec += 1;
                }
                while (this.sec >= 60) {
                    this.sec -= 60;
                    this.m += 1;
                }
            }
            this.lastUpdateTime = currentTime;
        }

        if (this.showingCompletion) {
            this.handleCompletionMessages();
        }
    }

    start() {
        if (!this.isActive) {
            this.isActive = true;
            this.lastUpdateTime = Instance.GetGameTime();
        }
    }

    stop() {
        if (this.isActive) {
            this.isActive = false;
            const finishTotalSeconds = this.getTotalSeconds();
            this.finalTime = this.formatedTime();
            this.finalFails = this.fails;
            this.showingCompletion = true;
            this.completionStep = 0;
            this.completionStartTime = Instance.GetGameTime();

            // Check for new PB
            this.wasNewPb = false;
            if (this.pbTotalSeconds === null) {
                // First completion,set initial PB silently
                this.pbTotalSeconds = finishTotalSeconds;
                saveSettings();
            } else if (finishTotalSeconds < this.pbTotalSeconds) {
                this.pbTotalSeconds = finishTotalSeconds;
                this.wasNewPb = true;
                saveSettings();
            }

            if (this.wasNewPb) {
                Instance.ServerCommand(`say_team "[PERSONAL BEST KZ]"`, 0.0);
                Instance.ServerCommand(`ent_fire snd_movement_pb startsound`, 0.0);
                Instance.ServerCommand(`ent_fire snd_pb startsound`, 0.0);
            } else {
                Instance.ServerCommand(`say_team "[KZ Complete]"`, 0.0);
            }
            Instance.ServerCommand(`ent_fire timer_finish showhudhint`, 1.0);

            this.m = 0;
            this.ms = 0;
            this.sec = 0;
            this.fails = 0;
            this.lastUpdateTime = 0;
        }
    }

    handleCompletionMessages() {
        const currentTime = Instance.GetGameTime();
        const elapsed = currentTime - this.completionStartTime;

        if (this.completionStep === 0 && elapsed >= 0.5) {
            const [m, sec, ms] = this.finalTime;
            Instance.ServerCommand(`say_team "Time: ${m}:${sec}.${ms}"`, 0.0);
            this.completionStep = 1;
        }

        if (this.completionStep === 1 && elapsed >= 1.0) {
            Instance.ServerCommand(`say_team "Fails: ${this.finalFails}"`, 0.0);
            this.completionStep = 2;
        }

        if (this.completionStep === 2 && elapsed >= 1.5) {
            this.showingCompletion = false;
            this.completionStep = 0;
        }
    }

    restart() {
        if (this.isActive) {
            this.isActive = false;
            this.sec = 0;
            this.m = 0;
            this.ms = 0;
            this.fails = 0;
            this.showingCompletion = false;
            this.completionStep = 0;
            this.lastUpdateTime = 0;
        }
    }

    incFails() {
        if (this.isActive) {
            this.fails += 1;
        }
    }

    getHudMessage() {
        if (!this.isActive) {
            return "";
        }
        const [m, sec, ms] = this.formatedTime();
        if (this.pbTotalSeconds !== null) {
            const [pbM, pbSec, pbMs] = this.formatSeconds(this.pbTotalSeconds);
            return `Time: ${m}:${sec}.${ms}\rPB: ${pbM}:${pbSec}.${pbMs}`;
        }
        return `Time: ${m}:${sec}.${ms}`;
    }

    formatedTime() {
        const m = String(this.m).padStart(2, '0');
        const sec = String(Math.floor(this.sec)).padStart(2, '0');
        const ms = String(Math.floor(this.ms * 100)).padStart(2, '0');
        return [m, sec, ms];
    }
}

class SprayGameMode {
    constructor() {
        this.isActive = false;
        this.currentData = {};
        this.lastShotTime = 0;
        this.weaponData = new Map();
        this.recentResults = [];
        this.needsReset = false;
        this.isCompleting = false;
        this.completionDelayStart = 0;
        this.completionResetTime = 0;

        for (const key in Weapons) {
            const { className, name, capacity } = Weapons[key];
            this.weaponData.set(className, {
                className,
                name,
                capacity,
                total: 0,
                bestResult: { hits: 0, accuracy: "0.00%" }
            });
        }
    }

    update() {
        if (this.isActive && this.currentData.className) {
            const currentTime = Instance.GetGameTime();
            if (this.lastShotTime > 0 && !this.isCompleting && (currentTime - this.completionResetTime > 0.2) && (currentTime - this.lastShotTime) > 0.15) {
                if (!this.needsReset) {
                    this.needsReset = true;
                    this.replaceActiveWeapon();
                    this.resetActiveWeaponData();
                    this.needsReset = false;
                    this.lastShotTime = 0;
                }
            }
        }
    }

    updateCurrentSprayArea(isInArea) {
        this.isActive = isInArea;
        if (!this.isActive) {
            this.resetActiveWeaponData();
            this.needsReset = false;
            this.isCompleting = false;
            this.completionDelayStart = 0;
            this.completionResetTime = 0;
        }
    }

    resetActiveWeaponData() {
        if (this.currentData.className) {
            this.currentData = {};
        }
    }

    targetHit(weaponClass) {
        let normalizedWeaponClass = weaponClass;
        if (weaponClass && !weaponClass.startsWith("weapon_")) {
            normalizedWeaponClass = `weapon_${weaponClass}`;
        }
        if (!this.isActive || !this.currentData.className || this.currentData.className !== normalizedWeaponClass || this.isCompleting) {
            return;
        }
        this.currentData.hits += 1;
        Instance.ServerCommand(`ent_fire snd_spray_target startsound`, 0.0);
    }

    weaponFired() {
        if (!this.isActive || this.isCompleting) {
            return;
        }
        let weaponClass = PlayerPawn.activeWeaponName;
        let normalizedWeaponClass = weaponClass;
        if (weaponClass && !weaponClass.startsWith("weapon_")) {
            normalizedWeaponClass = `weapon_${weaponClass}`;
        }
        if (!this.currentData.className) {
            if (normalizedWeaponClass in Weapons) {
                const { name, capacity } = Weapons[normalizedWeaponClass];
                this.currentData = { className: normalizedWeaponClass, name, capacity, hits: 0, fired: 0 };
            } else {
                return;
            }
        }
        if (this.currentData.className !== normalizedWeaponClass) {
            return;
        }
        this.currentData.fired += 1;
        this.lastShotTime = Instance.GetGameTime();
        this.needsReset = false;
        if (this.currentData.fired >= this.currentData.capacity) {
            if (this.currentData.hits > 0) {
                const resultString = this.getLatestResultString("short");
                Instance.ServerCommand(`say_team "${resultString}"`, 0.0);
                Instance.ServerCommand(`ent_fire snd_spray_complete startsound`, 0.0);
                this.addStatisticsForWeapon({ ...this.currentData });
            }
            this.replaceActiveWeapon();
            this.resetActiveWeaponData();
            const { name, capacity } = Weapons[normalizedWeaponClass];
            this.currentData = { className: normalizedWeaponClass, name, capacity, hits: 0, fired: 0 };
            this.isCompleting = false;
            this.completionDelayStart = 0;
            this.completionResetTime = Instance.GetGameTime();
        }
    }

    replaceActiveWeapon() {
        const weaponName = this.currentData.className;
        if (weaponName in Weapons) {
            const weapon = PlayerPawn.findWeaponBySlot(0);
            if (weapon) {
                PlayerPawn.destroyWeapon(weapon);
            }
            Instance.ServerCommand(`ent_fire relay_spray_give_${weaponName.replace('weapon_', '')} trigger`, 0.0);
        }
    }

    addStatisticsForWeapon({ hits, fired, className, name, capacity }) {
        const accuracy = this.calculateAccuracy(hits, fired);
        const weaponData = this.weaponData.get(className);
        const result = { className, name, hits, capacity, accuracy };

        this.recentResults.unshift(result);
        if (this.recentResults.length > WorldText.recent.max) {
            this.recentResults.pop();
        }

        weaponData.total += 1;

        if (!weaponData.bestResult.hits || hits > weaponData.bestResult.hits) {
            weaponData.bestResult = { hits, accuracy };
            this.renderToWorldText({ type: RenderFlags.RENDER_BEST, data: result });
        }

        this.renderToWorldText({ type: RenderFlags.RENDER_TOTAL_COMPLETED, data: weaponData });
        this.renderToWorldText({ type: RenderFlags.RENDER_RECENT, data: [...this.recentResults] });
    }

    calculateAccuracy(hits, fired) {
        return hits ? `${(hits / fired * 100).toFixed(2)}%` : "0.00%";
    }

    getLatestResultString(type) {
        if (!this.currentData.className) return "No weapon selected";
        const { hits, fired, capacity, name } = this.currentData;
        const accuracy = this.calculateAccuracy(hits, fired);
        return type === "long"
            ? `Weapon: ${name} Hits: ${hits}/${capacity}\rAccuracy: ${accuracy}`
            : `${name} (${hits}/${fired}) ${accuracy}`;
    }

    getHudMessage() {
        if (!this.isActive) {
            return "";
        }
        if (!this.currentData.className) {
            return "Please equip a valid weapon";
        }
        const { className, name } = this.currentData;
        let normalizedWeaponClass = PlayerPawn.activeWeaponName;
        if (normalizedWeaponClass && !normalizedWeaponClass.startsWith("weapon_")) {
            normalizedWeaponClass = `weapon_${normalizedWeaponClass}`;
        }
        if (className === normalizedWeaponClass) {
            return this.getLatestResultString("long");
        }
        return `Please equip ${name === "FAMAS" || name === "Galil AR" ? "a" : "an"} ${name}`;
    }

    renderToWorldText({ type, data }) {
        const setMessage = (target, value) => {
            const entity = Instance.FindEntityByName(target);
            if (entity) {
                Instance.ServerCommand(`ent_fire ${target} SetMessage "${value}"`, 0.0);
            }
        };

        if (type & RenderFlags.RENDER_RECENT) {
            data.forEach((result, index) => {
                const { name, hits, capacity, accuracy } = result;
                setMessage(`${WorldText.recent.name}${index}`, name);
                setMessage(`${WorldText.recent.score}${index}`, `${hits}/${capacity}`);
                setMessage(`${WorldText.recent.accuracy}${index}`, accuracy);
            });
        } else if (type & RenderFlags.RENDER_BEST) {
            const { className, hits, capacity, accuracy } = data;
            setMessage(`${WorldText.best.score}${className}`, `${hits}/${capacity}`);
            setMessage(`${WorldText.best.accuracy}${className}`, accuracy);
        } else if (type & RenderFlags.RENDER_TOTAL_COMPLETED) {
            const { className, total } = data;
            setMessage(`${WorldText.total}${className}`, `${total}`);
        }
    }
}

class KillGameMode {
    constructor() {
        this.isActive = false;
        this.timerStarted = false;
        this.ms = 0;
        this.sec = 0;
        this.m = 0;
        this.kills = 0;
        this.targetKills = 75;
        this.shotsFired = 0;
        this.hits = 0;
        this.showingCompletion = false;
        this.completionStep = 0;
        this.finalTime = null;
        this.finalAccuracy = null;
        this.completionStartTime = 0;
        this.lastUpdateTime = 0;
        this.wasNewPb = false;
        // PB per kill target
        this.pbTimes = {};
    }

    getTotalSeconds() {
        return this.m * 60 + this.sec + this.ms;
    }

    setTargetKills(num) {
        this.targetKills = num;
    }

    start() {
        if (!this.isActive) {
            this.isActive = true;
            this.timerStarted = false;
            this.m = 0;
            this.sec = 0;
            this.ms = 0;
            this.kills = 0;
            this.shotsFired = 0;
            this.hits = 0;
            this.showingCompletion = false;
            this.completionStep = 0;
            this.lastUpdateTime = 0;
        }
    }

    stop() {
        if (this.isActive) {
            this.isActive = false;
            this.timerStarted = false;
            this.m = 0;
            this.ms = 0;
            this.sec = 0;
            this.kills = 0;
            this.shotsFired = 0;
            this.hits = 0;
            this.showingCompletion = false;
            this.completionStep = 0;
            this.lastUpdateTime = 0;
            Instance.SetThink(null);
        }
    }

    complete() {
        if (this.isActive) {
            this.isActive = false;
            this.timerStarted = false;
            const finishTotalSeconds = this.getTotalSeconds();
            this.finalTime = this.formatedTime();
            this.finalAccuracy = this.calculateAccuracy();
            this.showingCompletion = true;
            this.completionStep = 0;
            this.completionStartTime = Instance.GetGameTime();

            // Check for new PB
            this.wasNewPb = false;
            const key = this.targetKills;
            if (this.pbTimes[key] === undefined || this.pbTimes[key] === null) {
                // First completion for this kill target, set initial PB silently
                this.pbTimes[key] = finishTotalSeconds;
                saveSettings();
            } else if (finishTotalSeconds < this.pbTimes[key]) {
                this.pbTimes[key] = finishTotalSeconds;
                this.wasNewPb = true;
                saveSettings();
            }

            if (this.wasNewPb) {
                Instance.ServerCommand(`say_team "[PERSONAL BEST ${this.targetKills} KILLS]"`, 0.0);
                Instance.ServerCommand(`ent_fire snd_pb startsound`, 0.0);
            } else {
                Instance.ServerCommand(`say_team "[${this.targetKills} KILLS COMPLETE]"`, 0.0);
            }
            Instance.ServerCommand(`ent_fire relay_getkills_finish trigger`, 0.0);
            Instance.ServerCommand(`script Instance.SetThink(null)`, 0.0);
            Instance.ServerCommand(`ent_fire timer_finish showhudhint`, 1.0);
        }
    }

    update() {
        if (this.isActive && this.timerStarted) {
            const currentTime = Instance.GetGameTime();
            if (this.lastUpdateTime > 0) {
                const deltaTime = currentTime - this.lastUpdateTime;
                this.ms += deltaTime;
                while (this.ms >= 1) {
                    this.ms -= 1;
                    this.sec += 1;
                }
                while (this.sec >= 60) {
                    this.sec -= 60;
                    this.m += 1;
                }
            }
            this.lastUpdateTime = currentTime;
        }

        if (this.showingCompletion) {
            this.handleCompletionMessages();
        }
    }

    handleCompletionMessages() {
        const currentTime = Instance.GetGameTime();
        const elapsed = currentTime - this.completionStartTime;

        if (this.completionStep === 0 && elapsed >= 0.5) {
            const [m, sec, ms] = this.finalTime;
            Instance.ServerCommand(`say_team "Time: ${m}:${sec}.${ms}"`, 0.0);
            this.completionStep = 1;
        }

        if (this.completionStep === 1 && elapsed >= 1.0) {
            Instance.ServerCommand(`say_team "Accuracy: ${this.finalAccuracy}"`, 0.0);
            this.completionStep = 2;
        }

        if (this.completionStep === 2 && elapsed >= 1.5) {
            this.showingCompletion = false;
            this.completionStep = 0;
            this.stop();
        }
    }

    onGunFire(event) {
        const player = PlayerPawn.pawn;
        if (this.isActive && event.weapon.GetOwner() === player) {
            this.shotsFired += 1;
        }
    }

    onPlayerDamage(event) {
        const player = PlayerPawn.pawn;
        const controller = event.player.GetPlayerController();
        if (this.isActive && event.attacker === player && controller && controller.IsBot()) {
            this.hits += 1;
        }
    }

    onPlayerKill(event) {
        const player = PlayerPawn.pawn;
        const killedController = event.player.GetPlayerController();
        if (this.isActive && event.attacker === player && killedController && killedController.IsBot()) {
            this.kills += 1;
            if (!this.timerStarted) {
                this.timerStarted = true;
                this.lastUpdateTime = Instance.GetGameTime();
            }
            if (this.kills >= this.targetKills) {
                this.complete();
            }
        }
    }

    getHudMessage() {
        if (!this.isActive) {
            return "";
        }
        if (!this.timerStarted) {
            return "Shoot a bot to start!";
        }
        const [m, sec, ms] = this.formatedTime();
        return `Kills: ${this.kills}/${this.targetKills} \r Time: ${m}:${sec}.${ms}`;
    }

    formatedTime() {
        const m = String(this.m).padStart(2, '0');
        const sec = String(Math.floor(this.sec)).padStart(2, '0');
        const ms = String(Math.floor(this.ms * 100)).padStart(2, '0');
        return [m, sec, ms];
    }

    calculateAccuracy() {
        if (this.shotsFired === 0) return "0.00%";
        const accuracy = Math.min((this.hits / this.shotsFired * 100), 100).toFixed(2);
        return `${accuracy}%`;
    }
}

function getRandomModel() {
    const index = Math.floor(Math.random() * playerModels.length);
    return playerModels[index];
}

function applyModelToCTBot(pawn) {
    if (!isModelChangeEnabled) {
        return;
    }

    const controller = pawn.GetPlayerController();
    if (!controller || !controller.IsValid() || !controller.IsBot() || controller.GetTeamNumber() !== 3) {
        return;
    }

    const playerSlot = controller.GetPlayerSlot();
    let model = assignedModels.get(playerSlot);
    if (!model) {
        model = getRandomModel();
        assignedModels.set(playerSlot, model);
    }
    pawn.SetModel(model);
}

function applyModelsToAllCTBots() {
    for (let slot = 0; slot < 64; slot++) {
        const controller = Instance.GetPlayerController(slot);
        if (controller && controller.IsValid() && controller.IsBot() && controller.GetTeamNumber() === 3) {
            const pawn = controller.GetPlayerPawn();
            if (pawn && pawn.IsValid()) {
                applyModelToCTBot(pawn);
            }
        }
    }
}

function setAllToDefault() {
    for (let slot = 0; slot < 64; slot++) {
        const controller = Instance.GetPlayerController(slot);
        if (controller && controller.IsValid() && controller.IsBot() && controller.GetTeamNumber() === 3) {
            const pawn = controller.GetPlayerPawn();
            if (pawn && pawn.IsValid()) {
                pawn.SetModel(DEFAULT_MODEL);
            }
        }
    }
    assignedModels.clear();
}

Instance.OnActivate(() => {
    Instance.ServerCommand(`ent_fire fast_hudhint kill`, 0.0);
    kzGameMode = new KZGameMode();
    sprayGameMode = new SprayGameMode();
    killGameMode = new KillGameMode();

    Instance.OnGunFire((event) => {
        if (killGameMode) killGameMode.onGunFire(event);
    });

    Instance.OnPlayerDamage((event) => {
        if (killGameMode) killGameMode.onPlayerDamage(event);
    });

    Instance.OnPlayerKill((event) => {
        const attackerController = event.attacker?.GetPlayerController();
        const killedController = event.player?.GetPlayerController();
        if (
            attackerController &&
            attackerController.IsValid() &&
            attackerController.GetTeamNumber() === 2 &&
            killedController &&
            killedController.IsValid() &&
            killedController.GetTeamNumber() === 3
        ) {
            Instance.ServerCommand(`ent_fire death1_counter Add 1`, 0.0);
        }

        if (killGameMode) {
            killGameMode.onPlayerKill(event);
        }
    });

    applyModelsToAllCTBots();
});

Instance.OnScriptInput("kz_start", () => startTimer());
Instance.OnScriptInput("kz_stop", () => stopTimer());
Instance.OnScriptInput("kz_restart", () => restartTimer());
Instance.OnScriptInput("IncFails", () => incFails());
Instance.OnScriptInput("TargetHit", (inputData) => targetHit(inputData));
Instance.OnScriptInput("WeaponFired", () => weaponFired());
Instance.OnScriptInput("WeaponSwitched", () => weaponSwitched());
Instance.OnScriptInput("EnteredSprayArea", () => enteredSprayArea());
Instance.OnScriptInput("ExitedSprayArea", () => exitedSprayArea());
Instance.OnScriptInput("killmode_start", () => startKill());
Instance.OnScriptInput("killmode_stop", () => stopKill());
Instance.OnScriptInput("set_kills_50", () => setKills50());
Instance.OnScriptInput("set_kills_75", () => setKills75());
Instance.OnScriptInput("set_kills_100", () => setKills100());

Instance.OnScriptInput("playermodels_enabled", ({ caller, activator }) => {
    isModelChangeEnabled = true;
    assignedModels.clear();
    applyModelsToAllCTBots();
});

Instance.OnScriptInput("playermodels_disabled", () => {
    isModelChangeEnabled = false;
    setAllToDefault();
});

// Settings cycle
Instance.OnScriptInput("set_armor", () => setArmor());
Instance.OnScriptInput("set_ammo", () => setAmmo());
Instance.OnScriptInput("set_playermodels", () => setPlayermodels());
Instance.OnScriptInput("set_hs", () => setHs());
Instance.OnScriptInput("get_weapons", () => getWeapons());

Instance.OnScriptInput("welcome", ({ activator }) => {
    if (!activator || !activator.IsValid()) {
        return;
    }
    const playerController = activator.GetPlayerController();
    if (!playerController || !playerController.IsValid()) {
        return;
    }
    const playerName = playerController.GetPlayerName();
    if (!playerName) {
        return;
    }
    Instance.ServerCommand(`say_team Welcome to Fast Warmup, ${playerName}`);
	Instance.ServerCommand(`ent_create env_hudhint {"targetname" "timer_finish" "message" "COMPLETE"}`);
    loadAndApplySettings();
});

Instance.OnPlayerConnect(({ player }) => {
    if (player && player.IsValid() && player.IsBot() && player.GetTeamNumber() === 3) {
        const pawn = player.GetPlayerPawn();
        if (pawn && pawn.IsValid()) {
            applyModelToCTBot(pawn);
        }
    }
});

Instance.OnPlayerDisconnect(({ playerSlot }) => {
    assignedModels.delete(playerSlot);
});

Instance.OnPlayerReset(({ player }) => {
    if (player && player.GetTeamNumber() === 3) {
        const controller = player.GetPlayerController();
        if (controller && controller.IsBot()) {
            applyModelToCTBot(player);
        }
    }
});

// Weapon knives
Instance.OnScriptInput("knife_butterfly", () => setCustomKnife(515));
Instance.OnScriptInput("knife_karambit", () => setCustomKnife(507));
Instance.OnScriptInput("knife_m9", () => setCustomKnife(508));
Instance.OnScriptInput("knife_skeleton", () => setCustomKnife(525));
Instance.OnScriptInput("knife_nomad", () => setCustomKnife(521));
Instance.OnScriptInput("knife_bayonet", () => setCustomKnife(500));
Instance.OnScriptInput("knife_talon", () => setCustomKnife(523));
Instance.OnScriptInput("knife_classic", () => setCustomKnife(503));
Instance.OnScriptInput("knife_stiletto", () => setCustomKnife(522));
Instance.OnScriptInput("knife_flip", () => setCustomKnife(505));
Instance.OnScriptInput("knife_ursus", () => setCustomKnife(519));
Instance.OnScriptInput("knife_paracord", () => setCustomKnife(517));
Instance.OnScriptInput("knife_survival", () => setCustomKnife(518));
Instance.OnScriptInput("knife_huntsman", () => setCustomKnife(509));
Instance.OnScriptInput("knife_falchion", () => setCustomKnife(512));
Instance.OnScriptInput("knife_bowie", () => setCustomKnife(514));
Instance.OnScriptInput("knife_kukri", () => setCustomKnife(526));
Instance.OnScriptInput("knife_daggers", () => setCustomKnife(516));
Instance.OnScriptInput("knife_gut", () => setCustomKnife(506));
Instance.OnScriptInput("knife_navaja", () => setCustomKnife(520));

// Weapon primary
Instance.OnScriptInput("set_weapon_ak47", () => setWeapon("ak47"));
Instance.OnScriptInput("set_weapon_m4a1", () => setWeapon("m4a1"));
Instance.OnScriptInput("set_weapon_m4a4", () => setWeapon("m4a4"));
Instance.OnScriptInput("set_weapon_nova", () => setWeapon("nova"));
Instance.OnScriptInput("set_weapon_aug", () => setWeapon("aug"));
Instance.OnScriptInput("set_weapon_m249", () => setWeapon("m249"));
Instance.OnScriptInput("set_weapon_p90", () => setWeapon("p90"));
Instance.OnScriptInput("set_weapon_awp", () => setWeapon("awp"));
Instance.OnScriptInput("set_weapon_mac10", () => setWeapon("mac10"));
Instance.OnScriptInput("set_weapon_sawedoff", () => setWeapon("sawedoff"));
Instance.OnScriptInput("set_weapon_bizon", () => setWeapon("bizon"));
Instance.OnScriptInput("set_weapon_mag7", () => setWeapon("mag7"));
Instance.OnScriptInput("set_weapon_ctauto", () => setWeapon("ctauto"));
Instance.OnScriptInput("set_weapon_famas", () => setWeapon("famas"));
Instance.OnScriptInput("set_weapon_mp5", () => setWeapon("mp5"));
Instance.OnScriptInput("set_weapon_krieg", () => setWeapon("krieg"));
Instance.OnScriptInput("set_weapon_tauto", () => setWeapon("tauto"));
Instance.OnScriptInput("set_weapon_mp7", () => setWeapon("mp7"));
Instance.OnScriptInput("set_weapon_scout", () => setWeapon("scout"));
Instance.OnScriptInput("set_weapon_galil", () => setWeapon("galil"));
Instance.OnScriptInput("set_weapon_mp9", () => setWeapon("mp9"));
Instance.OnScriptInput("set_weapon_ump", () => setWeapon("ump"));
Instance.OnScriptInput("set_weapon_negev", () => setWeapon("negev"));
Instance.OnScriptInput("set_weapon_xm", () => setWeapon("xm"));

// Weapon secondary
Instance.OnScriptInput("set_weapon_cz", () => setWeapon("cz"));
Instance.OnScriptInput("set_weapon_deagle", () => setWeapon("deagle"));
Instance.OnScriptInput("set_weapon_duals", () => setWeapon("duals"));
Instance.OnScriptInput("set_weapon_fiveseven", () => setWeapon("fiveseven"));
Instance.OnScriptInput("set_weapon_glock", () => setWeapon("glock"));
Instance.OnScriptInput("set_weapon_p250", () => setWeapon("p250"));
Instance.OnScriptInput("set_weapon_usp", () => setWeapon("usp"));
Instance.OnScriptInput("set_weapon_p2000", () => setWeapon("p2000"));
Instance.OnScriptInput("set_weapon_r8", () => setWeapon("r8"));
Instance.OnScriptInput("set_weapon_tec9", () => setWeapon("tec9"));