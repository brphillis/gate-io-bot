"use client";

import { GetCurrencies } from "@/app/GateMethods/page";
import { useEffect, useState } from "react";
import { filterArrayDifference } from "@/utility/ArrayHelpers";

type Props = {};

const NewListings = (props: Props) => {
  const [currencies, setCurrencies] = useState<Currency[]>();
  const [newCurrencies, setNewCurrencies] = useState<Currency[]>([]);
  const [searching, setSearching] = useState<boolean>();
  const [queryCount, setQueryCount] = useState<number>(0);

  useEffect(() => {
    const findSetNewCurrencies = async () => {
      console.log("finding");
      const res: Currency[] = await GetCurrencies();
      const foundCurrencies = (await filterArrayDifference(
        res,
        currencies
      )) as Currency[];

      if (foundCurrencies && foundCurrencies.length > 0) {
        console.log("Found Currencies");
        setNewCurrencies([...foundCurrencies]);
      }
      setQueryCount(queryCount + 1);
    };

    if (searching) {
      findSetNewCurrencies();
    }
  }, [currencies, newCurrencies, searching, queryCount]);

  useEffect(() => {
    if (searching) console.log("searching");
    if (!searching) console.log("not searching");
  }, [searching]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await GetCurrencies();
      setCurrencies(data);
    };
    fetchData().catch(console.error);
  }, []);

  return (
    <div className="flex flex-col items-center justify-between min-h-screen p-24">
      <div>
        <button onClick={() => setSearching(true)}>start</button>
        <br />
        <br />
        <button onClick={() => setSearching(false)}>stop</button>
        <br />
        <br />
        <h1>Newly Listed Currencies ...</h1>
        <div className="max-h-[200px] overflow-y-scroll">
          {newCurrencies.length > 0 &&
            newCurrencies.map(({ currency, delisted }: Currency) => {
              if (!delisted)
                return (
                  <div
                    key={
                      currency + Math.floor(Math.random() * 9999999).toString()
                    }
                  >
                    {currency}
                  </div>
                );
            })}
        </div>
      </div>
      <div>
        <h1>Current Currencies ...</h1>
        <div className="max-h-[200px] overflow-y-scroll">
          {currencies &&
            currencies.map(({ currency, delisted }: Currency) => {
              if (!delisted)
                return (
                  <div
                    key={
                      currency + Math.floor(Math.random() * 9999999).toString()
                    }
                  >
                    {currency}
                  </div>
                );
            })}
        </div>
      </div>
    </div>
  );
};

export default NewListings;
