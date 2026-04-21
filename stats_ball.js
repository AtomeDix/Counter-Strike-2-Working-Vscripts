import { Instance } from "cs_script/point_script";


//Names of the kpm entities stacked together From left to right in game by index.
const KPM_BRUSHES = [
  ["hundred_kpm_0_a", "hundred_kpm_1_a", "hundred_kpm_2_a", "hundred_kpm_3_a", "hundred_kpm_4_a"],
  ["ten_kpm_0_a", "ten_kpm_1_a", "ten_kpm_2_a", "ten_kpm_3_a", "ten_kpm_4_a", "ten_kpm_5_a", "ten_kpm_6_a", "ten_kpm_7_a", "ten_kpm_8_a", "ten_kpm_9_a"],
  ["one_kpm_0_a", "one_kpm_1_a", "one_kpm_2_a", "one_kpm_3_a", "one_kpm_4_a", "one_kpm_5_a", "one_kpm_6_a", "one_kpm_7_a", "one_kpm_8_a", "one_kpm_9_a"],
  ["tenth_kpm_0_a", "tenth_kpm_1_a", "tenth_kpm_2_a", "tenth_kpm_3_a", "tenth_kpm_4_a", "tenth_kpm_5_a", "tenth_kpm_6_a", "tenth_kpm_7_a", "tenth_kpm_8_a", "tenth_kpm_9_a"],
  ["hundredth_kpm_0_a", "hundredth_kpm_1_a", "hundredth_kpm_2_a", "hundredth_kpm_3_a", "hundredth_kpm_4_a", "hundredth_kpm_5_a", "hundredth_kpm_6_a", "hundredth_kpm_7_a",
  "hundredth_kpm_8_a", "hundredth_kpm_9_a"]
];

//Names of the accuracy entities stacked together From left to right in game by index.
const ACCURACY_BRUSHES = [
  ["hundred_accuracy_0_a", "hundred_accuracy_1_a"],
  ["ten_accuracy_0_a", "ten_accuracy_1_a", "ten_accuracy_2_a", "ten_accuracy_3_a", "ten_accuracy_4_a", "ten_accuracy_5_a", "ten_accuracy_6_a", "ten_accuracy_7_a", "ten_accuracy_8_a", "ten_accuracy_9_a"],
  ["one_accuracy_0_a", "one_accuracy_1_a", "one_accuracy_2_a", "one_accuracy_3_a", "one_accuracy_4_a", "one_accuracy_5_a", "one_accuracy_6_a", "one_accuracy_7_a", "one_accuracy_8_a", "one_accuracy_9_a"],
  ["tenth_accuracy_0_a", "tenth_accuracy_1_a", "tenth_accuracy_2_a", "tenth_accuracy_3_a", "tenth_accuracy_4_a", "tenth_accuracy_5_a", "tenth_accuracy_6_a", "tenth_accuracy_7_a", "tenth_accuracy_8_a", "tenth_accuracy_9_a"],
  ["hundredth_accuracy_0_a", "hundredth_accuracy_1_a", "hundredth_accuracy_2_a", "hundredth_accuracy_3_a", "hundredth_accuracy_4_a", "hundredth_accuracy_5_a", "hundredth_accuracy_6_a", "hundredth_accuracy_7_a",
  "hundredth_accuracy_8_a", "hundredth_accuracy_9_a"]
];

const TOTAL_BRUSHES = [
  ["ten_thousand_0_a", "ten_thousand_1_a", "ten_thousand_2_a", "ten_thousand_3_a", "ten_thousand_4_a", "ten_thousand_5_a", "ten_thousand_6_a", "ten_thousand_7_a", "ten_thousand_8_a", "ten_thousand_9_a"],
  ["thousand_0_a", "thousand_1_a", "thousand_2_a", "thousand_3_a", "thousand_4_a", "thousand_5_a", "thousand_6_a", "thousand_7_a", "thousand_8_a", "thousand_9_a"],
  ["hundred_0_a", "hundred_1_a", "hundred_2_a", "hundred_3_a", "hundred_4_a", "hundred_5_a", "hundred_6_a", "hundred_7_a", "hundred_8_a", "hundred_9_a"],
  ["ten_0_a", "ten_1_a", "ten_2_a", "ten_3_a", "ten_4_a", "ten_5_a", "ten_6_a", "ten_7_a", "ten_8_a", "ten_9_a"]
];

