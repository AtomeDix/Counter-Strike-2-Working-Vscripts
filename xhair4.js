// import { Instance } from "cs_script/point_script";
import {Instance,BaseModelEntity} from "cs_script/point_script";

let DEBUG = false;
let LANGUAGE_GLOBAL = 0;
let MANUAL_recoil = false;
let SIZE_CHICKEN = 0.3;
let BNNR = false;
let SERVER_LAST_IP = "0.0.0.0";
let SV_CHEATS_SET = false;
let TIME_STARTED = GetTimeSeconds();
let _savePressedYes = false;
let scriptEntity = null;
scriptEntity = Instance.FindEntityByName("script");
const _V = "4.2";

Instance.OnActivate(Init);
Instance.OnScriptReload({after: (memory) => {Init();DEBUG = true;}});

function Init() {
	scriptEntity = Instance.FindEntityByName("script");
	if (scriptEntity) {
		Instance.ConnectOutput(scriptEntity, "OnUser1", (inputData) => {
			PrintDebug("[ConnectOutput - OnUser1]["+inputData.value+"]")
			const args = inputData.value;
			CFG(args);
		});
	}
	Isustz(GetTimeZone())
	if(DEBUG) DumpAll()
	ConCom("sv_cheats 1")
}
																//1=INT | 2=FLOAT | 3=BOOL	| 4=VECTOR
let CVARS = [											//VAL	//TYPE	//MIN	//MAX	//STEPS	//REV
	//MAIN
	["cl_crosshairstyle",								null,	1],		/*0*/
	["cl_crosshairsize",								null,	2],
	["cl_crosshairthickness",							null,	2],
	["cl_crosshairgap",									null,	1],
	["cl_crosshair_outlinethickness",					null,	2],
	["cl_crosshairdot",									null,	3],		/*5*/
	["cl_crosshair_t",									null,	3],
	["cl_crosshaircolor",								null,	1],
	["cl_crosshairalpha",								null,	1],
	["cl_crosshair_dynamic_maxdist_splitratio",			null,	2],
	["cl_crosshair_dynamic_splitdist",					null,	1],		/*10*/
	["cl_crosshair_dynamic_splitalpha_innermod",		null,	2],
	["cl_crosshair_dynamic_splitalpha_outermod",		null,	2],
	//SEC
	["cl_crosshair_recoil",								null,	3],
	["cl_hud_color", 									null,	1],
	["cl_crosshairgap_useweaponvalue",					null,	3],		/*15*/
	["cl_crosshair_sniper_width",						null,	1],
    ["cl_crosshair_friendly_warning", 					null,	3],
    ["hud_showtargetid", 								null,	3],
	//EXTRA
	["cl_crosshair_drawoutline",						null,	3],	//4
	["cl_crosshaircolor_r",								null,	1],	//7		/*20*/	
	["cl_crosshaircolor_g",								null,	1],	//7
	["cl_crosshaircolor_b",								null,	1],	//7
	["cl_crosshairusealpha",							null,	3],	//8
	["cl_crosshair_sniper_show_normal_inaccuracy",		null,	3],	//16
]

const BUTTON_VALS = [
	["cl_crosshairstyle",							2,		4,		5],
	["cl_crosshairsize",							0.5,	1.0,	1.5,	2.0,	2.5,	3.0,	3.5,	4.0,	4.5,	5.0],
	["cl_crosshairthickness",						0.5,	1.0,	1.5,	2.0,	2.5,	3.0,	3.5,	4.0,	4.5,	5.0],
	["cl_crosshairgap",								-5,		-4,		-3,		-2,		-1,		0,		1,		2,		3,		4,		5],
	["cl_crosshair_outlinethickness",				0,		0.5,	1,		2,		3],
	["cl_crosshairdot",								0,		1],
	["cl_crosshair_t",								0,		1],
	["cl_crosshaircolor",							1,		2,		3,		4,		5,		6,		7,		8,		9,		10],
	["cl_crosshairalpha",							128,		192,		255],
	["cl_crosshair_dynamic_maxdist_splitratio",		0,		0.1,	0.2,	0.3,	0.4,	0.5,	0.6,	0.7,	0.8,	0.9,	1.0],
	["cl_crosshair_dynamic_splitdist",				0,		1,		2,		3,		4,		5,		6,		7,		8,		9,		10],
	["cl_crosshair_dynamic_splitalpha_innermod",	0,		0.1,	0.2,	0.3,	0.4,	0.5,	0.6,	0.7,	0.8,	0.9,	1.0],
	["cl_crosshair_dynamic_splitalpha_outermod",	0.3,	0.4,	0.5,	0.6,	0.7,	0.8,	0.9,	1.0],
	//
	["cl_crosshair_recoil",							0,		1],	
	["cl_hud_color",								0,		12,		2,		3,		4,		5,		6,		7,		8,		9,		10,		11],
	["cl_crosshairgap_useweaponvalue",				0,		1],
	["cl_crosshair_sniper_width",					1,		2,		3,		4],
	["cl_crosshair_friendly_warning",				0,		1],
	["hud_showtargetid",							0,		1],
]

const BUTTON_INC = [
	null,
	["cl_crosshairsize",							-1.0,		-0.5,		0.5,	1.0],
	["cl_crosshairthickness",						-1.0,		-0.5,		0.5,	1.0],
	["cl_crosshairgap",								-5.0,		-1.0,		1.0,	5.0],
]

Instance.OnScriptInput("SV", () => {
	SV_CHEATS_SET = true;
	PrintDebug("~ SV_CHEATS_SET = TRUE " +SV_CHEATS_SET)
});

Instance.OnScriptInput("Start_Setup",() => {
	Style2Check();
	Instance.Msg("\n\n[START][xhair_v4]["+_V+"]");
	// ChatMsg("crashz Crosshair Generator v" +_V)
	let i = 0
	for (i = 0; i < CVARS.length; i++) {
		CVARS[i][1] = null
	}
	ConCom("log_verbosity Console default")
	ConCom("log_verbosity General default")
	EntFire("chicken", "SetScale", SIZE_CHICKEN)
	
	EntFire("melon.wall.behind", "Disable", "", 0.00)
	EntFire("melon.sky", "Disable", "", 0.00)
	EntFire("melon.highscore.background.*", "Disable", "", 0.00)
	EntFire("melon.button.show.hs.text", "Disable", "", 0.00)
	EntFire("melon.button.show.hs", "SetScale", "0.00", 0.00)
	EntFire("melon.button.stop", "SetScale", "0.00", 0.00)
	EntFire("melon.button.stop.text", "Disable", "", 0.00)
	EntFire("melon.highscore.panel.event.shoot", "Disable", "", 0.00)
	
	PrintDebug("~ TZ ~ " +GetTimeZone())
	Isustz(GetTimeZone())
	// EntFire("script", "SetLanguageGlobal", "load_offsets")
	// PrintDebug("array: " +arr)
})

Instance.OnScriptInput("ButtonPressVal", (input) => {
	const ent_name = input?.caller?.GetEntityName();
	const parts = GetStrParts(ent_name);
	const cmd = parts[parts.length - 3];
	const order = parts[parts.length - 1];
	if(CVARS[cmd][0] != "cl_crosshaircolor"){
		let prnt = CVARS[cmd][0]+ " " + OrderToVal(cmd,order);
		SText(prnt);
		PrintDebug(prnt);
	}
	SetCvarTo(cmd,OrderToVal(cmd,order));
});

Instance.OnScriptInput("ButtonPressInc", (input) => {
	const ent_name = input?.caller?.GetEntityName();
	const parts = GetStrParts(ent_name);
	const cmd = parts[parts.length - 3];
	const order = parts[parts.length - 1];
	if(CVARS[cmd][1] != null){
		let x = CVARS[cmd][1];
		let prnt = CVARS[cmd][0]+ " " +(x+OrderToInc(cmd,order));
		SText(prnt);
		
		SetCvarTo(cmd,null,false,OrderToInc(cmd,order));
	}
});

