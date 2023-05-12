export const returnMatchingOrders = (arr1: any, arr2: any) => {
  const matchingObjs = [];

  for (let obj1 of arr1) {
    for (let obj2 of arr2) {
      if (obj1.id === obj2.id) {
        matchingObjs.push(obj1);
        break;
      }
    }
  }
  return matchingObjs;
};
