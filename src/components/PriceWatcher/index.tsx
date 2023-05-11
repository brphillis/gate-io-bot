"use client";
import { CreateOrder, GetPrices } from "@/app/GateMethods/page";
import { getPercentageChange } from "@/utility/NumberHelpers";
import { CurrencyPair } from "gate-api";
import { ApiKeyAuth } from "gate-api";
import { useEffect, useState } from "react";
type Props = {};

const PriceWatcher = (props: Props) => {
  const [searching, setSearching] = useState<boolean>(false);
  const [storedPrices, setStoredPrices] = useState<Ticker[]>();
  const [active, setActive] = useState<boolean>(true);
  const [activeBuys, setActiveBuys] = useState<PlacedOrder[]>([]);

  const fetchPrices = async () => {
    try {
      const res: Ticker[] = await GetPrices();
      if (!storedPrices) {
        setStoredPrices(res);
        console.log(res);
      }
      return res;
    } catch (err) {
      console.log(err);
    }
  };

  const findDippedPrices = async (mode: "buy" | "find") => {
    if (!searching) {
      setSearching(true);
      const newPrices = await fetchPrices();

      const priceSearchTimer = setTimeout(() => {
        if (storedPrices && newPrices) {
          let results: CurrencyOfInterest[] = [];

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
              dipAmount < -3 &&
              isUSDTPair &&
              oldMatchesNew &&
              notNewListing
            ) {
              results.push({ currencyPair, last, change: dipAmount });
            }
          });
          setStoredPrices(newPrices);
          clearTimeout(priceSearchTimer);
          setSearching(false);
          if (results.length > 0) {
            console.log(`${results.length} DIPS`, results);

            if (mode === "buy") {
              buyDips(results);
            }
          } else {
            console.log("no dips!");
            return;
          }
        } else {
          clearTimeout(priceSearchTimer);
          setSearching(false);
          return;
        }
      }, 0);
    }
  };

  const buyDips = async (currencyToBuy: CurrencyOfInterest[]) => {
    try {
      for (var i = 0; i < currencyToBuy.length; i++) {
        const orderData: Order = {
          currency_pair: currencyToBuy[0].currencyPair,
          type: "limit",
          price: currencyToBuy[0].last,
          account: "spot",
          side: "buy",
          amount: (1.5 / parseFloat(currencyToBuy[0].last)).toString(),
          time_in_force: "gtc",
        };
        const res = await CreateOrder(orderData);
        if (res.id) {
          setActiveBuys([{ ...res }, ...activeBuys]);
        }
        console.log("RES", res);
      }
      console.log(currencyToBuy);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    console.log("Placed Orders", activeBuys);
  }, [activeBuys]);

  // useEffect(() => {
  //   if(currencyToBuy){
  //     buyDips();
  //   }
  // }, [currencyToBuy, buyDips])

  // useEffect(() => {
  //   if (!searching && active) {
  //     findDippedPrices();
  //   }
  // }, [searching, active]);

  // const order = async () => {
  //   const orderData: Order = {
  //     currency_pair: "SIS_USDT",
  //     type: "limit",
  //   price:
  //     account: "spot",
  //     side: "sell",
  //     amount: "1",
  //     time_in_force: "ioc",
  //   };
  //   const res = await CreateOrder(orderData);
  //   console.log(res);
  // };

  return (
    <div className="flex flex-row gap-6">
      <button className="p-2 border border-white" onClick={() => fetchPrices()}>
        Get Prices
      </button>
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
    </div>
  );
};

export default PriceWatcher;