function SetCvarTo(cmd, val=null, alias=false, inc=0, fromCFG=false) {
	let cmd_name = "ERROR";
	if (typeof cmd === "string" && /^\d+$/.test(cmd) || typeof cmd === "number"){
		cmd_name = CVARS[cmd][0]
	}else{
		cmd_name = cmd
		// PrintDebug("~~~ CMD_NAME:" +cmd_name+ " = (ORDER) ~> " +CMDNametoCMDOrder(cmd_name))
		if(CMDNametoCMDOrder(cmd_name) == -1)
			return
		cmd = CMDNametoCMDOrder(cmd_name)
	}
	
	if(val == null)
		val = CVARS[cmd][1]
	
	if(inc != 0){
		if (["cl_crosshairsize", "cl_crosshairthickness"].includes(cmd_name)){
			if((val + inc) < 0.5){
				inc = 0
				ChatMsg("Minimum Value: 0.5")
			}
		}
	}
	
	if(cmd_name == "cl_crosshair_recoil" && !fromCFG){
		MANUAL_recoil = true;
	}
	
	if(cmd_name == "cl_crosshaircolor"){
		if(fromCFG){
			// SetCvarTo(20,ColorCFGtoColorRGB(val)[0])
			// SetCvarTo(21,ColorCFGtoColorRGB(val)[1])
			// SetCvarTo(22,ColorCFGtoColorRGB(val)[2])
			// PrintDebug("|^.^| " +val+ " ~> " +ColorCFGtoColorRGB(val))
			// PrintDebug("|^.^| " +val+ " ~> " +ColorCFGtoColorOrder(val))
			if(val != 5 || val != "5")
				ButtonHighlight(cmd,ColorCFGtoColorOrder(val),null)
			else
				ButtonHighlight(cmd,null,99)
		}else{
			SetCvarTo(20,COLORS_XHAIR[val][0])
			SetCvarTo(21,COLORS_XHAIR[val][1])
			SetCvarTo(22,COLORS_XHAIR[val][2])
			ButtonHighlight(cmd,val,null)
			val = 5
		}
	}
	PrintDebug("[1]    val: " +val+ " type: " +typeof(val)+ "  cmd#: " +cmd+ " name: " +cmd_name)
	if(typeof val === "string"){
		if(val.includes(".")){
			val = parseFloat(val);
		}else{
			val = parseInt(val);
		}		
	}
	if(typeof val === "number"){
		if (val !== Math.floor(val)){
			if (!["cl_crosshair_dynamic_maxdist_splitratio", "cl_crosshair_dynamic_splitalpha_innermod", "cl_crosshair_dynamic_splitalpha_outermod"].includes(cmd_name)) {
				if (val % 0.5 !== 0) {
					val = Math.ceil(val / 0.5) * 0.5;
				}
			}else{
				if (val % 0.1 !== 0) {
					val = Math.ceil(val / 0.1) * 0.1;
				}				
			}
		}
		val = parseFloat(val.toFixed(1))
	}
	if(cmd_name == "cl_crosshairthickness" || cmd_name == "cl_crosshairsize")
		if(val == 0.0)
			val = 0.5
	PrintDebug("[2] " + typeof(val) + " " + val)
	
	CVARS[cmd][1] = val + inc
	PrintDebug("[3] NEW VAL: " +CVARS[cmd][1])	
	if(["cl_crosshairsize", "cl_crosshairthickness", "cl_crosshairgap"].includes(cmd_name)) {
		EntFire("setting." +cmd+ ".text", "SetMessage", CVARS[cmd][1])
		EntFire("setting." +cmd+ ".inc.*", "SetRenderAttribute", "y_off=-0.1875")
	}
	PrintDebug("[4] " +cmd_name+ " ~ " +CVARS[cmd][1])		
	ConCom(cmd_name+ " " +CVARS[cmd][1])
	if(alias){
		// ConCom("alias " +cmd_name+ "_ \"" +cmd_name+ " " +CVARS[cmd][1]+ "\"")
		// PrintDebug("[4][.] alias " +cmd_name+ "_ \"" +cmd_name+ " " +CVARS[cmd][1]+ "\"")	
	}
	if(cmd <= 18 && cmd_name != "cl_crosshaircolor")
		ButtonHighlight(cmd,CVARS[cmd][1],null)
	PrintDebug("[5]")	
	if(cmd_name == "cl_crosshairalpha")
		SetCvarTo(23,1)
	if(cmd_name == "cl_crosshair_sniper_width")
		SetCvarTo(24,0)
	if(cmd_name == "cl_crosshair_outlinethickness"){
		if(!fromCFG){
			if(val == 0)
				SetCvarTo(19,0)
			else
				SetCvarTo(19,1)					
		}
	}
	if(cmd_name == "cl_crosshairstyle")
		Style2Check()
}

function ButtonHighlight(cmd, val = null, order = null){
	PrintDebug("|HL| cmd: " +cmd+ "| val: " +val+ "| order: " +order)
	if(order != null){
		OrderToVal(cmd,order)
		EntFire("setting." +cmd+ ".val.*", 	"SetRenderAttribute", "glow=0")
		EntFire("setting." +cmd+ ".val." +order, 	"SetRenderAttribute", "glow=5.5")
		EntFire("setting." +cmd+ ".val." +order+ ".anim", 	"SetRenderAttribute", "glow=5.5")
	}else if(val != null){
		EntFire("setting." +cmd+ ".val.*", 	"SetRenderAttribute", "glow=0")
		let i = 0
		for (i = 1; i < BUTTON_VALS[cmd].length; i++) {
			// PrintDebug("xetting." +cmd+ ".val." +i)
			if(BUTTON_VALS[cmd][i] == val){
				EntFire("setting." +cmd+ ".val." +i, 	"SetRenderAttribute", "glow=5.5")
				EntFire("setting." +cmd+ ".val." +i+ ".anim", 	"SetRenderAttribute", "glow=5.5")
				// PrintDebug("setting." +cmd+ ".val." +i)
			}
			// PrintDebug(BUTTON_VALS[cmd][i])
		}		
	}
}

Instance.OnScriptInput("CFG_PREPARE",() => {
	// EntFire("trigger.hudhint.premade.xhairs", "Enable", "", 0.05)
	// EntFire("hint.premade.xhairs", "ShowHudHint","",0.5)
	PrintDebug("Loading CFG... " +MANUAL_recoil);
	let i = 0
	for (i = 0; i < FALLBACK_VALS.length; i++) {
		if(FALLBACK_VALS[i][1] != null){
			if(!(FALLBACK_VALS[i][0] === "cl_crosshair_recoil" && MANUAL_recoil)){
				SetCvarTo(i,FALLBACK_VALS[i][1],false,0,true)
			}
		}
	}
})

Instance.OnScriptInput("CFG_FIX",() => {
	if(CVARS[CMDNametoCMDOrder("cl_crosshair_drawoutline")][1] == 0 || CVARS[CMDNametoCMDOrder("cl_crosshair_outlinethickness")][1] == 0){
		ButtonHighlight(CMDNametoCMDOrder("cl_crosshair_outlinethickness"),0)
		SetCvarTo("cl_crosshair_outlinethickness",0)
		// CVARS[CMDNametoCMDOrder("cl_crosshair_outlinethickness")][1] = 0
	}
	//ChatMsg("0?: " + CVARS[CMDNametoCMDOrder("cl_crosshair_drawoutline")][1] + " " + typeof CVARS[CMDNametoCMDOrder("cl_crosshair_drawoutline")][1]+ " _ " +CVARS[CMDNametoCMDOrder("cl_crosshair_outlinethickness")][1] + " " + typeof CVARS[CMDNametoCMDOrder("cl_crosshair_outlinethickness")][1])
})

function CFG(str){
	EntFire("timer.fix", "Disable")
	let arr = ExtractSplitsFromString(str)
	let cmd 	= arr[0].toString()
	let val 	= arr[1].toString()
	PrintDebug("v=======================================\n*** " +cmd+ " ~ " +val)
	if(cmd != "cl_fixedcrosshairgap" && !(cmd == "cl_crosshair_recoil" && MANUAL_recoil))
		if(cmd != "cl_crosshair_friendly_warning")
			SetCvarTo(cmd,val,false,0,true)
	ConCom(cmd)
	PrintDebug("CFG: " +cmd+ " ~ " +val+ "\n^=======================================")
	EntFire("timer.fix", "Enable")	
}

Instance.OnScriptInput("InfoRoom_in",() => 		{InfoRoom("in")})
Instance.OnScriptInput("InfoRoom_out1",() => 	{InfoRoom("out1")})
Instance.OnScriptInput("InfoRoom_out2",() => 	{InfoRoom("out2")})

function InfoRoom(str){
	if(str == "in"){
		EntFire("manager.5.2", "Kill")
		ConCom("cl_lock_camera 0")
		ConCom("sv_maxspeed 1")
		ConCom("cl_drawhud 0")
		ConCom("r_drawviewmodel 0")
		EntFire("sound.startmusic", "StartSound")
		ConCom("ent_fire fade Fade")
		EntFire("fade", "Fade")
		EntFire("mover.info.arrow", "Open")
	}else if(str == "out1"){
		EntFire("fade.tp.1", "Fade")
		EntFire("fade.tp.2", "Fade", "", 0.34)
		EntFire("sound.startmusic", "StopSound")
		EntFire("sound.tp.in", "StartSound")
		EntFire("sound.tp.in", "StopSound", "", 1.4)
	}else if(str == "out2"){
		EntFire("joke.*", "Disable")
		EntFire("joke.*", "Alpha", "0")
		EntFire("joke.*", "Stop")
		ConCom("sv_maxspeed 350")
		ConCom("cl_drawhud 1")
		ConCom("r_drawviewmodel 1")
		ConCom("cl_draw_only_deathnotices 0")
		GetLocalTime()
		if(BNNR){
			ChatMsg2(CHAT_MSG18[0],0)
			ChatMsg2(CHAT_MSG18[1],1.1)
		}
		EntFire("banner.overlay.clash", "Start", "", 0.5)
		EntFire("timer.banners", "Enable", "", 0.01)
	}
}

Instance.OnScriptInput("PrintInConsole",() => {
	let t = 0
	let dly = 0.03
	let i = 0
	const cvarsBASIS = [0, 1, 2, 3, 19, 4, 5, 6, 23, 8, 13, 15, 7];
	const cvarsSTYLE2 = [9, 10, 11, 12];
	const cvarsCOLOR5 = [20, 21, 22];
	const cvarsEXTRAS = [16, 17, 18, 14];
	const a_BASIS 	= cvarsBASIS.map(index => CVARS[index]);
	const a_STYLE2 	= cvarsSTYLE2.map(index => CVARS[index]);
	const a_COLOR5 	= cvarsCOLOR5.map(index => CVARS[index]);
	const a_EXTRAS 	= cvarsEXTRAS.map(index => CVARS[index]);
	
	for (i = 0; i < a_BASIS.length; i++) {
		if(a_BASIS[i][1] == null){
			if(i == 5){
				PrintDebug(a_BASIS[i-1][0]+ " " +a_BASIS[i-1][1]+ " " +typeof a_BASIS[i-1][0]+ "<~~~~~~1")
				if(a_BASIS[i-1][1] != 0){
					PrintDebug(a_BASIS[i-1][1]+ " " +a_BASIS[i-1][0]+ " " +typeof a_BASIS[i-1][0]+ "<~~~~~~2")
					continue
				}
			}
			EntFire("trigger.hudhint.show.cvars", "Enable", "", 0.00)
			PrintDebug(a_BASIS[i][0]+ " <~~~")
			return
		}
	}
	
	ConCom("con_enable 1")
	ConCom("log_verbosity General default")
	ConCom("log_verbosity General default")
	ConCom("log_verbosity Console off")
	ConCom("log_verbosity SteamNetSockets off")
	ConCom("log_color General 19FF19FF")
	
	ConCom("toggleconsole", (dly*t++))
	ConCom("clear", (dly*t++))
	
	ConCom("echoln \" \"", (dly*t++))
	ConCom("echoln \"//CROSSHAIR COMMANDS\"", (dly*t++))
	// ConCom("echoln \" \"", (dly*t++))
	for (i = 0; i < a_BASIS.length; i++) {
		if(i == 5 && a_BASIS[4][1] == 0)
			continue
		ConCom("echoln \""+a_BASIS[i][0]+ " " +a_BASIS[i][1]+ "\"", (dly*t))
	}
	t++
	if(a_BASIS[10][1] == 5){
		// ConCom("echoln \"//COLOR5\"")
		for (i = 0; i < a_COLOR5.length; i++) {
			ConCom("echoln \""+a_COLOR5[i][0]+ " " +a_COLOR5[i][1]+ "\"", (dly*t))
		}
		t++
	}
	if(a_BASIS[0][1] == 2){
		// ConCom("echoln \"//STYLE2\"")
		for (i = 0; i < a_STYLE2.length; i++) {
			ConCom("echoln \""+a_STYLE2[i][0]+ " " +a_STYLE2[i][1]+ "\"", (dly*t))
		}
		t++
	}
	ConCom("echoln \" \"", (dly*t++))
	let extras = 0
	for (i = 0; i < a_EXTRAS.length; i++) {
		if(a_EXTRAS[i][1] != null)
			extras++
	}
	if(extras != 0){
		ConCom("echoln \"//EXTRAS\"", (dly*t++))
		for (i = 0; i < a_EXTRAS.length; i++) {
			if(a_EXTRAS[i][1] != null)
				ConCom("echoln \""+a_EXTRAS[i][0]+ " " +a_EXTRAS[i][1]+ "\"", (dly*t))
		}
	}
	t++
	for (i = 0; i < 11; i++) {
		ConCom("echoln \" \"", (dly*t))
	}
	ConCom("log_verbosity General off", (dly*t++))
	ConCom("log_color General 00000000", (dly*t))
	ConCom("log_verbosity Console default", (dly*(t+5)))
	ConCom("log_verbosity General default", (dly*(t+5)))
})

