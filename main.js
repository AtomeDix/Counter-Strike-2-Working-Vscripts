import { Instance } from "cs_script/point_script";

var SPEED_SPACING = 1.15;
var SPEED_SCALE   = 0.02;
var SPEED_Y       = -5.0;
var speedLastSpeed = 0;
var speedDisplayColor = { r: 255, g: 255, b: 255 };
var speedColorHoldUntil = 0;

var TIMER_SPACING  = 1.2;
var TIMER_SCALE    = 0.014;
var TIMER_Y        = -30.0;

var TIMER_SLOTS = [
  { name: "timer_digit_0", type: "digit", w: TIMER_SPACING },
  { name: "timer_colon_0", type: "sep",   w: 0.4 },
  { name: "timer_digit_1", type: "digit", w: TIMER_SPACING },
  { name: "timer_digit_2", type: "digit", w: TIMER_SPACING },
  { name: "timer_colon_1", type: "sep",   w: 0.4 },
  { name: "timer_digit_3", type: "digit", w: TIMER_SPACING },
  { name: "timer_digit_4", type: "digit", w: TIMER_SPACING },
  { name: "timer_dot_0",   type: "dot",   w: 0.3 },
  { name: "timer_digit_5", type: "digit", w: TIMER_SPACING },
  { name: "timer_digit_6", type: "digit", w: TIMER_SPACING }
];

function fireCP(name, cp, x, y, z) {
  Instance.EntFireAtName({
    name: name,
    input: "setcontrolpoint",
    value: cp + ": " + x + " " + y + " " + z
  });
}

function fireColor(name, r, g, b) {
  Instance.EntFireAtName({
    name: name,
    input: "setcolortint",
    value: { r: r, g: g, b: b, a: 255 }
  });
}

function fireAlpha(name, a) {
  Instance.EntFireAtName({ name: name, input: "setalphascale", value: a });
}

function fireAlphaD(name, a, d) {
  Instance.EntFireAtName({ name: name, input: "setalphascale", value: a, delay: d });
}

// Spritesheet frame mapping
// A-Z=0-25, 0-9=26-35, !=36, .=37, :=38, _=39, (=40, )=41
// Each real frame at index*2 due to blank spacers
function digitFrame(d) { return (26 + d) * 2; }
var COLON_FRAME = 76;  // 38*2
var DOT_FRAME   = 74;  // 37*2
var PAREN_L_FRAME = 80; // 40*2
var PAREN_R_FRAME = 82; // 41*2

// ── Hoisted constants: avoid per-tick allocations ──
var MOVEMENT_MODES = { gamemode_kz: true, gamemode_surf: true, gamemode_bhop: true };
var BOT_BUTTON_MODES = { gamemode_static: true, gamemode_dynamic: true, gamemode_rush: true, gamemode_combat: true, gamemode_speed: true };
var DAMAGE_BUTTON_SET = new Set([
    "button_panel_unlock", "button_remove_bot", "button_add_bot",
    "prop_prefire_map_1", "prop_prefire_map_2", "prop_prefire_map_3",
    "prop_prefire_map_4", "prop_prefire_map_5", "prop_prefire_map_6",
    "prop_prefire_map_7", "save_crosshair_button", "prop_reaction_time",
    "prop_surf_map_1", "prop_surf_map_2",
    "prop_bhop_map_1", "prop_bhop_map_2",
    "prop_kz_map_1", "prop_kz_map_2"
]);

// Speed display state cache
var speedCacheDigits = [-2, -2, -2, -2];
var speedCacheNumDigits = -1;
var speedCacheR = -1;
var speedCacheG = -1;
var speedCacheB = -1;

function resetSpeedCache() {
  speedCacheDigits = [-2, -2, -2, -2];
  speedCacheNumDigits = -1;
  speedCacheR = -1;
  speedCacheG = -1;
  speedCacheB = -1;
}

function renderSpeed(speed, r, g, b) {
  var str = Math.round(speed) + "";
  var numDigits = str.length;
  if (numDigits > 4) numDigits = 4;

  var layoutChanged = (numDigits !== speedCacheNumDigits);
  var colorChanged = (r !== speedCacheR || g !== speedCacheG || b !== speedCacheB);
  var fullRedraw = layoutChanged || colorChanged;

  if (fullRedraw) {
    speedCacheNumDigits = numDigits;
    speedCacheR = r;
    speedCacheG = g;
    speedCacheB = b;
    for (var i = 0; i < 4; i++) {
      var name = "speed_digit_" + i;
      if (i >= numDigits) {
        Instance.EntFireAtName({ name: name, input: "Stop" });
        speedCacheDigits[i] = -2;
      } else {
        var digit = parseInt(str[i]);
        var xPos = (i - (numDigits - 1) / 2) * SPEED_SPACING;
        fireCP(name, 32, digitFrame(digit), 0, 0);
        fireCP(name, 33, xPos, SPEED_Y, 0);
        fireCP(name, 34, SPEED_SCALE, 0, 0);
        fireAlpha(name, 0.5);
        fireColor(name, r, g, b);
        Instance.EntFireAtName({ name: name, input: "Start" });
        speedCacheDigits[i] = digit;
      }
    }
  } else {
    for (var i = 0; i < numDigits; i++) {
      var digit = parseInt(str[i]);
      if (digit !== speedCacheDigits[i]) {
        fireCP("speed_digit_" + i, 32, digitFrame(digit), 0, 0);
        speedCacheDigits[i] = digit;
      }
    }
  }
}

function hideSpeed() {
  for (var i = 0; i < 4; i++) {
    Instance.EntFireAtName({ name: "speed_digit_" + i, input: "Stop" });
  }
  resetSpeedCache();
}

// Timer state cache: only re-fire what actually changed
var timerLastValues = [-2, -2, -2, -2, -2, -2, -2, -2, -2, -2];
var timerLastFirstVisible = -1;
var timerLastColorR = -1;
var timerLastColorG = -1;
var timerLastColorB = -1;

function resetTimerCache() {
  timerLastValues = [-2, -2, -2, -2, -2, -2, -2, -2, -2, -2];
  timerLastFirstVisible = -1;
  timerLastColorR = -1;
  timerLastColorG = -1;
  timerLastColorB = -1;
}

function renderTimer(elapsed) {
  var totalCs = Math.floor(elapsed * 100);
  var cs = totalCs % 100;
  var totalSec = Math.floor(totalCs / 100);
  var sec = totalSec % 60;
  var totalMin = Math.floor(totalSec / 60);
  var min = totalMin % 60;
  var hr = Math.floor(totalMin / 60);
  if (hr > 9) hr = 9;

  var values = [
    hr, -1,
    Math.floor(min / 10), min % 10, -1,
    Math.floor(sec / 10), sec % 10, -1,
    Math.floor(cs / 10), cs % 10
  ];

  var firstVisible = 0;
  if (hr === 0) {
    firstVisible = 2;
    if (min === 0) {
      firstVisible = 5;
      if (sec < 10) {
        firstVisible = 6;
      }
    } else if (min < 10) {
      firstVisible = 3;
    }
  }

  // Check if layout or color changed
  var layoutChanged = (firstVisible !== timerLastFirstVisible);
  var colorChanged = (timerColorR !== timerLastColorR || timerColorG !== timerLastColorG || timerColorB !== timerLastColorB);
  var fullRedraw = layoutChanged || colorChanged;

  if (fullRedraw) {
    timerLastFirstVisible = firstVisible;
    timerLastColorR = timerColorR;
    timerLastColorG = timerColorG;
    timerLastColorB = timerColorB;

    var rawPositions = [];
    var cursor = 0;
    for (var i = firstVisible; i < TIMER_SLOTS.length; i++) {
      rawPositions.push(cursor);
      cursor = cursor + TIMER_SLOTS[i].w;
    }
    var totalWidth = cursor - TIMER_SLOTS[TIMER_SLOTS.length - 1].w;
    var centerOffset = totalWidth / 2;

    var visIdx = 0;
    for (var i = 0; i < TIMER_SLOTS.length; i++) {
      var slot = TIMER_SLOTS[i];
      if (i < firstVisible) {
        Instance.EntFireAtName({ name: slot.name, input: "Stop" });
      } else {
        var xPos = rawPositions[visIdx] - centerOffset;
        if (slot.type === "digit") {
          fireCP(slot.name, 32, digitFrame(values[i]), 0, 0);
          timerLastValues[i] = values[i];
        } else if (slot.type === "sep") {
          fireCP(slot.name, 32, COLON_FRAME, 0, 0);
        } else if (slot.type === "dot") {
          fireCP(slot.name, 32, DOT_FRAME, 0, 0);
        }
        fireCP(slot.name, 33, xPos, TIMER_Y, 0);
        fireCP(slot.name, 34, TIMER_SCALE, 0, 0);
        fireAlpha(slot.name, 1);
        applyTimerColor(slot.name);
        Instance.EntFireAtName({ name: slot.name, input: "Start" });
        visIdx++;
      }
    }
  } else {
    for (var i = firstVisible; i < TIMER_SLOTS.length; i++) {
      var slot = TIMER_SLOTS[i];
      if (slot.type === "digit" && values[i] !== timerLastValues[i]) {
        fireCP(slot.name, 32, digitFrame(values[i]), 0, 0);
        timerLastValues[i] = values[i];
      }
    }
  }
}

function hideTimer() {
  for (var i = 0; i < TIMER_SLOTS.length; i++) {
    Instance.EntFireAtName({ name: TIMER_SLOTS[i].name, input: "Stop" });
  }
  resetTimerCache();
}

var timerColorR = 0;
var timerColorG = 255;
var timerColorB = 0;

function setTimerColor(r, g, b) {
  timerColorR = r;
  timerColorG = g;
  timerColorB = b;
}

function applyTimerColor(name) {
  fireColor(name, timerColorR, timerColorG, timerColorB);
}

var KZ_SPEED_Y       = -12.0;
var KZ_SPEED_SPACING = 1.15;
var KZ_SPEED_SCALE   = 0.016;

var KZ_SPEED_SLOTS = [
  { name: "kz_speed_digit_0", type: "digit", w: KZ_SPEED_SPACING },
  { name: "kz_speed_digit_1", type: "digit", w: KZ_SPEED_SPACING },
  { name: "kz_speed_digit_2", type: "digit", w: KZ_SPEED_SPACING },
  { name: "kz_speed_dot_0",   type: "dot",   w: 0.3 },
  { name: "kz_speed_digit_3", type: "digit", w: KZ_SPEED_SPACING },
  { name: "kz_speed_digit_4", type: "digit", w: KZ_SPEED_SPACING }
];

// KZ speed state cache
var kzSpeedLastValues = [-2, -2, -2, -2, -2, -2];
var kzSpeedLastFirstVisible = -1;
var kzSpeedLastR = -1;
var kzSpeedLastG = -1;
var kzSpeedLastB = -1;

function resetKzSpeedCache() {
  kzSpeedLastValues = [-2, -2, -2, -2, -2, -2];
  kzSpeedLastFirstVisible = -1;
  kzSpeedLastR = -1;
  kzSpeedLastG = -1;
  kzSpeedLastB = -1;
}

function renderKzSpeed(speed, r, g, b) {
  // speed is raw velocity
  if (speed < 0) speed = 0;
  if (speed > 999.99) speed = 999.99;

  var hundredths = Math.floor(speed * 100);
  var whole = Math.floor(hundredths / 100);
  var frac = hundredths % 100;

  // d0 = hundreds, d1 = tens, d2 = ones, d3 = tenths, d4 = hundredths
  var d0 = Math.floor(whole / 100);
  var d1 = Math.floor((whole % 100) / 10);
  var d2 = whole % 10;
  var d3 = Math.floor(frac / 10);
  var d4 = frac % 10;

  var values = [d0, d1, d2, -1, d3, d4];

  // Hide leading zeros: find first visible slot
  var firstVisible = 2; // always show at least ones digit (slot 2)
  if (d1 > 0 || d0 > 0) firstVisible = 1;
  if (d0 > 0) firstVisible = 0;

  var layoutChanged = (firstVisible !== kzSpeedLastFirstVisible);
  var colorChanged = (r !== kzSpeedLastR || g !== kzSpeedLastG || b !== kzSpeedLastB);
  var fullRedraw = layoutChanged || colorChanged;

  if (fullRedraw) {
    kzSpeedLastFirstVisible = firstVisible;
    kzSpeedLastR = r;
    kzSpeedLastG = g;
    kzSpeedLastB = b;

    // Position visible slots
    var rawPositions = [];
    var cursor = 0;
    for (var i = firstVisible; i < KZ_SPEED_SLOTS.length; i++) {
      rawPositions.push(cursor);
      cursor = cursor + KZ_SPEED_SLOTS[i].w;
    }
    var totalWidth = cursor - KZ_SPEED_SLOTS[KZ_SPEED_SLOTS.length - 1].w;
    var centerOffset = totalWidth / 2;

    var visIdx = 0;
    for (var i = 0; i < KZ_SPEED_SLOTS.length; i++) {
      var slot = KZ_SPEED_SLOTS[i];
      if (i < firstVisible) {
        Instance.EntFireAtName({ name: slot.name, input: "Stop" });
      } else {
        var xPos = rawPositions[visIdx] - centerOffset;
        if (slot.type === "digit") {
          fireCP(slot.name, 32, digitFrame(values[i]), 0, 0);
          kzSpeedLastValues[i] = values[i];
        } else if (slot.type === "dot") {
          fireCP(slot.name, 32, DOT_FRAME, 0, 0);
        }
        fireCP(slot.name, 33, xPos, KZ_SPEED_Y, 0);
        fireCP(slot.name, 34, KZ_SPEED_SCALE, 0, 0);
        fireAlpha(slot.name, 0.75);
        fireColor(slot.name, r, g, b);
        Instance.EntFireAtName({ name: slot.name, input: "Start" });
        visIdx++;
      }
    }
  } else {
    for (var i = firstVisible; i < KZ_SPEED_SLOTS.length; i++) {
      var slot = KZ_SPEED_SLOTS[i];
      if (slot.type === "digit" && values[i] !== kzSpeedLastValues[i]) {
        fireCP(slot.name, 32, digitFrame(values[i]), 0, 0);
        kzSpeedLastValues[i] = values[i];
      }
    }
  }
}

function hideKzSpeed() {
  for (var i = 0; i < KZ_SPEED_SLOTS.length; i++) {
    Instance.EntFireAtName({ name: KZ_SPEED_SLOTS[i].name, input: "Stop" });
  }
  resetKzSpeedCache();
}

var KZ_JUMP_Y        = -13.75;
var KZ_JUMP_SCALE    = 0.016;
var KZ_JUMP_PAREN_W  = 1.1;

var KZ_JUMP_SLOTS = [
  { name: "kz_jump_paren_l",  type: "paren", w: KZ_JUMP_PAREN_W },
  { name: "kz_jump_digit_0",  type: "digit", w: KZ_SPEED_SPACING },
  { name: "kz_jump_digit_1",  type: "digit", w: KZ_SPEED_SPACING },
  { name: "kz_jump_digit_2",  type: "digit", w: KZ_SPEED_SPACING },
  { name: "kz_jump_dot_0",    type: "dot",   w: 0.3 },
  { name: "kz_jump_digit_3",  type: "digit", w: KZ_SPEED_SPACING },
  { name: "kz_jump_digit_4",  type: "digit", w: KZ_SPEED_SPACING },
  { name: "kz_jump_paren_r",  type: "paren", w: KZ_JUMP_PAREN_W }
];

function renderKzJumpSpeed(speed, r, g, b) {
  if (speed < 0) speed = 0;
  if (speed > 999.99) speed = 999.99;

  var hundredths = Math.floor(speed * 100);
  var whole = Math.floor(hundredths / 100);
  var frac = hundredths % 100;

  var d0 = Math.floor(whole / 100);
  var d1 = Math.floor((whole % 100) / 10);
  var d2 = whole % 10;
  var d3 = Math.floor(frac / 10);
  var d4 = frac % 10;

  var values = [d0, d1, d2, -1, d3, d4];

  var firstVisible = 2;
  if (d1 > 0 || d0 > 0) firstVisible = 1;
  if (d0 > 0) firstVisible = 0;

  var innerSlots = [
    { name: "kz_jump_digit_0", type: "digit", w: KZ_SPEED_SPACING },
    { name: "kz_jump_digit_1", type: "digit", w: KZ_SPEED_SPACING },
    { name: "kz_jump_digit_2", type: "digit", w: KZ_SPEED_SPACING },
    { name: "kz_jump_dot_0",   type: "dot",   w: 0.3 },
    { name: "kz_jump_digit_3", type: "digit", w: KZ_SPEED_SPACING },
    { name: "kz_jump_digit_4", type: "digit", w: KZ_SPEED_SPACING }
  ];

  var rawPositions = [];
  var cursor = 0;
  for (var i = firstVisible; i < innerSlots.length; i++) {
    rawPositions.push(cursor);
    cursor = cursor + innerSlots[i].w;
  }
  var totalWidth = cursor - innerSlots[innerSlots.length - 1].w;
  var centerOffset = totalWidth / 2;

  // Render inner digits
  var visIdx = 0;
  var leftEdge = 0;
  var rightEdge = 0;
  for (var i = 0; i < innerSlots.length; i++) {
    var slot = innerSlots[i];
    if (i < firstVisible) {
      Instance.EntFireAtName({ name: slot.name, input: "Stop" });
    } else {
      var xPos = rawPositions[visIdx] - centerOffset;
      if (slot.type === "digit") {
        fireCP(slot.name, 32, digitFrame(values[i]), 0, 0);
      } else if (slot.type === "dot") {
        fireCP(slot.name, 32, DOT_FRAME, 0, 0);
      }
      fireCP(slot.name, 33, xPos, KZ_JUMP_Y, 0);
      fireCP(slot.name, 34, KZ_JUMP_SCALE, 0, 0);
      fireAlpha(slot.name, 0.75);
      fireColor(slot.name, r, g, b);
      Instance.EntFireAtName({ name: slot.name, input: "Start" });
      if (visIdx === 0) leftEdge = xPos;
      rightEdge = xPos + innerSlots[i].w;
      visIdx++;
    }
  }

  var parenLeftX = leftEdge - KZ_JUMP_PAREN_W;
  var parenRightX = rightEdge;
  fireCP("kz_jump_paren_l", 32, PAREN_L_FRAME, 0, 0);
  fireCP("kz_jump_paren_l", 33, parenLeftX, KZ_JUMP_Y, 0);
  fireCP("kz_jump_paren_l", 34, KZ_JUMP_SCALE, 0, 0);
  fireAlpha("kz_jump_paren_l", 0.75);
  fireColor("kz_jump_paren_l", r, g, b);
  Instance.EntFireAtName({ name: "kz_jump_paren_l", input: "Start" });
  fireCP("kz_jump_paren_r", 32, PAREN_R_FRAME, 0, 0);
  fireCP("kz_jump_paren_r", 33, parenRightX, KZ_JUMP_Y, 0);
  fireCP("kz_jump_paren_r", 34, KZ_JUMP_SCALE, 0, 0);
  fireAlpha("kz_jump_paren_r", 0.75);
  fireColor("kz_jump_paren_r", r, g, b);
  Instance.EntFireAtName({ name: "kz_jump_paren_r", input: "Start" });
}

function hideKzJumpSpeed() {
  for (var i = 0; i <= 4; i++) {
    Instance.EntFireAtName({ name: "kz_jump_digit_" + i, input: "Stop" });
  }
  Instance.EntFireAtName({ name: "kz_jump_dot_0", input: "Stop" });
  Instance.EntFireAtName({ name: "kz_jump_paren_l", input: "Stop" });
  Instance.EntFireAtName({ name: "kz_jump_paren_r", input: "Stop" });
}




const debug = (message) => {
    Instance.Msg(message);
};

function randInt(min, max) {
    return min + Math.floor((max - min + 1) * Math.random());
}

let p;

class Timer {
    constructor() {
		this.setupDone = false;
        this.isActive = false;
		this.lastMilestoneTriggered = 0;
        this.tickCount = 0;
        this.Fails = 0;
        this.Jumps = 0;
        this.gameMode = "gamemode_static";
        this.previousGameMode = "gamemode_static";
        this.lastNonMovementMode = "gamemode_static";
        this.TICK_INTERVAL = 0.015625;
        this.UPDATE_INTERVAL_TICKS = 4;
        this.HUD_INTERVAL_TICKS = 8;
        this.STILL_THRESHOLD = 0.1;
        this.MIN_DISTANCE = 0.01;
        this.MAX_TELEPORT_DISTANCE = 500.0;
        this.currentTick = 0;
        this.kzSpeedTick = 0;
        this.kzJumpCaptureNextTick = false;
        this.kzJumpSpeedHideTime = 0;
        this.kzLandSpeed = 0;
        this.kzLandTime = 0;
        this.kzPerfActive = false;
        this.kzWasInAir = false;
        this.hudTick = 0;
        this.playerPos = [0, 0, 0];
        this.oldPlayerPos = [0, 0, 0];
        this.lastVelocity = 0;
        this.currentVelocity = 0;
        this.initialVelocity = 0;
        this.velocityChange = 0;
        this.lastDisplayedNumber = -1;
        this.isUpdating = false;
        this.lastHudMessage = "";


        this.checkpoint = null;
        this.cpNum = 0;
        this.tpNum = 0;
        this.isTeleporting = false;
        this.isInAir = false;
        this.noclipDetected = false;
        this.noclipMessageShown = false;
        // Bot management
        this.numBots = 10;
        this.staticNumBots = 10;
        this.dynamicNumBots = 8;
        this.rushNumBots = 8;
        this.kills = 0;
        this.bestKills = 0;
        this.bestKillsBotCount = 8;

        this.globalKills = 0;
        this.KILLCOUNTER_DIGITS = 5;
        this.KILLCOUNTER_PREFIX = "brush_killcounter_";
        this.killCounterInitialized = false;

        // Combat gamemode
        this.combatNumBots = 4;
        this.combatActive = false;
        this.combatRoundActive = false;
        this.combatKills = 0;
        this.combatLevel = 1;
        this.combatBestLevel = 1;
        this.combatWaitingToStart = false;
        this.combatBots = [];
        this.combatInitTime = 0;
        this.combatBotsInitialized = false;
        this.combatTeleportTime = 0;
        this.combatPendingTeleport = false;
        this.combatPendingDeathMsg = false;
        this.combatDeathMsgText = "";
        this.combatArena = 1;
        
        this.velocityLocked = false;
        this.velocityLockEndTime = 0;
		
	        this.SCALE_BIG = 1.18;
        this.SCALE_NORM = 1.0;
        this.SCALE_SPEED = 8;
        
        // Switcher button animation
        this.SWITCHER_SCALE_SMALL = 0.85;
        this.SWITCHER_SCALE_NORM = 1.0;
        this.SWITCHER_DURATION = 0.25;
        this.switcherAnimations = {};
        this.lastScaleCheck = 0;
        this.scaleBrushTick = 0;
        this.SCALE_BRUSH_INTERVAL = 4; // only raytrace+iterate every 4 ticks (16Hz instead of 64Hz)
        this.wasUsePressed = false;
        this.cachedLookedAtProxy = null;
        
        // Infinite switcher loop animation
        this.switcherLoopActive = false;
        this.switcherLoopBrushes = [];
        this.SWITCHER_LOOP_MOVE_DISTANCE = 3;
        this.SWITCHER_LOOP_SPEED = 3;
        this.SWITCHER_LOOP_PERIOD = 1.5;
        this.SWITCHER_LOOP_SCALE_SMALL = 0.7;
        this.switcherLoopScale = 1.0;
        
        // Edge brush animation
        this.EDGE_MOVE_DISTANCE = 1;
        this.EDGE_SPEED = 30;
        this.EDGE_PERIOD = 3.0;

        // Scale proxy
        this.scalePairs = [
            "button_panel_lock, brush_settings_default_lock",
            "button_change_mode_1",
            "button_change_mode_2",
            "button_change_mode_3",
            "button_change_mode_4",
			"button_bots_static, brush_bots_default_static",
			"button_bots_static, brush_gamemode_training_default_prefire",
			"button_bots_dynamic, brush_bots_default_dynamic",
			"button_bots_dynamic, brush_gamemode_training_default_combat",
			"button_bots_rush, brush_bots_default_rush",
			"button_bots_rush, brush_gamemode_training_default_speed",
			"button_gamemode_movement_surf, brush_gamemode_movement_default_surf",
			"button_gamemode_movement_surf, brush_gamemode_challenges_default_target",
            "button_gamemode_movement_bhop, brush_gamemode_movement_default_bhop",
			"button_gamemode_movement_bhop, brush_gamemode_challenges_default_reaction",
            "button_gamemode_movement_kz, brush_gamemode_movement_default_kz",
			"button_gamemode_movement_kz, brush_gamemode_challenges_default_spray",
			"button_add_bot",
			"button_remove_bot",
			"button_static_distance_far, brush_distance_far",
			"button_static_distance_mid, brush_distance_mid",
			"button_static_distance_near, brush_distance_close",
			"button_speed_50, brush_speed_50",
			"button_speed_75, brush_speed_75",
			"button_speed_100, brush_speed_100",
			"button_settings_armor, brush_settings_noarmor",
			"button_settings_armor, brush_settings_kevlar",
			"button_settings_armor, brush_settings_armor",
			"button_settings_ammo, brush_settings_selected_infammo",
			"button_settings_ammo, brush_settings_default_infammo",
			"button_settings_playermodels, brush_settings_selected_playermodels",
			"button_settings_playermodels, brush_settings_default_playermodels",
			"button_settings_hs, brush_settings_selected_hsonly",
			"button_settings_hs, brush_settings_default_hsonly",
			"weapon_button_ak47, wallbrush_prim_ak47",
			"weapon_button_m4a1, wallbrush_prim_m4a1",
			"weapon_button_m4a4, wallbrush_prim_m4a4",
			"weapon_button_m249, wallbrush_prim_m249",
			"weapon_button_negev, wallbrush_prim_negev",
			"weapon_button_sawedoff, wallbrush_prim_sawedoff",
			"weapon_button_mac10, wallbrush_prim_mac10",
			"weapon_button_ump, wallbrush_prim_ump",
			"weapon_button_aug, wallbrush_prim_aug",
			"weapon_button_krieg, wallbrush_prim_krieg",
			"weapon_button_famas, wallbrush_prim_famas",
			"weapon_button_scar, wallbrush_prim_ctauto",
			"weapon_button_nova, wallbrush_prim_nova",
			"weapon_button_mag7, wallbrush_prim_mag7",
			"weapon_button_mp5, wallbrush_prim_mp5",
			"weapon_button_mp9, wallbrush_prim_mp9",
			"weapon_button_awp, wallbrush_prim_awp",
			"weapon_button_scout, wallbrush_prim_scout",
			"weapon_button_galil, wallbrush_prim_galil",
			"weapon_button_g3, wallbrush_prim_tauto",
			"weapon_button_xm, wallbrush_prim_xm",
			"weapon_button_bizon, wallbrush_prim_bizon",
			"weapon_button_p90, wallbrush_prim_p90",
			"weapon_button_mp7, wallbrush_prim_mp7",
			"weapon_button_deagle, wallbrush_sec_deagle",
			"weapon_button_usp, wallbrush_sec_usp",
			"weapon_button_glock, wallbrush_sec_glock",
			"weapon_button_duals, wallbrush_sec_duals",
			"weapon_button_r8, wallbrush_sec_r8",
			"weapon_button_tec9, wallbrush_sec_tec9",
			"weapon_button_fiveseven, wallbrush_sec_fiveseven",
			"weapon_button_p2000, wallbrush_sec_p2000",
			"weapon_button_p250, wallbrush_sec_p250",
			"weapon_button_cz, wallbrush_sec_cz",
			"brush_logo_crosshairs_vitality",
			"button_crosshairs_vitality_1, brush_crosshairs_vitality_1",
			"button_crosshairs_vitality_2, brush_crosshairs_vitality_2",
			"button_crosshairs_vitality_3, brush_crosshairs_vitality_3",
			"button_crosshairs_vitality_4, brush_crosshairs_vitality_4",
			"button_crosshairs_vitality_5, brush_crosshairs_vitality_5",
			"brush_logo_crosshairs_furia",
			"button_crosshairs_furia_1, brush_crosshairs_furia_1",
			"button_crosshairs_furia_2, brush_crosshairs_furia_2",
			"button_crosshairs_furia_3, brush_crosshairs_furia_3",
			"button_crosshairs_furia_4, brush_crosshairs_furia_4",
			"button_crosshairs_furia_5, brush_crosshairs_furia_5",
			"brush_logo_crosshairs_mouz",
			"button_crosshairs_mouz_1, brush_crosshairs_mouz_1",
			"button_crosshairs_mouz_2, brush_crosshairs_mouz_2",
			"button_crosshairs_mouz_3, brush_crosshairs_mouz_3",
			"button_crosshairs_mouz_4, brush_crosshairs_mouz_4",
			"button_crosshairs_mouz_5, brush_crosshairs_mouz_5",
			"brush_logo_crosshairs_mongolz",
			"button_crosshairs_mongolz_1, brush_crosshairs_mongolz_1",
			"button_crosshairs_mongolz_2, brush_crosshairs_mongolz_2",
			"button_crosshairs_mongolz_3, brush_crosshairs_mongolz_3",
			"button_crosshairs_mongolz_4, brush_crosshairs_mongolz_4",
			"button_crosshairs_mongolz_5, brush_crosshairs_mongolz_5",
			"brush_logo_crosshairs_falcons",
			"button_crosshairs_falcons_1, brush_crosshairs_falcons_1",
			"button_crosshairs_falcons_2, brush_crosshairs_falcons_2",
			"button_crosshairs_falcons_3, brush_crosshairs_falcons_3",
			"button_crosshairs_falcons_4, brush_crosshairs_falcons_4",
			"button_crosshairs_falcons_5, brush_crosshairs_falcons_5",
			"brush_logo_crosshairs_spirit",
			"button_crosshairs_spirit_1, brush_crosshairs_spirit_1",
			"button_crosshairs_spirit_2, brush_crosshairs_spirit_2",
			"button_crosshairs_spirit_3, brush_crosshairs_spirit_3",
			"button_crosshairs_spirit_4, brush_crosshairs_spirit_4",
			"button_crosshairs_spirit_5, brush_crosshairs_spirit_5",
			"brush_logo_crosshairs_navi",
			"button_crosshairs_navi_1, brush_crosshairs_navi_1",
			"button_crosshairs_navi_2, brush_crosshairs_navi_2",
			"button_crosshairs_navi_3, brush_crosshairs_navi_3",
			"button_crosshairs_navi_4, brush_crosshairs_navi_4",
			"button_crosshairs_navi_5, brush_crosshairs_navi_5",
			"brush_logo_crosshairs_g2",
			"button_crosshairs_g2_1, brush_crosshairs_g2_1",
			"button_crosshairs_g2_2, brush_crosshairs_g2_2",
			"button_crosshairs_g2_3, brush_crosshairs_g2_3",
			"button_crosshairs_g2_4, brush_crosshairs_g2_4",
			"button_crosshairs_g2_5, brush_crosshairs_g2_5",
			"brush_logo_crosshairs_aurora",
			"button_crosshairs_aurora_1, brush_crosshairs_aurora_1",
			"button_crosshairs_aurora_2, brush_crosshairs_aurora_2",
			"button_crosshairs_aurora_3, brush_crosshairs_aurora_3",
			"button_crosshairs_aurora_4, brush_crosshairs_aurora_4",
			"button_crosshairs_aurora_5, brush_crosshairs_aurora_5",
			"brush_logo_crosshairs_3dmax",
			"button_crosshairs_3dmax_1, brush_crosshairs_3dmax_1",
			"button_crosshairs_3dmax_2, brush_crosshairs_3dmax_2",
			"button_crosshairs_3dmax_3, brush_crosshairs_3dmax_3",
			"button_crosshairs_3dmax_4, brush_crosshairs_3dmax_4",
			"button_crosshairs_3dmax_5, brush_crosshairs_3dmax_5",
			"brush_logo_crosshairs_faze",
			"button_crosshairs_faze_1, brush_crosshairs_faze_1",
			"button_crosshairs_faze_2, brush_crosshairs_faze_2",
			"button_crosshairs_faze_3, brush_crosshairs_faze_3",
			"button_crosshairs_faze_4, brush_crosshairs_faze_4",
			"button_crosshairs_faze_5, brush_crosshairs_faze_5",
			"brush_logo_crosshairs_liquid",
			"button_crosshairs_liquid_1, brush_crosshairs_liquid_1",
			"button_crosshairs_liquid_2, brush_crosshairs_liquid_2",
			"button_crosshairs_liquid_3, brush_crosshairs_liquid_3",
			"button_crosshairs_liquid_4, brush_crosshairs_liquid_4",
			"button_crosshairs_liquid_5, brush_crosshairs_liquid_5",
			"brush_logo_crosshairs_pain",
			"button_crosshairs_pain_1, brush_crosshairs_pain_1",
			"button_crosshairs_pain_2, brush_crosshairs_pain_2",
			"button_crosshairs_pain_3, brush_crosshairs_pain_3",
			"button_crosshairs_pain_4, brush_crosshairs_pain_4",
			"button_crosshairs_pain_5, brush_crosshairs_pain_5",
			"brush_logo_crosshairs_astralis",
			"button_crosshairs_astralis_1, brush_crosshairs_astralis_1",
			"button_crosshairs_astralis_2, brush_crosshairs_astralis_2",
			"button_crosshairs_astralis_3, brush_crosshairs_astralis_3",
			"button_crosshairs_astralis_4, brush_crosshairs_astralis_4",
			"button_crosshairs_astralis_5, brush_crosshairs_astralis_5",
			"button_spray_distance_far, brush_spray_distance_far",
			"button_spray_distance_mid, brush_spray_distance_mid",
			"button_spray_distance_near, brush_spray_distance_near",
			"prop_prefire_map_1",
			"prop_prefire_map_2",
			"prop_prefire_map_3",
			"prop_prefire_map_4",
			"prop_prefire_map_5",
			"prop_prefire_map_6",
			"prop_prefire_map_7",
			"prop_surf_map_1",
			"prop_surf_map_1, brush_timer_surf_1_1",
			"prop_surf_map_1, brush_timer_surf_1_2",
			"prop_surf_map_1, brush_timer_surf_1_3",
			"prop_surf_map_1, brush_timer_surf_1_4",
			"prop_surf_map_1, brush_timer_surf_1_5",
			"prop_surf_map_1, brush_timer_surf_1_6",
			"prop_surf_map_2",
			"prop_surf_map_2, brush_timer_surf_2_1",
			"prop_surf_map_2, brush_timer_surf_2_2",
			"prop_surf_map_2, brush_timer_surf_2_3",
			"prop_surf_map_2, brush_timer_surf_2_4",
			"prop_surf_map_2, brush_timer_surf_2_5",
			"prop_surf_map_2, brush_timer_surf_2_6",
			"prop_bhop_map_1",
			"prop_bhop_map_1, brush_timer_bhop_1_1",
			"prop_bhop_map_1, brush_timer_bhop_1_2",
			"prop_bhop_map_1, brush_timer_bhop_1_3",
			"prop_bhop_map_1, brush_timer_bhop_1_4",
			"prop_bhop_map_1, brush_timer_bhop_1_5",
			"prop_bhop_map_1, brush_timer_bhop_1_6",
			"prop_bhop_map_2",
			"prop_bhop_map_2, brush_timer_bhop_2_1",
			"prop_bhop_map_2, brush_timer_bhop_2_2",
			"prop_bhop_map_2, brush_timer_bhop_2_3",
			"prop_bhop_map_2, brush_timer_bhop_2_4",
			"prop_bhop_map_2, brush_timer_bhop_2_5",
			"prop_bhop_map_2, brush_timer_bhop_2_6",
			"prop_kz_map_1",
			"prop_kz_map_1, brush_timer_kz_1_1",
			"prop_kz_map_1, brush_timer_kz_1_2",
			"prop_kz_map_1, brush_timer_kz_1_3",
			"prop_kz_map_1, brush_timer_kz_1_4",
			"prop_kz_map_1, brush_timer_kz_1_5",
			"prop_kz_map_1, brush_timer_kz_1_6",
			"prop_kz_map_2",
			"prop_kz_map_2, brush_timer_kz_2_1",
			"prop_kz_map_2, brush_timer_kz_2_2",
			"prop_kz_map_2, brush_timer_kz_2_3",
			"prop_kz_map_2, brush_timer_kz_2_4",
			"prop_kz_map_2, brush_timer_kz_2_5",
			"prop_kz_map_2, brush_timer_kz_2_6",
			"save_crosshair_button"
        ];

        this.scaleBrushes = []; // Will hold

        this.staticSpawnRanges = {
            spawn_close: true,
            spawn_mid: true,
            spawn_far: false
        };
        // Weapon selection storage
        this.selectedPrimary = "weapon_ak47";
        this.selectedSecondary = "weapon_deagle";
        this.savedPrimaryInput = "set_weapon_ak47";
        this.savedSecondaryInput = "set_weapon_deagle";
        this.selectedKnifeName = "weapon_knife";
        this.selectedKnifeId = undefined;

        // Settings
        this.armorStage = 1; // 1 = kevlar (default), 2 = kevlar+helmet, 3 = no armor
        this.ammoStage = 1; // 1 = infinite ammo (default), 2 = finite ammo
        this.headshotStage = 1; // 1 = off (default), 2 = headshot only
        this.delayedActions = []; // { time: gameTime, action: fn }
        this.movementPB = undefined; // current PB time in seconds for active movement mode
        this.missedPB = false; // whether PB was missed mid-run
        this.agentsStage = 2; // 1 = enabled, 2 = disabled (default)

        // Targets gamemode properties
        this.targetsActive = false;
        this.targetsUsedPoints = [];
        this.targetsBalls = [];
        this.targetsInitBall = true;
        this.targetsPendingSpawns = [];
        this.targetsScalingBalls = [];

        this.currentLeftCategory = "warmup";
        this.currentRightCategory = "challenges";
        this.lastWarmupMode = "static";
        this.lastTrainingMode = null;
        this.lastChallengesMode = null;
        this.lastMovementMode = null;
        
        this.gamemodeCategories = {
            warmup: ["static", "dynamic", "rush"],
            training: ["prefire", "combat", "speed"],
            challenges: ["target", "reaction", "spray"],
            movement: ["surf", "bhop", "kz"]
        };

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

        // Spray gamemode
        this.sprayActive = false;
        this.sprayShotsFired = 0;
        this.sprayShotsHit = 0;
        this.sprayCurrentWeapon = "weapon_ak47";
        this.sprayLastShotTime = 0;
        this.sprayStarted = false;
        this.SPRAY_RESET_DELAY = 0.12;
        this.sprayBot = null;
        this.sprayBotInitialized = false;
        this.sprayInitRetryCount = 0;
        this.sprayInitTime = 0;
        this.sprayTeleportTarget = "teleport_gamemode_spray_mid";
        this.sprayLastDisplayedPercentage = -1;
        this.sprayPercentageHideTime = 0;
        
        // Weapon magazine sizes
        this.weaponMagazineSizes = {
            "weapon_ak47": 30,
            "weapon_m4a1_silencer": 20,
            "weapon_m4a1": 30,
            "weapon_famas": 25,
            "weapon_galilar": 35,
            "weapon_sg556": 30,
            "weapon_aug": 30,
            "weapon_mp9": 30,
            "weapon_mac10": 30,
            "weapon_mp7": 30,
            "weapon_mp5sd": 30,
            "weapon_ump45": 25,
            "weapon_p90": 50,
            "weapon_bizon": 64,
            "weapon_mag7": 5,
            "weapon_xm1014": 7,
            "weapon_nova": 8,
            "weapon_sawedoff": 7,
            "weapon_negev": 150,
            "weapon_m249": 100,
            "weapon_scar20": 20,
            "weapon_g3sg1": 20,
            "weapon_awp": 5,
            "weapon_ssg08": 10,
            "weapon_usp_silencer": 12,
            "weapon_deagle": 7,
            "weapon_glock": 20,
            "weapon_tec9": 18,
            "weapon_fiveseven": 20,
            "weapon_elite": 30,
            "weapon_p250": 13,
            "weapon_cz75a": 12,
            "weapon_revolver": 8,
            "weapon_hkp2000": 13
        };
        
        // Weapon display names for spray mode
        this.weaponDisplayNames = {
            "weapon_ak47": "AK-47",
            "weapon_m4a1_silencer": "M4A1-S",
            "weapon_m4a1": "M4A4",
            "weapon_famas": "FAMAS",
            "weapon_galilar": "Galil AR",
            "weapon_sg556": "SG 553",
            "weapon_aug": "AUG",
            "weapon_mp9": "MP9",
            "weapon_mac10": "MAC-10",
            "weapon_mp7": "MP7",
            "weapon_mp5sd": "MP5-SD",
            "weapon_ump45": "UMP-45",
            "weapon_p90": "P90",
            "weapon_bizon": "PP-Bizon",
            "weapon_mag7": "MAG-7",
            "weapon_xm1014": "XM1014",
            "weapon_nova": "Nova",
            "weapon_sawedoff": "Sawed-Off",
            "weapon_negev": "Negev",
            "weapon_m249": "M249",
            "weapon_scar20": "SCAR-20",
            "weapon_g3sg1": "G3SG1",
            "weapon_awp": "AWP",
            "weapon_ssg08": "SSG 08",
            "weapon_usp_silencer": "USP-S",
            "weapon_deagle": "Desert Eagle",
            "weapon_glock": "Glock-18",
            "weapon_tec9": "Tec-9",
            "weapon_fiveseven": "Five-SeveN",
            "weapon_elite": "Dual Berettas",
            "weapon_p250": "P250",
            "weapon_cz75a": "CZ75-Auto",
            "weapon_revolver": "R8 Revolver",
            "weapon_hkp2000": "P2000"
        };
        
        // Reaction time gamemode
        this.reactionActive = false;
        this.reactionState = 0;
        this.reactionGreenTime = 0;
        this.reactionStartTime = 0;
        this.reactionLastTime = 0;
        this.reactionTotalTime = 0;
        this.reactionAttempts = 0;
        this.reactionTimeScale = 1.0;
        this.reactionTimeScaling = false;
        this.reactionTimeBrushes = null;  // cached FindEntitiesByName result
        
        // Speed gamemode
        this.speedActive = false;
        this.speedState = 0;
        this.speedTargetKills = 50; // 50, 75, 100
        this.speedKills = 0;
        this.speedStartTime = 0;
        this.speedShotsFired = 0;
        this.speedShotsHit = 0;
        this.speedNumBots = 10;
        
        // Prefire gamemode
        this.prefireActive = false;
        this.prefireMapScaling = [];
        this.prefireWallbrushScaling = [];

        this.surfActive = false;
        this.surfMapScaling = [];
        this.surfVariant = 1; // 1 = surf_1, 2 = surf_2

        this.bhopActive = false;
        this.bhopMapScaling = [];
        this.bhopVariant = 1; // 1 = bhop_1, 2 = bhop_2

        this.kzActive = false;
        this.kzMapScaling = [];
        this.kzVariant = 1; // 1 = kz_1, 2 = kz_2
        this.lastClockUpdate = 0;
        this.lastClockDigits = [-1, -1, -1, -1];
        
        // Save crosshair panel animation
        this.saveCrosshairScale = 1.0;
        this.saveCrosshairScaling = false;
        this.saveCrosshairScalingUp = true;
        this.saveCrosshairBrushes = null;  // cached FindEntitiesByName result
    }
    
