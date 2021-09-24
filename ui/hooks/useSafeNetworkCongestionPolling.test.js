import { renderHook } from '@testing-library/react-hooks';
import {
  addPollingTokenToAppState,
  updateWithAndStartPollingFor,
  removePollingTokenFromAppState,
  stopPollingFor,
} from '../store/actions';
import { useSafeNetworkCongestionPolling } from './useSafeNetworkCongestionPolling';

jest.mock('../store/actions');

describe('useSafeNetworkCongestionPolling', () => {
  describe('given isEnabled: false', () => {
    beforeEach(() => {
      renderHook(() => useSafeNetworkCongestionPolling({ isEnabled: false }));
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
        useSafeNetworkCongestionPolling({ isEnabled: true }),
      ));
    });

    describe('when mounted', () => {
      it('calls updateWithAndStartPollingFor', () => {
        expect(updateWithAndStartPollingFor).toHaveBeenCalledWith(
          'isNetworkCongested',
        );
      });

      it('calls addPollingTokenToAppState when updateWithAndStartPollingFor resolves', async () => {
        await resolveUpdateWithAndStartPollingFor();
        expect(addPollingTokenToAppState).toHaveBeenCalledWith(
          'isNetworkCongested',
        );
      });
    });

    describe('when unmounted while the updateWithAndStartPollingFor promise has not been fulfilled', () => {
      beforeEach(async () => {
        unmount();
        await resolveUpdateWithAndStartPollingFor();
      });

      it('calls stopPollingFor', () => {
        expect(stopPollingFor).toHaveBeenCalledWith('isNetworkCongested');
      });

      it('calls removePollingTokenFromAppState', () => {
        expect(removePollingTokenFromAppState).toHaveBeenCalledWith(
          'isNetworkCongested',
        );
      });
    });

    describe('when the window is unloaded', () => {
      beforeEach(() => {
        window.dispatchEvent(new Event('beforeunload'));
      });

      it('calls stopPollingFor', () => {
        expect(stopPollingFor).toHaveBeenCalledWith('isNetworkCongested');
      });

      it('calls removePollingTokenFromAppState', () => {
        expect(removePollingTokenFromAppState).toHaveBeenCalledWith(
          'isNetworkCongested',
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
      ({ unmount } = renderHook(() => useSafeNetworkCongestionPolling()));
    });

    describe('when mounted', () => {
      it('calls updateWithAndStartPollingFor', () => {
        expect(updateWithAndStartPollingFor).toHaveBeenCalledWith(
          'isNetworkCongested',
        );
      });

      it('calls addPollingTokenToAppState when updateWithAndStartPollingFor resolves', async () => {
        await resolveUpdateWithAndStartPollingFor();
        expect(addPollingTokenToAppState).toHaveBeenCalledWith(
          'isNetworkCongested',
        );
      });
    });

    describe('when unmounted while the updateWithAndStartPollingFor promise has not been fulfilled', () => {
      beforeEach(async () => {
        unmount();
        await resolveUpdateWithAndStartPollingFor();
      });

      it('calls stopPollingFor', () => {
        expect(stopPollingFor).toHaveBeenCalledWith('isNetworkCongested');
      });

      it('calls removePollingTokenFromAppState', () => {
        expect(removePollingTokenFromAppState).toHaveBeenCalledWith(
          'isNetworkCongested',
        );
      });
    });

    describe('when the window is unloaded', () => {
      beforeEach(() => {
        window.dispatchEvent(new Event('beforeunload'));
      });

      it('calls stopPollingFor', () => {
        expect(stopPollingFor).toHaveBeenCalledWith('isNetworkCongested');
      });

      it('calls removePollingTokenFromAppState', () => {
        expect(removePollingTokenFromAppState).toHaveBeenCalledWith(
          'isNetworkCongested',
        );
      });
    });
  });
});
