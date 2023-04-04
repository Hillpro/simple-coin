import { Block } from "./block";
import { Data } from "./data";

export class BlockChain {
    private blockchain: Block[]

    constructor() {
        this.blockchain = [this.genesisBlock]
    }

    get genesisBlock() {
        return new Block(0, "0", 1680546496366, new Data("First block")); // hash:"d00ff3db391778c7893b9c804c0f2d473edbe7649f21b318c349f228dbd5b57e"
    }

    get latestBlock() {
        return this.blockchain[this.blockchain.length - 1];
    }

    get blocks() {
        return this.blockchain;
    }

    generateNextBlock(blockData: Data) {
        let previousBlock = this.latestBlock;
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
        return this.isBlockValid(newBlock, this.latestBlock)
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

    replaceChain(newBlocks: Block[]) {
        if (this.isValidChain(newBlocks) && newBlocks.length > this.blockchain.length) {
            console.log('Received blockchain is valid. Replacing current blockchain with received blockchain');
            this.blockchain = newBlocks;
            return true;
        } else {
            console.log('Received blockchain invalid');
            return false;
        }
    }

    isValidChain(blocks: Block[]) {
        if (JSON.stringify(blocks[0]) !== JSON.stringify(this.genesisBlock)) {
            return false;
        }
        let tempBlocks = [blocks[0]];

        for (var i = 1; i < blocks.length; i++) {
            if (this.isBlockValid(blocks[i], tempBlocks[i - 1])) {
                tempBlocks.push(blocks[i]);
            } else {
                return false;
            }
        }
        return true;
    };
}