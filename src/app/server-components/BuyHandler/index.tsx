"use server";

import { addPercentage } from "@/app/utility/NumberHelpers";
import { CreateOrder } from "../../api/page";
import { makeid } from "@/app/utility/StringHelpers";

export const BuyHandler = async (
  amountInUSDT: number,
  dipsToBuy: CurrencyOfInterest[]
) => {
  console.log("attempting to snipe low price..");
  let batchOrder: Order[] = [];
  try {
    for (var i = 0; i < dipsToBuy.length; i++) {
      const orderData: Order = {
        text: `t-${makeid(6)}`,
        currency_pair: dipsToBuy[i].currencyPair,
        type: "limit",
        price: addPercentage(dipsToBuy[i].last, 0.1),
        account: "spot",
        side: "buy",
        amount: (amountInUSDT / parseFloat(dipsToBuy[i].last)).toString(),
        time_in_force: "fok",
      };
      batchOrder.push(orderData);
    }
    const res = await CreateOrder(batchOrder);

    const succOrders = res.filter((e: any) => e.id);
    if (succOrders.length > 0) {
      return succOrders;
    } else {
      return res;
    }
  } catch (err) {
    //if api returns error
    return [err];
  }
};
