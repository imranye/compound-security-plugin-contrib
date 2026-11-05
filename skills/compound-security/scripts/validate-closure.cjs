#!/usr/bin/env node
'use strict';

// Validates recorded workflow assertions. This does not prove an exploit, fix,
// test result, evidence contents, or the independence of the named reviewers.
const fs = require('node:fs');
const path = require('node:path');
const { TextDecoder } = require('node:util');

const LIMITS = Object.freeze({ inputBytes: 5 * 1024 * 1024, nestingDepth: 32,
  containerItems: 1000, totalNodes: 20000, stringLength: 65536, keyLength: 1024,
  validationErrors: 100, diagnosticLength: 1024 });
const UNSAFE_DIAGNOSTIC = /[\p{Cc}\p{Cf}\p{Cs}\p{Zl}\p{Zp}\p{Default_Ignorable_Code_Point}]/gu;
const FORBIDDEN_STRING = /[\p{Cc}\p{Cf}\p{Cs}\p{Zl}\p{Zp}\p{Default_Ignorable_Code_Point}]/u;
const VISIBLE_CONTENT = /[^\p{White_Space}\p{Cc}\p{Cf}\p{Default_Ignorable_Code_Point}]/u;
function safeDiagnostic(value) {
  // Clip before and after escaping so both processing and emitted size are bounded.
  const clipped = String(value).slice(0, LIMITS.diagnosticLength);
  const escaped = clipped.replace(UNSAFE_DIAGNOSTIC, ch => {
    const cp = ch.codePointAt(0);
    return cp <= 0xffff ? `\\u${cp.toString(16).padStart(4, '0')}` : `\\u{${cp.toString(16)}}`;
  });
  return escaped.length > LIMITS.diagnosticLength ? `${escaped.slice(0, LIMITS.diagnosticLength - 3)}...` : escaped;
}
function safeQuote(value) {
  if (typeof value === 'string') return JSON.stringify(value.slice(0, 256));
  if (value === null || typeof value === 'boolean' || (typeof value === 'number' && Number.isFinite(value))) return String(value);
  return `<${Array.isArray(value) ? 'array' : typeof value}>`;
}
function readJsonSnapshot(file) {
  const { O_RDONLY, O_NOFOLLOW, O_NONBLOCK } = fs.constants;
  if (!Number.isInteger(O_NOFOLLOW) || O_NOFOLLOW === 0 || !Number.isInteger(O_NONBLOCK) || O_NONBLOCK === 0) {
    throw new Error('safe input unavailable');
  }
  const fd = fs.openSync(file, O_RDONLY | O_NOFOLLOW | O_NONBLOCK);
  let bytes;
  try {
    const stat = fs.fstatSync(fd);
    if (!stat.isFile() || stat.size > LIMITS.inputBytes) throw new Error('unsafe input');
    const chunks = []; let length = 0;
    const chunk = Buffer.allocUnsafe(64 * 1024);
    while (true) {
      const count = fs.readSync(fd, chunk, 0, Math.min(chunk.length, LIMITS.inputBytes + 1 - length), null);
      if (count === 0) break;
      length += count;
      if (length > LIMITS.inputBytes) throw new Error('input limit');
      chunks.push(Buffer.from(chunk.subarray(0, count)));
    }
    bytes = Buffer.concat(chunks, length);
  } finally { fs.closeSync(fd); }
  const text = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes);
  let depth = 0; let quoted = false; let escaped = false;
  for (const ch of text) {
    if (quoted) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') quoted = false;
    } else if (ch === '"') quoted = true;
    else if (ch === '{' || ch === '[') {
      if (++depth > LIMITS.nestingDepth) throw new Error('nesting limit');
    } else if (ch === '}' || ch === ']') depth--;
  }
  const document = JSON.parse(text);
  // Bound breadth and total work before either semantic validator receives data.
  const pending = [document]; let nodes = 0;
  while (pending.length) {
    const value = pending.pop();
    if (++nodes > LIMITS.totalNodes) throw new Error('node limit');
    if (typeof value === 'string' && value.length > LIMITS.stringLength) throw new Error('string limit');
    if (value && typeof value === 'object') {
      const keys = Object.keys(value);
      if (keys.length > LIMITS.containerItems) throw new Error('container limit');
      for (const key of keys) {
        if (key.length > LIMITS.keyLength) throw new Error('key limit');
        pending.push(value[key]);
      }
    }
  }
  return document;
}