    updateClock() {
        const currentTime = Instance.GetGameTime();
        
        // Update once per second
        if (currentTime - this.lastClockUpdate < 1.0) return;
        this.lastClockUpdate = currentTime;
        
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        
        // Extract digits
        const digits = [
            Math.floor(hours / 10),
            hours % 10,
            Math.floor(minutes / 10),
            minutes % 10
        ];
        
        for (var i = 0; i < 4; i++) {
            if (digits[i] !== this.lastClockDigits[i]) {
                this.lastClockDigits[i] = digits[i];
                Instance.ServerCommand(`ent_fire brush_clock_${i + 1} SetRenderAttribute count=${digits[i]}`);
            }
        }
    }


    trigger100KillEvent() {
        if (this.lastMilestoneTriggered === this.globalKills) return;
        this.lastMilestoneTriggered = this.globalKills;

        Instance.ServerCommand(`ent_fire relay_100_dboard trigger`, 0.0);
    }

    setStaticSpawnPoints() {
        if (this.gameMode !== "gamemode_static") return;
        Instance.ServerCommand(`ent_fire spawn_close ${this.staticSpawnRanges.spawn_close ? "SetEnabled" : "SetDisabled"}`, 0.0);
        Instance.ServerCommand(`ent_fire spawn_mid ${this.staticSpawnRanges.spawn_mid ? "SetEnabled" : "SetDisabled"}`, 0.0);
        Instance.ServerCommand(`ent_fire spawn_far ${this.staticSpawnRanges.spawn_far ? "SetEnabled" : "SetDisabled"}`, 0.0);
    }
	
	    initScaleBrushes() {
        this.scaleBrushes = [];

        for (let pair of this.scalePairs) {
            let proxyName = pair.trim();
            let targetName = pair.trim();

            if (pair.includes(',')) {
                const parts = pair.split(',').map(s => s.trim());
                proxyName = parts[0];
                targetName = parts[1];
            }

            const proxies = Instance.FindEntitiesByName(proxyName);
            const targets = Instance.FindEntitiesByName(targetName);

            for (const proxy of proxies) {
                for (const target of targets) {
                    if (this.scaleBrushes.find(b => b.target === target)) continue;

                    this.scaleBrushes.push({
                        proxy: proxy,
                        target: target,
                        name: targetName,
                        proxyName: proxyName,
                        scale: this.SCALE_NORM,
                        lastSent: -1,
                        lastSelected: -1,
                        wasLookedAt: false,
                        lastHoverColor: -1
                    });
                }
            }
        }

        if (this.scaleBrushes.length > 0) {
            this.lastScaleCheck = Instance.GetGameTime();
        }
    }

    updateScaleBrushes() {
        if (this.scaleBrushes.length === 0) return;

        // ── Throttled: raytrace + use-press detection every 4 ticks ──
        this.scaleBrushTick++;
        if (this.scaleBrushTick >= this.SCALE_BRUSH_INTERVAL) {
            this.scaleBrushTick = 0;

            const controller = Instance.GetPlayerController(0);
            if (!controller || !controller.IsValid()) return;
            const pawn = controller.GetPlayerPawn();
            if (!pawn || !pawn.IsAlive()) return;

            const eyePos = pawn.GetEyePosition();
            const eyeAng = pawn.GetEyeAngles();

            const forward = {
                x: Math.cos(eyeAng.pitch * Math.PI / 180) * Math.cos(eyeAng.yaw * Math.PI / 180),
                y: Math.cos(eyeAng.pitch * Math.PI / 180) * Math.sin(eyeAng.yaw * Math.PI / 180),
                z: -Math.sin(eyeAng.pitch * Math.PI / 180)
            };

            const endPos = {
                x: eyePos.x + forward.x * 10000,
                y: eyePos.y + forward.y * 10000,
                z: eyePos.z + forward.z * 10000
            };

            const trace = Instance.TraceLine({
                start: eyePos,
                end: endPos,
                ignoreEntity: pawn
            });

            this.cachedLookedAtProxy = null;
            if (trace.didHit && trace.hitEntity) {
                this.cachedLookedAtProxy = trace.hitEntity;
            }

            // Gamemodes where bot add/remove buttons are active
            const botButtonsActive = BOT_BUTTON_MODES[this.gameMode] === true;

            // Detect +use press on looked-at entity
            const usePressed = pawn.IsInputPressed(1 << 7);
            if (usePressed && !this.wasUsePressed && this.cachedLookedAtProxy) {
                for (const b of this.scaleBrushes) {
                    if (b.proxy === this.cachedLookedAtProxy && b.proxyName) {
                        // Skip bot add/remove buttons in non-applicable gamemodes
                        if ((b.proxyName === "button_add_bot" || b.proxyName === "button_remove_bot") && !botButtonsActive) break;

                        let pressTarget = b.proxyName;

                        // Remap left-side buttons when training category is active
                        if (this.currentLeftCategory === "training") {
                            if (b.proxyName === "button_bots_static") pressTarget = "button_gamemode_training_prefire";
                            else if (b.proxyName === "button_bots_dynamic") pressTarget = "button_gamemode_training_combat";
                            else if (b.proxyName === "button_bots_rush") pressTarget = "button_gamemode_training_speed";
                        }

                        // Remap right-side buttons when challenges category is active
                        if (this.currentRightCategory === "challenges") {
                            if (b.proxyName === "button_gamemode_movement_surf") pressTarget = "button_gamemode_challenges_target";
                            else if (b.proxyName === "button_gamemode_movement_bhop") pressTarget = "button_gamemode_challenges_reaction";
                            else if (b.proxyName === "button_gamemode_movement_kz") pressTarget = "button_gamemode_challenges_spray";
                        }

                        Instance.EntFireAtName({ name: pressTarget, input: "Press" });
                        break;
                    }
                }

                // Entities that use OnTakeDamage/OnDamaged instead of OnPressed
                const entName = this.cachedLookedAtProxy.GetEntityName();
                if (entName && DAMAGE_BUTTON_SET.has(entName)) {
                    this.cachedLookedAtProxy.TakeDamage({ damage: 1, attacker: pawn });
                    Instance.EntFireAtName({ name: entName, input: "Damage" });
                }
            }
            this.wasUsePressed = usePressed;
        }

        // ── Every tick: smooth scale lerp using cached trace result ──
        const lookedAtProxy = this.cachedLookedAtProxy;
        const botButtonsActive = BOT_BUTTON_MODES[this.gameMode] === true;

        // Currently selected weapon wallbrush names (avoid per-tick Set allocation)
        const primKey = "set_" + this.selectedPrimary;
        const secKey = "set_" + this.selectedSecondary;
        const selectedWallbrush1 = weaponWallbrushMap[primKey] ? weaponWallbrushMap[primKey].wallbrush : null;
        const selectedWallbrush2 = weaponWallbrushMap[secKey] ? weaponWallbrushMap[secKey].wallbrush : null;

        for (const b of this.scaleBrushes) {
            let isLookedAt = lookedAtProxy === b.proxy;

            // Suppress look-at for bot add/remove buttons in non-applicable gamemodes
            if ((b.name === "button_add_bot" || b.name === "button_remove_bot") && !botButtonsActive) {
                isLookedAt = false;
            }

            const targetScale = isLookedAt ? this.SCALE_BIG : this.SCALE_NORM;

            // Play sound when brush starts being looked at
            if (isLookedAt && !b.wasLookedAt) {
                Instance.ServerCommand(`ent_fire snd_menu_look startsound`);
            }
            b.wasLookedAt = isLookedAt;

            b.scale += (targetScale - b.scale) * this.SCALE_SPEED * 0.016;

            const rounded = parseFloat(b.scale.toFixed(4));
            if (rounded !== b.lastSent && b.target && b.target.IsValid()) {
                b.lastSent = rounded;
                b.target.SetModelScale(rounded);
            }

            // Weapon button hover color: brighten when looked at, unless selected
            if (b.name && (b.name.startsWith("wallbrush_prim_") || b.name.startsWith("wallbrush_sec_"))) {
                const isSelected = (b.name === selectedWallbrush1 || b.name === selectedWallbrush2);
                if (!isSelected) {
                    const hoverColor = isLookedAt ? 125 : 100;
                    if (b.lastHoverColor !== hoverColor) {
                        b.lastHoverColor = hoverColor;
                        Instance.EntFireAtName({ name: b.name, input: "Color", value: { r: hoverColor, g: hoverColor, b: hoverColor } });
                    }
                }
            }

            // Bot gamemode button hover color: brighten when looked at, unless that gamemode is active
            if (b.name && botBrushGamemodeMap[b.name]) {
                const isActiveMode = this.gameMode === botBrushGamemodeMap[b.name] && activeGamemodeBrushes.has(b.name);
                if (!isActiveMode) {
                    const hoverColor = isLookedAt ? 125 : 100;
                    if (b.lastHoverColor !== hoverColor) {
                        b.lastHoverColor = hoverColor;
                        Instance.EntFireAtName({ name: b.name, input: "Color", value: { r: hoverColor, g: hoverColor, b: hoverColor } });
                    }
                }
            }

            // Settings button hover color: only when the default/off brush is enabled
            if (b.name && settingsBrushConditions[b.name]) {
                if (settingsBrushConditions[b.name](this)) {
                    const hoverColor = isLookedAt ? 125 : 100;
                    if (b.lastHoverColor !== hoverColor) {
                        b.lastHoverColor = hoverColor;
                        Instance.EntFireAtName({ name: b.name, input: "Color", value: { r: hoverColor, g: hoverColor, b: hoverColor } });
                    }
                }
            }

            // Bot add/remove button hover color
            if (b.name === "button_add_bot" || b.name === "button_remove_bot") {
                const hoverColor = isLookedAt ? 125 : 100;
                if (b.lastHoverColor !== hoverColor) {
                    b.lastHoverColor = hoverColor;
                    Instance.EntFireAtName({ name: b.name, input: "Color", value: { r: hoverColor, g: hoverColor, b: hoverColor } });
                }
            }

            // SetRenderAttribute selected=1/0 on look-at for default gamemode brushes
            if (b.name && selectedAttrBrushes.has(b.name)) {
                const sel = isLookedAt ? 1 : 0;
                if (b.lastSelectedAttr !== sel) {
                    b.lastSelectedAttr = sel;
                    Instance.ServerCommand(`ent_fire ${b.name} SetRenderAttribute selected=${sel}`);
                }
            }
            
            if (b.name && b.name.startsWith("prop_prefire_map_")) {
                const skin = isLookedAt ? 2 : 1;
                if (skin !== b.lastSelected) {
                    b.lastSelected = skin;
                    Instance.ServerCommand(`ent_fire ${b.name} Skin ${skin}`);
                }
            }
            
            if (b.name && b.name.startsWith("prop_surf_map_")) {
                const skin = isLookedAt ? 2 : 1;
                if (skin !== b.lastSelected) {
                    b.lastSelected = skin;
                    Instance.ServerCommand(`ent_fire ${b.name} Skin ${skin}`);
                }
                if (b.name === "prop_surf_map_1") {
                    const state = isLookedAt ? 1 : 0;
                    if (b.lastTimerColor !== state) {
                        b.lastTimerColor = state;
                        const rgb = isLookedAt ? { r: 255, g: 255, b: 255 } : { r: 0, g: 0, b: 0 };
                        Instance.EntFireAtName({ name: "brush_timer_surf_1_*", input: "Color", value: rgb });
                    }
                }
                if (b.name === "prop_surf_map_2") {
                    const state = isLookedAt ? 1 : 0;
                    if (b.lastTimerColor !== state) {
                        b.lastTimerColor = state;
                        const rgb = isLookedAt ? { r: 255, g: 255, b: 255 } : { r: 0, g: 0, b: 0 };
                        Instance.EntFireAtName({ name: "brush_timer_surf_2_*", input: "Color", value: rgb });
                    }
                }
            }
            
            if (b.name && b.name.startsWith("prop_bhop_map_")) {
                const skin = isLookedAt ? 2 : 1;
                if (skin !== b.lastSelected) {
                    b.lastSelected = skin;
                    Instance.ServerCommand(`ent_fire ${b.name} Skin ${skin}`);
                }
                if (b.name === "prop_bhop_map_1") {
                    const state = isLookedAt ? 1 : 0;
                    if (b.lastTimerColor !== state) {
                        b.lastTimerColor = state;
                        const rgb = isLookedAt ? { r: 255, g: 255, b: 255 } : { r: 0, g: 0, b: 0 };
                        Instance.EntFireAtName({ name: "brush_timer_bhop_1_*", input: "Color", value: rgb });
                    }
                }
                if (b.name === "prop_bhop_map_2") {
                    const state = isLookedAt ? 1 : 0;
                    if (b.lastTimerColor !== state) {
                        b.lastTimerColor = state;
                        const rgb = isLookedAt ? { r: 255, g: 255, b: 255 } : { r: 0, g: 0, b: 0 };
                        Instance.EntFireAtName({ name: "brush_timer_bhop_2_*", input: "Color", value: rgb });
                    }
                }
            }
            
            if (b.name && b.name.startsWith("prop_kz_map_")) {
                const skin = isLookedAt ? 2 : 1;
                if (skin !== b.lastSelected) {
                    b.lastSelected = skin;
                    Instance.ServerCommand(`ent_fire ${b.name} Skin ${skin}`);
                }
                if (b.name === "prop_kz_map_1") {
                    const state = isLookedAt ? 1 : 0;
                    if (b.lastTimerColor !== state) {
                        b.lastTimerColor = state;
                        const rgb = isLookedAt ? { r: 255, g: 255, b: 255 } : { r: 0, g: 0, b: 0 };
                        Instance.EntFireAtName({ name: "brush_timer_kz_1_*", input: "Color", value: rgb });
                    }
                }
                if (b.name === "prop_kz_map_2") {
                    const state = isLookedAt ? 1 : 0;
                    if (b.lastTimerColor !== state) {
                        b.lastTimerColor = state;
                        const rgb = isLookedAt ? { r: 255, g: 255, b: 255 } : { r: 0, g: 0, b: 0 };
                        Instance.EntFireAtName({ name: "brush_timer_kz_2_*", input: "Color", value: rgb });
                    }
                }
            }
            
            if (b.name === "save_crosshair_button") {
                // Set skin based on hover state
                const skin = isLookedAt ? 1 : 0;
                if (skin !== b.lastSkin) {
                    b.lastSkin = skin;
                    Instance.ServerCommand(`ent_fire save_crosshair_button Skin ${skin}`);
                }
            }
        }
    }
    
    // Trigger switcher animation
    triggerSwitcher(side) {
        let brushNames = [];
        let switcherBrushNames = [];
        
        if (side === "right") {
            // Challenges/Movement switcher
            brushNames = [
                "brush_gamemode_movement_default_bhop",
                "brush_gamemode_movement_default_kz",
                "brush_gamemode_movement_default_surf",
                "brush_gamemode_challenges_default_reaction",
                "brush_gamemode_challenges_default_spray",
                "brush_gamemode_challenges_default_target",
                "brush_headline_challenges",
                "brush_headline_movement",
                "brush_gamemode_edge_3",
                "brush_gamemode_edge_4"
            ];
            switcherBrushNames = ["brush_switcher_left", "brush_switcher_right"];
        } else if (side === "left") {
            // Warmup/Training switcher
            brushNames = [
                "brush_bots_default_static",
                "brush_bots_default_dynamic",
                "brush_bots_default_rush",
                "brush_gamemode_training_default_prefire",
                "brush_gamemode_training_default_combat",
                "brush_gamemode_training_default_speed",
                "brush_headline_warmup",
                "brush_headline_training",
                "brush_gamemode_edge_1",
                "brush_gamemode_edge_2"
            ];
            switcherBrushNames = ["brush_switcher_2_left", "brush_switcher_2_right"];
        }
        
        // Add scale animation for switcher brushes
        for (const switcherName of switcherBrushNames) {
            const brushes = Instance.FindEntitiesByName(switcherName);
            if (!brushes) continue;
            
            for (const brush of brushes) {
                if (!brush || !brush.IsValid()) continue;
                
                brush.SetModelScale(this.SWITCHER_SCALE_SMALL);
                
                this.switcherAnimations[`switcher_arrow_${switcherName}`] = {
                    startTime: Instance.GetGameTime(),
                    brush: brush
                };
            }
        }
        
        let animIndex = 0;
        for (const brushName of brushNames) {
            const brushes = Instance.FindEntitiesByName(brushName);
            if (!brushes) continue;
            
            for (const brush of brushes) {
                if (!brush || !brush.IsValid()) continue;
                
                brush.SetModelScale(this.SWITCHER_SCALE_SMALL);
                
                this.switcherAnimations[`switcher_${side}_${animIndex}`] = {
                    startTime: Instance.GetGameTime(),
                    brush: brush
                };
                animIndex++;
            }
        }
    }
    
    // Update switcher animations
    updateSwitcherAnimations() {
        const currentTime = Instance.GetGameTime();
        
        // Finite switcher pop-in animations (only runs when switcherAnimations has entries)
        for (const brushName in this.switcherAnimations) {
            const anim = this.switcherAnimations[brushName];
            const elapsed = currentTime - anim.startTime;
            
            if (elapsed >= this.SWITCHER_DURATION) {
                // Animation complete
                if (anim.brush && anim.brush.IsValid()) {
                    anim.brush.SetModelScale(this.SWITCHER_SCALE_NORM);
                }
                delete this.switcherAnimations[brushName];
            } else {
                // Lerp from small to normal
                const progress = elapsed / this.SWITCHER_DURATION;
                const scale = this.SWITCHER_SCALE_SMALL + (this.SWITCHER_SCALE_NORM - this.SWITCHER_SCALE_SMALL) * progress;
                if (anim.brush && anim.brush.IsValid()) {
                    anim.brush.SetModelScale(scale);
                }
            }
        }

        // Infinite loop animation — throttled to every 4 ticks (~16Hz)
        // Smooth sine/edge movement doesn't need 64Hz precision
        this.switcherLoopTick = (this.switcherLoopTick || 0) + 1;
        if (this.switcherLoopTick >= 4) {
            this.switcherLoopTick = 0;
            this.updateSwitcherLoop(currentTime);
        }
        
        // Scale-in/out animations — these all have early-return guards so the
        // function call cost is near-zero when no animation is active
        this.reactionTimeScaleUpdate();
        this.targetsBallScaleUpdate();
        this.prefireMapScaleUpdate();
        this.surfMapScaleUpdate();
        this.bhopMapScaleUpdate();
        this.kzMapScaleUpdate();
        this.prefireWallbrushScaleUpdate();
        this.saveCrosshairScaleUpdate();
    }
    
    updateSwitcherLoop(currentTime) {
        if (!this.switcherLoopActive || this.switcherLoopBrushes.length === 0) return;
        
        const time = currentTime * (2 * Math.PI / this.SWITCHER_LOOP_PERIOD);
        const sineValue = Math.sin(time); // -1 to 1
        const sineValueNorm = (sineValue + 1) / 2; // 0 to 1 for scaling
        
        // Calculate scale (adjust lerp factor for 4x fewer updates)
        const targetScale = this.SWITCHER_LOOP_SCALE_SMALL + (this.SWITCHER_SCALE_NORM - this.SWITCHER_LOOP_SCALE_SMALL) * sineValueNorm;
        this.switcherLoopScale += (targetScale - this.switcherLoopScale) * this.SWITCHER_LOOP_SPEED * 0.064;
        const rounded = parseFloat(this.switcherLoopScale.toFixed(4));

        // Edge brush: still -> quick double back-and-forth -> still -> repeat
        const edgeCycleDuration = this.EDGE_PERIOD;
        const edgePhase = (currentTime % edgeCycleDuration) / edgeCycleDuration;
        // 50% still, then 4 move segments
        const stillFrac = 0.5;
        const moveFrac = (1 - stillFrac) / 4;
        let edgeTarget;
        if (edgePhase < stillFrac) {
            edgeTarget = 0;
        } else {
            const mp = edgePhase - stillFrac;
            const seg = Math.min(3, Math.floor(mp / moveFrac));
            const t_raw = (mp - seg * moveFrac) / moveFrac;
            const t = t_raw * t_raw * (3 - 2 * t_raw); // smoothstep inlined
            if (seg === 0)      edgeTarget = t;          // 0 -> +1
            else if (seg === 1) edgeTarget = 1 - 2 * t;  // +1 -> -1
            else if (seg === 2) edgeTarget = -1 + 2 * t; // -1 -> +1
            else                edgeTarget = 1 - t;      // +1 -> 0
        }
        
        for (const entry of this.switcherLoopBrushes) {
            if (entry.brush && entry.brush.IsValid()) {
                if (entry.disabled) {
                    entry.brush.SetModelScale(0.01);
                    continue;
                }
                if (!entry.scaleOnly) {
                    const isEdge = entry.name === "brush_gamemode_edge_1" || entry.name === "brush_gamemode_edge_2" || entry.name === "brush_gamemode_edge_3" || entry.name === "brush_gamemode_edge_4";
                    let targetOffset;
                    if (isEdge) {
                        targetOffset = edgeTarget * this.EDGE_MOVE_DISTANCE * entry.direction;
                        entry.currentOffset += (targetOffset - entry.currentOffset) * this.EDGE_SPEED * 0.064;
                    } else {
                        targetOffset = sineValue * this.SWITCHER_LOOP_MOVE_DISTANCE * entry.direction;
                        entry.currentOffset += (targetOffset - entry.currentOffset) * this.SWITCHER_LOOP_SPEED * 0.064;
                    }

                    entry.brush.Teleport({
                        position: {
                            x: entry.basePos.x,
                            y: entry.basePos.y + entry.currentOffset,
                            z: entry.basePos.z
                        }
                    });
                }

                if (entry.name !== "brush_gamemode_edge_1" && entry.name !== "brush_gamemode_edge_2" && entry.name !== "brush_gamemode_edge_3" && entry.name !== "brush_gamemode_edge_4") {
                    entry.brush.SetModelScale(rounded);
                }
            }
        }
    }

    startSwitcherLoop() {
        this.switcherLoopBrushes = [];
        
        const moveBrushConfigs = [
            { name: "brush_switcher_left", direction: 1 },
            { name: "brush_switcher_right", direction: -1 },
            { name: "brush_switcher_2_left", direction: 1 },
            { name: "brush_switcher_2_right", direction: -1 },
            { name: "brush_gamemode_edge_1", direction: 1 },
            { name: "brush_gamemode_edge_2", direction: -1 },
            { name: "brush_gamemode_edge_3", direction: 1 },
            { name: "brush_gamemode_edge_4", direction: -1 }
        ];
        
        const scaleOnlyBrushNames = [
            "brush_reaction_lightning",
            "brush_reaction_exclamation",
            "brush_reaction_dots"
        ];
        
        for (const config of moveBrushConfigs) {
            const brushes = Instance.FindEntitiesByName(config.name);
            if (!brushes) continue;
            
            for (const brush of brushes) {
                if (brush && brush.IsValid()) {
                    const origin = brush.GetAbsOrigin();
                    this.switcherLoopBrushes.push({
                        brush: brush,
                        name: config.name,
                        basePos: { x: origin.x, y: origin.y, z: origin.z },
                        direction: config.direction,
                        currentOffset: 0,
                        scaleOnly: false
                    });
                }
            }
        }
        
        for (const brushName of scaleOnlyBrushNames) {
            const brushes = Instance.FindEntitiesByName(brushName);
            if (!brushes) continue;
            
            for (const brush of brushes) {
                if (brush && brush.IsValid()) {
                    this.switcherLoopBrushes.push({
                        brush: brush,
                        name: brushName,
                        scaleOnly: true
                    });
                }
            }
        }
        
        this.switcherLoopActive = true;
    }

