import { randomFillSync } from "node:crypto";

const array = new BigUint64Array(1);

function random64() {
  randomFillSync(array);

  return array[0];
}

function sumDigitsSquared(num) {
  let total = 0n;

  while (num > 0) {
    const numModBase = num % 10n;
    total += numModBase ** 2n;
    num /= 10n;
  }

  return total;
}

function isHappy(num) {
  while (num !== 1n && num !== 4n) {
    num = sumDigitsSquared(num);
  }

  return num === 1n;
}

function isHappyCoin(num) {
  return isHappy(num) && num % 10_000n === 0n;
}

let count = 0;

for (let i = 1; i < 10_000_000; i++) {
  const randomNumber = random64();

  if (isHappyCoin(randomNumber)) {
    process.stdout.write(`${randomNumber.toString()} `);
    count++;
  }
}

process.stdout.write(`\ncount: ${count}`);
