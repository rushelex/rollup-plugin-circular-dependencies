/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable ts/no-unsafe-assignment */
import { asyncSum } from './async_module';
import { sum } from './sync_module';

async function run() {
  // @ts-expect-error - unused variables for tests
  const sumResult = await sum();

  // @ts-expect-error - unused variables for tests
  const asyncSumResult = await asyncSum();
}

void run();
