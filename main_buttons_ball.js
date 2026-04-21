import { Instance } from "cs_script/point_script";

//main
var ADD_TARGET_ENABLED = true;
var SPAWN_TIME_ENABLED = false;
var DURATION_ENABLED = false;
var MISC_ENABLED = false;
//other
var SIZE_ENABLED = true;
var HEALTH_ENABLED = false;
var AREA_ENABLED = false;
var SOUND_ENABLED = false;
//move
var HORIZONTAL_DISTANCE_ENABLED = true;
var HORIZONTAL_SPEED_ENABLED = false;
var VERTICAL_DISTANCE_ENABLED = false;
var VERTICAL_SPEED_ENABLED = false;

///
var RANDOM_SIZE_ENABLED = false;

// MAIN BUTTONS
Instance.OnScriptInput("main_button_1", () => {
	if (ADD_TARGET_ENABLED) { Instance.EntFireAtName("button_add_target_1_a", "Press");
	} else if (SPAWN_TIME_ENABLED) {Instance.EntFireAtName("btn_spawn_000_a", "Press");
	} else if (DURATION_ENABLED) {Instance.EntFireAtName("btn_duration_030_a", "Press");
	} else if (MISC_ENABLED) {Instance.EntFireAtName("button_drawparticles_2", "Press");
	}
});
Instance.OnScriptInput("main_button_2", () => {
	if (ADD_TARGET_ENABLED) { Instance.EntFireAtName("button_add_target_2_a", "Press");
	} else if (SPAWN_TIME_ENABLED) {Instance.EntFireAtName("btn_spawn_025_a", "Press");
	} else if (DURATION_ENABLED) {Instance.EntFireAtName("btn_duration_035_a", "Press");
	} else if (MISC_ENABLED) {Instance.EntFireAtName("button_noaimpunch_2", "Press");
	}
});
Instance.OnScriptInput("main_button_3", () => {
	if (ADD_TARGET_ENABLED) { Instance.EntFireAtName("button_add_target_3_a", "Press");
	} else if (SPAWN_TIME_ENABLED) {Instance.EntFireAtName("btn_spawn_030_a", "Press");
	} else if (DURATION_ENABLED) {Instance.EntFireAtName("btn_duration_040_a", "Press");
	} else if (MISC_ENABLED) {Instance.EntFireAtName("button_nospread_2", "Press");
	}
});
Instance.OnScriptInput("main_button_4", () => {
	if (ADD_TARGET_ENABLED) { Instance.EntFireAtName("button_add_target_4_a", "Press");
	} else if (SPAWN_TIME_ENABLED) {Instance.EntFireAtName("btn_spawn_035_a", "Press");
	} else if (DURATION_ENABLED) {Instance.EntFireAtName("btn_duration_045_a", "Press");
	} else if (MISC_ENABLED) {Instance.EntFireAtName("button_noviewmodel_2", "Press");
	}
});
Instance.OnScriptInput("main_button_5", () => {
	if (ADD_TARGET_ENABLED) { Instance.EntFireAtName("button_add_target_5_a", "Press");
	} else if (SPAWN_TIME_ENABLED) {Instance.EntFireAtName("btn_spawn_040_a", "Press");
	} else if (DURATION_ENABLED) {Instance.EntFireAtName("btn_duration_050_a", "Press");
	} else if (MISC_ENABLED) {Instance.EntFireAtName("button_showimpact_2", "Press");
	}
});
Instance.OnScriptInput("main_button_6", () => {
	if (ADD_TARGET_ENABLED) { Instance.EntFireAtName("button_add_target_6_a", "Press");
	} else if (SPAWN_TIME_ENABLED) {Instance.EntFireAtName("btn_spawn_045_a", "Press");
	} else if (DURATION_ENABLED) {Instance.EntFireAtName("btn_duration_055_a", "Press");
	}
});
Instance.OnScriptInput("main_button_7", () => {
	if (ADD_TARGET_ENABLED) { Instance.EntFireAtName("button_add_target_7_a", "Press");
	} else if (SPAWN_TIME_ENABLED) {Instance.EntFireAtName("btn_spawn_050_a", "Press");
	} else if (DURATION_ENABLED) {Instance.EntFireAtName("btn_duration_060_a", "Press");
	}
});
Instance.OnScriptInput("main_button_8", () => {
	if (ADD_TARGET_ENABLED) { Instance.EntFireAtName("button_add_target_8_a", "Press");
	} else if (SPAWN_TIME_ENABLED) {Instance.EntFireAtName("btn_spawn_055_a", "Press");
	} else if (DURATION_ENABLED) {Instance.EntFireAtName("btn_duration_065_a", "Press");
	}
});
Instance.OnScriptInput("main_button_9", () => {
	if (ADD_TARGET_ENABLED) { Instance.EntFireAtName("button_add_target_9_a", "Press");
	} else if (SPAWN_TIME_ENABLED) {Instance.EntFireAtName("btn_spawn_060_a", "Press");
	} else if (DURATION_ENABLED) {Instance.EntFireAtName("btn_duration_075_a", "Press");
	}
});
Instance.OnScriptInput("main_button_10", () => {
	if (ADD_TARGET_ENABLED) { Instance.EntFireAtName("button_add_target_10_a", "Press");
	} else if (SPAWN_TIME_ENABLED) {Instance.EntFireAtName("btn_spawn_065_a", "Press");
	} else if (DURATION_ENABLED) {Instance.EntFireAtName("btn_duration_100_a", "Press");
	}
});
Instance.OnScriptInput("main_button_11", () => {
	if (ADD_TARGET_ENABLED) { Instance.EntFireAtName("button_add_target_11_a", "Press");
	} else if (SPAWN_TIME_ENABLED) {Instance.EntFireAtName("btn_spawn_070_a", "Press");
	} else if (DURATION_ENABLED) {Instance.EntFireAtName("btn_duration_125_a", "Press");
	}
});
Instance.OnScriptInput("main_button_12", () => {
	if (ADD_TARGET_ENABLED) { Instance.EntFireAtName("button_add_target_12_a", "Press");
	} else if (SPAWN_TIME_ENABLED) {Instance.EntFireAtName("btn_spawn_075_a", "Press");
	} else if (DURATION_ENABLED) {Instance.EntFireAtName("btn_duration_150_a", "Press");
	}
});
Instance.OnScriptInput("main_button_13", () => {
	if (ADD_TARGET_ENABLED) { Instance.EntFireAtName("button_add_target_13_a", "Press");
	} else if (SPAWN_TIME_ENABLED) {Instance.EntFireAtName("btn_spawn_100_a", "Press");
	} else if (DURATION_ENABLED) {Instance.EntFireAtName("btn_duration_175_a", "Press");
	}
});
Instance.OnScriptInput("main_button_14", () => {
	if (ADD_TARGET_ENABLED) { Instance.EntFireAtName("button_add_target_14_a", "Press");
	} else if (SPAWN_TIME_ENABLED) {Instance.EntFireAtName("btn_spawn_200_a", "Press");
	} else if (DURATION_ENABLED) {Instance.EntFireAtName("btn_duration_200_a", "Press");
	}
});
Instance.OnScriptInput("main_button_15", () => {
	if (ADD_TARGET_ENABLED) { Instance.EntFireAtName("button_add_target_15_a", "Press");
	} else if (SPAWN_TIME_ENABLED) {Instance.EntFireAtName("btn_spawn_250_a", "Press");
	} else if (DURATION_ENABLED) {Instance.EntFireAtName("btn_duration_infinite_a", "Press");
	}
});
Instance.OnScriptInput("main_button_16", () => {
	if (ADD_TARGET_ENABLED) { Instance.EntFireAtName("button_add_target_16_a", "Press");
	}
});
Instance.OnScriptInput("main_button_17", () => {
	if (ADD_TARGET_ENABLED) { Instance.EntFireAtName("button_add_target_17_a", "Press");
	}
});
Instance.OnScriptInput("main_button_18", () => {
	if (ADD_TARGET_ENABLED) { Instance.EntFireAtName("button_add_target_18_a", "Press");
	}
});
Instance.OnScriptInput("main_button_19", () => {
	if (ADD_TARGET_ENABLED) { Instance.EntFireAtName("button_add_target_19_a", "Press");
	}
});
Instance.OnScriptInput("main_button_20", () => {
	if (ADD_TARGET_ENABLED) { Instance.EntFireAtName("button_add_target_20_a", "Press");
	}
});
// ---------------------------------------------------------------------------------------

