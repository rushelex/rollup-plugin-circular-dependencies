export async function count() {
  const module2 = await import('./data2');
  const module3 = await import('./data3');
  return (await module2.count()) + (await module3.count());
}
