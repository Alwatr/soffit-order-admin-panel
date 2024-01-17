import {logger} from '../config';
import {defineStore, type StoreConfig} from '../define-store';
import {productMachine, type ProductMachineState} from '../product-fsm';

import type {Product, ProductCategory} from '@alwatr/soffit-order-types';

logger.logModule?.('store.product-list');

export interface ProductListStorage extends StoreConfig {
  data: Record<ProductCategory, Record<string, Product>> | null;
  loadingState: ProductMachineState;

  request(): void;
  get(category: string, productId: string): Product | null;
  _onLoadingStateChange(state: ProductMachineState): void;
}

const productListStorage_: ProductListStorage = {
  name: 'productList',
  version: 0,
  data: null,

  init() {
    logger.logMethod?.('init');
    this.request();
  },

  request() {
    return productMachine.request();
  },

  get(this: ProductListStorage, category: string, productId: string): Product | null {
    return productMachine.get(category, productId);
  },

  loadingState: 'initial',

  async _onLoadingStateChange(this: ProductListStorage, state: ProductMachineState) {
    this.logger!.logMethodArgs?.('_onLoadingStateChange', state);
    this.loadingState = state;

    if (state === 'complete' || state === 'reloading') {
      const _productList = productMachine.productRecord;
      this.data = _productList;
    }
  },
};

export const productListStorage = defineStore(productListStorage_);

productMachine.subscribe(productListStorage._onLoadingStateChange.bind(productListStorage));
