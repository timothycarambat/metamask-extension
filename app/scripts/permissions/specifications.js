import { constructPermission } from '@metamask/snap-controllers';
import {
  CaveatTypes,
  RestrictedMethods,
} from '../../../shared/constants/permissions';

const CaveatFactories = {
  [CaveatTypes.restrictReturnedAccounts]: (accounts) => {
    return { type: CaveatTypes.restrictReturnedAccounts, value: accounts };
  },
};

const PermissionKeys = {
  ...RestrictedMethods,
};

export const getCaveatSpecifications = ({ getIdentities }) => {
  return {
    [CaveatTypes.restrictReturnedAccounts]: {
      type: CaveatTypes.restrictReturnedAccounts,
      decorator: (method, caveat) => {
        return async (args) => {
          const result = await method(args);
          return result
            .filter((account) => caveat.value.includes(account))
            .slice(0, 1);
        };
      },
      validator: (caveat, _origin, _target) =>
        validateAccounts(caveat.value, getIdentities),
    },
  };
};

export const getPermissionSpecifications = ({
  getKeyringAccounts,
  getIdentities,
}) => {
  return {
    [PermissionKeys.eth_accounts]: {
      targetKey: PermissionKeys.eth_accounts,
      allowedCaveats: [CaveatTypes.restrictReturnedAccounts],
      factory: (permissionOptions, requestData) => {
        if (!requestData.approvedAccounts) {
          throw new Error(
            `${PermissionKeys.eth_accounts} error: Received unexpected caveats: ${permissionOptions.caveats}`,
          );
        }

        return constructPermission({
          ...permissionOptions,
          caveats: [
            CaveatFactories[CaveatTypes.restrictReturnedAccounts](
              requestData.approvedAccounts,
            ),
          ],
        });
      },
      methodImplementation: async (_args) => {
        try {
          const accounts = await getKeyringAccounts();
          const identities = getIdentities();

          return accounts.sort((firstAddress, secondAddress) => {
            if (!identities[firstAddress]) {
              throw new Error(`Missing identity for address ${firstAddress}`);
            } else if (!identities[secondAddress]) {
              throw new Error(`Missing identity for address ${secondAddress}`);
            } else if (
              identities[firstAddress].lastSelected ===
              identities[secondAddress].lastSelected
            ) {
              return 0;
            } else if (identities[firstAddress].lastSelected === undefined) {
              return 1;
            } else if (identities[secondAddress].lastSelected === undefined) {
              return -1;
            }

            return (
              identities[secondAddress].lastSelected -
              identities[firstAddress].lastSelected
            );
          });
        } catch (error) {
          // TODO: What should we do with this error?
          console.error(error);
          return [];
        }
      },
      validator: (permission, _origin, _target) => {
        const { caveats } = permission;
        if (
          !caveats ||
          caveats.length !== 1 ||
          caveats[0].type !== CaveatTypes.restrictReturnedAccounts
        ) {
          throw new Error(
            `${
              PermissionKeys.eth_accounts
            } error: Invalid caveats: ${JSON.stringify(caveats, null, 2)}`,
          );
        }
      },
    },
  };
};

function validateAccounts(accounts, getIdentities) {
  if (!Array.isArray(accounts) || accounts.length === 0) {
    throw new Error(
      `${PermissionKeys.eth_accounts} error: Expected non-empty array of Ethereum addresses.`,
    );
  }

  const identities = getIdentities();
  accounts.forEach((address) => {
    if (!address || typeof address !== 'string') {
      throw new Error(
        `${PermissionKeys.eth_accounts} error: Received falsy Ethereum address: "${address}".`,
      );
    }

    if (!identities[address]) {
      throw new Error(
        `${PermissionKeys.eth_accounts} error: Received unrecognized address "${address}".`,
      );
    }
  });
}

export const unrestrictedMethods = [
  'eth_blockNumber',
  'eth_call',
  'eth_chainId',
  'eth_coinbase',
  'eth_decrypt',
  'eth_estimateGas',
  'eth_feeHistory',
  'eth_gasPrice',
  'eth_getBalance',
  'eth_getBlockByHash',
  'eth_getBlockByNumber',
  'eth_getBlockTransactionCountByHash',
  'eth_getBlockTransactionCountByNumber',
  'eth_getCode',
  'eth_getEncryptionPublicKey',
  'eth_getFilterChanges',
  'eth_getFilterLogs',
  'eth_getLogs',
  'eth_getProof',
  'eth_getStorageAt',
  'eth_getTransactionByBlockHashAndIndex',
  'eth_getTransactionByBlockNumberAndIndex',
  'eth_getTransactionByHash',
  'eth_getTransactionCount',
  'eth_getTransactionReceipt',
  'eth_getUncleByBlockHashAndIndex',
  'eth_getUncleByBlockNumberAndIndex',
  'eth_getUncleCountByBlockHash',
  'eth_getUncleCountByBlockNumber',
  'eth_getWork',
  'eth_hashrate',
  'eth_mining',
  'eth_newBlockFilter',
  'eth_newFilter',
  'eth_newPendingTransactionFilter',
  'eth_protocolVersion',
  'eth_sendRawTransaction',
  'eth_sendTransaction',
  'eth_sign',
  'eth_signTypedData',
  'eth_signTypedData_v1',
  'eth_signTypedData_v3',
  'eth_signTypedData_v4',
  'eth_submitHashrate',
  'eth_submitWork',
  'eth_syncing',
  'eth_uninstallFilter',
  'metamask_getProviderState',
  'metamask_watchAsset',
  'net_listening',
  'net_peerCount',
  'net_version',
  'personal_ecRecover',
  'personal_sign',
  'wallet_watchAsset',
  'web3_clientVersion',
  'web3_sha3',
];
