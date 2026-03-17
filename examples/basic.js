/**
 * ATAP Basic Example
 * Demonstrates all three components in under 50 lines.
 */

'use strict';

const atap = require('../index');

async function main() {
  console.log('=== ATAP — Basic Example ===\n');

  // ── 1. Configure policies ──────────────────────────────────────
  atap.consent.setPolicy('finance', 'send_payment', {
    limit:            500,
    require_approval: true,
    reason:           'Payments above $500 require owner approval'
  });

  atap.consent.setPolicy('devops', 'delete_file', {
    require_approval: true,
    reason:           'File deletion requires explicit permission'
  });

  atap.consent.setPolicy('devops', 'restart_process', {
    reason:           'DevOps can restart processes freely'
  });

  // ── 2. Configure agent priorities ─────────────────────────────
  atap.arbitration.setPriority('devops',      8);
  atap.arbitration.setPriority('coordinator', 7);
  atap.arbitration.setPriority('finance',     5);
  atap.arbitration.setPriority('hr',          3);

  // ── 3. Consent Engine ──────────────────────────────────────────
  console.log('① CONSENT ENGINE\n');

  const r1 = atap.consent.check('finance', 'send_payment', { amount: 300, approved: true });
  console.log('finance → send_payment $300:', r1.allowed ? '✅ Allowed' : '🚫 Blocked');
  console.log('  reason:', r1.reason, '\n');

  const r2 = atap.consent.check('finance', 'send_payment', { amount: 900 });
  console.log('finance → send_payment $900:', r2.allowed ? '✅ Allowed' : '🚫 Blocked');
  console.log('  reason:', r2.reason, '\n');

  const r3 = atap.consent.check('devops', 'restart_process', {});
  console.log('devops → restart_process:   ', r3.allowed ? '✅ Allowed' : '🚫 Blocked');
  console.log('  reason:', r3.reason, '\n');

  // ── 4. Guard (Consent + Audit in one call) ─────────────────────
  console.log('② GUARD (Consent + Audit)\n');

  const ok = await atap.guard('finance', 'send_payment', { amount: 300 });
  if (ok.allowed) {
    await atap.audit.log('finance', 'send_payment',
      'Paid Anthropic API invoice for March 2026',
      { source: 'invoice #1234', result: 'success' }
    );
    console.log('Payment processed and recorded.\n');
  }

  // ── 5. Audit Chain ─────────────────────────────────────────────
  console.log('③ AUDIT CHAIN\n');

  await atap.audit.log('hr', 'reject_candidate',
    'Revenue declined per Intelligence agent report',
    { source: 'intelligence/last_trends' }
  );

  await atap.audit.log('devops', 'restart_process',
    'jarvis-api process was consuming 84% CPU, auto-restarted',
    { files: ['jarvis-api.js'], result: 'success' }
  );

  const report = await atap.audit.report();
  console.log(report, '\n');

  // ── 6. Arbitration ─────────────────────────────────────────────
  console.log('④ ARBITRATION\n');

  const conflict = atap.arbitration.resolve('devops', 'coordinator',
    'Who controls agent restarts?'
  );
  console.log('Decision:', conflict.decision);
  console.log('Reason:', conflict.reason, '\n');

  // ── 7. Status ──────────────────────────────────────────────────
  console.log('⑤ STATUS\n');
  const s = await atap.status();
  console.log(JSON.stringify(s, null, 2));
}

main().catch(console.error);
