/* eslint-disable import/order */

import alpine from 'alpinejs';

import {logger} from './lib/config';

import './lib/store/store.user-profile';

// import './lib/data/data.product-item';
// import './lib/data/data.product-list';
// import './lib/global-util';
// import './lib/keep-scroll';
// import './lib/product-fsm';
// import './lib/service-worker'; TODO: implement in pmpa
// import './lib/store/store.comment-list';
// import './lib/store/store.product-list';
// import './lib/user-fsm';

logger.banner?.('alwatr-pmpa');
logger.logModule?.('main');

alpine.start();
