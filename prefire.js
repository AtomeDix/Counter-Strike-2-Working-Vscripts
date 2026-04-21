import { Instance } from "cs_script/point_script";

function randInt(min, max) {
    return min + Math.floor((max - min + 1) * Math.random());
}

let p;

const GameplaySounds = {
    mode_complete: "fx_mode_complete",
    mode_reset: "fx_mode_reset",
    kill_default: "fx_kill_default",
    noclip: "fx_noclip",
    prefire_start: "fx_prefire_start",
    prefire_clear_stage: "fx_prefire_clear_stage",
    prefire_countdown: "fx_prefire_countdown"
};

class SoundManager {
    static isMuted = false;
    
    static toggleMute() {
        this.isMuted = !this.isMuted;
    }
    
    static playSound(soundEntity) {
        if (this.isMuted) return;
        Instance.ServerCommand(`ent_fire ${soundEntity} StartSound`, 0.0);
    }
    
    static playGameplaySound(soundName) {
        if (GameplaySounds[soundName]) {
            this.playSound(GameplaySounds[soundName]);
        }
    }
}

// Playermodels
const playerModels = [
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
	"characters/models/tm_phoenix/tm_phoenix.vmdl",
	"characters/models/tm_phoenix/tm_phoenix.vmdl",
	"characters/models/tm_phoenix/tm_phoenix.vmdl",
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
	"characters/models/tm_phoenix/tm_phoenix.vmdl",
	"characters/models/tm_phoenix/tm_phoenix.vmdl",
	"characters/models/tm_phoenix/tm_phoenix.vmdl"
];

const DEFAULT_MODEL = "characters/models/ctm_sas/ctm_sas.vmdl";

let isModelChangeEnabled = false;
const assignedModels = new Map();

function getRandomModel() {
    const index = Math.floor(Math.random() * playerModels.length);
    return playerModels[index];
}

function applyModelToCTBot(pawn) {
    if (!isModelChangeEnabled) return;

    const controller = pawn.GetPlayerController();
    if (!controller?.IsValid() || !controller.IsBot() || controller.GetTeamNumber() !== 3) {
        return;
    }

    const slot = controller.GetPlayerSlot();
    let model = assignedModels.get(slot);

    if (!model) {
        model = getRandomModel();
        assignedModels.set(slot, model);
    }

    pawn.SetModel(model);
}

function applyModelsToAllCTBots() {
    for (let slot = 0; slot < 64; ++slot) {
        const ctrl = Instance.GetPlayerController(slot);
        if (ctrl?.IsValid() && ctrl.IsBot() && ctrl.GetTeamNumber() === 3) {
            const pawn = ctrl.GetPlayerPawn();
            if (pawn?.IsValid()) applyModelToCTBot(pawn);
        }
    }
}

function setAllToDefault() {
    for (let slot = 0; slot < 64; ++slot) {
        const ctrl = Instance.GetPlayerController(slot);
        if (ctrl?.IsValid() && ctrl.IsBot() && ctrl.GetTeamNumber() === 3) {
            const pawn = ctrl.GetPlayerPawn();
            if (pawn?.IsValid()) pawn.SetModel(DEFAULT_MODEL);
        }
    }
    assignedModels.clear();
}

class Timer {
    constructor() {
        this.setupDone = false;
        this.initialSetupComplete = false;
        this.isActive = false;
        this.tickCount = 0;
        this.TICK_INTERVAL = 0.015625;
        this.HUD_INTERVAL_TICKS = 4;
        this.hudTick = 0;
        this.noclipDetected = false;
        this.agentsEnabled = false;
        
        this.queuedWeapon = null;
        this.queuedKnifeId = null;
        
        this.pendingTeleportStage = 0;
        this.pendingTeleportTime = 0;
        
        this.selectedPrimary = "weapon_ak47";
        this.selectedSecondary = "weapon_deagle";
        this.selectedKnifeName = "weapon_knife";
        this.selectedKnifeId = undefined;
        
        this.validWeapons = {
            primary: [
                "weapon_ak47", "weapon_m4a1_silencer", "weapon_m4a1", "weapon_awp",
                "weapon_famas", "weapon_galilar", "weapon_sg556", "weapon_aug",
                "weapon_ssg08", "weapon_mp9", "weapon_mac10", "weapon_mp7",
                "weapon_mp5sd", "weapon_ump45", "weapon_p90", "weapon_bizon",
                "weapon_mag7", "weapon_xm1014", "weapon_nova", "weapon_sawedoff",
                "weapon_negev", "weapon_m249", "weapon_scar20", "weapon_g3sg1"
            ],
            secondary: [
                "weapon_usp_silencer", "weapon_deagle", "weapon_glock",
                "weapon_tec9", "weapon_fiveseven", "weapon_elite",
                "weapon_p250", "weapon_cz75a", "weapon_revolver",
                "weapon_hkp2000"
            ],
            knife: ["weapon_knife"]
        };
        
        // Knife IDs
        this.knifeIds = {
            butterfly: 515,
            karambit: 507,
            m9: 508,
            skeleton: 525,
            nomad: 521,
            bayonet: 500,
            talon: 523,
            classic: 503,
            stiletto: 522,
            flip: 505,
            ursus: 519,
            paracord: 517,
            survival: 518,
            huntsman: 509,
            falchion: 512,
            bowie: 514,
            kukri: 526,
            daggers: 516,
            gut: 506,
            navaja: 520
        };
        
        this.prefireState = "idle";
        this.prefireStage = 1;
        this.prefireKills = 0;
        this.prefireKillsAtDeath = 0;
        this.prefireDeaths = 0;
        this.prefireStartTime = 0;
        this.prefireTotalShots = 0;
        this.prefireTotalHits = 0;
        this.prefireCommenced = false;
        this.prefireRetrying = false;
        this.prefireStageStartTime = 0;
        this.prefireStageShots = 0;
        this.prefireStageHits = 0;
        this.prefireStageDeaths = 0;
        this.prefireStageElapsedTime = 0;
        this.prefireAdvancedStage = false;
        this.prefireFinalStatsTime = 0;
        this.prefireFinalStatsMessage = "";
        this.prefireNoclipDetected = false;
        this.safeMode = false;
        this.wallhackEnabled = false;
        this.particleActive = false;
        this.chatCommandsEnabled = true;
        this.singleStageMode = false;
        this.singleStage = 0;
        this.pendingSingleStageTime = 0;
        this.pendingSingleStageReset = false;
        
        this.prefireStageNames = ["A-site", "B-site", "Mid", "A Retake", "B Retake"];
        this.prefireBotsPerStage = 12;
        
        // Map-specific stage name overrides
        this.mapStageNames = {
            "de_nuke": ["A-site", "Ramp", "Outside", "A Retake", "B Retake"],
			"de_train": ["A-site", "B-site", "Ivy", "A Retake", "B Retake"]
        };
        
        // Delayed command queue
        this.delayedCommands = [];
    }
    
