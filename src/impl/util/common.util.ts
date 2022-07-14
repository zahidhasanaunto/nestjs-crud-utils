export const gen4digitRandomNumber = () => {
  return Math.floor(1000 + Math.random() * 9000);
};

export const asyncForEach = async (array: any[], callback: any) => {
  if (!Array.isArray(array)) {
    throw Error('Expected an array');
  }
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

export const spilledFullName = (fullName: string) => {
  const name = fullName.split(' ');
  const firstName = name[0] || '';
  const lastName = name[1] || '';
  return { firstName, lastName };
};

export const ArrayGroupByAttribute = (array: any[], attr: string): any => {
  const result = array.reduce((r, a) => {
    r[a[attr]] = r[a[attr]] || [];
    r[a[attr]].push(a);
    return r;
  }, Object.create(null));
  return result;
};
