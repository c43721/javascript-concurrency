import { randomFillSync } from "node:crypto";
import { fileURLToPath } from "node:url";
import {
  Worker,
  isMainThread,
  parentPort,
  threadId,
} from "node:worker_threads";

const array = new BigUint64Array(1);

function random64() {
  randomFillSync(array);

  return array;
}

function sumDigitsSquared(num) {
  let bigInt = BigInt(num);
  let total = 0n;

  while (num > 0) {
    const numModBase = bigInt % 10n;
    total += numModBase ** 2n;
    bigInt /= 10n;
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

const THREAD_COUNT = 4;

if (isMainThread) {
  let inFlight = THREAD_COUNT;

  let count = 0;

  for (let i = 0; i < THREAD_COUNT; i++) {
    const worker = new Worker(fileURLToPath(import.meta.url));

    worker.on("message", (message) => {
      if (message === "done") {
        console.log(`${worker.threadId}: done`);
        if (--inFlight === 0) {
          process.stdout.write(`count: ${count}\n`);
        } else if (typeof msg === "bigint") {
          process.stdout.write(`${message} `);
          count++;
        }
      }
    });
  }
} else {
  const jobsToProcess = 1_000_000 / THREAD_COUNT;
  console.log(`worker ${threadId} jobs ${jobsToProcess}`);

  for (let i = 1; i < jobsToProcess; i++) {
    const randomNumber = random64();
    if (isHappyCoin(randomNumber)) {
      parentPort.postMessage(randomNumber);
    }
  }

  parentPort.postMessage("done");
}