Instance.OnScriptInput("SetLanguage",(input) => {
	const ent_name = input?.caller?.GetEntityName();
	const parts = GetStrParts(ent_name);
	const lang = parts[parts.length - 1];
	
	EntFire("mover.language", "SetPosition", lang)
	EntFire("manager.1", "SetRenderAttribute", "y_off=" +0.0390625*parseInt(lang))
	EntFire("manager.2", "SetRenderAttribute", "y_off=" +0.0390625*parseInt(lang))
	EntFire("manager.3", "SetRenderAttribute", "y_off=" +0.0390625*parseInt(lang))
	EntFire("manager.4", "SetRenderAttribute", "y_off=" +0.0390625*parseInt(lang))
	EntFire("manager.5.1", "SetRenderAttribute", "y_off=" +0.09375*parseInt(lang))
	EntFire("manager.5.2", "SetRenderAttribute", "y_off=" +0.1015625*parseInt(lang))
	PrintDebug("[SaveButton1]y_off="+0.1015625*parseInt(lang))
	LANGUAGE_GLOBAL = parseInt(lang)	
});

Instance.OnScriptInput("SaveButton1_connect",() => 	{SaveButton1("connect")})
Instance.OnScriptInput("SaveButton1_save",() => 	{SaveButton1("save")})

function SaveButton1(src){
	PrintDebug(typeof src+ " ~~~ " +src)
	if(src == "save" || src == "Save"){
		PrintDebug("SAVE-B.~ save ")
		EntFire("manager.5.1", "SetScale", "0.00")
		EntFire("manager.5.1", "Lock")
		EntFire("temp.manager.5.2", "ForceSpawn")
		EntFire("mananger.lang."+LANGUAGE_GLOBAL, "Press", "", 0.02)
		EntFire("timer.save.confirm", "Enable")
	}else if(src == "connect"){
		PrintDebug("SAVE-B.~ connect ")
	}
}

Instance.OnScriptInput("SaveButton2No",() => {
	EntFire("manager.5.2", "Kill")
	EntFire("manager.5.1", "SetScale", "1.00")
	EntFire("manager.5.1", "Unlock")
	EntFire("timer.save.confirm", "Disable")
	ConCom("playsoundscape UI.RankDown")
})

Instance.OnScriptInput("SaveButton2YesDelay",() => {
	_savePressedYes = true
})

Instance.OnScriptInput("SaveButton2Yes",() => {
	EntFire("timer.save.confirm", "Disable")
	ConCom("host_writeconfig_with_prompt")
	// EntFire("timer.save.yes.alias.done", "Enable")
	// EntFire("timer.save.yes.alias.failed", "Enable")
	// ConCom("exec_async maps/xhair_save.cfg")
})

function Style2Check(){
	if(CVARS[0][1] != 2 || CVARS[0][1] == null){
		EntFire("setting.9.*", "SetScale", 	"0.00")
		EntFire("setting.10.*", "SetScale", 	"0.00")
		EntFire("setting.11.*", "SetScale", 	"0.00")
		EntFire("setting.12.*", "SetScale", 	"0.00")
		EntFire("setting.9.*", "Lock", 	"0.00")
		EntFire("setting.10.*", "Lock", 	"0.00")
		EntFire("setting.11.*", "Lock", 	"0.00")
		EntFire("setting.12.*", "Lock", 	"0.00")
	}else{
		EntFire("setting.9.*", "SetScale", 	"1.00")
		EntFire("setting.10.*", "SetScale", 	"1.00")
		EntFire("setting.11.*", "SetScale", 	"1.00")
		EntFire("setting.12.*", "SetScale", 	"1.00")
		EntFire("setting.9.*", "Unlock", 	"0.00")
		EntFire("setting.10.*", "Unlock", 	"0.00")
		EntFire("setting.11.*", "Unlock", 	"0.00")
		EntFire("setting.12.*", "Unlock", 	"0.00")
	}
}

let ANIM1_COUNTER = 0
Instance.OnScriptInput("Anim_Styles",() => {
	if(ANIM1_COUNTER >= 3)
		ANIM1_COUNTER = 0
	let x = (ANIM1_COUNTER * 0.1875)
	ANIM1_COUNTER += 1
	EntFire("setting.0.val.1.anim", "SetRenderAttribute", "y_off=" +x)
	EntFire("setting.0.val.2.anim", "SetRenderAttribute", "y_off=" +x)
	EntFire("setting.0.val.3.anim", "SetRenderAttribute", "y_off=" +x)
})

Instance.OnScriptInput("Xhair_Screens_comm",() => 	{Xhair_Screens("comm")})
Instance.OnScriptInput("Xhair_Screens_pros",() => 	{Xhair_Screens("pros")})

// ConCom("screenshot_prefix")
let SCREENS1_COUNTER = 0
function Xhair_Screens(str){
	let folder = "xhairs"
	let grp_size = 5
	let max_ply	= 80
	let skip_start = 0
	let skip_end = 0
	if(SCREENS1_COUNTER == 0){
		const currentDate = new Date()
		const currentYear = currentDate.getFullYear()
		const currentDay = currentDate.getDate().toString().padStart(2, '0')
		const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0')
		const currentHour = currentDate.getHours().toString().padStart(2, '0')
		const currentMinute = currentDate.getMinutes().toString().padStart(2, '0')
		const currentDateTimeString = `${currentDay}.${currentMonth}.${currentYear}_${currentHour}.${currentMinute}`
		// screenshot_subdir screenshots/xxx/
		ConCom("screenshot_subdir screenshots/" +str+ "_" +currentDateTimeString)
		ConCom("setpos 0 -800 -120")
		ConCom("cl_draw_only_deathnotices 1")
		EntFire("trigger.screens.stop","Enable","",2.0)
	}else{
		if(str == "comm"){
			folder = "xhairs_comm"
			grp_size = 6
			max_ply	= 96
			skip_start = 3
			skip_end = 13
		}
		let nTeam = Math.floor((SCREENS1_COUNTER-1)/grp_size) + 1
		let nPlayer = SCREENS1_COUNTER % grp_size
		if (nPlayer == 0) nPlayer = grp_size
		let sT_P = nTeam+ "_" +nPlayer
		//FIX?//Instance.DebugScreenText("SCREEN #" +SCREENS1_COUNTER,700,350,0,0.85,[255,255,0],1)
		//FIX?//Instance.DebugScreenText("CFG: " +sT_P,700,350,1,0.85,[96,255,96],1)
		ConCom("playsoundscape UI.ArmsRace.Kill1")
		ConCom("exec " +folder+ "/" +sT_P)
		ConCom("screenshot_prefix " +sT_P)
		ConCom("screenshot", 0.4)	
	}
	
	if(skip_start != 0 && SCREENS1_COUNTER >= (skip_start - 1)*6 && SCREENS1_COUNTER <= skip_end*6){
		SCREENS1_COUNTER = skip_end*6 + 1
	}else{
		SCREENS1_COUNTER++
	}

	if(SCREENS1_COUNTER > max_ply){
		SCREENS1_COUNTER = 0
		ChatMsg("SCREENSHOTS DONE")
		EntFire("timer.screens.*", "Disable")
		ConCom("setpos 0 0 -64", 0.4)
		EntFire("trigger.screens.stop","Disable","",0.0)
		ConCom("cl_draw_only_deathnotices 0")
	}
}

Instance.OnScriptInput("Stop_Xhair_Screens",() => {
	SCREENS1_COUNTER = 0
	ChatMsg("SCREENSHOTS STOPPED")
	EntFire("timer.screens.*", "Disable")
	ConCom("setpos 0 0 -64")
	EntFire("trigger.screens.stop","Disable","",0.0)
	ConCom("cl_draw_only_deathnotices 0")
})


Instance.OnScriptInput("ChickenDMG",() => {
	EntFire("chicken", "SetScale", SIZE_CHICKEN)
	SIZE_CHICKEN += 0.03
	
	if(SIZE_CHICKEN >= 666){
		SIZE_CHICKEN -= 0.03
	}
})

