"use server";

import parse from "node-html-parser";
import { makeid } from "../server-utility/StringHelpers";
import { CreateOrder } from "./page";

let active = true;
let lastTickers: string[];
let amountToSpend = 10;
let purchasedTickers: Order[] = [];

export const runGateScrape = async (amount: number) => {
  amountToSpend = amount;
  active = true;
  runScrapeEvery5Seconds();
  return true;
};

export const stopGateScrape = async () => {
  active = false;
  return false;
};

export const getPurchasedTickers = async () => {
  return purchasedTickers;
};

const getTickersFromString = (inputString: string): string[] => {
  const tickerRegex = /\b[A-Z]{2,}\b/g;
  const tickers = inputString.match(tickerRegex) || [];
  return tickers;
};

const arraysAreIndentical = (arr1: string[], arr2: string[]) => {
  // Check if the lengths of the arrays are the same
  if (arr1.length !== arr2.length) {
    return false;
  }

  // Convert the arrays to strings and compare them
  const string1 = JSON.stringify(arr1);
  const string2 = JSON.stringify(arr2);

  // Compare the strings
  return string1 === string2;
};

export const scrapeGateArticles = async (): Promise<string[]> => {
  console.log("running gate scan");
  const url = "https://www.gate.io/zh-tw/articlelist/ann";

  try {
    const response = await fetch(url);
    const html = await response.text();

    const doc = parse(html);
    const titleElements = doc.querySelectorAll(".latnewslist_item");

    const titles: string[] = Array.from(titleElements).map(
      (titleElement) => titleElement.textContent?.trim() || ""
    );

    const listingAnnouncement = titles.filter(
      (e: string) => e.includes("Has Added") && e.includes("Margin")
    )[0];

    const newTickers = getTickersFromString(listingAnnouncement);

    if (lastTickers) {
      if (!arraysAreIndentical(lastTickers, newTickers)) {
        const newUSDTTickers = newTickers.map((e: string) => {
          return e + "_USDT";
        });

        let batchOrder: Order[] = [];

        for (var i = 0; i < newUSDTTickers.length; i++) {
          const orderData: Order = {
            text: `t-${makeid(6)}`,
            currency_pair: newUSDTTickers[i],
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

        if (newUSDTTickers.length > 0) {
          const res = await CreateOrder(batchOrder);

          const successfulOrders = await res.filter(({ id }: Order) => id);

          if (successfulOrders.length > 0) {
            successfulOrders.forEach((order: Order) => {
              purchasedTickers.push(order);
            });
          }
        }
      }
    }

    if (!lastTickers) {
      lastTickers = newTickers;
    }

    return titles;
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
};

const runScrapeEvery5Seconds = () => {
  scrapeGateArticles()
    .then(() => {
      if (active) setTimeout(runScrapeEvery5Seconds, 5000);
    })
    .catch((error) => {
      console.error("Error:", error);
      setTimeout(runScrapeEvery5Seconds, 5000);
    });
};
