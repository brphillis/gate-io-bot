import { getPercentageChange } from "@/utility/NumberHelpers";
import { GetPrices } from "../../api/page";
import { BuyHandler } from "../BuyHandler";
import { SellHandler } from "../SellHandler";

export const FindController = async (
  mode: "buy" | "find",
  dipToBuy: number,
  profitToSell: number,
  amountPerTrade: number,
  storedPrices: Ticker[]
) => {
  const fetchPrices = async () => {
    try {
      const res: Ticker[] = await GetPrices();
      if (!storedPrices) {
        storedPrices = res;
        console.log("bot started, initial prices - ", storedPrices);
        console.log(`spending $${amountPerTrade} per trade`);
        console.log(`buying the dips at ${dipToBuy}%`);
        console.log(`selling at a profit of ${profitToSell}%`);
      }
      return res;
    } catch (err) {
      console.log(err);
    }
  };
  const newPrices = await fetchPrices();
  let results: CurrencyOfInterest[] = [];
  if (storedPrices && newPrices) {
    newPrices.forEach(
      ({ currencyPair, last, changePercentage, quoteVolume }, i) => {
        const storedName = storedPrices[i].currencyPair;
        const newName = currencyPair;
        const oldMatchesNew = storedName === newName;
        const isUSDTPair = newName.includes("_USDT");
        const isLongToken = newName.split("_")[0].slice(-2).includes("3L");
        const isShortToken = newName.split("_")[0].slice(-2).includes("3S");
        const dailyChangeUnder = parseFloat(changePercentage) < 100;
        const baseVolumeOver = parseFloat(quoteVolume) > 60000;

        const newPrice = parseFloat(last);
        const oldPrice = parseFloat(storedPrices[i].last);
        const dipAmount = getPercentageChange(newPrice, oldPrice);
        if (
          dipAmount < dipToBuy &&
          isUSDTPair &&
          oldMatchesNew &&
          !isShortToken &&
          !isLongToken &&
          dailyChangeUnder &&
          baseVolumeOver
        ) {
          results.push({ currencyPair, last, change: dipAmount });
        }
      }
    );

    storedPrices = newPrices;
    if (results.length > 0) {
      console.log(`${results.length} DIPS`, results);
      if (mode === "buy") {
        const boughtDips = await BuyHandler(amountPerTrade, results);
        if (boughtDips) {
          const successfulPurchases = await SellHandler(
            boughtDips,
            profitToSell
          );
          if (successfulPurchases) {
            console.log("sell orders successful-", successfulPurchases);
            return newPrices;
          }
        } else {
          console.log("failed to buy dips");
          return newPrices;
        }
      }
    } else {
      console.log("no dips");
      return newPrices;
    }
  } else {
    console.log("could not find prices to store");
    return newPrices;
  }
  return newPrices;
};
