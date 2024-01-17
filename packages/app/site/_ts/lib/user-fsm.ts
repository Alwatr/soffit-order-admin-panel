import {FiniteStateMachine, type ActionRecord, type StateRecord} from '@alwatr/fsm';
import {getLocalStorageItem, setLocalStorageItem} from '@alwatr/util';

import {userInfoRequest} from './context/request.user-profile';
import {clearLocalStorage} from './global-util';

import type {User} from '@alwatr/soffit-order-types';

declare global {
  interface Window {
    userMachine: UserFiniteStateMachine;
  }
}

/**
 * User finite state machine state.
 */
type UserMachineState = 'notLoggedIn' | 'loggedIn' | 'loginFailed' | 'loginInvalid' | 'loginLoading';

/**
 * User finite state machine event.
 */
type UserMachineEvent = 'login' | 'logout' | 'login-failed' | 'login-valid' | 'login-invalid';

// /**
//  * Sign out action.
//  */
// type signOutAction = 'redirect' | 'reload' | 'none';

class UserFiniteStateMachine extends FiniteStateMachine<UserMachineState, UserMachineEvent> {
  /**
   * Local storage key version.
   *
   * Increment this number when the local storage key needs to be invalidated.
   */
  static readonly version_ = 0;

  /**
   * Local storage key.
   */
  private localStorageKey__ = `data.${this.name_}.v${UserFiniteStateMachine.version_}`;

  constructor(protected name_: string) {
    super({name: name_, initialState: 'notLoggedIn'});
  }

  /**
   * User profile.
   */
  profile = getLocalStorageItem(this.localStorageKey__, null) as User | null;

  /**
   * True Whether the user is logged in.
   *
   * Check fsm state to be `loggedIn`.
   */
  get isLoggedIn() {
    return this.state === 'loggedIn';
  }

  /**
   * Transition to `login`.
   */
  login() {
    this.transition('login');
  }

  /**
   * Transition to `logout`.
   */
  logout() {
    this.transition('logout');
    // if (action === 'redirect') {
    //   location.href = '/';
    // }
    // else if (action === 'reload') {
    //   location.reload();
    // }
  }

  /**
   * Require login.
   *
   * If the user is not logged in, redirect to `/fa/require-sign-in.html`.
   * If user is logged in and in `/fa/require-sign-in.html`, redirect to `home`.
   *
   * @returns true if the user is logged in and false otherwise.
   */
  requireLogin(): boolean {
    const isLoginPageLocation = '/fa/require-sign-in.html';
    if (this.isLoggedIn === false) {
      if (location.pathname !== isLoginPageLocation) {
        location.href = isLoginPageLocation;
      }

      return false;
    }

    if (location.pathname === isLoginPageLocation) {
      location.href = '/packages'
    }
    return true;
  }

  /**
   * Check if the user is super admin.
   *
   * @returns true if the user is super admin and false otherwise.
   */
  get isSuperAdmin(): boolean {
    return this.profile?.permissions === 'root';
  }


  /**
   * The state record.
   */
  protected override _stateRecord = {
    notLoggedIn: {
      login: 'loginLoading',
      'login-valid': 'loggedIn',
    },
    loginLoading: {
      'login-valid': 'loggedIn',
      'login-invalid': 'loginInvalid',
      'login-failed': 'loginFailed',
    },
    loginFailed: {
      login: 'loginLoading',
    },
    loginInvalid: {
      login: 'loginLoading',
    },
    loggedIn: {
      logout: 'notLoggedIn',
    },
  } as StateRecord<UserMachineState, UserMachineEvent>;

  /**
   * The action record.
   */
  protected override _actionRecord = {
    /**
     * Check if the user is logged in from local storage when the fsm is initialized.
     *
     * If the user is logged in, transition to `login-valid`.
     */
    _on_notLoggedIn_enter: () => {
      const userProfile = getLocalStorageItem(this.localStorageKey__, null);
      if (userProfile !== null) {
        this.transition('login-valid');
      }
    },

    /**
     * Request user profile for login
     *
     * If the user profile request is successful, transition to `login-valid`.
     * If the user profile request is failed, transition to `login-failed`.
     * If the token or user id is invalid, transition to `login-invalid`.
     */
    _on_loginLoading_enter: () => {
      const userId = location.hash.substring(1).split('/')[0];
      const userToken = location.hash.substring(1).split('/')[1];

      if (userId == null || userId.trim() === '' || userToken == null || userToken.trim() === '') {
        this.transition('login-invalid');
        return;
      }

      userInfoRequest.request({
        headers: {
          'user-id': userId,
          'user-token': userToken,
        },
      });

      userInfoRequest.subscribe((state) => {
        if (state === 'complete') {
          this.transition('login-valid');
          setLocalStorageItem(this.localStorageKey__, userInfoRequest.response!.data);
        }
        else if (state === 'failed') {
          if (userInfoRequest.response?.ok === true) {
            this.transition('login-invalid');
          }
          else {
            this.transition('login-failed');
          }
        }
      });
    },

    /**
     * Clear local storage to logged out the user.
     */
    _on_loggedIn_logout: () => {
      clearLocalStorage();
    },
  } as ActionRecord<UserMachineState, UserMachineEvent>;
}

export const userMachine = new UserFiniteStateMachine('user-machine');

// add to global scope for use in alpine
window.userMachine = userMachine;
