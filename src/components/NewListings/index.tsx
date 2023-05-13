"use client";

import { GetCurrencies } from "@/app/api/page";
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

      console.log("current found", foundCurrencies);

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
    <div className="flex flex-col items-center justify-center p-4 border border-white w-max h-max">
      <div>
        <div className="flex flex-col items-center justify-center">
          <p>{`${
            searching ? "Searching..." : "Not Searching"
          } - Query ${queryCount}`}</p>
        </div>

        <div className="flex flex-row items-center justify-center gap-6 m-6">
          <button
            className="p-2 border border-white"
            onClick={() => setSearching(true)}
          >
            start
          </button>

          <button
            className="p-2 border border-white"
            onClick={() => setSearching(false)}
          >
            stop
          </button>
        </div>

        <div>
          <div>Newly Listed Currencies ...</div>
          {newCurrencies.length > 0 && (
            <div className="max-h-[200px] overflow-y-scroll bg-slate-400 text-black p-2">
              {newCurrencies.map(({ currency, delisted }: Currency) => {
                if (!delisted)
                  return (
                    <div
                      key={
                        currency +
                        Math.floor(Math.random() * 9999999).toString()
                      }
                    >
                      {currency}
                    </div>
                  );
              })}
            </div>
          )}
          {newCurrencies.length === 0 && (
            <div className="text-center">
              {searching ? "loading more..." : "search"}
            </div>
          )}
        </div>
      </div>
      <div className="mt-4">
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
