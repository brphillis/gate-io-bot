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
        const isThreeLongToken = newName.split("_")[0].slice(-2).includes("3L");
        const isThreeShortToken = newName
          .split("_")[0]
          .slice(-2)
          .includes("3S");
        const isFiveLongToken = newName.split("_")[0].slice(-2).includes("3L");
        const isFiveShortToken = newName.split("_")[0].slice(-2).includes("3S");
        const dailyChangeUnder = parseFloat(changePercentage) < 110;
        const baseVolumeOver = parseFloat(quoteVolume) > 80000;
        const newPrice = parseFloat(last);
        const oldPrice = parseFloat(storedPrices![i].last);
        const dipAmount = getPercentageChange(newPrice, oldPrice);

        if (
          dipAmount < dipToBuy &&
          isUSDTPair &&
          oldMatchesNew &&
          !isThreeShortToken &&
          !isThreeLongToken &&
          !isFiveShortToken &&
          !isFiveLongToken &&
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
        let attempts = 0;
        let boughtDips;

        while (attempts < 4) {
          boughtDips = await BuyHandler(amountPerTrade, results);

          if (boughtDips.some((obj: any) => obj.status !== "cancelled")) {
            break;
          }

          attempts++;
        }

        if (boughtDips.some((obj: any) => obj.status !== "cancelled")) {
          boughtDips.forEach(({ currency_pair }: PurchasedToken) => {
            console.log(`purchased ${currency_pair}`);
          });
          const successfulPurchases = await SellHandler(
            boughtDips,
            profitToSell
          );

          if (successfulPurchases.some((obj: any) => obj.succeeded === true)) {
            console.log("result of sell order - ", successfulPurchases);
            successfulPurchases.forEach(({ currency_pair }: PurchasedToken) => {
              console.log(`placed sell order for ${currency_pair}`);
            });
          } else {
            successfulPurchases.forEach((error: any) => {
              console.log("failed to sell order - ", error.message);
            });
          }
        }
        if (boughtDips.every((obj: any) => obj.status === "cancelled")) {
          console.log("orders could not be filled");
        } else {
          boughtDips.forEach((error: any) => {
            console.log(
              "immediate or cancel order has cancelled",
              error.message
            );
          });
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