//kpm stuff
var KPM_TIMER_ENABLED = false;
var KPM_ENABLED = true;
var KPM_TIMER = 0;
var targetsKilled = 0;
var KPM = 0;
var lastThink = 0;

//accuracy stuff
var ACCURACY_ENABLED = true;
var totalHits = 0;
var targetHits = 0;
var ACCURACY = 0;

//timer stuff
var TIMER_ACTIVATED = false;
var GameTime = 0;
var NewText = "";

var totalMs = 0;
var minutes = 0;
var seconds = 0;
var milliseconds = 0;

var formattedTime = "";

//challenge stuff
var challenge_counter = 0;
var challenge_max = 50;
const MAX_CHALLENGE_TARGETS = 250;
var CHALLENGE_ACTIVATED = false;
var CHALLENGE_ENDED = false;
var endKpm = "";
var endAcc = "";
var endTime = "";
var targets_active = 1;

//cross middle check
var CROSS_MIDDLE = false;

//OnBulletImpact register
var impactPos = null;
var HIT_REGISTERED = false;


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

// CALLED WHEN BULLET HITS THE WALL (ENTITY) (ASSUMING BULLETS GO THROUGH THE TARGETS)
Instance.OnScriptInput("CalculateAccuracy", () => {
	if (ACCURACY_ENABLED && !CROSS_MIDDLE) {
		totalHits += 1;
	
		let rawAccuracy = (targetHits / totalHits)*100;
		if (rawAccuracy > 100.00) {
			rawAccuracy = 100.00
		}
		ACCURACY = rawAccuracy.toFixed(2);
		let accuracyString = ACCURACY.toString();
		let newAccuracyString = accuracyString.split(".").join("");
		let paddedAccuracy = String(newAccuracyString).padStart(5, '0');
		
		endAcc = accuracyString;
		
		for (let i=0; i < paddedAccuracy.length; i++) {
			for (let j=0; j < ACCURACY_BRUSHES[i].length; j++) {
				let ent = Instance.FindEntityByName(ACCURACY_BRUSHES[i][j]);
				if (paddedAccuracy.charAt(i) == ACCURACY_BRUSHES[i][j].slice(-3).charAt(0)) {
					ent.SetModelScale(1);
					//Instance.EntFireAtName(ACCURACY_BRUSHES[i][j], "Alpha", "255");
				} else {
					ent.SetModelScale(0);
					//Instance.EntFireAtName(ACCURACY_BRUSHES[i][j], "Alpha", "0");
				}
			}
		}
		
		//Debug("Accuracy calculated");
	}
});



//BOTH CALLED THROUGH PAUSE STATS BUTTON
Instance.OnScriptInput("StartAccuracy", () => {
	ACCURACY_ENABLED = true;
});

Instance.OnScriptInput("StopAccuracy", () => {
	ACCURACY_ENABLED = false;
});


//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////

Instance.OnScriptInput("StartCrossChallenge", () => {
	KPM_TIMER_ENABLED = true;
});


