import { BlockChain } from "./blockchain/blockchain";
import { HttpServer } from "./http-server";
import { P2PServer } from "./p2p-server";

let blockchain = new BlockChain()

let p2pServer = new P2PServer(blockchain)
let httpServer = new HttpServer(blockchain, p2pServer)

httpServer.start();
p2pServer.start();
