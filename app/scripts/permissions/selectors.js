import { createSelector } from 'reselect';
import { CaveatTypes } from '../../../shared/constants/permissions';

const getSubjects = (state) => state.subjects;

// Get all accounts (for each origin)
// i.e. the caveat value
/**
 * @returns {Map<string, string[]>} The current origin:accounts[] map.
 */
export const getPermittedAccountsByOrigin = createSelector(
  getSubjects,
  (subjects) => {
    return Object.values(subjects).reduce((originToAccountsMap, subject) => {
      const caveat = subject.permissions?.eth_accounts?.caveats.find(
        ({ type }) => type === CaveatTypes.restrictReturnedAccounts,
      );

      if (caveat) {
        originToAccountsMap.set(subject.origin, caveat.value);
      }
      return originToAccountsMap;
    }, new Map());
  },
);

// That's the selector.

// The handler gets the new and the previous value.
// Simply iterate over their combined keys, and emit accountsChanged for
// the ones that are different.

/**
 * @param {Map<string, string[]>} newAccountsMap - The new origin:accounts[] map.
 * @param {Map<string, string[]>} previousAccountsMap - The previous origin:accounts[] map.
 * @returns {Map<string, string[]>} The origin:accounts[] map of changed accounts.
 */
export const getChangedAccounts = (
  newAccountsMap,
  previousAccountsMap = new Map(),
) => {
  const changedAccounts = new Map();
  if (newAccountsMap === previousAccountsMap) {
    return changedAccounts;
  }

  const newOrigins = new Set([...newAccountsMap.keys()]);

  for (const origin of previousAccountsMap.keys()) {
    const newAccounts = newAccountsMap.get(origin) ?? [];
    if (previousAccountsMap.get(origin) !== newAccounts) {
      changedAccounts.set(origin, newAccounts);
    }
    newOrigins.delete(origin);
  }

  for (const origin of newOrigins.keys()) {
    changedAccounts.set(origin, newAccountsMap.get(origin));
  }
  return changedAccounts;
};