// CALLED WHEN TARGET GETS KILLED (HEALTH THROUGH MATH_COUNTER)
Instance.OnScriptInput("CalculateKpm", () => {
	
	if (KPM_ENABLED) {
		
		KPM_TIMER_ENABLED = true;
		targetsKilled += 1;
		
		
		if (CHALLENGE_ACTIVATED) {
			challenge_counter += 1;
		}
		
		let totalKilled = targetsKilled.toString();
		let paddedTotal = String(totalKilled).padStart(4, '0');
		
		for (let i=0; i < paddedTotal.length; i++) {
			for (let j=0; j < TOTAL_BRUSHES[i].length; j++) {
				let ent = Instance.FindEntityByName(TOTAL_BRUSHES[i][j]);
				if (paddedTotal.charAt(i) == TOTAL_BRUSHES[i][j].slice(-3).charAt(0)) {
					ent.SetModelScale(1);
					//Instance.EntFireAtName(TOTAL_BRUSHES[i][j], "alpha", "255");
				} else {
					ent.SetModelScale(0);
					//Instance.EntFireAtName(TOTAL_BRUSHES[i][j], "alpha", "0");
				}
			}
		}
		
		
		//Instance.EntFireAtName("target_hit_sound", "StartSound");

		if (KPM_TIMER_ENABLED && KPM_TIMER>0.25) {
			let rawKpm = (60/KPM_TIMER)*targetsKilled;
			if (rawKpm > 499.99) {
				rawKpm = 499.99
			}
			KPM = rawKpm.toFixed(2);
			let kpmString = KPM.toString();
			
			
			let newKpmString = kpmString.split(".").join("");
			let paddedKpm = String(newKpmString).padStart(5, '0');
			
			endKpm = kpmString;
			
			for (let i=0; i < paddedKpm.length; i++) {
				for (let j=0; j < KPM_BRUSHES[i].length; j++) {
					let ent = Instance.FindEntityByName(KPM_BRUSHES[i][j]);
					if (paddedKpm.charAt(i) == KPM_BRUSHES[i][j].slice(-3).charAt(0)) {
						ent.SetModelScale(1);
						//Instance.EntFireAtName(KPM_BRUSHES[i][j], "Alpha", "255");
					} else {
						ent.SetModelScale(0);
						//Instance.EntFireAtName(KPM_BRUSHES[i][j], "Alpha", "0");
					}
				}
			}
			
		} else if (KPM_TIMER_ENABLED && KPM_TIMER<=0.25) {
			for (let i=0; i < KPM_BRUSHES.length; i++) {
				for (let j=0; j < KPM_BRUSHES[i].length; j++) {
					let ent = Instance.FindEntityByName(KPM_BRUSHES[i][j]);
					if (j == 0) {
						ent.SetModelScale(0);
						//Instance.EntFireAtName(KPM_BRUSHES[i][j], "Alpha", "0");
					}
				}
			}
			//SET FAKE 240 KPM FOR THE FIRST SHOT IF TIMER JUST STARTED
			Instance.EntFireAtName(KPM_BRUSHES[0][2], "setscale", "1");
			Instance.EntFireAtName(KPM_BRUSHES[1][4], "setscale", "1");
			Instance.EntFireAtName(KPM_BRUSHES[2][0], "setscale", "1");
			Instance.EntFireAtName(KPM_BRUSHES[3][0], "setscale", "1");
			Instance.EntFireAtName(KPM_BRUSHES[4][0], "setscale", "1");
			
			if (CHALLENGE_ACTIVATED) {
				Instance.ServerCommand("ent_fire hud_challenge showhudhint");
			}
			
			/*Instance.EntFireAtName(KPM_BRUSHES[0][2], "Alpha", "255");
			Instance.EntFireAtName(KPM_BRUSHES[1][4], "Alpha", "255");
			Instance.EntFireAtName(KPM_BRUSHES[2][0], "Alpha", "255");
			Instance.EntFireAtName(KPM_BRUSHES[3][0], "Alpha", "255");
			Instance.EntFireAtName(KPM_BRUSHES[4][0], "Alpha", "255");*/
		}
		
		//CALLED WHEN CHALLENGE IS OVER (50-250 HITS)
		if (challenge_counter == challenge_max) {
			CHALLENGE_ENDED = true;
			//Instance.EntFireAtName("statsball.script", "RunScriptInput", "StopKpm");
			//Instance.EntFireAtName("statsball.script", "RunScriptInput", "StopAccuracy");
			Instance.EntFireAtName("statsball.script", "RunScriptInput", "TimerDisabled");
			
			//-0.03125 Because something wrong with logic execution order probably
			totalMs = Math.floor((GameTime-0.03125) * 1000);
			minutes = Math.floor(totalMs / 60000);
			seconds = Math.floor((totalMs % 60000) / 1000);
			milliseconds = totalMs % 1000;

			endTime = 
				String(minutes).padStart(2, "0") + ":" +
				String(seconds).padStart(2, "0") + "." +
				String(milliseconds).padStart(3, "0");
				
			Instance.EntFireAtName("button_challenge_start_a", "PressOut");
			//Instance.EntFireAtName("button_counter_toggle_a", "PressIn");
			
			Instance.EntFireAtName("servercommand", "Command", `say ${challenge_max} targets - Challenge completed`, 0.0);
			//Instance.EntFireAtName("servercommand", "Command", `say Targets active: ${targets_active}`, 0.3);
			Instance.EntFireAtName("servercommand", "Command", `say Kpm: ${endKpm}`, 0.6);
			Instance.EntFireAtName("servercommand", "Command", `say Accuracy: ${endAcc}`, 0.9);
			Instance.EntFireAtName("servercommand", "Command", `say Time: ${endTime}`, 1.2);
			Instance.EntFireAtName("servercommand", "Command", "say -------------------", 1.5);
			
		}
		
	}
});