    toggleSpawnRange(range, enable) {
        if (this.gameMode !== "gamemode_static") return;
        if (!["spawn_close", "spawn_mid", "spawn_far"].includes(range)) return;
        this.staticSpawnRanges[range] = enable;
        this.setStaticSpawnPoints();
    }

    createParticles() {
        // Position 1 (singles): 0-9
        for (let digit = 0; digit <= 9; digit++) {
            Instance.ServerCommand(
                `ent_create info_particle_system {"targetname" "percentage_1_${digit}" "origin" "0 0 0" "angles" "0 0 0" "effect_name" "particles/percentage_1_${digit}.vpcf" "start_active" "0"}`,
                0.0
            );
        }
        // Position 2 (tens): 0-9
        for (let digit = 0; digit <= 9; digit++) {
            Instance.ServerCommand(
                `ent_create info_particle_system {"targetname" "percentage_2_${digit}" "origin" "0 0 0" "angles" "0 0 0" "effect_name" "particles/percentage_2_${digit}.vpcf" "start_active" "0"}`,
                0.0
            );
        }
        // Position 3 (hundreds): only 1 (for 100%)
        Instance.ServerCommand(
            `ent_create info_particle_system {"targetname" "percentage_3_1" "origin" "0 0 0" "angles" "0 0 0" "effect_name" "particles/percentage_3_1.vpcf" "start_active" "0"}`,
            0.0
        );


    }

    setWeapon(weaponName) {
        const controller = Instance.GetPlayerController(0);
        if (!controller || !controller.IsValid()) return;
        const pawn = controller.GetPlayerPawn();
        if (!pawn || !pawn.IsValid()) return;

        if (this.validWeapons.primary.includes(weaponName)) {
            this.selectedPrimary = weaponName;
            this.savedPrimaryInput = "set_" + weaponName;
            const primaryWeapon = pawn.FindWeaponBySlot(0);
            if (primaryWeapon) pawn.DestroyWeapon(primaryWeapon);
            pawn.GiveNamedItem(this.selectedPrimary, true);
        } else if (this.validWeapons.secondary.includes(weaponName)) {
            this.selectedSecondary = weaponName;
            this.savedSecondaryInput = "set_" + weaponName;
            const secondaryWeapon = pawn.FindWeaponBySlot(1);
            Instance.ClientCommand(0, "slot2");
            if (secondaryWeapon) pawn.DestroyWeapon(secondaryWeapon);
            pawn.GiveNamedItem(this.selectedSecondary, false);
        } else if (this.validWeapons.knife.includes(weaponName)) {
            this.selectedKnifeName = weaponName;
            this.selectedKnifeId = undefined;
            const knifeWeapon = pawn.FindWeaponBySlot(2);
            if (knifeWeapon) pawn.DestroyWeapon(knifeWeapon);
            this.giveSelectedKnife(pawn);
        }

        Instance.SetSaveData(JSON.stringify(Object.assign(this.getSaveObject(), { savedPrimary: this.savedPrimaryInput, savedSecondary: this.savedSecondaryInput })));
    }

    getSaveObject() {
        let data = {};
        const raw = Instance.GetSaveData();
        if (raw && raw.length > 0) {
            try { data = JSON.parse(raw); } catch (e) { data = {}; }
        }
        return data;
    }

    loadWeaponSelection() {
        const raw = Instance.GetSaveData();

        if (!raw || raw.length === 0) {
            highlightWeaponWallbrush("set_weapon_ak47");
            this.setWeapon("weapon_ak47");
            highlightWeaponWallbrush("set_weapon_deagle");
            this.setWeapon("weapon_deagle");
            return;
        }

        let data = {};
        try { data = JSON.parse(raw); } catch (e) {
            highlightWeaponWallbrush("set_weapon_ak47");
            this.setWeapon("weapon_ak47");
            highlightWeaponWallbrush("set_weapon_deagle");
            this.setWeapon("weapon_deagle");
            return;
        }

        if (data.savedPrimary) { highlightWeaponWallbrush(data.savedPrimary); this.setWeapon(data.savedPrimary.replace("set_", "")); }
        else { highlightWeaponWallbrush("set_weapon_ak47"); this.setWeapon("weapon_ak47"); }

        if (data.savedSecondary) { highlightWeaponWallbrush(data.savedSecondary); this.setWeapon(data.savedSecondary.replace("set_", "")); }
        else { highlightWeaponWallbrush("set_weapon_deagle"); this.setWeapon("weapon_deagle"); }

        if (data.savedKnife) {
            this.setCustomKnife(data.savedKnife.id, data.savedKnife.name);
        }
    }

