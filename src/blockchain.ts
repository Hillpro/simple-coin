import { Block } from "./block";
import { Data } from "./data";

export class BlockChain {
    blockchain: [Block]

    constructor() {
        this.blockchain = [this.getGenesisBlock()]
    }

    getGenesisBlock() {
        return new Block(0, "0", 1680546496366, new Data("First block")); // hash:"d00ff3db391778c7893b9c804c0f2d473edbe7649f21b318c349f228dbd5b57e"
    }

    getLatestBlock() {
        return this.blockchain[this.blockchain.length - 1];
    }

    generateNextBlock(blockData: Data) {
        let previousBlock = this.getLatestBlock();
        let nextIndex = previousBlock.index + 1;
        let nextTimestamp = new Date().getTime();
        return new Block(nextIndex, previousBlock.hash, nextTimestamp, blockData);
    }

    addBlock(newBlock: Block) {
        if (this.isNewBlockValid(newBlock)) {
            this.blockchain.push(newBlock);
        }
    }

    isNewBlockValid(newBlock: Block) {
        return this.isBlockValid(newBlock, this.getLatestBlock())
    }

    isBlockValid(newBlock: Block, previousBlock: Block) {
        if (previousBlock.index + 1 !== newBlock.index) {
            console.log('Invalid index');
            return false;
        } else if (previousBlock.hash !== newBlock.previousHash) {
            console.log('Invalid previousHash');
            return false;
        } else if (Block.calculateHashForBlock(newBlock) !== newBlock.hash) {
            console.log('Invalid hash');
            return false;
        }
        return true;
    }
}