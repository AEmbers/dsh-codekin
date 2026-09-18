import type { ContentCreatureDefinition, ContentSkillDefinition, ContentCreatureMechanicsDefinition } from '../../../packages/content-sdk/src/types.ts'

export const FORK_QUEEN: ContentCreatureDefinition = {
  number: 26, id: 'relay-fork-queen', name: { zhCN: '分岔女王', en: 'Fork Queen' }, ecology: 'relay', rarity: 'apex',
  combatRole: 'expedition-recruit', baseCaptureRate: 0.001, signatureProtocol: 'branch-relay', sprite: 'creature:relay-fork-queen:sprite',
  stats: { hp: 1510, attack: 196, defense: 142, speed: 126 },
  companion: {
    greeting: { zhCN: '今天想走哪条路？这次，我听你的。', en: 'Which path today? This time, you lead.' },
    lines: [
      { zhCN: '同时听见不同的声音，也是一种秩序。', en: 'Different voices can be a kind of order, too.' },
      { zhCN: '不必每条路都通向胜利。回来的人，总能再选一次。', en: 'Not every path ends in victory. Those who return can choose again.' },
      { zhCN: '你给那座断桥起名字了吗？……那就叫明天吧。', en: 'Did you name the broken bridge? ...Let us call it Tomorrow.' },
      { zhCN: '接力的重点不是跑得最快，是把下一棒交出去。', en: 'A relay is not about running fastest. It is about passing the baton.' },
    ],
    stories: [
      { title: { zhCN: '唯一答案', en: 'The Only Answer' }, body: {
        zhCN: '母巢曾有数不清的出口。每当两条路线产生分歧，女王就关上一扇门。她以为，只要所有信号走向同一个答案，就不会再有人迷失。\n\n你来到最后的桥前，却先去修理了一条通向远处的支路。“这条路不通向我。”她说。\n\n“但可能有人要回去。”\n\n她抬起指挥杖，停了很久。那一天，母巢第一次没有封闭偏离的信号。',
        en: 'The hive once had countless exits. Whenever two paths disagreed, its queen closed a door. One answer, she believed, would keep everyone from getting lost.\n\nAt the final bridge, you repaired a distant branch first. “That path does not lead to me,” she said.\n\n“Someone may need it to go home.”\n\nHer baton stayed raised for a long time. That day, the hive left a divergent signal alone.' } },
      { title: { zhCN: '交出去的指挥杖', en: 'Passing the Baton' }, body: {
        zhCN: '维修站只剩下一枚信标。她画好了最安全的路线，却看见队员指向另一端：那里还有一座没来得及修复的桥。\n\n过去，她会直接否决。现在，她把指挥杖交到了你手里。\n\n队伍没有按最快的顺序返回，但每个人都带回了一块完整的桥板。她把旧路线收进抽屉，在新图上给每个人留下一条不同颜色的线。\n\n“原来信任不是不出错。”她轻声说，“是允许别人把路补完。”',
        en: 'Only one beacon remained at the repair station. She had drawn the safest route, but an ally pointed to a bridge still waiting for repairs.\n\nOnce, she would have refused. Now she placed the baton in your hand.\n\nThe squad did not return in the fastest order. Each member brought back an intact plank. She put her old map away and drew a differently colored line for everyone.\n\n“Trust is not the absence of mistakes,” she said. “It is letting someone else complete the path.”' } },
      { title: { zhCN: '没有终点的同行', en: 'A Journey Without an Endpoint' }, body: {
        zhCN: '母巢的核心重新启动时，所有分支都在等待她归位。她摘下王冠，放在两座桥之间。光线沿着冠饰分成三路，各自延伸，谁也没有命令谁。\n\n“它们已经能自己选择了。”\n\n你问她接下来要去哪里。她望着休息室没有画完的地图，第一次笑得没有任何预演。\n\n“去看看那些没有标准答案的地方。还有——你的队伍，下一棒轮到我了吗？”',
        en: 'When the hive restarted, every branch waited for its queen. She set her crown between two bridges. Its light split three ways, each choosing its own course.\n\n“They can decide for themselves now.”\n\nYou asked where she would go next. Looking at the unfinished lounge map, she smiled without rehearsing it first.\n\n“Somewhere without a standard answer. And... is it my turn to take the next leg of your relay?”' } },
    ],
  },
}

