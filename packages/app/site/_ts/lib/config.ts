import {definePackage} from '@alwatr/logger';
import {getLocalStorageItem} from '@alwatr/util';

import type {} from '@alwatr/nano-build';
import type {ServerRequestConfig} from '@alwatr/server-context';

export const logger = definePackage('@alwatr/soffit-order-app', __package_version__);

/**
 * Debug API.
 *
 * ```ts
 * localStorage.setItem('DEBUG_API', '"https://admin.order.soffit.co/"');
 * ```
 */
const srvBaseUrl = getLocalStorageItem('debugApi', '/');
const apiBaseUrl = srvBaseUrl + 'api/v1/';
const storeBaseUrl = apiBaseUrl + 'store/';

export const config = {
  api: {
    base: srvBaseUrl,
    cdn: apiBaseUrl + 'cdn',

    // public access
    productList: `${storeBaseUrl}p/product/`,

    // user access
    tokenInfo: `${storeBaseUrl}t/token-info.doc.asj`,
    userInfo: `${storeBaseUrl}u/user-info.doc.asj`,
    orderList: `${storeBaseUrl}u/order.col.asj`,
    newOrder: `${apiBaseUrl}order`,
    updateOrder: `${apiBaseUrl}admin/order`,

    commentList: `${srvBaseUrl}api/v0/storage`,
    sendComment: `${srvBaseUrl}api/v0/`,
    commentToken: 'Dy3Q4WOzj32XvSUriz7VXrN-sNjGx0KOk8s4gNBvSjIHz1Jj6XbmjNjieRHIEfFlGfmI_Uui3jifk59MUT5xg9RAvnsyd',
  } as const,

  fetchOptions: {
    removeDuplicate: 'auto',
    retry: 2,
    retryDelay: 2_000,
  } as Partial<ServerRequestConfig>,
} as const;
