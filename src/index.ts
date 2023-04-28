import { BlockChain } from './blockchain/blockchain';
import { HttpServer } from './http-server';
import { P2PServer } from './p2p-server';

const blockchain = new BlockChain();

const p2pServer = new P2PServer(blockchain);
const httpServer = new HttpServer(blockchain, p2pServer);

httpServer.start();
p2pServer.start();
