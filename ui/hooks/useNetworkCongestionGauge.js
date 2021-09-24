import { useSelector } from 'react-redux';
import { checkNetworkAndAccountSupports1559 } from '../selectors';
import { useSafeNetworkCongestionPolling } from './useSafeNetworkCongestionPolling';

/**
 * Gauges whether the network is congested and begins polling for new changes.
 * When this hook is removed from the tree it will signal to the
 * GasFeeController that it is done requiring new gas estimates. Also checks the
 * returned gas estimate for validity on the current network.
 *
 * @param args - The arguments for this function.
 * @param {boolean} args.isEnabled - A switch that can be
 * used to enable this hook (for instance, if we know that EIP-1559 is supported
 * for the selected network/account, and we know that we aren't obtaining gas
 * fees any other way). Defaults to true as long as the network does support
 * EIP-1559.
 */
export function useNetworkCongestionGauge({ isEnabled = null } = {}) {
  const networkAndAccountSupports1559 = useSelector(
    checkNetworkAndAccountSupports1559,
  );

  useSafeNetworkCongestionPolling({
    isEnabled: isEnabled ?? networkAndAccountSupports1559,
  });
}
