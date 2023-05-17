"use server";

import { returnMatchingOrders } from "@/app/utility/OrderHelpers";
import { CreateOrder, GetOrders } from "../../api/page";
import { addPercentage, calcFee } from "@/app/utility/NumberHelpers";
import { makeid } from "@/app/utility/StringHelpers";

export const SellHandler = async (
  purchasedTokens: PurchasedToken[],
  profitToSell: number
) => {
  console.log("attempting to find successful buys and place sell orders");
  let orders = await GetOrders("finished");

  if (orders.length > 0) {
    let matchingOrders;

    let attempts = 0;

    while (attempts < 5) {
      orders = await GetOrders("finished");
      matchingOrders = returnMatchingOrders(purchasedTokens, orders);
      attempts++;
      if (matchingOrders) {
        break;
      }
      attempts++;
    }

    if (matchingOrders) {
      try {
        // for each matching order create limit sell for token
        const batchOrder: Order[] = [];
        for (var i = 0; i < matchingOrders.length; i++) {
          const amountFilled = calcFee(
            matchingOrders[i].amount,
            matchingOrders[i].left
          );
          const amountAfterFee = calcFee(amountFilled, matchingOrders[i].fee);
          const orderData: Order = {
            text: `t-${makeid(6)}`,
            currency_pair: matchingOrders[i].currency_pair,
            type: "limit",
            price: addPercentage(matchingOrders[i].price, profitToSell),
            account: "spot",
            side: "sell",
            amount: amountAfterFee,
            time_in_force: "gtc",
          };
          batchOrder.push(orderData);
        }
        const res = await CreateOrder(batchOrder);
        console.log("sell order response", res);
        return res;
      } catch (err) {
        return [err];
      }
    } else {
      return [
        {
          message: "could not find matched orders",
        },
      ];
    }
  } else {
    return [
      {
        message: "no orders were passed to sell handler",
      },
    ];
  }
};
