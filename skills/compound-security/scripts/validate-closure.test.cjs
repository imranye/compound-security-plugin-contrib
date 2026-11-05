'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawnSync } = require('node:child_process');
const { LIMITS, validateClosure } = require('./validate-closure.cjs');
const example = JSON.parse(fs.readFileSync(path.join(__dirname, '../assets/closure.example.json'), 'utf8'));
const clone = () => JSON.parse(JSON.stringify(example));
const fingerprint = example.entries[0].fingerprint;
const finding = {
  verdict: 'confirmed', fingerprint, title: 'Cross-tenant export',
  description: 'A tenant can read another tenant export.', root_cause: 'Missing tenant predicate.',
  intended_behavior: 'Tenant exports contain only records belonging to the authenticated tenant.',
  trace: [
    { kind: 'entrypoint', file: 'src/export.js', line: 1, scope: 'export route', description: 'Authenticated tenant requests export.' },
    { kind: 'sink', file: 'src/export.js', line: 9, scope: 'database read', description: 'Database query omits tenant scope.' }
  ],
  evidence: [{ file: 'src/export.js', line: 9, description: 'Query lacks the tenant predicate.' }],
  conditions: [{ kind: 'authentication_level', description: 'Attacker has a normal tenant account.' }],
  execution: { attacker_perspective: 'Tenant A', payloads: ['fixture-export'], instructions: ['Run the isolated export fixture.'], observed_result: 'Fixture returned tenant B records.' },
  remediation: { strategy: 'Scope the query by the authenticated tenant.' },
  severity: {
    likelihood: { score: 'high', reason: 'Any authenticated tenant can request the route.' },
    impact: { score: 'high', reason: 'Cross-tenant record disclosure.' }, overall_severity: 'high'
  },
  confidence: { score: 'high', reason: 'Observed fixture result and source trace agree.' }
};
const findings = [finding];
function rejects(change, expected) {
  const ledger = clone(); change(ledger, ledger.entries[0]);
  const errors = validateClosure(ledger, findings);
  assert.ok(errors.some(e => expected.test(e)), errors.join('\n'));
}