//BOTH CALLED THROUGH PAUSE STATS BUTTON
Instance.OnScriptInput("StartKpm", () => {
	KPM_ENABLED = true;
});

Instance.OnScriptInput("StopKpm", () => {
	KPM_ENABLED = false;
});

//UNUSED
Instance.OnScriptInput("TimerEnabled", () => {
	TIMER_ACTIVATED = true;
});

//CALLED WHEN CHALLENGE ENDS
Instance.OnScriptInput("TimerDisabled", () => {
	TIMER_ACTIVATED = false;
	
	CHALLENGE_ACTIVATED = false;
	challenge_counter = 0;
	Instance.EntFireAtName("a_challenge_sound", "StartSound");
});

// CALLED EITHER THROUGH A BUTTON OR WHEN CHALLENGE STARTS
// SETS KPM/ACCURACY/TOTAL TO ZEROES.
Instance.OnScriptInput("ResetStats", () => {
	KPM_TIMER_ENABLED = false;
	targetsKilled = 0;
	KPM_TIMER = 0;
	//
	GameTime = 0;
	NewText = "";
	//
	totalHits = 0;
	targetHits = 0;
	for (let i=0; i < KPM_BRUSHES.length; i++) {
		for (let j=0; j < KPM_BRUSHES[i].length; j++) {
			let ent = Instance.FindEntityByName(KPM_BRUSHES[i][j]);
			if (j == 0) {
				ent.SetModelScale(1);
				//Instance.EntFireAtName(KPM_BRUSHES[i][j], "Alpha", "255");
			} else {
				ent.SetModelScale(0);
				//Instance.EntFireAtName(KPM_BRUSHES[i][j], "Alpha", "0");
			}
		}
	}
	
	for (let i=0; i < ACCURACY_BRUSHES.length; i++) {
		for (let j=0; j < ACCURACY_BRUSHES[i].length; j++) {
			let ent = Instance.FindEntityByName(ACCURACY_BRUSHES[i][j]);
			if (j == 0) {
				ent.SetModelScale(1);
				//Instance.EntFireAtName(ACCURACY_BRUSHES[i][j], "Alpha", "255");
			} else {
				ent.SetModelScale(0);
				//Instance.EntFireAtName(ACCURACY_BRUSHES[i][j], "Alpha", "0");
			}
		}
	}
	
	for (let i=0; i < TOTAL_BRUSHES.length; i++) {
		for (let j=0; j < TOTAL_BRUSHES[i].length; j++) {
			let ent = Instance.FindEntityByName(TOTAL_BRUSHES[i][j]);
			if (j == 0) {
				ent.SetModelScale(1);
				//Instance.EntFireAtName(TOTAL_BRUSHES[i][j], "Alpha", "255");
			} else {
				ent.SetModelScale(0);
				//Instance.EntFireAtName(TOTAL_BRUSHES[i][j], "Alpha", "0");
			}
		}
	}
	
	Instance.ServerCommand("ent_fire hud_timer hidehudhint");
});

//CALLED THROUGH ENTITY WHEN PLAYER SHOOTS A TARGET (IF CHALLENGE IS TURNED ON)
Instance.OnScriptInput("ChallengeStart", () => {
	Instance.EntFireAtName("statsball.script", "RunScriptInput", "ResetStats");
	
	Instance.EntFireAtName("statsball.script", "RunScriptInput", "StartKpm");
	Instance.EntFireAtName("statsball.script", "RunScriptInput", "StartAccuracy");
	
	TIMER_ACTIVATED = true;
	
	challenge_counter = 0;
	CHALLENGE_ACTIVATED = true;
});

//CALLED WHEN PLAYER CHANGES THE THRESHOLD OF THE CALLGENE (50-250)
for (let i = 50; i <= MAX_CHALLENGE_TARGETS; i+= 50) {
    const inputName = "challenge_targets_" + i;
    
    ((val, name) => {
        Instance.OnScriptInput(name, (_ctx) => {
            challenge_max = val;
        });
    })(i, inputName);
}