// OTHER BUTTONS
Instance.OnScriptInput("other_button_1", () => {
	if (SIZE_ENABLED) { Instance.EntFireAtName("btn_size_1_a", "Press");
	} else if (HEALTH_ENABLED) {Instance.EntFireAtName("btn_health_1_a", "Press");
	} else if (AREA_ENABLED) {Instance.EntFireAtName("btn_area_small_a", "Press");
	} else if (SOUND_ENABLED) {Instance.EntFireAtName("button_sound_1", "Press");
	}
});
Instance.OnScriptInput("other_button_2", () => {
	if (SIZE_ENABLED) { Instance.EntFireAtName("btn_size_2_a", "Press");
	} else if (HEALTH_ENABLED) {Instance.EntFireAtName("btn_health_2_a", "Press");
	} else if (AREA_ENABLED) {Instance.EntFireAtName("btn_area_wide_a", "Press");
	} else if (SOUND_ENABLED) {Instance.EntFireAtName("button_sound_2", "Press");
	}
});
Instance.OnScriptInput("other_button_3", () => {
	if (SIZE_ENABLED) { Instance.EntFireAtName("btn_size_3_a", "Press");
	} else if (HEALTH_ENABLED) {Instance.EntFireAtName("btn_health_3_a", "Press");
	} else if (SOUND_ENABLED) {Instance.EntFireAtName("button_sound_3", "Press");
	}
});
Instance.OnScriptInput("other_button_4", () => {
	if (SIZE_ENABLED) { Instance.EntFireAtName("btn_size_4_a", "Press");
	} else if (HEALTH_ENABLED) {Instance.EntFireAtName("btn_health_4_a", "Press");
	} else if (SOUND_ENABLED) {Instance.EntFireAtName("button_sound_4", "Press");
	}
});
Instance.OnScriptInput("other_button_5", () => {
	if (SIZE_ENABLED) { Instance.EntFireAtName("btn_size_5_a", "Press");
	} else if (HEALTH_ENABLED) {Instance.EntFireAtName("btn_health_5_a", "Press");
	} else if (SOUND_ENABLED) {Instance.EntFireAtName("button_sound_5", "Press");
	}
});
Instance.OnScriptInput("other_button_6", () => {
	if (SIZE_ENABLED) { Instance.EntFireAtName("btn_size_6_a", "Press");
	} else if (HEALTH_ENABLED) {Instance.EntFireAtName("btn_health_10_a", "Press");
	} else if (SOUND_ENABLED) {Instance.EntFireAtName("button_sound_6", "Press");
	}
});
Instance.OnScriptInput("other_button_7", () => {
	if (SIZE_ENABLED) { Instance.EntFireAtName("btn_size_7_a", "Press");
	} else if (HEALTH_ENABLED) {Instance.EntFireAtName("btn_health_15_a", "Press");
	}
});
Instance.OnScriptInput("other_button_8", () => {
	if (SIZE_ENABLED) { Instance.EntFireAtName("btn_size_8_a", "Press");
	} else if (HEALTH_ENABLED) {Instance.EntFireAtName("btn_health_20_a", "Press");
	}
});
Instance.OnScriptInput("other_button_9", () => {
	if (SIZE_ENABLED) { Instance.EntFireAtName("btn_size_9_a", "Press");
	} else if (HEALTH_ENABLED) {Instance.EntFireAtName("btn_health_30_a", "Press");
	}
});
Instance.OnScriptInput("other_button_10", () => {
	if (SIZE_ENABLED) { Instance.EntFireAtName("btn_size_10_a", "Press");
	} else if (HEALTH_ENABLED) {Instance.EntFireAtName("btn_health_infinite_a", "Press");
	}
});
Instance.OnScriptInput("other_button_11", () => {
	if (SIZE_ENABLED) { Instance.EntFireAtName("btn_size_11_a", "Press");
	}
});
Instance.OnScriptInput("other_button_12", () => {
	if (SIZE_ENABLED) { Instance.EntFireAtName("btn_size_12_a", "Press");
	}
});
Instance.OnScriptInput("other_button_13", () => {
	if (SIZE_ENABLED) { Instance.EntFireAtName("btn_size_13_a", "Press");
	}
});
Instance.OnScriptInput("other_button_14", () => {
	if (SIZE_ENABLED) { Instance.EntFireAtName("btn_size_14_a", "Press");
	}
});
Instance.OnScriptInput("other_button_15", () => {
	if (SIZE_ENABLED) { Instance.EntFireAtName("btn_size_15_a", "Press");
	}
});
Instance.OnScriptInput("other_button_16", () => {
	if (SIZE_ENABLED) { Instance.EntFireAtName("btn_size_random_a", "Press");
	}
});
Instance.OnScriptInput("other_button_17", () => {
});
Instance.OnScriptInput("other_button_18", () => {
});
Instance.OnScriptInput("other_button_19", () => {
});
Instance.OnScriptInput("other_button_20", () => {
});
// ---------------------------------------------------------------------------------------

