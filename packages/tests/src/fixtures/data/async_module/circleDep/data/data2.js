export async function count() {
  const module = await import('./data1');
  return 2 + (await module.count());
}
