export type StatusDetail = {
  name: string;
  title: string;
  disabled?: boolean;
  total?: number;
};

export const STATUS_ORDERS: StatusDetail[] = [
  { name: 'All', title: 'all', disabled: false },
  { name: 'Total Items', title: 'totalItems', disabled: true, total: 0 },
  { name: 'No artwork', title: 'no_artwork', disabled: false },
  { name: 'Pending', title: 'pending', disabled: false },
  { name: 'Processing', title: 'processing', disabled: false },
  { name: 'On Hold', title: 'on_hold', disabled: false },
  { name: 'In Production', title: 'in_production', disabled: false },
  { name: 'Produced', title: 'produced', disabled: false },
  { name: 'Partially Produced', title: 'partially_produced', disabled: false },
  { name: 'Packaged', title: 'packaged', disabled: false },
  { name: 'Labeled', title: 'labeled', disabled: false },
  { name: 'In Transit', title: 'in_transit', disabled: false },
  // { name: 'Partially Delivered', title: 'partially_delivered', disabled: false },
  { name: 'Delivered', title: 'delivered', disabled: false },
  { name: 'Done', title: 'done', disabled: false },
  { name: 'Cancelled', title: 'cancelled', disabled: false },
  { name: 'Refunded', title: 'refunded', disabled: false },
  // { name: 'Returned', title: 'returned', disabled: false },
  { name: 'Artwork Error', title: 'artwork_error', disabled: false },
  { name: 'Delayed 2 Days', title: 'delayed', disabled: true, total: 0 },
];
