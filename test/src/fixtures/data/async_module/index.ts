// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { sum as circleDepSum } from './circleDep/circleDep';
import { sum as depSelfSum } from './depSelf/depSelf';
import { sum as indirectCircleDepSum } from './indirectCircleDep/indirectCircleDep';
import { sum as normalSum } from './normal/normal';

export const asyncSum = async () => {
  return (await normalSum()) + (await circleDepSum()) + (await depSelfSum()) + (await indirectCircleDepSum());
};
