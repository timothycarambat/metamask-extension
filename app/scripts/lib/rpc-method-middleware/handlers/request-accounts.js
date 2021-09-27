import { ethErrors } from 'eth-rpc-errors';
import { MESSAGE_TYPE } from '../../../../../shared/constants/app';

/**
 * TODO: Description
 */

const requestEthereumAccounts = {
  methodNames: [MESSAGE_TYPE.ETH_REQUEST_ACCOUNTS],
  implementation: requestEthereumAccountsHandler,
};
export default requestEthereumAccounts;

// Used to rate-limit pending requests to one per origin
const locks = new Set();

/**
 * @typedef {Record<string, string | Function>} RequestEthereumAccountsOptions
 * @property {string} origin - The requesting origin.
 * @property {Function} getAccounts - Gets the accounts for the requesting
 * origin.
 * @property {Function} getUnlockPromise - Gets a promise that resolves when
 * the extension unlocks.
 * @property {Function} hasPermission - Returns whether the requesting origin
 * has the specified permission.
 * @property {Function} requestAccountsPermission - Requests the `eth_accounts`
 * permission for the requesting origin.
 */

/**
 *
 * @param {import('json-rpc-engine').JsonRpcRequest<unknown>} req - The JSON-RPC request object.
 * @param {import('json-rpc-engine').JsonRpcResponse<true>} res - The JSON-RPC response object.
 * @param {Function} _next - The json-rpc-engine 'next' callback.
 * @param {Function} end - The json-rpc-engine 'end' callback.
 * @param {RequestEthereumAccountsOptions} options - The RPC method hooks.
 */
async function requestEthereumAccountsHandler(
  _req,
  res,
  _next,
  end,
  {
    origin,
    getAccounts,
    getUnlockPromise,
    hasPermission,
    requestAccountsPermission,
  },
) {
  if (locks.has(origin)) {
    res.error = ethErrors.rpc.resourceUnavailable(
      'Already processing eth_requestAccounts. Please wait.',
    );
    return end();
  }

  if (hasPermission(MESSAGE_TYPE.ETH_ACCOUNTS)) {
    // We wait for the extension to unlock in this case only, because permission
    // requests are handled when the extension is unlocked, regardless of the
    // lock state when they were received.
    locks.add(origin);
    await getUnlockPromise();
    locks.delete(origin);

    res.result = await getAccounts();
    return end();
  }

  // If no accounts, request the accounts permission
  try {
    await requestAccountsPermission();
  } catch (err) {
    res.error = err;
    return end();
  }

  // Get the approved accounts
  const accounts = await getAccounts();
  /* istanbul ignore else: too hard to induce, see below comment */
  if (accounts.length > 0) {
    res.result = accounts;
  } else {
    // This should never happen, because it should be caught in the
    // above catch clause
    res.error = ethErrors.rpc.internal(
      'Accounts unexpectedly unavailable. Please report this bug.',
    );
  }

  return end();
}
