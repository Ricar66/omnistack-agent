import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BankAccount } from '../examples/bank-account.mjs';

test('an account starts at zero cents and trims its owner name', () => {
  const account = new BankAccount('  Ada  ');
  assert.equal(account.owner, 'Ada');
  assert.equal(account.balanceCents, 0);
});

test('an account rejects absent, non-string and blank owners', () => {
  for (const owner of [undefined, null, '', ' \t\n ', 42, {}, ['Ada']]) {
    assert.throws(() => new BankAccount(owner), /owner/);
  }
});

test('an account rejects invalid opening cents without coercion', () => {
  for (const amount of [-1, 0.5, NaN, Infinity, -Infinity, '100', null, true, 1n, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => new BankAccount('Ada', amount));
  }
});

test('deposits add integer cents exactly across multiple operations', () => {
  const account = new BankAccount('Ada', 100);
  account.deposit(50);
  account.deposit(1);
  assert.equal(account.balanceCents, 151);
});

test('deposits reject invalid amounts and leave the balance unchanged', () => {
  const account = new BankAccount('Ada', 100);
  for (const amount of [0, -1, 0.5, NaN, Infinity, -Infinity, '50', undefined, null, true, 1n, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => account.deposit(amount));
    assert.equal(account.balanceCents, 100);
  }
});

test('a deposit may reach the largest safe integer cent balance', () => {
  const account = new BankAccount('Ada', Number.MAX_SAFE_INTEGER - 1);
  account.deposit(1);
  assert.equal(account.balanceCents, Number.MAX_SAFE_INTEGER);
});

test('overflowing deposits fail before mutating the balance', () => {
  const account = new BankAccount('Ada', Number.MAX_SAFE_INTEGER);
  assert.throws(() => account.deposit(1), /balanceCents/);
  assert.equal(account.balanceCents, Number.MAX_SAFE_INTEGER);
});

test('external assignments cannot replace owner or balance invariants', () => {
  const account = new BankAccount('Ada', 100);
  assert.throws(() => { account.owner = ' '; }, TypeError);
  assert.throws(() => { account.balanceCents = -1; }, TypeError);
  assert.equal(account.owner, 'Ada');
  assert.equal(account.balanceCents, 100);
});
