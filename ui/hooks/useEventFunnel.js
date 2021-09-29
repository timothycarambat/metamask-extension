import { useCallback, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import extension from 'extensionizer';
import { closeFunnel, createFunnel, updateFunnel } from '../store/actions';
import { useMetaMetricsContext } from './useMetaMetrics';

/**
 *
 * @param {*} existingId
 * @param {*} funnelOptions
 * @returns
 */
export function useEventFunnel(existingId, funnelOptions) {
  const currentWindowId = extension.windows.WINDOW_ID_CURRENT;

  const createFunnelCalled = useRef(false);

  const funnel = useSelector(({ metamask: { funnels } }) => {
    // A valid existing funnel must exist in state.
    // It must have the same sessionId or be a crossSession funnel.
    // If these conditions are not meant we will create a new funnel.
    if (
      existingId &&
      funnels?.[existingId] &&
      (funnels[existingId].crossSession ||
        funnels[existingId].sessionId === currentWindowId)
    ) {
      return funnels[existingId];
    }
    return undefined;
  });

  // If no valid existing funnel can be found, a new one must be created that
  // will then be found by the selector above. To do this, invoke the
  // createFunnel method with the funnelOptions and current sessionId. To
  // prevent over calling the createFunnel method, a ref is used to keep track
  // of whether the method has been called or not.
  useEffect(() => {
    if (funnel === undefined && createFunnelCalled.current === false) {
      createFunnelCalled.current = true;
      createFunnel({
        ...funnelOptions,
        sessionId: currentWindowId,
      });
    }
  }, [funnel, currentWindowId, funnelOptions]);

  const context = useMetaMetricsContext();

  /**
   * trackSuccess is used to close a funnel with the affirmative action. This
   * method is just a thin wrapper around the background method that sets the
   * necessary values.
   */
  const trackSuccess = useCallback(() => {
    closeFunnel(funnel.id, context);
  }, [funnel, context]);

  /**
   * trackFailure is used to close a funnel as abandoned. This method is just a
   * thin wrapper around the background method that sets the necessary values.
   */
  const trackFailure = useCallback(() => {
    closeFunnel(funnel.id, { abandoned: true, context });
  }, [funnel, context]);

  /**
   * updateFunnelProperties is a thin wrapper around updateFunnel that supplies
   * the funnel id as the first parameter. This function will be passed back
   * from the hook as 'updateFunnel', but is named updateFunnelProperties to
   * avoid naming conflicts.
   */
  const updateFunnelProperties = useCallback(
    (payload) => {
      updateFunnel(funnel.id, payload);
    },
    [funnel],
  );

  return {
    trackSuccess,
    trackFailure,
    updateFunnel: updateFunnelProperties,
    funnel,
  };
}
