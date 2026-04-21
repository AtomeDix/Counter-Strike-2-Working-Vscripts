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

// MAIN BUTTONS
Instance.OnScriptInput("main_button_1", () => {
	if (ADD_TARGET_ENABLED) { Instance.EntFireAtName("button_add_target_1", "Press");
	} else if (SPAWN_TIME_ENABLED) {Instance.EntFireAtName("btn_spawn_000", "Press");
	} else if (DURATION_ENABLED) {Instance.EntFireAtName("btn_duration_030", "Press");
	} else if (MISC_ENABLED) {Instance.EntFireAtName("button_drawparticles_1", "Press");
	}
});
Instance.OnScriptInput("main_button_2", () => {
	if (ADD_TARGET_ENABLED) { Instance.EntFireAtName("button_add_target_2", "Press");
	} else if (SPAWN_TIME_ENABLED) {Instance.EntFireAtName("btn_spawn_025", "Press");
	} else if (DURATION_ENABLED) {Instance.EntFireAtName("btn_duration_035", "Press");
	} else if (MISC_ENABLED) {Instance.EntFireAtName("button_noaimpunch_1", "Press");
	}
});
Instance.OnScriptInput("main_button_3", () => {
	if (ADD_TARGET_ENABLED) { Instance.EntFireAtName("button_add_target_3", "Press");
	} else if (SPAWN_TIME_ENABLED) {Instance.EntFireAtName("btn_spawn_030", "Press");
	} else if (DURATION_ENABLED) {Instance.EntFireAtName("btn_duration_040", "Press");
	} else if (MISC_ENABLED) {Instance.EntFireAtName("button_nospread_1", "Press");
	}
});
Instance.OnScriptInput("main_button_4", () => {
	if (ADD_TARGET_ENABLED) { Instance.EntFireAtName("button_add_target_4", "Press");
	} else if (SPAWN_TIME_ENABLED) {Instance.EntFireAtName("btn_spawn_035", "Press");
	} else if (DURATION_ENABLED) {Instance.EntFireAtName("btn_duration_045", "Press");
	} else if (MISC_ENABLED) {Instance.EntFireAtName("button_noviewmodel_1", "Press");
	}
});
Instance.OnScriptInput("main_button_5", () => {
	if (ADD_TARGET_ENABLED) { Instance.EntFireAtName("button_add_target_5", "Press");
	} else if (SPAWN_TIME_ENABLED) {Instance.EntFireAtName("btn_spawn_040", "Press");
	} else if (DURATION_ENABLED) {Instance.EntFireAtName("btn_duration_050", "Press");
	} else if (MISC_ENABLED) {Instance.EntFireAtName("button_showimpact_1", "Press");
	}
});
Instance.OnScriptInput("main_button_6", () => {
	if (ADD_TARGET_ENABLED) { Instance.EntFireAtName("button_add_target_6", "Press");
	} else if (SPAWN_TIME_ENABLED) {Instance.EntFireAtName("btn_spawn_045", "Press");
	} else if (DURATION_ENABLED) {Instance.EntFireAtName("btn_duration_055", "Press");
	}
});
Instance.OnScriptInput("main_button_7", () => {
	if (ADD_TARGET_ENABLED) { Instance.EntFireAtName("button_add_target_7", "Press");
	} else if (SPAWN_TIME_ENABLED) {Instance.EntFireAtName("btn_spawn_050", "Press");
	} else if (DURATION_ENABLED) {Instance.EntFireAtName("btn_duration_060", "Press");
	}
});
Instance.OnScriptInput("main_button_8", () => {
	if (ADD_TARGET_ENABLED) { Instance.EntFireAtName("button_add_target_8", "Press");
	} else if (SPAWN_TIME_ENABLED) {Instance.EntFireAtName("btn_spawn_055", "Press");
	} else if (DURATION_ENABLED) {Instance.EntFireAtName("btn_duration_065", "Press");
	}
});
Instance.OnScriptInput("main_button_9", () => {
	if (ADD_TARGET_ENABLED) { Instance.EntFireAtName("button_add_target_9", "Press");
	} else if (SPAWN_TIME_ENABLED) {Instance.EntFireAtName("btn_spawn_060", "Press");
	} else if (DURATION_ENABLED) {Instance.EntFireAtName("btn_duration_075", "Press");
	}
});
Instance.OnScriptInput("main_button_10", () => {
	if (ADD_TARGET_ENABLED) { Instance.EntFireAtName("button_add_target_10", "Press");
	} else if (SPAWN_TIME_ENABLED) {Instance.EntFireAtName("btn_spawn_065", "Press");
	} else if (DURATION_ENABLED) {Instance.EntFireAtName("btn_duration_100", "Press");
	}
});
Instance.OnScriptInput("main_button_11", () => {
	if (ADD_TARGET_ENABLED) { Instance.EntFireAtName("button_add_target_11", "Press");
	} else if (SPAWN_TIME_ENABLED) {Instance.EntFireAtName("btn_spawn_070", "Press");
	} else if (DURATION_ENABLED) {Instance.EntFireAtName("btn_duration_125", "Press");
	}
});
Instance.OnScriptInput("main_button_12", () => {
	if (ADD_TARGET_ENABLED) { Instance.EntFireAtName("button_add_target_12", "Press");
	} else if (SPAWN_TIME_ENABLED) {Instance.EntFireAtName("btn_spawn_075", "Press");
	} else if (DURATION_ENABLED) {Instance.EntFireAtName("btn_duration_150", "Press");
	}
});
Instance.OnScriptInput("main_button_13", () => {
	if (ADD_TARGET_ENABLED) { Instance.EntFireAtName("button_add_target_13", "Press");
	} else if (SPAWN_TIME_ENABLED) {Instance.EntFireAtName("btn_spawn_100", "Press");
	} else if (DURATION_ENABLED) {Instance.EntFireAtName("btn_duration_175", "Press");
	}
});
Instance.OnScriptInput("main_button_14", () => {
	if (ADD_TARGET_ENABLED) { Instance.EntFireAtName("button_add_target_14", "Press");
	} else if (SPAWN_TIME_ENABLED) {Instance.EntFireAtName("btn_spawn_200", "Press");
	} else if (DURATION_ENABLED) {Instance.EntFireAtName("btn_duration_200", "Press");
	}
});
Instance.OnScriptInput("main_button_15", () => {
	if (ADD_TARGET_ENABLED) { Instance.EntFireAtName("button_add_target_15", "Press");
	} else if (SPAWN_TIME_ENABLED) {Instance.EntFireAtName("btn_spawn_250", "Press");
	} else if (DURATION_ENABLED) {Instance.EntFireAtName("btn_duration_infinite", "Press");
	}
});
Instance.OnScriptInput("main_button_16", () => {
	if (ADD_TARGET_ENABLED) { Instance.EntFireAtName("button_add_target_16", "Press");
	}
});
Instance.OnScriptInput("main_button_17", () => {
	if (ADD_TARGET_ENABLED) { Instance.EntFireAtName("button_add_target_17", "Press");
	}
});
Instance.OnScriptInput("main_button_18", () => {
	if (ADD_TARGET_ENABLED) { Instance.EntFireAtName("button_add_target_18", "Press");
	}
});
Instance.OnScriptInput("main_button_19", () => {
	if (ADD_TARGET_ENABLED) { Instance.EntFireAtName("button_add_target_19", "Press");
	}
});
Instance.OnScriptInput("main_button_20", () => {
	if (ADD_TARGET_ENABLED) { Instance.EntFireAtName("button_add_target_20", "Press");
	}
});
// ---------------------------------------------------------------------------------------

