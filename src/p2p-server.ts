import WebSocket from "ws"
import { BlockChain } from "./blockchain/blockchain";
import { Block } from "./blockchain/block";

const p2p_port: number = Number(process.env.P2P_PORT) || 6001
const enum MessageType {
    QUERY_LATEST= 0,
    QUERY_ALL= 1,
    RESPONSE_BLOCKCHAIN= 2
};

export class P2PServer {
    server: WebSocket.Server
    sockets: WebSocket[];

    constructor(private blockchain: BlockChain) {
        this.sockets = [];
        
        this.server = new WebSocket.Server({port: p2p_port})
    }

    start() {
        this.connectToPeers(process.env.PEERS ? process.env.PEERS.split(',') : [])

        this.server.on('connection', (ws, req) => {
            console.log(req.socket.remoteAddress + " " + req.socket.remotePort)
            this.initConnection(ws)
        });
        console.log('listenning websocket p2p port on: ' + p2p_port);
    }

    connectToPeers(newPeers: any[]) {
        newPeers.forEach((peer) => {
            let ws = new WebSocket(peer);
            ws.on('open', () => this.initConnection(ws));
            ws.on('error', () => {
                console.log('connection failed')
            });
        });
    }

    getPeers() {
        return this.sockets.map(s => s.url);
    }

    private initConnection(ws: WebSocket) {
        this.sockets.push(ws);
        this.initMessageHandler(ws);
        this.initErrorHandler(ws);
        this.sendMessage(ws, MessageType.QUERY_LATEST);
    }

    private initMessageHandler(ws: WebSocket) {
        ws.on('message', (data) => {
            let message = JSON.parse(data.toString());
            console.log('Received message' + JSON.stringify(message));
            switch (message.type) {
                case MessageType.QUERY_LATEST:
                    this.sendMessage(ws, MessageType.RESPONSE_BLOCKCHAIN, this.blockchain.getLatestBlock());
                    break;
                case MessageType.QUERY_ALL:
                    this.sendMessage(ws, MessageType.RESPONSE_BLOCKCHAIN, this.blockchain);
                    break;
                case MessageType.RESPONSE_BLOCKCHAIN:
                    this.handleBlockchainResponse(message);
                    break;
            }
        });
    }

    handleBlockchainResponse(message: any) {
        let receivedBlocks = JSON.parse(message.data)['blockchain'].sort((b1: Block, b2: Block) => (b1.index - b2.index));
        let latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
        let latestBlockHeld = this.blockchain.getLatestBlock();

        if (latestBlockReceived.index > latestBlockHeld.index) {
            console.log('blockchain possibly behind. We got: ' + latestBlockHeld.index + ' Peer got: ' + latestBlockReceived.index);
            if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
                console.log("We can append the received block to our chain");
                this.blockchain.addBlock(latestBlockReceived);
                this.broadcast(MessageType.RESPONSE_BLOCKCHAIN, this.blockchain.getLatestBlock());
            } else if (receivedBlocks.length === 1) {
                console.log("We have to query the chain from our peer");
                this.broadcast(MessageType.RESPONSE_BLOCKCHAIN, this.blockchain);
            } else {
                console.log("Received blockchain is longer than current blockchain");
                if (this.blockchain.replaceChain(receivedBlocks)) {
                    this.broadcast(MessageType.RESPONSE_BLOCKCHAIN, this.blockchain);
                }
            }
        } else {
            console.log('received blockchain is not longer than current blockchain. Do nothing');
        }
    };

    blockAdded() {
        this.broadcast(MessageType.RESPONSE_BLOCKCHAIN, this.blockchain);
    }
    
    private initErrorHandler(ws: WebSocket) {
        ws.on('close', () => this.closeConnection(ws));
        ws.on('error', () => this.closeConnection(ws));
    }

    private closeConnection(ws: WebSocket) {
        console.log('connection failed to peer: ' + ws.url);
        this.sockets.splice(this.sockets.indexOf(ws), 1);
    }

    private broadcast(type: MessageType, data?: any) {
        this.sockets.forEach(socket => {
            this.sendMessage(socket, type, data)
        })
    }

    private sendMessage(ws: WebSocket, type: MessageType, data?: any) {
        ws.send(JSON.stringify({'type': type, 'data': JSON.stringify(data)}))
    }
}




