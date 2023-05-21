"use client";
import { GetOrders } from "@/app/api/page";
import { useEffect, useState } from "react";
import { FindController } from "@/app/server-components/FindController";
import { runBinanceScrape, stopBinanceScrape } from "@/app/api/binance-scraper";
import { makeid } from "@/app/server-utility/StringHelpers";
import { runGateScrape, stopGateScrape } from "@/app/api/gate-scraper";
import Link from "next/link";
import Image from "next/image";

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
  const [binanceSpend, setBinanceSpend] = useState<number>(30);
  const [gateScrape, setGateScrape] = useState<boolean>(false);
  const [gateSpend, setGateSpend] = useState<number>(30);

  //general settings
  const [botInterval, setBotInterval] = useState<number>(6000); // ms between price checks
  const [amountPerTrade, setAmountPerTrade] = useState<number>(5); //dollar value ( eg: 1.5 )
  const [minDipToBuy, setMinDipToBuy] = useState<number>(-2); // min % dip to buy ( eg: -5 )
  const [maxDipToBuy, setMaxDipToBuy] = useState<number>(-4); // max % dip to buy ( eg: -5 )
  const [profitToSell, setProfitToSell] = useState<number>(3); // % profit to sell ( eg: 5 )
  const [dayVolumeOver, setDayVolumeOver] = useState<number>(140000); //only trade with tokens that have daily volume over X
  const [dayChangeUnder, setDayChangeUnder] = useState<number>(120); // only trade with tokens with daily change under X
  const [dayChangeOver, setDayChangeOver] = useState<number>(0); // only trade with tokens with daily change under X

  //large interval settings
  const big_minDipToBuy = -50; // min % dip to buy ( eg: -5 )
  const big_maxDipToBuy = -100; // max % dip to buy ( eg: -5 )
  const big_profitToSell = 5; // % profit to sell ( eg: 5 )
  const big_interval = 4; // check for big dips every X small intervals ( eg: 4 )

  //loop for checking dips
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | undefined;

    const updatePrices = async () => {
      setPending(true);
      const { newPrices, messages: newMessages } = await FindController(
        "buy",
        minDipToBuy,
        maxDipToBuy,
        profitToSell,
        amountPerTrade,
        storedPrices,
        dayVolumeOver,
        dayChangeUnder,
        dayChangeOver
      );
      setStoredPrices(newPrices as Ticker[]);

      setQueryCount(queryCount + 1);
      setMessages(() => {
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
    minDipToBuy,
    maxDipToBuy,
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
        big_minDipToBuy,
        big_maxDipToBuy,
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
    big_minDipToBuy,
    big_maxDipToBuy,
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
    <div
      className="
    flex flex-col flex-wrap items-center justify-center gap-6
    p-6 h-max max-w-[99vw] w-[680px]
     rounded-md bg-zinc-900/70"
    >
      <div className="flex flex-row flex-wrap justify-center gap-12 max-w-[99vw]">
        {/* ORDERS */}
        <Link href="https://github.com/brphillis" target="_blank">
          <Image
            width="0"
            height="0"
            className="h-14 w-14 mt-4 cursor-pointer"
            alt="githubLogo"
            src="./github-mark-white.svg"
          />
        </Link>

        {/* PURCHASE BOT BUTTON */}
        <div className="flex flex-col items-center">
          <div className="text-white/80 mb-1">Purchase Bot</div>
          <button
            className={`btn w-[120px] ${running ? "btn-success" : "btn-error"}`}
            onClick={() => setRunning(!running)}
          >
            {running ? "Running" : "Stopped"}
          </button>
        </div>

        {/* BINANCE WATCHER CONTROL BUTTON */}
        <div className="flex flex-col items-center">
          <div className="text-white/80 mb-1">Binance Watcher</div>
          <button
            className={`btn w-[120px] ${
              binanceScrape ? "btn-success" : "btn-error"
            }`}
            onClick={toggleBinanceScrape}
          >
            {binanceScrape ? "Running" : "Stopped"}
          </button>
        </div>

        {/* GATE WATCHER CONTROL BUTTON */}
        <div className="flex flex-col items-center">
          <div className="text-white/80 mb-1">Gate Watcher</div>
          <button
            className={`btn w-[120px] ${
              gateScrape ? "btn-success" : "btn-error"
            }`}
            onClick={toggleGateScrape}
          >
            {gateScrape ? "Running" : "Stopped"}
          </button>
        </div>
      </div>

      <div className="form-control w-[97%] flex-wrap max-w-[99vw]">
        <label className="label">
          <span className="label-text text-xs">Purchase Bot Settings</span>
        </label>
        <div className="flex flex-row items-center justify-center gap-6 flex-wrap border border-white/40 pt-2 pb-4 px-6 rounded-lg">
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
                onChange={(e) => setAmountPerTrade(parseFloat(e.target.value))}
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
                <span className="label-text text-xs">min % dip to buy</span>
              </label>
              <input
                type="number"
                placeholder="number"
                defaultValue={minDipToBuy}
                className="input input-bordered input-sm w-[120px] max-w-xs"
                onChange={(e) => setMinDipToBuy(parseFloat(e.target.value))}
              />
            </div>

            <div className="form-control w-max max-w-xs">
              <label className="label">
                <span className="label-text text-xs">max % dip to buy</span>
              </label>
              <input
                type="number"
                placeholder="number"
                defaultValue={maxDipToBuy}
                className="input input-bordered input-sm w-[120px] max-w-xs"
                onChange={(e) => setMaxDipToBuy(parseFloat(e.target.value))}
              />
            </div>
          </div>

          <div>
            <div className="form-control w-max max-w-xs">
              <label className="label">
                <span className="label-text text-xs">% daily change over</span>
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
                <span className="label-text text-xs">% daily change under</span>
              </label>
              <input
                type="number"
                placeholder="number"
                defaultValue={dayChangeUnder}
                className="input input-bordered input-sm w-[120px] max-w-xs"
                onChange={(e) => setDayChangeUnder(parseFloat(e.target.value))}
              />
            </div>
          </div>

          <div>
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
        </div>
      </div>

      <div className="form-control w-[97%]">
        <label className="label">
          <span className="label-text text-xs">Scraper Settings</span>
        </label>
        <div className="flex flex-row gap-6 flex-wrap items-center justify-center border border-white/40 pt-2 pb-4 px-6 rounded-lg">
          <div className="form-control w-max max-w-xs">
            <label className="label">
              <span className="label-text text-xs">$ binance spend</span>
            </label>
            <input
              type="number"
              placeholder="number"
              defaultValue={binanceSpend}
              className="input input-bordered input-sm w-[120px] max-w-xs"
              onChange={(e) => setBinanceSpend(parseFloat(e.target.value))}
            />
          </div>

          <div className="form-control w-max max-w-xs">
            <label className="label">
              <span className="label-text text-xs">$ gate.io spend</span>
            </label>
            <input
              type="number"
              placeholder="number"
              defaultValue={gateSpend}
              className="input input-bordered input-sm w-[120px] max-w-xs"
              onChange={(e) => setGateSpend(parseFloat(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="relative p-2 border border-white/50 rounded-lg mt-4 w-full h-[320px] overflow-hidden">
        <div className="relative flex flex-col-reverse  h-[100%] w-[100%]">
          {queryCount > 0 && <p>query({queryCount})...</p>}
          {messages.length > 1 &&
            messages.map((e: any) => {
              return <p key={makeid(20)}>{e}</p>;
            })}
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
