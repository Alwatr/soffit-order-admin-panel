/* eslint-disable @typescript-eslint/consistent-type-definitions */
export type UserAuth = {
  id: string;
  token: string;
  deviceId: string;
}

// cs type
export const ladingTypeCS = ['hand', 'pallet'] as const;
export type LadingType = (typeof ladingTypeCS)[number];

export const carTypeCS = [
  'trailer_truck',
  'camion_dual',
  'camion_solo',
  'camion_911',
  'camion_800',
  'camion_600',
  'camion_mini',
  'nissan',
] as const;
export type CarType = (typeof carTypeCS)[number];

export const timePeriodCS = ['auto', '3_4w', '2_3w', '1_2w'] as const;
export type TimePeriod = (typeof timePeriodCS)[number];

export const discountTypeCS = ['number', 'percent'] as const;
export type DiscountType = (typeof discountTypeCS)[number];

export const orderStatusCS = [
  'draft',
  'registered',
  'processing',
  'payment_pending',
  'preparing',
  'shipping',
  'delayed',
  'on_hold',
  'canceled',
  'refunded',
] as const;
export type OrderStatus = (typeof orderStatusCS)[number];

export const userPermissionsCS = ['user/post', 'product/post', 'user-list-inc-order/read', 'order-status/patch'] as const;
export type UserPermission = (typeof userPermissionsCS)[number];

export const genderCS = ['male', 'female'] as const;
export type Gender = (typeof genderCS)[number];

// base types

/**
 * Multi language string
 *
 * {fa: 'سلام', en: 'hello'}
 */
export type MultiLangStringObj = Record<Lowercase<string>, string>;

export type Photo = {
  /**
   * Primary Photo ID
   *
   * like full relative path (include extension) to image CDN (temporary)
   */
  id: string; // path/file-name.png

  /**
   * Photo extra meta information for future maintenances
   */
  meta?: Record<string, string | number>; // meta: {order: 1233, customer: 1334}
}

export type Product = {
  /**
   * Product global unique id.
   */
  id: string;

  /**
   * Product title
   */
  title: MultiLangStringObj;

  /**
   * Product image
   */
  image: Photo;

  /**
   * Min order quantity
   */
  minOrder: number;

  /**
   * Count of product in a box
   */
  countInBox: number;

  /**
   * Price factor
   */
  priceFactor: number;

  /**
   * Price for each type of customer.
   */
  priceA: number;
  priceB: number;
  priceC: number;
  priceD: number;
}

export type Order = {
  /**
   * Order auto incremental unique id.
   */
  id: string | number;

  /**
   * Order Status
   */
  status: OrderStatus;

  /**
   * Order cart list.
   */
  itemList: {
    tile: OrderItem[];
    lighting: OrderItem[];
    connection: OrderItem[];
  };

  /**
   * Delivery info
   */
  shippingInfo: Partial<OrderShippingInfo>;

  // discount: number;
  // discountType: DiscountType;

  /**
   * The total price of this order exclude shippings.
   */
  // subTotalMarket: number;

  // subTotalAgency: number;

  /**
   * The cost of lading the order.
   */
  // ladingFee: number;

  /**
   * The cost of pallet.
   */
  // palletCost: number;

  /**
   * The cost of shipping price.
   */
  // shippingFee: number;

  /**
   * Total shipping const.
   */
  // totalShippingFee: number;

  sumDisplayPrice?: number;
  sumSalePrice?: number;

  /**
   * Customer device uuid.
   */
  deviceId?: string;

  /**
   * Customer device ip address.
   */
  remoteAddress?: string;
}

// -- child types --

export type OrderItem = {
  /**
   * The product id.
   */
  productId: string;

  /**
   * The selling price of single product in the market.
   */
  marketPrice: number;

  /**
   * The selling price of a product after any discounts to this buyer.
   */
  agencyPrice: number;

  /**
   * Quantity of this item.
   */
  qty: number;
}

export type OrderShippingInfo = {
  recipientName: string;
  recipientNationalCode: string;
  address: string;
  description: string;
  ladingType: LadingType;
  carType: CarType;
  timePeriod: TimePeriod;
}

export type BaseUser = {
  id: string;
  lpe: number;
  fullName: string;
  phoneNumber: number;
  gender: Gender;
  country: string;
  token?: string;
  permissions?: string[] | 'root';
  email?: string;
  landlinePhone?: string;
  province?: string;
  city?: string;
  address?: string;
  postalCode?: string;
}

export type User = BaseUser & {
  permissions?: UserPermission[] | 'root';
  shopName?: string;
  priceListName?: string;
}

export type TokenInfo = {
  userId: string;
}

/**
 * Product category.
 */
export type ProductCategory = 'tile' | 'lighting' | 'connection';
