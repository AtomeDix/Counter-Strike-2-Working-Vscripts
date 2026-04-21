import { Instance } from "cs_script/point_script";

var NO_RECOIL = false;

Instance.OnScriptInput("NoRecoilEnabled", () => {
	NO_RECOIL = true;
	Instance.ServerCommand("view_punch_decay 9999");
	Instance.ServerCommand("weapon_accuracy_nospread 1");
});

Instance.OnScriptInput("NoRecoilDisabled", () => {
	NO_RECOIL = false;
	Instance.ServerCommand("view_punch_decay 18");
	Instance.ServerCommand("weapon_accuracy_nospread 0");
});


Instance.OnRoundStart(() => {
	NO_RECOIL = false;
	Instance.ServerCommand("view_punch_decay 18");
	Instance.ServerCommand("weapon_accuracy_nospread 0");
	Instance.ServerCommand("hidehud 0");
	Instance.ServerCommand("r_drawviewmodel 1");
	Instance.ServerCommand("sv_showimpacts 0");
	
});

Instance.OnGunFire((event) => {
	
	if (NO_RECOIL) {
		const weapon = event.weapon;
		const pawn = weapon.GetOwner();
		const ctrl = pawn.GetPlayerController();
		if (!ctrl || ctrl.IsBot()) return;
		
		var pos = pawn.GetAbsOrigin();
		pawn.Teleport(pos, null, null);
	}

});


function Debug(msg) {
    Instance.Msg("[cs_recoil] " + msg + "\n");
}
Debug("RECOIL SCRIPT EXECUTED");