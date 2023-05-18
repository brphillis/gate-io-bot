"use server";

import { returnMatchingOrders } from "@/app/utility/OrderHelpers";
import { CreateOrder, GetOrders } from "../../api/page";
import { addPercentage, calcFee } from "@/app/utility/NumberHelpers";
import { makeid } from "@/app/utility/StringHelpers";

export const SellHandler = async (Orders: Order[], profitToSell: number) => {
  console.log("placing sell orders");

  let orders = await GetOrders("finished");

  if (orders.length > 0) {
    let matchingOrders;

    // in case of api lag we will retry finding the processed order
    let attempts = 0;

    while (attempts < 10) {
      orders = await GetOrders("finished");
      matchingOrders = returnMatchingOrders(Orders, orders);
      attempts++;
      if (matchingOrders) {
        break;
      }
      attempts++;
    }

    if (matchingOrders) {
      try {
        const batchOrder: Order[] = [];

        // we use a for loop for the minimal performance gain
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

        // successful orders will have an id key
        const successfulOrders = await res.filter(({ id }: Order) => id);

        if (successfulOrders.length > 0) {
          return successfulOrders;
        } else return [res];
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
