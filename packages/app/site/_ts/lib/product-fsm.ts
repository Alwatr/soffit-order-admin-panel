import {FiniteStateMachine, type ActionRecord, type StateRecord} from '@alwatr/fsm';

import {logger} from './config';
import {productListConnectionContext, productListLightingContext, productListTileContext} from './context/request.product-list';

import type {ServerContextState} from '@alwatr/server-context';
import type {Product, ProductCategory} from '@alwatr/soffit-order-types';
import type {CollectionContext} from '@alwatr/store-engine';

/**
 * Product finite state machine state.
 */
export type ProductMachineState = 'initial' | 'loading' | 'loadingFailed' | 'reloading' | 'reloadingFailed' | 'complete';

/**
 * Product finite state machine event.
 */
type ProductFiniteStateMachineMachineEvent = 'request' | 'offlineCacheFound' | 'complete' | 'failed' | 'categoryChanged';

class ProductFiniteStateMachine extends FiniteStateMachine<ProductMachineState, ProductFiniteStateMachineMachineEvent> {
  constructor(name__: string) {
    super({name: name__, initialState: 'initial'});

    this.hashUpdateHandler__();
    window.addEventListener('hashchange', this.hashUpdateHandler__.bind(this));

    productListLightingContext.subscribe(this.handleContextStateChange__.bind(this));
    productListTileContext.subscribe(this.handleContextStateChange__.bind(this));
    productListConnectionContext.subscribe(this.handleContextStateChange__.bind(this));
  }

  /**
   * The product record.
   *
   * Useful for looking up products by id.
   */
  productRecord: Record<ProductCategory, Record<string, Product>> = {
    tile: {},
    lighting: {},
    connection: {},
  };

  /**
   * The product list.
   *
   * Useful for iterating over products.
   */
  productList: Record<ProductCategory, Product[]> = {
    tile: [],
    lighting: [],
    connection: [],
  };

  /**
   * The current product category.
   */
  category: ProductCategory = 'tile';

  /**
   * The product meta record.
   *
   * Useful for guarded updates.
   */
  private productMeta__: Record<ProductCategory, Partial<CollectionContext['meta']>> = {
    tile: {},
    lighting: {},
    connection: {},
  };

  /**
   * Make request transition to load or reload product list.
   */
  request() {
    this._logger.logMethod?.('request');
    this.transition('request');
  }

  get(category: string, productId: string): Product | null {
    this._logger.logMethodArgs?.('productList.get', {category, productId});
    logger.logMethodArgs?.('productList.get', {category, productId});
    return this.productRecord[category][productId] ?? null;
  }

  /**
   * The state record.
   */
  protected override _stateRecord: StateRecord<ProductMachineState, ProductFiniteStateMachineMachineEvent> = {
    initial: {
      request: 'loading',
    },
    loading: {
      offlineCacheFound: 'reloading',
      failed: 'loadingFailed',
      complete: 'complete',
    },
    loadingFailed: {
      request: 'loading',
      failed: 'reloadingFailed',
    },
    reloadingFailed: {
      request: 'reloading',
    },
    reloading: {
      complete: 'complete',
      failed: 'reloadingFailed',
    },
    complete: {
      request: 'reloading',
    },
  };

  /**
   * The action record.
   */
  protected override _actionRecord: ActionRecord<ProductMachineState, ProductFiniteStateMachineMachineEvent> = {
    _on_loading_enter: this.requestContext__.bind(this),
  };

  /**
   * Update product category from hash.
   */
  private hashUpdateHandler__() {
    this._logger.logMethod?.('hashUpdateHandler__');
    const hash = location.hash.substring(1);
    if (hash !== '' && this.productList[hash] != null) {
      this.category = hash as ProductCategory;
    }
    else {
      this.category = 'tile';
    }
    window.animationDelay = 0;

    // notify subscribers to render
    this._notify(this.state);
  }

  /**
   * Bake data from context with guard against reassignment.
   */
  private bakeData__() {
    this._logger.logMethod?.('bakeData__');

    // tile category
    if (productListTileContext.context?.meta.updated !== this.productMeta__.tile.updated) {
      this.productMeta__.tile = productListTileContext.context!.meta;

      this.productRecord.tile = Object.fromEntries(
        Object.entries(productListTileContext.context!.data).map(([key, value]) => [key, value.data]),
      );

      this.productList.tile = Object.values(this.productRecord.tile);

      this._logger.logMethodArgs?.('bakeData__.updated', {category: 'tile'});
    }

    // lighting category
    if (productListLightingContext.context?.meta.updated !== this.productMeta__.lighting.updated) {
      this.productMeta__.lighting = productListLightingContext.context!.meta;

      this.productRecord.lighting = Object.fromEntries(
        Object.entries(productListLightingContext.context!.data).map(([key, value]) => [key, value.data]),
      );

      this.productList.lighting = Object.values(this.productRecord.lighting);

      this._logger.logMethodArgs?.('bakeData__.updated', {category: 'lighting'});
    }

    // connection category
    if (productListConnectionContext.context?.meta.updated !== this.productMeta__.connection.updated) {
      this.productMeta__.connection = productListConnectionContext.context!.meta;

      this.productRecord.connection = Object.fromEntries(
        Object.entries(productListConnectionContext.context!.data).map(([key, value]) => [key, value.data]),
      );

      this.productList.connection = Object.values(this.productRecord.connection);

      this._logger.logMethodArgs?.('bakeData__.updated', {category: 'connection'});
    }
  }

  /**
   * Request all context.
   */
  private requestContext__() {
    this._logger.logMethod?.('requestContext__');
    productListTileContext.request();
    productListLightingContext.request();
    productListConnectionContext.request();
  }

  private handleContextStateChange__(state: ServerContextState) {
    this._logger.logMethodArgs?.('handleContextStateChange__', {state, context: productListTileContext.context?.data});
    if (state === 'complete') {
      if (
        productListTileContext.state === 'complete' &&
        productListLightingContext.state === 'complete' &&
        productListConnectionContext.state === 'complete'
      ) {
        logger.logOther?.('handleContextStateChange__.complete');
        this.bakeData__();
        this.transition('complete');
      }
      // else ignore
    }

    // offline cache found
    else if (state === 'reloading') {
      if (
        productListTileContext.state === 'reloading' &&
        productListLightingContext.state === 'reloading' &&
        productListConnectionContext.state === 'reloading'
      ) {
        logger.logOther?.('handleContextStateChange__.reloading');
        this.bakeData__();
        this.transition('offlineCacheFound');
      }
      // else ignore
    }
    else if (state === 'failed' || state === 'reloadingFailed') {
      this.transition('failed');
    }
  }
}

export const productMachine = new ProductFiniteStateMachine('product-machine');

declare global {
  interface Window {
    productMachine: Pick<ProductFiniteStateMachine, 'category' | 'state' | 'productList'>;
  }
}

window.productMachine = productMachine
