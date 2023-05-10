import { Block } from './block';
import { Data } from './data';

// in seconds
const BLOCK_GENERATION_INTERVAL = 10;

// in blocks
const DIFFICULTY_ADJUSTMENT_INTERVAL = 10;

export class BlockChain {
  private blockchain: Block[];

  constructor() {
    this.blockchain = [BlockChain.genesisBlock];
  }

  static get genesisBlock() {
    // hash:"d00ff3db391778c7893b9c804c0f2d473edbe7649f21b318c349f228dbd5b57e"
    return new Block(0, '0', 1680546496366, new Data('First block'), 0);
  }

  get latestBlock() {
    return this.blockchain[this.blockchain.length - 1];
  }

  get blocks() {
    return this.blockchain;
  }

  get length() {
    return this.blockchain.length;
  }

  get difficulty() {
    if (
      this.latestBlock.index % DIFFICULTY_ADJUSTMENT_INTERVAL === 0 &&
      this.latestBlock.index !== 0
    ) {
      return this.adjustedDifficulty;
    } else {
      return this.latestBlock.difficulty;
    }
  }

  private get adjustedDifficulty() {
    const prevAdjustmentBlock = this.blockchain[this.length - DIFFICULTY_ADJUSTMENT_INTERVAL];
    const timeExpected = BLOCK_GENERATION_INTERVAL * DIFFICULTY_ADJUSTMENT_INTERVAL;
    const timeTaken = this.latestBlock.timestamp - prevAdjustmentBlock.timestamp;

    if (timeTaken < timeExpected / 2) {
      return prevAdjustmentBlock.difficulty + 1;
    } else if (timeTaken > timeExpected * 2) {
      return prevAdjustmentBlock.difficulty - 1;
    } else {
      return prevAdjustmentBlock.difficulty;
    }
  }

  generateNextBlock(blockData: Data) {
    const previousBlock = this.latestBlock;
    const nextIndex = previousBlock.index + 1;
    const nextTimestamp = new Date().getTime();
    return new Block(nextIndex, previousBlock.hash, nextTimestamp, blockData, this.difficulty);
  }

  addBlock(newBlock: Block) {
    if (this.isNewBlockValid(newBlock)) {
      this.blockchain.push(newBlock);
    }
  }

  isNewBlockValid(newBlock: Block) {
    return BlockChain.isBlockValid(newBlock, this.latestBlock);
  }

  static isBlockValid(newBlock: Block, previousBlock: Block) {
    if (!Block.isBlockStructureValid(newBlock)) {
      console.log('invalid block structure: ' + JSON.stringify(newBlock));
      return false;
    }
    if (previousBlock.index + 1 !== newBlock.index) {
      console.log('Invalid index');
      return false;
    } else if (previousBlock.hash !== newBlock.previousHash) {
      console.log('Invalid previousHash');
      return false;
    } else if (Block.isTimestampValid(newBlock, previousBlock)) {
      console.log('Invalid timestamp');
      return false;
    } else if (Block.calculateHashForBlock(newBlock) !== newBlock.hash) {
      console.log('Invalid hash');
      return false;
    } else if (Block.hashMatchesDifficulty(newBlock.hash, newBlock.difficulty)) {
      console.log("Hash doesn't match difficulty");
      return false;
    }

    return true;
  }

  get accumulatedDifficulty() {
    return BlockChain.accumulatedDifficulty(this.blockchain);
  }

  static accumulatedDifficulty(blocks: Block[]) {
    return blocks.map((block) => Math.pow(2, block.difficulty)).reduce((a, b) => a + b);
  }

  replaceChain(newBlocks: Block[]) {
    if (
      BlockChain.isValidChain(newBlocks) &&
      BlockChain.accumulatedDifficulty(newBlocks) > this.accumulatedDifficulty
    ) {
      console.log(
        'Received blockchain is valid. Replacing current blockchain with received blockchain',
      );
      this.blockchain = newBlocks;
      return true;
    } else {
      console.log('Received blockchain invalid');
      return false;
    }
  }

  static isValidChain(blocks: Block[]) {
    if (JSON.stringify(blocks[0]) !== JSON.stringify(this.genesisBlock)) {
      return false;
    }

    for (let i = 1; i < blocks.length; i++) {
      if (!BlockChain.isBlockValid(blocks[i], blocks[i - 1])) {
        return false;
      }
    }

    return true;
  }
}
