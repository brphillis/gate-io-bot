import { returnMatchingOrders } from "@/utility/OrderHelpers";
import { CreateOrder, GetOrders } from "../../api/page";
import { addPercentage, subtractPercentage } from "@/utility/NumberHelpers";

export const SellHandler = async (
  purchasedTokens: PurchasedToken[],
  profitToSell: number
) => {
  console.log("placing sell orders");
  const orders = await GetOrders("finished");

  if (orders.length > 0) {
    const matchingOrders = returnMatchingOrders(purchasedTokens, orders);
    console.log("MATCHING", matchingOrders);
    let successfulPurchases = [];

    if (matchingOrders.length > 0) {
      try {
        // for each matching order create limit sell for token
        for (var i = 0; i < matchingOrders.length; i++) {
          var calcNetworkFee = subtractPercentage(
            matchingOrders[i].amount,
            0.05
          );

          const orderData: Order = {
            currency_pair: matchingOrders[i].currency_pair,
            type: "limit",
            price: addPercentage(matchingOrders[i].price, profitToSell),
            account: "spot",
            side: "sell",
            amount: (calcNetworkFee - matchingOrders[i].fee).toString(),
            time_in_force: "gtc",
          };
          console.log("initiated sell order", orderData);
          const res = await CreateOrder(orderData);
          if (res.id) {
            //SUCCESS SELL ORDER and remove token from array
            successfulPurchases.push(matchingOrders[i]);
          } else {
            //FAILED SELL ORDER
            console.log("failed sell order", res);
          }
        }
        return successfulPurchases;
      } catch (err) {
        //API ERROR
        console.log(err);
        return [];
      }
    } else {
      return [];
    }
  }

  //check to see if limit buy is aged, if so cancel the order
  // for (var i = 0; i < purchasedTokens.length; i++) {
  //   if (purchasedTokens[i].create_time_ms > 999999999) {
  //     //if aged, post cancel
  //   }
  // }
};
