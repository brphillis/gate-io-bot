"use server";

import { SpotApi } from "gate-api";
import { ApiClient } from "gate-api";

const client = new ApiClient().setApiKeySecret(
  process.env.NEXT_PUBLIC_GATEIO_NORMAL!,
  process.env.NEXT_PUBLIC_GATEIO_SECRET!
);

export const GetCurrencies = async () => {
  const api = await new SpotApi(client);
  let currencies;
  await api.listCurrencies().then(
    (value: any) => (currencies = value),
    (error: any) => console.error(error)
  );
  console.log(currencies);
  return JSON.parse(JSON.stringify(currencies!.body));
};

export default async function GateMethods({ data }: any) {
  return <div></div>;
}
