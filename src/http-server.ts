import bodyParser from 'body-parser';
import express from 'express';
import { Express, Router } from 'express';
import { BlockChain } from './blockchain/blockchain';
import { Data } from './blockchain/data';
import { P2PServer } from './p2p-server';

const http_port = process.env.HTTP_PORT || 3001;

export class HttpServer {
  private app: Express;

  constructor(private blockchain: BlockChain, private p2pServer: P2PServer) {
    this.app = express();
    this.app.use(bodyParser.json());

    this.app.use('', this.router);
  }

  start() {
    this.app.listen(http_port, () => console.log('Listening http on port: ' + http_port));
  }

  private get router() {
    const router = Router();
    router.get('/blocks', (req, res) => {
      res.json(this.blockchain);
    });

    router.post('/mineBlock', (req, res) => {
      const newBlock = this.blockchain.generateNextBlock(new Data(req.body.data));
      this.blockchain.addBlock(newBlock);
      this.p2pServer.blockAdded();
      console.log('block added: ' + JSON.stringify(newBlock));
      res.send();
    });

    router.get('/peers', (req, res) => {
      res.send(this.p2pServer.peers);
    });

    router.post('/addPeer', (req, res) => {
      this.p2pServer.connectToPeers([req.body.peer]);
      res.send();
    });

    return router;
  }
}
