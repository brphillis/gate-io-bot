declare module "gate-api";

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

type CurrencyOfInterest = {
  currencyPair: string;
  change: number;
  last: string;
};

type Ticker = {
  currencyPair: string;
  last: string;
  lowestAsk: string;
  highestBid: string;
  changePercentage: string;
  changeUtc0: string;
  changeUtc8: string;
  baseVolume: string;
  quoteVolume: string;
  high24h: string;
  low24h: string;
  etfNetValue: string;
  etfPreNetValue: string;
  etfPreTimestamp: number;
  etfLeverage: string;
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
  amount: string;
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
};

type PlacedOrder = {
  account: string;
  amend_text: string;
  amount: string;
  avg_deal_price: string;
  biz_info: string;
  create_time: string;
  create_time_ms: number;
  currency_pair: string;
  fee: string;
  fee_currency: string;
  fill_price: string;
  filled_total: string;
  finish_as: string;
  gt_discount: boolean;
  gt_fee: string;
  gt_maker_fee: string;
  gt_taker_fee: string;
  iceberg: string;
  id: string;
  left: string;
  point_fee: string;
  price: string;
  rebated_fee: string;
  rebated_fee_currency: string;
  side: string;
  status: string;
  text: string;
  time_in_force: string;
  type: string;
  update_time: string;
  update_time_ms: number;
};
