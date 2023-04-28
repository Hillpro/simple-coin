import WebSocket from 'ws';
import { BlockChain } from './blockchain/blockchain';
import { Block } from './blockchain/block';

const p2p_port: number = Number(process.env.P2P_PORT) || 6001;
const enum MessageType {
  QUERY_LATEST = 0,
  QUERY_ALL = 1,
  RESPONSE_BLOCKCHAIN = 2,
}
interface Message {
  type: MessageType;
  data?: any;
}

export class P2PServer {
  private server: WebSocket.Server;
  private sockets: WebSocket[];

  constructor(private blockchain: BlockChain) {
    this.sockets = [];

    this.server = new WebSocket.Server({ port: p2p_port });
  }

  start() {
    this.connectToPeers(process.env.PEERS ? process.env.PEERS.split(',') : []);

    this.server.on('connection', (ws, req) => {
      console.log(req.socket.remoteAddress + ' ' + req.socket.remotePort);
      this.initConnection(ws);
    });
    console.log('listenning websocket p2p port on: ' + p2p_port);
  }

  connectToPeers(newPeers: any[]) {
    newPeers.forEach((peer) => {
      const ws = new WebSocket(peer);
      ws.on('open', () => this.initConnection(ws));
      ws.on('error', () => {
        console.log('connection failed');
      });
    });
  }

  get peers() {
    return this.sockets.map((s) => s.url);
  }

  private initConnection(ws: WebSocket) {
    this.sockets.push(ws);
    this.initMessageHandler(ws);
    this.initErrorHandler(ws);
    this.sendMessage(ws, { type: MessageType.QUERY_LATEST });
  }

  private initMessageHandler(ws: WebSocket) {
    ws.on('message', (data) => {
      const message = JSON.parse(data.toString());
      console.log('Received message' + JSON.stringify(message));
      switch (message.type) {
        case MessageType.QUERY_LATEST:
          this.sendMessage(ws, this.latestBlockMessage);
          break;
        case MessageType.QUERY_ALL:
          this.sendMessage(ws, this.blockchainMessage);
          break;
        case MessageType.RESPONSE_BLOCKCHAIN:
          this.handleBlockchainResponse(message);
          break;
      }
    });
  }

  handleBlockchainResponse(message: any) {
    const receivedBlocks = JSON.parse(message.data).sort(
      (b1: Block, b2: Block) => b1.index - b2.index,
    );
    const latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
    const latestBlockHeld = this.blockchain.latestBlock;

    if (latestBlockReceived.index > latestBlockHeld.index) {
      console.log(
        'blockchain possibly behind. We got: ' +
          latestBlockHeld.index +
          ' Peer got: ' +
          latestBlockReceived.index,
      );
      if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
        console.log('We can append the received block to our chain');
        this.blockchain.addBlock(latestBlockReceived);
        this.broadcast(this.latestBlockMessage);
      } else if (receivedBlocks.length === 1) {
        console.log('We have to query the chain from our peer');
        this.broadcast(this.blockchainMessage);
      } else {
        console.log('Received blockchain is longer than current blockchain');
        if (this.blockchain.replaceChain(receivedBlocks)) {
          this.broadcast(this.blockchainMessage);
        }
      }
    } else {
      console.log('received blockchain is not longer than current blockchain. Do nothing');
    }
  }

  blockAdded() {
    this.broadcast(this.latestBlockMessage);
  }

  private initErrorHandler(ws: WebSocket) {
    ws.on('close', () => this.closeConnection(ws));
    ws.on('error', () => this.closeConnection(ws));
  }

  private closeConnection(ws: WebSocket) {
    console.log('connection failed to peer: ' + ws.url);
    this.sockets.splice(this.sockets.indexOf(ws), 1);
  }

  private broadcast(message: Message) {
    this.sockets.forEach((socket) => {
      this.sendMessage(socket, message);
    });
  }

  private sendMessage(ws: WebSocket, message: Message) {
    message.data = JSON.stringify(message.data);
    ws.send(JSON.stringify(message));
  }

  private get latestBlockMessage(): Message {
    return {
      type: MessageType.RESPONSE_BLOCKCHAIN,
      data: [this.blockchain.latestBlock],
    };
  }

  private get blockchainMessage(): Message {
    return {
      type: MessageType.RESPONSE_BLOCKCHAIN,
      data: this.blockchain.blocks,
    };
  }
}
