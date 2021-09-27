export const APPROVAL_TYPE = 'wallet_requestPermissions';

export const WALLET_PREFIX = 'wallet_';

export const HISTORY_STORE_KEY = 'permissionsHistory';

export const LOG_STORE_KEY = 'permissionsLog';

export const METADATA_STORE_KEY = 'subjectMetadata';

export const METADATA_CACHE_MAX_SIZE = 100;

export const NOTIFICATION_NAMES = {
  accountsChanged: 'metamask_accountsChanged',
  unlockStateChanged: 'metamask_unlockStateChanged',
  chainChanged: 'metamask_chainChanged',
};

export const LOG_IGNORE_METHODS = [
  'wallet_registerOnboarding',
  'wallet_watchAsset',
];

export const LOG_METHOD_TYPES = {
  restricted: 'restricted',
  internal: 'internal',
};

export const LOG_LIMIT = 100;
