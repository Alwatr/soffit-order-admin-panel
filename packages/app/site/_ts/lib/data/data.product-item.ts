import alpine from 'alpinejs';

import {logger} from '../config';
import {cartStorage} from '../store/store.cart';

logger.logModule?.('data.product-item');

alpine.data('productItem', (category: unknown, productId: unknown) => {
  let selected = false;
  if (typeof category !== 'string' || typeof productId !== 'string') {
    logger.accident('productItem', 'invalid_argument', `category: ${category}, productId: ${productId}`);
    return {selected: false};
  }
  selected = cartStorage.findIndex(category, productId) !== -1;
  return {
    selected,
  };
});
