"use server";

import { createHash, createHmac } from "crypto";
import { SpotApi } from "gate-api";
import { ApiClient } from "gate-api";

const client = new ApiClient().setApiKeySecret(
  process.env.NEXT_PUBLIC_GATEIO_NORMAL!,
  process.env.NEXT_PUBLIC_GATEIO_SECRET!
);

const spotApi = new SpotApi(client);
const host = "https://api.gateio.ws";
const prefix = "/api/v4";
const base_headers = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

const genSign = (
  method: string,
  url: string,
  query_string: string,
  payload_string?: string
) => {
  const key = process.env.NEXT_PUBLIC_GATEIO_NORMAL!;
  const secret = process.env.NEXT_PUBLIC_GATEIO_SECRET!;

  const t = Math.floor(Date.now() / 1000);
  const m = createHash("sha512");
  m.update((payload_string || "").toString(), "utf-8");
  const hashed_payload = m.digest("hex");
  const s = `${method}\n${url}\n${query_string || ""}\n${hashed_payload}\n${t}`;
  const sign = createHmac("sha512", secret).update(s, "utf-8").digest("hex");

  return { KEY: key, Timestamp: t.toString(), SIGN: sign };
};

export const GetCurrencies = async () => {
  let currencies;
  await spotApi.listCurrencies().then(
    (value: any) => (currencies = value.body),
    (error: any) => console.error(error)
  );
  if (currencies) {
    return JSON.parse(JSON.stringify(currencies));
  }
};

export const GetPrices = async () => {
  const opts = {
    // currencyPair: "USDT",
    timezone: "utc0",
  };
  let results;
  await spotApi.listTickers(opts).then(
    (value: any) => {
      results = value.body.sort(alphabeticalTickers);
    },
    (error: any) => {
      return error;
    }
  );
  return JSON.parse(JSON.stringify(results));
};

export const CreateOrder = async (order: Order) => {
  const url = "/spot/orders";
  const query_param = "";
  const body = JSON.stringify(order);
  const sign_headers = {
    ...genSign("POST", prefix + url, query_param, body),
    ...base_headers,
  };

  const options = {
    method: "POST",
    headers: sign_headers,
    body: body,
  };

  try {
    const res = await fetch(host + prefix + url, options);
    const json = await res.json();
    return json;
  } catch (err) {
    console.error(err);
  }
};

export const GetOrders = async (status: "open" | "finished") => {
  const url = "/spot/orders";
  const query_param = `status=${status}`;
  const sign_headers = {
    ...genSign("GET", prefix + url, query_param),
    ...base_headers,
  };

  const options = {
    method: "GET",
    headers: sign_headers,
  };

  try {
    const res = await fetch(host + prefix + url + "?" + query_param, options);
    const json = await res.json();
    return json;
  } catch (err) {
    console.error("ERROR", err);
  }
};

const alphabeticalTickers = (a: Ticker, b: Ticker) => {
  if (a.currencyPair < b.currencyPair) {
    return -1;
  }
  if (a.currencyPair > b.currencyPair) {
    return 1;
  }
  return 0;
};

export default async function GateMethods({ data }: any) {
  return <div></div>;
}
