import { writeFileSync } from 'node:fs'
import { CORE_CODEKIN_RUNTIME as runtime } from '../src/core-runtime.ts'
import { findFirstLegalBattleSwap } from '../packages/engine/src/match3.ts'
import { EXPEDITION_PERKS } from '../packages/engine/src/expedition.ts'
import { totalXpForLevel } from '../packages/engine/src/balance.ts'
import type { TraceWildAction, CaptureCoreQuality } from '../packages/engine/src/types.ts'
// Deliberately simple policy: this checks access and pacing, not optimal play.
const rows=[]
for(const [level,quality,count,tutorial] of [[1,'pebble',1,true],[1,'pebble',3,true],[30,'prism',3,false],[60,'origin',3,false]] as const){
 for(const family of ['charge','burst','guard']) for (const risky of [false, true]) {
  const samples=[]
  for(let seed=1;seed<=24;seed++){
   let rng=seed, clock=1000;const random=()=>{rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng/4294967296}
   let state=runtime.createInitialTraceWildState(clock)
   const act=(action:TraceWildAction)=>{const result=runtime.applyTraceWildAction(state,action,random,++clock);state=result.state;return result}
   act({type:'choose-starter',creatureId:'lumen-indeximp'})
   state.creatures=Array.from({length:count},(_,index)=>({...state.creatures[0]!,instanceId:`pet_balance_${index}_00000000`,creatureId:['lumen-indeximp','forge-sparkmite','aegis-veribud'][index]!,level,quality:quality as CaptureCoreQuality,xp:totalXpForLevel(level,quality)}))
   state.squad=state.creatures.map(member=>member.instanceId)
   for(let clue=0;clue<6;clue++) state=runtime.applyTraceSignal(state,{id:(seed*6+clue).toString(16).padStart(24,'0'),at:++clock,ecology:'relay',outcome:'completed',intensity:1,activeMinutes:0,enhanced:false,collaboration:true},random)
   state.expedition!.events[0]!.tutorial=tutorial
   act({type:'expedition-start',eventId:state.expedition!.events[0]!.id})
   let actions=0,rounds=0
   while(actions++<700){
    const run=state.expedition!.run!
    if(run.phase==='complete'||run.phase==='failed')break
    if(run.phase==='ready'){act({type:'expedition-continue',runId:run.id});continue}
    if(run.phase==='upgrade'){act({type:'expedition-perk',runId:run.id,perk:run.offers.find(id=>EXPEDITION_PERKS.find(perk=>perk.id===id)!.family===family)??run.offers[0]!});continue}
    if(run.phase==='route'){act({type:'expedition-route',runId:run.id,route:risky?'unstable-bridge':'safe-bridge'});continue}
    if(run.phase==='event'){
      const choice=run.stage===1?(risky?'cache-charge':'cache-repair'):run.stage===3?(risky&&run.hp>run.maxHp*.45?'workshop-install':'workshop-stock'):(risky&&run.hp>run.maxHp*.6?'camp-sabotage':'camp-repair')
      act({type:'expedition-node-choice',runId:run.id,node:run.stage,choice});continue
    }
    const battle=state.battle!
    if(battle.turnOwner==='boss'||battle.actionsRemaining===0){rounds++;act({type:'battle-continue'});continue}
    // Disable the two modules before hitting the core; first legal swaps approximate a novice.
    const combat=battle.expedition!
    const target=combat.interferenceHp>0?'interference':combat.shieldHp>0?'shield':'core'
    if(run.stage===6&&battle.pendingTeamDamage===0&&combat.target!==target){act({type:'expedition-target',runId:run.id,target});continue}
    if(!combat.supportUsed){
      const support=run.supplies.cleanse&&(battle.partyHp<battle.partyMaxHp*.75||battle.board.some(tile=>tile.hazardActions||tile.lockedActions))?'cleanse':run.supplies.burst?'burst':run.supplies.shuffle?'shuffle':undefined
      if(support){act({type:'expedition-support',runId:run.id,support});continue}
    }
    const member=battle.party[battle.activeIndex]!
    if(member.energy>=12&&!member.skillUsedStage&&member.skillSealedStages===0){act({type:'battle-cast',creatureInstanceId:member.instanceId});continue}
    const swap=findFirstLegalBattleSwap(battle.board)
    act(swap?{type:'battle-swap',...swap}:{type:'battle-skip-stage'})
   }
   const run=state.expedition!.run!
   samples.push({seed,boss:run.bossId,won:run.phase==='complete',stage:run.stage,actions,rounds,hp:run.hp/run.maxHp,perks:run.perks})
  }
  const row={level,quality,count,tutorial,family,risky,winRate:samples.filter(s=>s.won).length/samples.length,meanRounds:samples.reduce((n,s)=>n+s.rounds,0)/samples.length,meanActions:samples.reduce((n,s)=>n+s.actions,0)/samples.length,lossStages:samples.filter(s=>!s.won).map(s=>s.stage),samples}
  rows.push(row);console.log(JSON.stringify({...row,samples:undefined}))
 }
}
const report={format:'codekin-expedition-simulation-v2',policy:'Seven nodes, first legal match, cast when ready, break interference then guard, one support per fight. Safe: repair/stock/repair. Risk: charge/elite/overclock when healthy/sabotage when healthy. 24 seeds per scenario.',rows}
const outputIndex=process.argv.indexOf('--output')
if(outputIndex>=0){const output=process.argv[outputIndex+1];if(!output)throw new Error('--output requires a path');writeFileSync(output,JSON.stringify(report,null,2))}
if(process.argv.includes('--check')){
 const failures=rows.filter(row=>row.winRate<(row.risky?0.4:row.tutorial?0.8:0.6)||row.meanActions>300)
 if(failures.length)throw new Error(`Expedition access/pacing gate failed: ${failures.map(row=>`${row.level}/${row.count}/${row.family}/${row.risky?'risk':'safe'}`).join(', ')}`)
}
