"use client";
import { GetOrders } from "@/app/api/page";
import { useState } from "react";
import { FindController } from "@/app/server-components/FindController";
type Props = {};

const ControlPanel = (props: Props) => {
  const amountPerTrade = 20; //dollar value ( eg: 1.5 )
  const dipToBuy = -3; // % dip to buy ( eg: -5 )
  const profitToSell = 3; // % profit to sell ( eg: 5 )
  const interval = 4500; // ms between price checks
  let storedPrices: Ticker[];

  const [intervalId, setIntervalId] = useState<NodeJS.Timer | undefined>();

  const startInterval = async () => {
    const id = setInterval(async () => {
      const newPrices = await FindController(
        "buy",
        dipToBuy,
        profitToSell,
        amountPerTrade,
        storedPrices
      );
      storedPrices = newPrices as Ticker[];
    }, interval);
    setIntervalId(id);
  };

  const stopInterval = () => {
    clearInterval(intervalId);
    setIntervalId(undefined);
  };

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

export default ControlPanel;
