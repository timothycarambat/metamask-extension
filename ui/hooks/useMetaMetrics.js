import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useRouteMatch } from 'react-router-dom';
import extension from 'extensionizer';
import { getEnvironmentType } from '../../app/scripts/lib/util';
import { PATH_NAME_MAP } from '../helpers/constants/routes';
import { txDataSelector } from '../selectors';
import { trackMetaMetricsEvent } from '../store/actions';

const PATHS_TO_CHECK = Object.keys(PATH_NAME_MAP);

/**
 * Returns the current page if it matches out route map, as well as the origin
 * if there is a confirmation that was triggered by a dapp
 * @returns {{
 *  page?: MetaMetricsPageObject
 *  referrer?: MetaMetricsReferrerObject
 * }}
 */
export function useMetaMetricsContext() {
  const match = useRouteMatch({
    path: PATHS_TO_CHECK,
    exact: true,
    strict: true,
  });
  const txData = useSelector(txDataSelector) || {};
  const confirmTransactionOrigin = txData.origin;

  const referrer = confirmTransactionOrigin
    ? {
        url: confirmTransactionOrigin,
      }
    : undefined;

  const page = match
    ? {
        path: match.path,
        title: PATH_NAME_MAP[match.path],
        url: match.path,
      }
    : undefined;

  return {
    page,
    referrer,
  };
}

export function useMetaMetrics() {
  const context = useMetaMetricsContext();
  /**
   * @type {UITrackEventMethod}
   */
  const trackEvent = useCallback(
    (payload, options) => {
      trackMetaMetricsEvent(
        {
          ...payload,
          environmentType: getEnvironmentType(),
          ...context,
        },
        options,
      );
    },
    [context],
  );

  return trackEvent;
}