// OTHER BUTTONS
Instance.OnScriptInput("other_button_1", () => {
	if (SIZE_ENABLED) { Instance.EntFireAtName("btn_size_1", "Press");
	} else if (HEALTH_ENABLED) {Instance.EntFireAtName("btn_health_1", "Press");
	} else if (AREA_ENABLED) {Instance.EntFireAtName("btn_area_small", "Press");
	} else if (SOUND_ENABLED) {Instance.EntFireAtName("button_sound_1_w", "Press");
	}
});
Instance.OnScriptInput("other_button_2", () => {
	if (SIZE_ENABLED) { Instance.EntFireAtName("btn_size_2", "Press");
	} else if (HEALTH_ENABLED) {Instance.EntFireAtName("btn_health_2", "Press");
	} else if (AREA_ENABLED) {Instance.EntFireAtName("btn_area_wide", "Press");
	} else if (SOUND_ENABLED) {Instance.EntFireAtName("button_sound_2_w", "Press");
	}
});
Instance.OnScriptInput("other_button_3", () => {
	if (SIZE_ENABLED) { Instance.EntFireAtName("btn_size_3", "Press");
	} else if (HEALTH_ENABLED) {Instance.EntFireAtName("btn_health_3", "Press");
	} else if (SOUND_ENABLED) {Instance.EntFireAtName("button_sound_3_w", "Press");
	}
});
Instance.OnScriptInput("other_button_4", () => {
	if (SIZE_ENABLED) { Instance.EntFireAtName("btn_size_4", "Press");
	} else if (HEALTH_ENABLED) {Instance.EntFireAtName("btn_health_4", "Press");
	} else if (SOUND_ENABLED) {Instance.EntFireAtName("button_sound_4_w", "Press");
	}
});
Instance.OnScriptInput("other_button_5", () => {
	if (SIZE_ENABLED) { Instance.EntFireAtName("btn_size_5", "Press");
	} else if (HEALTH_ENABLED) {Instance.EntFireAtName("btn_health_5", "Press");
	} else if (SOUND_ENABLED) {Instance.EntFireAtName("button_sound_5_w", "Press");
	}
});
Instance.OnScriptInput("other_button_6", () => {
	if (SIZE_ENABLED) { Instance.EntFireAtName("btn_size_6", "Press");
	} else if (HEALTH_ENABLED) {Instance.EntFireAtName("btn_health_10", "Press");
	} else if (SOUND_ENABLED) {Instance.EntFireAtName("button_sound_6_w", "Press");
	}
});
Instance.OnScriptInput("other_button_7", () => {
	if (SIZE_ENABLED) { Instance.EntFireAtName("btn_size_7", "Press");
	} else if (HEALTH_ENABLED) {Instance.EntFireAtName("btn_health_15", "Press");
	}
});
Instance.OnScriptInput("other_button_8", () => {
	if (SIZE_ENABLED) { Instance.EntFireAtName("btn_size_8", "Press");
	} else if (HEALTH_ENABLED) {Instance.EntFireAtName("btn_health_20", "Press");
	}
});
Instance.OnScriptInput("other_button_9", () => {
	if (SIZE_ENABLED) { Instance.EntFireAtName("btn_size_9", "Press");
	} else if (HEALTH_ENABLED) {Instance.EntFireAtName("btn_health_30", "Press");
	}
});
Instance.OnScriptInput("other_button_10", () => {
	if (SIZE_ENABLED) { Instance.EntFireAtName("btn_size_10", "Press");
	} else if (HEALTH_ENABLED) {Instance.EntFireAtName("btn_health_infinite", "Press");
	}
});
Instance.OnScriptInput("other_button_11", () => {
	if (SIZE_ENABLED) { Instance.EntFireAtName("btn_size_11", "Press");
	}
});
Instance.OnScriptInput("other_button_12", () => {
	if (SIZE_ENABLED) { Instance.EntFireAtName("btn_size_12", "Press");
	}
});
Instance.OnScriptInput("other_button_13", () => {
	if (SIZE_ENABLED) { Instance.EntFireAtName("btn_size_13", "Press");
	}
});
Instance.OnScriptInput("other_button_14", () => {
	if (SIZE_ENABLED) { Instance.EntFireAtName("btn_size_random", "Press");
	}
});
Instance.OnScriptInput("other_button_15", () => {
});
Instance.OnScriptInput("other_button_16", () => {
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
	if (HORIZONTAL_DISTANCE_ENABLED) { Instance.EntFireAtName("horizontal_distance_50", "Press");
	} else if (HORIZONTAL_SPEED_ENABLED) {Instance.EntFireAtName("horizontal_speed_10", "Press");
	} else if (VERTICAL_DISTANCE_ENABLED) {Instance.EntFireAtName("vertical_distance_50", "Press");
	} else if (VERTICAL_SPEED_ENABLED) {Instance.EntFireAtName("vertical_speed_10", "Press");
	}
});
Instance.OnScriptInput("move_button_2", () => {
	if (HORIZONTAL_DISTANCE_ENABLED) { Instance.EntFireAtName("horizontal_distance_60", "Press");
	} else if (HORIZONTAL_SPEED_ENABLED) {Instance.EntFireAtName("horizontal_speed_20", "Press");
	} else if (VERTICAL_DISTANCE_ENABLED) {Instance.EntFireAtName("vertical_distance_60", "Press");
	} else if (VERTICAL_SPEED_ENABLED) {Instance.EntFireAtName("vertical_speed_20", "Press");
	}
});
Instance.OnScriptInput("move_button_3", () => {
	if (HORIZONTAL_DISTANCE_ENABLED) { Instance.EntFireAtName("horizontal_distance_70", "Press");
	} else if (HORIZONTAL_SPEED_ENABLED) {Instance.EntFireAtName("horizontal_speed_30", "Press");
	} else if (VERTICAL_DISTANCE_ENABLED) {Instance.EntFireAtName("vertical_distance_70", "Press");
	} else if (VERTICAL_SPEED_ENABLED) {Instance.EntFireAtName("vertical_speed_30", "Press");
	}
});
Instance.OnScriptInput("move_button_4", () => {
	if (HORIZONTAL_DISTANCE_ENABLED) { Instance.EntFireAtName("horizontal_distance_80", "Press");
	} else if (HORIZONTAL_SPEED_ENABLED) {Instance.EntFireAtName("horizontal_speed_40", "Press");
	} else if (VERTICAL_DISTANCE_ENABLED) {Instance.EntFireAtName("vertical_distance_80", "Press");
	} else if (VERTICAL_SPEED_ENABLED) {Instance.EntFireAtName("vertical_speed_40", "Press");
	}
});
Instance.OnScriptInput("move_button_5", () => {
	if (HORIZONTAL_DISTANCE_ENABLED) { Instance.EntFireAtName("horizontal_distance_90", "Press");
	} else if (HORIZONTAL_SPEED_ENABLED) {Instance.EntFireAtName("horizontal_speed_50", "Press");
	} else if (VERTICAL_DISTANCE_ENABLED) {Instance.EntFireAtName("vertical_distance_90", "Press");
	} else if (VERTICAL_SPEED_ENABLED) {Instance.EntFireAtName("vertical_speed_50", "Press");
	}
});
Instance.OnScriptInput("move_button_6", () => {
	if (HORIZONTAL_DISTANCE_ENABLED) { Instance.EntFireAtName("horizontal_distance_100", "Press");
	} else if (HORIZONTAL_SPEED_ENABLED) {Instance.EntFireAtName("horizontal_speed_80", "Press");
	} else if (VERTICAL_DISTANCE_ENABLED) {Instance.EntFireAtName("vertical_distance_100", "Press");
	} else if (VERTICAL_SPEED_ENABLED) {Instance.EntFireAtName("vertical_speed_80", "Press");
	}
});
Instance.OnScriptInput("move_button_7", () => {
	if (HORIZONTAL_DISTANCE_ENABLED) { Instance.EntFireAtName("horizontal_distance_125", "Press");
	} else if (HORIZONTAL_SPEED_ENABLED) {Instance.EntFireAtName("horizontal_speed_95", "Press");
	} else if (VERTICAL_DISTANCE_ENABLED) {Instance.EntFireAtName("vertical_distance_125", "Press");
	} else if (VERTICAL_SPEED_ENABLED) {Instance.EntFireAtName("vertical_speed_95", "Press");
	}
});
Instance.OnScriptInput("move_button_8", () => {
	if (HORIZONTAL_DISTANCE_ENABLED) { Instance.EntFireAtName("horizontal_distance_150", "Press");
	} else if (HORIZONTAL_SPEED_ENABLED) {Instance.EntFireAtName("horizontal_speed_110", "Press");
	} else if (VERTICAL_DISTANCE_ENABLED) {Instance.EntFireAtName("vertical_distance_150", "Press");
	} else if (VERTICAL_SPEED_ENABLED) {Instance.EntFireAtName("vertical_speed_110", "Press");
	}
});
Instance.OnScriptInput("move_button_9", () => {
	if (HORIZONTAL_DISTANCE_ENABLED) { Instance.EntFireAtName("horizontal_distance_200", "Press");
	} else if (HORIZONTAL_SPEED_ENABLED) {Instance.EntFireAtName("horizontal_speed_125", "Press");
	} else if (VERTICAL_DISTANCE_ENABLED) {Instance.EntFireAtName("vertical_distance_200", "Press");
	} else if (VERTICAL_SPEED_ENABLED) {Instance.EntFireAtName("vertical_speed_125", "Press");
	}
});
Instance.OnScriptInput("move_button_10", () => {
	if (HORIZONTAL_DISTANCE_ENABLED) { Instance.EntFireAtName("horizontal_distance_full", "Press");
	} else if (HORIZONTAL_SPEED_ENABLED) {Instance.EntFireAtName("horizontal_speed_140", "Press");
	} else if (VERTICAL_DISTANCE_ENABLED) {Instance.EntFireAtName("vertical_distance_full", "Press");
	} else if (VERTICAL_SPEED_ENABLED) {Instance.EntFireAtName("vertical_speed_140", "Press");
	}
});
Instance.OnScriptInput("move_button_11", () => {
	if (HORIZONTAL_SPEED_ENABLED) {Instance.EntFireAtName("horizontal_speed_155", "Press");
	} else if (VERTICAL_SPEED_ENABLED) {Instance.EntFireAtName("vertical_speed_155", "Press");
	}
});
Instance.OnScriptInput("move_button_12", () => {
	if (HORIZONTAL_SPEED_ENABLED) {Instance.EntFireAtName("horizontal_speed_170", "Press");
	} else if (VERTICAL_SPEED_ENABLED) {Instance.EntFireAtName("vertical_speed_170", "Press");
	}
});
Instance.OnScriptInput("move_button_13", () => {
	if (HORIZONTAL_SPEED_ENABLED) {Instance.EntFireAtName("horizontal_speed_185", "Press");
	} else if (VERTICAL_SPEED_ENABLED) {Instance.EntFireAtName("vertical_speed_185", "Press");
	}
});
Instance.OnScriptInput("move_button_14", () => {
	if (HORIZONTAL_SPEED_ENABLED) {Instance.EntFireAtName("horizontal_speed_200", "Press");
	} else if (VERTICAL_SPEED_ENABLED) {Instance.EntFireAtName("vertical_speed_200", "Press");
	}
});
Instance.OnScriptInput("move_button_15", () => {
	if (HORIZONTAL_SPEED_ENABLED) {Instance.EntFireAtName("horizontal_speed_215", "Press");
	} else if (VERTICAL_SPEED_ENABLED) {Instance.EntFireAtName("vertical_speed_215", "Press");
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
	
});

function Debug(msg) { Instance.Msg(msg + "\n"); }

Debug("OTHER STUFF (FLAT) SCRIPT EXECUTED");
