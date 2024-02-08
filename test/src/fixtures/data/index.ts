import { asyncSum } from './async_module';
import { sum } from './sync_module';

async function run() {
  const sumResult = await sum();

  const asyncSumResult = await asyncSum();

  console.info('sumResult :>>', sumResult);
  console.info('asyncSumResult :>>', asyncSumResult);
}

run();
