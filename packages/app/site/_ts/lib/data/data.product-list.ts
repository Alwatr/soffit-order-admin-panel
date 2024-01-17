import {createLogger} from '@alwatr/logger';
import alpine from 'alpinejs';

import {productMachine, type ProductMachineState} from '../product-fsm';

const logger = createLogger('data.productList');

declare global {
  interface Window {
    animationDelay: number;
  }
}

logger.logModule?.('data.product-list');

window.animationDelay = 0;

alpine.data('productList', () => ({
  state: productMachine.state,
  category: '',
  productList: [],

  async init() {
    logger.logMethod?.('init');
    productMachine.subscribe(this.onProductListStateChange_.bind(this));
  },

  onProductListStateChange_(state: ProductMachineState) {
    logger.logMethodArgs?.('onProductListStateChange_', state);
    this.state = state;

    if (state === 'complete' || state === 'reloading') {
      this.category = productMachine.category;
      this.productList = productMachine.productList[this.category];

      const productContainer = document.querySelector('main.overflow-y-scroll');
      productContainer?.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  },
}));
