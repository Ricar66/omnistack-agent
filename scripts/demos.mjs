import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { totalCents as beforeCart } from '../examples/showcase/cart/before.mjs';
import { totalCents as afterCart } from '../examples/showcase/cart/after.mjs';
import { canDelete as beforePermissions } from '../examples/showcase/permissions/before.mjs';
import { canDelete as afterPermissions } from '../examples/showcase/permissions/after.mjs';
import { listOpenTasks as beforeTasks } from '../examples/showcase/tasks/before.mjs';
import { listOpenTasks as afterTasks } from '../examples/showcase/tasks/after.mjs';

export function checkCart(totalCents) {
  const items = Object.freeze([
    Object.freeze({ unitPriceCents: 1250, quantity: 2 }),
    Object.freeze({ unitPriceCents: 350, quantity: 1 }),
  ]);
  const result = totalCents(items);
  assert.equal(result, 2850, 'two-item total must be 2850 cents');
  assert.equal(typeof result, 'number', 'total must remain numeric');
  assert.equal(totalCents([]), 0, 'empty cart must total zero');
  assert.equal(totalCents([{ unitPriceCents: 1, quantity: 3 }]), 3);
}

export function checkPermissions(canDelete) {
  const member = { role: 'member' };
  assert.equal(canDelete(member), false, 'a member cannot delete');
  assert.deepEqual(member, { role: 'member' }, 'checking access cannot change the role');
  assert.equal(canDelete(Object.freeze({ role: 'admin' })), true);
  assert.equal(canDelete(Object.freeze({ role: 'Admin' })), false);
  assert.equal(canDelete(Object.freeze({})), false);
}

export function checkTasks(listOpenTasks) {
  const tasks = Object.freeze([
    Object.freeze({ id: 1, done: true }),
    Object.freeze({ id: 2, done: false }),
    Object.freeze({ id: 3, done: false }),
    Object.freeze({ id: 4, done: true }),
    Object.freeze({ id: 5, done: false }),
  ]);
  assert.deepEqual(listOpenTasks(tasks), [tasks[1], tasks[2], tasks[4]]);
  assert.deepEqual(listOpenTasks(tasks, 0), [], 'zero limit must return no tasks');
  assert.deepEqual(listOpenTasks(tasks, 1), [tasks[1]], 'limit applies after filtering');
  assert.deepEqual(listOpenTasks(tasks, 8), [tasks[1], tasks[2], tasks[4]]);
  assert.deepEqual(listOpenTasks([], 1), []);
  for (const limit of [-1, 1.5, NaN, Infinity, '1', null, true, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => listOpenTasks(tasks, limit), RangeError, 'invalid limits must be rejected');
  }
  assert.equal(tasks.length, 5);
  assert.deepEqual(tasks.map(task => task.id), [1, 2, 3, 4, 5]);
}

const CASES = [
  { name: 'cart', before: beforeCart, after: afterCart, check: checkCart },
  { name: 'permissions', before: beforePermissions, after: afterPermissions, check: checkPermissions },
  { name: 'tasks', before: beforeTasks, after: afterTasks, check: checkTasks },
];

export function runDemos() {
  return CASES.map(({ name, before, after, check }) => {
    let reproduced = false;
    try {
      check(before);
    } catch (error) {
      if (!(error instanceof assert.AssertionError)) throw error;
      reproduced = true;
    }
    if (!reproduced) throw new Error(`Demo ${name}: the initial fixture no longer reproduces its failure`);
    check(after);
    return { name, reproduced, solutionPassed: true };
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    for (const result of runDemos()) {
      process.stdout.write(`${result.name}: initial check failed as expected; solution checks passed\n`);
    }
    process.stdout.write('3 maintainer-authored demonstrations verified; no model responses evaluated.\n');
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}