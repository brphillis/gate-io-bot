"use server";

import { makeid } from "../utility/StringHelpers";
import { CreateOrder } from "./page";

let active = true;
let lastArticle: string;
let amountToSpend = 10;
let binanceListings: Order[] = [];

export const runBinanceScrape = async (amount: number) => {
  amountToSpend = amount;
  active = true;
  runScrapeEvery5Seconds();
  return true;
};

export const stopBinanceScrape = async () => {
  active = false;
  return false;
};

export const getBinancePurchases = async () => {
  return binanceListings;
};

export const scrapeArticleTitles = async () => {
  console.log("running");
  const url =
    "https://www.binance.com/bapi/composite/v1/public/cms/article/catalog/list/query?catalogId=48&pageNo=1&pageSize=1";

  try {
    const response = await fetch(url, { cache: "no-store" });
    const obj = await response.text();
    const { articles } = JSON.parse(obj).data;
    const newArticle = articles[0].title;

    if (lastArticle) {
      if (lastArticle !== newArticle) {
        lastArticle = newArticle;

        const binanceToAddPair =
          newArticle.includes("Binance Adds") &&
          newArticle.includes("Trading Pairs");

        if (binanceToAddPair) {
          // we convert the binance string to a gate.io pair
          const titleWords = newArticle.split(" ");
          const newPairs = titleWords.filter((e: string) =>
            e.includes("/USDT")
          );
          const convertedNewPairs = newPairs.map((e: string) => {
            const token = e.slice(0, -5);
            return token + "_USDT";
          });

          let batchOrder: Order[] = [];

          for (var i = 0; i < convertedNewPairs.length; i++) {
            const orderData: Order = {
              text: `t-${makeid(6)}`,
              currency_pair: convertedNewPairs[i],
              type: "market",
              account: "spot",
              side: "buy",
              amount: amountToSpend.toString(),
              time_in_force: "ioc",
            };
            // batch orders must be a maximum of 4
            if (batchOrder.length < 4) {
              batchOrder.push(orderData);
            }
          }

          if (convertedNewPairs.length > 0) {
            const res = await CreateOrder(batchOrder);

            const successfulOrders = await res.filter(({ id }: Order) => id);

            if (successfulOrders.length > 0) {
              successfulOrders.forEach((order: Order) => {
                binanceListings.push(order);
              });
            }
          }
        }
      }
    }

    if (!lastArticle) {
      lastArticle = newArticle;
    }
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
};

const runScrapeEvery5Seconds = () => {
  scrapeArticleTitles()
    .then(() => {
      if (active) setTimeout(runScrapeEvery5Seconds, 5000);
    })
    .catch((error) => {
      console.error("Error:", error);
      setTimeout(runScrapeEvery5Seconds, 5000);
    });
};
