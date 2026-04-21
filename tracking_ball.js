
import { Instance, Entity } from "cs_script/point_script";

/* ---------- Config ---------- */
const TARGET_NAMES = ["a_target_1", "a_target_2", "a_target_3", "a_target_4", "a_target_5", "a_target_6", "a_target_7", "a_target_8", "a_target_9", "a_target_10",
"a_target_11", "a_target_12", "a_target_13", "a_target_14", "a_target_15", "a_target_16", "a_target_17", "a_target_18", "a_target_19", "a_target_20"]; // named func_physbox targets

const SOUND_ENTITY = "a_tracking_sound";       // point_soundevent to fire StartSound repeatedly when aimed
const TRACE_DISTANCE = 2000.0;

/* ---------- State ---------- */
var prevAnyAiming = false;
var tracking_enabled = false;
var healthThreshold = 1; // seconds of aiming before teleport
var INFINITE_HEALTH = false;

var hold_time = 0.0;
var initiation_time = 0.0;

// health per target (initialized from TARGET_NAMES)
const health = {};
for (const name of TARGET_NAMES) health[name] = 0.0;

// health percentage per target
const target_health_percentage = {};
for (const name of TARGET_NAMES) target_health_percentage[name] = 100;


/* ---------- Script Inputs ---------- */
Instance.OnScriptInput("SetTrackingEnabled", (_ctx) => {
    tracking_enabled = true;
	//enables point_worldtext for each target
	for (let i = 1; i <= TARGET_NAMES.length; i++) {
		Instance.EntFireAtName("target_" + i + "_health_a", "enable");
	}
    //Instance.Msg("[hover_sound] tracking_enabled = TRUE\n");
});
Instance.OnScriptInput("SetTrackingDisabled", (_ctx) => {
    tracking_enabled = false;
    prevAnyAiming = false;
	//disables point_worldtext for each target
	Instance.EntFireAtName("trackingball.script", "RunScriptInput", "ResetHealths");
	
	for (let i = 1; i <= TARGET_NAMES.length; i++) {
		Instance.EntFireAtName("target_" + i + "_health_a", "disable");
		Instance.EntFireAtName("target_" + i + "_health_a", "setmessage", "100%");
	}
    //Instance.Msg("[hover_sound] tracking_enabled = FALSE\n");
});

Instance.OnScriptInput("ResetHealths", (_ctx) => {
    for (const n of TARGET_NAMES) health[n] = 0.0;
	for (const n of TARGET_NAMES) target_health_percentage[n] = 100;
    //Instance.Msg("[hover_sound] ResetHealths called; all health set to 0\n");
});

// Register generic SetMaxHealth1..SetMaxHealthN inputs
const MAX_HEALTH_INPUT = 30;
for (let i = 1; i <= MAX_HEALTH_INPUT; ++i) {
    const inputName = "SetMaxHealth" + i;
    ((val, name) => {
        Instance.OnScriptInput(name, (_ctx) => {
            healthThreshold = val;
            //Instance.Msg(`[hover_sound] healthThreshold set to ${healthThreshold}\n`);
			INFINITE_HEALTH = false;
        });
    })(i, inputName);
}

Instance.OnScriptInput("InfiniteHealth", () => {
	INFINITE_HEALTH = true;
});

/* ---------- Get trace ---------- */
function vectorAdd(vec1, vec2) {
    return { x: vec1.x + vec2.x, y: vec1.y + vec2.y, z: vec1.z + vec2.z };
}

function vectorScale(vec, scale) {
    return { x: vec.x * scale, y: vec.y * scale, z: vec.z * scale };
}

function getForward(angles) {
    const pitchRadians = (angles.pitch * Math.PI) / 180;
    const yawRadians = (angles.yaw * Math.PI) / 180;
    const hScale = Math.cos(pitchRadians);
    return {
        x: Math.cos(yawRadians) * hScale,
        y: Math.sin(yawRadians) * hScale,
        z: -Math.sin(pitchRadians),
    };
}

