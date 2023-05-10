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