function SText(txt,dur=1,offset=1){
	Instance.DebugScreenText(txt, 6, 6+offset*4, dur, { r: 0xff, g: 0xff, b: 0xff });
}

function ConCom(cmd,delay=0.00){
	EntFire("Commands_S", "Command", cmd, delay)
}
function ConComClient(cmd,delay=0.00){
	EntFire("Commands_C", "Command", cmd, delay)
}

function OrderToVal(cmd,order){
	//PrintDebug(cmd+ "_" +order+ "||| " +BUTTON_VALS[cmd][order])
	return BUTTON_VALS[cmd][order]	
}

function OrderToInc(cmd,order){
	return BUTTON_INC[cmd][order]	
}

function CMDNametoCMDOrder(cmd_name){
	let i = 0
	for (i = 0; i < CVARS.length; i++) {
		if(CVARS[i][0] == cmd_name)
			return i
	}
	return -1;
}

function ColorCFGtoColorRGB(c){
	let RGB = [0, 0, 0]
	if(typeof(c) === "string"){
		c = parseInt(c, 10);
	}
    switch (c) {
        case 0: 	RGB[0] = 255; 	RGB[1] = 0;		RGB[2] = 0;		break;
        case 1: 	RGB[0] = 0;		RGB[1] = 255;	RGB[2] = 0;		break;
        case 2: 	RGB[0] = 255; 	RGB[1] = 255;	RGB[2] = 0;		break;
        case 3: 	RGB[0] = 0; 	RGB[1] = 0;		RGB[2] = 255;	break;
        case 4: 	RGB[0] = 0; 	RGB[1] = 255;	RGB[2] = 255;	break;
        default:	PrintDebug("ERROR@ ColorCFGtoColor");	break;
    }	
	return RGB
}

function ColorCFGtoColorOrder(c){
	let colorOrder = 0
	if(typeof(c) === "string"){
		c = parseInt(c, 10);
	}
    switch (c) {
        case 0: 	colorOrder = 1;		break;
        case 1: 	colorOrder = 2;		break;
        case 2: 	colorOrder = 5;		break;
        case 3: 	colorOrder = 3;		break;
        case 4: 	colorOrder = 6;		break;
        default:	PrintDebug("ERROR@ ColorCFGtoColorOrder " +c);	break;
    }	
	return colorOrder
}

function PrintAllCmdVal(){
	let i = 0
	for (i = 0; i < CVARS.length; i++) {
		PrintDebug("|" +i+ "| " +CVARS[i][0]+ " " +CVARS[i][1])
	}
}

function ExtractNumbersFromString(input){    
	return input.split(',')  
	.map(s => s.trim())
	.filter(s => s !== '' && !isNaN(Number(s)))
	.map(s => Number(s)); 
}

function ExtractSplitsFromString(input){    
	return input.split(',')  
}

function ChatMsg(input,delay=0.05){
	ConCom("ent_fire Commands_S command \"say  \" " +(delay))
	ConCom("ent_fire Commands_S command \"say   " +input+ "\" " +(delay+1.0))
}

function ChatMsg2(input,delay=0.05){
	ConCom("say "+input,delay);
	// ConCom("ent_fire Commands_S command \"say   " +input+ "\" " +(delay))
}

function PrintDebug(str,prefix = true){
	let time_p = GetTimeSeconds() - TIME_STARTED
	if(DEBUG){
		if(prefix){
			Instance.Msg("[DEBUG]["+time_p+"] " + str)
		}else{
			Instance.Msg(str)
		}
	}
}

function KillBanner(){
	BNNR = false;
	EntFire("banner*", "Stop");
	EntFire("banner*", "Kill", "", 0.01);
}
Instance.OnScriptInput("KillBanners",() => {
	KillBanner();
})

const COLORS_XHAIR = [
	null,
	[255,	0,		0],
	[0,		255,	0],
	[0,		0,		255],
	[255,	128,	0],
	[255,	255,	0],
	[0,		255,	255],
	[255,	0,		255],
	[128,	0,		255],
	[0,		0,		0],
	[255,	255,	255],
]

function Dump(obj,name=""){
	Instance.Msg("Dump "+name+":")
	Instance.Msg(JSON.stringify(Object.keys(obj)))
	Instance.Msg(JSON.stringify(Object.getOwnPropertyNames(obj)))
}

function DumpAll(){
	Dump(globalThis,"globalThis")
	Dump(Instance,"Instance")
}

function GetRandomInt(max) {
  return Math.floor(Math.random() * max);
}

//~
Instance.OnScriptInput("Print_CHAT18",() => {
	Print_CHAT_18(0);
	PrintDebug("[Print_CHAT18][0]");
})
let chat_msg_alt = true;
function Print_CHAT_18(dly = 3.0){
	PrintDebug("[Print_CHAT_18][1][alt: "+chat_msg_alt+"][BNNR:"+BNNR+"]");
	if(!BNNR) return
	PrintDebug("[Print_CHAT_18][2][alt: "+chat_msg_alt+"][BNNR:"+BNNR+"]");
	if(chat_msg_alt){
		ChatMsg2(CHAT_MSG18[0],dly)
		ChatMsg2(CHAT_MSG18[1],dly+1.1)		
	}else{
		ChatMsg2(CHAT_MSG18[0],dly)
		ChatMsg2(CHAT_MSG18[2],dly+1.1)		
	}
	SwitchOverlay();
	chat_msg_alt = !chat_msg_alt;
	// ChatMsg2(CHAT_MSG18[2],dly+2)
}
function SwitchOverlay(){
	EntFire("banner.overlay.*", "Stop");
	if(chat_msg_alt){
		EntFire("banner.overlay.clash", "Start", "", 0.01);
	}else{
		EntFire("banner.overlay.ace", "Start", "", 0.01);
	}
}
const CHAT_MSG18 = [
	" ",
	" ",
	" ",
	// "Quick withdrawals to any account, including to a Steam account."
]
//~

const FALLBACK_VALS = [
	//MAIN
	["cl_crosshairstyle",								4],
	["cl_crosshairsize",								null],
	["cl_crosshairthickness",							null],
	["cl_crosshairgap",									null],
	["cl_crosshair_outlinethickness",					null],
	["cl_crosshairdot",									0],
	["cl_crosshair_t",									0],
	["cl_crosshaircolor",								1],
	["cl_crosshairalpha",								255],
	["cl_crosshair_dynamic_maxdist_splitratio",			0.5],
	["cl_crosshair_dynamic_splitdist",					2],
	["cl_crosshair_dynamic_splitalpha_innermod",		1],
	["cl_crosshair_dynamic_splitalpha_outermod",		0.3],
	//SEC
	["cl_crosshair_recoil",								0],
	["cl_hud_color", 									null],
	["cl_crosshairgap_useweaponvalue",					0],
	["cl_crosshair_sniper_width",						null],
	["cl_crosshair_friendly_warning", 					null],
	["hud_showtargetid", 								null],
	//EXTRA
	["cl_crosshair_drawoutline",						null],	//4
	["cl_crosshaircolor_r",								null],	//7
	["cl_crosshaircolor_g",								null],	//7
	["cl_crosshaircolor_b",								null],	//7
	["cl_crosshairusealpha",							null],	//8
	["cl_crosshair_sniper_show_normal_inaccuracy",		null],	//16
]

Instance.OnScriptInput("Server_Buttons_connect",() => 		{Server_Buttons("connect")})
Instance.OnScriptInput("Server_Buttons_noconnect",() => 	{Server_Buttons("noconnect")})
Instance.OnScriptInput("Server_Buttons_1",() => 			{Server_Buttons("1")})
Instance.OnScriptInput("Server_Buttons_2",() => 			{Server_Buttons("2")})
Instance.OnScriptInput("Server_Buttons_3",() => 			{Server_Buttons("3")})
Instance.OnScriptInput("Server_Buttons_4",() => 			{Server_Buttons("4")})
Instance.OnScriptInput("Server_Buttons_5",() => 			{Server_Buttons("5")})
Instance.OnScriptInput("Server_Buttons_6",() => 			{Server_Buttons("6")})

function Server_Buttons(str){
	if(str != "connect" && str != "noconnect"){
		EntFire("server.connect.1." +str, "SetScale", "1.05", 0.00)
		EntFire("server.connect.1.*", 	"SetScale", "0.0", 0.1)
		EntFire("server.connect.1.*", 	"Lock", "", 0.1)
			// EntFire("server.connect.2", "SetScale", "1.00", 0.90)
		EntFire("temp.server.connect.2", "ForceSpawn", "1.00", 0.90)
		EntFire("timer.server.noconnect", "Enable", 0.5)
		SERVER_SELECTED_REGION = parseInt(str)
		EntFire("script", "RunScriptInput","SaveButton1_connect", 0.0)
	}else if(str == "connect"){
		EntFire("timer.server.noconnect", "Disable")
		let serv_arr = null
		switch (SERVER_SELECTED_REGION) {
			case 0: 	PrintDebug("ERROR@ SERVER_SELECTED_REGION " +SERVER_SELECTED_REGION);	break;
			case 1: 	serv_arr = SERVERS_EU;		break;
			case 2: 	serv_arr = SERVERS_NA;		break;
			case 3: 	serv_arr = SERVERS_SA;		break;
			case 4: 	serv_arr = SERVERS_SEA;		break;
			case 5: 	serv_arr = SERVERS_AU;		break;
			case 6: 	serv_arr = SERVERS_ZA;		break;
			default:	PrintDebug("ERROR@ SERVER_SELECTED_REGION " +SERVER_SELECTED_REGION);	break;
		}
		let rndNum = Math.floor(Math.random() * 100) + 1;
		let sum = 1
		let i = 0
		let server_i = 0
		for (i = 0; i < serv_arr.length; i++){
			PrintDebug("RND:" +rndNum+ " | RANGE:  " +sum+ " - " +(serv_arr[i][4]+sum-1)+ " (i:" +i+ ")")
			if(rndNum >= sum && rndNum <= (serv_arr[i][4]+sum-1)){
				server_i = i
				break
			}else{
				sum += serv_arr[i][4]
			}
		}
		SERVER_LAST_IP = serv_arr[server_i][1]
		
		// EntFire("timer.server.alias.done", "Enable", "", 0.01)
		PrintDebug("|O| connect " +SERVER_LAST_IP)
		// ConCom("exec_async maps/xhair_connect.cfg", 2.7)
		ConCom("say ")
		ConCom("say Connecting to: (" +serv_arr[server_i][0]+ " | " +serv_arr[server_i][1]+ " | " +serv_arr[server_i][2]+ " | " +serv_arr[server_i][3]+ ")")
		// PrintDebug("alias \"xhair_connect\" \"connect " +serv_arr[server_i][1]+ "\"")
	}else if(str == "noconnect"){
		EntFire("timer.server.noconnect", "Disable", "")
		// EntFire("timer.server.alias.done", "Disable", "", 0.01)
		// EntFire("server.connect.1." +str, "SetScale", "1.05", 0.00)
		EntFire("server.connect.1.*", "SetScale", "1.00", 0.0)
		EntFire("server.connect.1.*", "Unlock", "", 0.0)
		EntFire("server.connect.2", 	"Kill", "", 0.01)
	}
}

