import { renderHook } from '@testing-library/react-hooks';
import {
  addPollingTokenToAppState,
  updateWithAndStartPollingFor,
  removePollingTokenFromAppState,
  stopPollingFor,
} from '../store/actions';
import { useSafeGasEstimatePolling } from './useSafeGasEstimatePolling';

jest.mock('../store/actions');

describe('useSafeGasEstimatePolling', () => {
  describe('given isEnabled: false', () => {
    beforeEach(() => {
      renderHook(() => useSafeGasEstimatePolling({ isEnabled: false }));
    });

    describe('when mounted', () => {
      it('does not call updateWithAndStartPollingFor', () => {
        expect(updateWithAndStartPollingFor).not.toHaveBeenCalled();
      });

      it('does not call addPollingTokenToAppState', () => {
        expect(addPollingTokenToAppState).not.toHaveBeenCalled();
      });
    });

    describe('when the window is unloaded', () => {
      beforeEach(() => {
        window.dispatchEvent(new Event('beforeunload'));
      });

      it('does not call stopPollingFor', () => {
        expect(stopPollingFor).not.toHaveBeenCalled();
      });

      it('does not call removePollingTokenFromAppState', () => {
        expect(removePollingTokenFromAppState).not.toHaveBeenCalled();
      });
    });
  });

  describe('given isEnabled: true', () => {
    let resolveUpdateWithAndStartPollingFor;
    let unmount;

    beforeEach(() => {
      updateWithAndStartPollingFor.mockReturnValue(
        new Promise((_resolve) => {
          resolveUpdateWithAndStartPollingFor = _resolve;
        }),
      );
      ({ unmount } = renderHook(() =>
        useSafeGasEstimatePolling({ isEnabled: true }),
      ));
    });

    describe('when mounted', () => {
      it('calls updateWithAndStartPollingFor', () => {
        expect(updateWithAndStartPollingFor).toHaveBeenCalledWith(
          'gasFeeEstimates',
        );
      });

      it('calls addPollingTokenToAppState when updateWithAndStartPollingFor resolves', async () => {
        await resolveUpdateWithAndStartPollingFor();
        expect(addPollingTokenToAppState).toHaveBeenCalledWith(
          'gasFeeEstimates',
        );
      });
    });

    describe('when unmounted while the updateWithAndStartPollingFor promise has not been fulfilled', () => {
      beforeEach(async () => {
        unmount();
        await resolveUpdateWithAndStartPollingFor();
      });

      it('calls stopPollingFor', () => {
        expect(stopPollingFor).toHaveBeenCalledWith('gasFeeEstimates');
      });

      it('calls removePollingTokenFromAppState', () => {
        expect(removePollingTokenFromAppState).toHaveBeenCalledWith(
          'gasFeeEstimates',
        );
      });
    });

    describe('when the window is unloaded', () => {
      beforeEach(() => {
        window.dispatchEvent(new Event('beforeunload'));
      });

      it('calls stopPollingFor', () => {
        expect(stopPollingFor).toHaveBeenCalledWith('gasFeeEstimates');
      });

      it('calls removePollingTokenFromAppState', () => {
        expect(removePollingTokenFromAppState).toHaveBeenCalledWith(
          'gasFeeEstimates',
        );
      });
    });
  });

  describe('not given isEnabled', () => {
    let resolveUpdateWithAndStartPollingFor;
    let unmount;

    beforeEach(() => {
      updateWithAndStartPollingFor.mockReturnValue(
        new Promise((_resolve) => {
          resolveUpdateWithAndStartPollingFor = _resolve;
        }),
      );
      ({ unmount } = renderHook(() => useSafeGasEstimatePolling()));
    });

    describe('when mounted', () => {
      it('calls updateWithAndStartPollingFor', () => {
        expect(updateWithAndStartPollingFor).toHaveBeenCalledWith(
          'gasFeeEstimates',
        );
      });

      it('calls addPollingTokenToAppState when updateWithAndStartPollingFor resolves', async () => {
        await resolveUpdateWithAndStartPollingFor();
        expect(addPollingTokenToAppState).toHaveBeenCalledWith(
          'gasFeeEstimates',
        );
      });
    });

    describe('when unmounted while the updateWithAndStartPollingFor promise has not been fulfilled', () => {
      beforeEach(async () => {
        unmount();
        await resolveUpdateWithAndStartPollingFor();
      });

      it('calls stopPollingFor', () => {
        expect(stopPollingFor).toHaveBeenCalledWith('gasFeeEstimates');
      });

      it('calls removePollingTokenFromAppState', () => {
        expect(removePollingTokenFromAppState).toHaveBeenCalledWith(
          'gasFeeEstimates',
        );
      });
    });

    describe('when the window is unloaded', () => {
      beforeEach(() => {
        window.dispatchEvent(new Event('beforeunload'));
      });

      it('calls stopPollingFor', () => {
        expect(stopPollingFor).toHaveBeenCalledWith('gasFeeEstimates');
      });

      it('calls removePollingTokenFromAppState', () => {
        expect(removePollingTokenFromAppState).toHaveBeenCalledWith(
          'gasFeeEstimates',
        );
      });
    });
  });
});