// MOVE BUTTONS
Instance.OnScriptInput("move_button_1", () => {
	if (HORIZONTAL_DISTANCE_ENABLED) { Instance.EntFireAtName("horizontal_distance_50_a", "Press");
	} else if (HORIZONTAL_SPEED_ENABLED) {Instance.EntFireAtName("horizontal_speed_10_a", "Press");
	} else if (VERTICAL_DISTANCE_ENABLED) {Instance.EntFireAtName("vertical_distance_50_a", "Press");
	} else if (VERTICAL_SPEED_ENABLED) {Instance.EntFireAtName("vertical_speed_10_a", "Press");
	}
});
Instance.OnScriptInput("move_button_2", () => {
	if (HORIZONTAL_DISTANCE_ENABLED) { Instance.EntFireAtName("horizontal_distance_60_a", "Press");
	} else if (HORIZONTAL_SPEED_ENABLED) {Instance.EntFireAtName("horizontal_speed_20_a", "Press");
	} else if (VERTICAL_DISTANCE_ENABLED) {Instance.EntFireAtName("vertical_distance_60_a", "Press");
	} else if (VERTICAL_SPEED_ENABLED) {Instance.EntFireAtName("vertical_speed_20_a", "Press");
	}
});
Instance.OnScriptInput("move_button_3", () => {
	if (HORIZONTAL_DISTANCE_ENABLED) { Instance.EntFireAtName("horizontal_distance_70_a", "Press");
	} else if (HORIZONTAL_SPEED_ENABLED) {Instance.EntFireAtName("horizontal_speed_30_a", "Press");
	} else if (VERTICAL_DISTANCE_ENABLED) {Instance.EntFireAtName("vertical_distance_70_a", "Press");
	} else if (VERTICAL_SPEED_ENABLED) {Instance.EntFireAtName("vertical_speed_30_a", "Press");
	}
});
Instance.OnScriptInput("move_button_4", () => {
	if (HORIZONTAL_DISTANCE_ENABLED) { Instance.EntFireAtName("horizontal_distance_80_a", "Press");
	} else if (HORIZONTAL_SPEED_ENABLED) {Instance.EntFireAtName("horizontal_speed_40_a", "Press");
	} else if (VERTICAL_DISTANCE_ENABLED) {Instance.EntFireAtName("vertical_distance_80_a", "Press");
	} else if (VERTICAL_SPEED_ENABLED) {Instance.EntFireAtName("vertical_speed_40_a", "Press");
	}
});
Instance.OnScriptInput("move_button_5", () => {
	if (HORIZONTAL_DISTANCE_ENABLED) { Instance.EntFireAtName("horizontal_distance_90_a", "Press");
	} else if (HORIZONTAL_SPEED_ENABLED) {Instance.EntFireAtName("horizontal_speed_50_a", "Press");
	} else if (VERTICAL_DISTANCE_ENABLED) {Instance.EntFireAtName("vertical_distance_90_a", "Press");
	} else if (VERTICAL_SPEED_ENABLED) {Instance.EntFireAtName("vertical_speed_50_a", "Press");
	}
});
Instance.OnScriptInput("move_button_6", () => {
	if (HORIZONTAL_DISTANCE_ENABLED) { Instance.EntFireAtName("horizontal_distance_100_a", "Press");
	} else if (HORIZONTAL_SPEED_ENABLED) {Instance.EntFireAtName("horizontal_speed_80_a", "Press");
	} else if (VERTICAL_DISTANCE_ENABLED) {Instance.EntFireAtName("vertical_distance_100_a", "Press");
	} else if (VERTICAL_SPEED_ENABLED) {Instance.EntFireAtName("vertical_speed_80_a", "Press");
	}
});
Instance.OnScriptInput("move_button_7", () => {
	if (HORIZONTAL_DISTANCE_ENABLED) { Instance.EntFireAtName("horizontal_distance_125_a", "Press");
	} else if (HORIZONTAL_SPEED_ENABLED) {Instance.EntFireAtName("horizontal_speed_95_a", "Press");
	} else if (VERTICAL_DISTANCE_ENABLED) {Instance.EntFireAtName("vertical_distance_125_a", "Press");
	} else if (VERTICAL_SPEED_ENABLED) {Instance.EntFireAtName("vertical_speed_95_a", "Press");
	}
});
Instance.OnScriptInput("move_button_8", () => {
	if (HORIZONTAL_DISTANCE_ENABLED) { Instance.EntFireAtName("horizontal_distance_150_a", "Press");
	} else if (HORIZONTAL_SPEED_ENABLED) {Instance.EntFireAtName("horizontal_speed_110_a", "Press");
	} else if (VERTICAL_DISTANCE_ENABLED) {Instance.EntFireAtName("vertical_distance_150_a", "Press");
	} else if (VERTICAL_SPEED_ENABLED) {Instance.EntFireAtName("vertical_speed_110_a", "Press");
	}
});
Instance.OnScriptInput("move_button_9", () => {
	if (HORIZONTAL_DISTANCE_ENABLED) { Instance.EntFireAtName("horizontal_distance_200_a", "Press");
	} else if (HORIZONTAL_SPEED_ENABLED) {Instance.EntFireAtName("horizontal_speed_125_a", "Press");
	} else if (VERTICAL_DISTANCE_ENABLED) {Instance.EntFireAtName("vertical_distance_200_a", "Press");
	} else if (VERTICAL_SPEED_ENABLED) {Instance.EntFireAtName("vertical_speed_125_a", "Press");
	}
});
Instance.OnScriptInput("move_button_10", () => {
	if (HORIZONTAL_DISTANCE_ENABLED) { Instance.EntFireAtName("horizontal_distance_full_a", "Press");
	} else if (HORIZONTAL_SPEED_ENABLED) {Instance.EntFireAtName("horizontal_speed_140_a", "Press");
	} else if (VERTICAL_DISTANCE_ENABLED) {Instance.EntFireAtName("vertical_distance_full_a", "Press");
	} else if (VERTICAL_SPEED_ENABLED) {Instance.EntFireAtName("vertical_speed_140_a", "Press");
	}
});
Instance.OnScriptInput("move_button_11", () => {
	if (HORIZONTAL_SPEED_ENABLED) {Instance.EntFireAtName("horizontal_speed_155_a", "Press");
	} else if (VERTICAL_SPEED_ENABLED) {Instance.EntFireAtName("vertical_speed_155_a", "Press");
	}
});
Instance.OnScriptInput("move_button_12", () => {
	if (HORIZONTAL_SPEED_ENABLED) {Instance.EntFireAtName("horizontal_speed_170_a", "Press");
	} else if (VERTICAL_SPEED_ENABLED) {Instance.EntFireAtName("vertical_speed_170_a", "Press");
	}
});
Instance.OnScriptInput("move_button_13", () => {
	if (HORIZONTAL_SPEED_ENABLED) {Instance.EntFireAtName("horizontal_speed_185_a", "Press");
	} else if (VERTICAL_SPEED_ENABLED) {Instance.EntFireAtName("vertical_speed_185_a", "Press");
	}
});
Instance.OnScriptInput("move_button_14", () => {
	if (HORIZONTAL_SPEED_ENABLED) {Instance.EntFireAtName("horizontal_speed_200_a", "Press");
	} else if (VERTICAL_SPEED_ENABLED) {Instance.EntFireAtName("vertical_speed_200_a", "Press");
	}
});
Instance.OnScriptInput("move_button_15", () => {
	if (HORIZONTAL_SPEED_ENABLED) {Instance.EntFireAtName("horizontal_speed_215_a", "Press");
	} else if (VERTICAL_SPEED_ENABLED) {Instance.EntFireAtName("vertical_speed_215_a", "Press");
	}
});
Instance.OnScriptInput("move_button_16", () => {
});
Instance.OnScriptInput("move_button_17", () => {
});
Instance.OnScriptInput("move_button_18", () => {
});
Instance.OnScriptInput("move_button_19", () => {
});
Instance.OnScriptInput("move_button_20", () => {
});
// ---------------------------------------------------------------------------------------

