String.prototype.clr = function (hexColor) { return `<font color="#${hexColor}">${this}</font>` };
const Vec3 = require('tera-vec3');
const config = require('./config.json');

const mapID = 9044;
const BossID = [1000, 2000];
const {BossActions} = require('./skills');

module.exports = function BahaarGuide(d) {
	let	enabled = config.enabled,
		sendToParty = config.sendToParty,
		streamenabled = config.streamenabled,

		isTank = false,
		insidemap = false,
		whichboss = 0,
		skillid = 0,
		
		Shine = false,

		hooks = [],

		curLocation = null,
		curAngle = null,

		boss_CurLocation,
		boss_CurAngle,

		uid0 = 999999999,
		uid1 = 899999999,
		uid2 = 799999999;

	d.command.add(['baha', 'bahaar'], (arg) => {
		if (!arg) {
			enabled = !enabled;
			d.command.message((enabled ? 'Enabled'.clr('56B4E9') : 'Disabled'.clr('E69F00')));
		} else {
			switch (arg) {
                case "on":		
                    enabled = true;		
                    d.command.message((enabled ? 'Enabled'.clr('56B4E9') : 'Disabled'.clr('E69F00')));		
                    break;		
                case "off":		
                    enabled = false;		
                    d.command.message((enabled ? 'Enabled'.clr('56B4E9') : 'Disabled'.clr('E69F00')));		
                    break;                    
				case "p":
				case "party":
					sendToParty = !sendToParty;
					d.command.message('Send to party: ' + (sendToParty ? 'Enabled'.clr('56B4E9') : 'Disabled'.clr('E69F00')));
					break;
				case "proxy":
					streamenabled = !streamenabled;
					d.command.message('Stream Mode: ' + (streamenabled ? 'Enabled'.clr('56B4E9') : 'Disabled'.clr('E69F00')));
					break;
				case "debug":
					d.command.message('enabled: ' + `${enabled}`.clr('00FFFF'));
					d.command.message('insidemap: ' + insidemap);
					d.command.message('whichboss: ' + whichboss);
					d.command.message('sendtoparty ' + (sendToParty ? 'true'.clr('56B4E9') : 'false'.clr('E69F00')));
					d.command.message('istank ' + (isTank ? 'true'.clr('00FFFF') : 'false'.clr('FF0000')));
					sendMessage('test');
					break;
				default :
					d.command.message('Invalid argument!'.clr('FF0000'));
					break;
			}
		}
	});

	d.hook('S_LOGIN', 12, sLogin)
	d.hook('S_LOAD_TOPO', 3, sLoadTopo);

	function sLogin(event) {
		let job = (event.templateId - 10101) % 100;
		if (job === 1 || job === 10) {
			isTank = true;
		} else {
			isTank = false;
		}
	}

	function sLoadTopo(event) {
		if (event.zone === mapID) {
			insidemap = true;
			d.command.message('Welcome to ' + 'Bahaar\'s Sanctum '.clr('56B4E9'));
			load();
		} else {
			unload();
		}
    }

	function load() {
		if (!hooks.length) {
			hook('S_BOSS_GAGE_INFO', 3, sBossGageInfo);
			hook('S_ACTION_STAGE', 9, sActionStage);
			hook('S_ABNORMALITY_BEGIN', 3, sAbnormalityBegin);
			hook('S_ABNORMALITY_END', 1, sAbnormalityEnd);

			function sBossGageInfo(event) {
				if (!enabled) return;
				if (!insidemap) return;

				let bosshp = (event.curHp / event.maxHp);

				if (bosshp <= 0) {
					whichboss = 0;
				}

				if (bosshp === 1) {
					shining = false;
				}

				if (event.templateId === BossID[0])
					whichboss = 1;
				else if (event.templateId === BossID[1])
					whichboss = 2;
				else
					whichboss = 0;
			}

			function sActionStage(event) {
				if (!enabled || !insidemap || whichboss===0) return;
				if (event.templateId!=BossID[0] && event.templateId!=BossID[1]) return;

				boss_CurLocation = event.loc;
				boss_CurAngle = event.w;

				curLocation = boss_CurLocation;
				curAngle = boss_CurAngle;
				
				if (event.stage>0) return;
				
				skillid = event.skill.id % 1000;

				if (BossActions[skillid]) {
					switch (skillid) {
						case 114:	// Eviscerate
							SpawnThing(184, 260, 100);
							Spawnitem2(913, 10, 320, 4000);
							break;
						case 112: 	// Handle
						case 135:	// Handle
							SpawnThing(184, 260, 100);
							Spawnitem2(913, 10, 260, 4000);
							break;
						case 116:	// Donuts
							Spawnitem2(913, 8, 290, 6000);
							break;
						case 121:// Waves
						case 122:// Waves
						case 123:// Waves
						case 140:// Waves
						case 141:// Waves
						case 142:// Waves
							SpawnThing(90, 50, 5000);
							Spawnitem1(913, 180, 500, 5000);
							Spawnitem1(913, 0, 500, 5000);
							SpawnThing(270, 100, 5000);
							Spawnitem1(913, 180, 500, 5000);
							Spawnitem1(913, 0, 500, 5000);
							setTimeout(function(){sendMessage('Wave Soon');}, 60000); //Wave Reminder so you stop dying
							break;
						case 119:	//Left Swipe (Working properly but can be improved)
							SpawnThing(90, 50, 2000);
							Spawnitem1(1, 180, 500, 2000);
							Spawnitem1(1, 0, 500, 2000);
							break;
						case 131:	//Left Scrath (Working properly but can be improved)
							SpawnThing(90, 50, 4000);
							Spawnitem1(913, 180, 500, 4000);
							Spawnitem1(913, 0, 500, 4000);
							break;						
						case 120:	//Right Swipe (Working properly but can be improved)
							SpawnThing(270, 100, 2000);
							Spawnitem1(1, 180, 500, 2000);
							Spawnitem1(1, 0, 500, 2000);
							break;
						case 101:	//Spin Patern (Working properly but can be improved)
						case 125:	//Right Scratch (Working properly but can be improved)
							SpawnThing(270, 100, 4000);
							Spawnitem1(913, 180, 500, 4000);
							Spawnitem1(913, 0, 500, 4000);
							break;
						default :
							break;
					}
					sendMessage(BossActions[skillid].msg);
				}
				
				if (skillid==307) {//Plague Reminder for 2 IQ Healers
					setTimeout(function(){sendMessage('Plague/Regress');}, 20600);
				}
				
				if (skillid==118) {//Backhit After Jump
					setTimeout(function(){if (Shine) {sendMessage('Back');}}, 2550);
				}
				
				if (skillid==104) {//Backhit After Normal FrontSlam
					setTimeout(function(){if (Shine) {sendMessage('Back');}}, 1300);
				}
				
				//EdgeCase (Edgy Bahaar-chan doing Backhit without Shiny Hammer ?!)
				if (!Shine && skillid==137) {sendMessage('Back');};
			}
			
			function sAbnormalityEnd(event) {
				if (!enabled || !insidemap || whichboss===0) return;

				if (event.id==90442000) {//End Shine (Not Shine)
					Shine = false;
				}
			}

			function sAbnormalityBegin(event) {
				if (!enabled || !insidemap || whichboss===0) return;
				
				if (event.id==90442000) {//Shine
					Shine = true;
					if (skillid==134) {sendMessage('Back');} //Backhit after Left scratch
				}
			}
		}
	}

	function hook() {
		hooks.push(d.hook(...arguments));
	}

	function unload() {
		if (hooks.length) {
			for (let h of hooks)
				d.unhook(h);
			hooks = [];
		}
		reset();
	}

	function reset() {
		insidemap = false,
		whichboss = 0;
	}

	function sendMessage(msg) {
		if (sendToParty) {
			d.toServer('C_CHAT', 1, {
				channel: 21,
				message: msg
			});
		} else if (streamenabled) {
			d.command.message(msg);
		} else {
			d.toClient('S_CHAT', 2, {
				channel: 21,
				authorName: 'DG-Guide',
				message: msg
			});
		}
	}

	function SpawnThing(degrees, radius, times) {
        if (streamenabled) return;
		let r = null, rads = null, finalrad = null;

		r = curAngle - Math.PI;
		rads = (degrees * Math.PI/180);
		finalrad = r - rads;
		curLocation.x = boss_CurLocation.x + radius * Math.cos(finalrad);
		curLocation.y = boss_CurLocation.y + radius * Math.sin(finalrad);

		d.toClient('S_SPAWN_BUILD_OBJECT', 2, {
			gameId : uid1,
			itemId : 1,
			loc : curLocation,
			w : r,
			unk : 0,
			ownerName : 'DG-Guide',
			message : 'Safe line'
		});

		curLocation.z = curLocation.z - 1000;
		d.toClient('S_SPAWN_DROPITEM', 6, {
			gameId: uid2,
			item: 98260,
			loc: curLocation,
			amount: 1,
			expiry: 600000,
			owners: [{
				id: 0
			}]
		});
		curLocation.z = curLocation.z + 1000;

		setTimeout(DespawnThing, times, uid1, uid2);
		uid1--;
		uid2--;
	}

	function DespawnThing(uid_arg1, uid_arg2) {
		d.toClient('S_DESPAWN_BUILD_OBJECT', 2, {
			gameId : uid_arg1,
			unk : 0
		});
		d.toClient('S_DESPAWN_DROPITEM', 4, {
			gameId: uid_arg2
		});
	}

	function Spawnitem(item, degrees, radius, times) {
        if (streamenabled) return;
		let r = null, rads = null, finalrad = null, spawnx = null, spawny = null, pos = null;

		r = curAngle - Math.PI;
		rads = (degrees * Math.PI/180);
		finalrad = r - rads;
		spawnx = curLocation.x + radius * Math.cos(finalrad);
		spawny = curLocation.y + radius * Math.sin(finalrad);
		pos = {x:spawnx, y:spawny};

		d.toClient('S_SPAWN_COLLECTION', 4, {
			gameId : uid0,
			id : item,
			amount : 1,
			loc : new Vec3(pos.x, pos.y, curLocation.z),
			w : r,
			unk1 : 0,
			unk2 : 0
		});

		setTimeout(Despawn, times, uid0);
		uid0--;
	}

	function Despawn(uid_arg0) {
		d.toClient('S_DESPAWN_COLLECTION', 2, {
			gameId : uid_arg0
		});
	}

	function Spawnitem1(item, degrees, maxRadius, times) {
		for (var radius=25; radius<=maxRadius; radius+=25) {
			Spawnitem(item, degrees, radius, times);
		}
	}

	function Spawnitem2(item, intervalDegrees, radius, times) {
		for (var degrees=0; degrees<360; degrees+=intervalDegrees) {
			Spawnitem(item, degrees, radius, times);
		}
	}
}