function RemoveVowels(str){
  return str.replace(/[aeiouAEIOU]/g, '');
}

let SERVER_SELECTED_REGION = 0

let SERVERS_EU = []
let SERVERS_NA = []
let SERVERS_SA = []
let SERVERS_SEA = []
let SERVERS_AU = []
let SERVERS_ZA = []
let HOUR_now = 0

function GetLocalTime(){
	const now = new Date();
	const hour = now.getHours();
	const minutes = now.getMinutes();
	PrintDebug(`~ ~ ~ Current hour is: ${hour} : ${minutes}`);
	
	HOUR_now = Number(hour)
    if (hour >= 14 && hour < 18) {
        SERVERS_14_18();
    } else if (hour >= 18 && hour < 23) {
        SERVERS_18_23();
    } else if (hour >= 23 || hour < 3) {
        SERVERS_23_03();
    } else if (hour >= 3 && hour < 8) {
        SERVERS_03_08();
    } else if (hour >= 8 && hour < 11) {
        SERVERS_08_11();
    } else if (hour >= 11 && hour < 14) {
        SERVERS_11_14();
    }
	PrintServers()
}

//SERVERS_START
function SERVERS_14_18(){
    //Name//IP//MODE//MAP//%
    SERVERS_EU = [
        ["EU_01", "78.46.48.169:22222",   "DM","Overpass 23",50],
		["EU_02", "185.242.115.38:27045", "DM","Headshot-Only-DM Mirage",25],        
        ["EU_03", "185.242.115.38:22222", "DM","Rifles-DM Mirage no AWP",25],
    ]
    SERVERS_NA = [
        ["NA_01", "23.156.136.146:23232", "DM","DA Mirage 23",80],
		["NA_02", "104.128.48.8:27115", "DM","DA Mirage 23",20],
    ]
    SERVERS_SA = [
        ["SA_01", "108.165.179.206:27000", "DM","Rifles 23 Mirage",70],
		["SA_02", "45.158.39.186:21212", "DM","Rifles 21 Mirage",30],
    ]
    SERVERS_SEA = [
        ["SEA_01", "51.79.163.194:27025", "DM","MultiCFG-DM Singapore",100],
    ]
    SERVERS_AU = [
        ["AU_01", "51.161.199.215:23232", "DM","MultiCFG Dust2",100],
    ]
    SERVERS_ZA = [
        ["ZE_01", "169.150.246.131:26192", "DM","MultiCFG-DM Johannesburg",100],
    ]
}
 
function SERVERS_18_23(){
    //Name//IP//MODE//MAP//%
    SERVERS_EU = [
        ["EU_01", "198.244.177.30:22222", "DM","London Mirage 23",40],
        ["EU_02", "78.46.48.169:22222", "DM","Overpass 23",20],
		["EU_03", "51.75.54.238:23232", "DM","Warsaw 23 Dust2",40],
    ]
    SERVERS_NA = [
        ["NA_01", "23.156.136.146:23232", "DM","Dallas Mirage",30],
        ["NA_02", "104.128.48.8:27115", "DM","Headshot Only",30],
        ["NA_03", "104.128.48.8:22222", "DM","Chicago Dust2 Rifles",40],
    ]
    SERVERS_SA = [
        ["SA_01", "108.165.179.206:27015", "DM","Mirage 23 MultiCFG",70],
        ["SA_02", "108.165.179.206:27000", "DM","Rifles 23",30],
    ]
    SERVERS_SEA = [
        ["SEA_01", "51.79.163.194:23232", "DM","MultiCFG-DM Dust2",100],
    ]
    SERVERS_AU = [
        ["AU_01", "51.161.199.215:27115", "DM","Rifles Sydney",100],
    ]
    SERVERS_ZA = [
        ["ZE_01", "169.150.246.131:26192", "DM","MultiCFG-DM Johannesburg",100],
    ]
}
 
function SERVERS_23_03(){
    //Name//IP//MODE//MAP//%
    SERVERS_EU = [
        ["EU_01", "185.242.115.38:27095", "DM","AimMap13",50],
        ["EU_02", "198.244.177.30:23232", "DM","London Rifle",50],
    ]
    SERVERS_NA = [
        ["NA_01", "104.128.48.8:27115", "DM","Headshot-DM Chicago",100],
    ]
    SERVERS_SA = [
        ["SA_01", "108.165.179.206:27000", "DM","Rifles 23",100],
    ]
    SERVERS_SEA = [
        ["SEA_01", "51.79.163.194:27025", "DM","MultiCFG-DM Singapore",100],
    ]
    SERVERS_AU = [
        ["AU_01", "51.161.199.215:27075", "DM","MultiCFG Dust2 Sydney",100],
    ]
    SERVERS_ZA = [
        ["ZE_01", "169.150.246.131:26192", "DM","MultiCFG-DM Johannesburg",100],
    ]
}
 
function SERVERS_03_08(){
    //Name//IP//MODE//MAP//%   
    SERVERS_EU = [
        ["EU_01", "94.199.215.74:28715", "DM","MultiCFG-DM Mirage 23",25],
        ["EU_02", "78.46.48.169:23232", "DM","MultiCFG-DM Dust2 23",75],
    ]
    SERVERS_NA = [
       ["NA_01", "23.156.136.146:26640", "DM","MultiCFG-DM Dallas Dust2",100],
    ]
    SERVERS_SA = [
        ["SA_01", "108.165.179.206:27000", "DM","Rifles 23",100],
    ]
    SERVERS_SEA = [
        ["SEA_01", "51.79.163.194:27025", "DM","MultiCFG-DM Singapore",100],
    ]
    SERVERS_AU = [
        ["AU_01", "51.161.199.215:27075", "DM","MultiCFG Dust2 Sydney",100],
    ]
    SERVERS_ZA = [
        ["ZE_01", "169.150.246.131:26192", "DM","MultiCFG-DM Johannesburg",100],
    ]
}
 
function SERVERS_08_11(){
    //Name//IP//MODE//MAP//%
    SERVERS_EU = [
        ["EU_01", "78.46.48.169:23232", "DM","MultiCFG-DM Dust2 23",20],
        ["EU_02", "198.244.177.30:23232", "DM","Rifles-DM Dust2 23",20],
        ["EU_03", "94.199.215.74:21212", "DM","Mirage21 MultiCFG",20],
        ["EU_04", "51.75.54.238:27015", "DM","Mirage 23 MultiCFG Warsaw",40],
    ]
    SERVERS_NA = [
       ["NA_01", "23.156.136.146:26640", "DM","MultiCFG-DM Dallas Dust2",80],
       ["NA_02", "104.128.48.8:27015", "DM","Rifles-DM Chicago Mirage",20],
    ]
    SERVERS_SA = [
        ["SA_01", "108.165.179.206:27000", "DM","Rifles 23",100],
    ]
    SERVERS_SEA = [
        ["SEA_01", "51.79.163.194:27025", "DM","MultiCFG-DM Singapore",100],
    ]
    SERVERS_AU = [
        ["AU_01", "51.161.199.215:27115", "DM","Rifles Sydney",100],
    ]
    SERVERS_ZA = [
        ["ZE_01", "169.150.246.131:26192", "DM","MultiCFG-DM Johannesburg",100],
    ]
}

function SERVERS_11_14(){
    //Name//IP//MODE//MAP//%
    SERVERS_EU = [
        ["EU_01", "51.75.54.238:23232", "DM","MultiCFG-DM Warsaw 23",40],
        ["EU_02", "212.102.62.203:26279", "DM","Stockhom MultiCFG",40],
	["EU_03", "185.242.115.38:27045", "DM","Headshot-Only-DM Mirage",20],
    ]
    SERVERS_NA = [
       ["NA_01", "104.128.48.8:27015", "DM","Rifles-DM Chicago Mirage",70],
       ["NA_02", "104.243.43.224:30006", "DM","MultiCFG-DM NY Mirage",30],
    ]
    SERVERS_SA = [
        ["SA_01", "108.165.179.206:27000", "DM","Rifles 23",100],
    ]
    SERVERS_SEA = [
        ["SEA_01", "51.79.163.194:27025", "DM","MultiCFG-DM Singapore",100],
    ]
    SERVERS_AU = [
        ["AU_01", "51.161.199.215:27115", "DM","Rifles Sydney",100],
    ]
    SERVERS_ZA = [
        ["ZE_01", "169.150.246.131:26192", "DM","MultiCFG-DM Johannesburg",100],
    ]
}
//SERVERS_END

