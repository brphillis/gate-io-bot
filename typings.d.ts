declare module "gate-api";

type Error = {
  name?: string;
  label?: string;
  message: string;
};

type Currency = {
  currency: string;
  delisted: boolean;
  withdrawDisabled: boolean;
  withdrawDelayed: boolean;
  depositDisabled: boolean;
  tradeDisabled: boolean;
  fixedRate: any;
  chain: string;
};

type Ticker = {
  currencyPair: string;
  last: string;
  lowestAsk?: string;
  highestBid?: string;
  changePercentage: string;
  changeUtc0?: string;
  changeUtc8?: string;
  baseVolume?: string;
  quoteVolume: string;
  high24h?: string;
  low24h?: string;
  etfNetValue?: string;
  etfPreNetValue?: string;
  etfPreTimestamp?: number;
  etfLeverage?: string;
  change?: number;
  changePercentage?: string;
};

type Order = {
  id?: string;
  text?: string;
  amendText?: string;
  createTime?: string;
  updateTime?: string;
  createTimeMs?: number;
  updateTimeMs?: number;
  status?: string;
  currency_pair: string;
  type?: string;
  account?: string;
  side: string;
  amount?: string;
  price?: string;
  time_in_force?: string;
  iceberg?: string;
  autoBorrow?: boolean;
  autoRepay?: boolean;
  left?: string;
  fillPrice?: string;
  filledTotal?: string;
  avgDealPrice?: string;
  fee?: string;
  feeCurrency?: string;
  pointFee?: string;
  gtFee?: string;
  gtMakerFee?: string;
  gtTakerFee?: string;
  gtDiscount?: boolean;
  rebatedFee?: string;
  rebatedFeeCurrency?: string;
  stpId?: number;
  stpAct?: string;
  finishAs?: string;
  succeeded?: boolean;
};
