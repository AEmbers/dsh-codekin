import { i as TRACE_ECOLOGIES, n as CAPTURE_CORE_QUALITIES, u as defineContentPack } from "./src-DvVBFylB.js";
//#region lib/types/content-packs/core/src/catalog.js
const CORE_DROP_WEIGHTS = Object.freeze({
	pebble: 55,
	pulse: 25,
	prism: 12,
	nova: 6,
	origin: 2
});
const CORE_CAPTURE_MULTIPLIERS = Object.freeze({
	pebble: .85,
	pulse: 1.05,
	prism: 1.3,
	nova: 1.65,
	origin: 2.1
});
const RARITY_STATS = Object.freeze({
	common: Object.freeze({
		hp: 1200,
		attack: 165,
		defense: 105,
		speed: 100
	}),
	uncommon: Object.freeze({
		hp: 1290,
		attack: 178,
		defense: 114,
		speed: 106
	}),
	rare: Object.freeze({
		hp: 1380,
		attack: 192,
		defense: 124,
		speed: 112
	}),
	apex: Object.freeze({
		hp: 1490,
		attack: 208,
		defense: 136,
		speed: 120
	})
});
const ROWS$1 = Object.freeze([
	[
		1,
		"lumen-indeximp",
		"索引团",
		"Indeximp",
		"lumen",
		"common",
		"marker",
		.55,
		"index-flash"
	],
	[
		2,
		"lumen-foliomoth",
		"页翼蛾",
		"Foliomoth",
		"lumen",
		"common",
		"support",
		.55,
		"page-veil"
	],
	[
		3,
		"lumen-lensel",
		"镜尾鼬",
		"Lensel",
		"lumen",
		"uncommon",
		"scout",
		.42,
		"prism-trace"
	],
	[
		4,
		"lumen-echocoil",
		"回声螺",
		"Echocoil",
		"lumen",
		"rare",
		"echo-support",
		.28,
		"echo-archive"
	],
	[
		5,
		"lumen-atlashart",
		"星图鹿",
		"Atlashart",
		"lumen",
		"apex",
		"lumen-leader",
		.16,
		"atlas-field"
	],
	[
		6,
		"forge-sparkmite",
		"火花螨",
		"Sparkmite",
		"forge",
		"common",
		"multi-hit",
		.55,
		"spark-hop"
	],
	[
		7,
		"forge-rivetclaw",
		"铆钉蟹",
		"Rivetclaw",
		"forge",
		"common",
		"counter-tank",
		.55,
		"rivet-rebound"
	],
	[
		8,
		"forge-solderling",
		"熔线蜥",
		"Solderling",
		"forge",
		"uncommon",
		"damage-link",
		.42,
		"solder-bridge"
	],
	[
		9,
		"forge-anvilback",
		"砧背兽",
		"Anvilback",
		"forge",
		"rare",
		"shield-breaker",
		.28,
		"falling-anvil"
	],
	[
		10,
		"forge-kiln-colossus",
		"炉心巨像",
		"Kiln Colossus",
		"forge",
		"apex",
		"forge-leader",
		.16,
		"kiln-overload"
	],
	[
		11,
		"relay-pingfly",
		"信标萤",
		"Pingfly",
		"relay",
		"common",
		"initiative",
		.55,
		"beacon-handshake"
	],
	[
		12,
		"relay-duplex-hare",
		"双相兔",
		"Duplex Hare",
		"relay",
		"common",
		"stance-switch",
		.55,
		"duplex-switch"
	],
	[
		13,
		"relay-routeray",
		"路由鳐",
		"Routeray",
		"relay",
		"uncommon",
		"position-control",
		.42,
		"soft-route"
	],
	[
		14,
		"relay-forktail",
		"分岔貂",
		"Forktail",
		"relay",
		"rare",
		"combo",
		.28,
		"fork-return"
	],
	[
		15,
		"relay-mesh-jelly",
		"群星水母",
		"Mesh Jelly",
		"relay",
		"apex",
		"relay-leader",
		.16,
		"mesh-resonance"
	],
	[
		16,
		"aegis-veribud",
		"校验芽",
		"Veribud",
		"aegis",
		"common",
		"cleanse-heal",
		.55,
		"verify-dew"
	],
	[
		17,
		"aegis-loop-tortoise",
		"环盾龟",
		"Loop Tortoise",
		"aegis",
		"common",
		"protector",
		.55,
		"loop-guard"
	],
	[
		18,
		"aegis-anchorbee",
		"定锚蜂",
		"Anchorbee",
		"aegis",
		"uncommon",
		"field-lock",
		.42,
		"anchor-field"
	],
	[
		19,
		"aegis-steady-ram",
		"稳态羊",
		"Steady Ram",
		"aegis",
		"rare",
		"debuff-converter",
		.28,
		"steady-rebound"
	],
	[
		20,
		"aegis-dawnguard",
		"曙光狮",
		"Dawnguard",
		"aegis",
		"apex",
		"aegis-leader",
		.16,
		"dawn-restart"
	],
	[
		21,
		"glitch-null-nibbler",
		"空值虫",
		"Null Nibbler",
		"glitch",
		"common",
		"buff-eater",
		.55,
		"null-bite"
	],
	[
		22,
		"glitch-stack-weaver",
		"栈裂蛛",
		"Stack Weaver",
		"glitch",
		"common",
		"corruption-control",
		.55,
		"broken-stack-web"
	],
	[
		23,
		"glitch-lagtoad",
		"超时蛙",
		"Lagtoad",
		"glitch",
		"uncommon",
		"delay-counter",
		.42,
		"delayed-payback"
	],
	[
		24,
		"glitch-crashfox",
		"红屏狐",
		"Crashfox",
		"glitch",
		"rare",
		"glass-cannon",
		.28,
		"crash-flare"
	],
	[
		25,
		"glitch-overflow-maw",
		"溢流巨兽",
		"Overflow Maw",
		"glitch",
		"apex",
		"glitch-leader",
		.16,
		"boundary-overflow"
	]
]);
const CREATURE_CATALOG = Object.freeze(ROWS$1.map((row) => {
	const [number, id, nameZh, nameEn, ecology, rarity, combatRole, baseCaptureRate, signatureProtocol] = row;
	const base = RARITY_STATS[rarity];
	const ecologyOffset = TRACE_ECOLOGIES.indexOf(ecology);
	return Object.freeze({
		number,
		id,
		nameZh,
		nameEn,
		ecology,
		rarity,
		combatRole,
		baseCaptureRate,
		signatureProtocol,
		spriteIndex: (number - 1) % 5,
		stats: Object.freeze({
			hp: base.hp + ecologyOffset * 30,
			attack: base.attack + number % 3 * 8,
			defense: base.defense + number % 2 * 7,
			speed: base.speed + (number + 1) % 3 * 5
		})
	});
}));
const BY_ID = new Map(CREATURE_CATALOG.map((creature) => [creature.id, creature]));
function creatureById(id) {
	return BY_ID.get(id);
}
function creaturesInEcology(ecology) {
	return CREATURE_CATALOG.filter((creature) => creature.ecology === ecology);
}
const STARTER_CREATURE_IDS = Object.freeze([
	"lumen-indeximp",
	"forge-sparkmite",
	"aegis-veribud"
]);
const SIGNAL_VARIANT_CREATURE_IDS = Object.freeze({
	missing: "glitch-null-nibbler",
	stack: "glitch-stack-weaver",
	timeout: "glitch-lagtoad",
	crash: "glitch-crashfox",
	overflow: "glitch-overflow-maw"
});
function creatureIdForSignalVariant(variant) {
	return SIGNAL_VARIANT_CREATURE_IDS[variant];
}
//#endregion
//#region lib/types/content-packs/core/src/skills.js
const QUALITY_SKILL_MULTIPLIERS = Object.freeze({
	pebble: .86,
	pulse: .93,
	prism: 1,
	nova: 1.1,
	origin: 1.22
});
const ROWS = Object.freeze([
	[
		"lumen-indeximp",
		"索引标记",
		"Index Mark",
		"每轮首次智算消除施加标记。",
		"The first Compute match each round applies Mark.",
		"索引闪光",
		"Index Flash",
		"造成伤害，将 3 格转为智算。",
		"Deals damage and converts 3 tiles to Compute."
	],
	[
		"lumen-foliomoth",
		"页翼抚慰",
		"Page Comfort",
		"四连智算会修复队伍共享运行值。",
		"A 4+ Compute match repairs shared squad runtime.",
		"页幕",
		"Page Veil",
		"修复共享运行值并提供防护层。",
		"Repairs shared runtime and adds a guard layer."
	],
	[
		"lumen-lensel",
		"连锁洞察",
		"Chain Insight",
		"每阶段首次二层连锁额外获得指令值。",
		"The first 2+ cascade each stage grants extra command points.",
		"棱镜追踪",
		"Prism Trace",
		"将 4 格转为克制敌方的属性。",
		"Converts 4 tiles to the attribute that counters the enemy."
	],
	[
		"lumen-echocoil",
		"回声余韵",
		"Echo Residue",
		"每轮首次二层连锁追加一次回声伤害。",
		"The first 2+ cascade each round echoes part of its damage.",
		"回声档案",
		"Echo Archive",
		"重放上一次有效交换的伤害。",
		"Replays damage from the previous valid swap."
	],
	[
		"lumen-atlashart",
		"星图起点",
		"Atlas Opening",
		"每轮首次消除拥有更高连锁倍率。",
		"The first match each round starts with a higher combo multiplier.",
		"星图领域",
		"Atlas Field",
		"接下来两步的属性倍率最低为克制。",
		"The next two moves use at least the advantaged multiplier."
	],
	[
		"forge-sparkmite",
		"火花追击",
		"Spark Follow-up",
		"四连编译追加一次小型打击。",
		"A 4+ Compile match adds a small follow-up hit.",
		"火花跃迁",
		"Spark Hop",
		"连续造成三次伤害。",
		"Deals three consecutive hits."
	],
	[
		"forge-rivetclaw",
		"铆钉蓄势",
		"Rivet Charge",
		"受击后强化下一次编译伤害。",
		"Taking damage strengthens the next Compile hit.",
		"铆钉回弹",
		"Rivet Rebound",
		"获得防护层并准备一次反击。",
		"Gains a guard layer and prepares a counterattack."
	],
	[
		"forge-solderling",
		"熔线共燃",
		"Solder Burn",
		"编译与其他颜色连锁时施加灼烧。",
		"Compile chained with another color applies Burn.",
		"熔线桥",
		"Solder Bridge",
		"将 4 格转为编译并施加灼烧。",
		"Converts 4 tiles to Compile and applies Burn."
	],
	[
		"forge-anvilback",
		"重砧破层",
		"Anvil Break",
		"五连编译额外破除防火墙。",
		"A 5+ Compile match breaks extra firewall.",
		"落砧",
		"Falling Anvil",
		"重击并破除最多 3 层防火墙。",
		"Strikes heavily and breaks up to 3 firewall layers."
	],
	[
		"forge-kiln-colossus",
		"炉温递增",
		"Rising Heat",
		"编译连锁会强化灼烧。",
		"Compile cascades increase Burn pressure.",
		"炉心过载",
		"Kiln Overload",
		"清除全部编译色块并造成伤害。",
		"Clears every Compile tile and deals damage."
	],
	[
		"relay-pingfly",
		"抢先握手",
		"Early Handshake",
		"进入行动位时获得 2 指令值。",
		"Gains 2 command points when entering the active slot.",
		"信标握手",
		"Beacon Handshake",
		"自动生成并结算一个网络三连。",
		"Creates and resolves a Network match."
	],
	[
		"relay-duplex-hare",
		"双相节拍",
		"Duplex Rhythm",
		"奇数轮强化伤害，偶数轮强化指令值。",
		"Odd rounds boost damage; even rounds boost command points.",
		"双相切换",
		"Duplex Switch",
		"下一次消除的首段伤害重复一次。",
		"Repeats the first damage segment of the next move."
	],
	[
		"relay-routeray",
		"软路由",
		"Soft Route",
		"每阶段首次网络消除会整理一行色块。",
		"The first Network match each stage tidies one row.",
		"路径重排",
		"Route Reroute",
		"重新布置棋盘并保留特殊色块。",
		"Rearranges the board while preserving special tiles."
	],
	[
		"relay-forktail",
		"分岔连击",
		"Fork Combo",
		"连锁获得额外倍率。",
		"Cascades gain additional combo power.",
		"分岔回返",
		"Fork Return",
		"下一次消除会追加一次回返伤害。",
		"The next match adds a returning hit."
	],
	[
		"relay-mesh-jelly",
		"群网供能",
		"Mesh Supply",
		"网络充能时也为其他队员提供少量指令值。",
		"Network charging also supplies other allies.",
		"群网共振",
		"Mesh Resonance",
		"全队获得指令值并将 3 格转为网络。",
		"Grants squad command points and converts 3 tiles to Network."
	],
	[
		"aegis-veribud",
		"校验露珠",
		"Verify Dew",
		"每阶段首次防护消除修复共享运行值。",
		"The first Guard match each stage repairs shared runtime.",
		"完整校验",
		"Full Verify",
		"净化并修复队伍共享运行值。",
		"Cleanses effects and repairs shared squad runtime."
	],
	[
		"aegis-loop-tortoise",
		"环路甲壳",
		"Loop Shell",
		"进入行动位时为队伍提供防护层。",
		"Entering the active slot adds a squad guard layer.",
		"环路守护",
		"Loop Guard",
		"为队伍共享运行值提供防护层。",
		"Guards the shared squad runtime pool."
	],
	[
		"aegis-anchorbee",
		"特殊锚点",
		"Special Anchor",
		"触发特殊色块时为队伍提供防护层。",
		"Triggering a special tile adds a squad guard layer.",
		"定锚力场",
		"Anchor Field",
		"延迟敌方并保护棋盘一阶段。",
		"Delays the enemy and protects the board for one stage."
	],
	[
		"aegis-steady-ram",
		"逆势稳态",
		"Resisted Steady",
		"抵抗色块造成伤害时生成防护层。",
		"Resisted tile damage creates a guard layer.",
		"稳态反弹",
		"Steady Rebound",
		"获得防护层并造成伤害。",
		"Gains a guard layer and deals damage."
	],
	[
		"aegis-dawnguard",
		"曙光保全",
		"Dawn Safeguard",
		"每场战斗首次共享运行值归零时会被保全。",
		"Prevents the first shared-runtime knockout each battle.",
		"曙光重启",
		"Dawn Restart",
		"修复并保护队伍共享运行值。",
		"Repairs and shields shared squad runtime."
	],
	[
		"glitch-null-nibbler",
		"空值侵蚀",
		"Null Erosion",
		"异常消除会额外破除防火墙或防护层。",
		"Glitch matches erode extra firewall or guard layers.",
		"空值啃噬",
		"Null Bite",
		"移除防护并造成伤害。",
		"Removes protection and deals damage."
	],
	[
		"glitch-stack-weaver",
		"栈裂增殖",
		"Stack Growth",
		"二层连锁后生成一个异常色块。",
		"A 2+ cascade creates a Glitch tile.",
		"断栈蛛网",
		"Broken Stack Web",
		"将 5 格转为异常并施加标记。",
		"Converts 5 tiles to Glitch and applies Mark."
	],
	[
		"glitch-lagtoad",
		"超时缓冲",
		"Timeout Buffer",
		"共享运行值首次低于一半时延迟敌方。",
		"Delays the enemy the first time shared runtime drops below half.",
		"延迟回击",
		"Delayed Payback",
		"造成伤害并延迟敌方。",
		"Deals damage and delays the enemy."
	],
	[
		"glitch-crashfox",
		"红线爆发",
		"Redline Burst",
		"共享运行值较低时显著提高伤害。",
		"Deals substantially more damage at low shared runtime.",
		"崩溃闪焰",
		"Crash Flare",
		"造成高额伤害并损失少量共享运行值。",
		"Deals heavy damage at a small shared-runtime cost."
	],
	[
		"glitch-overflow-maw",
		"指令溢流",
		"Command Overflow",
		"满指令值后的少量溢出强化主动技能。",
		"Limited command overflow strengthens the active skill.",
		"边界溢流",
		"Boundary Overflow",
		"吞噬异常色块并转化为伤害。",
		"Consumes Glitch tiles and converts them into damage."
	]
]);
const CREATURE_SKILLS = Object.freeze(ROWS.map((row) => Object.freeze({
	creatureId: row[0],
	energyCost: 12,
	passiveNameZh: row[1],
	passiveNameEn: row[2],
	passiveDescriptionZh: row[3],
	passiveDescriptionEn: row[4],
	activeNameZh: row[5],
	activeNameEn: row[6],
	activeDescriptionZh: row[7],
	activeDescriptionEn: row[8]
})));
const BY_CREATURE_ID$1 = new Map(CREATURE_SKILLS.map((skill) => [skill.creatureId, skill]));
function skillByCreatureId(creatureId) {
	return BY_CREATURE_ID$1.get(creatureId);
}
//#endregion
//#region lib/types/content-packs/core/src/mechanics.js
function mechanic(trigger, opcode, params) {
	return params === void 0 ? {
		trigger,
		opcode
	} : {
		trigger,
		opcode,
		params
	};
}
function creature(creatureId, bindings) {
	return {
		creatureId,
		bindings
	};
}
/** The declarative mechanics that reproduce the 0.3.2 core roster. */
const CORE_CREATURE_MECHANICS = Object.freeze([
	creature("lumen-indeximp", [
		mechanic("match:after", "match.add-mark", {
			ecology: "lumen",
			minCount: 1,
			once: "round",
			amount: 1,
			maximum: 3
		}),
		mechanic("skill:cast", "damage.raw-hit", { power: .8 }),
		mechanic("skill:cast", "mark.add", {
			amount: 1,
			maximum: 3
		}),
		mechanic("skill:cast", "tiles.convert", {
			ecology: "lumen",
			count: 3,
			resolve: true
		})
	]),
	creature("lumen-foliomoth", [
		mechanic("match:after", "match.heal", {
			ecology: "lumen",
			minCount: 4,
			basis: "member-max-hp",
			ratio: .03
		}),
		mechanic("skill:cast", "heal.party", {
			basis: "party-max-hp",
			ratio: .08
		}),
		mechanic("skill:cast", "shield.party", {
			basis: "member-max-hp",
			ratio: .1
		})
	]),
	creature("lumen-lensel", [mechanic("match:after", "match.grant-energy-on-cascade", {
		minChain: 2,
		amount: 2,
		once: "stage"
	}), mechanic("skill:cast", "tiles.convert", {
		ecology: "counter",
		count: 4,
		resolve: true
	})]),
	creature("lumen-echocoil", [mechanic("match:after", "match.echo-damage", {
		minChain: 2,
		factor: .3,
		once: "round"
	}), mechanic("skill:cast", "damage.replay", {
		factor: .75,
		minimum: "member-attack"
	})]),
	creature("lumen-atlashart", [
		mechanic("damage:modify", "damage.first-match-floor", {
			minimum: 1.15,
			chain: 1,
			once: "round"
		}),
		mechanic("match:after", "match.consume-first-match", {
			chain: 1,
			once: "round"
		}),
		mechanic("skill:cast", "affinity.floor", { actions: 2 })
	]),
	creature("forge-sparkmite", [mechanic("match:after", "match.raw-hit", {
		ecology: "forge",
		minCount: 4,
		power: .25
	}), mechanic("skill:cast", "damage.raw-hit", {
		power: .55,
		hits: 3
	})]),
	creature("forge-rivetclaw", [
		mechanic("match:after", "match.consume-counter", { ecology: "forge" }),
		mechanic("damage:taken", "damage.arm-counter", { power: .8 }),
		mechanic("skill:cast", "shield.party", {
			basis: "member-max-hp",
			ratio: .18
		}),
		mechanic("skill:cast", "counter.arm", { power: .8 })
	]),
	creature("forge-solderling", [
		mechanic("match:after", "match.add-burn-mixed", {
			ecology: "forge",
			maximum: 4.2
		}),
		mechanic("skill:cast", "tiles.convert", {
			ecology: "forge",
			count: 4,
			resolve: false
		}),
		mechanic("skill:cast", "burn.add", {
			amount: 1,
			scaled: true,
			maximum: 4.2
		}),
		mechanic("skill:cast", "tiles.resolve")
	]),
	creature("forge-anvilback", [
		mechanic("match:after", "match.break-armor", {
			ecology: "forge",
			minCount: 5,
			amount: 1
		}),
		mechanic("skill:cast", "damage.raw-hit", { power: 1.8 }),
		mechanic("skill:cast", "armor.break", { amount: 3 })
	]),
	creature("forge-kiln-colossus", [mechanic("match:after", "match.add-burn-cascade", {
		ecology: "forge",
		minChain: 2,
		amount: .25,
		maximum: 4.2
	}), mechanic("skill:cast", "tiles.clear", {
		ecology: "forge",
		count: 36,
		resolve: true
	})]),
	creature("relay-pingfly", [mechanic("stage:enter", "stage.grant-energy", { amount: 2 }), mechanic("skill:cast", "tiles.guaranteed-match", {
		ecology: "relay",
		resolve: true
	})]),
	creature("relay-duplex-hare", [
		mechanic("damage:modify", "damage.round-parity-multiplier", {
			parity: "odd",
			multiplier: 1.1
		}),
		mechanic("match:after", "match.grant-energy-round-parity", {
			ecology: "relay",
			parity: "even",
			amount: 1
		}),
		mechanic("skill:cast", "repeat.arm", {
			power: .6,
			scaled: true,
			maximum: .9
		})
	]),
	creature("relay-routeray", [mechanic("match:after", "match.convert-one", {
		ecology: "relay",
		minCount: 1,
		once: "stage"
	}), mechanic("skill:cast", "tiles.reshuffle")]),
	creature("relay-forktail", [mechanic("damage:modify", "damage.combo-per-cascade", { amount: .04 }), mechanic("skill:cast", "repeat.arm", {
		power: .7,
		scaled: true,
		maximum: .95
	})]),
	creature("relay-mesh-jelly", [
		mechanic("energy:after-distribute", "energy.share", {
			ecology: "relay",
			ratio: .25,
			maximumSource: 8,
			excludeEcology: true
		}),
		mechanic("skill:cast", "energy.party", {
			amount: 2,
			scaled: true
		}),
		mechanic("skill:cast", "tiles.convert", {
			ecology: "relay",
			count: 3,
			resolve: true
		})
	]),
	creature("aegis-veribud", [mechanic("match:after", "match.heal", {
		ecology: "aegis",
		minCount: 1,
		basis: "active-max-hp",
		ratio: .02,
		once: "stage"
	}), mechanic("skill:cast", "heal.party", {
		basis: "party-max-hp",
		ratio: .1
	})]),
	creature("aegis-loop-tortoise", [mechanic("stage:enter", "stage.shield", {
		basis: "member-max-hp",
		ratio: .08
	}), mechanic("skill:cast", "shield.party", {
		basis: "party-max-hp",
		ratio: .2
	})]),
	creature("aegis-anchorbee", [
		mechanic("match:after", "match.shield-on-special", {
			basis: "active-max-hp",
			ratio: .04
		}),
		mechanic("skill:cast", "enemy.delay", { actions: 1 }),
		mechanic("skill:cast", "board.lock", { actions: 3 })
	]),
	creature("aegis-steady-ram", [
		mechanic("match:after", "match.shield-on-resisted", { ratio: .2 }),
		mechanic("skill:cast", "shield.party", {
			basis: "member-max-hp",
			ratio: .1
		}),
		mechanic("skill:cast", "damage.raw-hit", { power: 1.4 })
	]),
	creature("aegis-dawnguard", [
		mechanic("defeat:before", "defeat.prevent", {
			hp: 1,
			shieldRatio: .1,
			once: "battle"
		}),
		mechanic("skill:cast", "heal.party", {
			basis: "party-max-hp",
			ratio: .16
		}),
		mechanic("skill:cast", "shield.party", {
			basis: "party-max-hp",
			ratio: .08
		})
	]),
	creature("glitch-null-nibbler", [
		mechanic("match:after", "match.erode-protection", {
			ecology: "glitch",
			armor: 1,
			shieldAttackRatio: 1
		}),
		mechanic("skill:cast", "shield.enemy-clear"),
		mechanic("skill:cast", "armor.break", { amount: 2 }),
		mechanic("skill:cast", "damage.raw-hit", { power: 1 })
	]),
	creature("glitch-stack-weaver", [
		mechanic("match:after", "match.convert-one", {
			ecology: "glitch",
			minChain: 2
		}),
		mechanic("skill:cast", "tiles.convert", {
			ecology: "glitch",
			count: 5,
			resolve: false
		}),
		mechanic("skill:cast", "mark.add", {
			amount: 1,
			maximum: 3
		}),
		mechanic("skill:cast", "tiles.resolve")
	]),
	creature("glitch-lagtoad", [
		mechanic("runtime:threshold", "runtime.delay-enemy", {
			belowRatio: .5,
			actions: 1,
			once: "battle"
		}),
		mechanic("skill:cast", "damage.raw-hit", { power: 1.1 }),
		mechanic("skill:cast", "enemy.delay", { actions: 1 })
	]),
	creature("glitch-crashfox", [
		mechanic("damage:modify", "damage.low-runtime-multiplier", {
			belowRatio: .5,
			multiplier: 1.25
		}),
		mechanic("skill:cast", "damage.raw-hit", { power: 2.2 }),
		mechanic("skill:cast", "runtime.self-damage", {
			basis: "member-hp",
			ratio: .08,
			minimumRemaining: 1
		})
	]),
	creature("glitch-overflow-maw", [
		mechanic("energy:overflow", "energy.store-overflow", { maximum: 5 }),
		mechanic("skill:before", "skill.consume-overflow", { multiplierPerPoint: .03 }),
		mechanic("skill:cast", "tiles.clear", {
			ecology: "glitch",
			count: 12,
			resolve: true
		})
	])
]);
const BY_CREATURE_ID = new Map(CORE_CREATURE_MECHANICS.map((row) => [row.creatureId, row]));
function mechanicsByCreatureId(creatureId) {
	return BY_CREATURE_ID.get(creatureId);
}
//#endregion
//#region lib/types/content-packs/core/src/companions.js
const CORE_COMPANIONS = { "relay-mesh-jelly": {
	greeting: {
		zhCN: "你回来啦……我把最亮的那颗星，留在你的位置上了。",
		en: "You are back… I saved the brightest star for your seat."
	},
	lines: [
		{
			zhCN: "刚才数到第几颗了……唔，你一来，我就忘记了。",
			en: "How many stars had I counted? Oh… you arrived, and I forgot."
		},
		{
			zhCN: "这颗不是泡泡，是装着晚安的小星星。轻一点哦。",
			en: "That is not a bubble. It is a little star holding a goodnight. Be gentle."
		},
		{
			zhCN: "今天的事情很多吗？可以先在这里，什么都不做。",
			en: "Was today a busy day? You can sit here for a while, with nothing to do."
		},
		{
			zhCN: "水流会绕很远的路，但我记得回到你身边的方向。",
			en: "The currents take long detours, but I remember the way back to you."
		}
	],
	stories: [
		{
			title: {
				zhCN: "第一颗留给你的星",
				en: "A Star Saved for You"
			},
			body: {
				zhCN: "你第一次走进休息室时，群星水母正对着一团光发呆。光团从她指尖滑落，慢悠悠地停在空椅子上。\n\n“它是不是迷路了？”你问。\n\n她摇摇头，认真地把椅子又往窗边挪了一点。“没有。这是你的座位……我只是还不知道，你什么时候会来。”\n\n她说完便低下头，假装继续数星星。那团小小的光，却一直亮着。",
				en: "On your first visit to the lounge, Mesh Jelly was staring at a ball of light. It slipped from her fingertips and settled on an empty chair.\n\n“Is it lost?” you asked.\n\nShe shook her head and moved the chair closer to the window. “No. This is your seat… I just did not know when you would arrive.”\n\nShe looked down and pretended to count the stars again. The little light stayed on."
			}
		},
		{
			title: {
				zhCN: "没有寄出的晚安",
				en: "An Unsent Goodnight"
			},
			body: {
				zhCN: "几次相伴之后，你发现她总在收集那些即将熄灭的光点。她把它们藏在伞缘，像一串不肯睡去的露珠。\n\n“都是没有送到的消息。”她轻声说，“有的只有一句晚安。”\n\n你陪她把光点一颗颗放回水流。最后只剩一颗，她却迟迟不肯松手。\n\n“这一颗呢？”\n\n“这一颗……现在可以当面说了。”她抬起眼睛，“晚安。明天也来坐坐吧。”",
				en: "After several visits, you noticed her collecting lights that were about to fade. She kept them along the edge of her bell, like drops of sleepless dew.\n\n“They are messages that never arrived,” she said. “Some only say goodnight.”\n\nTogether, you returned them to the current. She held on to the last one.\n\n“And that one?”\n\n“That one… I can say in person now.” She looked up. “Goodnight. Come sit with me tomorrow, too.”"
			}
		},
		{
			title: {
				zhCN: "归航的坐标",
				en: "Coordinates for Home"
			},
			body: {
				zhCN: "窗外的星流忽然暗了下来。群星水母闭着眼睛，却准确地接住了飘向你的每一颗光。\n\n你问她，是不是终于记住了所有星星的位置。\n\n“没有呀。”她笑得有点不好意思，“我还是会数错。”\n\n她牵起一条细细的光线，将一端系在你的椅背，另一端留在指尖。\n\n“只是现在，就算走得很远，我也知道该往哪里回来。”\n\n房间重新亮起来时，你发现那颗最初的小星星，已经有了两道并排的影子。",
				en: "The current of stars outside the window dimmed. With her eyes closed, Mesh Jelly still caught every light drifting toward you.\n\nYou asked whether she had finally memorized all their positions.\n\n“No,” she said with a shy smile. “I still lose count.”\n\nShe tied one end of a fine thread of light to your chair and kept the other at her fingertips.\n\n“But now, however far I wander, I know where to return.”\n\nWhen the room brightened again, the first little star cast two shadows, side by side."
			}
		}
	]
} };
//#endregion
//#region lib/types/content-packs/core/src/bosses.js
const FORK_QUEEN = {
	number: 26,
	id: "relay-fork-queen",
	name: {
		zhCN: "分岔女王",
		en: "Fork Queen"
	},
	ecology: "relay",
	rarity: "apex",
	combatRole: "expedition-recruit",
	baseCaptureRate: .001,
	signatureProtocol: "branch-relay",
	sprite: "creature:relay-fork-queen:sprite",
	stats: {
		hp: 1510,
		attack: 196,
		defense: 142,
		speed: 126
	},
	companion: {
		greeting: {
			zhCN: "今天想走哪条路？这次，我听你的。",
			en: "Which path today? This time, you lead."
		},
		lines: [
			{
				zhCN: "同时听见不同的声音，也是一种秩序。",
				en: "Different voices can be a kind of order, too."
			},
			{
				zhCN: "不必每条路都通向胜利。回来的人，总能再选一次。",
				en: "Not every path ends in victory. Those who return can choose again."
			},
			{
				zhCN: "你给那座断桥起名字了吗？……那就叫明天吧。",
				en: "Did you name the broken bridge? ...Let us call it Tomorrow."
			},
			{
				zhCN: "接力的重点不是跑得最快，是把下一棒交出去。",
				en: "A relay is not about running fastest. It is about passing the baton."
			}
		],
		stories: [
			{
				title: {
					zhCN: "唯一答案",
					en: "The Only Answer"
				},
				body: {
					zhCN: "母巢曾有数不清的出口。每当两条路线产生分歧，女王就关上一扇门。她以为，只要所有信号走向同一个答案，就不会再有人迷失。\n\n你来到最后的桥前，却先去修理了一条通向远处的支路。“这条路不通向我。”她说。\n\n“但可能有人要回去。”\n\n她抬起指挥杖，停了很久。那一天，母巢第一次没有封闭偏离的信号。",
					en: "The hive once had countless exits. Whenever two paths disagreed, its queen closed a door. One answer, she believed, would keep everyone from getting lost.\n\nAt the final bridge, you repaired a distant branch first. “That path does not lead to me,” she said.\n\n“Someone may need it to go home.”\n\nHer baton stayed raised for a long time. That day, the hive left a divergent signal alone."
				}
			},
			{
				title: {
					zhCN: "交出去的指挥杖",
					en: "Passing the Baton"
				},
				body: {
					zhCN: "维修站只剩下一枚信标。她画好了最安全的路线，却看见队员指向另一端：那里还有一座没来得及修复的桥。\n\n过去，她会直接否决。现在，她把指挥杖交到了你手里。\n\n队伍没有按最快的顺序返回，但每个人都带回了一块完整的桥板。她把旧路线收进抽屉，在新图上给每个人留下一条不同颜色的线。\n\n“原来信任不是不出错。”她轻声说，“是允许别人把路补完。”",
					en: "Only one beacon remained at the repair station. She had drawn the safest route, but an ally pointed to a bridge still waiting for repairs.\n\nOnce, she would have refused. Now she placed the baton in your hand.\n\nThe squad did not return in the fastest order. Each member brought back an intact plank. She put her old map away and drew a differently colored line for everyone.\n\n“Trust is not the absence of mistakes,” she said. “It is letting someone else complete the path.”"
				}
			},
			{
				title: {
					zhCN: "没有终点的同行",
					en: "A Journey Without an Endpoint"
				},
				body: {
					zhCN: "母巢的核心重新启动时，所有分支都在等待她归位。她摘下王冠，放在两座桥之间。光线沿着冠饰分成三路，各自延伸，谁也没有命令谁。\n\n“它们已经能自己选择了。”\n\n你问她接下来要去哪里。她望着休息室没有画完的地图，第一次笑得没有任何预演。\n\n“去看看那些没有标准答案的地方。还有——你的队伍，下一棒轮到我了吗？”",
					en: "When the hive restarted, every branch waited for its queen. She set her crown between two bridges. Its light split three ways, each choosing its own course.\n\n“They can decide for themselves now.”\n\nYou asked where she would go next. Looking at the unfinished lounge map, she smiled without rehearsing it first.\n\n“Somewhere without a standard answer. And... is it my turn to take the next leg of your relay?”"
				}
			}
		]
	}
};
const FORK_QUEEN_SKILL = {
	creatureId: FORK_QUEEN.id,
	energyCost: 12,
	passive: {
		name: {
			zhCN: "分支交棒",
			en: "Branch Handoff"
		},
		description: {
			zhCN: "自己行动阶段开始时，下一位队员获得 2 指令值。",
			en: "At the start of her stage, the next ally gains 2 command."
		}
	},
	active: {
		name: {
			zhCN: "多路共识",
			en: "Many-path Consensus"
		},
		description: {
			zhCN: "将 3 格转为网络；全队补充 1 指令值并获得 8% 共享运行值防护。",
			en: "Convert 3 panels to Network, grant all allies 1 command and guard equal to 8% shared runtime."
		}
	}
};
const FORK_QUEEN_MECHANICS = {
	creatureId: FORK_QUEEN.id,
	bindings: [
		{
			trigger: "stage:enter",
			opcode: "stage.relay-next",
			params: { amount: 2 }
		},
		{
			trigger: "skill:cast",
			opcode: "tiles.convert",
			params: {
				ecology: "relay",
				count: 3,
				resolve: false
			}
		},
		{
			trigger: "skill:cast",
			opcode: "energy.party",
			params: {
				amount: 1,
				scaled: false
			}
		},
		{
			trigger: "skill:cast",
			opcode: "shield.party",
			params: {
				basis: "party-max-hp",
				ratio: .08
			}
		},
		{
			trigger: "skill:cast",
			opcode: "tiles.resolve"
		}
	]
};
const boss = (number, id, zhCN, en, ecology, hp, attack, defense, speed) => ({
	number,
	id,
	name: {
		zhCN,
		en
	},
	ecology,
	rarity: "apex",
	combatRole: "expedition-recruit",
	baseCaptureRate: .001,
	signatureProtocol: id,
	sprite: `creature:${id}:sprite`,
	stats: {
		hp,
		attack,
		defense,
		speed
	}
});
const EXPEDITION_CREATURES = [
	FORK_QUEEN,
	boss(27, "forge-dragon-empress", "熔序龙姬", "Dragon Empress", "forge", 1520, 210, 138, 118),
	boss(28, "lumen-mirror-dreamer", "镜海织梦者", "Mirror Dreamer", "lumen", 1410, 198, 134, 144),
	boss(29, "aegis-chain-warden", "断链守望者", "Chain Warden", "aegis", 1620, 185, 158, 110),
	boss(30, "glitch-zero-hour", "零时巡游者", "Zero Hour", "glitch", 1400, 204, 130, 150),
	boss(31, "glitch-reset-cantor", "归零咏者", "Reset Cantor", "glitch", 1480, 192, 146, 132)
];
const skill = (creatureId, passiveZh, passiveEn, descZh, descEn, activeZh, activeEn, castZh, castEn) => ({
	creatureId,
	energyCost: 12,
	passive: {
		name: {
			zhCN: passiveZh,
			en: passiveEn
		},
		description: {
			zhCN: descZh,
			en: descEn
		}
	},
	active: {
		name: {
			zhCN: activeZh,
			en: activeEn
		},
		description: {
			zhCN: castZh,
			en: castEn
		}
	}
});
const EXPEDITION_SKILLS = [
	FORK_QUEEN_SKILL,
	skill("forge-dragon-empress", "炉心余烬", "Ember Core", "消除至少 4 枚编译色块，追加 25% 算力打击。", "Match at least four Compile panels for a 25% attack hit.", "龙焰编译", "Dragon Compile", "造成 160% 算力打击，削减 2 层护甲，将 2 格转为编译。", "Deal a 160% attack hit, break two armor layers and convert two panels to Compile."),
	skill("lumen-mirror-dreamer", "梦境回声", "Dream Echo", "两段及以上连锁获得 1 指令值，每行动阶段一次。", "A cascade of two or more grants one command, once per stage.", "镜像重演", "Mirror Replay", "重演上次伤害的 60%（至少自身算力的 60%），并将 3 格转为智算。", "Replay 60% of the last hit (at least 60% of her attack) and convert three panels to Compute."),
	skill("aegis-chain-warden", "守门誓约", "Gate Oath", "自身行动阶段开始时，获得自身最大运行值 10% 的共享防护。", "Her stage begins with shared guard equal to 10% of her maximum runtime.", "解除封锁", "Open the Gate", "修复共享运行值的 6%，并获得最大共享运行值 14% 的防护。", "Repair 6% of maximum shared runtime and gain 14% shared guard."),
	skill("glitch-zero-hour", "时隙潜行", "Time Slip", "共享运行值低于一半时延后敌方行动一次，每战一次。", "Below half shared runtime, delay the enemy once per battle.", "零秒突袭", "Zero-second Strike", "造成 100% 算力打击，并延后敌方行动一次。", "Deal a 100% attack hit and delay the enemy once."),
	skill("glitch-reset-cantor", "消噪和声", "Noise Cancel", "消除异常色块时侵蚀 1 层护甲；无护甲时削减自身算力 50% 的敌方防护。", "Matching Glitch erodes one armor layer, or guard equal to 50% of her attack if no armor remains.", "系统重奏", "System Reprise", "清除敌方防护，削减 1 层护甲，将 4 格转为异常。", "Clear enemy guard, break one armor layer and convert four panels to Glitch.")
];
const EXPEDITION_MECHANICS = [
	FORK_QUEEN_MECHANICS,
	{
		creatureId: "forge-dragon-empress",
		bindings: [
			{
				trigger: "match:after",
				opcode: "match.raw-hit",
				params: {
					ecology: "forge",
					minCount: 4,
					power: .25
				}
			},
			{
				trigger: "skill:cast",
				opcode: "damage.raw-hit",
				params: { power: 1.6 }
			},
			{
				trigger: "skill:cast",
				opcode: "armor.break",
				params: { amount: 2 }
			},
			{
				trigger: "skill:cast",
				opcode: "tiles.convert",
				params: {
					ecology: "forge",
					count: 2,
					resolve: true
				}
			}
		]
	},
	{
		creatureId: "lumen-mirror-dreamer",
		bindings: [
			{
				trigger: "match:after",
				opcode: "match.grant-energy-on-cascade",
				params: {
					minChain: 2,
					amount: 1,
					once: "stage"
				}
			},
			{
				trigger: "skill:cast",
				opcode: "damage.replay",
				params: {
					factor: .6,
					minimum: "member-attack"
				}
			},
			{
				trigger: "skill:cast",
				opcode: "tiles.convert",
				params: {
					ecology: "lumen",
					count: 3,
					resolve: true
				}
			}
		]
	},
	{
		creatureId: "aegis-chain-warden",
		bindings: [
			{
				trigger: "stage:enter",
				opcode: "stage.shield",
				params: {
					basis: "member-max-hp",
					ratio: .1
				}
			},
			{
				trigger: "skill:cast",
				opcode: "shield.party",
				params: {
					basis: "party-max-hp",
					ratio: .14
				}
			},
			{
				trigger: "skill:cast",
				opcode: "heal.party",
				params: {
					basis: "party-max-hp",
					ratio: .06
				}
			}
		]
	},
	{
		creatureId: "glitch-zero-hour",
		bindings: [
			{
				trigger: "runtime:threshold",
				opcode: "runtime.delay-enemy",
				params: {
					belowRatio: .5,
					actions: 1,
					once: "battle"
				}
			},
			{
				trigger: "skill:cast",
				opcode: "damage.raw-hit",
				params: { power: 1 }
			},
			{
				trigger: "skill:cast",
				opcode: "enemy.delay",
				params: { actions: 1 }
			}
		]
	},
	{
		creatureId: "glitch-reset-cantor",
		bindings: [
			{
				trigger: "match:after",
				opcode: "match.erode-protection",
				params: {
					ecology: "glitch",
					armor: 1,
					shieldAttackRatio: .5
				}
			},
			{
				trigger: "skill:cast",
				opcode: "shield.enemy-clear"
			},
			{
				trigger: "skill:cast",
				opcode: "armor.break",
				params: { amount: 1 }
			},
			{
				trigger: "skill:cast",
				opcode: "tiles.convert",
				params: {
					ecology: "glitch",
					count: 4,
					resolve: true
				}
			}
		]
	}
];
//#endregion
//#region lib/types/content-packs/core/src/index.js
const ECOLOGY_NAMES = {
	lumen: {
		zhCN: "智算",
		en: "Compute"
	},
	forge: {
		zhCN: "编译",
		en: "Compile"
	},
	relay: {
		zhCN: "网络",
		en: "Network"
	},
	aegis: {
		zhCN: "防护",
		en: "Guard"
	},
	glitch: {
		zhCN: "异常",
		en: "Glitch"
	}
};
const ECOLOGY_ROLES = {
	lumen: "sync",
	forge: "overclock",
	relay: "guard",
	aegis: "repair",
	glitch: "breach"
};
const QUALITY_NAMES = {
	pebble: {
		zhCN: "砾石",
		en: "Pebble"
	},
	pulse: {
		zhCN: "脉冲",
		en: "Pulse"
	},
	prism: {
		zhCN: "棱镜",
		en: "Prism"
	},
	nova: {
		zhCN: "新星",
		en: "Nova"
	},
	origin: {
		zhCN: "源初",
		en: "Origin"
	}
};
const CORE_CONTENT_PACK = defineContentPack({
	manifest: {
		id: "@nath-vikky/codekin-core",
		version: "0.3.9-rc.1",
		engine: ">=0.3.9-rc.1 <0.4.0",
		contentApi: 1
	},
	ecologies: TRACE_ECOLOGIES.map((id, order) => ({
		id,
		order,
		name: ECOLOGY_NAMES[id],
		tileRole: ECOLOGY_ROLES[id]
	})),
	qualities: CAPTURE_CORE_QUALITIES.map((id, order) => ({
		id,
		order,
		name: QUALITY_NAMES[id]
	})),
	creatures: [...CREATURE_CATALOG.map((creature) => ({
		number: creature.number,
		id: creature.id,
		name: {
			zhCN: creature.nameZh,
			en: creature.nameEn
		},
		ecology: creature.ecology,
		rarity: creature.rarity,
		combatRole: creature.combatRole,
		baseCaptureRate: creature.baseCaptureRate,
		signatureProtocol: creature.signatureProtocol,
		sprite: `creature:${creature.id}:sprite`,
		stats: creature.stats,
		...CORE_COMPANIONS[creature.id] === void 0 ? {} : { companion: CORE_COMPANIONS[creature.id] }
	})), ...EXPEDITION_CREATURES],
	skills: [...CREATURE_SKILLS.map((skill) => ({
		creatureId: skill.creatureId,
		energyCost: skill.energyCost,
		passive: {
			name: {
				zhCN: skill.passiveNameZh,
				en: skill.passiveNameEn
			},
			description: {
				zhCN: skill.passiveDescriptionZh,
				en: skill.passiveDescriptionEn
			}
		},
		active: {
			name: {
				zhCN: skill.activeNameZh,
				en: skill.activeNameEn
			},
			description: {
				zhCN: skill.activeDescriptionZh,
				en: skill.activeDescriptionEn
			}
		}
	})), ...EXPEDITION_SKILLS],
	mechanics: [...CORE_CREATURE_MECHANICS, ...EXPEDITION_MECHANICS],
	encounters: { variants: SIGNAL_VARIANT_CREATURE_IDS },
	starters: [...STARTER_CREATURE_IDS],
	tower: { rotation: CREATURE_CATALOG.map((creature) => creature.id) },
	assets: [
		...EXPEDITION_CREATURES.map((boss) => ({
			key: boss.sprite,
			path: `bosses/${boss.id}.webp`,
			mime: "image/webp",
			kind: "creature"
		})),
		{
			key: "launcher:default",
			path: "sprites/codekin-launcher-v2.webp",
			mime: "image/webp",
			kind: "launcher"
		},
		...CREATURE_CATALOG.map((creature) => ({
			key: `creature:${creature.id}:sprite`,
			path: `sprites/${creature.id}.webp`,
			mime: "image/webp",
			kind: "creature"
		})),
		...CREATURE_CATALOG.map((creature) => ({
			key: `creature:${creature.id}:evolved`,
			path: `evolved/${creature.id}.webp`,
			mime: "image/webp",
			kind: "creature"
		})),
		...CREATURE_CATALOG.filter((creature) => creature.rarity === "apex").map((creature) => ({
			key: `creature:${creature.id}:ultimate`,
			path: `ultimate/${creature.id}-theme.webp`,
			mime: "image/webp",
			kind: "creature"
		})),
		...CREATURE_CATALOG.filter((creature) => creature.rarity === "apex").map((creature) => ({
			key: `creature:${creature.id}:ultimate-silhouette`,
			path: `ultimate/${creature.id}-silhouette.webp`,
			mime: "image/webp",
			kind: "creature"
		}))
	]
});
//#endregion
export { QUALITY_SKILL_MULTIPLIERS as a, CORE_DROP_WEIGHTS as c, STARTER_CREATURE_IDS as d, creatureById as f, CREATURE_SKILLS as i, CREATURE_CATALOG as l, creaturesInEcology as m, CORE_CREATURE_MECHANICS as n, skillByCreatureId as o, creatureIdForSignalVariant as p, mechanicsByCreatureId as r, CORE_CAPTURE_MULTIPLIERS as s, CORE_CONTENT_PACK as t, SIGNAL_VARIANT_CREATURE_IDS as u };

//# sourceMappingURL=src-pIZwhj9M.js.map