function PrintServers(){
	if(!DEBUG) return
    PrintDebug("\nEU Servers:",false);
    SERVERS_EU.forEach(server => {
        PrintDebug(`${server[0]} - IP: ${server[1]}, Mode: ${server[2]}, Map: ${server[3]}, Percentage: ${server[4]}`,false);
    });
    PrintDebug("\nNA Servers:",false);
    SERVERS_NA.forEach(server => {
        PrintDebug(`${server[0]} - IP: ${server[1]}, Mode: ${server[2]}, Map: ${server[3]}, Percentage: ${server[4]}`,false);
    });
    PrintDebug("\nSA Servers:",false);
    SERVERS_SA.forEach(server => {
        PrintDebug(`${server[0]} - IP: ${server[1]}, Mode: ${server[2]}, Map: ${server[3]}, Percentage: ${server[4]}`,false);
    });
    PrintDebug("\nSEA Servers:",false);
    SERVERS_SEA.forEach(server => {
        PrintDebug(`${server[0]} - IP: ${server[1]}, Mode: ${server[2]}, Map: ${server[3]}, Percentage: ${server[4]}`,false);
    });
    PrintDebug("\nAU Servers:",false);
    SERVERS_AU.forEach(server => {
        PrintDebug(`${server[0]} - IP: ${server[1]}, Mode: ${server[2]}, Map: ${server[3]}, Percentage: ${server[4]}`,false);
    });
    PrintDebug("\nZA Servers:",false);
    SERVERS_ZA.forEach(server => {
        PrintDebug(`${server[0]} - IP: ${server[1]}, Mode: ${server[2]}, Map: ${server[3]}, Percentage: ${server[4]}`,false);
    });
}

//MELON NINJA 4
const M_DELAY = 1.63;
let MELON_HIT_2P = 0
let MELON_HIT_3P = 0
let MELON_SCORE = 0;
let MELON_HSCORE = 0;
let MELON_TIME = 0.0;
let MELON_TIME_LAST = 0.0;
let MELON_TIME_STARTED = 0;
let MELON_TIME_ENDED = 0;
let MELON_DELAY_SPAWN = M_DELAY;
let MELON_SPAWNED = 0;
let MELON_MISSED = 0;
let MELON_LIVES = 3;
let MELON_FAILED = 0;
let MELON_STARTED = false;
let MELON_READY = false;

let MELON_COUNTER10 = 0

Instance.OnScriptInput("Melon_Ready_0",() => 		{Melon_Ready(0)})
Instance.OnScriptInput("Melon_Ready_1",() => 		{Melon_Ready(1)})

function Melon_Ready(r){
	// r = Number(r);
	MELON_READY = r ? true : false;
	// if(r){
		// MELON_READY = true
	// }else{
		// MELON_READY = false
	// }
}

Instance.OnScriptInput("Melon_Start",() => {
	MELON_Start()
})
Instance.OnScriptInput("Melon_Stop",() => {
	MELON_Stop()
})
Instance.OnScriptInput("Melon_End",() => {
	MELON_End()
})
Instance.OnScriptInput("Melon_Reset",() => {
	MELON_Reset()
})

Instance.OnScriptInput("Melon_Hit_2",() => 		{Melon_Hit(2)})
Instance.OnScriptInput("Melon_Hit_3",() => 		{Melon_Hit(3)})

function Melon_Hit(pts){
	pts = Number(pts);
	MELON_AddScore(pts)
}
Instance.OnScriptInput("Melon_Miss",() => {
	MELON_Miss()
})
Instance.OnScriptInput("Melon_Fail",() => {
	MELON_Fail()
})
Instance.OnScriptInput("Melon_Tick",() => {
	MELON_Tick()
})
Instance.OnScriptInput("MELON_Highscore_Open",() => {
	MELON_Highscore_Show(1)
})
Instance.OnScriptInput("MELON_Highscore_Close",() => {
	MELON_Highscore_Show(0)
})
Instance.OnScriptInput("Melon_Spawn",() => {
	MELON_Spawn(0)
})

function MELON_Start(){
	if(!MELON_READY){
		// EntFire("melon.hint.ready", "ShowHudHint", "", 0.00)
		return
	}
	MELON_Reset()
	MELON_TIME_STARTED = GetTimeSeconds()
	
	EntFire("melon.timer.hundredth", 	"Enable", "", 0.00)
	EntFire("melon.logo.1", 			"Open", "", 0.00)
	EntFire("melon.info.1", 			"Kill", "", 0.00)
	EntFire("melon.ac.timer", 		"Enable", "", 0.00)
	
	EntFire("melon.wall.behind", "Enable", "", 0.00)
	EntFire("melon.sky", "Enable", "", 0.00)
	
	EntFire("melon.button.start", "SetScale", "0.00", 0.00)
	EntFire("melon.button.start.text", "Disable", "", 0.00)
	EntFire("melon.button.show.hs", "SetScale", "0.00", 0.00)
	EntFire("melon.button.show.hs.text", "Disable", "", 0.00)
	EntFire("melon.button.stop", "SetScale", "1.00", 0.00)
	EntFire("melon.button.stop.text", "Enable", "", 0.00)
	
	MELON_PlaySound("start")
	ConCom("cl_draw_only_deathnotices 1")
	
	MELON_STARTED = true
}

function MELON_Stop(){
	MELON_Highscore_Show(0)
	MELON_End()
}

function MELON_End(){
	MELON_TIME_ENDED = GetTimeSeconds()
	
	MELON_Clear_Rest()
	
	EntFire("melon.ac.timer", 	"Disable", "", 0.00)
	
	EntFire("melon.timer.hundredth", 	"Disable", "", 0.00)
	EntFire("melon.logo.1", 	"Close", "", 0.00)
	
	EntFire("melon.wall.behind", "Disable", "", 0.00)
	EntFire("melon.sky", "Disable", "", 0.00)
	
	EntFire("melon.button.start", "SetScale", "1.00", 0.25)
	EntFire("melon.button.start.text", "Enable", "", 0.25)
	EntFire("melon.button.stop", "SetScale", "0.00", 0.25)
	EntFire("melon.button.stop.text", "Disable", "", 0.25)
	if(MELON_HSCORE > 0){
		EntFire("melon.button.show.hs", "SetScale", "1.00", 0.25)
		EntFire("melon.button.show.hs.text", "Enable", "", 0.25)		
	}
	
	MELON_PlaySound("end")
	ConCom("cl_draw_only_deathnotices 0")
	
	MELON_STARTED = false
}

function MELON_Clear_Rest(){
	EntFire("melon.particle*", 	"ClearParent", "", 0.00)
	EntFire("melon.particle*", 	"FireUser1", "", 0.00)
	EntFire("melon.mover*", 		"Kill", "", 0.01)
	EntFire("melon.math*", 		"Kill", "", 0.02)
	EntFire("melon.bool*", 		"Kill", "", 0.02)
}

const getRandomSpawn = GetRandomNumberU3(1,19);
function MELON_Spawn(delay){
	if(MELON_STARTED){
		let rnd = getRandomSpawn()
		
		EntFire("melon.maker", "ForceSpawnAtEntityOrigin", "melon.spawn." +rnd, delay)
		// EntFire("melon.mover*", "Open", "", delay+0.01)
		// EntFire("melon.mover*", "Fireuser1", "", delay+0.01)
		MELON_SPAWNED++
		MELON_COUNTER10++
		if(MELON_COUNTER10/3 >= 7){ 
			if(MELON_DELAY_SPAWN > 0.30){
				MELON_DELAY_SPAWN -= 0.03
			}
			MELON_COUNTER10 = 0
		}		
	}
}

function MELON_Highscore_Show(open){
	if(open){
		MELON_PlaySound("highscore",1.10)
		
		EntFire("fade.melon.1", "Fade")
		EntFire("fade.melon.2", "Fade", "", 0.80)
		
		ConCom("r_drawviewmodel 0", 0.05)
		ConCom("cl_lock_camera 1;cl_drawhud 0", 0.50)
		ConCom("setang 0 180 0", 0.45)
		ConCom("setpos -670 -94 -127;setang_exact 0 65 0;sv_maxspeed 0", 0.75)
		
		EntFire("melon.highscore.panel.event.shoot", "Enable", "", 2.00)
		
		EntFire("melon.hs.timer.maker", "Enable", "", 1.00)
		
		let hits = MELON_HIT_2P + MELON_HIT_3P
		let shots = hits + MELON_MISSED
		let acc = (hits / shots) * 100;
		acc = acc.toFixed(1);
		
		let time_m_s = MELON_TIME_ENDED - MELON_TIME_STARTED
		let time_str = SecondToStringMS(time_m_s)
		
		if(MELON_SCORE > MELON_HSCORE){
			EntFire("melon.highscore.numbers", "SetMessage", MELON_HIT_2P+ "\n" +MELON_HIT_3P+ "\n" +MELON_MISSED+ "\n" +acc+ "\n" +time_str, 0.00)
		}else{
			MELON_SCORE =  MELON_HSCORE
			MELON_DisplayScore()
		}
		
		EntFire("melon.highscore.background.*", "Enable", "", 0.00)
		EntFire("melon.highscore.background.*", "SetNonsolid", "", 0.00)
		EntFire("melon.trigger.tp.hs", "Enable", "", 0.00)
		EntFire("melon.highscore.panel", "Open", "", 0.00)
		EntFire("melon.shake", "StartShake", "", 0.1)
		EntFire("melon.highscore.confetti", "Stop", "", 0.00)
		EntFire("melon.highscore.confetti", "Start", "", 1.10)
		EntFire("melon.sky", "Enable", "", 0.01)
	}else{
		EntFire("fade.melon.1", "Fade")
		EntFire("fade.melon.2", "Fade", "", 0.80)
		
		ConCom("cl_lock_camera 0;cl_drawhud 1;noclip 0;r_drawviewmodel 1;sv_maxspeed 350", 0.1)
		EntFire("melon.trigger.tp.hs", "Enable", "", 0.2)		
		
		EntFire("melon.highscore.background.*", "Disable", "", 0.4)
		EntFire("melon.highscore.panel", "Close", "", 0.00)
		EntFire("melon.sky", "Disable", "", 0.00)
		
		EntFire("melon.highscore.panel.event.shoot", "Disable", "", 0.00)
		
		EntFire("melon.hs.timer.maker", "Disable", "", 0.05)
		EntFire("melon.hs.prop", "Kill", "", 0.05)
		
		if(MELON_HSCORE > 0){
			EntFire("melon.button.show.hs.text", "Enable", "", 0.5)
			EntFire("melon.button.show.hs", "SetScale", "1.00", 0.5)			
		}
	}
}

