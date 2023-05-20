"use client";
import { GetOrders } from "@/app/api/page";
import { useEffect, useState } from "react";
import { FindController } from "@/app/server-components/FindController";
import { runBinanceScrape, stopBinanceScrape } from "@/app/api/binance";
import { makeid } from "@/utility/StringHelpers";
import { runGateScrape, stopGateScrape } from "@/app/api/gateannouncements";

const ControlPanel = () => {
  const [queryCount, setQueryCount] = useState<number>(0);
  const [messages, setMessages] = useState<string[]>(["..."]);
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

  const [gateScrape, setGateScrape] = useState<boolean>(false);
  const [gateSpend, setGateSpend] = useState<number>(10);

  //general settings
  const [botInterval, setBotInterval] = useState<number>(6000); // ms between price checks
  const [amountPerTrade, setAmountPerTrade] = useState<number>(5); //dollar value ( eg: 1.5 )
  const [dipToBuy, setDipToBuy] = useState<number>(-6); // % dip to buy ( eg: -5 )
  const [profitToSell, setProfitToSell] = useState<number>(3); // % profit to sell ( eg: 5 )
  const [dayVolumeOver, setDayVolumeOver] = useState<number>(140000); //only trade with tokens that have daily volume over X
  const [dayChangeUnder, setDayChangeUnder] = useState<number>(120); // only trade with tokens with daily change under X
  const [dayChangeOver, setDayChangeOver] = useState<number>(0); // only trade with tokens with daily change under X

  //large interval settings
  const big_dipToBuy = -7; // % dip to buy ( eg: -5 )
  const big_profitToSell = 3; // % profit to sell ( eg: 5 )
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

      setQueryCount(queryCount + 1);
      setMessages((e: any) => {
        if (newMessages[0] !== messages[0]) {
          return [...newMessages, ...messages];
        } else return messages;
      });

      if (count === 0) {
        setBig_StoredPrices(newPrices as Ticker[]);
      }
      if (count < big_interval) {
        setCount(count + 1);
      }
      setPending(false);
    };

    if (running && !pending) {
      timeoutId = setTimeout(updatePrices, botInterval);
    }

    if (!running && timeoutId) {
      clearTimeout(timeoutId);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [
    running,
    dipToBuy,
    botInterval,
    storedPrices,
    count,
    pending,
    messages,
    amountPerTrade,
    profitToSell,
    dayChangeOver,
    dayChangeUnder,
    dayVolumeOver,
    queryCount,
  ]);

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
      setQueryCount(queryCount + 1);
      setMessages((e: any) => {
        if (newMessages[0] !== messages[0]) {
          return [...newMessages, ...messages];
        } else return messages;
      });

      setBig_Pending(false);
      setCount(0);
    };

    if (running && !big_pending && count === big_interval) {
      updateBigPrices();
    }
  }, [
    running,
    big_dipToBuy,
    botInterval,
    big_storedPrices,
    count,
    big_pending,
    messages,
    amountPerTrade,
    dayChangeOver,
    dayChangeUnder,
    dayVolumeOver,
    queryCount,
  ]);

  useEffect(() => {
    if (!running) {
      setStoredPrices(undefined);
      setQueryCount(0);
    }
  }, [running]);

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

  const toggleGateScrape = async () => {
    if (!gateScrape) {
      runGateScrape(gateSpend);
      setGateScrape(true);
    } else {
      stopGateScrape();
      setGateScrape(false);
    }
  };

  return (
    <div className="flex flex-row flex-wrap gap-6">
      <div className="flex flex-col items-center justify-center border-white border p-6 rounded-md gap-6">
        <div className="flex flex-row justify-center gap-12">
          {/* ORDERS */}
          <button
            className="p-2 border border-white mt-2 w-[120px]"
            onClick={() => logOrders()}
          >
            Get Recent Orders
          </button>
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

          {/* GATE WATCHER CONTROL BUTTON */}
          <div className="flex flex-col items-center">
            <div className="font-white">Gate Watcher</div>
            <button
              className="p-2 border border-white mt-2 w-[120px]"
              onClick={toggleGateScrape}
            >
              {gateScrape ? "Running" : "Stopped"}
            </button>
          </div>
        </div>

        <div className="form-control w-max">
          <label className="label">
            <span className="label-text text-xs">Purchase Bot Settings</span>
          </label>
          <div className="flex flex-row gap-6 flex-wrap border border-white/40 pt-2 pb-4 px-6 rounded-lg">
            <div>
              <div className="form-control w-max max-w-xs">
                <label className="label">
                  <span className="label-text text-xs">$ amount per trade</span>
                </label>
                <input
                  type="number"
                  placeholder="number"
                  defaultValue={amountPerTrade}
                  className="input input-bordered input-sm w-[120px] max-w-xs"
                  onChange={(e) =>
                    setAmountPerTrade(parseFloat(e.target.value))
                  }
                />
              </div>
              <div className="form-control w-max max-w-xs">
                <label className="label">
                  <span className="label-text text-xs">interval (ms)</span>
                </label>
                <input
                  type="number"
                  placeholder="number"
                  defaultValue={botInterval}
                  className="input input-bordered input-sm w-[120px] max-w-xs"
                  onChange={(e) => setBotInterval(parseFloat(e.target.value))}
                />
              </div>
            </div>

            <div>
              <div className="form-control w-max max-w-xs">
                <label className="label">
                  <span className="label-text text-xs">% dip to buy</span>
                </label>
                <input
                  type="number"
                  placeholder="number"
                  defaultValue={dipToBuy}
                  className="input input-bordered input-sm w-[120px] max-w-xs"
                  onChange={(e) => setDipToBuy(parseFloat(e.target.value))}
                />
              </div>

              <div className="form-control w-max max-w-xs">
                <label className="label">
                  <span className="label-text text-xs">% profit to sell</span>
                </label>
                <input
                  type="number"
                  placeholder="number"
                  defaultValue={profitToSell}
                  className="input input-bordered input-sm w-[120px] max-w-xs"
                  onChange={(e) => setProfitToSell(parseFloat(e.target.value))}
                />
              </div>
            </div>

            <div>
              <div className="form-control w-max max-w-xs">
                <label className="label">
                  <span className="label-text text-xs">
                    % daily change over
                  </span>
                </label>
                <input
                  type="number"
                  placeholder="number"
                  defaultValue={dayChangeOver}
                  className="input input-bordered input-sm w-[120px] max-w-xs"
                  onChange={(e) => setDayChangeOver(parseFloat(e.target.value))}
                />
              </div>

              <div className="form-control w-max max-w-xs">
                <label className="label">
                  <span className="label-text text-xs">
                    % daily change under
                  </span>
                </label>
                <input
                  type="number"
                  placeholder="number"
                  defaultValue={dayChangeUnder}
                  className="input input-bordered input-sm w-[120px] max-w-xs"
                  onChange={(e) =>
                    setDayChangeUnder(parseFloat(e.target.value))
                  }
                />
              </div>
            </div>

            <div className="form-control w-max max-w-xs">
              <label className="label">
                <span className="label-text text-xs">$ daily volume over</span>
              </label>
              <input
                type="number"
                placeholder="number"
                defaultValue={dayVolumeOver}
                className="input input-bordered input-sm w-[120px] max-w-xs"
                onChange={(e) => setDayVolumeOver(parseFloat(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* MESSAGES */}
        <div className="relative p-2 border border-white mt-4 w-full h-[320px] overflow-hidden">
          <div className="relative flex flex-col-reverse  h-[100%] w-[100%]">
            {queryCount > 0 && <p>query({queryCount})...</p>}
            {messages.length > 1 &&
              messages.map((e: any) => {
                return <p key={makeid(20)}>{e}</p>;
              })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