    queueCommand(command, delay) {
        this.delayedCommands.push({
            command: command,
            executeTime: Instance.GetGameTime() + delay
        });
    }

    // Weapon system
    setWeapon(weaponName) {
        this.queuedWeapon = weaponName;
        Instance.ServerCommand(`ent_fire relay_giveweapon Trigger`, 0.0);
    }
    
    prefire_giveweapon() {
        const controller = Instance.GetPlayerController(0);
        if (!controller || !controller.IsValid()) return;
        const pawn = controller.GetPlayerPawn();
        if (!pawn || !pawn.IsValid()) return;
        
        if (this.queuedKnifeId !== null) {
            if (this.queuedKnifeId === -1) {
                this.selectedKnifeId = undefined;
                this.selectedKnifeName = "weapon_knife";
            } else {
                this.selectedKnifeId = this.queuedKnifeId;
            }
            const knifeWeapon = pawn.FindWeaponBySlot(2);
            if (knifeWeapon) pawn.DestroyWeapon(knifeWeapon);
            this.giveSelectedKnife(pawn);
            Instance.ClientCommand(0, "slot3");
            this.queuedKnifeId = null;
            return;
        }
        
        if (!this.queuedWeapon) return;
        
        const weaponName = this.queuedWeapon;
        this.queuedWeapon = null;

        if (this.validWeapons.primary.includes(weaponName)) {
            this.selectedPrimary = weaponName;
            const primaryWeapon = pawn.FindWeaponBySlot(0);
            if (primaryWeapon) pawn.DestroyWeapon(primaryWeapon);
            pawn.GiveNamedItem(this.selectedPrimary, true);
            Instance.ClientCommand(0, "slot1");
        } else if (this.validWeapons.secondary.includes(weaponName)) {
            this.selectedSecondary = weaponName;
            const secondaryWeapon = pawn.FindWeaponBySlot(1);
            if (secondaryWeapon) pawn.DestroyWeapon(secondaryWeapon);
            pawn.GiveNamedItem(this.selectedSecondary, false);
            Instance.ClientCommand(0, "slot2");
        } else if (this.validWeapons.knife.includes(weaponName)) {
            this.selectedKnifeName = weaponName;
            this.selectedKnifeId = undefined;
            const knifeWeapon = pawn.FindWeaponBySlot(2);
            if (knifeWeapon) pawn.DestroyWeapon(knifeWeapon);
            this.giveSelectedKnife(pawn);
            Instance.ClientCommand(0, "slot3");
        }
    }

    setCustomKnife(id) {
        this.queuedKnifeId = id;
        Instance.ServerCommand(`ent_fire relay_giveweapon Trigger`, 0.0);
    }
    
    updateStageExtras(activeStage) {
        for (let i = 1; i <= 5; i++) {
            if (i === activeStage) {
                Instance.ServerCommand(`ent_fire extra_stage_${i} Enable`, 0.0);
            } else {
                Instance.ServerCommand(`ent_fire extra_stage_${i} Disable`, 0.0);
            }
        }
    }

    giveSelectedKnife(pawn) {
        pawn.GiveNamedItem("weapon_knife", false);
        const knife = pawn.FindWeaponBySlot(2);
        if (knife && this.selectedKnifeId !== undefined) {
            Instance.EntFireAtTarget({ target: knife, input: "ChangeSubclass", value: this.selectedKnifeId });
        }
        Instance.ServerCommand("regenerate_weapon_skins", 0.0);
    }

    giveWeapons(pawn) {
        pawn.DestroyWeapons();
        pawn.GiveNamedItem(this.selectedPrimary, true);
        pawn.GiveNamedItem(this.selectedSecondary, false);
        
        const knifeWeapon = pawn.FindWeaponBySlot(2);
        if (knifeWeapon) pawn.DestroyWeapon(knifeWeapon);
        this.giveSelectedKnife(pawn);
        
        pawn.SetArmor(100);
        pawn.GiveNamedItem("item_assaultsuit", false);
    }

    getSaveObject() {
        let data = {};
        const raw = Instance.GetSaveData();
        if (raw && raw.length > 0) {
            try { data = JSON.parse(raw); } catch (e) { data = {}; }
        }
        return data;
    }

    savePrefireSetting(key, value) {
        const data = this.getSaveObject();
        data[key] = value;
        Instance.SetSaveData(JSON.stringify(data));
    }

    loadSavedSettings() {
        const data = this.getSaveObject();

        // Load weapons - prefire-specific first, then main map, then defaults
        if (data.prefireWeapon_primary) {
            this.selectedPrimary = data.prefireWeapon_primary;
        } else if (data.savedPrimary) {
            this.selectedPrimary = data.savedPrimary.replace("set_", "");
        } else {
            this.selectedPrimary = "weapon_ak47";
        }

        if (data.prefireWeapon_secondary) {
            this.selectedSecondary = data.prefireWeapon_secondary;
        } else if (data.savedSecondary) {
            this.selectedSecondary = data.savedSecondary.replace("set_", "");
        } else {
            this.selectedSecondary = "weapon_deagle";
        }

        // Load knife - prefire-specific first, then main map
        if (data.prefireKnife) {
            this.selectedKnifeId = data.prefireKnife.id;
            this.selectedKnifeName = data.prefireKnife.name || "weapon_knife";
        } else if (data.savedKnife) {
            this.selectedKnifeId = data.savedKnife.id;
            this.selectedKnifeName = data.savedKnife.name || "weapon_knife";
        }

        // Load wallhack
        if (data.prefireWallhack !== undefined) {
            this.wallhackEnabled = data.prefireWallhack;
            if (this.wallhackEnabled) {
                Instance.ServerCommand(`ent_fire particle_wh_* Start`, 0.0);
            }
        }

        // Load safe mode
        if (data.prefireSafeMode !== undefined) {
            this.safeMode = data.prefireSafeMode;
            if (this.safeMode) {
                Instance.ServerCommand(`bot_dont_shoot 1`, 0.0);
            }
        }

        // Load armor setting
        if (data.armorStage !== undefined) {
            if (data.armorStage === 1) Instance.ServerCommand("mp_free_armor 1");
            else if (data.armorStage === 2) Instance.ServerCommand("mp_free_armor 2");
            else if (data.armorStage === 3) Instance.ServerCommand("mp_free_armor 0");
        }

        // Load ammo setting
        if (data.ammoStage !== undefined) {
            Instance.ServerCommand(data.ammoStage === 1 ? "sv_infinite_ammo 1" : "sv_infinite_ammo 0");
        }

        // Load headshot setting
        if (data.headshotStage !== undefined) {
            Instance.ServerCommand(data.headshotStage === 1 ? "mp_damage_headshot_only 0" : "mp_damage_headshot_only 1");
        }

        // Load agents setting
        if (data.agentsStage !== undefined) {
            this.agentsEnabled = data.agentsStage === 1;
            isModelChangeEnabled = this.agentsEnabled;
            if (this.agentsEnabled) {
                assignedModels.clear();
                applyModelsToAllCTBots();
            }
        }
    }