//Called from teletargetflat script when setting amount of active targets
//Also set to 1 during crossmode
for (let i = 1; i <= 20; i++) {
    const inputName = "targets_active_" + i;
    
    ((val, name) => {
        Instance.OnScriptInput(name, (_ctx) => {
			targets_active = val;
        });
    })(i, inputName);
}

//Called from the cross script so accuracy dont update while in the middle
Instance.OnScriptInput("InTheMiddle", () => { CROSS_MIDDLE = true; });
Instance.OnScriptInput("NotInTheMiddle", () => { CROSS_MIDDLE = false; });


Instance.OnScriptInput("HideStats", () => {
	for (let i=0; i < KPM_BRUSHES.length; i++) {
		for (let j=0; j < KPM_BRUSHES[i].length; j++) {
			let ent = Instance.FindEntityByName(KPM_BRUSHES[i][j]);
			ent.SetColor({r: 0, g: 0, b: 0});
			//Instance.ServerCommand(`ent_fire ${KPM_BRUSHES[i][j]} setscale 0`);
		}
	}
	
	for (let i=0; i < ACCURACY_BRUSHES.length; i++) {
		for (let j=0; j < ACCURACY_BRUSHES[i].length; j++) {
			let ent = Instance.FindEntityByName(ACCURACY_BRUSHES[i][j]);
			ent.SetColor({r: 0, g: 0, b: 0});
			//Instance.ServerCommand(`ent_fire ${ACCURACY_BRUSHES[i][j]} setscale 0`);
		}
	}
	
	for (let i=0; i < TOTAL_BRUSHES.length; i++) {
		for (let j=0; j < TOTAL_BRUSHES[i].length; j++) {
			let ent = Instance.FindEntityByName(TOTAL_BRUSHES[i][j]);
			ent.SetColor({r: 0, g: 0, b: 0});
			//Instance.ServerCommand(`ent_fire ${TOTAL_BRUSHES[i][j]} setscale 0`);
		}
	}
});

Instance.OnScriptInput("ShowStats", () => {
	for (let i=0; i < KPM_BRUSHES.length; i++) {
		for (let j=0; j < KPM_BRUSHES[i].length; j++) {
			let ent = Instance.FindEntityByName(KPM_BRUSHES[i][j]);
			ent.SetColor({r: 255, g: 255, b: 255});
			//Instance.ServerCommand(`ent_fire ${KPM_BRUSHES[i][j]} setscale 1`);
		}
	}
	
	for (let i=0; i < ACCURACY_BRUSHES.length; i++) {
		for (let j=0; j < ACCURACY_BRUSHES[i].length; j++) {
			let ent = Instance.FindEntityByName(ACCURACY_BRUSHES[i][j]);
			ent.SetColor({r: 255, g: 255, b: 255});
			//Instance.ServerCommand(`ent_fire ${ACCURACY_BRUSHES[i][j]} setscale 1`);
		}
	}
	
	for (let i=0; i < TOTAL_BRUSHES.length; i++) {
		for (let j=0; j < TOTAL_BRUSHES[i].length; j++) {
			let ent = Instance.FindEntityByName(TOTAL_BRUSHES[i][j]);
			ent.SetColor({r: 255, g: 255, b: 255});
			//Instance.ServerCommand(`ent_fire ${TOTAL_BRUSHES[i][j]} setscale 1`);
		}
	}

});


Instance.OnRoundStart(() => {
	//kpm stuff
	KPM_TIMER_ENABLED = false;
	KPM_ENABLED = true;
	KPM_TIMER = 0;
	targetsKilled = 0;
	KPM = 0;
	lastThink = 0;

	//accuracy stuff
	ACCURACY_ENABLED = true;
	totalHits = 0;
	targetHits = 0;
	ACCURACY = 0;

	//timer stuff
	TIMER_ACTIVATED = false;
	GameTime = 0;
	NewText = "";

	totalMs = 0;
	minutes = 0;
	seconds = 0;
	milliseconds = 0;

	formattedTime = "";

	//challenge stuff
	challenge_counter = 0;
	challenge_max = 50;
	CHALLENGE_ACTIVATED = false;
	CHALLENGE_ENDED = false;
	endKpm = "";
	endAcc = "";
	endTime = "";
	targets_active = 1;

	//cross middle check
	CROSS_MIDDLE = false;
	
	////////////////////
	impactPos = null;
	HIT_REGISTERED = false;
	
	Instance.EntFireAtName("statsball.script", "RunScriptInput", "ResetStats");

});