export const FORK_QUEEN_SKILL: ContentSkillDefinition = {
  creatureId: FORK_QUEEN.id, energyCost: 12,
  passive: { name: { zhCN: '分支交棒', en: 'Branch Handoff' }, description: { zhCN: '自己行动阶段开始时，下一位队员获得 2 指令值。', en: 'At the start of her stage, the next ally gains 2 command.' } },
  active: { name: { zhCN: '多路共识', en: 'Many-path Consensus' }, description: { zhCN: '将 3 格转为网络；全队补充 1 指令值并获得 8% 共享运行值防护。', en: 'Convert 3 panels to Network, grant all allies 1 command and guard equal to 8% shared runtime.' } },
}
export const FORK_QUEEN_MECHANICS: ContentCreatureMechanicsDefinition = {
  creatureId: FORK_QUEEN.id, bindings: [
    { trigger: 'stage:enter', opcode: 'stage.relay-next', params: { amount: 2 } },
    { trigger: 'skill:cast', opcode: 'tiles.convert', params: { ecology: 'relay', count: 3, resolve: false } },
    { trigger: 'skill:cast', opcode: 'energy.party', params: { amount: 1, scaled: false } },
    { trigger: 'skill:cast', opcode: 'shield.party', params: { basis: 'party-max-hp', ratio: 0.08 } },
    { trigger: 'skill:cast', opcode: 'tiles.resolve' },
  ],
}

const boss = (number: number, id: string, zhCN: string, en: string, ecology: ContentCreatureDefinition['ecology'], hp: number, attack: number, defense: number, speed: number): ContentCreatureDefinition => ({
  number, id, name: { zhCN, en }, ecology, rarity: 'apex', combatRole: 'expedition-recruit', baseCaptureRate: .001,
  signatureProtocol: id, sprite: `creature:${id}:sprite`, stats: { hp, attack, defense, speed },
})