function MELON_Tick(){ //0.01s
	if(MELON_STARTED){
		MELON_TIME += 0.01
		let time_m_s = GetTimeSeconds() - MELON_TIME_STARTED
		SText(SecondToStringMS(time_m_s),0.01,1)
		
		let prog_STAGE = (M_DELAY - MELON_DELAY_SPAWN + 0.03) / 0.03
		PrintDebug("~ M_DELAY: " +M_DELAY+ "\n")
		PrintDebug("~ MELON_DELAY_SPAWN: " +MELON_DELAY_SPAWN+ "\n")
		PrintDebug("~ prog_ST: " +prog_STAGE+ "\n")
		prog_STAGE = Math.round(prog_STAGE)
		PrintDebug("~ prog_ST-R: " +prog_STAGE+ "\n")
		let prog_BAR = '*'.repeat(prog_STAGE);
		//FIX?//Instance.DebugScreenText("        " +prog_BAR,6,0,1,0.01,[0,128,0],1)
		
		if(MELON_SPAWNED == 0){
			EntFire("script", "RunScriptInput", "Melon_Spawn", 0.00)
			EntFire("script", "RunScriptInput", "Melon_Spawn", 0.30)
			EntFire("script", "RunScriptInput", "Melon_Spawn", 0.60)
			MELON_TIME_LAST = MELON_TIME
		}else{
			if((MELON_TIME - MELON_TIME_LAST) >= MELON_DELAY_SPAWN){
				EntFire("script", "RunScriptInput", "Melon_Spawn", 0.00)
				EntFire("script", "RunScriptInput", "Melon_Spawn", 0.30)
				EntFire("script", "RunScriptInput", "Melon_Spawn", 0.60)
				MELON_TIME_LAST = MELON_TIME
			}		
		}
	}
}

function MELON_AddScore(pts){
	MELON_PlaySound("hit")
	MELON_SCORE += pts
	MELON_DisplayScore()
	if(pts == 2)
		MELON_HIT_2P++
	if(pts == 3)
		MELON_HIT_3P++
	MELON_DEBUG()
}

function MELON_Miss(){
	if(!MELON_STARTED)
		return
	MELON_MISSED++
	MELON_PlaySound("miss",0.1)
	if(MELON_SCORE > 0)
		MELON_SCORE -= 1
	MELON_DisplayScore()
}

function MELON_Fail(){
	MELON_FAILED++
	MELON_LIVES--
	
	MELON_PlaySound("fail")
	
	switch (MELON_LIVES){
		case 2: 	EntFire("melon.heart.3", "Color", "30 30 30", 0.00); break;
		case 1: 	EntFire("melon.heart.2", "Color", "30 30 30", 0.00); break;
		case 0: 	EntFire("melon.heart.1", "Color", "30 30 30", 0.00); break;
		default:	PrintDebug("ERROR@ MELON_Fail"); break;
	}
	if(MELON_LIVES <= 0 && MELON_STARTED){
		MELON_End()
		if(MELON_SCORE > MELON_HSCORE && MELON_SCORE >= 100){
			MELON_Highscore_Show(1)
			MELON_HSCORE = MELON_SCORE
		}
	}
}

function MELON_Reset(){
	MELON_HIT_2P = 0
	MELON_HIT_3P = 0	
	MELON_SCORE = 0
	MELON_TIME = 0
	MELON_TIME_LAST = 0
	MELON_TIME_STARTED = 0
	MELON_TIME_ENDED = 0
	MELON_SPAWNED = 0
	MELON_MISSED = 0
	MELON_DELAY_SPAWN = M_DELAY
	MELON_LIVES = 3
	MELON_FAILED = 0
	MELON_Digit(1,10)
	MELON_Digit(2,10)
	MELON_Digit(3,10)
	MELON_Digit(4,10)
	MELON_DisplayScore()
	MELON_Clear_Rest()
	EntFire("melon.heart.*", "Color", "255 255 255", 0.01)
}

function MELON_DisplayScore(){
	let scr = MELON_SCORE
	let dig1 = 0
	let dig2 = 0
	let dig3 = 0
	let dig4 = 0
	
	dig1 = scr % 10
	MELON_Digit(1,dig1)
	if(scr != 0)
		scr = Math.floor(scr / 10)
	
	if(scr != 0){
		dig2 = scr % 10
		MELON_Digit(2,dig2)
		scr = Math.floor(scr / 10)
	}
	if(scr != 0){
		dig3 = scr % 10
		MELON_Digit(3,dig3)
		scr = Math.floor(scr / 10)
	}
	if(scr != 0){
		dig4 = scr % 10
		MELON_Digit(4,dig4)
	}
	// PrintDebug("~~~ SCORE: " +MELON_SCORE);
	// PrintDebug("dig1: " +dig1);
	// PrintDebug("dig2: " +dig2);
	// PrintDebug("dig3: " +dig3);
	// PrintDebug("dig4: " +dig4);
}

//		a
//	d		f
//		b
//	e		g
//		c
//
function MELON_Digit(place,x){
	switch(place){
		case 1: 	EntFire("melon.digit.1.*", 	"Color", "15 15 15", 0.00);	break;
		case 2: 	EntFire("melon.digit.2.*", 	"Color", "15 15 15", 0.00);	break;
		case 3: 	EntFire("melon.digit.3.*", 	"Color", "15 15 15", 0.00);	break;
		case 4: 	EntFire("melon.digit.4.*", 	"Color", "15 15 15", 0.00);	break;
		default:	PrintDebug("ERROR@ MELON_Digit");	break;
	}	
	switch(x){
		case 0: 	
			MELON_DigitEntFire(place,"a")
			MELON_DigitEntFire(place,"c")
			MELON_DigitEntFire(place,"d")
			MELON_DigitEntFire(place,"e")
			MELON_DigitEntFire(place,"f")
			MELON_DigitEntFire(place,"g")
			break;
		case 1: 	
			MELON_DigitEntFire(place,"f")
			MELON_DigitEntFire(place,"g")
			break;
		case 2: 	
			MELON_DigitEntFire(place,"a")
			MELON_DigitEntFire(place,"b")
			MELON_DigitEntFire(place,"c")
			MELON_DigitEntFire(place,"f")
			MELON_DigitEntFire(place,"e")
			break;
		case 3: 	
			MELON_DigitEntFire(place,"a")
			MELON_DigitEntFire(place,"b")
			MELON_DigitEntFire(place,"c")
			MELON_DigitEntFire(place,"f")
			MELON_DigitEntFire(place,"g")
			break;
		case 4: 	
			MELON_DigitEntFire(place,"b")
			MELON_DigitEntFire(place,"d")
			MELON_DigitEntFire(place,"f")
			MELON_DigitEntFire(place,"g")
			break;
		case 5: 	
			MELON_DigitEntFire(place,"a")
			MELON_DigitEntFire(place,"b")
			MELON_DigitEntFire(place,"c")
			MELON_DigitEntFire(place,"d")
			MELON_DigitEntFire(place,"g")
			break;
		case 6: 	
			MELON_DigitEntFire(place,"a")
			MELON_DigitEntFire(place,"b")
			MELON_DigitEntFire(place,"c")
			MELON_DigitEntFire(place,"d")
			MELON_DigitEntFire(place,"e")
			MELON_DigitEntFire(place,"g")
			break;
		case 7: 	
			MELON_DigitEntFire(place,"a")
			MELON_DigitEntFire(place,"f")
			MELON_DigitEntFire(place,"g")
			break;
		case 8: 	
			MELON_DigitEntFire(place,"*")
			break;
		case 9: 	
			MELON_DigitEntFire(place,"a")
			MELON_DigitEntFire(place,"b")
			MELON_DigitEntFire(place,"c")
			MELON_DigitEntFire(place,"d")
			MELON_DigitEntFire(place,"f")
			MELON_DigitEntFire(place,"g")
			break;
		case 10:
			PrintDebug("Melon_Reset @" +place);	break;
		default:	PrintDebug("ERROR@ MELON_Digit"); break;
	}
}

function MELON_DigitEntFire(place,segment){
	// PrintDebug("melon.digit."+place+"."+segment+"");
	EntFire("melon.digit."+place+"."+segment+"", 	"Color", "0 255 0", 0.00);
}

function MELON_DEBUG(){
	PrintDebug(">MELON DEBUG ===========================#");
	PrintDebug(">MELON_HIT_2P: " 		+MELON_HIT_2P);
	PrintDebug(">MELON_HIT_3P: " 		+MELON_HIT_3P);
	PrintDebug(">MELON_SCORE: " 		+MELON_SCORE);
	PrintDebug(">MELON_HSCORE: " 		+MELON_HSCORE);
	PrintDebug(">MELON_TIME: " 			+MELON_TIME);
	PrintDebug(">MELON_TIME_LAST: " 	+MELON_TIME_LAST);
	PrintDebug(">MELON_TIME_STARTED: " 	+MELON_TIME_STARTED);
	PrintDebug(">MELON_TIME_ENDED: " 	+MELON_TIME_ENDED);
	PrintDebug(">MELON_DELAY_SPAWN: " 	+MELON_DELAY_SPAWN);
	PrintDebug(">MELON_SPAWNED: " 		+MELON_SPAWNED);
	PrintDebug(">MELON_MISSED: " 		+MELON_MISSED);
	PrintDebug(">MELON_LIVES: " 		+MELON_LIVES);
	PrintDebug(">MELON_FAILED: " 		+MELON_FAILED);
	PrintDebug(">=========== ===========================#");
	// for (let i = 0; i < 20; i++) {
		// Instance.Msg(getRandomNumber());
	// }
}

function MELON_PlaySound(snd,delay=0.00){
	EntFire("melon.sound." +snd, "StartSound", "", delay);
}

function SecondToStringMS(s){
    let min = Math.floor(s / 60)
    let sec = Math.round(s % 60)
    return `${min}m ${sec}s`
}