function setAllMainFalse () {
	ADD_TARGET_ENABLED = false;
	SPAWN_TIME_ENABLED = false;
	DURATION_ENABLED = false;
	MISC_ENABLED = false;
}

function setAllMoveFalse () {
	HORIZONTAL_DISTANCE_ENABLED = false;
	HORIZONTAL_SPEED_ENABLED = false;
	VERTICAL_DISTANCE_ENABLED = false;
	VERTICAL_SPEED_ENABLED = false;
}

function setAllOtherFalse () {
	SIZE_ENABLED = false;
	HEALTH_ENABLED = false;
	AREA_ENABLED = false;
	SOUND_ENABLED = false;
}

///MAIN
Instance.OnScriptInput("add_target_enabled", () => { setAllMainFalse(); ADD_TARGET_ENABLED = true;
});

Instance.OnScriptInput("spawn_time_enabled", () => { setAllMainFalse(); SPAWN_TIME_ENABLED = true;
});

Instance.OnScriptInput("duration_enabled", () => { setAllMainFalse(); DURATION_ENABLED = true;
});

Instance.OnScriptInput("misc_enabled", () => { setAllMainFalse(); MISC_ENABLED = true;
});
///-----------------------------------------------------------------------------------------

///OTHER
Instance.OnScriptInput("size_enabled", () => { setAllOtherFalse(); SIZE_ENABLED = true;
});

