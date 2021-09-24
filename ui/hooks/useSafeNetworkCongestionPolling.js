import { useEffect } from 'react';
import {
  addPollingTokenToAppState,
  updateWithAndStartPollingFor,
  removePollingTokenFromAppState,
  stopPollingFor,
} from '../store/actions';

/**
 * Provides a reusable hook that can be used for periodically requesting the
 * congestion level of the network via GasFeeController. An initial request is
 * made and a timer is started so that the request recurs on a regular cadence.
 * This timer is then tracked in app state. The timer is stopped and untracked
 * automatically when the hook unmounts or when the user navigates away from the
 * page. The hook even intelligently handles the case in which unmount occurs
 * while a request is still taking place; in that case the timer will be stopped
 * after the request finishes (thanks to the `active` flag).
 *
 * @param args - The arguments for this function.
 * @param {boolean} args.isEnabled - A switch that can be
 * used to enable this hook (for instance, if we know that EIP-1559 is supported
 * for the selected network or account, and we know that we aren't obtaining gas
 * fees any other way). Defaults to true.
 */
export function useSafeNetworkCongestionPolling({ isEnabled = true } = {}) {
  // Effects are not expected to return null.
  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (isEnabled) {
      let active = true;
      const item = 'isNetworkCongested';

      const cleanup = () => {
        active = false;
        stopPollingFor(item);
        removePollingTokenFromAppState(item);
      };

      updateWithAndStartPollingFor(item).then(() => {
        if (active) {
          addPollingTokenToAppState(item);
        } else {
          cleanup();
        }
      });

      window.addEventListener('beforeunload', cleanup);

      return () => {
        cleanup();
        window.removeEventListener('beforeunload', cleanup);
      };
    }
  }, [isEnabled]);
}
