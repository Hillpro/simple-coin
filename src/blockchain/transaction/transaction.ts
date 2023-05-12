import * as ecdsa from 'elliptic';
import { TxIn } from './tx-in';
import { TxOut } from './tx-out';
import { UnspentTxOut } from './unspent-tx-out';

const ec = new ecdsa.ec('secp256k1');

export class Transaction {
  public id: string;
  public txIns: TxIn[];
  public txOuts: TxOut[];

  constructor(id: string, txIns: TxIn[], txOuts: TxOut[]) {
    this.id = id;
    this.txIns = txIns;
    this.txOuts = txOuts;
  }

  signTxIn(
    transaction: Transaction,
    txInIndex: number,
    privateKey: string,
    unspentTxOuts: UnspentTxOut[],
  ) {
    const txIn = transaction.txIns[txInIndex];
    const dataToSign = transaction.id;
    const referencedUnspentTxOut = this.findUnspentTxOut(
      txIn.txOutId,
      txIn.txOutIndex,
      unspentTxOuts,
    );

    if (referencedUnspentTxOut == null) {
      console.log('could not find referenced txOut');
      throw Error();
    }

    if (getPublicKey(privateKey) !== referencedUnspentTxOut.address) {
      console.log(
        'trying to sign an input with private' +
          ' key that does not match the address that is referenced in txIn',
      );
      throw Error();
    }

    const key = ec.keyFromPrivate(privateKey, 'hex');
    const signature: string = toHexString(key.sign(dataToSign).toDER());

    return signature;
  }

  findUnspentTxOut(transactionId: string, index: number, aUnspentTxOuts: UnspentTxOut[]) {
    return aUnspentTxOuts.find(
      (uTxOut) => uTxOut.txOutId === transactionId && uTxOut.txOutIndex === index,
    );
  }

  static isValidTransactionsStructure(transactions: Transaction[]) {
    return transactions.map(Transaction.isValidTransactionStructure).reduce((a, b) => a && b, true);
  }

  static isValidTransactionStructure(transaction: Transaction) {
    if (typeof transaction.id !== 'string') {
      console.log('transactionId missing');
      return false;
    }
    if (!(transaction.txIns instanceof Array)) {
      console.log('invalid txIns type in transaction');
      return false;
    }
    if (!transaction.txIns.map(TxIn.isValidTxInStructure).reduce((a, b) => a && b, true)) {
      return false;
    }

    if (!(transaction.txOuts instanceof Array)) {
      console.log('invalid txOuts type in transaction');
      return false;
    }

    if (!transaction.txOuts.map(TxOut.isValidTxOutStructure).reduce((a, b) => a && b, true)) {
      return false;
    }

    return true;
  }

  static getTransactionId(transaction: Transaction) {
    const txInContent = transaction.txIns
      .map((txIn) => txIn.txOutId + txIn.txOutIndex)
      .reduce((a, b) => a + b, '');

    const txOutContent = transaction.txOuts
      .map((txOut) => txOut.address + txOut.amount)
      .reduce((a, b) => a + b, '');

    return CryptoJS.SHA256(txInContent + txOutContent).toString();
  }
}

function getPublicKey(privateKey: string) {
  return ec.keyFromPrivate(privateKey, 'hex').getPublic().encode('hex', false);
}

function toHexString(byteArray: any): string {
  return Array.from(byteArray, (byte: any) => {
    return ('0' + (byte & 0xff).toString(16)).slice(-2);
  }).join('');
}
