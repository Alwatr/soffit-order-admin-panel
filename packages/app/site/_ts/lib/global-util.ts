import {l10n} from '@alwatr/i18n';
import {calcDiscount} from '@alwatr/math';

import {logger} from './config';

logger.logModule?.('global-util');

declare global {
  interface Window {
    calcDiscount: typeof calcDiscount;
    clearLocalStorage: typeof clearLocalStorage;
    l10n: typeof l10n;
    devMode: typeof devMode;
  }
}

window.calcDiscount = calcDiscount;
window.l10n = l10n;
window.clearLocalStorage = clearLocalStorage;
window.devMode = devMode;

/**
 * Set l10n resource loader.
 */
l10n.setResourceLoader((locale) => {
  return {
    ok: true,
    meta: {
      code: locale.code,
      rev: 0,
    },
    data: {
      order_status_draft: 'پیش‌نویس',
      order_status_registered: 'ثبت شده',
      order_status_processing: 'در حال پردازش',
      order_status_payment_pending: 'در انتظار پرداخت',
      order_status_preparing: 'در حال آماده‌سازی',
      order_status_shipping: 'در حال ارسال',
      order_status_delayed: 'تاخیر',
      order_status_on_hold: 'معلق',
      order_status_canceled: 'لغو شده',
      order_status_refunded: 'بازپرداخت شده',
      gender_male: 'آقای',
      gender_woman: 'خانم',
      lading_type_hand: 'دستی',
      lading_type_pallet: 'پالت',
      car_type_trailer_truck: 'تریلی',
      car_type_camion_dual: 'کامیون دوگانه',
      car_type_camion_solo: 'کامیون تک',
      car_type_camion_911: 'کامیون 911',
      car_type_camion_800: 'کامیون 800',
      car_type_camion_600: 'کامیون 600',
      car_type_camion_mini: 'کامیون کوچک',
      car_type_nissan: 'نیسان',
      time_period_auto: 'بهترین زمان ممکن',
      time_period_3_4w: '۳ تا ۴ هفته',
      time_period_2_3w: '۲ تا ۳ هفته',
      time_period_1_2w: '۱ تا ۲ هفته',
    },
  };
});

l10n.setLocale('auto');

/**
 * Clear local storage.
 *
 * Set `debug` to `1` if `debugMode` is `true` in debug mode
 */
export function clearLocalStorage() {
  logger.logMethod?.('clearLocalStorage');
  localStorage.clear();
  if (logger.debugMode) {
    localStorage.setItem('debug', '1');
  }
}

/**
 * Set `debug` to `1` if `debugMode` is `true` in debug mode
 */
export function devMode() {
  localStorage.setItem('debug', '1');
  localStorage.setItem('debugApi', JSON.stringify('https://order4.soffit.co/'));
  location.reload();
}
