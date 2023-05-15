"use server";

import { getPercentageChange } from "@/app/utility/NumberHelpers";
import { GetPrices } from "../../api/page";
import { BuyHandler } from "../BuyHandler";
import { SellHandler } from "../SellHandler";

export const FindController = async (
  mode: "buy" | "find",
  dipToBuy: number,
  profitToSell: number,
  amountPerTrade: number,
  storedPrices: Ticker[] | undefined,
  bigInterval?: boolean
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
        const storedName = storedPrices![i].currencyPair;
        const newName = currencyPair;
        const oldMatchesNew = storedName === newName;
        const isUSDTPair = newName.includes("_USDT");
        const isLongToken = newName.split("_")[0].slice(-2).includes("3L");
        const isShortToken = newName.split("_")[0].slice(-2).includes("3S");
        const dailyChangeUnder = parseFloat(changePercentage) < 130;
        const baseVolumeOver = parseFloat(quoteVolume) > 50000;
        const newPrice = parseFloat(last);
        const oldPrice = parseFloat(storedPrices![i].last);
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

    if (results.length > 0) {
      console.log(`${results.length} DIPS`, results);
      if (mode === "buy") {
        const boughtDips = await BuyHandler(amountPerTrade, results);
        if (boughtDips[0].id) {
          const successfulPurchases = await SellHandler(
            boughtDips,
            profitToSell
          );
          if (successfulPurchases[0].id) {
            console.log("sell orders successful-", successfulPurchases);
          } else {
            console.log("sell orders failed-", successfulPurchases);
          }
        } else {
          console.log("failed to buy dips");
        }
      }
    } else {
      if (!bigInterval) {
        console.log("no dips");
      }
      if (bigInterval) {
        console.log("no big dips");
      }
    }
  } else {
    console.log("could not find prices to store");
  }
  return newPrices;
};
