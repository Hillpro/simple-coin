import { BlockChain } from "./blockchain";
import { Data } from "./data";

let blockChain = new BlockChain()

let newBlock = blockChain.generateNextBlock(new Data("Hello"));

blockChain.addBlock(newBlock);

console.log(JSON.stringify(blockChain));
