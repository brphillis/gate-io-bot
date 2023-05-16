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

export const toFixed = (x: any): string => {
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
  } // Convert x to a string without scientific notation

  var str = x.toString();

  if (str.includes("e")) {
    var [integerPart, decimalPart] = str.split("e");

    decimalPart = decimalPart.replace(/^-/, ""); // Remove negative sign if present

    var zeros = parseInt(decimalPart, 10);

    var sign = x < 0 ? "-" : "";

    if (zeros > 0) {
      var decimalDigits = integerPart.split(".");

      if (decimalDigits.length === 1) {
        decimalDigits.push("");
      }

      decimalDigits[1] = decimalDigits[1].padEnd(zeros, "0");

      str = decimalDigits.join(".");
    } else {
      str = integerPart;
    }

    x = sign + str;
  }

  return x.toString();
};

export const calcFee = (amount: string, fee: string) => {
  // Convert the number strings to numbers

  const parsedNum1 = Number(toFixed(amount));

  const parsedNum2 = Number(toFixed(fee)); // Calculate the difference

  let result: string | number = parsedNum1 - parsedNum2; // Determine how many decimals the result will have

  const amountDecimals: number = amount.toString().includes(".")
    ? amount.split(".")[1].length
    : 0;

  const feeDecimals: number = fee.toString().includes(".")
    ? fee.split(".")[1].length
    : 0;

  const resultDecimals: number =
    amountDecimals > feeDecimals ? amountDecimals : feeDecimals; // Round the result to a maximum of 20 decimal places

  result = result.toFixed(resultDecimals); // Remove trailing zeros from the decimal portion

  result = result.replace(/\.?0+$/, ""); // Return the result as a string

  return toFixed(result);
};