    toggleAgents() {
        this.agentsEnabled = !this.agentsEnabled;
        this.savePrefireSetting("agentsStage", this.agentsEnabled ? 1 : 2);
        
        if (this.agentsEnabled) {
            isModelChangeEnabled = true;
            assignedModels.clear();
            applyModelsToAllCTBots();
        } else {
            isModelChangeEnabled = false;
            setAllToDefault();
        }
    }

    toggleWallhack() {
        this.wallhackEnabled = !this.wallhackEnabled;
        if (this.wallhackEnabled) {
            Instance.ServerCommand(`ent_fire particle_wh_* Start`, 0.0);
        } else {
            Instance.ServerCommand(`ent_fire particle_wh_* Stop`, 0.0);
        }
    }

    handleChatCommand(text, player) {
        if (!this.chatCommandsEnabled) return;
        if (!text.startsWith("!")) return;
        
        const command = text.toLowerCase().substring(1).trim();
        
        // Weapon commands
        const weaponMap = {
            // Primary
            "ak47": "weapon_ak47",
            "ak": "weapon_ak47",
            "m4a1": "weapon_m4a1_silencer",
            "m4a1s": "weapon_m4a1_silencer",
            "m4a4": "weapon_m4a1",
            "awp": "weapon_awp",
            "famas": "weapon_famas",
            "galil": "weapon_galilar",
            "sg553": "weapon_sg556",
            "sg": "weapon_sg556",
            "aug": "weapon_aug",
            "scout": "weapon_ssg08",
            "ssg08": "weapon_ssg08",
            "mp9": "weapon_mp9",
            "mac10": "weapon_mac10",
            "mp7": "weapon_mp7",
            "mp5": "weapon_mp5sd",
            "ump": "weapon_ump45",
            "p90": "weapon_p90",
            "bizon": "weapon_bizon",
            "mag7": "weapon_mag7",
            "xm1014": "weapon_xm1014",
            "nova": "weapon_nova",
            "sawedoff": "weapon_sawedoff",
            "negev": "weapon_negev",
            "m249": "weapon_m249",
            "scar": "weapon_scar20",
            "g3sg1": "weapon_g3sg1",
            // Secondary
            "usp": "weapon_usp_silencer",
            "usps": "weapon_usp_silencer",
            "deagle": "weapon_deagle",
            "glock": "weapon_glock",
            "tec9": "weapon_tec9",
            "fiveseven": "weapon_fiveseven",
            "57": "weapon_fiveseven",
            "duals": "weapon_elite",
            "dualies": "weapon_elite",
            "elite": "weapon_elite",
            "p250": "weapon_p250",
            "cz75": "weapon_cz75a",
            "cz": "weapon_cz75a",
            "revolver": "weapon_revolver",
            "r8": "weapon_revolver",
            "p2000": "weapon_hkp2000"
        };
        
        // Knife commands
        const knifeMap = {
            "butterfly": 515,
            "bfk": 515,
            "karambit": 507,
            "kara": 507,
            "m9": 508,
            "m9bayonet": 508,
            "skeleton": 525,
            "nomad": 521,
            "bayonet": 500,
            "bayo": 500,
            "talon": 523,
            "classic": 503,
            "stiletto": 522,
            "flip": 505,
            "ursus": 519,
            "paracord": 517,
            "survival": 518,
            "huntsman": 509,
            "falchion": 512,
            "bowie": 514,
            "kukri": 526,
            "daggers": 516,
            "shadow": 516,
            "gut": 506,
            "navaja": 520,
            "default": "default"
        };
        
        if (weaponMap[command]) {
            SoundManager.playSound("fx_mode_reset");
            this.setWeapon(weaponMap[command]);
            if (this.validWeapons.primary.includes(weaponMap[command])) {
                this.savePrefireSetting("prefireWeapon_primary", weaponMap[command]);
            } else if (this.validWeapons.secondary.includes(weaponMap[command])) {
                this.savePrefireSetting("prefireWeapon_secondary", weaponMap[command]);
            }
            this.queueCommand(`say_team Weapon: ${command}`, 0.3);
            return;
        }
        
        if (knifeMap[command]) {
            SoundManager.playSound("fx_mode_reset");
            if (knifeMap[command] === "default") {
                this.queuedKnifeId = -1;
                Instance.ServerCommand(`ent_fire relay_giveweapon Trigger`, 0.0);
                this.savePrefireSetting("prefireKnife", null);
                this.queueCommand(`say_team Knife: default`, 0.3);
            } else {
                this.setCustomKnife(knifeMap[command]);
                this.savePrefireSetting("prefireKnife", { id: knifeMap[command], name: command });
                this.queueCommand(`say_team Knife: ${command}`, 0.3);
            }
            return;
        }
        
        if (command === "help" || command === "weapons" || command === "guns") {
            SoundManager.playSound("fx_mode_reset");
            Instance.ServerCommand(`ent_fire relay_weapons_help Trigger`, 0.0);
            return;
        }
        
        if (command === "rifles" || command === "rifle") {
            SoundManager.playSound("fx_mode_reset");
            Instance.ServerCommand(`ent_fire relay_weapons_rifles Trigger`, 0.0);
            return;
        }
        
        if (command === "pistols" || command === "pistol") {
            SoundManager.playSound("fx_mode_reset");
            Instance.ServerCommand(`ent_fire relay_weapons_pistols Trigger`, 0.0);
            return;
        }
        
        if (command === "knives" || command === "knife") {
            SoundManager.playSound("fx_mode_reset");
            Instance.ServerCommand(`ent_fire relay_weapons_knives Trigger`, 0.0);
            return;
        }
        
        if (command === "stage") {
            SoundManager.playSound("fx_mode_reset");
            Instance.ServerCommand(`ent_fire relay_weapons_stage Trigger`, 0.0);
            return;
        }
        
        if (command === "agents" || command === "agent") {
            SoundManager.playSound("fx_mode_reset");
            this.toggleAgents();
            this.queueCommand(`say_team Agents: ${this.agentsEnabled ? "enabled" : "disabled"}`, 0.3);
            return;
        }
        
        if (command === "safe") {
            SoundManager.playSound("fx_mode_reset");
            this.safeMode = !this.safeMode;
            if (this.safeMode) {
                Instance.ServerCommand(`bot_dont_shoot 1`, 0.0);
            } else {
                Instance.ServerCommand(`bot_dont_shoot 0`, 0.0);
            }
            this.savePrefireSetting("prefireSafeMode", this.safeMode);
            this.queueCommand(`say_team Safe bots: ${this.safeMode ? "enabled" : "disabled"}`, 0.3);
            return;
        }
        
        if (command === "wh") {
            SoundManager.playSound("fx_mode_reset");
            this.toggleWallhack();
            this.savePrefireSetting("prefireWallhack", this.wallhackEnabled);
            this.queueCommand(`say_team Wallhack: ${this.wallhackEnabled ? "enabled" : "disabled"}`, 0.3);
            return;
        }
        
        if (command === "restart" || command === "r") {
            this.singleStageMode = false;
            this.singleStage = 0;
            Instance.ServerCommand(`ent_fire relay_restart Trigger`, 0.0);
            this.queueCommand(`say_team Restarting...`, 0.3);
            return;
        }
        
        if (command === "stage1" || command === "stage2" || command === "stage3" || command === "stage4" || command === "stage5") {
            SoundManager.playSound("fx_mode_reset");
            const stageNum = parseInt(command.charAt(5));
            this.singleStageMode = true;
            this.singleStage = stageNum;
            this.startSingleStage(stageNum);
            const stageName = this.prefireStageNames[stageNum - 1] || `Stage ${stageNum}`;
            this.queueCommand(`say_team Stage: ${stageName}`, 0.3);
            return;
        }
    }

