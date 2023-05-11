export const getPercentageChange = (
  newNumber: number,
  oldNumber: number
): number => {
  return ((newNumber - oldNumber) / oldNumber) * 100;
};
