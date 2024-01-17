import {createLogger, type AlwatrLogger} from '@alwatr/logger';
import alpine from 'alpinejs';

import {logger} from './config';
import {setLocalStorageItem, getLocalStorageItem} from './nanolib';

import type {Dictionary} from '@alwatr/type-helper';

logger.logModule?.('define-store');

export interface StoreConfig extends Record<string, unknown> {
  readonly name: string;
  readonly version: number;
  localStorageKey?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Dictionary<any> | null;

  logger?: AlwatrLogger;
  init?(): void;
  load?(force?: true): void;
  save?(): void;
}

/**
 * Define a alpine based store.
 */
export function defineStore<T extends StoreConfig>(config: T): T {
  config.logger = createLogger(`store.${config.name}`);
  config.localStorageKey ??= `store.${config.name}`;

  config.logger.logMethodArgs?.('define', config);

  config.load = function (this: T, force?: true) {
    this.logger!.logMethod?.('load');

    const newData = getLocalStorageItem(config.localStorageKey!, this.version, null);
    if (newData == null) return; // data not parsed.
    if (!force && newData._rev === this.data?._rev) return; // data not modified.

    this.logger!.logOther?.('loaded modified data', newData);
    this.data = newData;
  };

  config.save = function (this: T) {
    this.logger!.logMethodArgs?.('save', this.data);
    if (this.data != null) {
      this.data._rev = Math.random();
      setLocalStorageItem(this.localStorageKey!, this.version, this.data);
    }
    else {
      localStorage.removeItem(this.localStorageKey!);
    }
  };

  config.load();

  alpine.store(config.name, config);

  const store = alpine.store(config.name) as T;

  requestAnimationFrame(() => {
    // after preload and page activated.
    store.load!();
  });

  return store;
}
