import {AlwatrApiRequest} from '@alwatr/server-context';

import {config, logger} from '../../config';

import type {Order} from '@alwatr/soffit-order-types';
import type {AlwatrServiceResponse} from '@alwatr/type';

logger.logModule?.('request.admin.change-order-status');

/**
 * Api request with fsm for update order for admin.
 */
export const adminUpdateOrderRequest = new AlwatrApiRequest<AlwatrServiceResponse<{userId: string; order: Order}>>({
  ...config.fetchOptions,
  name: 'update-order-request',
  method: 'PATCH',
  url: config.api.admin.updateOrder,
});
