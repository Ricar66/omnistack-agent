// Educational in-memory account: one currency, all amounts in integer cents.
export class BankAccount {
  #owner;
  #balanceCents;

  constructor(owner, openingCents = 0) {
    if (typeof owner !== 'string' || owner.trim().length === 0) {
      throw new TypeError('owner must be a non-empty string');
    }
    if (!Number.isSafeInteger(openingCents) || openingCents < 0) {
      throw new RangeError('openingCents must be a non-negative safe integer');
    }
    this.#owner = owner.trim();
    this.#balanceCents = openingCents;
  }

  get owner() { return this.#owner; }
  get balanceCents() { return this.#balanceCents; }

  deposit(amountCents) {
    if (!Number.isSafeInteger(amountCents) || amountCents <= 0) {
      throw new RangeError('amountCents must be a positive safe integer');
    }
    const nextBalance = this.#balanceCents + amountCents;
    if (!Number.isSafeInteger(nextBalance)) {
      throw new RangeError('balanceCents would exceed the safe integer range');
    }
    this.#balanceCents = nextBalance;
  }
}
