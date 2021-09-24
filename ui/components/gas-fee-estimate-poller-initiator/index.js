import { useGasFeeEstimates } from '../../hooks/useGasFeeEstimates';

export default function GasFeeEstimatePollerInitiator({ children }) {
  useGasFeeEstimates();
  return children;
}
