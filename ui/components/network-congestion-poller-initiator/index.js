import { useNetworkCongestionGauge } from '../../hooks/useNetworkCongestionGauge';

export default function NetworkCongestionPollerInitiator({ children }) {
  useNetworkCongestionGauge();
  return children;
}
