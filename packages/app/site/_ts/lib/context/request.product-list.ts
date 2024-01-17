import {AlwatrServerContext} from '@alwatr/server-context';

import {config, logger} from '../config';

import type {Product} from '@alwatr/soffit-order-types';
import type {CollectionContext} from '@alwatr/store-engine';

logger.logModule?.('context.product-list');

/**
 * Context with fsm for load tile product list.
 */
export const productListTileContext = new AlwatrServerContext<CollectionContext<Product>>({
  ...config.fetchOptions,
  name: 'product-list-tile-request',
  url: config.api.productList + 'tile.col.asj',
});

/**
 * Context with fsm for load lighting product list.
 */
export const productListLightingContext = new AlwatrServerContext<CollectionContext<Product>>({
  ...config.fetchOptions,
  name: 'product-list-lighting-request',
  url: config.api.productList + 'lighting.col.asj',
});

/**
 * Context with fsm for connection product list.
 */
export const productListConnectionContext = new AlwatrServerContext<CollectionContext<Product>>({
  ...config.fetchOptions,
  name: 'product-list-connection-request',
  url: config.api.productList + 'connection.col.asj',
});