    UpdateTime() {
        const controller = Instance.GetPlayerController(0);
        if (!controller || !controller.IsValid()) {
            Instance.SetNextThink(Instance.GetGameTime() + this.TICK_INTERVAL, "UpdateTime");
            return;
        }
        const pawn = controller.GetPlayerPawn();
        if (!pawn || !pawn.IsValid()) {
            Instance.SetNextThink(Instance.GetGameTime() + this.TICK_INTERVAL, "UpdateTime");
            return;
        }

        // Noclip detection
        if (pawn.IsNoclipping()) {
            if (!this.prefireNoclipDetected && this.prefireState === "active") {
                this.prefireNoclipDetected = true;
                Instance.ServerCommand(`say_team Noclip detected, timer stopped!`, 0.0);
                SoundManager.playGameplaySound("noclip");
            }
        }
        
        // Process delayed commands
        const currentTime = Instance.GetGameTime();
        for (let i = this.delayedCommands.length - 1; i >= 0; i--) {
            if (currentTime >= this.delayedCommands[i].executeTime) {
                Instance.ServerCommand(this.delayedCommands[i].command, 0.0);
                this.delayedCommands.splice(i, 1);
            }
        }

        if (this.isActive && this.prefireState === "active") {
            if (!this.prefireNoclipDetected) {
                this.tickCount++;
            }
            
            this.hudTick++;
            if (this.hudTick >= this.HUD_INTERVAL_TICKS) {
                this.prefire_UpdateHUD();
                this.hudTick = 0;
            }
        } else if (this.prefireState === "init" && this.prefireCommenced) {
            this.hudTick++;
            if (this.hudTick >= this.HUD_INTERVAL_TICKS) {
                this.prefire_UpdateHUD();
                this.hudTick = 0;
            }
        }
        
        if (this.prefireState === "waiting_for_final_stats") {
            const currentTime = Instance.GetGameTime();
            if (currentTime >= this.prefireFinalStatsTime) {
                Instance.ServerCommand(this.prefireFinalStatsMessage, 0.0);
                
                this.prefireStage = 1;
                this.updateStageExtras(1);
                this.prefireKills = 0;
                this.prefireKillsAtDeath = 0;
                this.prefireDeaths = 0;
                this.prefireStartTime = 0;
                this.prefireTotalShots = 0;
                this.prefireTotalHits = 0;
                this.prefireStageStartTime = 0;
                this.prefireStageShots = 0;
                this.prefireStageHits = 0;
                this.prefireStageDeaths = 0;
                this.prefireStageElapsedTime = 0;
                this.prefireNoclipDetected = false;
                this.tickCount = 0;
                this.pendingTeleportStage = 0;
                this.prefireCommenced = true;
                this.prefireRetrying = true;
                this.prefireState = "init";
                
                Instance.ServerCommand(`ent_fire trigger_prefire_1 Enable`, 0.0);
                
                if (pawn?.IsValid()) {
                    const teleportPoint = Instance.FindEntityByName("teleport_player_1");
                    if (teleportPoint && teleportPoint.IsValid()) {
                        pawn.Teleport({
                            position: teleportPoint.GetAbsOrigin(),
                            angles: teleportPoint.GetAbsAngles(),
                            velocity: { x: 0, y: 0, z: 0 }
                        });
                    }
                }
                
                this.prefire_TeleportBotsToSpawn();
            }
        }
        
        if (this.pendingSingleStageTime > 0 && Instance.GetGameTime() >= this.pendingSingleStageTime) {
            this.prefireState = "init";
            this.pendingSingleStageTime = 0;
        }
        
        if (this.pendingTeleportStage > 0 && Instance.GetGameTime() >= this.pendingTeleportTime) {
            const teleportPoint = Instance.FindEntityByName(`teleport_player_${this.pendingTeleportStage}`);
            if (teleportPoint && teleportPoint.IsValid() && pawn && pawn.IsValid()) {
                pawn.Teleport({
                    position: teleportPoint.GetAbsOrigin(),
                    angles: teleportPoint.GetAbsAngles(),
                    velocity: { x: 0, y: 0, z: 0 }
                });
            }
            
            if (this.pendingSingleStageReset) {
                this.pendingSingleStageReset = false;
                this.prefireKillsAtDeath = 0;
                this.prefireDeaths = 0;
                this.prefireStartTime = 0;
                this.prefireTotalShots = 0;
                this.prefireTotalHits = 0;
                this.prefireStageStartTime = 0;
                this.prefireStageShots = 0;
                this.prefireStageHits = 0;
                this.prefireStageDeaths = 0;
                this.prefireStageElapsedTime = 0;
                this.prefireNoclipDetected = false;
                this.tickCount = 0;
                this.prefireCommenced = true;
                this.prefireRetrying = true;
                this.prefireState = "init";
                
                this.prefire_TeleportBotsToSpawn();
            }
            
            this.updateStageExtras(this.pendingTeleportStage);
            this.pendingTeleportStage = 0;
        }

        Instance.SetNextThink(Instance.GetGameTime() + this.TICK_INTERVAL, "UpdateTime");
    }

    FormatedTime() {
        const seconds = this.tickCount * this.TICK_INTERVAL;
        const totalMinutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        const ms = Math.floor((seconds % 1) * 100).toString().padStart(2, '0');
        return [totalMinutes.toString().padStart(2, '0'), remainingSeconds.toString().padStart(2, '0'), ms];
    }

    cleanupEntities() {
        Instance.ServerCommand(`ent_fire timer_hudhint kill`, 0.0);
    }