    setCustomKnife(id, knifeName) {
        this.selectedKnifeId = id;
        this.selectedKnifeName = knifeName || "default";
        const controller = Instance.GetPlayerController(0);
        if (!controller || !controller.IsValid()) return;
        const pawn = controller.GetPlayerPawn();
        if (!pawn || !pawn.IsValid()) return;
        const knifeWeapon = pawn.FindWeaponBySlot(2);
        if (knifeWeapon) pawn.DestroyWeapon(knifeWeapon);
        this.giveSelectedKnife(pawn);
        Instance.ClientCommand(0, "slot3");

        if (knifeName) {
            Instance.ServerCommand(`ent_fire relay_knife_${knifeName} trigger`);
            const data = this.getSaveObject();
            data.savedKnife = { id: id, name: knifeName };
            Instance.SetSaveData(JSON.stringify(data));
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

    movement_exit() {
        const controller = Instance.GetPlayerController(0);
        if (!controller || !controller.IsValid()) return;
        const pawn = controller.GetPlayerPawn();
        if (!pawn || !pawn.IsValid()) return;

        pawn.Teleport({ velocity: { x: 0, y: 0, z: 0 } });
        pawn.DestroyWeapons();
        pawn.GiveNamedItem(this.selectedPrimary, true);
        pawn.GiveNamedItem(this.selectedSecondary, false);
        this.giveSelectedKnife(pawn);

        const modeToRestore = this.lastNonMovementMode || "gamemode_static";
        this.setGameMode(modeToRestore);
        
        Instance.ServerCommand(`ent_fire particle_movement stop`);
        this.cleanupEntities();
        this.hudTick = 0;
    }

    setGamemodeWeapons() {
        const controller = Instance.GetPlayerController(0);
        if (!controller || !controller.IsValid()) return;
        const pawn = controller.GetPlayerPawn();
        if (!pawn || !pawn.IsValid()) return;

        pawn.DestroyWeapons();
        pawn.GiveNamedItem("weapon_usp_silencer", false);
        this.giveSelectedKnife(pawn);
        Instance.ClientCommand(0, "slot2");
    }

    setGamemodeWeaponsNone() {
        const controller = Instance.GetPlayerController(0);
        if (!controller || !controller.IsValid()) return;
        const pawn = controller.GetPlayerPawn();
        if (!pawn || !pawn.IsValid()) return;

        pawn.DestroyWeapons();
        const knifeWeapon = pawn.FindWeaponBySlot(2);
        if (knifeWeapon) pawn.DestroyWeapon(knifeWeapon);
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

        if (this.velocityLocked) {
            if (Instance.GetGameTime() < this.velocityLockEndTime) {
                pawn.Teleport({ velocity: { x: 0, y: 0, z: 0 } });
            } else {
                this.velocityLocked = false;
            }
        }

        // Noclip handling for movement modes only
        if (MOVEMENT_MODES[this.gameMode] && pawn.IsNoclipping()) {
            if (!this.noclipDetected && this.isActive) {
                this.noclipDetected = true;
                Instance.ServerCommand(`say_team Noclip detected, timer stopped!`, 0.0);
                Instance.ServerCommand(`ent_fire snd_noclip startsound`);
                hideTimer();
                hideKzSpeed();
                hideKzJumpSpeed();
            }
        } else {
            this.noclipMessageShown = false;
        }

        // Timer and movement logic for active modes
        if (this.isActive && this.gameMode !== "gamemode_static" && this.gameMode !== "gamemode_dynamic") {
            if (this.gameMode !== "gamemode_rush") {
                this.oldPlayerPos = [...this.playerPos];
                const pos = pawn.GetAbsOrigin() || { x: 0, y: 0, z: 0 };
                this.playerPos = [pos.x, pos.y, pos.z];
                const distance = Math.sqrt(
                    (this.playerPos[0] - this.oldPlayerPos[0]) ** 2 +
                    (this.playerPos[1] - this.oldPlayerPos[1]) ** 2 +
                    (this.playerPos[2] - this.oldPlayerPos[2]) ** 2
                );

                if (!this.noclipDetected) {
                    this.tickCount++;

                    // Check if PB was missed mid-run for movement modes
                    if (!this.missedPB && this.movementPB !== undefined && MOVEMENT_MODES[this.gameMode]) {
                        const currentTime = this.tickCount * this.TICK_INTERVAL;
                        if (currentTime >= this.movementPB) {
                            this.missedPB = true;
                            Instance.ServerCommand(`ent_fire snd_noclip startsound`);
                            setTimerColor(255, 50, 50);
                        }
                    }
                }

                if (distance >= 50) {
                    this.isTeleporting = true;
                    if (this.gameMode === "gamemode_kz") {
                        this.isInAir = false;
                    }
                } else {
                    this.isTeleporting = false;
                }

                // Speedometer (surf / bhop)
                if (this.gameMode === "gamemode_surf" || this.gameMode === "gamemode_bhop") {
                    this.currentTick++;
                    if (this.currentTick >= this.UPDATE_INTERVAL_TICKS) {
                        if (distance > this.MIN_DISTANCE && distance < this.MAX_TELEPORT_DISTANCE) {
                            let velocity = this.calculateVelocity();
                            if (velocity < this.STILL_THRESHOLD) {
                                velocity = 0;
                                this.updateSpeedDisplay(0);
                            } else {
                                this.currentVelocity = velocity;
                                this.velocityChange = this.currentVelocity - this.lastVelocity;
                                this.lastVelocity = this.currentVelocity;
                                this.updateSpeedDisplay(this.currentVelocity);
                            }
                        } else {
                            this.updateSpeedDisplay(0);
                        }
                        this.currentTick = 0;
                    }
                }


                // KZ Speedometer
                if (this.gameMode === "gamemode_kz") {
                    this.kzSpeedTick++;
                    if (this.kzSpeedTick >= 2) {
                        if (distance < this.MAX_TELEPORT_DISTANCE) {
                            var kzVel = this.calculateVelocityRaw();
                            if (this.kzPerfActive && this.kzJumpSpeedHideTime > 0 && Instance.GetGameTime() < this.kzJumpSpeedHideTime) {
                                renderKzSpeed(kzVel, 252, 214, 3);
                            } else {
                                this.kzPerfActive = false;
                                renderKzSpeed(kzVel, 255, 255, 255);
                            }
                        } else {
                            renderKzSpeed(0, 255, 255, 255);
                        }
                        this.kzSpeedTick = 0;
                    }
                }

                // KZ Jump Speed (capture 1 tick after jump)
                if (this.gameMode === "gamemode_kz") {
                    if (this.kzJumpCaptureNextTick) {
                        this.kzJumpCaptureNextTick = false;
                        // Only show jump speed if player was airborne before landing (actual bhop)
                        if (this.kzWasInAir && this.kzLandTime > 0) {
                            // Use engine velocity for accurate speed
                            var jumpVelVec = pawn.GetAbsVelocity();
                            var jumpVel = jumpVelVec ? Math.sqrt(jumpVelVec.x * jumpVelVec.x + jumpVelVec.y * jumpVelVec.y) : 0;
                            // Only count as bhop if jumped within 4 ticks of landing
                            var ticksSinceLand = (Instance.GetGameTime() - this.kzLandTime) / this.TICK_INTERVAL;
                            if (ticksSinceLand <= 4) {
                                // Perf: takeoff speed >= land speed
                                var isPerf = (this.kzLandSpeed > 0 && jumpVel >= this.kzLandSpeed * 0.99);
                                if (isPerf) {
                                    renderKzJumpSpeed(jumpVel, 252, 214, 3);
                                    this.kzPerfActive = true;
                                    renderKzSpeed(jumpVel, 252, 214, 3);
                                } else {
                                    renderKzJumpSpeed(jumpVel, 255, 255, 255);
                                    this.kzPerfActive = false;
                                }
                                this.kzJumpSpeedHideTime = Instance.GetGameTime() + 1.0;
                            }
                        }
                    } else if (this.kzJumpSpeedHideTime > 0 && Instance.GetGameTime() >= this.kzJumpSpeedHideTime) {
                        hideKzJumpSpeed();
                        this.kzJumpSpeedHideTime = 0;
                        this.kzPerfActive = false;
                    }
                }
            } else {
                if (!this.noclipDetected) {
                    this.tickCount++;
                }
            }

            // Particle timer
            if (MOVEMENT_MODES[this.gameMode] && !this.noclipDetected) {
                var elapsed = this.tickCount * this.TICK_INTERVAL;
                renderTimer(elapsed);
            }
        }

        // Target ball spawns
        const currentTime = Instance.GetGameTime();
        for (let i = this.targetsPendingSpawns.length - 1; i >= 0; i--) {
            const pending = this.targetsPendingSpawns[i];
            if (currentTime >= pending.executeTime) {
                this.targetsFinishSpawn(pending.ballName, pending.sphere, pending.isInitBall);
                this.targetsPendingSpawns.splice(i, 1);
            }
        }
        
        // Check for spray reset
        if (this.sprayActive && this.gameMode === "gamemode_spray") {
            this.sprayTryInitializeBot();
            
            this.sprayCheckReset();
            
            // Check if percentage should be hidden after completion
            if (this.sprayPercentageHideTime > 0 && currentTime >= this.sprayPercentageHideTime) {
                this.stopPercentageDisplay();
                this.sprayPercentageHideTime = 0;
            }
            
            this.hudTick++;
            if (this.hudTick >= this.HUD_INTERVAL_TICKS) {
                this.sprayUpdateHud();
                this.hudTick = 0;
            }
        }
        
        // Update combat mode
        if (this.combatActive && this.gameMode === "gamemode_combat") {
            if (!this.combatBotsInitialized && Instance.GetGameTime() >= this.combatInitTime) {
                this.combatTeleportBotsToHidden();
                this.combatBotsInitialized = true;
            }
            
            if (this.combatPendingTeleport && Instance.GetGameTime() >= this.combatTeleportTime) {
                this.combatTeleportPlayerToMain();
                this.combatPendingTeleport = false;
            }
        }

        // Re-show hudhint periodically for combat and rush (keeps it visible without recreating)
        if ((this.combatActive && this.gameMode === "gamemode_combat") || (this.isActive && this.gameMode === "gamemode_rush")) {
            this.hudTick++;
            if (this.hudTick >= this.HUD_INTERVAL_TICKS) {
                if (this.lastHudMessage !== "") {
                    Instance.ServerCommand(`ent_fire timer_hudhint showhudhint`, 0.0);
                }
                this.hudTick = 0;
            }
        }
        
        // Update reaction time mode
        if (this.reactionActive && this.gameMode === "gamemode_reaction") {
            this.reactionCheckGreenScreen();
        }
        
        if (this.speedActive && this.gameMode === "gamemode_speed") {
            this.hudTick++;
            if (this.hudTick >= this.HUD_INTERVAL_TICKS) {
                this.speedUpdateHud();
                this.hudTick = 0;
            }
        }
        
        this.updateClock();

        // Process delayed actions
        const now = Instance.GetGameTime();
        for (let i = this.delayedActions.length - 1; i >= 0; i--) {
            if (now >= this.delayedActions[i].time) {
                this.delayedActions[i].action();
                this.delayedActions.splice(i, 1);
            }
        }

        Instance.SetNextThink(Instance.GetGameTime() + this.TICK_INTERVAL, "UpdateTime");
        
		this.updateScaleBrushes();
		this.updateSwitcherAnimations();
    }

    static_Start() {
        this.isActive = false;
        this.gameMode = "gamemode_static";
        this.tickCount = 0;
        this.kills = 0;
        this.Fails = 0;
        this.Jumps = 0;
        this.currentTick = 0;
        this.hudTick = 0;
        this.noclipDetected = false;
        this.noclipMessageShown = false;

        this.cleanupGamemodeProps();

        this.numBots = Math.max(1, Math.min(15, this.staticNumBots));
        Instance.ServerCommand(`bot_quota ${this.numBots}`);
        Instance.ServerCommand(`ent_fire brush_botcounter SetRenderAttribute count=${this.numBots}`);
        Instance.ServerCommand(`ent_fire button_add_bot Enable`);
        Instance.ServerCommand(`ent_fire button_remove_bot Enable`);
        Instance.ServerCommand(`custom_bot_difficulty 0`);
        
        this.setStaticSpawnPoints();
        
        if (this.currentLeftCategory === "training") {
            Instance.ServerCommand(`ent_fire visbox_bot_distance Enable`);
            Instance.ServerCommand(`ent_fire button_static_distance_* Lock`);
        } else {
            Instance.ServerCommand(`ent_fire visbox_bot_distance Disable`);
            Instance.ServerCommand(`ent_fire button_static_distance_* Unlock`);
        }
        
        Instance.ServerCommand(`ent_fire brush_botcounter_static Enable`);
    }

    dynamic_Start() {
        this.isActive = true;
        this.gameMode = "gamemode_dynamic";
        this.tickCount = 0;
        this.kills = 0;
        this.Fails = 0;
        this.Jumps = 0;
        this.currentTick = 0;
        this.hudTick = 0;
        this.noclipDetected = false;
        this.noclipMessageShown = false;

        this.cleanupGamemodeProps();

        this.numBots = Math.max(1, Math.min(15, this.dynamicNumBots));
        Instance.ServerCommand(`bot_quota ${this.numBots}`);
        Instance.ServerCommand(`ent_fire brush_botcounter SetRenderAttribute count=${this.numBots}`);
        Instance.ServerCommand(`ent_fire button_add_bot Enable`);
        Instance.ServerCommand(`ent_fire button_remove_bot Enable`);
        Instance.ServerCommand(`custom_bot_difficulty 2`);
        
        Instance.ServerCommand(`ent_fire spawn_dynamic SetEnabled`);
        Instance.ServerCommand(`ent_fire props_gamemode_dynamic Enable`);
        Instance.ServerCommand(`ent_fire props_gamemode_dynamic EnableCollision`);
        
        Instance.ServerCommand(`ent_fire brush_botcounter_dynamic Enable`);
    }

    rush_Start() {
        const controller = Instance.GetPlayerController(0);
        if (!controller || !controller.IsValid()) return;

        this.isActive = true;
        this.gameMode = "gamemode_rush";
        this.kills = 0;
        this.tickCount = 0;
        this.Fails = 0;
        this.Jumps = 0;
        this.currentTick = 0;
        this.hudTick = 0;
        this.noclipDetected = false;
        this.noclipMessageShown = false;

        this.cleanupGamemodeProps();

        this.numBots = Math.max(1, Math.min(15, this.rushNumBots));
        Instance.ServerCommand(`bot_quota ${this.numBots}`);
        Instance.ServerCommand(`ent_fire brush_botcounter SetRenderAttribute count=${this.numBots}`);
        Instance.ServerCommand(`ent_fire button_add_bot Enable`);
        Instance.ServerCommand(`ent_fire button_remove_bot Enable`);
        Instance.ServerCommand(`custom_bot_difficulty 1`);
        
        this.teleportAllBots();
        Instance.ServerCommand(`ent_fire snd_start startsound`);
        
        Instance.ServerCommand(`ent_fire spawn_rush SetEnabled`);
        Instance.ServerCommand(`ent_fire prop_rush_crates Enable`);
        Instance.ServerCommand(`ent_fire prop_rush_crates EnableCollision`);
        Instance.ServerCommand(`ent_fire push_rush_* Enable`);
        Instance.ServerCommand(`ent_fire trigger_teleport_bot_rush Enable`);
        Instance.ServerCommand(`ent_fire brush_rush_border Enable`);
        Instance.ServerCommand(`ent_fire brush_rush_playerblocker Enable`);
        
        Instance.ServerCommand(`ent_fire brush_botcounter_rush Enable`);
        this.Hud();
    }

    spray_Start() {
        const controller = Instance.GetPlayerController(0);
        if (!controller || !controller.IsValid()) return;
        const pawn = controller.GetPlayerPawn();
        if (!pawn || !pawn.IsValid()) return;

        this.gameMode = "gamemode_spray";
        this.isActive = true;
        this.sprayActive = true;
        this.sprayShotsFired = 0;
        this.sprayShotsHit = 0;
        this.sprayStarted = false;
        this.sprayLastShotTime = 0;
        this.hudTick = 0;
        this.sprayBotInitialized = false;
        this.sprayBot = null;
        this.sprayInitRetryCount = 0;
        this.sprayInitTime = Instance.GetGameTime() + 0.5;
        this.sprayLastDisplayedPercentage = -1;
        this.sprayPercentageHideTime = 0;
        
        this.cleanupGamemodeProps();
        this.stopPercentageDisplay();
        
        Instance.ServerCommand(`bot_quota 0`);
        Instance.ServerCommand(`ent_fire brush_botcounter SetRenderAttribute count=0`);
        Instance.ServerCommand(`ent_fire button_add_bot Disable`);
        Instance.ServerCommand(`ent_fire button_remove_bot Disable`);

        if (this.currentRightCategory === "movement") {
            Instance.ServerCommand(`ent_fire visbox_spray_distance Enable`);
            Instance.ServerCommand(`ent_fire button_spray_distance_* Lock`);
        } else {
            Instance.ServerCommand(`ent_fire visbox_spray_distance Disable`);
            Instance.ServerCommand(`ent_fire button_spray_distance_* Unlock`);
        }
        
        Instance.ServerCommand(`ent_fire brush_rush_playerblocker Enable`);
        Instance.ServerCommand(`ent_fire brush_rush_border Enable`);
        
        Instance.ServerCommand(`ent_fire visbox_botcounter Enable`);
        Instance.ServerCommand(`ent_fire brush_clock_* Enable`);
        
        if (this.sprayTeleportTarget === "teleport_gamemode_spray_near") {
            Instance.ServerCommand(`ent_fire brush_gamemode_spray_near Enable`);
        } else if (this.sprayTeleportTarget === "teleport_gamemode_spray_mid") {
            Instance.ServerCommand(`ent_fire brush_gamemode_spray_mid Enable`);
        } else if (this.sprayTeleportTarget === "teleport_gamemode_spray_far") {
            Instance.ServerCommand(`ent_fire brush_gamemode_spray_far Enable`);
        }
        
        Instance.ServerCommand(`bot_quota 1`);
        Instance.ServerCommand(`custom_bot_difficulty 0`);
        
        this.sprayUpdateHud();
    }
    
    sprayTryInitializeBot() {
        if (!this.sprayActive || this.gameMode !== "gamemode_spray") return;
        if (this.sprayBotInitialized) return;
        
        const currentTime = Instance.GetGameTime();
        if (currentTime < this.sprayInitTime) return;
        
        for (let i = 0; i < 64; i++) {
            const ctrl = Instance.GetPlayerController(i);
            if (ctrl && ctrl.IsValid() && ctrl.IsBot() && ctrl.GetTeamNumber() === 3) {
                const botPawn = ctrl.GetPlayerPawn();
                if (botPawn && botPawn.IsValid()) {
                    this.sprayBot = botPawn;
                    this.sprayBotInitialized = true;
                    
                    // Apply damage immunity
                    Instance.EntFireAtTarget({ target: this.sprayBot, input: "SetDamageFilter", value: "damageImmunity" });
                    
                    this.sprayTeleportBot();
                    return;
                }
            }
        }
        
        // Bot not found, retry
        this.sprayInitRetryCount++;
        if (this.sprayInitRetryCount < 10) {
            this.sprayInitTime = currentTime + 0.5;
        }
    }
    
    sprayTeleportBot() {
        if (this.gameMode !== "gamemode_spray") return;
        if (!this.sprayBot || !this.sprayBot.IsValid()) return;

        const teleportPoint = Instance.FindEntityByName(this.sprayTeleportTarget);
        if (teleportPoint && teleportPoint.IsValid()) {
            const pos = teleportPoint.GetAbsOrigin();
            this.sprayBot.Teleport({
                position: pos,
                angles: { x: 0, y: 180, z: 0 },
                velocity: { x: 0, y: 0, z: 0 }
            });
        }
    }
    
    spraySetSpawnNear() {
        this.sprayTeleportTarget = "teleport_gamemode_spray_near";
        this.sprayTeleportBot();
        
        Instance.ServerCommand(`ent_fire snd_spray_move startsound`);
        
        Instance.ServerCommand(`ent_fire brush_gamemode_spray_near Enable`);
        Instance.ServerCommand(`ent_fire brush_gamemode_spray_mid Disable`);
        Instance.ServerCommand(`ent_fire brush_gamemode_spray_far Disable`);
    }
    
    spraySetSpawnMid() {
        this.sprayTeleportTarget = "teleport_gamemode_spray_mid";
        this.sprayTeleportBot();
        
        Instance.ServerCommand(`ent_fire snd_spray_move startsound`);
        
        Instance.ServerCommand(`ent_fire brush_gamemode_spray_near Disable`);
        Instance.ServerCommand(`ent_fire brush_gamemode_spray_mid Enable`);
        Instance.ServerCommand(`ent_fire brush_gamemode_spray_far Disable`);
    }
    
    spraySetSpawnFar() {
        this.sprayTeleportTarget = "teleport_gamemode_spray_far";
        this.sprayTeleportBot();
        
        Instance.ServerCommand(`ent_fire snd_spray_move startsound`);
        
        Instance.ServerCommand(`ent_fire brush_gamemode_spray_near Disable`);
        Instance.ServerCommand(`ent_fire brush_gamemode_spray_mid Disable`);
        Instance.ServerCommand(`ent_fire brush_gamemode_spray_far Enable`);
    }
    
    sprayDisableAllBrushes() {
        Instance.ServerCommand(`ent_fire brush_gamemode_spray_near Disable`);
        Instance.ServerCommand(`ent_fire brush_gamemode_spray_mid Disable`);
        Instance.ServerCommand(`ent_fire brush_gamemode_spray_far Disable`);
    }
    
    sprayGiveWeapon() {
        const controller = Instance.GetPlayerController(0);
        if (!controller || !controller.IsValid()) return;
        const pawn = controller.GetPlayerPawn();
        if (!pawn || !pawn.IsValid()) return;
        
        // Valid spray weapons
        const validSprayWeapons = [
            "weapon_ak47", "weapon_m4a1_silencer", "weapon_m4a1", 
            "weapon_famas", "weapon_galilar", "weapon_sg556", "weapon_aug",
            "weapon_mp9", "weapon_mac10", "weapon_mp7", "weapon_mp5sd",
            "weapon_ump45", "weapon_p90", "weapon_bizon",
            "weapon_negev", "weapon_m249"
        ];
        
        if (!validSprayWeapons.includes(this.sprayCurrentWeapon)) return;
        
        const primaryWeapon = pawn.FindWeaponBySlot(0);
        if (primaryWeapon) pawn.DestroyWeapon(primaryWeapon);
        pawn.GiveNamedItem(this.sprayCurrentWeapon, true);
    }
    
    // Check if player is holding a valid spray weapon
    sprayIsHoldingValidWeapon() {
        const controller = Instance.GetPlayerController(0);
        if (!controller || !controller.IsValid()) return false;
        const pawn = controller.GetPlayerPawn();
        if (!pawn || !pawn.IsValid()) return false;
        
        const activeWeapon = pawn.GetActiveWeapon();
        if (!activeWeapon || !activeWeapon.IsValid()) return false;
        
        const weaponData = activeWeapon.GetData();
        if (!weaponData) return false;
        
        const weaponName = weaponData.GetName();
        
        const validSprayWeapons = [
            "weapon_ak47", "weapon_m4a1_silencer", "weapon_m4a1", 
            "weapon_famas", "weapon_galilar", "weapon_sg556", "weapon_aug",
            "weapon_mp9", "weapon_mac10", "weapon_mp7", "weapon_mp5sd",
            "weapon_ump45", "weapon_p90", "weapon_bizon",
            "weapon_negev", "weapon_m249"
        ];
        
        return validSprayWeapons.includes(weaponName);
    }
    
    spraySetWeapon(weaponName) {
        if (this.weaponMagazineSizes[weaponName] !== undefined) {
            this.sprayCurrentWeapon = weaponName;
            
            this.sprayShotsFired = 0;
            this.sprayShotsHit = 0;
            this.sprayStarted = false;
            
            if (this.sprayActive && this.gameMode === "gamemode_spray") {
                this.sprayGiveWeapon();
                this.sprayUpdateHud();
            }
        }
    }
    
    sprayShotFired() {
        if (!this.sprayActive || this.gameMode !== "gamemode_spray") return;
        
        if (!this.sprayIsHoldingValidWeapon()) return;
        
        if (!this.sprayStarted) return;
        
        const controller = Instance.GetPlayerController(0);
        if (!controller || !controller.IsValid()) return;
        const pawn = controller.GetPlayerPawn();
        if (!pawn || !pawn.IsValid()) return;
        const activeWeapon = pawn.GetActiveWeapon();
        if (!activeWeapon || !activeWeapon.IsValid()) return;
        const weaponData = activeWeapon.GetData();
        if (!weaponData) return;
        
        const currentTime = Instance.GetGameTime();
        
        this.sprayShotsFired++;
        this.sprayLastShotTime = currentTime;
        
        // Check if spray is complete
        const magSize = this.weaponMagazineSizes[this.sprayCurrentWeapon] || 30;
        if (this.sprayShotsFired >= magSize) {
            this.sprayComplete();
        } else {
            this.sprayUpdateHud();
        }
    }
    
    sprayShotHit() {
        if (!this.sprayActive || this.gameMode !== "gamemode_spray") return;
        
        // Ignore hits if not holding a valid weapon
        if (!this.sprayIsHoldingValidWeapon()) return;
        
        const currentTime = Instance.GetGameTime();

        Instance.ServerCommand(`ent_fire snd_spray_hit startsound`);

        if (!this.sprayStarted) {
            const controller = Instance.GetPlayerController(0);
            if (!controller || !controller.IsValid()) return;
            const pawn = controller.GetPlayerPawn();
            if (!pawn || !pawn.IsValid()) return;
            const activeWeapon = pawn.GetActiveWeapon();
            if (!activeWeapon || !activeWeapon.IsValid()) return;
            const weaponData = activeWeapon.GetData();
            if (!weaponData) return;
            
            this.sprayCurrentWeapon = weaponData.GetName();
            this.sprayStarted = true;
            this.sprayShotsFired = 1;
            this.sprayShotsHit = 1;
            this.sprayLastShotTime = currentTime;
            this.sprayPercentageHideTime = 0; // Cancel any pending hide
            this.sprayUpdateHud();
            
            // Update percentage display (first hit = starting percentage)
            const magSize = this.weaponMagazineSizes[this.sprayCurrentWeapon] || 30;
            const percentage = Math.floor((this.sprayShotsHit / magSize) * 100);
            this.updatePercentageDisplay(percentage);
            return;
        }
        
        this.sprayShotsHit++;
        this.sprayUpdateHud();
        
        // Update percentage display
        const magSize = this.weaponMagazineSizes[this.sprayCurrentWeapon] || 30;
        const percentage = Math.floor((this.sprayShotsHit / magSize) * 100);
        this.updatePercentageDisplay(percentage);
    }
    
    sprayCheckReset() {
        if (!this.sprayActive || this.gameMode !== "gamemode_spray") return;
        if (!this.sprayStarted) return;
        
        const currentTime = Instance.GetGameTime();
        const timeSinceLastShot = currentTime - this.sprayLastShotTime;
        
        const magSize = this.weaponMagazineSizes[this.sprayCurrentWeapon] || 30;
        if (timeSinceLastShot > this.SPRAY_RESET_DELAY && this.sprayShotsFired < magSize && this.sprayShotsFired > 0) {
            this.sprayDoReset();
        }
    }
    
    sprayDoReset() {
        if (!this.sprayActive || this.gameMode !== "gamemode_spray") return;
        
        Instance.ServerCommand(`ent_fire relay_gamemode_spray_reset trigger`);
    }
    
    sprayResetFromInput() {
        if (!this.sprayActive || this.gameMode !== "gamemode_spray") return;
        
        this.sprayShotsFired = 0;
        this.sprayShotsHit = 0;
        this.sprayStarted = false;
        
        this.sprayGiveWeapon();
        
        this.sprayUpdateHud();
        this.stopPercentageDisplay();
    }
    
    sprayComplete() {
        if (!this.sprayActive || this.gameMode !== "gamemode_spray") return;
        
        Instance.ServerCommand(`ent_fire relay_gamemode_spray_finish trigger`);
    }
    
    sprayFinishFromInput() {
        if (!this.sprayActive || this.gameMode !== "gamemode_spray") return;
        
        const magSize = this.weaponMagazineSizes[this.sprayCurrentWeapon] || 30;
        const weaponName = this.weaponDisplayNames[this.sprayCurrentWeapon] || this.sprayCurrentWeapon;
        const accuracy = magSize > 0 ? ((this.sprayShotsHit / magSize) * 100).toFixed(1) : "0.0";
        
        // Spawn confetti if 100% accuracy
        if (this.sprayShotsHit >= magSize && this.sprayBot && this.sprayBot.IsValid()) {
            const botPos = this.sprayBot.GetAbsOrigin();
            Instance.ServerCommand(
                `ent_create info_particle_system {"targetname" "spray_confetti" "origin" "${botPos.x} ${botPos.y} ${botPos.z + 50}" "angles" "0 0 0" "effect_name" "particles/weapons/cs_weapon_fx/weapon_confetti_balloons.vpcf" "start_active" "1"}`,
                0.0
            );
            Instance.ServerCommand(`ent_fire spray_confetti kill`, 3.0);
        }
        
        Instance.ServerCommand(`say_team ${weaponName}: ${this.sprayShotsHit}/${magSize} - ${accuracy}%`);
        
        this.sprayShotsFired = 0;
        this.sprayShotsHit = 0;
        this.sprayStarted = false;
        
        this.sprayGiveWeapon();
        
        this.sprayUpdateHud();
        this.sprayPercentageHideTime = Instance.GetGameTime() + 0.0;
    }
    
    sprayUpdateHud() {
        if (!this.sprayActive || this.gameMode !== "gamemode_spray") return;
        
        let message = "";
        
        if (!this.sprayIsHoldingValidWeapon()) {
            message = `Please equip a valid weapon!`;
        } else if (!this.sprayStarted) {
            const controller = Instance.GetPlayerController(0);
            const pawn = controller?.GetPlayerPawn();
            const activeWeapon = pawn?.GetActiveWeapon();
            const weaponData = activeWeapon?.GetData();
            const weaponName = weaponData?.GetName();
            const displayName = this.weaponDisplayNames[weaponName] || weaponName || "Unknown";
            
            message = `${displayName}\rSpray the bot to start!`;
        } else {
            const magSize = this.weaponMagazineSizes[this.sprayCurrentWeapon] || 30;
            const displayName = this.weaponDisplayNames[this.sprayCurrentWeapon] || this.sprayCurrentWeapon;
            
            message = `${displayName}\r${this.sprayShotsFired}/${magSize}`;
        }
        
        Instance.ServerCommand(`ent_create env_hudhint {"targetname" "timer_hudhint" "message" "${message}"}`, 0.0);
        Instance.ServerCommand(`ent_fire timer_hudhint showhudhint`, 0.0);
        Instance.ServerCommand(`ent_fire timer_hudhint kill`, 0.1);
    }
    
    updatePercentageDisplay(percentage) {
        if (!this.sprayActive || this.gameMode !== "gamemode_spray") return;
        
        // Clamp percentage
        percentage = Math.max(0, Math.min(100, Math.floor(percentage)));
        
        if (percentage === this.sprayLastDisplayedPercentage) return;
        
        Instance.ServerCommand(`ent_fire percentage_* Stop`, 0.0);
        
        if (percentage === 100) {
            Instance.ServerCommand(`ent_fire percentage_3_1 Start`, 0.0);
            Instance.ServerCommand(`ent_fire percentage_2_0 Start`, 0.0);
            Instance.ServerCommand(`ent_fire percentage_1_0 Start`, 0.0);
        } else if (percentage === 0) {
            Instance.ServerCommand(`ent_fire percentage_1_0 Start`, 0.0);
        } else {
            const singles = percentage % 10;
            const tens = Math.floor(percentage / 10) % 10;
            
            Instance.ServerCommand(`ent_fire percentage_1_${singles} Start`, 0.0);
            
            if (percentage >= 10) {
                Instance.ServerCommand(`ent_fire percentage_2_${tens} Start`, 0.0);
            }
        }
        
        this.sprayLastDisplayedPercentage = percentage;
    }
    
    stopPercentageDisplay() {
        Instance.ServerCommand(`ent_fire percentage_* Stop`, 0.0);
        this.sprayLastDisplayedPercentage = -1;
    }
    
    sprayExit() {
        if (!this.sprayActive) return;
        
        this.sprayActive = false;
        this.sprayStarted = false;
        this.sprayShotsFired = 0;
        this.sprayShotsHit = 0;
        
        Instance.ServerCommand(`ent_fire timer_hudhint kill`);
        this.stopPercentageDisplay();
        
        if (this.sprayBot && this.sprayBot.IsValid()) {
            Instance.EntFireAtTarget({ target: this.sprayBot, input: "SetDamageFilter", value: "" });
        }
        
        this.sprayBot = null;
        this.sprayBotInitialized = false;
        
        this.sprayDisableAllBrushes();
        
        Instance.ServerCommand(`ent_fire visbox_spray_distance Enable`);
        Instance.ServerCommand(`ent_fire button_spray_distance_* Lock`);
    }
    
    reaction_Start() {
        this.gameMode = "gamemode_reaction";
        this.isActive = false;
        this.reactionActive = true;
        this.reactionState = 0;
        this.reactionGreenTime = 0;
        this.reactionStartTime = 0;
        this.reactionLastTime = 0;
        this.reactionTotalTime = 0;
        this.reactionAttempts = 0;
        
        this.cleanupGamemodeProps();
        
        Instance.ServerCommand(`bot_quota 0`);
        Instance.ServerCommand(`ent_fire brush_botcounter SetRenderAttribute count=0`);
        Instance.ServerCommand(`ent_fire button_add_bot Disable`);
        Instance.ServerCommand(`ent_fire button_remove_bot Disable`);
        
        Instance.ServerCommand(`ent_fire prop_reaction_time Enable`);
        Instance.ServerCommand(`ent_fire prop_reaction_time EnableCollision`);
        
        Instance.ServerCommand(`ent_fire brush_rush_playerblocker Enable`);
        Instance.ServerCommand(`ent_fire brush_rush_border Enable`);

        Instance.ServerCommand(`ent_fire visbox_botcounter Enable`);
        Instance.ServerCommand(`ent_fire brush_clock_* Enable`);
        
        this.reactionSetScreen(1);
        this.reactionSetWorldText("");
    }
    
    reactionSetScreen(skinNumber) {
        Instance.ServerCommand(`ent_fire prop_reaction_time skin ${skinNumber}`);
        
        this.reactionTimeScaling = false;
        
        Instance.ServerCommand(`ent_fire brush_reaction_lightning Disable`);
        Instance.ServerCommand(`ent_fire brush_reaction_dots Disable`);
        Instance.ServerCommand(`ent_fire brush_reaction_exclamation Disable`);
        Instance.ServerCommand(`ent_fire brush_reaction_time Disable`);
        
        if (skinNumber === 1) {
            // Welcome screen
            Instance.ServerCommand(`ent_fire brush_reaction_lightning Enable`);
        } else if (skinNumber === 2 || skinNumber === 3) {
            // Wait for green
            Instance.ServerCommand(`ent_fire brush_reaction_dots Enable`);
        } else if (skinNumber === 4) {
            // Too soon screen
            Instance.ServerCommand(`ent_fire brush_reaction_exclamation Enable`);
        } else if (skinNumber === 5) {
            // Results screen
            this.reactionTimeScaleUp();
        }
    }
    
    reactionTimeScaleUp() {
        // Cache the brush references at animation start
        this.reactionTimeBrushes = Instance.FindEntitiesByName("brush_reaction_time");
        if (!this.reactionTimeBrushes) return;
        
        for (const brush of this.reactionTimeBrushes) {
            if (brush && brush.IsValid()) {
                brush.SetModelScale(0.01);
            }
        }
        
        Instance.ServerCommand(`ent_fire brush_reaction_time Enable`);
        
        this.reactionTimeScale = 0.01;
        this.reactionTimeScaling = true;
    }
    
    reactionTimeScaleUpdate() {
        if (!this.reactionTimeScaling) return;
        
        this.reactionTimeScale += (1.0 - this.reactionTimeScale) * 0.15;
        
        const rounded = parseFloat(this.reactionTimeScale.toFixed(4));
        
        // Use cached brush references instead of per-tick FindEntitiesByName
        const brushes = this.reactionTimeBrushes;
        if (brushes) {
            for (const brush of brushes) {
                if (brush && brush.IsValid()) {
                    brush.SetModelScale(rounded);
                }
            }
        }
        
        if (rounded >= 0.99) {
            this.reactionTimeScaling = false;
            this.reactionTimeScale = 1.0;
            if (brushes) {
                for (const brush of brushes) {
                    if (brush && brush.IsValid()) {
                        brush.SetModelScale(1.0);
                    }
                }
            }
        }
    }
    
    reactionSetWorldText(text) {
        Instance.EntFireAtName({ name: "worldtext_reaction_time", input: "SetMessage", value: text });
    }
    
    saveCrosshairScaleUp() {
        // Cache brush references at animation start
        this.saveCrosshairBrushes = Instance.FindEntitiesByName("save_crosshair_*");
        if (!this.saveCrosshairBrushes) return;
        
        for (const brush of this.saveCrosshairBrushes) {
            if (brush && brush.IsValid()) {
                brush.SetModelScale(0.01);
            }
        }
        
        Instance.ServerCommand(`ent_fire save_crosshair_* Enable`);
        Instance.ServerCommand(`ent_fire save_crosshair_* EnableCollision`);
        
        this.saveCrosshairScale = 0.01;
        this.saveCrosshairScaling = true;
        this.saveCrosshairScalingUp = true;
    }
    
    saveCrosshairScaleDown() {
        // Re-cache in case entities changed
        this.saveCrosshairBrushes = Instance.FindEntitiesByName("save_crosshair_*");
        this.saveCrosshairScaling = true;
        this.saveCrosshairScalingUp = false;
    }
    
    saveCrosshairScaleUpdate() {
        if (!this.saveCrosshairScaling) return;
        
        // Use cached brush references instead of per-tick FindEntitiesByName
        const brushes = this.saveCrosshairBrushes;
        
        if (this.saveCrosshairScalingUp) {
            this.saveCrosshairScale += (1.0 - this.saveCrosshairScale) * 0.15;
            
            const rounded = parseFloat(this.saveCrosshairScale.toFixed(4));
            
            if (brushes) {
                for (const brush of brushes) {
                    if (brush && brush.IsValid()) {
                        brush.SetModelScale(rounded);
                    }
                }
            }
            
            if (rounded >= 0.99) {
                this.saveCrosshairScaling = false;
                this.saveCrosshairScale = 1.0;
                if (brushes) {
                    for (const brush of brushes) {
                        if (brush && brush.IsValid()) {
                            brush.SetModelScale(1.0);
                        }
                    }
                }
            }
        } else {
            this.saveCrosshairScale += (0.01 - this.saveCrosshairScale) * 0.15;
            
            const rounded = parseFloat(this.saveCrosshairScale.toFixed(4));
            
            if (brushes) {
                for (const brush of brushes) {
                    if (brush && brush.IsValid()) {
                        brush.SetModelScale(rounded);
                    }
                }
            }
            
            if (rounded <= 0.02) {
                this.saveCrosshairScaling = false;
                this.saveCrosshairScale = 0.01;
                
                Instance.ServerCommand(`ent_fire save_crosshair_* Disable`);
                Instance.ServerCommand(`ent_fire save_crosshair_* DisableCollision`);
                
                if (brushes) {
                    for (const brush of brushes) {
                        if (brush && brush.IsValid()) {
                            brush.SetModelScale(0.01);
                        }
                    }
                }
            }
        }
    }
    
    reactionHit() {
        if (!this.reactionActive || this.gameMode !== "gamemode_reaction") return;
        
        const currentTime = Instance.GetGameTime();
        
        switch (this.reactionState) {
            case 0:
                this.reactionState = 1;
                this.reactionSetScreen(2);
                this.reactionSetWorldText("");
                this.reactionGreenTime = currentTime + 1.0 + (Math.random() * 4.0);
                break;
                
            case 1:
                this.reactionState = 3;
                this.reactionSetScreen(4);
                this.reactionSetWorldText("");
                Instance.ServerCommand(`ent_fire snd_spray_fail startsound`);
                break;
                
            case 2:
                // Random offset within +/-1 tick to break the repeating values
                const rawMs = (currentTime - this.reactionStartTime) * 1000;
                const jitter = (Math.random() - 0.5) * 15.6 + (Math.random() - 0.5) * 15.6;
                const reactionTimeMs = Math.max(1, Math.round(rawMs + jitter));
                this.reactionLastTime = reactionTimeMs;
                this.reactionAttempts++;
                this.reactionTotalTime += reactionTimeMs;
                const averageTime = Math.floor(this.reactionTotalTime / this.reactionAttempts);
                this.reactionState = 4;
                this.reactionSetScreen(5);
                this.reactionSetWorldText(`${reactionTimeMs} ms`);
                Instance.ServerCommand(`say_team Time: ${reactionTimeMs} ms - Average: ${averageTime} ms`);
                Instance.ServerCommand(`ent_fire snd_spray_complete startsound`);
                break;
                
            case 3:
                this.reactionState = 1;
                this.reactionSetScreen(2);
                this.reactionSetWorldText("");
                this.reactionGreenTime = currentTime + 1.0 + (Math.random() * 4.0);
                break;
                
            case 4:
                this.reactionState = 1;
                this.reactionSetScreen(2);
                this.reactionSetWorldText("");
                this.reactionGreenTime = currentTime + 1.0 + (Math.random() * 4.0);
                break;
        }
    }
    
    reactionCheckGreenScreen() {
        if (!this.reactionActive || this.gameMode !== "gamemode_reaction") return;
        
        const currentTime = Instance.GetGameTime();
        
        if (this.reactionState === 1) {
            if (currentTime >= this.reactionGreenTime && this.reactionGreenTime > 0) {
                this.reactionState = 2;
                this.reactionSetScreen(3);
                this.reactionSetWorldText("");
                this.reactionStartTime = currentTime;
            }
        }
        
        if (this.reactionState === 2) {
            if (currentTime - this.reactionStartTime >= 10.0) {
                this.reactionState = 0;
                this.reactionSetScreen(1);
                this.reactionSetWorldText("");
                this.reactionGreenTime = 0;
            }
        }
    }
    
    reactionExit() {
        if (!this.reactionActive) return;
        
        this.reactionActive = false;
        this.reactionState = 0;
        this.reactionGreenTime = 0;
        this.reactionStartTime = 0;
        this.reactionTimeScaling = false;
        
        Instance.ServerCommand(`ent_fire brush_reaction_lightning Disable`);
        Instance.ServerCommand(`ent_fire brush_reaction_dots Disable`);
        Instance.ServerCommand(`ent_fire brush_reaction_exclamation Disable`);
        Instance.ServerCommand(`ent_fire brush_reaction_time Disable`);
        
        this.reactionSetWorldText("");
    }
    
    speed_Start() {
        this.gameMode = "gamemode_speed";
        this.isActive = false;
        this.speedActive = true;
        this.speedState = 0;
        this.speedKills = 0;
        this.speedStartTime = 0;
        this.speedShotsFired = 0;
        this.speedShotsHit = 0;
        
        this.cleanupGamemodeProps();
        
        this.numBots = Math.max(1, Math.min(10, this.speedNumBots));
        Instance.ServerCommand(`bot_quota ${this.numBots}`);
        Instance.ServerCommand(`ent_fire brush_botcounter SetRenderAttribute count=${this.numBots}`);
        Instance.ServerCommand(`ent_fire button_add_bot Enable`);
        Instance.ServerCommand(`ent_fire button_remove_bot Enable`);
        Instance.ServerCommand(`custom_bot_difficulty 0`);
        
        Instance.ServerCommand(`ent_fire spawn_close SetEnabled`);
        Instance.ServerCommand(`ent_fire spawn_mid SetEnabled`);
        
        Instance.ServerCommand(`ent_fire brush_rush_border Enable`);
        Instance.ServerCommand(`ent_fire brush_rush_playerblocker Enable`);
        
        this.speedTeleportBotsToSpawns();
        
        if (this.currentLeftCategory === "warmup") {
            Instance.ServerCommand(`ent_fire visbox_speed Enable`);
            Instance.ServerCommand(`ent_fire button_speed_* Lock`);
        } else {
            Instance.ServerCommand(`ent_fire visbox_speed Disable`);
            Instance.ServerCommand(`ent_fire button_speed_* Unlock`);
        }
        
        Instance.ServerCommand(`ent_fire brush_botcounter_speed Enable`);
        
        this.speedUpdateHud();
    }
    
    speedOnKill() {
        if (!this.speedActive || this.gameMode !== "gamemode_speed") return;
        
        if (this.speedState === 0) {
            this.speedState = 1;
            this.speedStartTime = Instance.GetGameTime();
            this.speedKills = 1;
            Instance.ServerCommand(`ent_fire snd_spray_hit startsound`);
            this.speedUpdateHud();
            return;
        }
        
        if (this.speedState === 2) {
            this.speedState = 1;
            this.speedStartTime = Instance.GetGameTime();
            this.speedKills = 1;
            this.speedShotsFired = 0;
            this.speedShotsHit = 0;
            Instance.ServerCommand(`ent_fire snd_spray_hit startsound`);
            this.speedUpdateHud();
            return;
        }
        
        if (this.speedState === 1) {
            this.speedKills++;
            
            if (this.speedKills >= this.speedTargetKills) {
                this.speedComplete();
            } else {
                this.speedUpdateHud();
            }
        }
    }
    
    speedShotFired() {
        if (!this.speedActive || this.gameMode !== "gamemode_speed") return;
        if (this.speedState !== 1) return;
        
        this.speedShotsFired++;
    }
    
    speedShotHit() {
        if (!this.speedActive || this.gameMode !== "gamemode_speed") return;
        if (this.speedState !== 1) return;
        
        this.speedShotsHit++;
    }
    
    speedComplete() {
        if (!this.speedActive || this.gameMode !== "gamemode_speed") return;
        
        this.speedState = 2;
        
        const endTime = Instance.GetGameTime();
        const totalTime = endTime - this.speedStartTime;
        
        const minutes = Math.floor(totalTime / 60);
        const seconds = Math.floor(totalTime % 60);
        const centiseconds = Math.floor((totalTime % 1) * 100);
        const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
        
        const accuracy = this.speedShotsFired > 0 ? ((this.speedShotsHit / this.speedShotsFired) * 100).toFixed(1) : "0.0";
        
        const kps = totalTime > 0 ? (this.speedTargetKills / totalTime).toFixed(2) : "0.00";
        
        // Highscore check for speed
        const speedSaveKey = `highscore_speed_${this.speedTargetKills}`;
        const saveData = this.getSaveObject();
        const previousBest = saveData[speedSaveKey];

        if (previousBest !== undefined && totalTime < previousBest) {
            const diff = (previousBest - totalTime).toFixed(2);
            saveData[speedSaveKey] = totalTime;
            Instance.SetSaveData(JSON.stringify(saveData));
            Instance.ServerCommand(`say_team You beat your personal best for Speed ${this.speedTargetKills}: ${timeStr} - Accuracy: ${accuracy}% - KPS: ${kps} (-${diff})`);
            Instance.ServerCommand(`ent_fire snd_pb startsound`);
        } else if (previousBest === undefined) {
            saveData[speedSaveKey] = totalTime;
            Instance.SetSaveData(JSON.stringify(saveData));
            Instance.ServerCommand(`say_team Speed ${this.speedTargetKills}: ${timeStr} - Accuracy: ${accuracy}% - KPS: ${kps}`);
        } else {
            const diff = (totalTime - previousBest).toFixed(2);
            Instance.ServerCommand(`say_team Speed ${this.speedTargetKills}: ${timeStr} - Accuracy: ${accuracy}% - KPS: ${kps} (+${diff})`);
        }
        
        Instance.ServerCommand(`ent_fire snd_speed_finish startsound`);
        
        Instance.ServerCommand(`ent_fire branch_reload_bots test`);
        
        this.speedUpdateHud();
    }
    
    speedTeleportBotsToSpawns() {
        for (let i = 0; i < 64; i++) {
            const ctrl = Instance.GetPlayerController(i);
            if (ctrl && ctrl.IsValid() && ctrl.IsBot() && ctrl.GetTeamNumber() === 3) {
                const botPawn = ctrl.GetPlayerPawn();
                if (botPawn && botPawn.IsValid()) {
                    const useClose = Math.random() < 0.5;
                    const maxPoints = 16;
                    const pointIndex = randInt(1, maxPoints);
                    
                    let teleportPoint = null;
                    if (useClose) {
                        teleportPoint = Instance.FindEntityByName(`spawn_close_${pointIndex}`);
                    } else {
                        teleportPoint = Instance.FindEntityByName(`spawn_mid_${pointIndex}`);
                    }
                    
                    if (!teleportPoint || !teleportPoint.IsValid()) {
                        if (useClose) {
                            teleportPoint = Instance.FindEntityByName(`spawn_mid_${pointIndex}`);
                        } else {
                            teleportPoint = Instance.FindEntityByName(`spawn_close_${pointIndex}`);
                        }
                    }
                    
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
    
    speedUpdateHud() {
        if (!this.speedActive || this.gameMode !== "gamemode_speed") return;
        
        let message = "";
        
        if (this.speedState === 0) {
            message = `Shoot a bot to start!`;
        } else if (this.speedState === 2) {
            message = `Shoot a bot to retry!`;
        } else if (this.speedState === 1) {
            const currentTime = Instance.GetGameTime();
            const elapsed = currentTime - this.speedStartTime;
            
            const minutes = Math.floor(elapsed / 60);
            const seconds = Math.floor(elapsed % 60);
            const centiseconds = Math.floor((elapsed % 1) * 100);
            const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
            
            message = `Kills: ${this.speedKills}/${this.speedTargetKills}\rTime: ${timeStr}`;
        }
        
        if (message !== "") {
            Instance.ServerCommand(`ent_create env_hudhint {"targetname" "timer_hudhint" "message" "${message}"}`, 0.0);
            Instance.ServerCommand(`ent_fire timer_hudhint showhudhint`, 0.0);
            Instance.ServerCommand(`ent_fire timer_hudhint kill`, 0.1);
        }
    }
    
    speedSetTarget(target) {
        if (target === 50 || target === 75 || target === 100) {
            this.speedTargetKills = target;
            
            if (this.speedActive && this.gameMode === "gamemode_speed" && this.speedState !== 1) {
                this.speedUpdateHud();
            }
        }
    }
    
    speedExit() {
        if (!this.speedActive) return;
        
        this.speedActive = false;
        this.speedState = 0;
        this.speedKills = 0;
        this.speedStartTime = 0;
        this.speedShotsFired = 0;
        this.speedShotsHit = 0;
        
        Instance.ServerCommand(`ent_fire timer_hudhint kill`);
    }
    
    prefire_Start() {
        this.gameMode = "gamemode_prefire";
        this.isActive = false;
        this.prefireActive = true;
        
        this.cleanupGamemodeProps();
        
        Instance.ServerCommand(`bot_quota 0`);
        Instance.ServerCommand(`ent_fire brush_botcounter SetRenderAttribute count=0`);
        Instance.ServerCommand(`ent_fire button_add_bot Disable`);
        Instance.ServerCommand(`ent_fire button_remove_bot Disable`);
        
        Instance.ServerCommand(`ent_fire visbox_botcounter Enable`);
        Instance.ServerCommand(`ent_fire brush_clock_* Enable`);
        
        if (this.currentLeftCategory === "training") {
            Instance.ServerCommand(`ent_fire blockbullets_prefire Enable`);
            this.prefireStartMapScaleIn();
        }
        
        this.prefireWallbrushScaleDown();
    }
    
    prefireStartMapScaleIn() {
        this.prefireMapScaling = [];
        
        const currentTime = Instance.GetGameTime();
        
        for (let i = 1; i <= 7; i++) {
            const brushName = `prop_prefire_map_${i}`;
            const brushes = Instance.FindEntitiesByName(brushName);
            if (!brushes) continue;
            
            for (const brush of brushes) {
                if (brush && brush.IsValid()) {
                    brush.SetModelScale(0.01);
                    Instance.ServerCommand(`ent_fire ${brushName} Enable`);
                    Instance.ServerCommand(`ent_fire ${brushName} EnableCollision`);
                    
                    this.prefireMapScaling.push({
                        brush: brush,
                        name: brushName,
                        scale: 0.01,
                        startTime: currentTime + (i - 1) * 0.12,
                        started: false
                    });
                }
            }
        }
    }
    
    prefireMapScaleUpdate() {
        if (this.prefireMapScaling.length === 0) return;
        
        const currentTime = Instance.GetGameTime();
        
        for (let i = this.prefireMapScaling.length - 1; i >= 0; i--) {
            const item = this.prefireMapScaling[i];
            
            if (!item.brush || !item.brush.IsValid()) {
                this.prefireMapScaling.splice(i, 1);
                continue;
            }
            
            if (currentTime < item.startTime) continue;
            
            item.started = true;
            item.scale += (1.0 - item.scale) * 0.3;
            
            const rounded = parseFloat(item.scale.toFixed(4));
            item.brush.SetModelScale(rounded);
            
            if (rounded >= 0.99) {
                item.brush.SetModelScale(1.0);
                Instance.ServerCommand(`ent_fire snd_click startsound`);
                this.prefireMapScaling.splice(i, 1);
            }
        }
    }
    
    prefireExit(targetMode) {
        if (!this.prefireActive) return;
        
        this.prefireActive = false;
        this.prefireMapScaling = [];
        
        Instance.ServerCommand(`ent_fire prop_prefire_map_* Disable`);
        Instance.ServerCommand(`ent_fire prop_prefire_map_* DisableCollision`);
        Instance.ServerCommand(`ent_fire blockbullets_prefire Disable`);
        
        if (this.currentLeftCategory === "training" && !["gamemode_surf", "gamemode_bhop", "gamemode_kz", "gamemode_prefire"].includes(targetMode)) {
            this.prefireWallbrushScaleUp();
        }
    }
    
    prefireWallbrushScaleDown() {
        this.prefireWallbrushScaling = [];
        
        const wallbrushNames = [
            "wallbrush_prim_ak47", "wallbrush_prim_m4a1", "wallbrush_prim_m4a4",
            "wallbrush_prim_m249", "wallbrush_prim_negev", "wallbrush_prim_sawedoff",
            "wallbrush_prim_mac10", "wallbrush_prim_ump", "wallbrush_prim_aug",
            "wallbrush_prim_krieg", "wallbrush_prim_famas", "wallbrush_prim_ctauto",
            "wallbrush_prim_nova", "wallbrush_prim_mag7", "wallbrush_prim_mp5",
            "wallbrush_prim_mp9", "wallbrush_prim_awp", "wallbrush_prim_scout",
            "wallbrush_prim_galil", "wallbrush_prim_tauto", "wallbrush_prim_xm",
            "wallbrush_prim_bizon", "wallbrush_prim_p90", "wallbrush_prim_mp7",
            "wallbrush_sec_deagle", "wallbrush_sec_usp", "wallbrush_sec_glock",
            "wallbrush_sec_duals", "wallbrush_sec_r8", "wallbrush_sec_tec9",
            "wallbrush_sec_fiveseven", "wallbrush_sec_p2000", "wallbrush_sec_p250",
            "wallbrush_sec_cz"
        ];
        
        for (const brushName of wallbrushNames) {
            const brush = Instance.FindEntityByName(brushName);
            if (brush && brush.IsValid()) {
                this.prefireWallbrushScaling.push({
                    brush: brush,
                    name: brushName,
                    scale: 1.0,
                    direction: "down"
                });
            }
        }
    }
    
    prefireWallbrushScaleUp() {
        this.prefireWallbrushScaling = [];
        
        const wallbrushNames = [
            "wallbrush_prim_ak47", "wallbrush_prim_m4a1", "wallbrush_prim_m4a4",
            "wallbrush_prim_m249", "wallbrush_prim_negev", "wallbrush_prim_sawedoff",
            "wallbrush_prim_mac10", "wallbrush_prim_ump", "wallbrush_prim_aug",
            "wallbrush_prim_krieg", "wallbrush_prim_famas", "wallbrush_prim_ctauto",
            "wallbrush_prim_nova", "wallbrush_prim_mag7", "wallbrush_prim_mp5",
            "wallbrush_prim_mp9", "wallbrush_prim_awp", "wallbrush_prim_scout",
            "wallbrush_prim_galil", "wallbrush_prim_tauto", "wallbrush_prim_xm",
            "wallbrush_prim_bizon", "wallbrush_prim_p90", "wallbrush_prim_mp7",
            "wallbrush_sec_deagle", "wallbrush_sec_usp", "wallbrush_sec_glock",
            "wallbrush_sec_duals", "wallbrush_sec_r8", "wallbrush_sec_tec9",
            "wallbrush_sec_fiveseven", "wallbrush_sec_p2000", "wallbrush_sec_p250",
            "wallbrush_sec_cz"
        ];
        
        for (const brushName of wallbrushNames) {
            const brush = Instance.FindEntityByName(brushName);
            if (brush && brush.IsValid()) {
                brush.SetModelScale(0.01);
                Instance.ServerCommand(`ent_fire ${brushName} Enable`);
                
                this.prefireWallbrushScaling.push({
                    brush: brush,
                    name: brushName,
                    scale: 0.01,
                    direction: "up"
                });
            }
        }
    }
    
    prefireWallbrushScaleUpdate() {
        if (this.prefireWallbrushScaling.length === 0) return;
        
        for (let i = this.prefireWallbrushScaling.length - 1; i >= 0; i--) {
            const item = this.prefireWallbrushScaling[i];
            
            if (!item.brush || !item.brush.IsValid()) {
                this.prefireWallbrushScaling.splice(i, 1);
                continue;
            }
            
            if (item.direction === "down") {
                item.scale += (0.0 - item.scale) * 0.15;
                
                if (item.scale <= 0.02) {
                    item.brush.SetModelScale(0.01);
                    Instance.ServerCommand(`ent_fire ${item.name} Disable`);
                    this.prefireWallbrushScaling.splice(i, 1);
                    continue;
                }
            } else if (item.direction === "up") {
                item.scale += (1.0 - item.scale) * 0.15;
                
                if (item.scale >= 0.99) {
                    item.brush.SetModelScale(1.0);
                    this.prefireWallbrushScaling.splice(i, 1);
                    continue;
                }
            }
            
            const rounded = parseFloat(item.scale.toFixed(4));
            item.brush.SetModelScale(rounded);
        }
    }

    surf_Start() {
        this.gameMode = "gamemode_surf";
        this.isActive = false;
        this.surfActive = true;
        
        this.cleanupGamemodeProps();
        this.cleanupEntities();
        
        Instance.ServerCommand(`bot_quota 0`);
        Instance.ServerCommand(`ent_fire brush_botcounter SetRenderAttribute count=0`);
        Instance.ServerCommand(`ent_fire button_add_bot Disable`);
        Instance.ServerCommand(`ent_fire button_remove_bot Disable`);
        
        Instance.ServerCommand(`ent_fire visbox_botcounter Enable`);
        Instance.ServerCommand(`ent_fire brush_clock_* Enable`);
        
        if (this.currentRightCategory === "movement") {
            Instance.ServerCommand(`ent_fire blockbullets_prefire Enable`);
            this.surfStartMapScaleIn();
        }
        
        this.prefireWallbrushScaleDown();
    }
    
    surfStartMapScaleIn() {
        this.surfMapScaling = [];
        
        const currentTime = Instance.GetGameTime();
        
        for (let i = 1; i <= 2; i++) {
            const brushName = `prop_surf_map_${i}`;
            const brushes = Instance.FindEntitiesByName(brushName);
            if (!brushes) continue;
            
            for (const brush of brushes) {
                if (brush && brush.IsValid()) {
                    brush.SetModelScale(0.01);
                    Instance.ServerCommand(`ent_fire ${brushName} Enable`);
                    Instance.ServerCommand(`ent_fire ${brushName} EnableCollision`);
                    
                    this.surfMapScaling.push({
                        brush: brush,
                        name: brushName,
                        scale: 0.01,
                        startTime: currentTime + (i - 1) * 0.12,
                        started: false
                    });
                }
            }
        }
    }
    
    surfMapScaleUpdate() {
        if (this.surfMapScaling.length === 0) return;
        
        const currentTime = Instance.GetGameTime();
        
        for (let i = this.surfMapScaling.length - 1; i >= 0; i--) {
            const item = this.surfMapScaling[i];
            
            if (!item.brush || !item.brush.IsValid()) {
                this.surfMapScaling.splice(i, 1);
                continue;
            }
            
            if (currentTime < item.startTime) continue;
            
            item.started = true;
            item.scale += (1.0 - item.scale) * 0.3;
            
            const rounded = parseFloat(item.scale.toFixed(4));
            item.brush.SetModelScale(rounded);
            
            if (rounded >= 0.99) {
                item.brush.SetModelScale(1.0);
                Instance.ServerCommand(`ent_fire snd_click startsound`);
                if (item.name === "prop_surf_map_1") {
                    const pb1 = this.getSaveObject()["highscore_gamemode_surf"];
                    if (pb1 !== undefined) Instance.ServerCommand(`ent_fire brush_timer_surf_1_* Enable`);
                }
                if (item.name === "prop_surf_map_2") {
                    const pb2 = this.getSaveObject()["highscore_gamemode_surf_2"];
                    if (pb2 !== undefined) Instance.ServerCommand(`ent_fire brush_timer_surf_2_* Enable`);
                }
                this.surfMapScaling.splice(i, 1);
            }
        }
    }
    
    surfExit(targetMode) {
        if (!this.surfActive) return;
        
        this.surfActive = false;
        this.surfMapScaling = [];
        
        Instance.ServerCommand(`ent_fire prop_surf_map_* Disable`);
        Instance.ServerCommand(`ent_fire prop_surf_map_* DisableCollision`);
        Instance.ServerCommand(`ent_fire blockbullets_prefire Disable`);
        Instance.ServerCommand(`ent_fire brush_timer_surf_1_* Disable`);
        Instance.ServerCommand(`ent_fire brush_timer_surf_2_* Disable`);
        
        if (this.currentRightCategory === "movement" && !["gamemode_surf", "gamemode_bhop", "gamemode_kz", "gamemode_prefire"].includes(targetMode)) {
            this.prefireWallbrushScaleUp();
        }
    }

    bhop_Start() {
        this.gameMode = "gamemode_bhop";
        this.isActive = false;
        this.bhopActive = true;
        
        this.cleanupGamemodeProps();
        this.cleanupEntities();
        
        Instance.ServerCommand(`bot_quota 0`);
        Instance.ServerCommand(`ent_fire brush_botcounter SetRenderAttribute count=0`);
        Instance.ServerCommand(`ent_fire button_add_bot Disable`);
        Instance.ServerCommand(`ent_fire button_remove_bot Disable`);
        
        Instance.ServerCommand(`ent_fire visbox_botcounter Enable`);
        Instance.ServerCommand(`ent_fire brush_clock_* Enable`);
        
        if (this.currentRightCategory === "movement") {
            Instance.ServerCommand(`ent_fire blockbullets_prefire Enable`);
            this.bhopStartMapScaleIn();
        }
        
        this.prefireWallbrushScaleDown();
    }
    
    bhopStartMapScaleIn() {
        this.bhopMapScaling = [];
        
        const currentTime = Instance.GetGameTime();
        
        for (let i = 1; i <= 2; i++) {
            const brushName = `prop_bhop_map_${i}`;
            const brushes = Instance.FindEntitiesByName(brushName);
            if (!brushes) continue;
            
            for (const brush of brushes) {
                if (brush && brush.IsValid()) {
                    brush.SetModelScale(0.01);
                    Instance.ServerCommand(`ent_fire ${brushName} Enable`);
                    Instance.ServerCommand(`ent_fire ${brushName} EnableCollision`);
                    
                    this.bhopMapScaling.push({
                        brush: brush,
                        name: brushName,
                        scale: 0.01,
                        startTime: currentTime + (i - 1) * 0.12,
                        started: false
                    });
                }
            }
        }
    }
    
    bhopMapScaleUpdate() {
        if (this.bhopMapScaling.length === 0) return;
        
        const currentTime = Instance.GetGameTime();
        
        for (let i = this.bhopMapScaling.length - 1; i >= 0; i--) {
            const item = this.bhopMapScaling[i];
            
            if (!item.brush || !item.brush.IsValid()) {
                this.bhopMapScaling.splice(i, 1);
                continue;
            }
            
            if (currentTime < item.startTime) continue;
            
            item.started = true;
            item.scale += (1.0 - item.scale) * 0.3;
            
            const rounded = parseFloat(item.scale.toFixed(4));
            item.brush.SetModelScale(rounded);
            
            if (rounded >= 0.99) {
                item.brush.SetModelScale(1.0);
                Instance.ServerCommand(`ent_fire snd_click startsound`);
                if (item.name === "prop_bhop_map_1") {
                    const pb1 = this.getSaveObject()["highscore_gamemode_bhop"];
                    if (pb1 !== undefined) Instance.ServerCommand(`ent_fire brush_timer_bhop_1_* Enable`);
                }
                if (item.name === "prop_bhop_map_2") {
                    const pb2 = this.getSaveObject()["highscore_gamemode_bhop_2"];
                    if (pb2 !== undefined) Instance.ServerCommand(`ent_fire brush_timer_bhop_2_* Enable`);
                }
                this.bhopMapScaling.splice(i, 1);
            }
        }
    }
    
    bhopExit(targetMode) {
        if (!this.bhopActive) return;
        
        this.bhopActive = false;
        this.bhopMapScaling = [];
        
        Instance.ServerCommand(`ent_fire prop_bhop_map_* Disable`);
        Instance.ServerCommand(`ent_fire prop_bhop_map_* DisableCollision`);
        Instance.ServerCommand(`ent_fire blockbullets_prefire Disable`);
        Instance.ServerCommand(`ent_fire brush_timer_bhop_1_* Disable`);
        Instance.ServerCommand(`ent_fire brush_timer_bhop_2_* Disable`);
        
        if (this.currentRightCategory === "movement" && !["gamemode_surf", "gamemode_bhop", "gamemode_kz", "gamemode_prefire"].includes(targetMode)) {
            this.prefireWallbrushScaleUp();
        }
    }

    kz_Start() {
        this.gameMode = "gamemode_kz";
        this.isActive = false;
        this.kzActive = true;
        
        this.cleanupGamemodeProps();
        this.cleanupEntities();
        
        Instance.ServerCommand(`bot_quota 0`);
        Instance.ServerCommand(`ent_fire brush_botcounter SetRenderAttribute count=0`);
        Instance.ServerCommand(`ent_fire button_add_bot Disable`);
        Instance.ServerCommand(`ent_fire button_remove_bot Disable`);
        
        Instance.ServerCommand(`ent_fire visbox_botcounter Enable`);
        Instance.ServerCommand(`ent_fire brush_clock_* Enable`);
        
        if (this.currentRightCategory === "movement") {
            Instance.ServerCommand(`ent_fire blockbullets_prefire Enable`);
            this.kzStartMapScaleIn();
        }
        
        this.prefireWallbrushScaleDown();
    }
    
    kzStartMapScaleIn() {
        this.kzMapScaling = [];
        
        const currentTime = Instance.GetGameTime();
        
        for (let i = 1; i <= 2; i++) {
            const brushName = `prop_kz_map_${i}`;
            const brushes = Instance.FindEntitiesByName(brushName);
            if (!brushes) continue;
            
            for (const brush of brushes) {
                if (brush && brush.IsValid()) {
                    brush.SetModelScale(0.01);
                    Instance.ServerCommand(`ent_fire ${brushName} Enable`);
                    Instance.ServerCommand(`ent_fire ${brushName} EnableCollision`);
                    
                    this.kzMapScaling.push({
                        brush: brush,
                        name: brushName,
                        scale: 0.01,
                        startTime: currentTime + (i - 1) * 0.12,
                        started: false
                    });
                }
            }
        }
    }
    
    kzMapScaleUpdate() {
        if (this.kzMapScaling.length === 0) return;
        
        const currentTime = Instance.GetGameTime();
        
        for (let i = this.kzMapScaling.length - 1; i >= 0; i--) {
            const item = this.kzMapScaling[i];
            
            if (!item.brush || !item.brush.IsValid()) {
                this.kzMapScaling.splice(i, 1);
                continue;
            }
            
            if (currentTime < item.startTime) continue;
            
            item.started = true;
            item.scale += (1.0 - item.scale) * 0.3;
            
            const rounded = parseFloat(item.scale.toFixed(4));
            item.brush.SetModelScale(rounded);
            
            if (rounded >= 0.99) {
                item.brush.SetModelScale(1.0);
                Instance.ServerCommand(`ent_fire snd_click startsound`);
                if (item.name === "prop_kz_map_1") {
                    const pro = this.getSaveObject()["highscore_kz_pro"];
                    const nub = this.getSaveObject()["highscore_kz_nub"];
                    if (pro !== undefined || nub !== undefined) Instance.ServerCommand(`ent_fire brush_timer_kz_1_* Enable`);
                }
                if (item.name === "prop_kz_map_2") {
                    const pro = this.getSaveObject()["highscore_kz_2_pro"];
                    const nub = this.getSaveObject()["highscore_kz_2_nub"];
                    if (pro !== undefined || nub !== undefined) Instance.ServerCommand(`ent_fire brush_timer_kz_2_* Enable`);
                }
                this.kzMapScaling.splice(i, 1);
            }
        }
    }
    
    kzExit(targetMode) {
        if (!this.kzActive) return;
        
        this.kzActive = false;
        this.kzMapScaling = [];
        
        Instance.ServerCommand(`ent_fire prop_kz_map_* Disable`);
        Instance.ServerCommand(`ent_fire prop_kz_map_* DisableCollision`);
        Instance.ServerCommand(`ent_fire blockbullets_prefire Disable`);
        Instance.ServerCommand(`ent_fire brush_timer_kz_1_* Disable`);
        Instance.ServerCommand(`ent_fire brush_timer_kz_2_* Disable`);
        
        if (this.currentRightCategory === "movement" && !["gamemode_surf", "gamemode_bhop", "gamemode_kz", "gamemode_prefire"].includes(targetMode)) {
            this.prefireWallbrushScaleUp();
        }
    }

    teleportAllBots() {
        for (let i = 0; i < 64; i++) {
            const ctrl = Instance.GetPlayerController(i);
            if (ctrl && ctrl.IsValid() && ctrl.IsBot() && ctrl.GetTeamNumber() === 3) {
                const botPawn = ctrl.GetPlayerPawn();
                if (botPawn && botPawn.IsValid()) {
                    const teleportIndex = randInt(1, 16);
                    const teleportPoint = Instance.FindEntityByName(`teleport_bot_rush_${teleportIndex}`);
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

    StartTimer() {
        const controller = Instance.GetPlayerController(0);
        if (!controller || !controller.IsValid()) return;
        const pawn = controller.GetPlayerPawn();
        if (!pawn || !pawn.IsValid()) return;

        this.missedPB = false;
        setTimerColor(0, 255, 0);
        if (this.gameMode === "gamemode_surf") {
            const key = this.surfVariant === 2 ? "highscore_gamemode_surf_2" : "highscore_gamemode_surf";
            this.movementPB = this.getSaveObject()[key];
        }
        if (this.gameMode === "gamemode_kz") {
            const proKey = this.kzVariant === 2 ? "highscore_kz_2_pro" : "highscore_kz_pro";
            this.movementPB = this.getSaveObject()[proKey];
        }
        if (this.gameMode === "gamemode_bhop") {
            const key = this.bhopVariant === 2 ? "highscore_gamemode_bhop_2" : "highscore_gamemode_bhop";
            this.movementPB = this.getSaveObject()[key];
        }

        this.isActive = true;
        this.tickCount = 0;
        this.Fails = 0;
        this.Jumps = 0;
        this.cpNum = 0;
        this.tpNum = 0;
        this.checkpoint = null;
        this.isInAir = false;
        this.isTeleporting = false;
        this.kills = 0;
        this.currentTick = 0;
        this.kzSpeedTick = 0;
        this.kzJumpCaptureNextTick = false;
        this.kzJumpSpeedHideTime = 0;
        this.kzLandSpeed = 0;
        this.kzLandTime = 0;
        this.kzPerfActive = false;
        this.kzWasInAir = false;
        this.hudTick = 0;
        this.noclipDetected = false;
        this.noclipMessageShown = false;
        if (this.gameMode === "gamemode_surf" || this.gameMode === "gamemode_bhop") {
            this.lastVelocity = 0;
            this.currentVelocity = 0;
            this.initialVelocity = 0;
            this.velocityChange = 0;
            this.lastDisplayedNumber = -1;
            this.updateSpeedDisplay(0);
            Instance.ServerCommand(`ent_fire particle_movement start`, 0.0);
        }
        if (this.gameMode === "gamemode_kz") {
            renderKzSpeed(0, 255, 255, 255);
            hideKzJumpSpeed();
        }
        Instance.ServerCommand(`ent_fire snd_start startsound`);
    }

    stop() {
        const movementModes = ["gamemode_surf", "gamemode_bhop", "gamemode_kz"];
        if (this.isActive && movementModes.includes(this.gameMode)) {
            if (!this.noclipDetected) {
                this.showStat();
            } else {
                Instance.ServerCommand(`say_team No time was recorded due to noclip detection.`, 0.0);
            }
        }
        Instance.ServerCommand(`ent_fire snd_start startsound`);
        Instance.ServerCommand(`ent_fire particle_movement stop`, 0.0);
        this.cleanupEntities();

        if (movementModes.includes(this.gameMode)) {
            this.isActive = false;
            this.tickCount = 0;
            this.Fails = 0;
            this.Jumps = 0;
            this.cpNum = 0;
            this.tpNum = 0;
            this.checkpoint = null;
            this.isInAir = false;
            this.isTeleporting = false;
            this.kills = 0;
            this.currentTick = 0;
            this.hudTick = 0;
            this.noclipDetected = false;
            this.noclipMessageShown = false;
            if (this.gameMode === "gamemode_surf" || this.gameMode === "gamemode_bhop") {
                this.lastVelocity = 0;
                this.currentVelocity = 0;
                this.initialVelocity = 0;
                this.velocityChange = 0;
                this.lastDisplayedNumber = -1;
                this.updateSpeedDisplay(0);
            }
            const controller = Instance.GetPlayerController(0);
            if (controller && controller.IsValid()) {
                const pawn = controller.GetPlayerPawn();
                if (pawn && pawn.IsValid()) {
                    const pos = pawn.GetAbsOrigin() || { x: 0, y: 0, z: 0 };
                    this.playerPos = [pos.x, pos.y, pos.z];
                    this.oldPlayerPos = [pos.x, pos.y, pos.z];
                }
            }
        } else {
            this.isActive = false;
            this.gameMode = "gamemode_static";
            this.tickCount = 0;
            this.Fails = 0;
            this.Jumps = 0;
            this.cpNum = 0;
            this.tpNum = 0;
            this.checkpoint = null;
            this.isInAir = false;
            this.isTeleporting = false;
            this.kills = 0;
            this.currentTick = 0;
            this.hudTick = 0;
            this.noclipDetected = false;
            this.noclipMessageShown = false;
            this.lastVelocity = 0;
            this.currentVelocity = 0;
            this.initialVelocity = 0;
            this.velocityChange = 0;
            this.lastDisplayedNumber = -1;
            this.updateSpeedDisplay(0);
            this.static_Start();
        }
    }

    IncKills() {
        if (this.isActive && this.gameMode === "gamemode_rush") {
            this.kills += 1;
            this.Hud();
        }
    }

    IncFails() {
        if (this.isActive && ["gamemode_surf", "gamemode_bhop", "gamemode_kz"].includes(this.gameMode) && !this.noclipDetected) {
            this.Fails += 1;
        }
    }

    IncJumps() {
        if (this.isActive) this.Jumps += 1;
    }

	restart() {
		const controller = Instance.GetPlayerController(0);
		if (controller && controller.IsValid()) {
			const pawn = controller.GetPlayerPawn();
			if (pawn && pawn.IsValid()) {
				const movementModes = ["gamemode_surf", "gamemode_bhop", "gamemode_kz"];
				if (movementModes.includes(this.gameMode)) {
					pawn.Teleport({ velocity: { x: 0, y: 0, z: 0 } });
				}
			}
		}

		const movementModes = ["gamemode_surf", "gamemode_bhop", "gamemode_kz"];
		if (movementModes.includes(this.gameMode)) {
			this.isActive = false;
			this.tickCount = 0;
			this.Fails = 0;
			this.Jumps = 0;
			this.cpNum = 0;
			this.tpNum = 0;
			this.checkpoint = null;
			this.isInAir = false;
			this.isTeleporting = false;
			this.kills = 0;
			this.currentTick = 0;
			this.hudTick = 0;
			this.noclipDetected = false;
			this.noclipMessageShown = false;
			if (this.gameMode === "gamemode_surf" || this.gameMode === "gamemode_bhop") {
				this.lastVelocity = 0;
				this.currentVelocity = 0;
				this.initialVelocity = 0;
				this.velocityChange = 0;
				this.lastDisplayedNumber = -1;
				this.updateSpeedDisplay(0);
			}
			const controller = Instance.GetPlayerController(0);
			if (controller && controller.IsValid()) {
				const pawn = controller.GetPlayerPawn();
				if (pawn && pawn.IsValid()) {
					const pos = pawn.GetAbsOrigin() || { x: 0, y: 0, z: 0 };
					this.playerPos = [pos.x, pos.y, pos.z];
					this.oldPlayerPos = [pos.x, pos.y, pos.z];
				}
			}
			Instance.ServerCommand(`ent_fire particle_movement stop`, 0.0);
			this.cleanupEntities();

			// Load PB for current movement mode
			this.missedPB = false;
			setTimerColor(0, 255, 0);
			const data = this.getSaveObject();
			if (this.gameMode === "gamemode_kz") {
				// Will be updated when cpNum changes - start as PRO
				const proKey = this.kzVariant === 2 ? "highscore_kz_2_pro" : "highscore_kz_pro";
				this.movementPB = data[proKey];
			} else if (this.gameMode === "gamemode_bhop") {
				const key = this.bhopVariant === 2 ? "highscore_gamemode_bhop_2" : "highscore_gamemode_bhop";
				this.movementPB = data[key];
			} else if (this.gameMode === "gamemode_surf") {
				const key = this.surfVariant === 2 ? "highscore_gamemode_surf_2" : "highscore_gamemode_surf";
				this.movementPB = data[key];
			} else {
				this.movementPB = undefined;
			}
		} else {
			this.stop();
		}
	}

	showStat() {
		if (this.noclipDetected) {
			Instance.ServerCommand(`say_team No time was recorded due to noclip detection.`, 0.0);
			return;
		}

		const [m, sec, ms] = this.FormatedTime();
		const finishTime = this.tickCount * this.TICK_INTERVAL;

		// Highscore check for movement modes
		const movementModes = ["gamemode_surf", "gamemode_bhop", "gamemode_kz"];
		if (movementModes.includes(this.gameMode)) {
			Instance.ServerCommand(`ent_fire timer_hudhint kill`, 0.0);
			Instance.ServerCommand(`ent_fire timer_finish showhudhint`, 1.0);

			const modeNames = { "gamemode_surf": this.surfVariant === 2 ? "Surf_utopia" : "Surf_kitsune", "gamemode_bhop": this.bhopVariant === 2 ? "Bhop_arcane" : "Bhop_emevael", "gamemode_kz": this.kzVariant === 2 ? "KZ_natureblock" : "KZ_variety" };
			const modeName = modeNames[this.gameMode];

			// Determine save key - KZ has separate PRO and NUB
			let saveKey;
			if (this.gameMode === "gamemode_kz") {
				if (this.kzVariant === 2) {
					saveKey = this.cpNum > 0 ? "highscore_kz_2_nub" : "highscore_kz_2_pro";
				} else {
					saveKey = this.cpNum > 0 ? "highscore_kz_nub" : "highscore_kz_pro";
				}
			} else if (this.gameMode === "gamemode_surf") {
				saveKey = this.surfVariant === 2 ? "highscore_gamemode_surf_2" : "highscore_gamemode_surf";
			} else if (this.gameMode === "gamemode_bhop") {
				saveKey = this.bhopVariant === 2 ? "highscore_gamemode_bhop_2" : "highscore_gamemode_bhop";
			} else {
				saveKey = `highscore_${this.gameMode}`;
			}

			const highscores = this.getSaveObject();
			const previousBest = highscores[saveKey];

			// Build the stats suffix per mode
			let stats = "";
			let prefix = "";
			if (this.gameMode === "gamemode_surf" && this.surfVariant === 1) {
				stats = ` with ${this.Fails} fails`;
			} else if (this.gameMode === "gamemode_bhop") {
				stats = ` with ${this.Jumps} jumps and ${this.Fails} fails`;
			} else if (this.gameMode === "gamemode_kz") {
				prefix = this.cpNum > 0 ? "NUB" : "PRO";
				if (this.cpNum > 0) {
					stats = ` with ${this.cpNum} CPs and ${this.tpNum} TPs`;
				} else {
					stats = ` with no checkpoints`;
				}
			}

			if (previousBest !== undefined && finishTime < previousBest) {
				const diff = previousBest - finishTime;
				const diffStr = formatSavedTime(diff);
				highscores[saveKey] = finishTime;
				Instance.SetSaveData(JSON.stringify(highscores));
				if (this.gameMode === "gamemode_kz") {
					Instance.ServerCommand(`say_team New personal best! ${prefix}: ${modeName} finished in ${m}:${sec}.${ms} (PB -${diffStr})`, 0.0);
				} else {
					Instance.ServerCommand(`say_team New personal best! ${modeName} finished in ${m}:${sec}.${ms} (PB -${diffStr})`, 0.0);
				}
				// Show PB particle text
				renderPB("NEW PERSONAL BEST!", m, sec, ms, 0, PB_Y, 0);

				if (this.gameMode === "gamemode_surf") {
					const enableBrush = this.surfVariant === 2 ? "brush_timer_surf_2_*" : "brush_timer_surf_1_*";
					Instance.ServerCommand(`ent_fire ${enableBrush} Enable`);
					this.updateSurfTimerBrushes(finishTime);
				}
				if (this.gameMode === "gamemode_bhop") {
					const enableBrush = this.bhopVariant === 2 ? "brush_timer_bhop_2_*" : "brush_timer_bhop_1_*";
					Instance.ServerCommand(`ent_fire ${enableBrush} Enable`);
					this.updateBhopTimerBrushes(finishTime);
				}
				if (this.gameMode === "gamemode_kz") {
					const enableBrush = this.kzVariant === 2 ? "brush_timer_kz_2_*" : "brush_timer_kz_1_*";
					Instance.ServerCommand(`ent_fire ${enableBrush} Enable`);
					var proK = this.kzVariant === 2 ? "highscore_kz_2_pro" : "highscore_kz_pro";
					var nubK = this.kzVariant === 2 ? "highscore_kz_2_nub" : "highscore_kz_nub";
					var pT = highscores[proK], nT = highscores[nubK];
					var best = (pT !== undefined && nT !== undefined) ? Math.min(pT, nT) : (pT !== undefined ? pT : nT);
					this.updateKzTimerBrushes(best);
				}
				Instance.ServerCommand(`ent_fire snd_movement_record startsound`, 0.0);
				Instance.ServerCommand(`ent_fire snd_pb startsound`, 0.0);
			} else if (previousBest === undefined) {
				highscores[saveKey] = finishTime;
				Instance.SetSaveData(JSON.stringify(highscores));
				if (this.gameMode === "gamemode_kz") {
					Instance.ServerCommand(`say_team ${prefix}: ${modeName} finished in ${m}:${sec}.${ms}`, 0.0);
				} else {
					Instance.ServerCommand(`say_team ${modeName} finished in ${m}:${sec}.${ms}`, 0.0);
				}
				if (this.gameMode === "gamemode_surf") {
					const enableBrush = this.surfVariant === 2 ? "brush_timer_surf_2_*" : "brush_timer_surf_1_*";
					Instance.ServerCommand(`ent_fire ${enableBrush} Enable`);
					this.updateSurfTimerBrushes(finishTime);
				}
				if (this.gameMode === "gamemode_bhop") {
					const enableBrush = this.bhopVariant === 2 ? "brush_timer_bhop_2_*" : "brush_timer_bhop_1_*";
					Instance.ServerCommand(`ent_fire ${enableBrush} Enable`);
					this.updateBhopTimerBrushes(finishTime);
				}
				if (this.gameMode === "gamemode_kz") {
					const enableBrush = this.kzVariant === 2 ? "brush_timer_kz_2_*" : "brush_timer_kz_1_*";
					Instance.ServerCommand(`ent_fire ${enableBrush} Enable`);
					var proK2 = this.kzVariant === 2 ? "highscore_kz_2_pro" : "highscore_kz_pro";
					var nubK2 = this.kzVariant === 2 ? "highscore_kz_2_nub" : "highscore_kz_nub";
					var pT2 = highscores[proK2], nT2 = highscores[nubK2];
					var best2 = (pT2 !== undefined && nT2 !== undefined) ? Math.min(pT2, nT2) : (pT2 !== undefined ? pT2 : nT2);
					this.updateKzTimerBrushes(best2);
				}
			} else {
				const diff = finishTime - previousBest;
				const diffStr = formatSavedTime(diff);
				if (this.gameMode === "gamemode_kz") {
					Instance.ServerCommand(`say_team ${prefix}: ${modeName} finished in ${m}:${sec}.${ms} (PB +${diffStr})`, 0.0);
				} else {
					Instance.ServerCommand(`say_team ${modeName} finished in ${m}:${sec}.${ms} (PB +${diffStr})`, 0.0);
				}
			}
		}
	}

    FormatedTime() {
        const seconds = this.tickCount * this.TICK_INTERVAL;
        const totalMinutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        const multiplier = this.gameMode === "gamemode_kz" ? 100 : 100;
        const pad = this.gameMode === "gamemode_kz" ? 2 : 2;
        const ms = Math.floor((seconds % 1) * multiplier).toString().padStart(pad, '0');
        return [totalMinutes.toString().padStart(2, '0'), remainingSeconds.toString().padStart(2, '0'), ms];
    }

    updateSurfTimerBrushes(seconds) {
        const prefix = this.surfVariant === 2 ? "brush_timer_surf_2_" : "brush_timer_surf_1_";
        const totalMinutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        const centiseconds = Math.floor((seconds % 1) * 100);
        // Right to left: _1 = cs ones, _2 = cs tens, _3 = s ones, _4 = s tens, _5 = m ones, _6 = m tens
        Instance.ServerCommand(`ent_fire ${prefix}1 SetRenderAttribute count=${centiseconds % 10}`, 0.0);
        Instance.ServerCommand(`ent_fire ${prefix}2 SetRenderAttribute count=${Math.floor(centiseconds / 10) % 10}`, 0.0);
        Instance.ServerCommand(`ent_fire ${prefix}3 SetRenderAttribute count=${remainingSeconds % 10}`, 0.0);
        Instance.ServerCommand(`ent_fire ${prefix}4 SetRenderAttribute count=${Math.floor(remainingSeconds / 10) % 10}`, 0.0);
        Instance.ServerCommand(`ent_fire ${prefix}5 SetRenderAttribute count=${totalMinutes % 10}`, 0.0);
        Instance.ServerCommand(`ent_fire ${prefix}6 SetRenderAttribute count=${Math.floor(totalMinutes / 10) % 10}`, 0.0);
    }

    updateBhopTimerBrushes(seconds) {
        const prefix = this.bhopVariant === 2 ? "brush_timer_bhop_2_" : "brush_timer_bhop_1_";
        const totalMinutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        const centiseconds = Math.floor((seconds % 1) * 100);
        Instance.ServerCommand(`ent_fire ${prefix}1 SetRenderAttribute count=${centiseconds % 10}`, 0.0);
        Instance.ServerCommand(`ent_fire ${prefix}2 SetRenderAttribute count=${Math.floor(centiseconds / 10) % 10}`, 0.0);
        Instance.ServerCommand(`ent_fire ${prefix}3 SetRenderAttribute count=${remainingSeconds % 10}`, 0.0);
        Instance.ServerCommand(`ent_fire ${prefix}4 SetRenderAttribute count=${Math.floor(remainingSeconds / 10) % 10}`, 0.0);
        Instance.ServerCommand(`ent_fire ${prefix}5 SetRenderAttribute count=${totalMinutes % 10}`, 0.0);
        Instance.ServerCommand(`ent_fire ${prefix}6 SetRenderAttribute count=${Math.floor(totalMinutes / 10) % 10}`, 0.0);
    }

    updateKzTimerBrushes(seconds) {
        const prefix = this.kzVariant === 2 ? "brush_timer_kz_2_" : "brush_timer_kz_1_";
        const totalMinutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        const centiseconds = Math.floor((seconds % 1) * 100);
        Instance.ServerCommand(`ent_fire ${prefix}1 SetRenderAttribute count=${centiseconds % 10}`, 0.0);
        Instance.ServerCommand(`ent_fire ${prefix}2 SetRenderAttribute count=${Math.floor(centiseconds / 10) % 10}`, 0.0);
        Instance.ServerCommand(`ent_fire ${prefix}3 SetRenderAttribute count=${remainingSeconds % 10}`, 0.0);
        Instance.ServerCommand(`ent_fire ${prefix}4 SetRenderAttribute count=${Math.floor(remainingSeconds / 10) % 10}`, 0.0);
        Instance.ServerCommand(`ent_fire ${prefix}5 SetRenderAttribute count=${totalMinutes % 10}`, 0.0);
        Instance.ServerCommand(`ent_fire ${prefix}6 SetRenderAttribute count=${Math.floor(totalMinutes / 10) % 10}`, 0.0);
    }

    Hud() {
        if (this.gameMode === "gamemode_spray") return;
        
        let message = "";
        
        if (this.combatActive && this.gameMode === "gamemode_combat") {
            if (this.combatWaitingToStart) {
                if (this.combatLevel > 1) {
                    message = `Move to resume!`;
                } else {
                    message = `Move to start!`;
                }
            } else if (this.combatRoundActive) {
                message = `Kills: ${this.combatKills}/${this.combatNumBots}\rRound: ${this.combatLevel} (Best: ${this.combatBestLevel})`;
            }
        } else if (this.isActive && this.gameMode === "gamemode_rush") {
            message = `Bots: ${this.numBots}\rKills: ${this.kills} (Best: ${this.bestKills})`;
        }

        if (message !== "" && message !== this.lastHudMessage) {
            Instance.ServerCommand(`ent_fire timer_hudhint kill`, 0.0);
            Instance.ServerCommand(`ent_create env_hudhint {"targetname" "timer_hudhint" "message" "${message}"}`, 0.0);
            Instance.ServerCommand(`ent_fire timer_hudhint showhudhint`, 0.0);
            this.lastHudMessage = message;
        }
    }
    
    clearHud() {
        Instance.ServerCommand(`ent_fire timer_hudhint kill`, 0.0);
        this.lastHudMessage = "";
    }

    getDigits(number) {
        number = Math.max(0, Math.min(9999, Math.floor(number)));
        return number.toString().padStart(4, '0').split('').map(Number);
    }

    clearExtraDigits() {
        this.clearHud();
        hideSpeed();
        hideTimer();
        hideKzSpeed();
        hideKzJumpSpeed();
    }

    cleanupEntities() {
        this.clearHud();
        hideSpeed();
        hideTimer();
        hideKzSpeed();
        hideKzJumpSpeed();
        Instance.ServerCommand(`ent_fire percentage_* Stop`, 0.0);
        Instance.ServerCommand(`ent_fire particle_movement stop`, 0.0);
    }

    cleanupGamemodeProps() {
        Instance.ServerCommand(`ent_fire particle_movement stop`);
        
        Instance.ServerCommand(`ent_fire spawn_close SetDisabled`);
        Instance.ServerCommand(`ent_fire spawn_mid SetDisabled`);
        Instance.ServerCommand(`ent_fire spawn_far SetDisabled`);
        Instance.ServerCommand(`ent_fire spawn_dynamic SetDisabled`);
        Instance.ServerCommand(`ent_fire spawn_rush SetDisabled`);
        Instance.ServerCommand(`ent_fire spawn_hidden SetDisabled`);
        
        Instance.ServerCommand(`ent_fire prop_rush_crates Disable`);
        Instance.ServerCommand(`ent_fire prop_rush_crates DisableCollision`);
        Instance.ServerCommand(`ent_fire push_rush_* Disable`);
        Instance.ServerCommand(`ent_fire trigger_teleport_bot_rush Disable`);
        Instance.ServerCommand(`ent_fire brush_rush_border Disable`);
        Instance.ServerCommand(`ent_fire brush_rush_playerblocker Disable`);
        
        Instance.ServerCommand(`ent_fire props_gamemode_dynamic Disable`);
        Instance.ServerCommand(`ent_fire props_gamemode_dynamic DisableCollision`);
        
        Instance.ServerCommand(`ent_fire brush_gamemode_spray_near Disable`);
        Instance.ServerCommand(`ent_fire brush_gamemode_spray_mid Disable`);
        Instance.ServerCommand(`ent_fire brush_gamemode_spray_far Disable`);
        
        Instance.ServerCommand(`ent_fire brush_combat_level Disable`);
        Instance.ServerCommand(`ent_fire trigger_combat Disable`);
        
        Instance.ServerCommand(`ent_fire brush_target_outliner Disable`);
        
        Instance.ServerCommand(`ent_fire prop_reaction_time Disable`);
        Instance.ServerCommand(`ent_fire prop_reaction_time DisableCollision`);
        
        Instance.ServerCommand(`ent_fire visbox_bot_distance Enable`);
        Instance.ServerCommand(`ent_fire button_static_distance_* Lock`);
        Instance.ServerCommand(`ent_fire visbox_spray_distance Enable`);
        Instance.ServerCommand(`ent_fire button_spray_distance_* Lock`);
        Instance.ServerCommand(`ent_fire visbox_speed Enable`);
        Instance.ServerCommand(`ent_fire button_speed_* Lock`);
        
        Instance.ServerCommand(`ent_fire visbox_botcounter Disable`);
        Instance.ServerCommand(`ent_fire brush_clock_* Disable`);
        
        Instance.ServerCommand(`ent_fire brush_botcounter_speed Disable`);
        Instance.ServerCommand(`ent_fire brush_botcounter_rush Disable`);
        Instance.ServerCommand(`ent_fire brush_botcounter_static Disable`);
        Instance.ServerCommand(`ent_fire brush_botcounter_dynamic Disable`);
        Instance.ServerCommand(`ent_fire brush_botcounter_combat Disable`);
        
        Instance.ServerCommand(`ent_fire brush_reaction_lightning Disable`);
        Instance.ServerCommand(`ent_fire brush_reaction_dots Disable`);
        Instance.ServerCommand(`ent_fire brush_reaction_exclamation Disable`);
        Instance.ServerCommand(`ent_fire brush_reaction_time Disable`);
        
        Instance.ServerCommand(`ent_fire prop_prefire_map_* Disable`);
        Instance.ServerCommand(`ent_fire prop_prefire_map_* DisableCollision`);
        Instance.ServerCommand(`ent_fire blockbullets_prefire Disable`);
        
        Instance.ServerCommand(`ent_fire prop_surf_map_* Disable`);
        Instance.ServerCommand(`ent_fire prop_surf_map_* DisableCollision`);
        Instance.ServerCommand(`ent_fire brush_timer_surf_1_* Disable`);
        Instance.ServerCommand(`ent_fire brush_timer_surf_2_* Disable`);
        
        Instance.ServerCommand(`ent_fire prop_bhop_map_* Disable`);
        Instance.ServerCommand(`ent_fire prop_bhop_map_* DisableCollision`);
        Instance.ServerCommand(`ent_fire brush_timer_bhop_1_* Disable`);
        Instance.ServerCommand(`ent_fire brush_timer_bhop_2_* Disable`);
        
        Instance.ServerCommand(`ent_fire prop_kz_map_* Disable`);
        Instance.ServerCommand(`ent_fire prop_kz_map_* DisableCollision`);
        Instance.ServerCommand(`ent_fire brush_timer_kz_1_* Disable`);
        Instance.ServerCommand(`ent_fire brush_timer_kz_2_* Disable`);
    }

    updateSpeedDisplay(number) {
        if (!this.isActive || this.gameMode === "gamemode_rush" || this.gameMode === "gamemode_static" || this.gameMode === "gamemode_dynamic") return;

        if (number === 0) {
            hideSpeed();
            this.lastDisplayedNumber = 0;
            return;
        }

        var now = Instance.GetGameTime();
        var rounded = Math.round(number);
        var r = 255, g = 255, b = 255;

        if (this.gameMode === "gamemode_surf" && now > speedColorHoldUntil) {
            var diff = rounded - speedLastSpeed;
            if (diff > 3) {
                r = 85; g = 236; b = 236;
                speedColorHoldUntil = now + 0.1;
            } else if (diff < -3) {
                r = 232; g = 185; b = 75;
                speedColorHoldUntil = now + 0.1;
            }
            speedDisplayColor.r = r;
            speedDisplayColor.g = g;
            speedDisplayColor.b = b;
        }
        speedLastSpeed = rounded;

        if (this.gameMode === "gamemode_surf") {
            renderSpeed(rounded, speedDisplayColor.r, speedDisplayColor.g, speedDisplayColor.b);
        } else {
            renderSpeed(rounded, 255, 255, 255);
        }
        this.lastDisplayedNumber = number;
    }

    calculateVelocity() {
        const dx = this.playerPos[0] - this.oldPlayerPos[0];
        const dy = this.playerPos[1] - this.oldPlayerPos[1];
        const dz = this.playerPos[2] - this.oldPlayerPos[2];
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const velocity = distance / this.TICK_INTERVAL;
        return Math.floor(velocity);
    }

    calculateVelocityRaw() {
        const dx = this.playerPos[0] - this.oldPlayerPos[0];
        const dy = this.playerPos[1] - this.oldPlayerPos[1];
        const dz = this.playerPos[2] - this.oldPlayerPos[2];
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        return distance / this.TICK_INTERVAL;
    }



    setGameMode(mode) {
        this.isActive = false;
        this.tickCount = 0;
        this.currentTick = 0;
        this.hudTick = 0;
        this.kills = 0;

        if (this.gameMode === "gamemode_kz" && mode !== "gamemode_kz") {
            this.kzExit(mode);
        }
        
        if (this.gameMode === "gamemode_target" && mode !== "gamemode_target") {
            this.targetsExit();
        }
        
        if (this.gameMode === "gamemode_spray" && mode !== "gamemode_spray") {
            this.sprayExit();
        }
        
        if (this.gameMode === "gamemode_combat" && mode !== "gamemode_combat") {
            this.combatExit();
        }
        
        if (this.gameMode === "gamemode_reaction" && mode !== "gamemode_reaction") {
            this.reactionExit();
        }
        
        if (this.gameMode === "gamemode_speed" && mode !== "gamemode_speed") {
            this.speedExit();
        }
        
        if (this.gameMode === "gamemode_prefire" && mode !== "gamemode_prefire") {
            this.prefireExit(mode);
        }
        
        if (this.gameMode === "gamemode_surf" && mode !== "gamemode_surf") {
            this.surfExit(mode);
        }
        
        if (this.gameMode === "gamemode_bhop" && mode !== "gamemode_bhop") {
            this.bhopExit(mode);
        }

        this.previousGameMode = this.gameMode;
        if (!["gamemode_surf", "gamemode_bhop", "gamemode_kz"].includes(mode)) {
            this.lastNonMovementMode = mode;
        }
        this.gameMode = mode;
        
        const modeName = mode.replace("gamemode_", "");
        this.trackSelectedMode(modeName);
        
        if (mode === "gamemode_static") {
            this.static_Start();
        } else if (mode === "gamemode_dynamic") {
            this.dynamic_Start();
        } else if (mode === "gamemode_rush") {
            this.rush_Start();
        } else if (mode === "gamemode_target") {
            this.targets_Start();
        } else if (mode === "gamemode_combat") {
            this.combat_Start();
        } else if (mode === "gamemode_spray") {
            this.spray_Start();
        } else if (mode === "gamemode_reaction") {
            this.reaction_Start();
        } else if (mode === "gamemode_speed") {
            this.speed_Start();
        } else if (mode === "gamemode_prefire") {
            this.prefire_Start();
        } else if (mode === "gamemode_surf") {
            this.surf_Start();
        } else if (mode === "gamemode_bhop") {
            this.bhop_Start();
        } else if (mode === "gamemode_kz") {
            this.kz_Start();
        }
        
        this.updateGamemodeUI();
    }

    saveCheckpoint() {
        if (this.gameMode !== "gamemode_kz" || !this.isActive) return;
        const controller = Instance.GetPlayerController(0);
        if (!controller || !controller.IsValid()) return;
        const pawn = controller.GetPlayerPawn();
        if (!pawn || !pawn.IsValid()) return;
        if (this.isInAir) {
            Instance.ServerCommand(`ent_fire snd_cp_no startsound`, 0.0);
			Instance.ServerCommand(`say_team You can't make a checkpoint mid-air.`, 0.0);
            return;
        }
        this.checkpoint = {
            position: pawn.GetAbsOrigin(),
            eyeAngles: pawn.GetEyeAngles()
        };
        this.cpNum++;

        // First checkpoint switches PB tracking from PRO to NUB
        if (this.cpNum === 1) {
            const data = this.getSaveObject();
            const nubKey = this.kzVariant === 2 ? "highscore_kz_2_nub" : "highscore_kz_nub";
            this.movementPB = data[nubKey];
            this.missedPB = false;
            setTimerColor(0, 255, 0);
        }

        Instance.ServerCommand(`say_team Checkpoint #${this.cpNum} saved!`, 0.0);
        Instance.ServerCommand(`ent_fire snd_cp startsound`, 0.0);
    }

    loadCheckpoint() {
        if (this.gameMode !== "gamemode_kz" || !this.isActive || !this.checkpoint) return;
        const controller = Instance.GetPlayerController(0);
        if (!controller || !controller.IsValid()) return;
        const pawn = controller.GetPlayerPawn();
        if (!pawn || !pawn.IsValid()) return;

        const currentPos = pawn.GetAbsOrigin() || { x: 0, y: 0, z: 0 };
        const checkpointPos = this.checkpoint.position;
        const tolerance = 0.1;
        const isSamePosition =
            Math.abs(currentPos.x - checkpointPos.x) < tolerance &&
            Math.abs(currentPos.y - checkpointPos.y) < tolerance &&
            Math.abs(currentPos.z - checkpointPos.z) < tolerance;

        if (isSamePosition) {
            // Already at checkpoint position, no teleport needed
        } else {
            pawn.Teleport({
                position: this.checkpoint.position,
                angles: this.checkpoint.eyeAngles,
                velocity: { x: 0, y: 0, z: 0 }
            });
        }

        this.tpNum++;
        renderRestart("CHECKPOINT LOADED", 0, RS_Y, 0, 220, 100, 80);
        Instance.ServerCommand(`say_team Checkpoint #${this.cpNum} loaded!`, 0.0);
        Instance.ServerCommand(`ent_fire snd_cp startsound`, 0.0);
    }

    rush_Reset() {
        if (this.gameMode !== "gamemode_rush" || !this.isActive) return;
        const controller = Instance.GetPlayerController(0);
        if (!controller || !controller.IsValid()) return;
        const pawn = controller.GetPlayerPawn();
        if (!pawn || !pawn.IsValid()) return;

        if (this.kills > 0) {
            if (this.kills > this.bestKills) {
                this.bestKills = this.kills;
                this.bestKillsBotCount = this.rushNumBots;
                const data = this.getSaveObject();
                data.rushBest = { kills: this.bestKills, bots: this.bestKillsBotCount };
                Instance.SetSaveData(JSON.stringify(data));
                Instance.ServerCommand(`say_team New personal best! ${this.kills} kills on ${this.rushNumBots} active bots`, 0.0);
                Instance.ServerCommand(`ent_fire snd_pb startsound`, 0.0);
            } else {
                Instance.ServerCommand(`say_team ${this.kills} kills (Best: ${this.bestKills} on ${this.bestKillsBotCount} bots)`, 0.0);
            }
        }

        this.kills = 0;
        this.tickCount = 0;
        this.teleportAllBots();
        this.Hud();
    }

    setBots(action) {
        if (this.gameMode === "gamemode_target") return;
        if (this.gameMode === "gamemode_spray") return;
        if (this.gameMode === "gamemode_reaction") return;
        if (this.gameMode === "gamemode_prefire") return;
        
        if (action === "add") {
            this.numBots++;
        } else if (action === "remove") {
            this.numBots = Math.max(1, this.numBots - 1);
        }

        if (this.gameMode === "gamemode_combat" || this.gameMode === "gamemode_speed") {
            this.numBots = Math.max(1, Math.min(10, this.numBots));
            if (this.gameMode === "gamemode_combat") this.combatNumBots = this.numBots;
            else if (this.gameMode === "gamemode_speed") this.speedNumBots = this.numBots;
        } else {
            this.numBots = Math.max(1, Math.min(15, this.numBots));
        }

        if (this.gameMode === "gamemode_static") this.staticNumBots = this.numBots;
        else if (this.gameMode === "gamemode_dynamic") this.dynamicNumBots = this.numBots;
        else if (this.gameMode === "gamemode_rush") this.rushNumBots = this.numBots;

        Instance.ServerCommand(`bot_quota ${this.numBots}`);
        Instance.ServerCommand(`ent_fire brush_botcounter SetRenderAttribute count=${this.numBots}`);
        this.updateKillCounter();
        this.saveBotCounts();
        if (this.gameMode === "gamemode_rush" || this.gameMode === "gamemode_combat") {
            this.Hud();
        }
    }

    saveBotCounts() {
        const data = this.getSaveObject();
        data.botCounts = {
            static: this.staticNumBots,
            dynamic: this.dynamicNumBots,
            rush: this.rushNumBots,
            combat: this.combatNumBots,
            speed: this.speedNumBots
        };
        Instance.SetSaveData(JSON.stringify(data));
    }

    loadBotCounts() {
        const data = this.getSaveObject();
        if (data.rushBest) {
            if (data.rushBest.kills !== undefined) this.bestKills = data.rushBest.kills;
            if (data.rushBest.bots !== undefined) this.bestKillsBotCount = data.rushBest.bots;
        }
        if (!data.botCounts) return;
        if (data.botCounts.static !== undefined) this.staticNumBots = data.botCounts.static;
        if (data.botCounts.dynamic !== undefined) this.dynamicNumBots = data.botCounts.dynamic;
        if (data.botCounts.rush !== undefined) this.rushNumBots = data.botCounts.rush;
        if (data.botCounts.combat !== undefined) this.combatNumBots = data.botCounts.combat;
        if (data.botCounts.speed !== undefined) this.speedNumBots = data.botCounts.speed;
        this.numBots = this.staticNumBots;
    }

    setArmor() {
        this.armorStage = (this.armorStage % 3) + 1;
        this.applyArmorStage();

        const data = this.getSaveObject();
        data.armorStage = this.armorStage;
        Instance.SetSaveData(JSON.stringify(data));
    }

    applyArmorStage() {
        if (this.armorStage === 1) {
            Instance.ServerCommand("mp_free_armor 1");
            Instance.EntFireAtName({ name: "brush_settings_kevlar", input: "Enable" });
            Instance.EntFireAtName({ name: "brush_settings_armor", input: "Disable" });
            Instance.EntFireAtName({ name: "brush_settings_noarmor", input: "Disable" });
            Instance.ServerCommand("ent_fire relay_settings_dboard_kevlar trigger");
        } else if (this.armorStage === 2) {
            Instance.ServerCommand("mp_free_armor 2");
            Instance.EntFireAtName({ name: "brush_settings_kevlar", input: "Disable" });
            Instance.EntFireAtName({ name: "brush_settings_armor", input: "Enable" });
            Instance.EntFireAtName({ name: "brush_settings_noarmor", input: "Disable" });
            Instance.ServerCommand("ent_fire relay_settings_dboard_armor trigger");
        } else if (this.armorStage === 3) {
            Instance.ServerCommand("mp_free_armor 0");
            Instance.EntFireAtName({ name: "brush_settings_kevlar", input: "Disable" });
            Instance.EntFireAtName({ name: "brush_settings_armor", input: "Disable" });
            Instance.EntFireAtName({ name: "brush_settings_noarmor", input: "Enable" });
            Instance.ServerCommand("ent_fire relay_settings_dboard_armor_none trigger");
        }
    }

    loadArmorSetting() {
        const data = this.getSaveObject();
        if (data.armorStage !== undefined) {
            this.armorStage = data.armorStage;
        }
        this.applyArmorStage();
    }

    setAmmo() {
        this.ammoStage = this.ammoStage === 1 ? 2 : 1;
        this.applyAmmoStage();

        const data = this.getSaveObject();
        data.ammoStage = this.ammoStage;
        Instance.SetSaveData(JSON.stringify(data));
    }

    applyAmmoStage() {
        if (this.ammoStage === 1) {
            Instance.ServerCommand("sv_infinite_ammo 1");
            Instance.EntFireAtName({ name: "brush_settings_selected_infammo", input: "Enable" });
            Instance.EntFireAtName({ name: "brush_settings_default_infammo", input: "Disable" });
            Instance.ServerCommand("ent_fire relay_settings_dboard_ammo_enabled trigger");
        } else {
            Instance.ServerCommand("sv_infinite_ammo 0");
            Instance.EntFireAtName({ name: "brush_settings_selected_infammo", input: "Disable" });
            Instance.EntFireAtName({ name: "brush_settings_default_infammo", input: "Enable" });
            Instance.ServerCommand("ent_fire relay_settings_dboard_ammo_disabled trigger");
        }
    }

    loadAmmoSetting() {
        const data = this.getSaveObject();
        if (data.ammoStage !== undefined) {
            this.ammoStage = data.ammoStage;
        }
        this.applyAmmoStage();
    }

    setHeadshot() {
        this.headshotStage = this.headshotStage === 1 ? 2 : 1;
        this.applyHeadshotStage();

        const data = this.getSaveObject();
        data.headshotStage = this.headshotStage;
        Instance.SetSaveData(JSON.stringify(data));
    }

    applyHeadshotStage() {
        if (this.headshotStage === 1) {
            Instance.ServerCommand("mp_damage_headshot_only 0");
            Instance.EntFireAtName({ name: "brush_settings_default_hsonly", input: "Enable" });
            Instance.EntFireAtName({ name: "brush_settings_selected_hsonly", input: "Disable" });
            Instance.ServerCommand("ent_fire relay_settings_dboard_hs_disabled trigger");
        } else {
            Instance.ServerCommand("mp_damage_headshot_only 1");
            Instance.EntFireAtName({ name: "brush_settings_default_hsonly", input: "Disable" });
            Instance.EntFireAtName({ name: "brush_settings_selected_hsonly", input: "Enable" });
            Instance.ServerCommand("ent_fire relay_settings_dboard_hs_enabled trigger");
        }
    }

    loadHeadshotSetting() {
        const data = this.getSaveObject();
        if (data.headshotStage !== undefined) {
            this.headshotStage = data.headshotStage;
        }
        this.applyHeadshotStage();
    }

    setPlayermodels() {
        this.agentsStage = this.agentsStage === 1 ? 2 : 1;
        this.applyPlayermodelsStage();

        const data = this.getSaveObject();
        data.agentsStage = this.agentsStage;
        Instance.SetSaveData(JSON.stringify(data));
    }

    applyPlayermodelsStage() {
        if (this.agentsStage === 1) {
            Instance.EntFireAtName({ name: "brush_settings_selected_playermodels", input: "Enable" });
            Instance.EntFireAtName({ name: "brush_settings_default_playermodels", input: "Disable" });
            Instance.ServerCommand("ent_fire relay_settings_dboard_playermodel_enabled trigger");
            isModelChangeEnabled = true;
            assignedModels.clear();
            applyModelsToAllCTBots();
        } else {
            Instance.EntFireAtName({ name: "brush_settings_selected_playermodels", input: "Disable" });
            Instance.EntFireAtName({ name: "brush_settings_default_playermodels", input: "Enable" });
            Instance.ServerCommand("ent_fire relay_settings_dboard_playermodel_disabled trigger");
            isModelChangeEnabled = false;
            setAllToDefault();
        }
    }

    loadPlayermodelsSetting() {
        const data = this.getSaveObject();
        if (data.agentsStage !== undefined) {
            this.agentsStage = data.agentsStage;
        }
        this.applyPlayermodelsStage();
    }

    incGlobalKills() {
        this.globalKills++;

        if (this.globalKills > 0 && this.globalKills % 100 === 0) {
            this.trigger100KillEvent();
        }

        if (this.globalKills > 0 && this.globalKills % 1000 === 0) {
            Instance.ServerCommand("say_team " + this.globalKills + " bots killed!", 0.0);
        }

        this.updateKillCounter();
    }

	updateKillCounter() {
		let value = this.globalKills;
		let activeDigits = 0;

		let temp = value;
		if (temp === 0) activeDigits = 1;
		else {
			while (temp > 0) {
				activeDigits++;
				temp = Math.floor(temp / 10);
			}
		}

		activeDigits = Math.min(activeDigits, this.KILLCOUNTER_DIGITS);

		let digits = [];
		for (let i = 0; i < activeDigits; i++) {
			digits.push(value % 10);
			value = Math.floor(value / 10);
		}

		for (let i = 0; i < this.KILLCOUNTER_DIGITS; i++) {
			const brushIndex = this.KILLCOUNTER_DIGITS - activeDigits + i;
			const digit = i < activeDigits ? digits[i] : 10;
			const brush = `${this.KILLCOUNTER_PREFIX}${brushIndex + 1}`;
			Instance.ServerCommand(`ent_fire ${brush} SetRenderAttribute count=${digit}`, 0.0);
		}
	}

    targets_Start() {
        if (this.targetsActive) {
            for (const ball of this.targetsBalls) {
                Instance.ServerCommand(`ent_fire ${ball.name} Kill`);
            }
            for (const item of this.targetsScalingBalls) {
                if (item.ball && item.ball.IsValid()) {
                    item.ball.Kill();
                }
            }
        }
        
        this.gameMode = "gamemode_target";
        this.isActive = false;
        this.targetsActive = true;
        this.targetsInitBall = true;
        this.targetsBalls = [];
        this.targetsUsedPoints = [];
        this.targetsPendingSpawns = [];
        this.targetsScalingBalls = [];
        
        this.cleanupGamemodeProps();
        
        Instance.ServerCommand(`bot_quota 0`);
        Instance.ServerCommand(`ent_fire brush_botcounter SetRenderAttribute count=0`);
        Instance.ServerCommand(`ent_fire button_add_bot Disable`);
        Instance.ServerCommand(`ent_fire button_remove_bot Disable`);
        
        Instance.ServerCommand(`ent_fire brush_target_outliner Enable`);
        Instance.ServerCommand(`ent_fire brush_rush_playerblocker Enable`);
        Instance.ServerCommand(`ent_fire brush_rush_border Enable`);
        
        Instance.ServerCommand(`ent_fire visbox_botcounter Enable`);
        Instance.ServerCommand(`ent_fire brush_clock_* Enable`);
        
        this.targetsSpawnBall("sphere_tp_39", true);
    }

    targetsGetRandomPoint() {
        let attempts = 0;
        while (attempts < 100) {
            const point = `sphere_tp_${randInt(1, 64)}`;
            if (!this.targetsUsedPoints.includes(point)) {
                return point;
            }
            attempts++;
        }
        return `sphere_tp_${randInt(1, 64)}`;
    }

    targetsSpawnBall(sphere, isInitBall) {
        const ballName = `target_ball_${Date.now()}_${randInt(1000, 9999)}`;
        
        this.targetsUsedPoints.push(sphere);
        this.targetsBalls.push({ name: ballName, sphere: sphere });
        
        Instance.ServerCommand(`ent_create prop_dynamic_override {"targetname" "${ballName}" "model" "models/target_aim/target.vmdl" "origin" "0 0 -2048" "angles" "0 90 0" "solid" "6" "health" "9999"}`);
        
        this.targetsPendingSpawns.push({
            ballName: ballName,
            sphere: sphere,
            isInitBall: isInitBall,
            executeTime: Instance.GetGameTime() + 0.1
        });
    }

    targetsFinishSpawn(ballName, sphere, isInitBall) {
        const ball = Instance.FindEntityByName(ballName);
        if (!ball || !ball.IsValid()) {
            this.targetsPendingSpawns.push({
                ballName: ballName,
                sphere: sphere,
                isInitBall: isInitBall,
                executeTime: Instance.GetGameTime() + 0.05
            });
            return;
        }
        
        ball.SetModelScale(0.015);
        this.targetsScalingBalls.push({ name: ballName, scale: 0.015, direction: "up", ball: ball });
        
        let hasBeenHit = false;
        
        if (isInitBall) {
            Instance.ConnectOutput(ball, "OnTakeDamage", () => {
                if (hasBeenHit) return;
                hasBeenHit = true;
                this.targetsOnInitHit(ballName);
            });
        } else {
            Instance.ConnectOutput(ball, "OnTakeDamage", () => {
                if (hasBeenHit) return;
                hasBeenHit = true;
                this.targetsOnBallHit(ballName);
            });
        }
        
        Instance.ServerCommand(`ent_fire ${sphere} TeleportEntity ${ballName}`);
    }

    targetsOnInitHit(ballName) {
        if (!this.targetsActive) return;
        
        Instance.ServerCommand(`ent_fire snd_spray_hit startsound`);
        
        this.targetsBallScaleDown(ballName);
        
        this.targetsInitBall = false;
        
        this.targetsBalls = [];
        this.targetsUsedPoints = [];
        
        for (let i = 0; i < 3; i++) {
            const point = this.targetsGetRandomPoint();
            this.targetsSpawnBall(point, false);
        }
    }

    targetsOnBallHit(ballName) {
        if (!this.targetsActive) return;
        
        Instance.ServerCommand(`ent_fire snd_spray_hit startsound`);
        
        this.targetsBallScaleDown(ballName);
        
        const ballIndex = this.targetsBalls.findIndex(b => b.name === ballName);
        if (ballIndex !== -1) {
            const ball = this.targetsBalls[ballIndex];
            const pointIndex = this.targetsUsedPoints.indexOf(ball.sphere);
            if (pointIndex !== -1) {
                this.targetsUsedPoints.splice(pointIndex, 1);
            }
            this.targetsBalls.splice(ballIndex, 1);
        }
        
        const point = this.targetsGetRandomPoint();
        this.targetsSpawnBall(point, false);
    }
    
    targetsBallScaleDown(ballName) {
        const existing = this.targetsScalingBalls.find(b => b.name === ballName);
        if (existing) {
            existing.direction = "down";
        } else {
            const ball = Instance.FindEntityByName(ballName);
            if (ball && ball.IsValid()) {
                this.targetsScalingBalls.push({ name: ballName, scale: 1.5, direction: "down", ball: ball });
            }
        }
    }
    
    targetsBallScaleUpdate() {
        for (let i = this.targetsScalingBalls.length - 1; i >= 0; i--) {
            const item = this.targetsScalingBalls[i];
            
            if (!item.ball || !item.ball.IsValid()) {
                this.targetsScalingBalls.splice(i, 1);
                continue;
            }
            
            if (item.direction === "up") {
                item.scale += (1.5 - item.scale) * 0.2;
                
                if (item.scale >= 1.485) {
                    item.scale = 1.5;
                    item.ball.SetModelScale(1.5);
                    this.targetsScalingBalls.splice(i, 1);
                    continue;
                }
            } else if (item.direction === "down") {
                item.scale += (0.0 - item.scale) * 0.25;
                
                if (item.scale <= 0.03) {
                    item.ball.Kill();
                    this.targetsScalingBalls.splice(i, 1);
                    continue;
                }
            }
            
            const rounded = parseFloat(item.scale.toFixed(4));
            item.ball.SetModelScale(rounded);
        }
    }

    targetsExit() {
        for (const ball of this.targetsBalls) {
            Instance.ServerCommand(`ent_fire ${ball.name} Kill`);
        }
        for (const item of this.targetsScalingBalls) {
            if (item.ball && item.ball.IsValid()) {
                item.ball.Kill();
            }
        }
        this.targetsBalls = [];
        this.targetsUsedPoints = [];
        this.targetsPendingSpawns = [];
        this.targetsScalingBalls = [];
        this.targetsActive = false;
        this.targetsInitBall = true;
        
        Instance.ServerCommand(`ent_fire brush_target_outliner Disable`);
        Instance.ServerCommand(`ent_fire brush_rush_playerblocker Disable`);
    }

    combat_Start() {
        const controller = Instance.GetPlayerController(0);
        if (!controller || !controller.IsValid()) return;
        const pawn = controller.GetPlayerPawn();
        if (!pawn || !pawn.IsValid()) return;

        this.gameMode = "gamemode_combat";
        this.isActive = false;
        this.combatActive = true;
        this.combatRoundActive = false;
        this.combatKills = 0;
        this.combatLevel = 1;
        this.combatWaitingToStart = true;
        this.combatBots = [];
        this.hudTick = 0;
        
        pawn.SetHealth(100);
        pawn.SetArmor(100);
        pawn.GiveNamedItem("item_assaultsuit", false);
        
        this.cleanupGamemodeProps();
        
        this.numBots = this.combatNumBots;
        Instance.ServerCommand(`bot_quota ${this.combatNumBots}`);
        Instance.ServerCommand(`ent_fire brush_botcounter SetRenderAttribute count=${this.combatNumBots}`);
        Instance.ServerCommand(`ent_fire button_add_bot Enable`);
        Instance.ServerCommand(`ent_fire button_remove_bot Enable`);
        Instance.ServerCommand(`custom_bot_difficulty 3`);
        
        Instance.ServerCommand(`bot_dont_shoot 1`);
        
        Instance.ServerCommand(`ent_fire spawn_hidden SetEnabled`);
        Instance.ServerCommand(`ent_fire brush_combat_level Enable`);
        Instance.ServerCommand(`ent_fire trigger_combat Enable`);
        
        this.combatTeleportBotsToHidden();
        this.combatInitTime = Instance.GetGameTime() + 0.5;
        this.combatBotsInitialized = false;
        
        Instance.ServerCommand(`ent_fire brush_botcounter_combat Enable`);
        
        this.Hud();
    }
    
    combatOnStartTriggerExit() {
        if (!this.combatActive || this.gameMode !== "gamemode_combat") return;
        if (!this.combatWaitingToStart) return;
        
        this.combatWaitingToStart = false;
        
        this.combatStartRound();
    }
    
    combatStartRound() {
        if (!this.combatActive || this.gameMode !== "gamemode_combat") return;
        
        this.combatWaitingToStart = false;
        this.combatRoundActive = true;
        this.combatKills = 0;
        this.isActive = true;
        
        Instance.ServerCommand(`bot_dont_shoot 0`);
        
        const controller = Instance.GetPlayerController(0);
        if (controller && controller.IsValid()) {
            const pawn = controller.GetPlayerPawn();
            if (pawn && pawn.IsValid()) {
                pawn.SetHealth(100);
                pawn.SetArmor(100);
                pawn.GiveNamedItem("item_assaultsuit", false);
            }
        }

        Instance.ServerCommand(`ent_fire visbox_combat Enable`);
        Instance.ServerCommand(`ent_fire blockbullets_combat Enable`);

        this.combatTeleportBotsToArena();

        Instance.ServerCommand(`ent_fire snd_spray_hit startsound`);

        this.Hud();
    }
    
    combatCommence() {
        if (!this.combatActive || this.gameMode !== "gamemode_combat") return;

        Instance.ServerCommand(`bot_dont_shoot 1`);

        if (this.combatPendingDeathMsg) {
            Instance.ServerCommand(`say_team ${this.combatDeathMsgText}`);
            this.combatPendingDeathMsg = false;
        }

        this.combatTeleportBotsToHidden();

        Instance.ServerCommand(`ent_fire case_combat_scenario pickrandom`);

        const controller = Instance.GetPlayerController(0);
        if (controller && controller.IsValid()) {
            const pawn = controller.GetPlayerPawn();
            if (pawn && pawn.IsValid()) {
                pawn.Teleport({ velocity: { x: 0, y: 0, z: 0 } });
                pawn.SetHealth(100);
                pawn.SetArmor(100);
                pawn.GiveNamedItem("item_assaultsuit", false);

                this.velocityLocked = true;
                this.velocityLockEndTime = Instance.GetGameTime() + 0.5;
            }
        }

        Instance.ServerCommand(`ent_fire visbox_combat Disable`);
        Instance.ServerCommand(`ent_fire blockbullets_combat Disable`);
    }
    
    combatSetArena(arenaNum) {
        this.combatArena = arenaNum;
    }
    
    combatTeleportBotsToArena() {
        this.combatBots = [];
        
        for (let i = 0; i < 64; i++) {
            const ctrl = Instance.GetPlayerController(i);
            if (ctrl && ctrl.IsValid() && ctrl.IsBot() && ctrl.GetTeamNumber() === 3) {
                const botPawn = ctrl.GetPlayerPawn();
                if (botPawn && botPawn.IsValid()) {
                    const teleportIndex = randInt(1, 7);
                    const teleportPoint = Instance.FindEntityByName(`teleport_combat_${this.combatArena}_${teleportIndex}`);
                    if (teleportPoint && teleportPoint.IsValid()) {
                        botPawn.Teleport({
                            position: teleportPoint.GetAbsOrigin(),
                            angles: teleportPoint.GetAbsAngles(),
                            velocity: { x: 0, y: 0, z: 0 }
                        });
                    }
                    this.combatBots.push(botPawn);
                }
            }
        }
    }
    
    combatTeleportBotsToHidden() {
        const hiddenSpawn = Instance.FindEntityByName("spawn_hidden");
        if (!hiddenSpawn || !hiddenSpawn.IsValid()) return;
        
        const hiddenPos = hiddenSpawn.GetAbsOrigin();
        
        for (let i = 0; i < 64; i++) {
            const ctrl = Instance.GetPlayerController(i);
            if (ctrl && ctrl.IsValid() && ctrl.IsBot() && ctrl.GetTeamNumber() === 3) {
                const botPawn = ctrl.GetPlayerPawn();
                if (botPawn && botPawn.IsValid()) {
                    botPawn.Teleport({
                        position: hiddenPos,
                        angles: { x: 0, y: 0, z: 0 },
                        velocity: { x: 0, y: 0, z: 0 }
                    });
                }
            }
        }
    }
    
    combatOnBotKilled() {
        if (!this.combatActive || this.gameMode !== "gamemode_combat") return;
        if (!this.combatRoundActive) return;
        
        this.combatKills++;
        this.Hud();

        if (this.combatKills >= this.combatNumBots) {
            this.combatRoundWon();
        }
    }
    
    combatRoundWon() {
        if (!this.combatActive || this.gameMode !== "gamemode_combat") return;
        
        this.combatRoundActive = false;
        this.isActive = false;
        this.combatLevel++;

        if (this.combatLevel > this.combatBestLevel) {
            this.combatBestLevel = this.combatLevel;
        }

        Instance.ServerCommand(`ent_fire snd_spray_complete startsound`);

        this.combatTeleportBotsToHidden();

        this.combatTeleportTime = Instance.GetGameTime() + 0.5;
        this.combatPendingTeleport = true;

        Instance.ServerCommand(`ent_fire trigger_combat Enable`);

        this.combatWaitingToStart = true;

        this.Hud();
    }
    
    combatOnPlayerKilled() {
        if (!this.combatActive || this.gameMode !== "gamemode_combat") return;
        if (!this.combatRoundActive) return;
        
        this.combatRoundActive = false;
        this.isActive = false;

        Instance.ServerCommand(`bot_dont_shoot 1`);

        const botsAlive = this.combatNumBots - this.combatKills;
        const reachedRound = this.combatLevel;

        if (this.combatLevel > this.combatBestLevel) {
            this.combatBestLevel = this.combatLevel;
        }

        Instance.ServerCommand(`ent_fire snd_spray_fail startsound`);

        // Highscore check for combat
        const combatSaveKey = `highscore_combat`;
        const saveData = this.getSaveObject();
        const previousBest = saveData[combatSaveKey];

        if (previousBest !== undefined && reachedRound > previousBest) {
            saveData[combatSaveKey] = reachedRound;
            Instance.SetSaveData(JSON.stringify(saveData));
            this.combatDeathMsgText = `New personal best! Reached round ${reachedRound} with ${botsAlive} bot${botsAlive !== 1 ? 's' : ''} still alive. (Previous: ${previousBest})`;
            Instance.ServerCommand(`ent_fire snd_pb startsound`);
        } else if (previousBest === undefined) {
            saveData[combatSaveKey] = reachedRound;
            Instance.SetSaveData(JSON.stringify(saveData));
            this.combatDeathMsgText = `Reached round ${reachedRound} with ${botsAlive} bot${botsAlive !== 1 ? 's' : ''} still alive.`;
        } else {
            this.combatDeathMsgText = `Reached round ${reachedRound} with ${botsAlive} bot${botsAlive !== 1 ? 's' : ''} still alive. (Best: ${previousBest})`;
        }
        this.combatPendingDeathMsg = true;

        this.combatLevel = 1;
        this.combatKills = 0;

        this.combatRestoreBots();

        this.combatTeleportBotsToHidden();

        this.combatTeleportTime = Instance.GetGameTime() + 0.5;
        this.combatPendingTeleport = true;

        Instance.ServerCommand(`ent_fire trigger_combat Enable`);

        this.combatWaitingToStart = true;

        this.Hud();
    }
    
    combatTeleportPlayerToMain() {
        const controller = Instance.GetPlayerController(0);
        if (!controller || !controller.IsValid()) return;
        const pawn = controller.GetPlayerPawn();
        if (!pawn || !pawn.IsValid()) return;
        
        const mainTeleport = Instance.FindEntityByName("main_teleport");
        if (mainTeleport && mainTeleport.IsValid()) {
            pawn.Teleport({
                position: mainTeleport.GetAbsOrigin(),
                angles: mainTeleport.GetAbsAngles(),
                velocity: { x: 0, y: 0, z: 0 }
            });
        }
    }
    
    combatRestoreBots() {
        for (let i = 0; i < 64; i++) {
            const ctrl = Instance.GetPlayerController(i);
            if (ctrl && ctrl.IsValid() && ctrl.IsBot() && ctrl.GetTeamNumber() === 3) {
                const botPawn = ctrl.GetPlayerPawn();
                if (botPawn && botPawn.IsValid()) {
                    botPawn.SetHealth(100);
                    botPawn.SetArmor(100);
                }
            }
        }
    }
    
    combatExit() {
        if (!this.combatActive) return;

        if (this.combatBestLevel > 1) {
            Instance.ServerCommand(`say_team Combat best: round ${this.combatBestLevel} on ${this.combatNumBots} active bots`);
        }
        
        this.combatActive = false;
        this.combatRoundActive = false;
        this.combatWaitingToStart = false;
        this.combatKills = 0;
        this.combatBots = [];

        Instance.ServerCommand(`bot_dont_shoot 1`);

        const controller = Instance.GetPlayerController(0);
        if (controller && controller.IsValid()) {
            const pawn = controller.GetPlayerPawn();
            if (pawn && pawn.IsValid()) {
                pawn.SetHealth(255);
            }
        }

        Instance.ServerCommand(`ent_fire timer_hudhint kill`);

        Instance.ServerCommand(`ent_fire brush_combat_level Disable`);

        Instance.ServerCommand(`ent_fire trigger_combat Disable`);

        Instance.ServerCommand(`ent_fire spawn_hidden SetDisabled`);

        Instance.ServerCommand(`ent_fire visbox_combat Disable`);
        Instance.ServerCommand(`ent_fire blockbullets_combat Disable`);

        Instance.ServerCommand(`ent_fire relay_combat_exit trigger`);
    }

    setGamemodesCategory(category) {
        if (category === "challenges" || category === "movement") {
            this.currentRightCategory = category;
            this.updateRightCategoryButtons();
            this.updateGamemodeUI();

            if (category === "movement") {
                Instance.ServerCommand(`ent_fire visbox_spray_distance Enable`);
                Instance.ServerCommand(`ent_fire button_spray_distance_* Lock`);
                if (this.gameMode === "gamemode_surf") {
                    Instance.ServerCommand(`ent_fire blockbullets_prefire Enable`);
                    this.surfStartMapScaleIn();
                    this.prefireWallbrushScaleDown();
                }
                if (this.gameMode === "gamemode_bhop") {
                    Instance.ServerCommand(`ent_fire blockbullets_prefire Enable`);
                    this.bhopStartMapScaleIn();
                    this.prefireWallbrushScaleDown();
                }
                if (this.gameMode === "gamemode_kz") {
                    Instance.ServerCommand(`ent_fire blockbullets_prefire Enable`);
                    this.kzStartMapScaleIn();
                    this.prefireWallbrushScaleDown();
                }
            } else if (category === "challenges") {
                if (this.gameMode === "gamemode_spray") {
                    Instance.ServerCommand(`ent_fire visbox_spray_distance Disable`);
                    Instance.ServerCommand(`ent_fire button_spray_distance_* Unlock`);
                }
                Instance.ServerCommand(`ent_fire prop_surf_map_* Disable`);
                Instance.ServerCommand(`ent_fire prop_surf_map_* DisableCollision`);
                Instance.ServerCommand(`ent_fire blockbullets_prefire Disable`);
                Instance.ServerCommand(`ent_fire brush_timer_surf_1_* Disable`);
                Instance.ServerCommand(`ent_fire brush_timer_surf_2_* Disable`);
                this.surfMapScaling = [];
                Instance.ServerCommand(`ent_fire prop_bhop_map_* Disable`);
                Instance.ServerCommand(`ent_fire prop_bhop_map_* DisableCollision`);
                Instance.ServerCommand(`ent_fire brush_timer_bhop_1_* Disable`);
                Instance.ServerCommand(`ent_fire brush_timer_bhop_2_* Disable`);
                this.bhopMapScaling = [];
                Instance.ServerCommand(`ent_fire prop_kz_map_* Disable`);
                Instance.ServerCommand(`ent_fire prop_kz_map_* DisableCollision`);
                Instance.ServerCommand(`ent_fire brush_timer_kz_1_* Disable`);
                Instance.ServerCommand(`ent_fire brush_timer_kz_2_* Disable`);
                this.kzMapScaling = [];
                if (this.gameMode === "gamemode_surf") {
                    this.prefireWallbrushScaleUp();
                }
                if (this.gameMode === "gamemode_bhop") {
                    this.prefireWallbrushScaleUp();
                }
                if (this.gameMode === "gamemode_kz") {
                    this.prefireWallbrushScaleUp();
                }
            }
            return;
        }
        
        if (category === "warmup" || category === "training") {
            this.currentLeftCategory = category;
            this.updateLeftCategoryButtons();
            this.updateGamemodeUI();

            if (category === "training") {
                Instance.ServerCommand(`ent_fire visbox_bot_distance Enable`);
                Instance.ServerCommand(`ent_fire button_static_distance_* Lock`);
                if (this.gameMode === "gamemode_speed") {
                    Instance.ServerCommand(`ent_fire visbox_speed Disable`);
                    Instance.ServerCommand(`ent_fire button_speed_* Unlock`);
                }
                if (this.gameMode === "gamemode_prefire") {
                    Instance.ServerCommand(`ent_fire blockbullets_prefire Enable`);
                    this.prefireStartMapScaleIn();
                    this.prefireWallbrushScaleDown();
                }
            } else if (category === "warmup") {
                if (this.gameMode === "gamemode_static") {
                    Instance.ServerCommand(`ent_fire visbox_bot_distance Disable`);
                    Instance.ServerCommand(`ent_fire button_static_distance_* Unlock`);
                }
                Instance.ServerCommand(`ent_fire visbox_speed Enable`);
                Instance.ServerCommand(`ent_fire button_speed_* Lock`);
                Instance.ServerCommand(`ent_fire prop_prefire_map_* Disable`);
                Instance.ServerCommand(`ent_fire prop_prefire_map_* DisableCollision`);
                Instance.ServerCommand(`ent_fire blockbullets_prefire Disable`);
                this.prefireMapScaling = [];
                if (this.gameMode === "gamemode_prefire") {
                    this.prefireWallbrushScaleUp();
                }
            }
            return;
        }
    }
    
    updateLeftCategoryButtons() {
        const category = this.currentLeftCategory;
        
        if (category === "warmup") {
            this.gamemodeCategories.warmup.forEach(mode => {
                Instance.ServerCommand(`ent_fire button_bots_${mode} Unlock`);
                Instance.ServerCommand(`ent_fire brush_bots_default_${mode} Enable`);
                Instance.ServerCommand(`ent_fire brush_bots_selected_${mode} Enable`);
            });

            this.gamemodeCategories.training.forEach(mode => {
                Instance.ServerCommand(`ent_fire button_gamemode_training_${mode} Lock`);
                Instance.ServerCommand(`ent_fire brush_gamemode_training_default_${mode} Disable`);
                Instance.ServerCommand(`ent_fire brush_gamemode_training_selected_${mode} Disable`);
            });
        } else if (category === "training") {
            this.gamemodeCategories.training.forEach(mode => {
                Instance.ServerCommand(`ent_fire button_gamemode_training_${mode} Unlock`);
                Instance.ServerCommand(`ent_fire brush_gamemode_training_default_${mode} Enable`);
                Instance.ServerCommand(`ent_fire brush_gamemode_training_selected_${mode} Enable`);
            });

            this.gamemodeCategories.warmup.forEach(mode => {
                Instance.ServerCommand(`ent_fire button_bots_${mode} Lock`);
                Instance.ServerCommand(`ent_fire brush_bots_default_${mode} Disable`);
                Instance.ServerCommand(`ent_fire brush_bots_selected_${mode} Disable`);
            });
        }
    }
    
    updateRightCategoryButtons() {
        const category = this.currentRightCategory;
        
        if (category === "challenges") {
            this.gamemodeCategories.challenges.forEach(mode => {
                Instance.ServerCommand(`ent_fire button_gamemode_challenges_${mode} Unlock`);
                Instance.ServerCommand(`ent_fire brush_gamemode_challenges_default_${mode} Enable`);
                Instance.ServerCommand(`ent_fire brush_gamemode_challenges_selected_${mode} Enable`);
            });

            this.gamemodeCategories.movement.forEach(mode => {
                Instance.ServerCommand(`ent_fire button_gamemode_movement_${mode} Lock`);
                Instance.ServerCommand(`ent_fire brush_gamemode_movement_default_${mode} Disable`);
                Instance.ServerCommand(`ent_fire brush_gamemode_movement_selected_${mode} Disable`);
            });
        } else if (category === "movement") {
            this.gamemodeCategories.movement.forEach(mode => {
                Instance.ServerCommand(`ent_fire button_gamemode_movement_${mode} Unlock`);
                Instance.ServerCommand(`ent_fire brush_gamemode_movement_default_${mode} Enable`);
                Instance.ServerCommand(`ent_fire brush_gamemode_movement_selected_${mode} Enable`);
            });

            this.gamemodeCategories.challenges.forEach(mode => {
                Instance.ServerCommand(`ent_fire button_gamemode_challenges_${mode} Lock`);
                Instance.ServerCommand(`ent_fire brush_gamemode_challenges_default_${mode} Disable`);
                Instance.ServerCommand(`ent_fire brush_gamemode_challenges_selected_${mode} Disable`);
            });
        }
    }

    updateEdgeBrushVisibility() {
        const disabledEdges = new Set();
        if (this.gameMode === "gamemode_static" && this.currentLeftCategory === "warmup")      disabledEdges.add("brush_gamemode_edge_1");
        if (this.gameMode === "gamemode_speed"  && this.currentLeftCategory === "training")    disabledEdges.add("brush_gamemode_edge_2");
        if (this.gameMode === "gamemode_spray"  && this.currentRightCategory === "challenges") disabledEdges.add("brush_gamemode_edge_4");

        for (const entry of this.switcherLoopBrushes) {
            if (entry.name === "brush_gamemode_edge_1" || entry.name === "brush_gamemode_edge_2" || entry.name === "brush_gamemode_edge_4") {
                entry.disabled = disabledEdges.has(entry.name);
            }
        }
    }

    updateGamemodeUI() {
        if (this.currentLeftCategory === "warmup") {
            this.gamemodeCategories.warmup.forEach(mode => {
                Instance.ServerCommand(`ent_fire brush_bots_default_${mode} Enable`);
                Instance.ServerCommand(`ent_fire brush_bots_selected_${mode} Disable`);
            });
        }

        if (this.currentLeftCategory === "training") {
            this.gamemodeCategories.training.forEach(mode => {
                Instance.ServerCommand(`ent_fire brush_gamemode_training_default_${mode} Enable`);
                Instance.ServerCommand(`ent_fire brush_gamemode_training_selected_${mode} Disable`);
            });
        }

        if (this.currentRightCategory === "challenges") {
            this.gamemodeCategories.challenges.forEach(mode => {
                Instance.ServerCommand(`ent_fire brush_gamemode_challenges_default_${mode} Enable`);
                Instance.ServerCommand(`ent_fire brush_gamemode_challenges_selected_${mode} Disable`);
            });
        }

        if (this.currentRightCategory === "movement") {
            this.gamemodeCategories.movement.forEach(mode => {
                Instance.ServerCommand(`ent_fire brush_gamemode_movement_default_${mode} Enable`);
                Instance.ServerCommand(`ent_fire brush_gamemode_movement_selected_${mode} Disable`);
            });
        }

        const currentModeName = this.gameMode.replace("gamemode_", "");

        if (this.gamemodeCategories.warmup.includes(currentModeName) && this.currentLeftCategory === "warmup") {
            Instance.ServerCommand(`ent_fire brush_bots_default_${currentModeName} Disable`);
            Instance.ServerCommand(`ent_fire brush_bots_selected_${currentModeName} Enable`);
        } else if (this.gamemodeCategories.training.includes(currentModeName) && this.currentLeftCategory === "training") {
            Instance.ServerCommand(`ent_fire brush_gamemode_training_default_${currentModeName} Disable`);
            Instance.ServerCommand(`ent_fire brush_gamemode_training_selected_${currentModeName} Enable`);
        } else if (this.gamemodeCategories.challenges.includes(currentModeName) && this.currentRightCategory === "challenges") {
            Instance.ServerCommand(`ent_fire brush_gamemode_challenges_default_${currentModeName} Disable`);
            Instance.ServerCommand(`ent_fire brush_gamemode_challenges_selected_${currentModeName} Enable`);
        } else if (this.gamemodeCategories.movement.includes(currentModeName) && this.currentRightCategory === "movement") {
            Instance.ServerCommand(`ent_fire brush_gamemode_movement_default_${currentModeName} Disable`);
            Instance.ServerCommand(`ent_fire brush_gamemode_movement_selected_${currentModeName} Enable`);
        }

        this.updateEdgeBrushVisibility();
    }

    trackSelectedMode(mode) {
        if (this.gamemodeCategories.warmup.includes(mode)) {
            this.lastWarmupMode = mode;
        } else if (this.gamemodeCategories.training.includes(mode)) {
            this.lastTrainingMode = mode;
        } else if (this.gamemodeCategories.challenges.includes(mode)) {
            this.lastChallengesMode = mode;
        } else if (this.gamemodeCategories.movement.includes(mode)) {
            this.lastMovementMode = mode;
        }
    }
}

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
            const p = ctrl.GetPlayerPawn();
            if (p?.IsValid()) applyModelToCTBot(p);
        }
    }
}

function setAllToDefault() {
    for (let slot = 0; slot < 64; ++slot) {
        const ctrl = Instance.GetPlayerController(slot);
        if (ctrl?.IsValid() && ctrl.IsBot() && ctrl.GetTeamNumber() === 3) {
            const p = ctrl.GetPlayerPawn();
            if (p?.IsValid()) p.SetModel(DEFAULT_MODEL);
        }
    }
    assignedModels.clear();
}


Instance.OnActivate(() => {
    p = new Timer();
	p.initScaleBrushes();

    Instance.SetThink(() => p.UpdateTime(), "UpdateTime");
    Instance.SetNextThink(Instance.GetGameTime() + p.TICK_INTERVAL, "UpdateTime");

    Instance.OnPlayerJump((event) => {
        const player = event.player;
        if (p.isActive && player.GetPlayerController()?.GetPlayerSlot() === 0) {
            if (p.gameMode === "gamemode_bhop") {
                p.IncJumps();
            }
            if (p.gameMode === "gamemode_kz") {
                p.isInAir = true;
                // Capture speed on next tick for jump speed display
                p.kzJumpCaptureNextTick = true;
            }
        }
    });

    Instance.OnPlayerLand((event) => {
        const player = event.player;
        if (p.isActive && player.GetPlayerController()?.GetPlayerSlot() === 0) {
            if (p.gameMode === "gamemode_kz") {
                p.kzWasInAir = p.isInAir;
                p.isInAir = false;
                // Capture horizontal speed at the moment of landing using engine velocity
                var vel = player.GetAbsVelocity();
                if (vel) {
                    p.kzLandSpeed = Math.sqrt(vel.x * vel.x + vel.y * vel.y);
                } else {
                    p.kzLandSpeed = 0;
                }
                p.kzLandTime = Instance.GetGameTime();
            }
        }
    });

    Instance.OnPlayerDamage((event) => {
        if (!p.sprayActive || p.gameMode !== "gamemode_spray") return;
        
        const victim = event.player;
        if (!victim || !victim.IsValid()) return;

        if (victim.GetTeamNumber() !== 3) return;
        
        const attacker = event.attacker;
        if (!attacker || !attacker.IsValid()) return;
        
        const attackerController = attacker.GetPlayerController();
        if (!attackerController || !attackerController.IsValid()) return;

        if (attackerController.GetPlayerSlot() === 0) {
            p.sprayShotHit();
        }
    });
    
    applyModelsToAllCTBots();
});

Instance.OnScriptInput("setup", () => {
    p.createParticles();
    p.restart();	
    p.initScaleBrushes();
    p.startSwitcherLoop();

    const controller = Instance.GetPlayerController(0);
    let playerName = "Player";
    if (controller && controller.IsValid()) {
        playerName = controller.GetPlayerName();

        const worldText = Instance.FindEntityByName("worldtext_playername");
        if (worldText && worldText.IsValid()) {
            Instance.EntFireAtTarget({
                target: worldText,
                input: "SetMessage",
                value: playerName
            });
        }
    }

    // Run only once
    if (!p.setupDone) {
        p.setupDone = true;
		Instance.ServerCommand(`mp_restartgame 1`, 0.0);
        p.restart();

        p.numBots = 10;
        p.staticNumBots = 10;
        p.dynamicNumBots = 8;
        p.rushNumBots = 8;

        // Load saved bot counts (overrides defaults above)
        p.loadBotCounts();

        p.numBots = Math.max(1, Math.min(15, p.numBots));
        p.staticNumBots = Math.max(1, Math.min(15, p.staticNumBots));
        p.dynamicNumBots = Math.max(1, Math.min(15, p.dynamicNumBots));
        p.rushNumBots = Math.max(1, Math.min(15, p.rushNumBots));

        Instance.ServerCommand(`bot_quota ${p.numBots}`);
        Instance.ServerCommand(`ent_fire brush_botcounter SetRenderAttribute count=${p.numBots}`);
        Instance.ServerCommand(`ent_create env_hudhint {"targetname" "timer_finish" "message" "COMPLETE"}`);

        if (!p.killCounterInitialized) {
            p.killCounterInitialized = true;
            for (let i = 1; i <= p.KILLCOUNTER_DIGITS; i++) {
                const brush = `${p.KILLCOUNTER_PREFIX}${i}`;
                Instance.ServerCommand(`ent_fire ${brush} SetRenderAttribute count=10`, 0.0);
            }
            p.updateKillCounter();
        }

        // Welcome message
        if (controller && controller.IsValid()) {
            Instance.ServerCommand(`say_team Welcome, ${playerName}!`, 0.0);
            p.delayedActions.push({
                time: Instance.GetGameTime() + 0.3,
                action: () => Instance.ServerCommand(`say_team Loading saved settings...`, 0.0)
            });
        }
		
        p.setGamemodesCategory("challenges");
        p.updateGamemodeUI();
    } else {
        p.loadArmorSetting();
        p.loadAmmoSetting();
        p.loadHeadshotSetting();
    }

    const savedData = p.getSaveObject();
    const surfPB = savedData["highscore_gamemode_surf"];
    if (surfPB !== undefined) { p.surfVariant = 1; p.updateSurfTimerBrushes(surfPB); }
    const surf2PB = savedData["highscore_gamemode_surf_2"];
    if (surf2PB !== undefined) { p.surfVariant = 2; p.updateSurfTimerBrushes(surf2PB); }
    p.surfVariant = 1;

    const bhopPB = savedData["highscore_gamemode_bhop"];
    if (bhopPB !== undefined) { p.bhopVariant = 1; p.updateBhopTimerBrushes(bhopPB); }
    const bhop2PB = savedData["highscore_gamemode_bhop_2"];
    if (bhop2PB !== undefined) { p.bhopVariant = 2; p.updateBhopTimerBrushes(bhop2PB); }
    p.bhopVariant = 1;

    var kzPro1 = savedData["highscore_kz_pro"], kzNub1 = savedData["highscore_kz_nub"];
    var kzBest1 = (kzPro1 !== undefined && kzNub1 !== undefined) ? Math.min(kzPro1, kzNub1) : (kzPro1 !== undefined ? kzPro1 : kzNub1);
    if (kzBest1 !== undefined) { p.kzVariant = 1; p.updateKzTimerBrushes(kzBest1); }
    var kzPro2 = savedData["highscore_kz_2_pro"], kzNub2 = savedData["highscore_kz_2_nub"];
    var kzBest2 = (kzPro2 !== undefined && kzNub2 !== undefined) ? Math.min(kzPro2, kzNub2) : (kzPro2 !== undefined ? kzPro2 : kzNub2);
    if (kzBest2 !== undefined) { p.kzVariant = 2; p.updateKzTimerBrushes(kzBest2); }
    p.kzVariant = 1;

    p.loadPlayermodelsSetting();

    for (let i = 0; i < 64; i++) {
        const ctrl = Instance.GetPlayerController(i);
        if (ctrl && ctrl.IsValid() && ctrl.GetTeamNumber() === 2) {
            const pawn = ctrl.GetPlayerPawn();
            if (pawn && pawn.IsValid()) {
                pawn.SetHealth(255);
            }
        }
    }
});

Instance.OnScriptInput("gamemode_static", () => p.setGameMode("gamemode_static"));
Instance.OnScriptInput("gamemode_dynamic", () => p.setGameMode("gamemode_dynamic"));
Instance.OnScriptInput("gamemode_rush", () => p.setGameMode("gamemode_rush"));
Instance.OnScriptInput("gamemode_target", () => p.setGameMode("gamemode_target"));
Instance.OnScriptInput("gamemode_combat", () => p.setGameMode("gamemode_combat"));
Instance.OnScriptInput("gamemode_spray", () => p.setGameMode("gamemode_spray"));
Instance.OnScriptInput("gamemode_reaction", () => p.setGameMode("gamemode_reaction"));
Instance.OnScriptInput("gamemode_speed", () => p.setGameMode("gamemode_speed"));
Instance.OnScriptInput("gamemode_surf", () => p.setGameMode("gamemode_surf"));
Instance.OnScriptInput("gamemode_bhop", () => p.setGameMode("gamemode_bhop"));
Instance.OnScriptInput("gamemode_kz", () => p.setGameMode("gamemode_kz"));
Instance.OnScriptInput("gamemode_prefire", () => p.setGameMode("gamemode_prefire"));

Instance.OnScriptInput("set_gamemodes_challenges", () => p.setGamemodesCategory("challenges"));
Instance.OnScriptInput("set_gamemodes_movement", () => p.setGamemodesCategory("movement"));

Instance.OnScriptInput("set_gamemodes_warmup", () => p.setGamemodesCategory("warmup"));
Instance.OnScriptInput("set_gamemodes_training", () => p.setGamemodesCategory("training"));

Instance.OnScriptInput("switcher_left", () => p.triggerSwitcher("left"));
Instance.OnScriptInput("switcher_right", () => p.triggerSwitcher("right"));

Instance.OnScriptInput("StartTimer", () => p.StartTimer());
Instance.OnScriptInput("kz_cp", () => p.saveCheckpoint());
Instance.OnScriptInput("kz_tp", () => p.loadCheckpoint());
Instance.OnScriptInput("rush_touch", () => p.rush_Reset());
Instance.OnScriptInput("StopTimer", () => p.stop());
Instance.OnScriptInput("RestartTimer", () => p.restart());
Instance.OnScriptInput("movement_exit", () => p.movement_exit());
Instance.OnScriptInput("IncFails", () => p.IncFails());
Instance.OnScriptInput("bot_add", () => p.setBots("add"));
Instance.OnScriptInput("bot_remove", () => p.setBots("remove"));
Instance.OnScriptInput("get_quota", () => {
    if (["gamemode_target", "gamemode_reaction", "gamemode_prefire", "gamemode_surf", "gamemode_bhop", "gamemode_kz"].includes(p.gameMode)) {
        Instance.ServerCommand(`bot_quota 0`);
    } else if (p.gameMode === "gamemode_spray") {
        Instance.ServerCommand(`bot_quota 1`);
    } else if (p.gameMode === "gamemode_combat") {
        Instance.ServerCommand(`bot_quota ${p.combatNumBots}`);
    } else if (p.gameMode === "gamemode_speed") {
        Instance.ServerCommand(`bot_quota ${p.speedNumBots}`);
    } else {
        Instance.ServerCommand(`bot_quota ${p.numBots}`);
    }
});
Instance.OnScriptInput("spawn_close_on", () => p.toggleSpawnRange("spawn_close", true));
Instance.OnScriptInput("spawn_close_off", () => p.toggleSpawnRange("spawn_close", false));
Instance.OnScriptInput("spawn_mid_on", () => p.toggleSpawnRange("spawn_mid", true));
Instance.OnScriptInput("spawn_mid_off", () => p.toggleSpawnRange("spawn_mid", false));
Instance.OnScriptInput("spawn_far_on", () => p.toggleSpawnRange("spawn_far", true));
Instance.OnScriptInput("spawn_far_off", () => p.toggleSpawnRange("spawn_far", false));

Instance.OnScriptInput("Targets_InitHit", () => p.targetsOnInitHit());
Instance.OnScriptInput("Targets_Exit", () => p.targetsExit());

Instance.OnScriptInput("combat_start", () => p.combatStartRound());
Instance.OnScriptInput("combat_trigger_exit", () => p.combatOnStartTriggerExit());
Instance.OnScriptInput("combat_commence", () => p.combatCommence());
Instance.OnScriptInput("combat_arena_1", () => p.combatSetArena(1));
Instance.OnScriptInput("combat_arena_2", () => p.combatSetArena(2));
Instance.OnScriptInput("combat_arena_3", () => p.combatSetArena(3));

Instance.OnScriptInput("stats_shots_fired", () => {
    p.sprayShotFired();
    p.speedShotFired();
});
Instance.OnScriptInput("stats_shots_hit", () => {
    p.sprayShotHit();
    p.speedShotHit();
});
Instance.OnScriptInput("spray_reset", () => p.sprayResetFromInput());
Instance.OnScriptInput("spray_finish", () => p.sprayFinishFromInput());
Instance.OnScriptInput("spray_spawn_near", () => p.spraySetSpawnNear());
Instance.OnScriptInput("spray_spawn_mid", () => p.spraySetSpawnMid());
Instance.OnScriptInput("spray_spawn_far", () => p.spraySetSpawnFar());

Instance.OnScriptInput("reaction_hit", () => p.reactionHit());

Instance.OnScriptInput("speed_target_50", () => p.speedSetTarget(50));
Instance.OnScriptInput("speed_target_75", () => p.speedSetTarget(75));
Instance.OnScriptInput("speed_target_100", () => p.speedSetTarget(100));

Instance.OnPlayerKill((event) => {
    const victim   = event.player;
    const attacker = event.attacker;

    if (p.isActive && p.gameMode === "gamemode_rush" && victim.GetTeamNumber() === 3) {
        p.IncKills();
    }
    
    if (p.combatActive && p.gameMode === "gamemode_combat" && p.combatRoundActive) {
        const victimTeam = victim.GetTeamNumber();
        
        if (victimTeam === 3) {
            const attackerController = attacker?.GetPlayerController?.();
            if (attackerController && attackerController.GetPlayerSlot() === 0) {
                p.combatOnBotKilled();
            }
        }
        
        if (victimTeam === 2) {
            const victimController = victim.GetPlayerController?.();
            if (victimController && victimController.GetPlayerSlot() === 0) {
                p.combatOnPlayerKilled();
            }
        }
    }
    
    if (p.speedActive && p.gameMode === "gamemode_speed" && victim.GetTeamNumber() === 3) {
        const attackerController = attacker?.GetPlayerController?.();
        if (attackerController && attackerController.GetPlayerSlot() === 0) {
            p.speedOnKill();
        }
    }

    if (attacker && attacker.IsValid() && victim && victim.IsValid()) {
        const attackerTeam = attacker.GetTeamNumber();
        const victimTeam   = victim.GetTeamNumber();
        if (attackerTeam === 2 && victimTeam === 3) {
            p.incGlobalKills();
        }
    }
});

// Apply playermodel when a new bot spawns
Instance.OnPlayerConnect(({ player }) => {
    if (player?.IsValid() && player.IsBot() && player.GetTeamNumber() === 3) {
        const pawn = player.GetPlayerPawn();
        if (pawn?.IsValid()) applyModelToCTBot(pawn);
    }
});

// Clean up
Instance.OnPlayerDisconnect(({ playerSlot }) => {
    assignedModels.delete(playerSlot);
});

// Re-apply when a bot is reset
Instance.OnPlayerReset(({ player }) => {
    if (player?.GetTeamNumber() === 3) {
        const ctrl = player.GetPlayerController();
        if (ctrl?.IsBot()) {
            applyModelToCTBot(player);
            
            if (p.gameMode === "gamemode_spray" && p.sprayActive) {
                p.sprayBot = player;
                p.sprayBotInitialized = true;
                Instance.EntFireAtTarget({ target: p.sprayBot, input: "SetDamageFilter", value: "damageImmunity" });
                p.sprayTeleportBot();
            }
        }
    }
    
    // Give player kevlar and helmet always
    if (player?.IsValid() && player.GetTeamNumber() === 2) {
        player.SetArmor(100);
        player.GiveNamedItem("item_assaultsuit", false);
    }
});

Instance.OnScriptInput("player_spawn", () => {
    const controller = Instance.GetPlayerController(0);
    if (!controller || !controller.IsValid()) return;
    const pawn = controller.GetPlayerPawn();
    if (!pawn || !pawn.IsValid()) return;
    
    // Give chosen weapons only in combat mode (player can die and respawn)
    if (p.gameMode === "gamemode_combat") {
        pawn.DestroyWeapons();
        pawn.GiveNamedItem(p.selectedPrimary, true);
        pawn.GiveNamedItem(p.selectedSecondary, false);
    }

    // Destroy existing knife first, then give selected knife
    const knifeWeapon = pawn.FindWeaponBySlot(2);
    if (knifeWeapon) pawn.DestroyWeapon(knifeWeapon);
    p.giveSelectedKnife(pawn);
});

// Give T player armor when they activate
Instance.OnPlayerActivate(({ player }) => {
    if (player?.IsValid() && !player.IsBot()) {
        const pawn = player.GetPlayerPawn();
        if (pawn?.IsValid() && pawn.GetTeamNumber() === 2) {
            pawn.SetArmor(100);
            pawn.GiveNamedItem("item_assaultsuit", false);
        }
    }
});

// Weapon & Knife Inputs
const botBrushGamemodeMap = {
    "brush_bots_default_static": "gamemode_static",
    "brush_gamemode_training_default_prefire": "gamemode_static",
    "brush_bots_default_dynamic": "gamemode_dynamic",
    "brush_gamemode_training_default_combat": "gamemode_dynamic",
    "brush_bots_default_rush": "gamemode_rush",
    "brush_gamemode_training_default_speed": "gamemode_rush",
    "brush_gamemode_movement_default_surf": "gamemode_surf",
    "brush_gamemode_challenges_default_target": "gamemode_surf",
    "brush_gamemode_movement_default_bhop": "gamemode_bhop",
    "brush_gamemode_challenges_default_reaction": "gamemode_bhop",
    "brush_gamemode_movement_default_kz": "gamemode_kz",
    "brush_gamemode_challenges_default_spray": "gamemode_kz",
};

// Only these brushes are exempt from hover coloring when their gamemode is active
const activeGamemodeBrushes = new Set([
    "brush_bots_default_static",
    "brush_bots_default_dynamic",
    "brush_bots_default_rush",
    "brush_gamemode_movement_default_surf",
    "brush_gamemode_movement_default_bhop",
    "brush_gamemode_movement_default_kz",
]);

// Brushes that get SetRenderAttribute selected=1/0 on look-at
const selectedAttrBrushes = new Set([
    "brush_bots_default_static",
    "brush_bots_default_dynamic",
    "brush_bots_default_rush",
    "brush_gamemode_training_default_speed",
    "brush_gamemode_training_default_prefire",
    "brush_gamemode_training_default_combat",
    "brush_gamemode_movement_default_surf",
    "brush_gamemode_movement_default_bhop",
    "brush_gamemode_movement_default_kz",
    "brush_gamemode_challenges_default_target",
    "brush_gamemode_challenges_default_reaction",
    "brush_gamemode_challenges_default_spray",
]);

// Settings brushes: hover only when the default/off brush is currently enabled
const settingsBrushConditions = {
    "brush_settings_noarmor":              (t) => t.armorStage === 3,
    "brush_settings_default_infammo":      (t) => t.ammoStage === 2,
    "brush_settings_default_hsonly":       (t) => t.headshotStage === 1,
    "brush_settings_default_playermodels": (t) => t.agentsStage === 2,
    "brush_settings_default_lock":         () => true,
};

const weaponWallbrushMap = {
    // Primaries
    "set_weapon_ak47":         { wallbrush: "wallbrush_prim_ak47",    category: "prim" },
    "set_weapon_m4a1_silencer":{ wallbrush: "wallbrush_prim_m4a1",    category: "prim" },
    "set_weapon_m4a1":         { wallbrush: "wallbrush_prim_m4a4",    category: "prim" },
    "set_weapon_awp":          { wallbrush: "wallbrush_prim_awp",     category: "prim" },
    "set_weapon_famas":        { wallbrush: "wallbrush_prim_famas",   category: "prim" },
    "set_weapon_galilar":      { wallbrush: "wallbrush_prim_galil",   category: "prim" },
    "set_weapon_sg556":        { wallbrush: "wallbrush_prim_krieg",   category: "prim" },
    "set_weapon_aug":          { wallbrush: "wallbrush_prim_aug",     category: "prim" },
    "set_weapon_ssg08":        { wallbrush: "wallbrush_prim_scout",   category: "prim" },
    "set_weapon_mp9":          { wallbrush: "wallbrush_prim_mp9",     category: "prim" },
    "set_weapon_mac10":        { wallbrush: "wallbrush_prim_mac10",   category: "prim" },
    "set_weapon_mp7":          { wallbrush: "wallbrush_prim_mp7",     category: "prim" },
    "set_weapon_mp5sd":        { wallbrush: "wallbrush_prim_mp5",     category: "prim" },
    "set_weapon_ump45":        { wallbrush: "wallbrush_prim_ump",     category: "prim" },
    "set_weapon_p90":          { wallbrush: "wallbrush_prim_p90",     category: "prim" },
    "set_weapon_bizon":        { wallbrush: "wallbrush_prim_bizon",   category: "prim" },
    "set_weapon_mag7":         { wallbrush: "wallbrush_prim_mag7",    category: "prim" },
    "set_weapon_xm1014":       { wallbrush: "wallbrush_prim_xm",     category: "prim" },
    "set_weapon_nova":         { wallbrush: "wallbrush_prim_nova",    category: "prim" },
    "set_weapon_sawedoff":     { wallbrush: "wallbrush_prim_sawedoff",category: "prim" },
    "set_weapon_negev":        { wallbrush: "wallbrush_prim_negev",   category: "prim" },
    "set_weapon_m249":         { wallbrush: "wallbrush_prim_m249",    category: "prim" },
    "set_weapon_scar20":       { wallbrush: "wallbrush_prim_ctauto",  category: "prim" },
    "set_weapon_g3sg1":        { wallbrush: "wallbrush_prim_tauto",   category: "prim" },
    // Secondaries
    "set_weapon_usp_silencer": { wallbrush: "wallbrush_sec_usp",      category: "sec" },
    "set_weapon_deagle":       { wallbrush: "wallbrush_sec_deagle",   category: "sec" },
    "set_weapon_glock":        { wallbrush: "wallbrush_sec_glock",    category: "sec" },
    "set_weapon_tec9":         { wallbrush: "wallbrush_sec_tec9",     category: "sec" },
    "set_weapon_fiveseven":    { wallbrush: "wallbrush_sec_fiveseven",category: "sec" },
    "set_weapon_elite":        { wallbrush: "wallbrush_sec_duals",    category: "sec" },
    "set_weapon_p250":         { wallbrush: "wallbrush_sec_p250",     category: "sec" },
    "set_weapon_cz75a":        { wallbrush: "wallbrush_sec_cz",       category: "sec" },
    "set_weapon_revolver":     { wallbrush: "wallbrush_sec_r8",       category: "sec" },
    "set_weapon_hkp2000":      { wallbrush: "wallbrush_sec_p2000",    category: "sec" },
};

function highlightWeaponWallbrush(scriptInputName) {
    const mapping = weaponWallbrushMap[scriptInputName];
    if (!mapping) return;

    // Reset all brushes in same category to grey
    Instance.EntFireAtName({ name: `wallbrush_${mapping.category}_*`, input: "Color", value: { r: 100, g: 100, b: 100 } });
    // Highlight the selected brush
    Instance.EntFireAtName({ name: mapping.wallbrush, input: "Color", value: { r: 255, g: 223, b: 120 } });
}

// Register all weapon script inputs
Instance.OnScriptInput("set_weapon_ak47", () => { highlightWeaponWallbrush("set_weapon_ak47"); p.setWeapon("weapon_ak47"); });
Instance.OnScriptInput("set_weapon_m4a1_silencer", () => { highlightWeaponWallbrush("set_weapon_m4a1_silencer"); p.setWeapon("weapon_m4a1_silencer"); });
Instance.OnScriptInput("set_weapon_m4a1", () => { highlightWeaponWallbrush("set_weapon_m4a1"); p.setWeapon("weapon_m4a1"); });
Instance.OnScriptInput("set_weapon_awp", () => { highlightWeaponWallbrush("set_weapon_awp"); p.setWeapon("weapon_awp"); });
Instance.OnScriptInput("set_weapon_famas", () => { highlightWeaponWallbrush("set_weapon_famas"); p.setWeapon("weapon_famas"); });
Instance.OnScriptInput("set_weapon_galilar", () => { highlightWeaponWallbrush("set_weapon_galilar"); p.setWeapon("weapon_galilar"); });
Instance.OnScriptInput("set_weapon_sg556", () => { highlightWeaponWallbrush("set_weapon_sg556"); p.setWeapon("weapon_sg556"); });
Instance.OnScriptInput("set_weapon_aug", () => { highlightWeaponWallbrush("set_weapon_aug"); p.setWeapon("weapon_aug"); });
Instance.OnScriptInput("set_weapon_ssg08", () => { highlightWeaponWallbrush("set_weapon_ssg08"); p.setWeapon("weapon_ssg08"); });
Instance.OnScriptInput("set_weapon_mp9", () => { highlightWeaponWallbrush("set_weapon_mp9"); p.setWeapon("weapon_mp9"); });
Instance.OnScriptInput("set_weapon_mac10", () => { highlightWeaponWallbrush("set_weapon_mac10"); p.setWeapon("weapon_mac10"); });
Instance.OnScriptInput("set_weapon_mp7", () => { highlightWeaponWallbrush("set_weapon_mp7"); p.setWeapon("weapon_mp7"); });
Instance.OnScriptInput("set_weapon_mp5sd", () => { highlightWeaponWallbrush("set_weapon_mp5sd"); p.setWeapon("weapon_mp5sd"); });
Instance.OnScriptInput("set_weapon_ump45", () => { highlightWeaponWallbrush("set_weapon_ump45"); p.setWeapon("weapon_ump45"); });
Instance.OnScriptInput("set_weapon_p90", () => { highlightWeaponWallbrush("set_weapon_p90"); p.setWeapon("weapon_p90"); });
Instance.OnScriptInput("set_weapon_bizon", () => { highlightWeaponWallbrush("set_weapon_bizon"); p.setWeapon("weapon_bizon"); });
Instance.OnScriptInput("set_weapon_mag7", () => { highlightWeaponWallbrush("set_weapon_mag7"); p.setWeapon("weapon_mag7"); });
Instance.OnScriptInput("set_weapon_xm1014", () => { highlightWeaponWallbrush("set_weapon_xm1014"); p.setWeapon("weapon_xm1014"); });
Instance.OnScriptInput("set_weapon_nova", () => { highlightWeaponWallbrush("set_weapon_nova"); p.setWeapon("weapon_nova"); });
Instance.OnScriptInput("set_weapon_sawedoff", () => { highlightWeaponWallbrush("set_weapon_sawedoff"); p.setWeapon("weapon_sawedoff"); });
Instance.OnScriptInput("set_weapon_negev", () => { highlightWeaponWallbrush("set_weapon_negev"); p.setWeapon("weapon_negev"); });
Instance.OnScriptInput("set_weapon_m249", () => { highlightWeaponWallbrush("set_weapon_m249"); p.setWeapon("weapon_m249"); });
Instance.OnScriptInput("set_weapon_scar20", () => { highlightWeaponWallbrush("set_weapon_scar20"); p.setWeapon("weapon_scar20"); });
Instance.OnScriptInput("set_weapon_g3sg1", () => { highlightWeaponWallbrush("set_weapon_g3sg1"); p.setWeapon("weapon_g3sg1"); });
Instance.OnScriptInput("set_weapon_usp_silencer", () => { highlightWeaponWallbrush("set_weapon_usp_silencer"); p.setWeapon("weapon_usp_silencer"); });
Instance.OnScriptInput("set_weapon_deagle", () => { highlightWeaponWallbrush("set_weapon_deagle"); p.setWeapon("weapon_deagle"); });
Instance.OnScriptInput("set_weapon_glock", () => { highlightWeaponWallbrush("set_weapon_glock"); p.setWeapon("weapon_glock"); });
Instance.OnScriptInput("set_weapon_tec9", () => { highlightWeaponWallbrush("set_weapon_tec9"); p.setWeapon("weapon_tec9"); });
Instance.OnScriptInput("set_weapon_fiveseven", () => { highlightWeaponWallbrush("set_weapon_fiveseven"); p.setWeapon("weapon_fiveseven"); });
Instance.OnScriptInput("set_weapon_elite", () => { highlightWeaponWallbrush("set_weapon_elite"); p.setWeapon("weapon_elite"); });
Instance.OnScriptInput("set_weapon_p250", () => { highlightWeaponWallbrush("set_weapon_p250"); p.setWeapon("weapon_p250"); });
Instance.OnScriptInput("set_weapon_cz75a", () => { highlightWeaponWallbrush("set_weapon_cz75a"); p.setWeapon("weapon_cz75a"); });
Instance.OnScriptInput("set_weapon_revolver", () => { highlightWeaponWallbrush("set_weapon_revolver"); p.setWeapon("weapon_revolver"); });
Instance.OnScriptInput("set_weapon_hkp2000", () => { highlightWeaponWallbrush("set_weapon_hkp2000"); p.setWeapon("weapon_hkp2000"); });
Instance.OnScriptInput("set_weapon_knife", () => p.setWeapon("weapon_knife"));
Instance.OnScriptInput("saved_weapons", () => p.loadWeaponSelection());

function formatSavedTime(seconds) {
    if (seconds === undefined) return "00:00.00";
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    const ms = Math.floor((seconds % 1) * 100).toString().padStart(2, '0');
    return `${m}:${s}.${ms}`;
}

Instance.OnScriptInput("pr_bhop", () => {
    var hc = renderHeadline("BHOP_EMEVAEL", 0, HL_Y, 0);
    fadeOutHeadline(hc.s0, hc.count, 3.0);
    const data = p.getSaveObject();
    const time = data["highscore_gamemode_bhop"];
    if (time === undefined) return;
    Instance.ServerCommand(`say_team Bhop_emevael personal best: ${formatSavedTime(time)}`, 0.0);
});

Instance.OnScriptInput("pr_bhop_2", () => {
    var hc = renderHeadline("BHOP_ARCANE", 0, HL_Y, 0);
    fadeOutHeadline(hc.s0, hc.count, 3.0);
    const data = p.getSaveObject();
    const time = data["highscore_gamemode_bhop_2"];
    if (time === undefined) return;
    Instance.ServerCommand(`say_team Bhop_arcane personal best: ${formatSavedTime(time)}`, 0.0);
});

Instance.OnScriptInput("bhop_1", () => { p.bhopVariant = 1; });
Instance.OnScriptInput("bhop_2", () => { p.bhopVariant = 2; });

Instance.OnScriptInput("surf_1", () => { p.surfVariant = 1; });
Instance.OnScriptInput("surf_2", () => { p.surfVariant = 2; });

Instance.OnScriptInput("pr_surf", () => {
    var hc = renderHeadline("SURF_KITSUNE", 0, HL_Y, 0);
    fadeOutHeadline(hc.s0, hc.count, 3.0);
    const data = p.getSaveObject();
    const time = data["highscore_gamemode_surf"];
    if (time === undefined) return;
    Instance.ServerCommand(`say_team Surf_kitsune personal best: ${formatSavedTime(time)}`, 0.0);
});

Instance.OnScriptInput("pr_surf_2", () => {
    var hc = renderHeadline("SURF_UTOPIA", 0, HL_Y, 0);
    fadeOutHeadline(hc.s0, hc.count, 3.0);
    const data = p.getSaveObject();
    const time = data["highscore_gamemode_surf_2"];
    if (time === undefined) return;
    Instance.ServerCommand(`say_team Surf_utopia personal best: ${formatSavedTime(time)}`, 0.0);
});

Instance.OnScriptInput("pr_kz", () => {
    var hc = renderHeadline("KZ_VARIETY", 0, HL_Y, 0);
    fadeOutHeadline(hc.s0, hc.count, 3.0);
    const data = p.getSaveObject();
    const proTime = data["highscore_kz_pro"];
    const nubTime = data["highscore_kz_nub"];

    if (proTime === undefined && nubTime === undefined) {
        return;
    } else if (proTime !== undefined && nubTime !== undefined) {
        if (proTime <= nubTime) {
            Instance.ServerCommand(`say_team KZ_variety personal best: PRO: ${formatSavedTime(proTime)}`, 0.0);
        } else {
            Instance.ServerCommand(`say_team KZ_variety personal best: NUB: ${formatSavedTime(nubTime)}`, 0.0);
        }
    } else if (proTime !== undefined) {
        Instance.ServerCommand(`say_team KZ_variety personal best: PRO: ${formatSavedTime(proTime)}`, 0.0);
    } else {
        Instance.ServerCommand(`say_team KZ_variety personal best: NUB: ${formatSavedTime(nubTime)}`, 0.0);
    }
});

Instance.OnScriptInput("pr_kz_2", () => {
    var hc = renderHeadline("KZ_NATUREBLOCK", 0, HL_Y, 0);
    fadeOutHeadline(hc.s0, hc.count, 3.0);
    const data = p.getSaveObject();
    const proTime = data["highscore_kz_2_pro"];
    const nubTime = data["highscore_kz_2_nub"];

    if (proTime === undefined && nubTime === undefined) {
        return;
    } else if (proTime !== undefined && nubTime !== undefined) {
        if (proTime <= nubTime) {
            Instance.ServerCommand(`say_team KZ_natureblock personal best: PRO: ${formatSavedTime(proTime)}`, 0.0);
        } else {
            Instance.ServerCommand(`say_team KZ_natureblock personal best: NUB: ${formatSavedTime(nubTime)}`, 0.0);
        }
    } else if (proTime !== undefined) {
        Instance.ServerCommand(`say_team KZ_natureblock personal best: PRO: ${formatSavedTime(proTime)}`, 0.0);
    } else {
        Instance.ServerCommand(`say_team KZ_natureblock personal best: NUB: ${formatSavedTime(nubTime)}`, 0.0);
    }
});

Instance.OnScriptInput("kz_1", () => { p.kzVariant = 1; });
Instance.OnScriptInput("kz_2", () => { p.kzVariant = 2; });
Instance.OnScriptInput("set_armor", () => p.setArmor());
Instance.OnScriptInput("set_ammo", () => p.setAmmo());
Instance.OnScriptInput("set_headshot", () => p.setHeadshot());
Instance.OnScriptInput("set_playermodels", () => p.setPlayermodels());
Instance.OnScriptInput("set_gamemode_weapons", () => p.setGamemodeWeapons());
Instance.OnScriptInput("set_gamemode_weapons_none", () => p.setGamemodeWeaponsNone());

Instance.OnScriptInput("butterfly", () => { p.setCustomKnife(515, "butterfly"); });
Instance.OnScriptInput("karambit", () => { p.setCustomKnife(507, "karambit"); });
Instance.OnScriptInput("m9", () => { p.setCustomKnife(508, "m9"); });
Instance.OnScriptInput("skeleton", () => { p.setCustomKnife(525, "skeleton"); });
Instance.OnScriptInput("nomad", () => { p.setCustomKnife(521, "nomad"); });
Instance.OnScriptInput("bayonet", () => { p.setCustomKnife(500, "bayonet"); });
Instance.OnScriptInput("talon", () => { p.setCustomKnife(523, "talon"); });
Instance.OnScriptInput("classic", () => { p.setCustomKnife(503, "classic"); });
Instance.OnScriptInput("stiletto", () => { p.setCustomKnife(522, "stiletto"); });
Instance.OnScriptInput("flip", () => { p.setCustomKnife(505, "flip"); });
Instance.OnScriptInput("ursus", () => { p.setCustomKnife(519, "ursus"); });
Instance.OnScriptInput("paracord", () => { p.setCustomKnife(517, "paracord"); });
Instance.OnScriptInput("survival", () => { p.setCustomKnife(518, "survival"); });
Instance.OnScriptInput("huntsman", () => { p.setCustomKnife(509, "huntsman"); });
Instance.OnScriptInput("falchion", () => { p.setCustomKnife(512, "falchion"); });
Instance.OnScriptInput("bowie", () => { p.setCustomKnife(514, "bowie"); });
Instance.OnScriptInput("kukri", () => { p.setCustomKnife(526, "kukri"); });
Instance.OnScriptInput("daggers", () => { p.setCustomKnife(516, "daggers"); });
Instance.OnScriptInput("gut", () => { p.setCustomKnife(506, "gut"); });
Instance.OnScriptInput("navaja", () => { p.setCustomKnife(520, "navaja"); });

// Save crosshair panel
Instance.OnScriptInput("save_crosshair_open", () => { p.saveCrosshairScaleUp(); });
Instance.OnScriptInput("save_crosshair_close", () => { p.saveCrosshairScaleDown(); });

// Particle text inputs
var spawnFired = false;
Instance.OnScriptInput("spawn", () => {
  if (spawnFired) return;
  spawnFired = true;
  Instance.ServerCommand("ent_fire relay_spawn trigger", 0.0);
});

Instance.OnScriptInput("text_restart", () => {
  renderRestart("RESTART", 0, RS_Y, 0);
});

// Particle text rendering system
var TXT_N = 50, TXT_SP = 1.15, TXT_LINE_H = 2.4, TXT_REVEAL = 0.04;
var TXT_FADE_STEPS = 4, TXT_FADE_DT = 0.03;

// Char map
var TXT_MAP = {};
var TXT_ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
var tci;
for (tci = 0; tci < TXT_ALPHA.length; tci++) TXT_MAP[TXT_ALPHA[tci]] = tci * 2;
for (tci = 0; tci < 10; tci++) TXT_MAP[tci + ""] = (26 + tci) * 2;
TXT_MAP["!"] = 72; TXT_MAP["."] = 74; TXT_MAP[":"] = 76; TXT_MAP["_"] = 78;
TXT_MAP["("] = 80; TXT_MAP[")"] = 82;

// Width tweaks
var TXT_W = {}, TXT_NUD = {};
var TWD = "A-0.1 B-0.1 C-0.1 D-0.05 E+0.05 F-0.15 G-0.05 H-0.05 I-0.25 J-0.3 K-0.1 L-0.25 M0.05 P-0.05 R-0.05 S-0.1 T-0.05 U-0.05 V-0.1 W0.2 X-0.1 Y-0.15 !-0.5 .-0.7 :-0.5";
TWD.split(" ").forEach(function(e) { var c = e[0], v = parseFloat(e.substring(1)); TXT_W[c] = v; });
TXT_NUD["I"] = -0.1; TXT_NUD["J"] = -0.15; TXT_NUD["L"] = -0.1;
TXT_NUD["!"] = -0.2; TXT_NUD["."] = -0.35; TXT_NUD[":"] = -0.25;

// Helpers
function txtFColD(n, r, g, b, d) {
  Instance.EntFireAtName({ name: n, input: "setcolortint", value: { r: r, g: g, b: b, a: 255 }, delay: d });
}
function txtFCPD(n, cp, x, y, z, d) {
  Instance.EntFireAtName({ name: n, input: "setcontrolpoint", value: cp + ": " + x + " " + y + " " + z, delay: d });
}

function txtBuildChars(text) {
  var upper = text.toUpperCase(), chars = [], xC = 0, row = 0, i;
  for (i = 0; i < upper.length; i++) {
    var ch = upper[i];
    if (ch === "\n") { row++; xC = 0; continue; }
    var f = TXT_MAP[ch];
    if (typeof f === "undefined") { xC += TXT_SP; continue; }
    var nudge = TXT_NUD[ch] || 0;
    chars.push({ f: f, x: xC + nudge, row: row });
    xC += TXT_SP + (TXT_W[ch] || 0) + nudge;
  }
  return chars;
}

function txtWidth(text) {
  var upper = text.toUpperCase(), w = 0, i;
  for (i = 0; i < upper.length; i++) {
    if (upper[i] === "\n") break;
    var ch = upper[i];
    w += TXT_SP + (TXT_W[ch] || 0) + (TXT_NUD[ch] || 0);
  }
  return w - TXT_SP;
}

var txtNextSlot = 0;

function txtAllocSlots(count) {
  var start = txtNextSlot;
  txtNextSlot = (txtNextSlot + count) % TXT_N;
  return start;
}

// Headline
var HL_SCALE = 0.03, HL_Y = 9.0, HL_SP_MULT = 1.1;
var HL_SR = 232, HL_SG = 185, HL_SB = 75;
var HL_ER = 85, HL_EG = 236, HL_EB = 236;
var HL_COL_STEPS = 6, HL_COL_DT = 0.04;

function renderHeadline(text, cx, cy, s0) {
  var chars = txtBuildChars(text);
  if (!chars.length) return 0;
  s0 = txtAllocSlots(chars.length);
  var oX = cx - txtWidth(text) * HL_SP_MULT / 2, i, s;
  for (i = 0; i < chars.length; i++) {
    var idx = (s0 + i) % TXT_N;
    var c = chars[i], n = "text_char_" + idx;
    var xP = oX + c.x * HL_SP_MULT, yP = cy - c.row * TXT_LINE_H, d = i * TXT_REVEAL;
    fireCP(n, 32, c.f, 0, 0); fireCP(n, 33, xP, yP, 0); fireCP(n, 34, HL_SCALE, 0, 0);
    fireAlpha(n, 0.6);
    txtFColD(n, HL_SR, HL_SG, HL_SB, d);
    Instance.EntFireAtName({ name: n, input: "Start", delay: d });
    for (s = 1; s <= HL_COL_STEPS; s++) {
      var t = s / HL_COL_STEPS;
      txtFColD(n, Math.round(HL_SR + (HL_ER - HL_SR) * t), Math.round(HL_SG + (HL_EG - HL_SG) * t), Math.round(HL_SB + (HL_EB - HL_SB) * t), d + s * HL_COL_DT);
    }
  }
  return { s0: s0, count: chars.length };
}

function fadeOutHeadline(s0, count, baseD) {
  baseD = baseD || 0;
  var dur = TXT_FADE_STEPS * TXT_FADE_DT, i, a, s;
  for (i = 0; i < count; i++) {
    var idx = (s0 + i) % TXT_N;
    var n = "text_char_" + idx, d = baseD + i * TXT_REVEAL;
    // Reverse color then fade
    var colSteps = 3, colDt = 0.02;
    for (s = 0; s <= colSteps; s++) {
      var ct = s / colSteps;
      txtFColD(n, Math.round(HL_ER + (HL_SR - HL_ER) * ct), Math.round(HL_EG + (HL_SG - HL_EG) * ct), Math.round(HL_EB + (HL_SB - HL_EB) * ct), d + s * colDt);
    }
    var colDur = colSteps * colDt;
    for (a = 0; a <= TXT_FADE_STEPS; a++) {
      var t = 1.0 - a / TXT_FADE_STEPS;
      fireAlphaD(n, 0.6 * t, d + colDur + a * TXT_FADE_DT);
    }
    Instance.EntFireAtName({ name: n, input: "Stop", delay: d + colDur + dur + 0.02 });
  }
}

// Personal best
var PB_SCALE = 0.03, PB_Y = 9.0, PB_TIME_Y = 8.5, PB_TIME_SCALE = 0.02;
var PB_R = 255, PB_G = 200, PB_B = 50;
var PB_SCALE_START = 0.003, PB_SCALE_STEPS = 10, PB_SCALE_DT = 0.015;
var PB_WAVE_HEIGHT = 0.4, PB_WAVE_SPEED = 0.06, PB_WAVE_STEPS = 8;
var PB_WAVE_SPREAD = 0.08, PB_WAVE_START = 0.25;
var PB_SHIMMER_R2 = 255, PB_SHIMMER_G2 = 255, PB_SHIMMER_B2 = 180;

function renderPB(label, m, sec, ms, cx, cy, s0) {
  var chars = txtBuildChars(label);
  if (!chars.length) return 0;
  var totalSlots = chars.length + 8;
  s0 = txtAllocSlots(totalSlots);

  // Label
  var oX = cx - txtWidth(label) / 2, i, s;
  var positions = [];
  for (i = 0; i < chars.length; i++) {
    var idx = (s0 + i) % TXT_N;
    var c = chars[i], n = "text_char_" + idx;
    var xP = oX + c.x, yP = cy - c.row * TXT_LINE_H;
    positions.push({ n: n, x: xP, y: yP });
    fireCP(n, 32, c.f, 0, 0); fireCP(n, 33, xP, yP, 0);
    fireCP(n, 34, PB_SCALE_START, 0, 0);
    fireAlpha(n, 1);
    fireColor(n, PB_R, PB_G, PB_B);
    Instance.EntFireAtName({ name: n, input: "Start" });
    for (s = 1; s <= PB_SCALE_STEPS; s++) {
      var t = s / PB_SCALE_STEPS;
      var ease = t < 0.8 ? (t / 0.8) * 1.15 : 1.15 - (t - 0.8) / 0.2 * 0.15;
      txtFCPD(n, 34, PB_SCALE_START + (PB_SCALE - PB_SCALE_START) * ease, 0, 0, s * PB_SCALE_DT);
    }
  }

  // Time digits
  var timeFrames = [
    { frame: digitFrame(parseInt(m[0])),   w: TIMER_SPACING },
    { frame: digitFrame(parseInt(m[1])),   w: TIMER_SPACING },
    { frame: COLON_FRAME,                  w: 0.4 },
    { frame: digitFrame(parseInt(sec[0])), w: TIMER_SPACING },
    { frame: digitFrame(parseInt(sec[1])), w: TIMER_SPACING },
    { frame: DOT_FRAME,                    w: 0.3 },
    { frame: digitFrame(parseInt(ms[0])),  w: TIMER_SPACING },
    { frame: digitFrame(parseInt(ms[1])),  w: TIMER_SPACING }
  ];

  var rawPos = [];
  var cursor = 0;
  for (i = 0; i < timeFrames.length; i++) {
    rawPos.push(cursor);
    cursor += timeFrames[i].w;
  }
  var totalW = cursor - timeFrames[timeFrames.length - 1].w;
  var cenOff = totalW / 2;

  for (i = 0; i < timeFrames.length; i++) {
    var tIdx = (s0 + chars.length + i) % TXT_N;
    var tf = timeFrames[i], tn = "text_char_" + tIdx;
    var txP = cx + rawPos[i] - cenOff;
    positions.push({ n: tn, x: txP, y: PB_TIME_Y });
    fireCP(tn, 32, tf.frame, 0, 0);
    fireCP(tn, 33, txP, PB_TIME_Y, 0);
    fireCP(tn, 34, PB_SCALE_START, 0, 0);
    fireAlpha(tn, 1);
    fireColor(tn, PB_R, PB_G, PB_B);
    Instance.EntFireAtName({ name: tn, input: "Start" });
    for (s = 1; s <= PB_SCALE_STEPS; s++) {
      var t2 = s / PB_SCALE_STEPS;
      var ease2 = t2 < 0.8 ? (t2 / 0.8) * 1.15 : 1.15 - (t2 - 0.8) / 0.2 * 0.15;
      txtFCPD(tn, 34, PB_SCALE_START + (PB_TIME_SCALE - PB_SCALE_START) * ease2, 0, 0, s * PB_SCALE_DT);
    }
  }

  // Wave bounce
  var waveDur = PB_WAVE_STEPS * PB_WAVE_SPEED;
  var cycleDur = waveDur + (positions.length - 1) * PB_WAVE_SPREAD;
  var cycle, pp, w;
  for (cycle = 0; cycle < 2; cycle++) {
    var cycleStart = PB_WAVE_START + cycle * (cycleDur + 0.15);
    for (pp = 0; pp < positions.length; pp++) {
      var pos = positions[pp];
      var letterStart = cycleStart + pp * PB_WAVE_SPREAD;
      for (w = 0; w <= PB_WAVE_STEPS; w++) {
        var wt = w / PB_WAVE_STEPS;
        txtFCPD(pos.n, 33, pos.x, pos.y + Math.sin(wt * Math.PI) * PB_WAVE_HEIGHT, 0, letterStart + w * PB_WAVE_SPEED);
      }
      txtFColD(pos.n, PB_SHIMMER_R2, PB_SHIMMER_G2, PB_SHIMMER_B2, letterStart + waveDur * 0.4);
      txtFColD(pos.n, PB_R, PB_G, PB_B, letterStart + waveDur * 0.7);
    }
  }
  var waveEnd = PB_WAVE_START + (cycleDur + 0.15) + cycleDur + 0.3;
  fadeOutPB(s0, totalSlots, waveEnd);
  return totalSlots;
}

function fadeOutPB(s0, count, baseD) {
  baseD = baseD || 0;
  var dur = TXT_FADE_STEPS * TXT_FADE_DT, i, a;
  for (i = 0; i < count; i++) {
    var idx = (s0 + i) % TXT_N;
    var n = "text_char_" + idx;
    for (a = 0; a <= TXT_FADE_STEPS; a++) {
      var t = 1.0 - a / TXT_FADE_STEPS;
      fireAlphaD(n, t, baseD + a * TXT_FADE_DT);
    }
    Instance.EntFireAtName({ name: n, input: "Stop", delay: baseD + dur + 0.02 });
  }
}

// Restart text
var RS_SCALE = 0.015, RS_Y = -4;
var RS_R = 180, RS_G = 190, RS_B = 200;
var RS_BRIGHT_R = 230, RS_BRIGHT_G = 240, RS_BRIGHT_B = 255;
var RS_STAGGER = 0.03, RS_HOLD = 0.5;

function renderRestart(text, cx, cy, s0, colR, colG, colB) {
  var cr = colR || RS_R, cg = colG || RS_G, cb = colB || RS_B;
  var br = colR ? Math.min(255, Math.round(cr * 1.3)) : RS_BRIGHT_R;
  var bg = colG ? Math.min(255, Math.round(cg * 1.3)) : RS_BRIGHT_G;
  var bb = colB ? Math.min(255, Math.round(cb * 1.3)) : RS_BRIGHT_B;
  var chars = txtBuildChars(text);
  if (!chars.length) return 0;
  s0 = txtAllocSlots(chars.length);
  var oX = cx - txtWidth(text) / 2, i;
  var positions = [];
  for (i = 0; i < chars.length; i++) {
    var idx = (s0 + i) % TXT_N;
    var c = chars[i], n = "text_char_" + idx;
    var xP = oX + c.x, yP = cy - c.row * TXT_LINE_H;
    positions.push({ n: n, x: xP, y: yP });
    var d = i * RS_STAGGER;
    fireCP(n, 32, c.f, 0, 0); fireCP(n, 33, xP, yP, 0); fireCP(n, 34, RS_SCALE, 0, 0);
    fireAlpha(n, 0.6);
    txtFColD(n, 40, 42, 45, d);
    Instance.EntFireAtName({ name: n, input: "Start", delay: d });
    txtFColD(n, br, bg, bb, d + 0.04);
    txtFColD(n, cr, cg, cb, d + 0.12);
  }
  var allIn = (positions.length - 1) * RS_STAGGER + 0.15;
  var fadeStart = allIn + RS_HOLD;
  var dur = TXT_FADE_STEPS * TXT_FADE_DT;
  for (i = 0; i < positions.length; i++) {
    var fn = positions[i].n, fd = fadeStart + i * RS_STAGGER;
    for (var a = 0; a <= TXT_FADE_STEPS; a++) {
      var ft = 1.0 - a / TXT_FADE_STEPS;
      fireAlphaD(fn, 0.6 * ft, fd + a * TXT_FADE_DT);
    }
    Instance.EntFireAtName({ name: fn, input: "Stop", delay: fd + dur + 0.02 });
  }
  return chars.length;
}

// Health regen
Instance.OnPlayerDamage(function(event) {
    if (["gamemode_kz", "gamemode_surf", "gamemode_bhop"].includes(p.gameMode)) {
        event.player.SetHealth(255);
    }
});