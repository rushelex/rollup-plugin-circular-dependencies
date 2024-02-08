export const count = 1;
export const sum = async () => {
  // eslint-disable-next-line import/no-self-import
  const module = await import('./depSelf.js');
  return module.count + count;
};