    setup() {
        const controller = Instance.GetPlayerController(0);
        let playerName = "Player";
        
        if (controller && controller.IsValid()) {
            playerName = controller.GetPlayerName();
        }
        
        this.mapName = Instance.GetMapName();
        
        // Apply map-specific stage names if available
        if (this.mapStageNames[this.mapName]) {
            this.prefireStageNames = this.mapStageNames[this.mapName];
        }
        
        Instance.ServerCommand(`say_team Welcome ${playerName}, to prefire ${this.mapName}!`, 0.0);
        
        // Load saved weapons and settings from main map
        this.loadSavedSettings();

        // Give saved weapons to player
        if (controller && controller.IsValid()) {
            const pawn = controller.GetPlayerPawn();
            if (pawn && pawn.IsValid()) {
                this.giveWeapons(pawn);
            }
        }
        
        // Create hudhints with map-specific stage names
        Instance.ServerCommand(`ent_create env_hudhint {"targetname" "timer_finish" "message" "COMPLETE"}`);
        Instance.ServerCommand(`ent_create env_hudhint {"targetname" "prefire_died" "message" "DIED"}`);
        Instance.ServerCommand(`ent_create env_hudhint {"targetname" "prefire_reset" "message" "RESET"}`);
        Instance.ServerCommand(`ent_create env_hudhint {"targetname" "prefire_stage_1_complete" "message" "${this.prefireStageNames[0].toUpperCase()} COMPLETE"}`);
        Instance.ServerCommand(`ent_create env_hudhint {"targetname" "prefire_stage_2_complete" "message" "${this.prefireStageNames[1].toUpperCase()} COMPLETE"}`);
        Instance.ServerCommand(`ent_create env_hudhint {"targetname" "prefire_stage_3_complete" "message" "${this.prefireStageNames[2].toUpperCase()} COMPLETE"}`);
        Instance.ServerCommand(`ent_create env_hudhint {"targetname" "prefire_stage_4_complete" "message" "${this.prefireStageNames[3].toUpperCase()} COMPLETE"}`);
        Instance.ServerCommand(`ent_create env_hudhint {"targetname" "prefire_stage_5_complete" "message" "${this.prefireStageNames[4].toUpperCase()} COMPLETE"}`);
        
        this.prefire_Init();
    }

    // Prefire Mode
    prefire_Init() {
        if (this.particleActive) {
            Instance.ServerCommand(`ent_fire particle_stage_* Stop`, 0.0);
            this.particleActive = false;
        }
        
        this.prefireState = "init";
        this.isActive = false;
        this.prefireCommenced = false;
        this.prefireRetrying = false;
        
        this.prefireStage = 1;
        this.updateStageExtras(1);
        this.prefireKills = 0;
        this.prefireKillsAtDeath = 0;
        this.prefireDeaths = 0;
        this.prefireStartTime = 0;
        this.prefireTotalShots = 0;
        this.prefireTotalHits = 0;
        this.prefireStageStartTime = 0;
        this.prefireStageShots = 0;
        this.prefireStageHits = 0;
        this.prefireStageDeaths = 0;
        this.prefireNoclipDetected = false;
        this.tickCount = 0;
        this.pendingTeleportStage = 0;
        
        Instance.ServerCommand(`bot_quota 12`, 0.0);
        Instance.ServerCommand(`custom_bot_difficulty 4`, 0.0);
        
        Instance.ServerCommand(`bot_dont_shoot 1`, 0.0);
        
        Instance.ServerCommand(`ent_fire trigger_prefire_1 Enable`, 0.0);
    }
    
    prefire_Start() {
        if (this.prefireState !== "init" && this.prefireState !== "stage_complete" && this.prefireState !== "died") return;
        
        // Always heal and teleport bots
        for (let i = 0; i < 64; i++) {
            const ctrl = Instance.GetPlayerController(i);
            if (ctrl && ctrl.IsValid() && ctrl.IsBot() && ctrl.GetTeamNumber() === 3) {
                const botPawn = ctrl.GetPlayerPawn();
                if (botPawn && botPawn.IsValid()) {
                    botPawn.SetHealth(100);
                }
            }
        }
        this.prefire_TeleportBots();
        
        if (!this.prefireCommenced) {
            // Heal player and refill ammo
            const controller = Instance.GetPlayerController(0);
            if (controller?.IsValid()) {
                const pawn = controller.GetPlayerPawn();
                if (pawn?.IsValid()) {
                    pawn.SetHealth(100);
                    pawn.SetArmor(100);
                    pawn.GiveNamedItem("item_assaultsuit", false);
                }
            }
        }

        // Reset stage stats when advancing to a new stage (not when retrying same stage after death)
        if (this.prefireAdvancedStage || this.prefireStage === 1) {
            this.prefireStageDeaths = 0;
            this.prefireStageElapsedTime = 0;
        }
        this.prefireAdvancedStage = false;
        
        this.prefireState = "active";
        this.isActive = true;
        this.prefireKills = 0;
        
        Instance.ServerCommand(`ent_fire particle_stage_${this.prefireStage} StopPlayEndCap`, 0.0);
        this.particleActive = false;
        
        if (!this.safeMode) {
            Instance.ServerCommand(`bot_dont_shoot 0`, 0.0);
        }
        
        this.prefireKillsAtDeath = 0;
        this.prefireCommenced = false;
        this.prefireRetrying = false;
        
        this.prefireStageStartTime = Instance.GetGameTime();
        this.prefireStageShots = 0;
        this.prefireStageHits = 0;
        
        SoundManager.playGameplaySound("prefire_start");
        
        if (this.prefireStage === 1) {
            this.prefireStartTime = Instance.GetGameTime();
            this.prefireTotalShots = 0;
            this.prefireTotalHits = 0;
            this.prefireDeaths = 0;
            this.tickCount = 0;
        }
    }
    
    prefire_TeleportBots() {
        let botIndex = 0;
        for (let i = 0; i < 64; i++) {
            const ctrl = Instance.GetPlayerController(i);
            if (ctrl && ctrl.IsValid() && ctrl.IsBot() && ctrl.GetTeamNumber() === 3) {
                const botPawn = ctrl.GetPlayerPawn();
                if (botPawn && botPawn.IsValid()) {
                    botIndex++;
                    if (botIndex <= this.prefireBotsPerStage) {
                        const teleportName = `teleport_stage_${this.prefireStage}_${botIndex}`;
                        const teleportPoint = Instance.FindEntityByName(teleportName);
                        if (teleportPoint && teleportPoint.IsValid()) {
                            botPawn.Teleport({
                                position: teleportPoint.GetAbsOrigin(),
                                angles: teleportPoint.GetAbsAngles(),
                                velocity: { x: 0, y: 0, z: 0 }
                            });
                        }
                    }
                }
            }
        }
    }
    