export const EXPEDITION_CREATURES: ContentCreatureDefinition[] = [FORK_QUEEN,
  boss(27, 'forge-dragon-empress', '熔序龙姬', 'Dragon Empress', 'forge', 1520, 210, 138, 118),
  boss(28, 'lumen-mirror-dreamer', '镜海织梦者', 'Mirror Dreamer', 'lumen', 1410, 198, 134, 144),
  boss(29, 'aegis-chain-warden', '断链守望者', 'Chain Warden', 'aegis', 1620, 185, 158, 110),
  boss(30, 'glitch-zero-hour', '零时巡游者', 'Zero Hour', 'glitch', 1400, 204, 130, 150),
  boss(31, 'glitch-reset-cantor', '归零咏者', 'Reset Cantor', 'glitch', 1480, 192, 146, 132),
]
const skill = (creatureId: string, passiveZh: string, passiveEn: string, descZh: string, descEn: string, activeZh: string, activeEn: string, castZh: string, castEn: string): ContentSkillDefinition => ({
  creatureId, energyCost: 12, passive: { name: { zhCN: passiveZh, en: passiveEn }, description: { zhCN: descZh, en: descEn } },
  active: { name: { zhCN: activeZh, en: activeEn }, description: { zhCN: castZh, en: castEn } },
})
export const EXPEDITION_SKILLS: ContentSkillDefinition[] = [FORK_QUEEN_SKILL,
  skill('forge-dragon-empress', '炉心余烬', 'Ember Core', '消除至少 4 枚编译色块，追加 25% 算力打击。', 'Match at least four Compile panels for a 25% attack hit.', '龙焰编译', 'Dragon Compile', '造成 160% 算力打击，削减 2 层护甲，将 2 格转为编译。', 'Deal a 160% attack hit, break two armor layers and convert two panels to Compile.'),
  skill('lumen-mirror-dreamer', '梦境回声', 'Dream Echo', '两段及以上连锁获得 1 指令值，每行动阶段一次。', 'A cascade of two or more grants one command, once per stage.', '镜像重演', 'Mirror Replay', '重演上次伤害的 60%（至少自身算力的 60%），并将 3 格转为智算。', 'Replay 60% of the last hit (at least 60% of her attack) and convert three panels to Compute.'),
  skill('aegis-chain-warden', '守门誓约', 'Gate Oath', '自身行动阶段开始时，获得自身最大运行值 10% 的共享防护。', 'Her stage begins with shared guard equal to 10% of her maximum runtime.', '解除封锁', 'Open the Gate', '修复共享运行值的 6%，并获得最大共享运行值 14% 的防护。', 'Repair 6% of maximum shared runtime and gain 14% shared guard.'),
  skill('glitch-zero-hour', '时隙潜行', 'Time Slip', '共享运行值低于一半时延后敌方行动一次，每战一次。', 'Below half shared runtime, delay the enemy once per battle.', '零秒突袭', 'Zero-second Strike', '造成 100% 算力打击，并延后敌方行动一次。', 'Deal a 100% attack hit and delay the enemy once.'),
  skill('glitch-reset-cantor', '消噪和声', 'Noise Cancel', '消除异常色块时侵蚀 1 层护甲；无护甲时削减自身算力 50% 的敌方防护。', 'Matching Glitch erodes one armor layer, or guard equal to 50% of her attack if no armor remains.', '系统重奏', 'System Reprise', '清除敌方防护，削减 1 层护甲，将 4 格转为异常。', 'Clear enemy guard, break one armor layer and convert four panels to Glitch.'),
]
export const EXPEDITION_MECHANICS: ContentCreatureMechanicsDefinition[] = [FORK_QUEEN_MECHANICS,
  { creatureId: 'forge-dragon-empress', bindings: [
    { trigger: 'match:after', opcode: 'match.raw-hit', params: { ecology: 'forge', minCount: 4, power: .25 } },
    { trigger: 'skill:cast', opcode: 'damage.raw-hit', params: { power: 1.6 } },
    { trigger: 'skill:cast', opcode: 'armor.break', params: { amount: 2 } },
    { trigger: 'skill:cast', opcode: 'tiles.convert', params: { ecology: 'forge', count: 2, resolve: true } },
  ] },
  { creatureId: 'lumen-mirror-dreamer', bindings: [
    { trigger: 'match:after', opcode: 'match.grant-energy-on-cascade', params: { minChain: 2, amount: 1, once: 'stage' } },
    { trigger: 'skill:cast', opcode: 'damage.replay', params: { factor: .6, minimum: 'member-attack' } },
    { trigger: 'skill:cast', opcode: 'tiles.convert', params: { ecology: 'lumen', count: 3, resolve: true } },
  ] },
  { creatureId: 'aegis-chain-warden', bindings: [
    { trigger: 'stage:enter', opcode: 'stage.shield', params: { basis: 'member-max-hp', ratio: .1 } },
    { trigger: 'skill:cast', opcode: 'shield.party', params: { basis: 'party-max-hp', ratio: .14 } },
    { trigger: 'skill:cast', opcode: 'heal.party', params: { basis: 'party-max-hp', ratio: .06 } },
  ] },
  { creatureId: 'glitch-zero-hour', bindings: [
    { trigger: 'runtime:threshold', opcode: 'runtime.delay-enemy', params: { belowRatio: .5, actions: 1, once: 'battle' } },
    { trigger: 'skill:cast', opcode: 'damage.raw-hit', params: { power: 1 } },
    { trigger: 'skill:cast', opcode: 'enemy.delay', params: { actions: 1 } },
  ] },
  { creatureId: 'glitch-reset-cantor', bindings: [
    { trigger: 'match:after', opcode: 'match.erode-protection', params: { ecology: 'glitch', armor: 1, shieldAttackRatio: .5 } },
    { trigger: 'skill:cast', opcode: 'shield.enemy-clear' },
    { trigger: 'skill:cast', opcode: 'armor.break', params: { amount: 1 } },
    { trigger: 'skill:cast', opcode: 'tiles.convert', params: { ecology: 'glitch', count: 4, resolve: true } },
  ] },
]