Instance.OnScriptInput("health_enabled", () => { setAllOtherFalse(); HEALTH_ENABLED = true;
});

Instance.OnScriptInput("area_enabled", () => { setAllOtherFalse(); AREA_ENABLED = true;
});

Instance.OnScriptInput("sound_enabled", () => { setAllOtherFalse(); SOUND_ENABLED = true;
});
///-----------------------------------------------------------------------------------------

///MOVE
Instance.OnScriptInput("horizontal_distance_enabled", () => { setAllMoveFalse(); HORIZONTAL_DISTANCE_ENABLED = true;
});

Instance.OnScriptInput("horizontal_speed_enabled", () => { setAllMoveFalse(); HORIZONTAL_SPEED_ENABLED = true;
});

Instance.OnScriptInput("vertical_distance_enabled", () => { setAllMoveFalse(); VERTICAL_DISTANCE_ENABLED = true;
});

Instance.OnScriptInput("vertical_speed_enabled", () => { setAllMoveFalse(); VERTICAL_SPEED_ENABLED = true;
});
///----


Instance.OnScriptInput("random_size_enabled", () => { RANDOM_SIZE_ENABLED = true;
});

Instance.OnScriptInput("random_size_disabled", () => { RANDOM_SIZE_ENABLED = false;
});

