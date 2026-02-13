/* eslint-disable ts/no-unsafe-return */
import { sum as circleDepSum } from './circleDep/circleDep';
import { sum as depSelfSum } from './depSelf/depSelf';
import { sum as indirectCircleDepSum } from './indirectCircleDep/indirectCircleDep';
import { sum as normalSum } from './normal/normal';

export async function asyncSum() {
  return (await normalSum()) + (await circleDepSum()) + (await depSelfSum()) + (await indirectCircleDepSum());
}
