import { addPercentage } from "@/utility/NumberHelpers";
import { CreateOrder } from "../../api/page";

export const BuyHandler = async (
  amountInUSDT: number,
  dipsToBuy: CurrencyOfInterest[]
) => {
  console.log("buying dipped prices");
  let boughtDips: PurchasedToken[] = [];
  try {
    for (var i = 0; i < dipsToBuy.length; i++) {
      const orderData: Order = {
        currency_pair: dipsToBuy[i].currencyPair,
        type: "limit",
        price: dipsToBuy[i].last,
        account: "spot",
        side: "buy",
        amount: (amountInUSDT / parseFloat(dipsToBuy[i].last)).toString(),
        time_in_force: "fok",
      };
      const res = await CreateOrder(orderData);
      console.log("RES", res);
      if (res.id) {
        boughtDips.push(res);
      } else {
      }
    }
    if (boughtDips.length > 0) {
      return boughtDips;
    } else {
      return false;
    }
  } catch (err) {
    return false;
  }
};
