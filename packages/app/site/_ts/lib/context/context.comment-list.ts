import {AlwatrServerContext} from '@alwatr/server-context';

import {config, logger} from '../config';

import type {ChatStorage} from '@alwatr/type';

logger.logModule?.('context.comment-list');

/**
 * Api request with fsm for load user comment list.
 */
export const commentListContext = new AlwatrServerContext<ChatStorage>({
  ...config.fetchOptions,
  name: 'comment-list-context',
  url: config.api.commentList,
  token: config.api.commentToken,
});
