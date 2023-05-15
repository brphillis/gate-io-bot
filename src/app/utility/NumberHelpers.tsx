"use server";

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
  let numstring: string = numString;
  if (!numString.includes(".")) {
    numstring = numString + ".0";
  }
  const num = BigInt(numstring.replace(".", ""));
  const decimalCount = numstring.split(".")[1].length;
  const percentageFraction = BigInt(Math.round(percentage * 100000));
  const resultNum = num + (num * percentageFraction) / BigInt(10000000);
  const resultStr = resultNum.toString().padStart(numstring.length - 1, "0");

  const finalResult = `${resultStr.slice(0, -decimalCount)}.${resultStr.slice(
    -decimalCount
  )}`;

  return toFixed(finalResult);
};

export const subtractPercentage = (
  numString: string,
  percentage: number
): string => {
  let numstring: string = numString;
  if (!numString.includes(".")) {
    numstring = numString + ".0";
  }
  const num = BigInt(numstring.replace(".", ""));
  const decimalCount = numstring.split(".")[1].length;
  const percentageFraction = BigInt(Math.round(percentage * 100000));
  const resultNum = num - (num * percentageFraction) / BigInt(10000000);
  const resultStr = resultNum.toString().padStart(numstring.length - 1, "0");

  const finalResult = `${resultStr.slice(0, -decimalCount)}.${resultStr.slice(
    -decimalCount
  )}`;

  return toFixed(finalResult);
};

export const toFixed = (x: any) => {
  if (Math.abs(x) < 1.0) {
    var e = parseInt(x.toString().split("e-")[1]);
    if (e) {
      x *= Math.pow(10, e - 1);
      x = "0." + new Array(e).join("0") + x.toString().substring(2);
    }
  } else {
    var e = parseInt(x.toString().split("+")[1]);
    if (e > 20) {
      e -= 20;
      x /= Math.pow(10, e);
      x += new Array(e + 1).join("0");
    }
  }
  return x;
};
