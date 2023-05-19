"use server";

import Decimal from "decimal.js";

export const getPercentageChange = (
  initialNum: string,
  finalNum: string
): number => {
  const decimalInitialNum = new Decimal(initialNum);
  const decimalFinalNum = new Decimal(finalNum);

  const difference = decimalFinalNum.minus(decimalInitialNum);
  const percentageChange = difference.dividedBy(decimalInitialNum).times(100);

  return parseFloat(percentageChange.toDecimalPlaces(2).toString());
};

export const addPercentage = (num: string, percentage: number): string => {
  const decimalNum = new Decimal(num);
  const decimalPercentage = new Decimal(percentage);
  const result = decimalNum.times(decimalPercentage.plus(100)).dividedBy(100);

  return result.toString();
};

export const subtractPercentage = (num: string, percentage: number): string => {
  const decimalNum = new Decimal(num);
  const decimalPercentage = new Decimal(percentage);
  const result = decimalNum.times(decimalPercentage.minus(100)).dividedBy(100);

  return result.toString();
};

export const subtractNumbers = (num1: string, num2: string): string => {
  const decimalNum1 = new Decimal(num1);
  const decimalNum2 = new Decimal(num2);
  const result = decimalNum1.minus(decimalNum2);

  return result.toString();
};
