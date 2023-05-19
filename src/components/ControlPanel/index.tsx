"use client";
import { GetOrders } from "@/app/api/page";
import { useEffect, useState } from "react";
import { FindController } from "@/app/server-components/FindController";
import { runBinanceScrape, stopBinanceScrape } from "@/app/api/binance";
import { makeid } from "@/app/utility/StringHelpers";

const ControlPanel = () => {
  const [messages, setMessages] = useState<string[]>([]);
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
  const dayChangeOver = 0; // only trade with tokens with daily change under X

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
      const { newPrices, messages: newMessages } = await FindController(
        "buy",
        dipToBuy,
        profitToSell,
        amountPerTrade,
        storedPrices,
        dayVolumeOver,
        dayChangeUnder,
        dayChangeOver
      );
      setStoredPrices(newPrices as Ticker[]);
      setMessages([...newMessages, ...messages]);

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
  }, [running, dipToBuy, interval, storedPrices, count, pending, messages]);

  //loop for checking larger dips at larger intervals
  useEffect(() => {
    const updateBigPrices = async () => {
      const bigInterval = true;
      setBig_Pending(true);
      const { messages: newMessages } = await FindController(
        "buy",
        big_dipToBuy,
        big_profitToSell,
        amountPerTrade,
        big_storedPrices,
        dayVolumeOver,
        dayChangeUnder,
        dayChangeOver,
        bigInterval
      );
      setMessages([...newMessages, ...messages]);
      setBig_Pending(false);
      setCount(0);
    };

    if (running && !big_pending && count === big_interval) {
      updateBigPrices();
    }
  }, [
    running,
    big_dipToBuy,
    interval,
    big_storedPrices,
    count,
    big_pending,
    messages,
  ]);

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
    <div className="flex flex-row flex-wrap gap-6">
      {/* <button className="p-2 border border-white" onClick={() => logOrders()}>
        Get Orders
      </button> */}
      <div className="flex flex-col items-center justify-center border-white border p-6 rounded-md">
        <div className="flex flex-row justify-center gap-12">
          {/* PURCHASE BOT BUTTON */}
          <div className="flex flex-col items-center">
            <div className="font-white">Purchase Bot</div>
            <button
              className="p-2 border border-white mt-2 w-[120px]"
              onClick={() => setRunning(!running)}
            >
              {running ? "Running" : "Stopped"}
            </button>
          </div>

          {/* BINANCE WATCHER CONTROL BUTTON */}
          <div className="flex flex-col items-center">
            <div className="font-white">Binance Watcher</div>
            <button
              className="p-2 border border-white mt-2 w-[120px]"
              onClick={toggleBinanceScrape}
            >
              {binanceScrape ? "Running" : "Stopped"}
            </button>
          </div>
        </div>

        {/* MESSAGES */}
        <div className="relative p-2 border border-white mt-4 w-[360px] h-[320px] overflow-hidden">
          <div className="relative flex flex-col-reverse  h-[100%] w-[100%]">
            {messages &&
              messages.map((e: any) => {
                return <p key={makeid(10)}>{e}</p>;
              })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
