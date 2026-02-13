export const count = 1;
export async function sum() {
  const module = await import('./depSelf.js');
  return module.count + count;
}
