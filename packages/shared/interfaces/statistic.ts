import type { Response } from './baseTemplate';

export type OrderStatistic = {
  all: number;
  pending: number;
  processing: number;
  onHold: number;
  inProduction: number;
  produced: number;
  partially_produced: number;
  packaged: number;
  labeled: number;
  in_transit: number;
  // partially_delivered: number;
  delivered: number;
  done: number;
  cancelled: number;
  refunded: number;
  // returned: number;
};

export type OrderStatisticResponse = {
  data: OrderStatistic | null;
} & Response;