    prefire_OnKill() {
        if (this.prefireState !== "active") return;
        
        this.prefireKills++;
        
        SoundManager.playGameplaySound("kill_default");
        
        const controller = Instance.GetPlayerController(0);
        if (controller?.IsValid()) {
            const pawn = controller.GetPlayerPawn();
            if (pawn?.IsValid()) {
                pawn.SetHealth(100);
                pawn.SetArmor(100);
                pawn.GiveNamedItem("item_assaultsuit", false);
            }
        }
        
        if (this.prefireKills >= this.prefireBotsPerStage) {
            this.prefire_StageComplete();
        }
    }
    
    stats_OnShotFired() {
        if (this.prefireState === "active") {
            this.prefireTotalShots++;
            this.prefireStageShots++;
        }
    }
    
    stats_OnShotHit() {
        if (this.prefireState === "active") {
            this.prefireTotalHits++;
            this.prefireStageHits++;
        }
    }
    
    prefire_StageComplete() {
        const stageTime = this.prefireStageElapsedTime + (Instance.GetGameTime() - this.prefireStageStartTime);
        const minutes = Math.floor(stageTime / 60);
        const seconds = stageTime % 60;
        const timeStr = `${minutes}:${seconds.toFixed(2).padStart(5, '0')}`;
        
        const accuracy = this.prefireStageShots > 0 
            ? Math.min(100, ((this.prefireStageHits / this.prefireStageShots) * 100)).toFixed(1)
            : "0.0";

        const stageName = this.prefireStageNames[this.prefireStage - 1];
        
        if (this.prefireNoclipDetected) {
            const deathText = this.prefireStageDeaths === 1 ? "death" : "deaths";
            Instance.ServerCommand(
                `say_team ${stageName} finished with ${accuracy}% accuracy and ${this.prefireStageDeaths} ${deathText}. (No time)`,
                0.0
            );
        } else {
            const deathText = this.prefireStageDeaths === 1 ? "death" : "deaths";
            Instance.ServerCommand(
                `say_team ${stageName} finished in ${timeStr} with ${accuracy}% accuracy and ${this.prefireStageDeaths} ${deathText}.`,
                0.0
            );
        }
        
        // Heal player
        const controller = Instance.GetPlayerController(0);
        if (controller?.IsValid()) {
            const pawn = controller.GetPlayerPawn();
            if (pawn?.IsValid()) {
                pawn.SetHealth(100);
                pawn.SetArmor(100);
                pawn.GiveNamedItem("item_assaultsuit", false);
            }
        }
        
        if (this.singleStageMode) {
            SoundManager.playGameplaySound("mode_complete");
            
            Instance.ServerCommand(`bot_dont_shoot 1`, 0.0);
            
            Instance.ServerCommand(`ent_fire prefire_stage_${this.prefireStage}_complete showhudhint`, 0.0);
            
            this.pendingTeleportStage = this.singleStage;
            this.pendingTeleportTime = Instance.GetGameTime() + 2.0;
            this.pendingSingleStageReset = true;
            
            Instance.ServerCommand(`ent_fire trigger_prefire_${this.singleStage} Enable`, 0.0);
            
            this.prefireState = "stage_complete";
            this.prefireStageElapsedTime = 0;
            this.isActive = false;
            this.prefireKills = 0;
            
            return;
        }
        
        if (this.prefireStage < 5) {
            SoundManager.playGameplaySound("prefire_clear_stage");
            SoundManager.playGameplaySound("prefire_countdown");
            
            Instance.ServerCommand(`bot_dont_shoot 1`, 0.0);
            
            Instance.ServerCommand(`ent_fire prefire_stage_${this.prefireStage}_complete showhudhint`, 0.0);
            
            const nextStage = this.prefireStage + 1;
            this.pendingTeleportStage = nextStage;
            this.pendingTeleportTime = Instance.GetGameTime() + 2.0;
            
            Instance.ServerCommand(`ent_fire relay_prefire_${nextStage} Trigger`, 0.0);
            
            Instance.ServerCommand(`ent_fire trigger_prefire_${nextStage} Enable`, 0.0);
            
            this.prefireStage = nextStage;
            this.prefireAdvancedStage = true;
            this.prefireState = "stage_complete";
            this.prefireStageElapsedTime = 0;
            this.isActive = false;
            this.prefireKills = 0;
        } else {
            this.prefire_Complete();
        }
    }
    
    prefire_Complete() {
        this.prefireState = "waiting_for_final_stats";
        this.isActive = false;
        
        Instance.ServerCommand(`bot_dont_shoot 1`, 0.0);
        
        const totalTime = (Instance.GetGameTime() - this.prefireStartTime);
        const minutes = Math.floor(totalTime / 60);
        const seconds = totalTime % 60;
        const timeStr = `${minutes}:${seconds.toFixed(2).padStart(5, '0')}`;
        
        const accuracy = this.prefireTotalShots > 0 
            ? Math.min(100, ((this.prefireTotalHits / this.prefireTotalShots) * 100)).toFixed(1)
            : "0.0";
        
        if (this.prefireNoclipDetected) {
            this.prefireFinalStatsMessage = `say_team Finished prefire ${this.mapName} with ${accuracy}% accuracy and ${this.prefireDeaths} ${this.prefireDeaths === 1 ? "death" : "deaths"}. (No time)`;
        } else {
            this.prefireFinalStatsMessage = `say_team Finished prefire ${this.mapName} in ${timeStr} with ${accuracy}% accuracy and ${this.prefireDeaths} ${this.prefireDeaths === 1 ? "death" : "deaths"}.`;
        }
        
        this.prefireFinalStatsTime = Instance.GetGameTime() + 0.5;
        
        SoundManager.playGameplaySound("mode_complete");
    }
    
    prefire_OnPlayerDeath() {
        this.prefireDeaths++;
        this.prefireStageDeaths++;
        
        Instance.ServerCommand(`bot_dont_shoot 1`, 0.0);
        
        this.prefireKillsAtDeath = this.prefireKills;
        
        Instance.ServerCommand(`ent_fire prefire_died showhudhint`, 0.0);
        
        if (this.prefireStage === 1) {
            this.prefireDeaths = 0;
            this.prefireStartTime = 0;
            this.prefireTotalShots = 0;
            this.prefireTotalHits = 0;
            this.tickCount = 0;
            
            this.prefireState = "died";
            this.isActive = false;
            return;
        }
        
        if (this.prefireState === "active") {
            this.prefireStageElapsedTime += Instance.GetGameTime() - this.prefireStageStartTime;
            
            this.prefireState = "died";
            this.isActive = false;
        }
    }
    
