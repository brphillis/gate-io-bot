export async function filterArrayDifference(array1: any, array2: any) {
  try {
    const filteredArray = await Promise.all(
      array1.map(async (obj1: any) => {
        const isPresentInArray2 = await array2.some(
          (obj2: any) => obj2.currency_pair === obj1.currency_pair
        );
        return !isPresentInArray2 ? obj1 : null;
      })
    );
    return filteredArray.filter((obj) => obj !== null);
  } catch (error) {
    console.error(error);
  }
}

// async function filterArrayDifference(array1, array2) {
//   try {
//     const filteredArray = await new Promise(resolve => {
//       const array1Ids = new Set(array1.map(obj => obj.id));
//       const array2Ids = new Set(array2.map(obj => obj.id));
//       const differenceIds = new Set([...array1Ids].filter(id => !array2Ids.has(id)));
//       const filteredArray = array1.filter(obj => differenceIds.has(obj.id));
//       resolve(filteredArray);
//     });
//     return filteredArray;
//   } catch (error) {
//     console.error(error);
//   }
// }

// async function filterArrayDifference(array1, array2) {
//   try {
//     const filteredArray = await new Promise((resolve) => {
//       const array1Ids = new Set(array1.map((obj) => obj.id));
//       const array2Ids = new Set(array2.map((obj) => obj.id));
//       const differenceIds = new Set([...array1Ids].filter((id) => !array2Ids.has(id)));
//       const filteredArray = array1.filter((obj) => differenceIds.has(obj.id));
//       resolve(filteredArray);
//     });
//     return filteredArray;
//   } catch (error) {
//     console.error(error);
//   }
// }
