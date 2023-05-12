export const getPercentageChange = (
  newNumber: number,
  oldNumber: number
): number => {
  return ((newNumber - oldNumber) / oldNumber) * 100;
};

export const addPercentage = (
  numString: string,
  percentage: number
): string => {
  const num = BigInt(numString.replace(".", ""));
  const decimalCount = numString.split(".")[1].length;
  const result = num + (num * BigInt(percentage)) / BigInt(100);
  const resultStr = result.toString().padStart(numString.length - 1, "0");

  return `${resultStr.slice(0, -decimalCount)}.${resultStr.slice(
    -decimalCount
  )}`;
};

export const subtractPercentage = (
  numString: string,
  percentage: number
): number => {
  const num = BigInt(numString.replace(".", ""));
  const decimalCount = numString.split(".")[1].length;
  const percentageFraction = BigInt(Math.round(percentage * 100000));
  const result = num - (num * percentageFraction) / BigInt(10000000);
  const resultStr = result.toString().padStart(numString.length - 1, "0");

  return Number(
    `${resultStr.slice(0, -decimalCount)}.${resultStr.slice(-decimalCount)}`
  );
};
