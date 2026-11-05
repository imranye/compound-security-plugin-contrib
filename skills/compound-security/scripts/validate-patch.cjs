#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const states = ['planned','in_progress','local_verified','closed','blocked','deferred','rolled_back'];
function validate(x) {
  const errors=[];
  const check=(ok,msg)=>{if(!ok) errors.push(msg);};
  const text=v=>typeof v==='string' && v.trim().length>0;
  if (!x || typeof x!=='object' || Array.isArray(x)) return ['record must be an object'];
  check(x.schema_version===1,'schema_version must be 1');
  for(const key of ['patch_id','scope','source_revision','next_action']) check(text(x[key]),`${key} required`);
  check(states.includes(x.status),'invalid status');
  check(Array.isArray(x.blockers)&&x.blockers.every(text),'blockers must be strings');
  check(Number.isInteger(x.attempts)&&x.attempts>=0,'attempts must be nonnegative integer');
  check(Number.isInteger(x.attempt_limit)&&x.attempt_limit>0,'attempt_limit must be positive integer');
  check(x.attempts<=x.attempt_limit,'attempt budget exceeded');
  const sec=x.security||{}, comp=x.compatibility||{}, dep=x.deployment||{}, rev=x.review||{};
  check(['pending','advisory_resolved','exploit_verified'].includes(sec.status),'invalid security status');
  check(['pending','passed','failed'].includes(comp.status),'invalid compatibility status');
  check(['not_deployed','staging_verified','deployed','observed','rolled_back'].includes(dep.status),'invalid deployment status');
  const evidence=(obj,label)=>{
    check(obj.revision===x.source_revision,`${label} stale revision`);
    check(Array.isArray(obj.evidence)&&obj.evidence.length>0&&obj.evidence.every(text),`${label} evidence required`);
  };
  if(sec.status!=='pending') evidence(sec,'security');
  if(sec.status==='exploit_verified') {
    check(text(sec.baseline_revision)&&sec.baseline_revision!==x.source_revision,'distinct baseline required');
    check(text(sec.baseline_failure)&&text(sec.patched_pass),'old-fail/new-pass evidence required');
  }
  if(['passed','failed'].includes(comp.status)) evidence(comp,'compatibility');
  if(rev.status==='passed') {
    evidence(rev,'review');
    check(text(x.author)&&text(rev.reviewer)&&rev.reviewer!==x.author,'independent reviewer required');
  } else check(rev.status==='pending','invalid review status');
  if(dep.status!=='not_deployed'&&dep.status!=='rolled_back') {
    evidence(dep,'deployment');
    check(text(dep.artifact)&&text(dep.environment),'deployed artifact/environment required');
  }
  if(dep.status==='observed') {
    const start=Date.parse(dep.observation_start), end=Date.parse(dep.observation_end);
    check(Number.isFinite(start)&&Number.isFinite(end)&&end>start,'valid observation window required');
    check(dep.coverage_complete===true&&dep.health_passed===true,'deployment coverage and health required');
    check(text(dep.inventory_evidence)&&text(dep.health_evidence)&&text(dep.criteria),'inventory, health and criteria evidence required');
  }
  if(['local_verified','closed'].includes(x.status)) {
    check(['advisory_resolved','exploit_verified'].includes(sec.status),'security evidence pending');
    check(comp.status==='passed','compatibility must pass');
    check(rev.status==='passed','independent review must pass');
    check(text(x.recovery_plan),'recovery plan required');
    check(dep.status!=='rolled_back','rolled-back patch cannot be verified or closed');
  }
  if(x.status==='closed') {
    check(dep.status==='observed'&&dep.environment==='production','production observation required to close');
    check(Array.isArray(x.blockers)&&x.blockers.length===0,'closed patch has blockers');
    check(text(x.owner),'closure owner required');
  }
  if(x.status==='rolled_back'||dep.status==='rolled_back') {
    check(x.status==='rolled_back'&&dep.status==='rolled_back','rollback dimensions must agree');
    check(text(dep.rollback_evidence),'rollback evidence required');
  }
  if(x.status==='blocked') check(Array.isArray(x.blockers)&&x.blockers.length>0,'blocked requires blocker');
  if(x.status==='deferred') {
    check(text(x.owner)&&text(x.defer_reason),'deferral owner/reason required');
    check(text(x.review_date)&&Number.isFinite(Date.parse(x.review_date)),'deferral review date required');
  }
  return errors;
}
module.exports={validate};
if(require.main===module) {
  try {
    if(process.argv.length!==3) throw Error('Usage: node validate-patch.cjs PATCH-STATE.json');
    const errors=validate(JSON.parse(fs.readFileSync(process.argv[2],'utf8')));
    if(errors.length) throw Error(errors.join('\n'));
    console.log('Patch record consistent. Recorded assertions are not proof of execution or authorization.');
  } catch(e) {console.error(e.message);process.exitCode=1;}
}
