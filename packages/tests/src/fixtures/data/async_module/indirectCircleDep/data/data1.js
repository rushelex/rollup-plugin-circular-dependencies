export async function count() {
  const module = await import('./data2');
  return 1 + (await module.count());
}
