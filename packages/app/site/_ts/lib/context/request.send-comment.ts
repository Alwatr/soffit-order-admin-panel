import {AlwatrApiRequest} from '@alwatr/server-context';

import {config, logger} from '../config';

import type {ChatMessage, AlwatrServiceResponse} from '@alwatr/type';

logger.logModule?.('request.send-comment');

/**
 * Api request with fsm for send comment.
 */
export const sendCommentRequest = new AlwatrApiRequest<AlwatrServiceResponse<ChatMessage>>({
  ...config.fetchOptions,
  name: 'send-comment-request',
  method: 'PATCH',
  url: config.api.sendComment,
  token: config.api.commentToken,
});