function validateClosure(ledger, findings) {
  const errors = [];
  const error = (at, message) => {
    if (errors.length < LIMITS.validationErrors) errors.push(safeDiagnostic(`${at}: ${message}`));
  };
  const object = (value, at, keys, required = keys) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      error(at, 'must be an object'); return false;
    }
    for (const key of Object.keys(value)) if (!keys.includes(key)) error(`${at}.${key}`, 'unknown field');
    for (const key of required) if (!Object.hasOwn(value, key)) error(`${at}.${key}`, 'required');
    return true;
  };
  const string = (value, at) => {
    if (typeof value !== 'string' || !value.trim()) { error(at, 'must be a nonempty string'); return false; }
    if (!VISIBLE_CONTENT.test(value) || FORBIDDEN_STRING.test(value)) {
      error(at, 'must contain visible text without control, format, default-ignorable, or surrogate characters'); return false;
    }
    if (value !== value.trim()) { error(at, 'must not have leading or trailing whitespace'); return false; }
    return true;
  };
  const strings = (value, at) => {
    if (!Array.isArray(value) || !value.length) { error(at, 'must be a nonempty array'); return; }
    value.forEach((v, i) => string(v, `${at}[${i}]`));
    if (new Set(value).size !== value.length) error(at, 'must contain unique values');
  };
  const equal = (value, expected, at) => {
    if (value !== expected) error(at, `must equal ${safeQuote(expected)}`);
  };
  const checkPlan = (plan, at) => {
    const keys = ['summary', 'regression_plan', 'compatibility_plan', 'rollback'];
    if (object(plan, at, keys)) keys.forEach(k => string(plan[k], `${at}.${k}`));
  };
  const checkFix = (fix, at) => {
    if (!object(fix, at, ['author', 'revision', 'changed_files'])) return;
    string(fix.author, `${at}.author`); string(fix.revision, `${at}.revision`);
    strings(fix.changed_files, `${at}.changed_files`);
  };
  const checkTest = (test, at, revision, result) => {
    if (!object(test, at, ['revision', 'result', 'evidence_file'])) return;
    string(test.revision, `${at}.revision`); equal(test.revision, revision, `${at}.revision`);
    equal(test.result, result, `${at}.result`); string(test.evidence_file, `${at}.evidence_file`);
  };
  const checkVerification = (verification, fix, at) => {
    if (!object(verification, at, ['verifier', 'reviewed_revision', 'evidence_files', 'regression', 'compatibility'])) return;
    string(verification.verifier, `${at}.verifier`);
    if (typeof verification.verifier === 'string' && typeof fix?.author === 'string' &&
        verification.verifier.toLowerCase() === fix.author.toLowerCase()) {
      error(`${at}.verifier`, 'must differ from fix.author; use a fresh independent reviewer');
    }
    string(verification.reviewed_revision, `${at}.reviewed_revision`);
    equal(verification.reviewed_revision, ledger.current_revision, `${at}.reviewed_revision`);
    strings(verification.evidence_files, `${at}.evidence_files`);
    if (object(verification.regression, `${at}.regression`, ['before', 'after'])) {
      checkTest(verification.regression.before, `${at}.regression.before`, ledger.audit_revision, 'fail');
      checkTest(verification.regression.after, `${at}.regression.after`, ledger.current_revision, 'pass');
    }
    checkTest(verification.compatibility, `${at}.compatibility`, ledger.current_revision, 'pass');
  };
  const checkCompound = (compound, at) => {
    if (!object(compound, at, ['lesson_file', 'prevention_files', 'applies_to'])) return;
    string(compound.lesson_file, `${at}.lesson_file`);
    strings(compound.prevention_files, `${at}.prevention_files`);
    strings(compound.applies_to, `${at}.applies_to`);
  };
  const checkDeferral = (deferral, at) => {
    if (!object(deferral, at, ['reason', 'owner', 'review_date'])) return;
    string(deferral.reason, `${at}.reason`); string(deferral.owner, `${at}.owner`);
    const date = deferral.review_date;
    if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
        Number.isNaN(Date.parse(`${date}T00:00:00Z`)) || new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date) {
      error(`${at}.review_date`, 'must be an actual calendar date in YYYY-MM-DD format');
    }
  };

  if (!object(ledger, 'ledger', ['schema_version', 'audit_revision', 'current_revision', 'entries'])) return errors;
  equal(ledger.schema_version, 1, 'ledger.schema_version');
  string(ledger.audit_revision, 'ledger.audit_revision'); string(ledger.current_revision, 'ledger.current_revision');
  if (!Array.isArray(findings)) { error('findings', 'must be the audit findings array'); return errors; }
  const byFingerprint = new Map();
  for (let i = 0; i < findings.length; i++) {
    const finding = findings[i];
    if (!finding || typeof finding !== 'object' || typeof finding.fingerprint !== 'string' ||
        !['confirmed', 'needs_validation', 'rejected'].includes(finding.verdict)) {
      error(`findings[${i}]`, 'must have a fingerprint and recognized verdict'); continue;
    }
    if (byFingerprint.has(finding.fingerprint)) error(`findings[${i}].fingerprint`, 'duplicate fingerprint');
    byFingerprint.set(finding.fingerprint, finding);
  }
  if (!Array.isArray(ledger.entries)) { error('ledger.entries', 'must be an array'); return errors; }
  const seen = new Set();
  const statuses = ['planned', 'fixed_unverified', 'verified', 'compounded', 'deferred'];
  ledger.entries.forEach((entry, i) => {
    const at = `ledger.entries[${i}]`;
    if (!object(entry, at, ['fingerprint', 'status', 'plan', 'fix', 'verification', 'compound', 'deferral'], ['fingerprint', 'status'])) return;
    string(entry.fingerprint, `${at}.fingerprint`);
    if (seen.has(entry.fingerprint)) error(`${at}.fingerprint`, 'duplicate closure entry');
    seen.add(entry.fingerprint);
    const finding = byFingerprint.get(entry.fingerprint);
    if (!finding) error(`${at}.fingerprint`, 'does not reference an audit finding');
    else if (finding.verdict !== 'confirmed') error(`${at}.fingerprint`, 'only confirmed findings can enter remediation closure');
    if (!statuses.includes(entry.status)) error(`${at}.status`, `must be one of ${statuses.join(', ')}`);
    const required = entry.status === 'deferred' ? ['deferral'] : ['plan'];
    if (['fixed_unverified', 'verified', 'compounded'].includes(entry.status)) required.push('fix');
    if (['verified', 'compounded'].includes(entry.status)) required.push('verification');
    if (entry.status === 'compounded') required.push('compound');
    required.forEach(k => { if (!Object.hasOwn(entry, k)) error(`${at}.${k}`, `required for status ${safeQuote(entry.status)}`); });
    const allowed = new Set(['fingerprint', 'status', ...required]);
    if (entry.status === 'deferred') allowed.add('plan');
    Object.keys(entry).forEach(k => { if (!allowed.has(k)) error(`${at}.${k}`, `not allowed for status ${safeQuote(entry.status)}`); });
    if (Object.hasOwn(entry, 'plan')) checkPlan(entry.plan, `${at}.plan`);
    if (Object.hasOwn(entry, 'fix')) checkFix(entry.fix, `${at}.fix`);
    if (Object.hasOwn(entry, 'verification')) checkVerification(entry.verification, entry.fix, `${at}.verification`);
    if (Object.hasOwn(entry, 'compound')) checkCompound(entry.compound, `${at}.compound`);
    if (Object.hasOwn(entry, 'deferral')) checkDeferral(entry.deferral, `${at}.deferral`);
    if (['verified', 'compounded'].includes(entry.status) && ledger.audit_revision === ledger.current_revision) {
      error('ledger.current_revision', 'must differ from audit_revision for a verified fix');
    }
  });
  return errors;
}

