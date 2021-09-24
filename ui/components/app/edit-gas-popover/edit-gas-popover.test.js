import React from 'react';
import { merge } from 'lodash';
import { setBackgroundConnection } from '../../../../test/jest/background';
import { renderWithProvider } from '../../../../test/jest/rendering';
import configureStore from '../../../store/store';
import {
  checkNetworkAndAccountSupports1559,
  getSelectedAddress,
  getSelectedAccount,
} from '../../../selectors';
import {
  getGasFeeEstimates,
  getGasEstimateType,
  getIsNetworkCongested,
} from '../../../ducks/metamask/metamask';
import EditGasPopover from '.';

jest.mock('../../../selectors', () => {
  const originalModule = jest.requireActual('../../../selectors');
  return {
    ...originalModule,
    __esModule: true,
    checkNetworkAndAccountSupports1559: jest.fn(),
    currentNetworkTxListSelector: jest.fn(),
    getSelectedAddress: jest.fn(),
    getSelectedAccount: jest.fn(),
  };
});

jest.mock('../../../ducks/metamask/metamask', () => {
  const originalModule = jest.requireActual('../../../ducks/metamask/metamask');
  return {
    ...originalModule,
    __esModule: true,
    getGasFeeEstimates: jest.fn(),
    getGasEstimateType: jest.fn(),
    getIsNetworkCongested: jest.fn(),
  };
});

function callbackThatResolvesWith(value) {
  return (...args) => {
    const cb = args.pop();
    cb(null, value);
  };
}

function buildStore(overrides = {}) {
  return configureStore(
    merge(
      {},
      {
        metamask: {
          cachedBalances: {},
          provider: {},
        },
      },
      overrides,
    ),
  );
}

setBackgroundConnection({
  getGasFeeTimeEstimate: callbackThatResolvesWith(null),
  removePollingTokenFromAppState: jest.fn(),
  stopPollingFor: jest.fn(),
  trackMetaMetricsPage: jest.fn(),
  updateWithAndStartPollingFor: jest.fn(),
});

describe('EditGasPopover', () => {
  const fromAddress = '0x1111';
  const transactionId = '0x5555';
  const selectedAccount = {
    address: fromAddress,
    balance: '0xf4240',
  };
  const accounts = {
    [fromAddress]: selectedAccount,
  };

  beforeEach(() => {
    getSelectedAccount.mockReturnValue(selectedAccount);
    getSelectedAddress.mockReturnValue(fromAddress);
  });

  describe('if the network supports EIP-1559', () => {
    beforeEach(() => {
      checkNetworkAndAccountSupports1559.mockReturnValue(true);
      getGasFeeEstimates.mockReturnValue({
        estimatedBaseFee: '0.000000009',
        high: {
          suggestedMaxPriorityFeePerGas: '2',
          suggestedMaxFeePerGas: '2.000000013',
          minWaitTimeEstimate: 15000,
          maxWaitTimeEstimate: 60000,
        },
        low: {
          suggestedMaxPriorityFeePerGas: '1.768891974',
          suggestedMaxFeePerGas: '1.768891985',
          minWaitTimeEstimate: 15000,
          maxWaitTimeEstimate: 30000,
        },
        medium: {
          suggestedMaxPriorityFeePerGas: '1.922465724',
          suggestedMaxFeePerGas: '1.922465736',
          minWaitTimeEstimate: 15000,
          maxWaitTimeEstimate: 45000,
        },
      });
      getGasEstimateType.mockReturnValue('fee-market');
    });

    describe('if we determine that gas fees are abnormally high', () => {
      beforeEach(() => {
        getIsNetworkCongested.mockReturnValue(true);
      });

      it('informs the user', () => {
        const store = buildStore({ metamask: { accounts } });
        const { getByText } = renderWithProvider(
          <EditGasPopover
            transaction={{
              id: transactionId,
              txParams: {
                from: fromAddress,
                gas: '0xb72a',
                maxFeePerGas: '0xc78d197f',
                maxPriorityFeePerGas: '0xc78d1974',
                type: '0x2',
                value: '0x16345785d8a0000', // 0.1 ether
              },
              origin: 'metamask',
              userFeeLevel: 'medium',
            }}
          />,
          store,
        );
        expect(
          getByText(
            'Network is busy. Gas prices are high and estimates are less accurate.',
          ),
        ).toBeInTheDocument();
      });
    });
  });
});
