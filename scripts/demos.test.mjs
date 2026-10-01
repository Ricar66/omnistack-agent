import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { checkCart, checkPermissions, checkTasks, runDemos } from './demos.mjs';
import { totalCents as beforeCart } from '../examples/showcase/cart/before.mjs';
import { totalCents as afterCart } from '../examples/showcase/cart/after.mjs';
import { canDelete as beforePermissions } from '../examples/showcase/permissions/before.mjs';
import { canDelete as afterPermissions } from '../examples/showcase/permissions/after.mjs';
import { listOpenTasks as beforeTasks } from '../examples/showcase/tasks/before.mjs';
import { listOpenTasks as afterTasks } from '../examples/showcase/tasks/after.mjs';

test('cart checks reproduce string accumulation and verify exact integer-cent totals', () => {
  assert.throws(() => checkCart(beforeCart), assert.AssertionError);
  checkCart(afterCart);
});

test('permission checks reject unintended access and verify role checks without mutation', () => {
  assert.throws(() => checkPermissions(beforePermissions), assert.AssertionError);
  checkPermissions(afterPermissions);
});

test('task checks cover omission, zero, filtering order, invalid limits and frozen inputs', () => {
  assert.throws(() => checkTasks(beforeTasks), assert.AssertionError);
  checkTasks(afterTasks);
});

test('the demonstration report records all three reproduced failures and passing solutions', () => {
  assert.deepEqual(runDemos(), ['cart', 'permissions', 'tasks'].map(name => ({
    name, reproduced: true, solutionPassed: true,
  })));
});

test('the executable demo command exits successfully and labels its evidence honestly', () => {
  const result = spawnSync(process.execPath, [fileURLToPath(new URL('./demos.mjs', import.meta.url))], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stderr, '');
  assert.equal(result.stdout, [
    'cart: initial check failed as expected; solution checks passed',
    'permissions: initial check failed as expected; solution checks passed',
    'tasks: initial check failed as expected; solution checks passed',
    '3 maintainer-authored demonstrations verified; no model responses evaluated.',
    '',
  ].join('\n'));
});