//called for every target when choosing setting
for (let i = 1; i <= 15; ++i) {
    const inputName = "target_scale_" + i;
    ((val, name) => {
        Instance.OnScriptInput(name, (_ctx) => {
			let scale = 1 + (val*0.25) - 0.25;
			for (let i = 1; i <= 20; i++) {
				let target = Instance.FindEntityByName("a_target_" + i);
				if (!target) continue;
				target.SetModelScale(scale);
				
				let trackingHealth = Instance.FindEntityByName("target_" + i + "_health_a");
				if (!trackingHealth) continue;
				trackingHealth = trackingHealth.GetEntityName();
				//trackingHealth.SetModelScale(1);
				//Instance.EntFireAtName("servercommand", "Command", `ent_fire ${trackingHealth} setscale`, 0.3);*/
				Instance.EntFireAtName(trackingHealth, "setscale", 1);
			}
			//Debug(scale);
        });
    })(i, inputName);
}
//called when target is teleported
for (let i = 1; i <= 20; ++i) {
    const inputName = "resize_target_" + i;
    ((val, name) => {
        Instance.OnScriptInput(name, (_ctx) => {
			if (RANDOM_SIZE_ENABLED) {
				let randomSize = Math.floor(Math.random() * 15) + 1;
			
				let scale = 1 + (randomSize*0.25) - 0.25;
				let target = Instance.FindEntityByName("a_target_" + val);
				if (!target) return;
				target.SetModelScale(scale);
				
				let trackingHealth = Instance.FindEntityByName("target_" + val + "_health_a");
				if (!trackingHealth) return;
				trackingHealth = trackingHealth.GetEntityName();
				Instance.EntFireAtName(trackingHealth, "setscale", 1);
			}
        });
    })(i, inputName);
}

