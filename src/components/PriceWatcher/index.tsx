"use client";
import { CreateOrder, GetOrders, GetPrices } from "@/app/GateMethods/page";
import {
  addPercentage,
  getPercentageChange,
  subtractPercentage,
} from "@/utility/NumberHelpers";
import { useCallback, useEffect, useState } from "react";
import { returnMatchingOrders } from "@/utility/OrderHelpers";
type Props = {};

const PriceWatcher = (props: Props) => {
  const [storedPrices, setStoredPrices] = useState<Ticker[]>();
  const [purchasedTokens, setPurchasedTokens] = useState<PurchasedToken[]>([]);
  const [count, setCount] = useState<number>(0);
  const [interval, setInterval] = useState<typeof setTimeout>();
  // let interval: ReturnType<typeof setTimeout>;
  const buyInUSDT = 1.5;

  useEffect(() => {
    console.log("PURCHASED TOKENS", purchasedTokens);
  }, [purchasedTokens]);

  useEffect(() => {
    console.log("PURCHASED TOKENS", purchasedTokens);
  }, [purchasedTokens]);

  const handlePendingOrders = async () => {
    console.log("handling pending orders");
    const orders = await GetOrders("finished");

    if (orders.length > 0) {
      const matchingOrders = returnMatchingOrders(purchasedTokens, orders);

      if (matchingOrders) {
        try {
          // for each matching order create limit sell for token
          for (var i = 0; i < matchingOrders.length; i++) {
            console.log("MATCHING ORDERS", matchingOrders);
            var calcNetworkFee = subtractPercentage(
              matchingOrders[i].amount,
              0.05
            );
            const orderData: Order = {
              currency_pair: matchingOrders[i].currency_pair,
              type: "limit",
              price: addPercentage(matchingOrders[i].price, 5),
              account: "spot",
              side: "sell",
              amount: (calcNetworkFee - matchingOrders[i].fee).toString(),
              time_in_force: "gtc",
            };
            console.log("data of sell object", orderData);
            const res = await CreateOrder(orderData);
            if (res.id) {
              //SUCCESS SELL ORDER and remove token from array
              console.log("successful sell order", res);
              setPurchasedTokens(
                purchasedTokens.filter((e) => e.id !== matchingOrders[i].id)
              );
            } else {
              //FAILED SELL ORDER
              console.log("failed sell order", res);
            }
          }
        } catch (err) {
          //API ERROR
          console.log(err);
        }
      }
    }

    //check to see if limit buy is aged, if so cancel the order
    // for (var i = 0; i < purchasedTokens.length; i++) {
    //   if (purchasedTokens[i].create_time_ms > 999999999) {
    //     //if aged, post cancel
    //   }
    // }
  };

  const buyDips = async (results: CurrencyOfInterest[]) => {
    console.log("buying dipped prices");
    let boughtDips: PurchasedToken[] = [];
    try {
      for (var i = 0; i < results.length; i++) {
        const orderData: Order = {
          currency_pair: results[i].currencyPair,
          type: "limit",
          price: results[i].last,
          account: "spot",
          side: "buy",
          amount: (buyInUSDT / parseFloat(results[i].last)).toString(),
          time_in_force: "fok",
        };
        const res = await CreateOrder(orderData);
        console.log(res);
        if (res.id) {
          boughtDips.push(res);
        } else {
        }
      }
      if (boughtDips.length > 0) {
        console.log("boughtDips.length > 0");
        setPurchasedTokens([...boughtDips, ...purchasedTokens]);
        handlePendingOrders();
      }
    } catch (err) {
      console.log(err);
    }
  };

  const findDippedPrices = async (mode: "buy" | "find") => {
    const fetchPrices = async () => {
      try {
        const res: Ticker[] = await GetPrices();
        if (!storedPrices) {
          setStoredPrices(res);
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
        if (dipAmount < -5 && isUSDTPair && oldMatchesNew && notNewListing) {
          results.push({ currencyPair, last, change: dipAmount });
        }
      });

      setStoredPrices(newPrices);
      if (results.length > 0) {
        console.log(`${results.length} DIPS`, results);
        if (mode === "buy") {
          buyDips(results);
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
      {/* <PurchasedTokenHandler
        purchasedTokens={purchasedTokens}
        setPurchasedTokens={setPurchasedTokens}
      /> */}
    </div>
  );
};

export default PriceWatcher;