Instance.OnBulletImpact((event) => {
	const weapon = event.weapon;
    const pawn = weapon.GetOwner();
	
    const ctrl = pawn.GetPlayerController();
    if (!ctrl || ctrl.IsBot()) return;
	
	if (!HIT_REGISTERED) {
		//Debug("BULLET IMPACT");
		HIT_REGISTERED = true;
		impactPos = event.position;
	}
});

Instance.OnGunFire((event) => {

    const weapon = event.weapon;
    const pawn = weapon.GetOwner();
	
    const ctrl = pawn.GetPlayerController();
    if (!ctrl || ctrl.IsBot()) return;

    const weaponData = weapon.GetData();
    if (!weaponData) return;
	
    const start = pawn.GetEyePosition();
    const forward = getForward(pawn.GetEyeAngles());
    const end = impactPos;

    const result = Instance.TraceSphere({
		start,
		end,
		radius: 0.35,
		ignoreEntity: pawn,
		ignorePlayers: false,
	});
	
	
	if (!result.didHit) {
		HIT_REGISTERED = false;
	}
	
	if (result.didHit && HIT_REGISTERED) {
        const ent = result.hitEntity;
        const name = ent.GetEntityName();
        const cls = ent.GetClassName();

		//Instance.DebugSphere({ center: result.end, radius: 2, duration: 2, color: { r: 255, g: 0, b: 0 } });

        // Check for specific entities
        if (name.startsWith("a_target_")) {
			Instance.EntFireAtName("a_target_sound", "StartSound");
			if (ACCURACY_ENABLED) {
				targetHits += 1;
			}
			Instance.EntFireAtName("statsball.script", "RunScriptInput", "CalculateAccuracy");
			let targetCounterName = "counter_main_a_target_" + name.replace("a_target_", "");
			let targetIntenseCounterName = "intense_target_" + name.replace("a_target_", "") + "_a";
			//this teleports the target
			Instance.EntFireAtName(targetCounterName, "Add", "1");
			Instance.EntFireAtName(targetIntenseCounterName, "Add", "1");
			
			if (name === "a_target_1") {
				Instance.EntFireAtName("intense_counter_start_a", "Add", "1");
			}
			HIT_REGISTERED = false;
			return;
        } else if (name.startsWith("a_wall_missed")) {
			if (ACCURACY_ENABLED) {
				Instance.EntFireAtName("statsball.script", "RunScriptInput", "CalculateAccuracy")
			}
			HIT_REGISTERED = false;
			return;
		} else {
			HIT_REGISTERED = false;
		}
	}

});


//UPDATES HUD TIMER AND TIMER FOR CALCULATING KPM
Instance.SetThink(() => {
	Instance.SetNextThink(Instance.GetGameTime());
	
	if (KPM_ENABLED && KPM_TIMER_ENABLED) {
		let now = Instance.GetGameTime();
		let delta = now - lastThink;
		lastThink = now;
		KPM_TIMER += delta;
		GameTime += delta;
		
		if (TIMER_ACTIVATED) {
			totalMs = Math.floor(GameTime * 1000); // total milliseconds
			minutes = Math.floor(totalMs / 60000);
			seconds = Math.floor((totalMs % 60000) / 1000);
			milliseconds = totalMs % 1000;

			/*formattedTime =
			String(minutes).padStart(2, "0") + ":" +
			String(seconds).padStart(2, "0") + "." +
			String(milliseconds).padStart(3, "0");

			NewText = formattedTime;
			endTime = NewText;

			Instance.ServerCommand(`ent_create env_hudhint {targetname hud_timer message "Timer:\r${NewText}"}`);

			Instance.ServerCommand("ent_fire hud_timer showhudhint");
			Instance.ServerCommand("ent_fire hud_timer kill");*/
		}
	} else {
		lastThink = Instance.GetGameTime();
		if (Instance.FindEntityByName("hud_timer") != null) {
			/*Instance.ServerCommand("ent_fire hud_timer hidehudhint");
			Instance.ServerCommand("ent_fire hud_timer kill");*/
		}
	}
});

Instance.SetNextThink(Instance.GetGameTime());


function Debug(msg) {
    Instance.Msg("[cs_stats] " + msg + "\n");
}
Debug("STATS BALL EXECUTED");