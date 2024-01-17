import {untilNextFrame} from '@alwatr/util';

import {userProfileStorage} from './store.user-profile';
import {logger} from '../config';
import {commentListContext} from '../context/context.comment-list';
import {sendCommentRequest} from '../context/request.send-comment';
import {userInfoRequest} from '../context/request.user-profile';
import {defineStore, type StoreConfig} from '../define-store';

import type {ServerRequestState, ServerContextState} from '@alwatr/server-context';
import type {AlwatrStorageMeta, ChatTextMessage} from '@alwatr/type';

logger.logModule?.('store.comment-list');

export interface CommentListStorage extends StoreConfig {
  loadingState: ServerContextState;
  sendingState: ServerRequestState;

  data: {
    draftMessage: string;
    list: ChatTextMessage[];
    meta?: AlwatrStorageMeta;
  };

  request(): void;
  sendMessage(): void;
  _onLoadingStateChange(state: ServerContextState): Promise<void>;
  _onSendingStateChange(state: ServerRequestState): void;
  _onUserProfileStateChange(state: ServerRequestState): void;
}

const _commentListStorage: CommentListStorage = {
  name: 'commentList',
  version: 0,
  data: {
    list: [],
    draftMessage: '',
  },

  request() {
    this.logger!.logMethod?.('request');

    const userId = userProfileStorage.data?.data.id;

    if (!userId) {
      this.logger!.incident?.('submit', 'user_profile_not_found', '');
      this.loadingState = 'failed';
      return;
    }

    commentListContext.request({queryParameters: {name: userId}});
  },

  sendMessage(this: CommentListStorage) {
    this.logger!.logMethodArgs?.('sendMessage', this.data.draftMessage);

    const draftMessage = this.data.draftMessage.trim();
    if (draftMessage.length === 0) return;

    const userId = userProfileStorage.data?.data.id; // also comment storage name
    if (userId == null) {
      logger.accident?.('sendMessage', 'null_comment_storage', 'User token null, so comment storage in null.');
      this.sendingState = 'failed';
      return;
    }

    sendCommentRequest.request({
      queryParameters: {storage: userId},
      bodyJson: {
        id: 'auto_increment',
        type: 'text',
        from: 'user',
        text: draftMessage,
      },
    });
  },

  loadingState: 'initial',

  async _onLoadingStateChange(this: CommentListStorage, state: ServerContextState) {
    this.logger!.logMethodArgs?.('_onLoadingStateChange', state);
    this.loadingState = state;

    const _commentListContext = commentListContext.context;
    if (_commentListContext == null) {
      // loading or failed
      if (this.data.list.length > 0) this.data.list = [];
      return;
    }

    if (_commentListContext.meta?.lastUpdated === this.data.meta?.lastUpdated) return; // not modified

    this.data.meta = _commentListContext.meta;
    this.data.list = Object.values(_commentListContext.data);
    this.logger!.logOther?.('_onLoadingStateChange.updated', this.data.meta);

    await untilNextFrame(); // wait to paint

    // scroll $el to end with animation
    const chatContainer = document.querySelector('main.overflow-y-scroll');
    chatContainer?.scrollTo({
      top: chatContainer.scrollHeight,
      behavior: 'smooth',
    });
  },

  sendingState: 'initial',

  _onSendingStateChange(this: CommentListStorage, state: ServerRequestState) {
    this.logger!.logMethodArgs?.('_onSendingStateChange', state);
    this.sendingState = state;

    if (state === 'complete') {
      this.data.draftMessage = '';
      this.request();
    }
  },

  _onUserProfileStateChange(this: CommentListStorage, state: ServerRequestState) {
    if (state !== 'complete') return;
    this.logger!.logMethodArgs?.('_onUserProfileStateChange', state);

    if (this.sendingState === 'failed') {
      this.sendMessage();
    }

    if (this.loadingState === 'failed' || this.loadingState === 'reloadingFailed') {
      this.request();
    }
  },
};

export const commentListStorage = defineStore(_commentListStorage);

commentListContext.subscribe(commentListStorage._onLoadingStateChange.bind(commentListStorage));
sendCommentRequest.subscribe(commentListStorage._onSendingStateChange.bind(commentListStorage));
userInfoRequest.subscribe(commentListStorage._onUserProfileStateChange.bind(commentListStorage));
