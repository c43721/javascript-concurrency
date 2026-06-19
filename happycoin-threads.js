import { randomFillSync } from "node:crypto";
import {
  Worker,
  isMainThread,
  parentPort,
  threadId,
} from "node:worker_threads";

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

const THREAD_COUNT = 4;

if (isMainThread) {
  let inFlight = THREAD_COUNT;

  let count = 0;

  for (let i = 0; i < THREAD_COUNT; i++) {
    const worker = new Worker(import.meta.filename);

    worker.on("message", (message) => {
      if (message === "done") {
        if (--inFlight === 0) {
          process.stdout.write(`count: ${count}\n`);
        }

        console.log(`worker ${worker.threadId}: done`);
      } else if (typeof message === "bigint") {
        process.stdout.write(`${message} `);
        count++;
      }
    });
  }
} else {
  const jobsToProcess = 10_000_000 / THREAD_COUNT;
  console.log(`worker ${threadId} jobs ${jobsToProcess}`);

  for (let i = 1; i < jobsToProcess; i++) {
    const randomNumber = random64();
    if (isHappyCoin(randomNumber)) {
      parentPort.postMessage(randomNumber);
    }
  }

  parentPort.postMessage("done");
}
