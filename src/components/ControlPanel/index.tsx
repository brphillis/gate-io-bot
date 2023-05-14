"use client";
import { GetOrders } from "@/app/api/page";
import { useEffect, useState } from "react";
import { FindController } from "@/app/server-components/FindController";
type Props = {};

const ControlPanel = (props: Props) => {
  const amountPerTrade = 30; //dollar value ( eg: 1.5 )
  const dipToBuy = -4; // % dip to buy ( eg: -5 )
  const profitToSell = 3; // % profit to sell ( eg: 5 )
  const interval = 4500; // ms between price checks

  const [storedPrices, setStoredPrices] = useState<Ticker[] | undefined>();
  const [running, setRunning] = useState<boolean>(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | undefined;

    const updatePrices = async () => {
      const newPrices = await FindController(
        "buy",
        dipToBuy,
        profitToSell,
        amountPerTrade,
        storedPrices
      );
      setStoredPrices(newPrices as Ticker[]);
      timeoutId = setTimeout(updatePrices, interval);
    };

    if (running) {
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
  }, [running, dipToBuy, interval, storedPrices]);

  return (
    <div className="flex flex-row gap-6">
      {/* <button className="p-2 border border-white" onClick={() => fetchPrices()}>
        Get Prices
      </button> */}
      {/* <button
        className="p-2 border border-white"
        onClick={() => findDippedPrices("find")}
      >
        Find Dips
      </button> */}

      <button
        className="p-2 border border-white"
        onClick={() => GetOrders("finished")}
      >
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
      {/* <PurchasedTokenHandler
        purchasedTokens={purchasedTokens}
        setPurchasedTokens={setPurchasedTokens}
      /> */}
    </div>
  );
};

export default ControlPanel;