//resize all at once when random setting button is pressed
Instance.OnScriptInput("resize_targets", () => {
	for (let i = 1; i <= 20; ++i) {
		let randomSize = Math.floor(Math.random() * 15) + 1;

		let scale = 1 + (randomSize*0.25) - 0.25;
		let target = Instance.FindEntityByName("a_target_" + i);
		if (!target) return;
		target.SetModelScale(scale);
		
		let trackingHealth = Instance.FindEntityByName("target_" + i + "_health_a");
		if (!trackingHealth) return;
		trackingHealth = trackingHealth.GetEntityName();
		Instance.EntFireAtName(trackingHealth, "setscale", 1);
	}
});

Instance.OnRoundStart(() => {
	//main
	ADD_TARGET_ENABLED = true;
	SPAWN_TIME_ENABLED = false;
	DURATION_ENABLED = false;
	MISC_ENABLED = false;
	//other
	SIZE_ENABLED = true;
	HEALTH_ENABLED = false;
	AREA_ENABLED = false;
	SOUND_ENABLED = false;
	//move
	HORIZONTAL_DISTANCE_ENABLED = true;
	HORIZONTAL_SPEED_ENABLED = false;
	VERTICAL_DISTANCE_ENABLED = false;
	VERTICAL_SPEED_ENABLED = false;
	
	RANDOM_SIZE_ENABLED = false;
	
});

function Debug(msg) { Instance.Msg(msg + "\n"); }

Debug("OTHER STUFF (BALL) SCRIPT EXECUTED");
