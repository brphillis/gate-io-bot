"use server";

import { returnMatchingOrders } from "@/app/utility/OrderHelpers";
import { CreateOrder, GetOrders } from "../../api/page";
import { addPercentage, toFixed } from "@/app/utility/NumberHelpers";
import { makeid } from "@/app/utility/StringHelpers";

export const SellHandler = async (
  purchasedTokens: PurchasedToken[],
  profitToSell: number
) => {
  console.log("placing sell orders");
  const orders = await GetOrders("finished");

  if (orders.length > 0) {
    console.log("length of orders looping through", orders.length);
    const matchingOrders = returnMatchingOrders(purchasedTokens, orders);
    let successfulPurchases = [];

    if (matchingOrders.length > 0) {
      try {
        // for each matching order create limit sell for token
        const batchOrder: Order[] = [];
        for (var i = 0; i < matchingOrders.length; i++) {
          const orderData: Order = {
            text: `t-${makeid(6)}`,
            currency_pair: matchingOrders[i].currency_pair,
            type: "limit",
            price: addPercentage(
              matchingOrders[i].price,
              profitToSell
            ).toString(),
            account: "spot",
            side: "sell",
            amount: toFixed(
              toFixed(matchingOrders[i].amount) - toFixed(matchingOrders[i].fee)
            ), //network fee
            time_in_force: "gtc",
          };
          batchOrder.push(orderData);
        }
        console.log("initiated sell order", batchOrder);
        const res = await CreateOrder(batchOrder);
        return res;
      } catch (err) {
        //API ERROR
        console.log(err);
        return [];
      }
    } else {
      return [];
    }
  }
};
