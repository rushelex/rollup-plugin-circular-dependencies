export async function count() {
  const module = await import('./data1');
  return 3 + (await module.count());
}