function getTargetAimedAtLocal() {
    try {
        const ctrl = Instance.GetPlayerController(0);
        if (!ctrl) return null;
        const pawn = ctrl.GetPlayerPawn();
        if (!pawn) return null;
		
		//TRACE DISTANCE?
		const weapon = pawn.GetActiveWeapon();
		const weaponData = weapon.GetData();
		if (!weaponData) return;
		
		const start = pawn.GetEyePosition();
		const forward = getForward(pawn.GetEyeAngles());
		const end = vectorAdd(start, vectorScale(forward, weaponData.GetRange()));
		
		const result = Instance.TraceSphere({
			start,
			end,
			radius: 0.35,
			ignoreEntity: pawn,
			ignorePlayers: true
		});
		
        if (!result || !result.didHit) return null;

        const ent = result.hitEntity;
        const name = ent.GetEntityName();
		if (!name) return null;
		
        return TARGET_NAMES.includes(name) ? name : null;
		
    } catch (e) { return null; }
}


Instance.OnRoundStart(() => {
	healthThreshold = 1
    tracking_enabled = false;
    prevAnyAiming = false;
	INFINITE_HEALTH = false;

	Instance.EntFireAtName("trackingball.script", "RunScriptInput", "ResetHealths");
	for (let i = 1; i <= TARGET_NAMES.length; i++) {
		Instance.EntFireAtName("target_" + i + "_health_a", "disable");
		Instance.EntFireAtName("target_" + i + "_health_a", "setmessage", "100%");
	}
	
});

/* ---------- Think loop ---------- */

var lastThink = Instance.GetGameTime();
Instance.SetThink(() => {
    Instance.SetNextThink(Instance.GetGameTime());
	
	let now = Instance.GetGameTime();
	let delta = now - lastThink;
	lastThink = now;

    if (!tracking_enabled) return;

    const target = getTargetAimedAtLocal();
    const anyAiming = target !== null;
	
	let defaultThinkRate = 1/64
	
    if (anyAiming) {
		
		hold_time += delta;
		initiation_time += delta;
		
		if (hold_time >= 5 * defaultThinkRate && INFINITE_HEALTH) {
			Instance.EntFireAtName(SOUND_ENTITY, "StartSound");
			hold_time = 0.0;
		}
		
		if (!target) return;
		let TargetId = target.replace("a_target_", "")
		
		//3 ticks before tracking starts
		if (initiation_time >= 3 * defaultThinkRate && !INFINITE_HEALTH) {
			//play sound every 5 ticks
			if (hold_time >= 5 * defaultThinkRate) {
				Instance.EntFireAtName(SOUND_ENTITY, "StartSound");
				hold_time = 0.0;
			}

			health[target] += delta;

			// Set new percentage for point_worldtext based on health
			// at 1 health 0.015625 will be substracted from target_health_percentage every tick and with 2 health 0.0078125 will be substracted
			target_health_percentage[target] -= (delta * 100) / healthThreshold;
			let roundedHealth = Math.round(target_health_percentage[target] * 100) / 100;
			if (roundedHealth.toFixed(0) == 0) roundedHealth = 1;
			if (target_health_percentage[target] < 0) roundedHealth = 0;
			Instance.EntFireAtName("target_" + TargetId + "_health_a", "SetMessage", roundedHealth.toFixed(0) + "%");
			
			//Check if health reaches max health for teleport
			if (health[target] >= healthThreshold) {
				health[target] = 0.0;
				//Instance.EntFireAtName("teleportflat.script", "RunScriptInput", target);
				Instance.EntFireAtName("counter_main_a_target_" + TargetId, "Add", "30");
				Instance.EntFireAtName("target_" + TargetId + "_health_a", "setmessage", "100%");
				target_health_percentage[target] = 100;
				initiation_time = 0.0;
			}
		}
    }

    if (anyAiming && !prevAnyAiming) {
        //Debug(`Started aiming at ${target}`);
    } else if (!anyAiming && prevAnyAiming) {
		hold_time = 0.0;
		initiation_time = 0.0;
        //Debug(`Stopped aiming at all targets`);
    }
    prevAnyAiming = anyAiming;
});

Instance.SetNextThink(Instance.GetGameTime());

/* ---------- Helpers ---------- */
function Debug(msg) { Instance.Msg("[cs_tracking] " + msg + "\n"); }

Debug("TRACKING BALL SCRIPT EXECUTED");



