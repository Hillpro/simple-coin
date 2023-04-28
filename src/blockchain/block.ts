import { SHA256 } from 'crypto-js';
import { Data } from './data';

export class Block {
  index: number;
  previousHash: string;
  timestamp: number;
  data: Data;
  hash: string;

  constructor(
    index: number,
    previousHash: string,
    timestamp: number,
    data: Data,
  ) {
    this.index = index;
    this.previousHash = previousHash;
    this.timestamp = timestamp;
    this.data = data;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return Block.calculateHash(
      this.index,
      this.previousHash,
      this.timestamp,
      this.data,
    );
  }

  static calculateHashForBlock(block: Block) {
    return Block.calculateHash(
      block.index,
      block.previousHash,
      block.timestamp,
      block.data,
    );
  }

  static calculateHash(
    index: number,
    previousHash: string,
    timestamp: number,
    data: Data,
  ) {
    return SHA256(index + previousHash + timestamp + data).toString();
  }

  static isBlockStructureValid(block: Block) {
    return (
      typeof block.index === 'number' &&
      typeof block.previousHash === 'string' &&
      typeof block.timestamp === 'number' &&
      typeof block.data === 'object' &&
      typeof block.hash === 'string'
    );
  }
}
