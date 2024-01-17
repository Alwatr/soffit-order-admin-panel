import {waitForIdle} from '@alwatr/wait';

import {logger} from '../config';
import {tokenInfoRequest, userInfoRequest} from '../context/request.user-profile';
import {defineStore, type StoreConfig} from '../define-store';
import {clearLocalStorage} from '../global-util';

import type {ServerRequestState} from '@alwatr/server-context';
import type {User} from '@alwatr/soffit-order-types';
import type {DocumentContext} from '@alwatr/store-engine';

logger.logModule?.('store.user');

export type signOutAction = 'redirect' | 'reload' | 'none';

export interface UserProfileStorage extends StoreConfig {
  data: DocumentContext<User> | null;
  signInState: ServerRequestState;

  signIn(token?: string, id?: string): void;
  signOut(action: signOutAction): void;
  require(): boolean;
  _onGetTokenInfoStateChange(state: ServerRequestState): void;
  _onSignInStateChange(state: ServerRequestState): void;
}

const _userProfileStorage: UserProfileStorage = {
  name: 'userProfile',
  version: 0,

  data: null,

  init() {
    logger.logMethod?.('init');
    if (this.data?.data.token != null) {
      // loaded from localStorage
      this.signInState = 'complete';

      waitForIdle().then(() => {
        this.signIn(this.data!.data.token!, this.data!.data.id); // update profile from server
      });
    }
  },

  signIn(this: UserProfileStorage, token: string = location.hash.substring(1), id?: string) {
    logger.logMethod?.('signIn');
    if (token == null || String(token).trim() === '') {
      this.require();
      return;
    }

    if (id == null) {
      tokenInfoRequest.request({
        headers: {
          'user-token': token,
        },
      });
    }
    else {
      userInfoRequest.request({
        headers: {
          'user-id': id,
          'user-token': token,
        },
      });
    }
  },

  signOut(this: UserProfileStorage, action: signOutAction) {
    this.logger?.logMethod?.('signOut');
    this.data = null;
    this.signInState = 'initial';
    // this.save!();
    clearLocalStorage();
    if (action === 'redirect') {
      location.href = '/';
    }
    else if (action === 'reload') {
      location.reload();
    }
  },

  require(this: UserProfileStorage) {
    this.logger?.logMethodArgs?.('require', this.data);
    if (this.data?.data.token != null) {
      return true;
    }
    else {
      location.href = '/fa/require-sign-in.html';
      return false;
    }
  },

  signInState: 'initial',

  _onGetTokenInfoStateChange(this: UserProfileStorage, state: ServerRequestState) {
    if (state === 'complete') {
      const userId = tokenInfoRequest.response!.data.userId;
      userInfoRequest.request({
        headers: {
          'user-id': userId,
          'user-token': tokenInfoRequest.response!.meta.ownerId!,
        },
      });
    }
  },

  _onSignInStateChange(this: UserProfileStorage, state: ServerRequestState) {
    this.logger?.logMethodArgs?.('_onSignInStateChange', state);
    this.signInState = state;

    if (state === 'complete') {
      const _userProfile = userInfoRequest.response;
      if (_userProfile?.data == null) return;
      if (_userProfile.meta.updated === this.data?.meta.updated) return; // not modified

      this.data = {
        ..._userProfile,
        data: {
          ..._userProfile.data,
          token: tokenInfoRequest.response!.meta.ownerId!,
        },
      };
      this.logger!.logOther?.('_onSignInStateChange.dataUpdated');
      this.save!();

      location.href = '/';
    }
  },
};

export const userProfileStorage = defineStore(_userProfileStorage);

tokenInfoRequest.subscribe(userProfileStorage._onGetTokenInfoStateChange.bind(userProfileStorage));
userInfoRequest.subscribe(userProfileStorage._onSignInStateChange.bind(userProfileStorage));
