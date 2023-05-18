"use server";

import { addPercentage } from "@/app/utility/NumberHelpers";
import { CreateOrder } from "../../api/page";
import { makeid } from "@/app/utility/StringHelpers";

export const BuyHandler = async (amountInUSDT: number, dipsToBuy: Ticker[]) => {
  console.log("attempting to buy..");

  let batchOrder: Order[] = [];

  try {
    // we use a for loop for the minimal performance gain
    for (var i = 0; i < dipsToBuy.length; i++) {
      const orderData: Order = {
        text: `t-${makeid(6)}`,
        currency_pair: dipsToBuy[i].currencyPair,
        type: "limit",
        price: addPercentage(dipsToBuy[i].last, 0.1),
        account: "spot",
        side: "buy",
        amount: (amountInUSDT / parseFloat(dipsToBuy[i].last)).toString(),
        time_in_force: "ioc",
      };

      // batch orders must be a maximum of 4
      if (batchOrder.length < 4) {
        batchOrder.push(orderData);
      }
    }

    let res = await CreateOrder(batchOrder);

    // we will retry for a successful purchase X times to snipe the price
    if (res.every((e: any) => e.status === "cancelled")) {
      let attempts = 0;

      while (attempts < 50) {
        res = await CreateOrder(batchOrder);
        attempts++;

        if (!res.every((e: any) => e.status === "cancelled")) {
          break;
        }
      }
    }

    // successful orders will have an id key
    const successfulOrders = await res.filter(({ id }: Order) => id);

    if (successfulOrders.length > 0) {
      return successfulOrders;
    } else return [res];
  } catch (err) {
    return [err];
  }
};
