export const count = async () => {
  const module = await import('./data3');
  return 2 + (await module.count());
};
