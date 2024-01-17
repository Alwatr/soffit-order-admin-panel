import {AlwatrApiRequest} from '@alwatr/server-context';

import {config, logger} from '../config';

import type {TokenInfo, User} from '@alwatr/soffit-order-types';
import type {DocumentContext} from '@alwatr/store-engine';

logger.logModule?.('request.user-profile');

/**
 * Api request with fsm for load token info.
 */
export const tokenInfoRequest = new AlwatrApiRequest<DocumentContext<TokenInfo>>({
  ...config.fetchOptions,
  name: 'token-info-context',
  url: config.api.tokenInfo,
});

/**
 * Api request with fsm for load user info.
 */
export const userInfoRequest = new AlwatrApiRequest<DocumentContext<User>>({
  ...config.fetchOptions,
  name: 'user-info-context',
  url: config.api.userInfo,
});