    prefire_Respawn() {
        if (this.prefireState !== "died") return;
        
        if (this.prefireKillsAtDeath === 0 && this.prefireKills > 0) {
            this.prefireKillsAtDeath = this.prefireKills;
        }
        
        const killsAtDeath = this.prefireKillsAtDeath || 0;
        const botsRemaining = this.prefireBotsPerStage - killsAtDeath;
        const stageName = this.prefireStageNames[this.prefireStage - 1];
        
        Instance.ServerCommand(
            `say_team Died on ${stageName} with ${botsRemaining} bot${botsRemaining !== 1 ? 's' : ''} remaining.`,
            0.0
        );
        
        this.prefireKills = 0;
        this.prefireState = "init";
        this.prefireCommenced = true;
        this.isActive = false;
        
        const controller = Instance.GetPlayerController(0);
        if (controller?.IsValid()) {
            const pawn = controller.GetPlayerPawn();
            if (pawn?.IsValid()) {
                const teleportPoint = Instance.FindEntityByName(`teleport_player_${this.prefireStage}`);
                if (teleportPoint && teleportPoint.IsValid()) {
                    pawn.Teleport({
                        position: teleportPoint.GetAbsOrigin(),
                        angles: teleportPoint.GetAbsAngles(),
                        velocity: { x: 0, y: 0, z: 0 }
                    });
                }
                
                this.giveWeapons(pawn);
            }
        }
        
        this.prefire_TeleportBotsToSpawn();
        
        Instance.ServerCommand(`ent_fire trigger_prefire_${this.prefireStage} Enable`, 0.0);
    }
    
    prefire_Restart() {
        SoundManager.playGameplaySound("mode_reset");
        
        if (this.particleActive) {
            Instance.ServerCommand(`ent_fire particle_stage_* Stop`, 0.0);
            this.particleActive = false;
        }
        
        Instance.ServerCommand(`bot_dont_shoot 1`, 0.0);
        Instance.ServerCommand(`ent_fire prefire_reset showhudhint`, 0.0);
        
        // Reset single stage mode
        this.singleStageMode = false;
        this.singleStage = 0;
        
        // Reset all state
        this.prefireStage = 1;
        this.updateStageExtras(1);
        this.prefireKills = 0;
        this.prefireKillsAtDeath = 0;
        this.prefireDeaths = 0;
        this.prefireStartTime = 0;
        this.prefireTotalShots = 0;
        this.prefireTotalHits = 0;
        this.prefireStageStartTime = 0;
        this.prefireStageShots = 0;
        this.prefireStageHits = 0;
        this.prefireStageDeaths = 0;
        this.prefireStageElapsedTime = 0;
        this.prefireNoclipDetected = false;
        this.tickCount = 0;
        this.isActive = false;
        this.pendingTeleportStage = 0;
        this.pendingSingleStageReset = false;
        this.prefireCommenced = false;
        this.prefireRetrying = false;
        this.prefireState = "init";
        
        Instance.ServerCommand(`ent_fire trigger_prefire_1 Enable`, 0.0);
        
        // Heal player and refill ammo
        const controller = Instance.GetPlayerController(0);
        if (controller?.IsValid()) {
            const pawn = controller.GetPlayerPawn();
            if (pawn?.IsValid()) {
                pawn.SetHealth(100);
                pawn.SetArmor(100);
                pawn.GiveNamedItem("item_assaultsuit", false);
            }
        }
        
        this.prefire_TeleportBotsToSpawn();
    }
    
    startSingleStage(stageNum) {
        SoundManager.playGameplaySound("mode_reset");
        
        if (this.particleActive) {
            Instance.ServerCommand(`ent_fire particle_stage_* Stop`, 0.0);
        }
        
        Instance.ServerCommand(`bot_dont_shoot 1`, 0.0);
        
        const stageName = this.prefireStageNames[stageNum - 1];
        
        this.prefireState = "idle";
        
        // Reset all state
        this.prefireStage = stageNum;
        this.updateStageExtras(stageNum);
        this.prefireKills = 0;
        this.prefireKillsAtDeath = 0;
        this.prefireDeaths = 0;
        this.prefireStartTime = 0;
        this.prefireTotalShots = 0;
        this.prefireTotalHits = 0;
        this.prefireStageStartTime = 0;
        this.prefireStageShots = 0;
        this.prefireStageHits = 0;
        this.prefireStageDeaths = 0;
        this.prefireStageElapsedTime = 0;
        this.prefireNoclipDetected = false;
        this.tickCount = 0;
        this.isActive = false;
        this.pendingTeleportStage = 0;
        this.pendingSingleStageReset = false;
        this.prefireCommenced = true;
        this.prefireRetrying = false;
        
        Instance.ServerCommand(`ent_fire trigger_prefire_${stageNum} Enable`, 0.0);
        
        const controller = Instance.GetPlayerController(0);
        if (controller?.IsValid()) {
            const pawn = controller.GetPlayerPawn();
            if (pawn?.IsValid()) {
                const teleportPoint = Instance.FindEntityByName(`teleport_player_${stageNum}`);
                if (teleportPoint && teleportPoint.IsValid()) {
                    pawn.Teleport({
                        position: teleportPoint.GetAbsOrigin(),
                        angles: teleportPoint.GetAbsAngles(),
                        velocity: { x: 0, y: 0, z: 0 }
                    });
                }
                pawn.SetHealth(100);
                pawn.SetArmor(100);
                pawn.GiveNamedItem("item_assaultsuit", false);
            }
        }
        
        this.prefire_TeleportBotsToSpawn();
        
        Instance.ServerCommand(`ent_fire particle_stage_${stageNum} Start`, 0.0);
        this.particleActive = true;
        
        this.pendingSingleStageTime = Instance.GetGameTime() + 0.1;
    }
    
    prefire_TeleportBotsToSpawn() {
        let botIndex = 0;
        for (let i = 0; i < 64; i++) {
            const ctrl = Instance.GetPlayerController(i);
            if (ctrl && ctrl.IsValid() && ctrl.IsBot() && ctrl.GetTeamNumber() === 3) {
                const botPawn = ctrl.GetPlayerPawn();
                if (botPawn && botPawn.IsValid()) {
                    botIndex++;
                    if (botIndex <= this.prefireBotsPerStage) {
                        const teleportName = `spawn_bot_${botIndex}`;
                        const teleportPoint = Instance.FindEntityByName(teleportName);
                        if (teleportPoint && teleportPoint.IsValid()) {
                            botPawn.Teleport({
                                position: teleportPoint.GetAbsOrigin(),
                                angles: teleportPoint.GetAbsAngles(),
                                velocity: { x: 0, y: 0, z: 0 }
                            });
                        }
                        botPawn.SetHealth(100);
                    }
                }
            }
        }
    }
    
