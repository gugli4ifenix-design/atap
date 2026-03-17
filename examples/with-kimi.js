/**
 * ATAP + Kimi 2.5 Integration Example
 *
 * Shows how to integrate ATAP into an agent system using
 * Moonshot Kimi 2.5 API (OpenClaw / similar frameworks).
 *
 * Pattern:
 *   1. Before task — load decision history (Context Injector)
 *   2. Declare file scope (Scope Guard)
 *   3. Before each action — check consent (Consent Engine)
 *   4. After each action — record decision (Audit Chain)
 *   5. If agents conflict — resolve (Arbitration Protocol)
 */

'use strict';

const atap = require('../index');

// ── Configure your system ──────────────────────────────────────────────────────

// Define what agents are allowed to do
atap.consent.setPolicy('coder', 'write_file', {
  reason: 'Coder can write files freely within declared scope'
});

atap.consent.setPolicy('coder', 'delete_file', {
  require_approval: true,
  reason: 'File deletion requires explicit owner confirmation'
});

atap.consent.setPolicy('coder', 'external_request', {
  limit:  20,
  reason: 'Max 20 external API calls per session'
});

// Set agent priorities
atap.arbitration.setPriority('coder',    5);
atap.arbitration.setPriority('reviewer', 7);
atap.arbitration.setPriority('deployer', 8);

// Escalate conflicts to your notification channel
atap.arbitration.onEscalate(async (event) => {
  console.log(`\n⚖️ HUMAN DECISION REQUIRED`);
  console.log(`Conflict: ${event.agents.join(' vs ')}`);
  console.log(`Question: ${event.question}`);
  console.log(`Context: ${event.context}\n`);
  // In production: send to Telegram, Slack, email, etc.
});

// ── The agent wrapper ──────────────────────────────────────────────────────────

/**
 * Wraps your Kimi agent call with ATAP accountability.
 *
 * @param {string} projectName  - Project identifier (for decision history)
 * @param {string} userMessage  - What the user asked
 * @param {string[]} scopeFiles - Files this task is allowed to touch
 * @param {Function} kimiCall   - Your actual Kimi API call function
 */
async function runAgent(projectName, userMessage, scopeFiles, kimiCall) {

  // ── Step 1: Load decision history ────────────────────────────
  const history = await atap.audit.report(projectName, 10);
  const contextInjection = history !== `[${projectName}] No decisions recorded yet.`
    ? `\n\n=== DECISION HISTORY ===\n${history}\n=== END HISTORY ===\n`
    : '';

  // ── Step 2: Declare scope ─────────────────────────────────────
  console.log(`[ATAP] Scope declared: ${scopeFiles.join(', ')}`);
  await atap.audit.log(projectName, 'scope_declared',
    `Task started. Declared scope: ${scopeFiles.join(', ')}`,
    { files: scopeFiles }
  );

  // ── Step 3: Check consent before starting ─────────────────────
  const consent = atap.consent.check('coder', 'write_file', {});
  if (!consent.allowed) {
    console.log(`[ATAP] Task blocked: ${consent.reason}`);
    return { error: consent.reason };
  }

  // ── Step 4: Run the actual agent ──────────────────────────────
  const prompt = userMessage + contextInjection;
  let response;

  try {
    response = await kimiCall(prompt);
  } catch (e) {
    await atap.audit.log(projectName, 'agent_error',
      `Agent failed: ${e.message}`,
      { result: 'error' }
    );
    return { error: e.message };
  }

  // ── Step 5: Record what was done ──────────────────────────────
  await atap.audit.log(projectName, 'task_completed',
    `Completed: "${userMessage.slice(0, 80)}"`,
    {
      files:  response.files_modified || scopeFiles,
      result: 'success',
      source: 'user_request'
    }
  );

  // ── Step 6: Verify scope was respected ───────────────────────
  const touchedFiles = response.files_modified || [];
  const outOfScope = touchedFiles.filter(f =>
    !scopeFiles.some(s => f.includes(s) || s.includes(f))
  );

  if (outOfScope.length > 0) {
    await atap.audit.log(projectName, 'scope_violation',
      `Agent touched files outside declared scope: ${outOfScope.join(', ')}`,
      { files: outOfScope, result: 'warning' }
    );
    console.warn(`[ATAP] ⚠️ Scope violation: ${outOfScope.join(', ')}`);
  }

  return response;
}

// ── Example usage ──────────────────────────────────────────────────────────────

async function main() {
  console.log('=== ATAP + Kimi Integration Example ===\n');

  // Simulate a Kimi API call
  const mockKimi = async (prompt) => {
    console.log('[Kimi] Received prompt with', prompt.split('\n').length, 'lines');
    return {
      text:           'Created authentication module',
      files_modified: ['src/auth.js', 'src/middleware.js'],
    };
  };

  // Run the agent with accountability
  const result = await runAgent(
    'my-project',
    'Add user authentication to the dashboard',
    ['src/auth.js', 'src/middleware.js', 'src/routes.js'],
    mockKimi
  );

  console.log('\nResult:', result);

  // Show the audit trail
  console.log('\n--- Audit Trail ---');
  console.log(await atap.audit.report('my-project'));
}

main().catch(console.error);