function main(argv) {
  if (argv.length !== 2) {
    console.error('Usage: node validate-closure.cjs <closure.json> <findings.json>'); return 2;
  }
  const [closurePath, findingsPath] = argv.map(p => path.resolve(p));
  let ledger, findings, schema, validateDocument;
  try {
    ledger = readJsonSnapshot(closurePath);
    findings = readJsonSnapshot(findingsPath);
  } catch { console.error('Cannot read input JSON safely: require regular non-symlink files, valid UTF-8 and JSON, and documented size/structure limits.'); return 2; }
  const upstream = path.resolve(__dirname, '../references/audit/validate-findings.cjs');
  try {
    // These imports are trusted plugin assets, never paths supplied by the audit.
    ({ validateDocument } = require(upstream));
    schema = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../references/audit/report-schema.json'), 'utf8'));
    if (typeof validateDocument !== 'function') throw new Error('missing export');
  } catch {
    console.error('Trusted audit validator or schema unavailable.'); return 2;
  }
  let auditErrors, errors;
  try {
    auditErrors = validateDocument(findings, schema);
    errors = auditErrors.length ? [] : validateClosure(ledger, findings);
  } catch { console.error('Record validation failed safely.'); return 1; }
  if (auditErrors.length) {
    console.error('Audit findings validation failed. Diagnostics capped at 100.');
    auditErrors.slice(0, LIMITS.validationErrors).forEach(e => console.error(safeDiagnostic(e))); return 1;
  }
  if (errors.length) {
    console.error('Closure validation failed. Diagnostics capped at 100.');
    errors.slice(0, LIMITS.validationErrors).forEach(e => console.error(safeDiagnostic(e))); return 1;
  }
  const counts = {};
  ledger.entries.forEach(e => { counts[e.status] = (counts[e.status] || 0) + 1; });
  const recorded = new Set(ledger.entries.map(e => e.fingerprint));
  const omitted = findings.filter(f => f.verdict === 'confirmed' && !recorded.has(f.fingerprint)).length;
  console.log(`Closure structure valid: ${JSON.stringify(counts)}; ${omitted} confirmed finding(s) have no closure entry.`);
  console.log('Recorded assertions only. Evidence truth, reviewer independence, coverage, and deployment are not proven by this validator.');
  return 0;
}

module.exports = { LIMITS, safeDiagnostic, readJsonSnapshot, validateClosure, main };
if (require.main === module) process.exitCode = main(process.argv.slice(2));