    prefire_UpdateHUD() {
        let message = "";
        
        if (this.prefireState === "init") {
            if (this.prefireCommenced) {
                if (this.prefireRetrying) {
                    message = `Move to retry`;
                } else if (this.prefireStage === 1) {
                    message = `Move to start`;
                } else {
                    message = `Move to resume`;
                }
            }
        } else if (this.prefireState === "active") {
            if (this.prefireNoclipDetected) {
                message = `Kills: ${this.prefireKills}/${this.prefireBotsPerStage}\rTIMER STOPPED`;
            } else {
                const [m, sec, ms] = this.FormatedTime();
                message = `Kills: ${this.prefireKills}/${this.prefireBotsPerStage}\r${m}:${sec}.${ms}`;
            }
        }
        
        if (message !== "") {
            Instance.ServerCommand(`ent_create env_hudhint {"targetname" "timer_hudhint" "message" "${message}"}`, 0.0);
            Instance.ServerCommand(`ent_fire timer_hudhint showhudhint`, 0.0);
            Instance.ServerCommand(`ent_fire timer_hudhint kill`, 0.1);
        }
    }
    
    prefire_Exit() {
        this.prefireState = "idle";
        
        if (this.particleActive) {
            Instance.ServerCommand(`ent_fire particle_stage_* Stop`, 0.0);
            this.particleActive = false;
        }
        
        if (!this.safeMode) {
            Instance.ServerCommand(`bot_dont_shoot 0`, 0.0);
        }
        
        Instance.ServerCommand(`bot_quota 10`, 0.0);
    }
    
    prefire_exit() {
        const controller = Instance.GetPlayerController(0);
        if (!controller || !controller.IsValid()) return;
        const pawn = controller.GetPlayerPawn();
        if (!pawn || !pawn.IsValid()) return;

        pawn.Teleport({ velocity: { x: 0, y: 0, z: 0 } });
        
        this.prefire_Exit();

        Instance.ServerCommand(`ent_create env_hudhint {"targetname" "timer_hudhint" "message" "EXIT PREFIRE"}`, 0.0);
        Instance.ServerCommand(`ent_fire timer_hudhint showhudhint`, 0.01);
        Instance.ServerCommand(`ent_fire timer_hudhint kill`, 1.0);

        this.cleanupEntities();
        this.hudTick = 0;
    }
    
    prefire_commence() {
        const controller = Instance.GetPlayerController(0);
        if (!controller || !controller.IsValid()) return;
        const pawn = controller.GetPlayerPawn();
        if (!pawn || !pawn.IsValid()) return;
        
        Instance.ServerCommand(`ent_fire relay_wallhack_flicker Trigger`, 0.0);
        
        pawn.Teleport({ velocity: { x: 0, y: 0, z: 0 } });
        
        pawn.SetHealth(100);
        pawn.SetArmor(100);
        pawn.GiveNamedItem("item_assaultsuit", false);
        
        if (this.prefireState === "stage_complete" || this.prefireState === "died") {
            this.prefireState = "init";
        }
        
        this.prefireCommenced = true;
        
        if (this.particleActive) {
            Instance.ServerCommand(`ent_fire particle_stage_* Stop`, 0.0);
        }
        Instance.ServerCommand(`ent_fire particle_stage_${this.prefireStage} Start`, 0.0);
        this.particleActive = true;
        
        // Heal bots
        for (let i = 0; i < 64; i++) {
            const ctrl = Instance.GetPlayerController(i);
            if (ctrl && ctrl.IsValid() && ctrl.IsBot() && ctrl.GetTeamNumber() === 3) {
                const botPawn = ctrl.GetPlayerPawn();
                if (botPawn && botPawn.IsValid()) {
                    botPawn.SetHealth(100);
                }
            }
        }
        
        this.prefire_TeleportBots();
    }
}

// Initialize
p = new Timer();
Instance.SetThink(() => p.UpdateTime());
Instance.SetNextThink(Instance.GetGameTime() + 1.0, "UpdateTime");

Instance.OnPlayerKill(({ player: victim, attacker }) => {
    if (victim && victim.IsValid() && victim.GetTeamNumber() === 3) {
        p.prefire_OnKill();
    }

    if (attacker && attacker.IsValid() && victim && victim.IsValid()) {
        const victimTeam = victim.GetTeamNumber();
        
        if (victimTeam === 2) {
            p.prefire_OnPlayerDeath();
        }
    }
});

Instance.OnPlayerChat(({ player, text, team }) => {
    p.handleChatCommand(text, player);
});

Instance.OnPlayerConnect(({ player }) => {
    if (player?.IsValid() && player.IsBot() && player.GetTeamNumber() === 3) {
        const pawn = player.GetPlayerPawn();
        if (pawn?.IsValid()) applyModelToCTBot(pawn);
    }
});

Instance.OnPlayerDisconnect(({ playerSlot }) => {
    assignedModels.delete(playerSlot);
});

Instance.OnPlayerActivate(({ player }) => {
    if (player?.IsValid() && !player.IsBot()) {
        const pawn = player.GetPlayerPawn();
        if (pawn?.IsValid() && pawn.GetTeamNumber() === 2) {
            pawn.SetArmor(100);
            pawn.GiveNamedItem("item_assaultsuit", false);
        }
    }
});

Instance.OnPlayerReset(({ player }) => {
    // Apply model to CT bots
    if (player?.GetTeamNumber() === 3) {
        const ctrl = player.GetPlayerController();
        if (ctrl?.IsBot()) applyModelToCTBot(player);
    }
    
    if (player?.IsValid() && player.GetTeamNumber() === 2) {
        player.SetArmor(100);
        player.GiveNamedItem("item_kevlar", false);
        player.GiveNamedItem("item_assaultsuit", false);
    }
});

Instance.OnRoundStart(() => {
    if (p.setupDone && !p.initialSetupComplete) {
        p.initialSetupComplete = true;
    }
    
    if (!p.initialSetupComplete) {
        p.setupDone = true;
        return;
    }
    
    p.setup();
});

// Script Inputs from map entities
Instance.OnScriptInput("setup", () => p.setup());
Instance.OnScriptInput("prefire_init", () => p.prefire_Init());
Instance.OnScriptInput("prefire_start", () => p.prefire_Start());
Instance.OnScriptInput("prefire_restart", () => p.prefire_Restart());
Instance.OnScriptInput("prefire_respawn", () => p.prefire_Respawn());
Instance.OnScriptInput("prefire_exit", () => p.prefire_exit());
Instance.OnScriptInput("prefire_commence", () => p.prefire_commence());
Instance.OnScriptInput("prefire_giveweapon", () => p.prefire_giveweapon());
Instance.OnScriptInput("prefire_wallhack", () => p.toggleWallhack());
Instance.OnScriptInput("stats_shots_fired", () => p.stats_OnShotFired());
Instance.OnScriptInput("stats_shots_hit", () => p.stats_OnShotHit());

Instance.OnScriptInput("cmd_on", () => p.chatCommandsEnabled = true);
Instance.OnScriptInput("cmd_off", () => p.chatCommandsEnabled = false);