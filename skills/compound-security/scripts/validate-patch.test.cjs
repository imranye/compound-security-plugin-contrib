'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {validate}=require('./validate-patch.cjs');
const example=require('../assets/patch-state.example.json');
const fresh=()=>structuredClone(example);
function local(){
 const x=fresh();x.status='local_verified';x.attempts=1;x.recovery_plan='recovery.md';
 x.security={status:'advisory_resolved',revision:x.source_revision,evidence:['advisory-and-lockfile.md']};
 x.compatibility={status:'passed',revision:x.source_revision,evidence:['business-tests.log']};
 x.review={status:'passed',revision:x.source_revision,reviewer:'independent-context',evidence:['review.md']};
 return x;
}
function closed(){
 const x=local();x.status='closed';x.owner='service-owner';
 x.deployment={status:'observed',revision:x.source_revision,artifact:'sha256:example',environment:'production',evidence:['deploy.log'],observation_start:'2026-01-01T00:00:00Z',observation_end:'2026-01-01T01:00:00Z',coverage_complete:true,health_passed:true,inventory_evidence:'inventory.json',health_evidence:'health.json',criteria:'agreed service health thresholds'};
 return x;
}
test('planned record is incomplete but consistent',()=>assert.deepEqual(validate(fresh()),[]));
test('local verification does not require production',()=>assert.deepEqual(validate(local()),[]));
test('observed production may close',()=>assert.deepEqual(validate(closed()),[]));
const cases={
 'local tests cannot close production':x=>{x.status='closed';},
 'compatibility regression rejects candidate':x=>{x.compatibility.status='failed';},
 'missing reviewer':x=>{x.review.status='pending';},
 'self review':x=>{x.review.reviewer=x.author;},
 'stale revision':x=>{x.source_revision='changed';},
 'missing security evidence':x=>{x.security.evidence=[];},
 'security pending':x=>{x.security.status='pending';},
 'exploit claim without reproduction':x=>{x.security.status='exploit_verified';},
 'missing recovery':x=>{x.recovery_plan=null;},
 'budget exhausted':x=>{x.attempts=4;},
 'invalid state':x=>{x.status='done';},
 'rollback cannot stay verified':x=>{x.deployment.status='rolled_back';}
};
for(const [name,mutate] of Object.entries(cases)) test(name,()=>{const x=local();mutate(x);assert.ok(validate(x).length);});
for(const [name,mutate] of Object.entries({
 'staging is not production':x=>{x.deployment.environment='staging';},
 'missing replica coverage':x=>{x.deployment.coverage_complete=false;},
 'unhealthy deployment':x=>{x.deployment.health_passed=false;},
 'reversed observation':x=>{x.deployment.observation_end='2025-01-01';},
 'remaining blocker':x=>{x.blockers=['one replica unknown'];},
 'missing owner':x=>{x.owner=null;},
 'missing inventory':x=>{delete x.deployment.inventory_evidence;}
})) test(name,()=>{const x=closed();mutate(x);assert.ok(validate(x).length);});
test('rollback reopens lifecycle with retained evidence',()=>{const x=closed();x.status='rolled_back';x.deployment.status='rolled_back';x.deployment.rollback_evidence='rollback.log';assert.deepEqual(validate(x),[]);});
test('deferral needs owner reason and review date',()=>{const x=fresh();x.status='deferred';assert.ok(validate(x).length);x.owner='owner';x.defer_reason='blocked upstream';x.review_date='2026-12-01';assert.deepEqual(validate(x),[]);});
test('malformed records rejected',()=>{for(const x of [null,[],1,{},'x'])assert.ok(validate(x).length);});