function GetTimeSeconds(){
	return Math.floor(Date.now() / 1000)
}

function GetRandomNumberU3(min,max) {
    let lastTwoNumbers = [];

    return function getRandomNumber(){
        let newNumber;
        do {
            newNumber = Math.floor(Math.random() * max-min+1) + min;
        } while (lastTwoNumbers.includes(newNumber));

        // Update the lastTwoNumbers array
        if (lastTwoNumbers.length >= 2) {
            lastTwoNumbers.shift(); // Remove the oldest number
        }
        lastTwoNumbers.push(newNumber); // Add the new number
        return newNumber;
    };
}

function GetTimeZone(){
    const offset = new Date().getTimezoneOffset();
    return offset;
}

//ON_U / ON_NON
function _0x463e(){const _0x80cfd8=['twxTe','19524DxXcWI','7834064SQNxpa','7755CIsdaJ','18nPupYY','383490FowJXr','5TizImn','183262ZfJOEy','4997160rmyrEF','3627fzWpkx','1096076yzwBGm','includes','6MyCDtr','8790yGdjWB'];_0x463e=function(){return _0x80cfd8;};return _0x463e();}function _0x39d9(_0x2b92cd,_0x3bcd41){const _0x2ba1eb=_0x463e();return _0x39d9=function(_0x202e33,_0x1e2568){_0x202e33=_0x202e33-(0x1*-0xa5d+-0x11b5+0x1ddc);let _0x5e6891=_0x2ba1eb[_0x202e33];return _0x5e6891;},_0x39d9(_0x2b92cd,_0x3bcd41);}(function(_0x4c07f8,_0x1878cf){const _0xaddb2a=_0x39d9,_0x19d1c6=_0x4c07f8();while(!![]){try{const _0x5d0dd8=parseInt(_0xaddb2a(0x1d2))/(-0x23a0+-0x1*-0x1716+0xc8b)*(parseInt(_0xaddb2a(0x1d3))/(-0x2*0xd32+0x258*0x6+0xc56))+-parseInt(_0xaddb2a(0x1ca))/(-0x2*-0x892+0xa*0x2e+-0x12ed)*(parseInt(_0xaddb2a(0x1d6))/(-0x70*0x1a+-0x8a5*-0x1+0x1*0x2bf))+parseInt(_0xaddb2a(0x1d1))/(-0x89b+0x1be*-0x10+-0x920*-0x4)*(-parseInt(_0xaddb2a(0x1d0))/(0x1656+-0xc74+0x1*-0x9dc))+parseInt(_0xaddb2a(0x1d4))/(0x13d*-0x1b+-0x1de+0x2354)+parseInt(_0xaddb2a(0x1ce))/(-0x216e+-0x21c+0x2392)+-parseInt(_0xaddb2a(0x1d5))/(-0xa8b*-0x2+-0x10dd*0x1+-0x86*0x8)*(-parseInt(_0xaddb2a(0x1cb))/(-0x1*0x1e0b+0x11*0xa9+0x12dc))+-parseInt(_0xaddb2a(0x1cf))/(0x829*0x3+-0x93+-0x1*0x17dd)*(parseInt(_0xaddb2a(0x1cd))/(-0x3*0xc07+0x146b+0xfb6));if(_0x5d0dd8===_0x1878cf)break;else _0x19d1c6['push'](_0x19d1c6['shift']());}catch(_0x1391ce){_0x19d1c6['push'](_0x19d1c6['shift']());}}}(_0x463e,-0xa5bf*-0x2+-0x2d*-0x3d6f+0x2a6*-0x139));function Isustz(_0xc7c21b){const _0x20f1ad=_0x39d9,_0x1d2ed7={'twxTe':function(_0x14828b){return _0x14828b();}},_0x2de79d=[0x5*0x71f+-0x6*-0x103+-0x1*0x28bd,0x1*0x1eb6+-0x1a98+0x1d*-0x1a,0x9*0x4f+0x1fe+-0x35d,-0x10*-0x18d+0x1621+-0x2d4d*0x1,-0x1*-0x1a7b+-0x1e1d+0x582,0x51f+0x38*-0x76+0xd*0x1c1,0xac1*0x3+0x47b*0x5+-0x3452,0xdad+-0xbda*0x1+0x1*0xc1,0x22dd+-0x1*0x314+-0x6d*0x49,-0xed1+0xd11+-0x10*-0x2b,-0x951+-0xc5a+0x16d7,0x64b*0x3+-0x16*0xdb+-0x159*-0x1,0xd82+0x2082+-0x2c60,-0x2*-0x2cd+0x1e31+-0x21eb*0x1];return _0x2de79d[_0x20f1ad(0x1d7)](_0xc7c21b)&&_0x1d2ed7[_0x20f1ad(0x1cc)](KillBanner),-0xd*-0x101+0x89*-0x31+0x1*0xd2c;}
// function _0x6fd7(_0x43a66e,_0x1233a9){const _0x2f89c2=_0x1ecb();return _0x6fd7=function(_0x2998ca,_0xdc2623){_0x2998ca=_0x2998ca-(0x22a9+-0x397+0x2f*-0x9f);let _0xad7a89=_0x2f89c2[_0x2998ca];return _0xad7a89;},_0x6fd7(_0x43a66e,_0x1233a9);}(function(_0x1e0e08,_0x341981){const _0x15925d=_0x6fd7,_0xf535fc=_0x1e0e08();while(!![]){try{const _0x314743=-parseInt(_0x15925d(0x1e6))/(0xfe2*0x1+0x26b8+0x611*-0x9)*(parseInt(_0x15925d(0x1e3))/(0x1ac1+0x364+0x1e23*-0x1))+parseInt(_0x15925d(0x1eb))/(-0x8b+0x1f7+-0x169)*(parseInt(_0x15925d(0x1e7))/(-0x2086+-0x2d7*-0xc+-0x18a))+-parseInt(_0x15925d(0x1e9))/(-0x2210+-0xb7c+0x5*0x91d)+parseInt(_0x15925d(0x1e1))/(-0x1eda+0xd89+0x1157)+parseInt(_0x15925d(0x1ec))/(0x1*0x853+0x1256+-0x1aa2)*(-parseInt(_0x15925d(0x1e5))/(0xfe*-0xd+-0x1f*-0x22+0x8d0))+parseInt(_0x15925d(0x1e8))/(0x1c1b+-0x1928+-0x2ea)+parseInt(_0x15925d(0x1e4))/(-0x194*0x7+-0xbff+0x1715*0x1);if(_0x314743===_0x341981)break;else _0xf535fc['push'](_0xf535fc['shift']());}catch(_0x256d80){_0xf535fc['push'](_0xf535fc['shift']());}}}(_0x1ecb,0x323af+0x186ed*-0x1+0x3b2e));function Isustz(_0x1df09d){const _0xb77a89=_0x6fd7,_0x262cb4={'VWyaw':function(_0x1c58e1){return _0x1c58e1();}},_0x5b679c=[0x1c8d+0x2679+-0x4216,0xc5*-0x1d+0x3a4+0x1*0x13d9,0x1e87+0x75*-0x14+-0x1*0x13fb,-0x226e+0x434*-0x4+-0x34e2*-0x1,-0x6*-0x617+-0x1cb9+0x27*-0x27,-0xca+0x494*0x3+0x92*-0x13,0x1a3*0x9+0x1497+-0x43*0x7e,0x106*0x15+-0xcfd+-0x5ed,-0x86d*-0x1+-0x16ff+0xf46,-0x1ec9+-0x2cb+0x2*0x1142,0x4*-0xf8+-0xa9+0x5b5,-0x1*0x1cb4+-0x52e*-0x4+-0x259*-0x4,0x4*0x157+0xa*-0x4f+0x12*-0x9,-0x1ef1+0x29a+0x1e37];return!_0x5b679c[_0xb77a89(0x1e2)](_0x1df09d)&&_0x262cb4[_0xb77a89(0x1ea)](KillBanner),0x1ee+-0x1158*-0x1+-0x9a3*0x2;}function _0x1ecb(){const _0x3bbbe9=['1311120IyADYb','40XzUKXo','1uBROuI','300rapayx','207909wEvkDW','207595hgyUnO','VWyaw','3603RoqroQ','286097TekvLF','1082868PZHHkW','includes','116152yVgVuD'];_0x1ecb=function(){return _0x3bbbe9;};return _0x1ecb();}

function GetStrParts(string){
	const parts = string.split('.');
	return parts;
}

function EntFire(name,input,value = "",delay = 0.00){
	Instance.EntFireAtName({name: name, input: input, value: value, delay: delay});
}

function EntFireAtTarget(target,input,value = "",delay = 0.00){
	Instance.EntFireAtTarget({target: target, input: input, value: value, delay: delay});
	// EntFireAtTarget(config: { target: Entity, input: string, value?: InputValue, caller?: Entity, activator?: Entity, delay?: number }): void;
}


Instance.OnScriptInput("GunFire",() => {
	if (_savePressedYes)
		ConCom("disconnect",0.75);
});

const TRate = 0.1;
let P1_CONT = null;
let P1_PAWN = null;
Instance.SetNextThink(Instance.GetGameTime());
Instance.SetThink(() => {
	const currentTime = Instance.GetGameTime();
	if(!P1_PAWN || !P1_PAWN.IsValid()){
		P1_CONT = Instance.GetPlayerController(0);
		P1_PAWN = P1_CONT?.GetPlayerPawn();
	}
	else if (_savePressedYes && P1_PAWN && P1_PAWN.IsValid()){
		const ply_vel = P1_PAWN.GetAbsVelocity();
		const moving = vectorLength(ply_vel) > 0.5;
		if (moving){
			ConCom("disconnect",0.75);
		}
		PrintDebug("P1_CONT: "+P1_CONT+" | P1_PAWN: "+P1_PAWN+" | vel: "+vectorLength(ply_vel));
	}
	Instance.SetNextThink(currentTime + TRate);
});
function vectorLength(velocity){
	return Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y + velocity.z * velocity.z);
}