"use client";
import { GetOrders } from "@/app/api/page";
import { useEffect, useState } from "react";
import { FindController } from "@/app/server-components/FindController";
import { runBinanceScrape, stopBinanceScrape } from "@/app/api/binance";

const ControlPanel = () => {
  const [count, setCount] = useState<number>(0);
  const [storedPrices, setStoredPrices] = useState<Ticker[] | undefined>();
  const [big_storedPrices, setBig_StoredPrices] = useState<
    Ticker[] | undefined
  >();
  const [running, setRunning] = useState<boolean>(false);
  const [pending, setPending] = useState<boolean>(false);
  const [big_pending, setBig_Pending] = useState<boolean>(false);
  const [binanceScrape, setBinanceScrape] = useState<boolean>(false);
  const [binanceSpend, setBinanceSpend] = useState<number>(10);
  const [binancePurchases, setBinancePurchases] = useState<Order[]>();

  //general settings
  const amountPerTrade = 5; //dollar value ( eg: 1.5 )
  const dayVolumeOver = 140000; //only trade with tokens that have daily volume over X
  const dayChangeUnder = 120; // only trade with tokens with daily change under X

  //small interval settings
  const dipToBuy = -6; // % dip to buy ( eg: -5 )
  const profitToSell = 3; // % profit to sell ( eg: 5 )
  const interval = 6000; // ms between price checks

  //large interval settings
  const big_dipToBuy = -7; // % dip to buy ( eg: -5 )
  const big_profitToSell = 3.5; // % profit to sell ( eg: 5 )
  const big_interval = 2; // check for big dips every X small intervals ( eg: 4 )

  //loop for checking dips
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | undefined;

    const updatePrices = async () => {
      setPending(true);
      const newPrices = await FindController(
        "buy",
        dipToBuy,
        profitToSell,
        amountPerTrade,
        storedPrices,
        dayVolumeOver,
        dayChangeUnder
      );
      setStoredPrices(newPrices as Ticker[]);
      if (count === 0) {
        setBig_StoredPrices(newPrices as Ticker[]);
      }
      if (count < big_interval) {
        setCount(count + 1);
      }
      setPending(false);
    };

    if (running && !pending) {
      timeoutId = setTimeout(updatePrices, interval);
    }

    if (!running && timeoutId) {
      clearTimeout(timeoutId);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [running, dipToBuy, interval, storedPrices, count, pending]);

  //loop for checking larger dips at larger intervals
  useEffect(() => {
    const updateBigPrices = async () => {
      const bigInterval = true;
      setBig_Pending(true);
      await FindController(
        "buy",
        big_dipToBuy,
        big_profitToSell,
        amountPerTrade,
        big_storedPrices,
        dayVolumeOver,
        dayChangeUnder,
        bigInterval
      );
      setBig_Pending(false);
      setCount(0);
    };

    if (running && !big_pending && count === big_interval) {
      updateBigPrices();
    }
  }, [running, big_dipToBuy, interval, big_storedPrices, count, big_pending]);

  const logOrders = async () => {
    const orders = await GetOrders("finished");
    console.log(orders);
  };

  const toggleBinanceScrape = async () => {
    if (!binanceScrape) {
      runBinanceScrape(binanceSpend);
      setBinanceScrape(true);
    } else {
      stopBinanceScrape();
      setBinanceScrape(false);
    }
  };

  return (
    <div className="flex flex-row gap-6">
      <button className="p-2 border border-white" onClick={() => logOrders()}>
        Get Orders
      </button>
      <button
        className="p-2 border border-white"
        onClick={() => setRunning(true)}
      >
        Start Price Watcher
      </button>
      <button
        className="p-2 border border-white"
        onClick={() => setRunning(false)}
      >
        Stop Price Watcher
      </button>

      <button className="p-2 border border-white" onClick={toggleBinanceScrape}>
        {binanceScrape
          ? "Binance New Listing Scraping ON"
          : "Binance New Listing Scraping OFF"}
      </button>
    </div>
  );
};

export default ControlPanel;
