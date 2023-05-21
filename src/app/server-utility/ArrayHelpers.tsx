export const filterArrayDifference = async (array1: any, array2: any) => {
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
};
