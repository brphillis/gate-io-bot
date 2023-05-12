"use client";
import { GetOrders, GetPrices } from "@/app/GateMethods/page";
import { getPercentageChange } from "@/utility/NumberHelpers";
import { useEffect, useState } from "react";

import { buyDips } from "@/app/BuyDips/page";
import { handlePendingOrders } from "@/app/HandlePendingOrders/page";
type Props = {};

const PriceWatcher = (props: Props) => {
  const amountPerTrade = 10; //dollar value ( eg: 1.5 )
  const dipToBuy = -5; // % dip to buy ( eg: -5 )
  const profitToSell = 4; // % profit to sell ( eg: 5 )
  const interval = 5000; // ms between price checks

  let storedPrices: Ticker[];

  const [intervalId, setIntervalId] = useState<NodeJS.Timer | undefined>();
  const startInterval = () => {
    const id = setInterval(() => {
      findDippedPrices("buy");
    }, interval);
    setIntervalId(id);
  };

  const stopInterval = () => {
    clearInterval(intervalId);
    setIntervalId(undefined);
  };

  const findDippedPrices = async (mode: "buy" | "find") => {
    const fetchPrices = async () => {
      try {
        const res: Ticker[] = await GetPrices();
        if (!storedPrices) {
          // setStoredPrices(res);
          storedPrices = res;
          console.log("initial prices", storedPrices);
        }
        return res;
      } catch (err) {
        console.log(err);
      }
    };

    console.log("searching to buy dipped prices");
    const newPrices = await fetchPrices();

    let results: CurrencyOfInterest[] = [];
    if (storedPrices && newPrices) {
      newPrices.forEach(({ currencyPair, changeUtc0, last }, i) => {
        const storedName = storedPrices[i].currencyPair;
        const newName = currencyPair;
        const oldMatchesNew = storedName === newName;
        const isUSDTPair = newName.includes("_USDT");
        const notNewListing = changeUtc0 !== storedPrices[i].changeUtc8;

        const newPrice = parseFloat(last);
        const oldPrice = parseFloat(storedPrices[i].last);
        const dipAmount = getPercentageChange(newPrice, oldPrice);
        if (
          dipAmount < dipToBuy &&
          isUSDTPair &&
          oldMatchesNew &&
          notNewListing
        ) {
          results.push({ currencyPair, last, change: dipAmount });
        }
      });

      // setStoredPrices(newPrices);
      storedPrices = newPrices;
      if (results.length > 0) {
        console.log(`${results.length} DIPS`, results);
        if (mode === "buy") {
          const boughtDips = await buyDips(amountPerTrade, results);
          if (boughtDips) {
            const successfulPurchases = await handlePendingOrders(
              boughtDips,
              profitToSell
            );
            if (successfulPurchases) {
              console.log("sell orders successful-", successfulPurchases);
            }
          } else {
            console.log("failed to buy dips");
          }
        }
      } else {
        console.log("no dips");
      }
    } else {
      console.log("could not find prices to store");
    }
  };

  return (
    <div className="flex flex-row gap-6">
      {/* <button className="p-2 border border-white" onClick={() => fetchPrices()}>
        Get Prices
      </button> */}
      <button
        className="p-2 border border-white"
        onClick={() => findDippedPrices("find")}
      >
        Find Dips
      </button>
      <button
        className="p-2 border border-white"
        onClick={() => findDippedPrices("buy")}
      >
        Buy Dips
      </button>

      <button
        className="p-2 border border-white"
        onClick={() => GetOrders("finished")}
      >
        Get Orders
      </button>
      <button
        className="p-2 border border-white"
        onClick={() => startInterval()}
      >
        Start Price Watcher
      </button>
      <button
        className="p-2 border border-white"
        onClick={() => stopInterval()}
        disabled={!intervalId}
      >
        Stop Price Watcher
      </button>
      {/* <PurchasedTokenHandler
        purchasedTokens={purchasedTokens}
        setPurchasedTokens={setPurchasedTokens}
      /> */}
    </div>
  );
};

export default PriceWatcher;
