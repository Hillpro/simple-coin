import { SHA256 } from 'crypto-js';
import { Data } from './data';

export class Block {
  index: number;
  previousHash: string;
  timestamp: number;
  data: Data;
  hash: string;
  difficulty: number;
  nonce: number;

  constructor(
    index: number,
    previousHash: string,
    timestamp: number,
    data: Data,
    difficulty: number,
    nonce = 0,
  ) {
    this.index = index;
    this.previousHash = previousHash;
    this.timestamp = timestamp;
    this.data = data;
    this.difficulty = difficulty;
    this.nonce = nonce;

    this.hash = this.calculateHash();
    this.findNonceAndHash();
  }

  private findNonceAndHash() {
    while (!Block.hashMatchesDifficulty(this.hash, this.difficulty)) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
  }

  calculateHash() {
    return Block.calculateHash(
      this.index,
      this.previousHash,
      this.timestamp,
      this.data,
      this.difficulty,
      this.nonce,
    );
  }

  static calculateHashForBlock(block: Block) {
    return Block.calculateHash(
      block.index,
      block.previousHash,
      block.timestamp,
      block.data,
      block.difficulty,
      block.nonce,
    );
  }

  static calculateHash(
    index: number,
    previousHash: string,
    timestamp: number,
    data: Data,
    difficulty: number,
    nonce: number,
  ) {
    return SHA256(index + previousHash + timestamp + data + difficulty + nonce).toString();
  }

  static hashMatchesDifficulty(hash: string, difficulty: number) {
    const binaryHash = parseInt(hash, 16).toString(2).padStart(4, '0');
    const requiredPrefix = '0'.repeat(difficulty);
    return binaryHash.startsWith(requiredPrefix);
  }

  static isTimestampValid(block: Block, previousBlock: Block) {
    return (
      previousBlock.timestamp - 60000 < block.timestamp &&
      block.timestamp - 60000 < new Date().getTime()
    );
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
