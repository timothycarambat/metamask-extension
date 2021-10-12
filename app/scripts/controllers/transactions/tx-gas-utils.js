import util from 'util';
import EthQuery from 'ethjs-query';
import Eth from 'ethjs';
import log from 'loglevel';
import { addHexPrefix, rlp } from 'ethereumjs-util';
import { cloneDeep } from 'lodash';
import * as optimismContracts from '@eth-optimism/contracts';
import * as ethers from 'ethers';
import { hexToBn, BnMultiplyByFraction, bnToHex } from '../../lib/util';

/**
 * Result of gas analysis, including either a gas estimate for a successful analysis, or
 * debug information for a failed analysis.
 * @typedef {Object} GasAnalysisResult
 * @property {string} blockGasLimit - The gas limit of the block used for the analysis
 * @property {string} estimatedGasHex - The estimated gas, in hexadecimal
 * @property {Object} simulationFails - Debug information about why an analysis failed
 */

/**
tx-gas-utils are gas utility methods for Transaction manager
its passed ethquery
and used to do things like calculate gas of a tx.
@param {Object} provider - A network provider.
*/

export default class TxGasUtil {
  constructor(provider) {
    this.query = new EthQuery(provider);
    this.eth = new Eth(provider);
  }

  /**
    @param {Object} txMeta - the txMeta object
    @returns {GasAnalysisResult} The result of the gas analysis
  */
  async analyzeGasUsage(txMeta) {
    const block = await this.query.getBlockByNumber('latest', false);

    // fallback to block gasLimit
    const blockGasLimitBN = hexToBn(block.gasLimit);
    const saferGasLimitBN = BnMultiplyByFraction(blockGasLimitBN, 19, 20);
    let estimatedGasHex = bnToHex(saferGasLimitBN);
    let simulationFails;
    try {
      estimatedGasHex = await this.estimateTxGas(txMeta);
    } catch (error) {
      log.warn(error);
      simulationFails = {
        reason: error.message,
        errorKey: error.errorKey,
        debug: { blockNumber: block.number, blockGasLimit: block.gasLimit },
      };
    }

    return { blockGasLimit: block.gasLimit, estimatedGasHex, simulationFails };
  }

  /**
    Estimates the tx's gas usage
    @param {Object} txMeta - the txMeta object
    @returns {string} the estimated gas limit as a hex string
  */
  async estimateTxGas(txMeta) {
    const txParams = cloneDeep(txMeta.txParams);

    // `eth_estimateGas` can fail if the user has insufficient balance for the
    // value being sent, or for the gas cost. We don't want to check their
    // balance here, we just want the gas estimate. The gas price is removed
    // to skip those balance checks. We check balance elsewhere. We also delete
    // maxFeePerGas and maxPriorityFeePerGas to support EIP-1559 txs.
    delete txParams.gasPrice;
    delete txParams.maxFeePerGas;
    delete txParams.maxPriorityFeePerGas;

    // estimate tx gas requirements
    return await this.query.estimateGas(txParams);
  }

  /**
    Adds a gas buffer with out exceeding the block gas limit

    @param {string} initialGasLimitHex - the initial gas limit to add the buffer too
    @param {string} blockGasLimitHex - the block gas limit
    @returns {string} the buffered gas limit as a hex string
  */
  addGasBuffer(initialGasLimitHex, blockGasLimitHex, multiplier = 1.5) {
    const initialGasLimitBn = hexToBn(initialGasLimitHex);
    const blockGasLimitBn = hexToBn(blockGasLimitHex);
    const upperGasLimitBn = blockGasLimitBn.muln(0.9);
    const bufferedGasLimitBn = initialGasLimitBn.muln(multiplier);

    // if initialGasLimit is above blockGasLimit, dont modify it
    if (initialGasLimitBn.gt(upperGasLimitBn)) {
      return bnToHex(initialGasLimitBn);
    }
    // if bufferedGasLimit is below blockGasLimit, use bufferedGasLimit
    if (bufferedGasLimitBn.lt(upperGasLimitBn)) {
      return bnToHex(bufferedGasLimitBn);
    }
    // otherwise use blockGasLimit
    return bnToHex(upperGasLimitBn);
  }

  async getBufferedGasLimit(txMeta, multiplier) {
    const {
      blockGasLimit,
      estimatedGasHex,
      simulationFails,
    } = await this.analyzeGasUsage(txMeta);

    // add additional gas buffer to our estimation for safety
    const gasLimit = this.addGasBuffer(
      addHexPrefix(estimatedGasHex),
      blockGasLimit,
      multiplier,
    );
    return { gasLimit, simulationFails };
  }

  /*
   * Uses a smart contract provided by Optimism (an L2 blockchain) to fetch the
   * computed L1 fee for a transaction that has not been submitted yet. The
   * rationale and mechanics behind this is documented here:
   * <https://community.optimism.io/docs/developers/l2/new-fees.html>
   * @param {import('@ethereumjs/tx').Transaction} unserializedTransaction - A
   * transaction produced via @ethereumjs/tx. Note that this must be a type-0
   * transaction, as Optimism does not support EIP-2930 or EIP-1559 — i.e., it
   * must contain `nonce`, `gasPrice`, `gasLimit`, `to`, `value`, and `data`
   * properties (see
   * <https://github.com/ethereumjs/ethereumjs-monorepo/blob/e001ba033b751e47d2691355e51abd9eda2b9b00/packages/tx/src/legacyTransaction.ts#L176-L193>).
   * @returns {Promise<number>} A promise for the L1 fee in GWEI.
   */
  async fetchOptimismL1Fee(unserializedTransaction) {
    // TODO: Do we need to verify that the unserializedTransaction is of type 0?
    // Or does it matter?
    // const messageToSign = unserializedTransaction.getMessageToSign(true);
    // const serializedTransaction = rlp.encode(messageToSign);
    const serializedTransaction = unserializedTransaction.serialize();
    const OVMGasPriceOracle = optimismContracts
      .getContractFactory('OVM_GasPriceOracle')
      .attach(optimismContracts.predeploys.OVM_GasPriceOracle);
    const abi = JSON.parse(
      OVMGasPriceOracle.interface.format(ethers.utils.FormatTypes.json),
    );
    console.log('contract address', OVMGasPriceOracle.address);
    const ethContract = this.eth.contract(abi).at(OVMGasPriceOracle.address);
    // const gasPrice = await ethContract.gasPrice();
    const l1BaseFee = await ethContract.l1BaseFee();
    // const overhead = await ethContract.overhead();
    // const scalar = await ethContract.scalar();
    // const decimals = await ethContract.decimals();
    console.log(
      'gasPrice',
      gasPrice,
      'l1BaseFee',
      l1BaseFee,
      // 'overhead',
      // overhead,
      // 'scalar',
      // scalar,
      // 'decimals',
      // decimals,
    );
    return null;
    /*
    let result = [];
    try {
      result = await ethContract.getL1Fee(serializedTransaction);
      console.log('Received response from OVM_GasPriceOracle', result);
    } catch (error) {
      console.error('Received error from OVM_GasPriceOracle', error);
    }
    return result[0];
    */
  }
}
