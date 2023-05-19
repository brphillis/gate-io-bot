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
  dayVolumeOver: number,
  dayChangeUnder: number,
  bigInterval?: boolean
) => {
  const fetchPrices = async () => {
    try {
      const res: Ticker[] = await GetPrices();
      if (!storedPrices) {
        storedPrices = res;
        console.log("bot initiated!");
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

  let results: Ticker[] = [];
  if (storedPrices && newPrices) {
    newPrices.forEach(
      ({ currencyPair, last, changePercentage, quoteVolume }, i) => {
        if (storedPrices) {
          const storedName = storedPrices?.[i]?.currencyPair;
          const newName = currencyPair;
          const oldMatchesNew = storedName === newName;
          const isUSDTPair = newName.includes("_USDT");
          const is3LongToken = newName.split("_")[0].slice(-2).includes("3L");
          const is3ShortToken = newName.split("_")[0].slice(-2).includes("3S");
          const is5LongToken = newName.split("_")[0].slice(-2).includes("5L");
          const is5ShortToken = newName.split("_")[0].slice(-2).includes("5S");
          const dailyChangeUnder =
            parseFloat(changePercentage) < dayChangeUnder;
          const baseVolumeOver = parseFloat(quoteVolume) > dayVolumeOver;
          const newPrice = last;
          const oldPrice = storedPrices[i].last;
          const dipAmount = getPercentageChange(newPrice, oldPrice);

          if (
            dipAmount < dipToBuy &&
            isUSDTPair &&
            oldMatchesNew &&
            !is3ShortToken &&
            !is3LongToken &&
            !is5ShortToken &&
            !is5LongToken &&
            dailyChangeUnder &&
            baseVolumeOver
          ) {
            results.push({
              currencyPair,
              last,
              quoteVolume,
              change: dipAmount,
            });
          }
        }
      }
    );

    if (results.length > 0) {
      results.forEach(({ currencyPair, change }: Ticker) => {
        console.log(
          `${"found dip! - " + currencyPair + " - " + "change: " + change}`
        );
      });

      if (mode === "buy") {
        // handing the purchase order
        const boughtDips = await BuyHandler(amountPerTrade, results);

        const purchaseSuccess = boughtDips?.some(
          ({ amount, left }: Order) => amount !== left
        );
        const purchaseCancelled = boughtDips?.every(
          ({ amount, left }: Order) => amount === left
        );
        const purchaseError = boughtDips?.every(
          ({ message }: Error) => message
        );

        if (purchaseSuccess) {
          boughtDips?.forEach(({ currency_pair }: Order) => {
            console.log(`purchased ${currency_pair}`);
          });

          //handling the sell order
          const sellOrders = await SellHandler(boughtDips, profitToSell);

          const sellSuccess = sellOrders.some(
            ({ succeeded }: Order) => succeeded === true
          );
          const sellCancelled = sellOrders.some(
            ({ succeeded }: Order) => succeeded === false
          );
          const sellError = sellOrders.every(({ message }: Error) => message);

          if (sellSuccess) {
            sellOrders?.forEach(({ currency_pair }: Order) => {
              console.log(`placed sell order for ${currency_pair}`);
            });
          }

          // passing the sell order errors
          if (sellCancelled) {
            console.log("a sell order has failed");
            console.log(sellOrders);
          }
          if (sellError) {
            sellOrders?.forEach(({ message }: Error) => {
              console.log("failed to sell order - ", message);
            });
          }
        }

        // passing the purchase order errors
        if (purchaseCancelled) {
          console.log("orders could not be filled");
        }
        if (purchaseError) {
          purchaseError.forEach(({ message }: Error) => {
            console.log("purchase error: ", message);
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
