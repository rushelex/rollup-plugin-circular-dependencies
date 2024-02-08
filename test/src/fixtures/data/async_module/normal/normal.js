export const sum = async () => {
  const data3Module = await import('./data/data3.js');
  const result = data3Module.count1 + (await getGlobalImportData());
  return result;
};

async function getGlobalImportData() {
  const modules = ['./data/data1', './data/data2', './data/data3'];
  const result = Object.values(modules).reduce(async (pre, item) => {
    const module = await item();
    return (await pre) + Object.values(module).reduce((pre, item) => pre + item, 0);
  }, Promise.resolve(0));
  return result;
}