test('complete compounded record is structurally valid', () => {
  assert.deepEqual(validateClosure(clone(), findings), []);
});
test('planned work cannot pretend to have future-phase evidence', () => {
  rejects((_, e) => { e.status = 'planned'; }, /verification: not allowed/);
});
test('a valid planned record remains unresolved', () => {
  const ledger = clone(); const e = ledger.entries[0];
  e.status = 'planned'; delete e.fix; delete e.verification; delete e.compound;
  assert.deepEqual(validateClosure(ledger, findings), []);
});
test('unverified patches need no invented test results', () => {
  const ledger = clone(); const e = ledger.entries[0];
  e.status = 'fixed_unverified'; delete e.verification; delete e.compound;
  assert.deepEqual(validateClosure(ledger, findings), []);
});
test('verified status requires independent verification', () => {
  rejects((_, e) => { e.status = 'verified'; delete e.compound; delete e.verification; }, /verification: required/);
});
test('author cannot approve their own fix with case variation', () => {
  rejects((_, e) => { e.verification.verifier = e.fix.author.toUpperCase(); }, /must differ from fix.author/);
});
test('new source changes invalidate stale review', () => {
  rejects(l => { l.current_revision = 'later-source'; }, /reviewed_revision: must equal/);
});
test('regression must fail on vulnerable source', () => {
  rejects((_, e) => { e.verification.regression.before.result = 'pass'; }, /before.result: must equal "fail"/);
});
test('regression failure must reference audit source', () => {
  rejects((_, e) => { e.verification.regression.before.revision = 'unrelated-source'; }, /before.revision: must equal/);
});
test('regression must pass on current source', () => {
  rejects((_, e) => { e.verification.regression.after.result = 'fail'; }, /after.result: must equal "pass"/);
});
test('compatibility must pass at current revision', () => {
  rejects((_, e) => { e.verification.compatibility.revision = 'old-source'; }, /compatibility.revision: must equal/);
});
test('missing review evidence blocks verified state', () => {
  rejects((_, e) => { e.verification.evidence_files = []; }, /evidence_files: must be a nonempty array/);
});
test('missing regression log blocks verified state', () => {
  rejects((_, e) => { e.verification.regression.after.evidence_file = ''; }, /evidence_file: must be a nonempty string/);
});
test('compounding requires a prevention artifact', () => {
  rejects((_, e) => { e.compound.prevention_files = []; }, /prevention_files: must be a nonempty array/);
});
test('compounding requires a durable lesson', () => {
  rejects((_, e) => { delete e.compound.lesson_file; }, /lesson_file: required/);
});
test('unknown statuses and misspelled nested fields fail', () => {
  rejects((_, e) => { e.status = 'fixed'; e.verification.reviewd_revision = 'x'; }, /reviewd_revision: unknown field/);
});
test('unconfirmed and rejected findings cannot enter closure', () => {
  for (const verdict of ['needs_validation', 'rejected']) {
    assert.match(validateClosure(clone(), [{ ...finding, verdict }]).join('\n'), /only confirmed findings/);
  }
});
test('unknown and duplicate fingerprints fail', () => {
  rejects((_, e) => { e.fingerprint = 'not-in-audit'; }, /does not reference/);
  rejects(l => { l.entries.push(JSON.parse(JSON.stringify(l.entries[0]))); }, /duplicate closure entry/);
  assert.match(validateClosure(clone(), [finding, finding]).join('\n'), /duplicate fingerprint/);
});
test('blank and whitespace-padded identities fail', () => {
  rejects((_, e) => { e.fix.author = ' '; }, /must be a nonempty string/);
  rejects((_, e) => { e.verification.verifier += ' '; }, /must not have leading or trailing whitespace/);
});
test('same audit and current revision cannot describe verified fix', () => {
  rejects(l => { l.current_revision = l.audit_revision; }, /must differ from audit_revision/);
});
test('deferrals require accountability and a real date', () => {
  const ledger = clone();
  ledger.entries = [{ fingerprint, status: 'deferred', deferral: { reason: 'Deployment owner must schedule downtime.', owner: 'service-owner', review_date: '2026-11-30' } }];
  assert.deepEqual(validateClosure(ledger, findings), []);
  ledger.entries[0].deferral.review_date = '2026-02-30';
  assert.match(validateClosure(ledger, findings).join('\n'), /actual calendar date/);
  delete ledger.entries[0].deferral.owner;
  assert.match(validateClosure(ledger, findings).join('\n'), /owner: required/);
});
test('malformed nested inputs return validation errors without throwing', () => {
  for (const bad of [null, 42, [], 'bad']) {
    rejects((_, e) => { e.verification = bad; }, /verification: must be an object/);
    assert.ok(validateClosure(bad, findings).length);
  }
});
test('empty closure is valid but does not claim all findings resolved', () => {
  const ledger = clone(); ledger.entries = [];
  assert.deepEqual(validateClosure(ledger, findings), []);
});
test('CLI validates source findings and fails on malformed upstream records', () => {
  const upstream = path.join(__dirname, '../references/audit/validate-findings.cjs');
  if (!fs.existsSync(upstream)) throw new Error('Vendored audit engine must exist for integration test.');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'compound-security-closure-'));
  try {
    const closurePath = path.join(dir, 'closure.json'); const findingsPath = path.join(dir, 'findings.json');
    fs.writeFileSync(closurePath, JSON.stringify(clone())); fs.writeFileSync(findingsPath, JSON.stringify(findings));
    const good = spawnSync(process.execPath, [path.join(__dirname, 'validate-closure.cjs'), closurePath, findingsPath], { encoding: 'utf8' });
    assert.equal(good.status, 0, good.stdout + good.stderr);
    assert.match(good.stdout, /Recorded assertions only/);
    fs.writeFileSync(findingsPath, JSON.stringify([{ verdict: 'confirmed', fingerprint }]));
    const bad = spawnSync(process.execPath, [path.join(__dirname, 'validate-closure.cjs'), closurePath, findingsPath], { encoding: 'utf8' });
    assert.equal(bad.status, 1); assert.match(bad.stderr, /Audit findings validation failed/);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

function cliFixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'compound-security-boundary-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const closurePath = path.join(dir, 'closure.json');
  const findingsPath = path.join(dir, 'findings.json');
  fs.writeFileSync(closurePath, JSON.stringify(clone()));
  fs.writeFileSync(findingsPath, JSON.stringify(findings));
  return { dir, closurePath, findingsPath, run: (input = closurePath, source = findingsPath) =>
    spawnSync(process.execPath, [path.join(__dirname, 'validate-closure.cjs'), input, source],
      { encoding: 'utf8', timeout: 2000, maxBuffer: 256 * 1024 }) };
}
function rejectsInput(result) {
  assert.equal(result.status, 2, result.stdout + result.stderr + String(result.error || ''));
  assert.match(result.stderr, /Cannot read input JSON safely/);
  assert.ok(!result.error, String(result.error));
}
test('CLI refuses final symlinks for either input', t => {
  const f = cliFixture(t); const link = path.join(f.dir, 'link.json');
  fs.symlinkSync(f.closurePath, link);
  rejectsInput(f.run(link));
  fs.unlinkSync(link); fs.symlinkSync(f.findingsPath, link);
  rejectsInput(f.run(f.closurePath, link));
});
test('CLI rejects FIFO inputs without blocking', t => {
  const f = cliFixture(t); const fifo = path.join(f.dir, 'pipe');
  const created = spawnSync('mkfifo', [fifo], { encoding: 'utf8' });
  assert.equal(created.status, 0, created.stderr);
  rejectsInput(f.run(fifo));
  rejectsInput(f.run(f.closurePath, fifo));
});
test('CLI rejects directories and oversized input', t => {
  const f = cliFixture(t);
  rejectsInput(f.run(f.dir));
  fs.writeFileSync(f.closurePath, Buffer.alloc(LIMITS.inputBytes + 1, 0x20));
  rejectsInput(f.run());
});
test('CLI rejects deep JSON before validation and ignores brackets inside strings', t => {
  const f = cliFixture(t);
  fs.writeFileSync(f.closurePath, '['.repeat(LIMITS.nestingDepth + 1) + '0' + ']'.repeat(LIMITS.nestingDepth + 1));
  rejectsInput(f.run());
  const ledger = clone(); ledger.entries[0].plan.summary = '['.repeat(100) + 'quoted brackets';
  fs.writeFileSync(f.closurePath, JSON.stringify(ledger));
  const valid = f.run(); assert.equal(valid.status, 0, valid.stderr);
});
test('CLI rejects invalid UTF-8 and parse diagnostics never echo input', t => {
  const f = cliFixture(t);
  fs.writeFileSync(f.findingsPath, Buffer.from([0x5b, 0xc3, 0x28, 0x5d]));
  rejectsInput(f.run());
  fs.writeFileSync(f.findingsPath, JSON.stringify(findings));
  fs.writeFileSync(f.closurePath, 'PRIVATE_PAYLOAD_DO_NOT_LOG\x1b[31m{');
  const invalid = f.run(); rejectsInput(invalid);
  assert.doesNotMatch(invalid.stderr, /PRIVATE_PAYLOAD|\x1b/);
  const missing = f.run(path.join(f.dir, 'PRIVATE_FILENAME_DO_NOT_LOG\x1b'));
  rejectsInput(missing); assert.doesNotMatch(missing.stderr, /PRIVATE_FILENAME|\x1b/);
});
test('CLI enforces array, object, string, key and total-node limits', t => {
  const f = cliFixture(t);
  const cases = [
    Array(LIMITS.containerItems + 1).fill(0),
    Object.fromEntries(Array.from({ length: LIMITS.containerItems + 1 }, (_, i) => [`k${i}`, 0])),
    'x'.repeat(LIMITS.stringLength + 1),
    { ['k'.repeat(LIMITS.keyLength + 1)]: 0 },
    Array.from({ length: 1000 }, () => Array(20).fill(0))
  ];
  for (const data of cases) {
    fs.writeFileSync(f.closurePath, JSON.stringify(data)); rejectsInput(f.run());
  }
});
test('identities and artifact paths reject invisible or malformed Unicode text', () => {
  for (const bad of ['\u200b', '\u2066', '\ud800', '\x1b', '\u2028']) {
    rejects((_, e) => { e.verification.verifier = e.fix.author + bad; }, /visible text/);
    rejects((_, e) => { e.compound.lesson_file = bad; }, /visible text|nonempty string/);
    rejects((_, e) => { e.compound.prevention_files = [bad]; }, /visible text|nonempty string/);
  }
});
test('programmatic diagnostics escape control characters and cap message count and length', () => {
  const ledger = clone();
  for (let i = 0; i < 200; i++) ledger[`unknown-${i}-\x1b[31m\u202e` + 'x'.repeat(2000)] = true;
  const errors = validateClosure(ledger, findings);
  assert.equal(errors.length, LIMITS.validationErrors);
  assert.ok(errors.every(e => e.length <= LIMITS.diagnosticLength));
  assert.ok(errors.every(e => !/[\x00-\x1f\x7f\u202e]/u.test(e)));
  assert.match(errors[0], /\\u001b/);
});
test('CLI sanitizes and caps diagnostics from both validators', t => {
  const f = cliFixture(t); const ledger = clone();
  for (let i = 0; i < 150; i++) ledger[`bad-${i}-\x1b\u202e`] = true;
  fs.writeFileSync(f.closurePath, JSON.stringify(ledger));
  const closure = f.run(); assert.equal(closure.status, 1, closure.stderr);
  assert.ok(closure.stderr.length < 110000);
  assert.doesNotMatch(closure.stderr, /[\x00-\x08\x0b-\x1f\x7f\u202e]/u);
  assert.match(closure.stderr, /\\u001b/);
  fs.writeFileSync(f.closurePath, JSON.stringify(clone()));
  const unsafeFinding = JSON.parse(JSON.stringify(finding)); unsafeFinding['\x1b[31m\u202e'] = true;
  fs.writeFileSync(f.findingsPath, JSON.stringify([unsafeFinding]));
  const audit = f.run(); assert.equal(audit.status, 1, audit.stderr);
  assert.doesNotMatch(audit.stderr, /[\x00-\x08\x0b-\x1f\x7f\u202e]/u);
  assert.match(audit.stderr, /Audit findings validation failed/);
});
