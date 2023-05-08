# SimpleCoin

Typescript implementation of a functionning cryptocurrency with PoW, transactions and wallets.

### Key concepts of the Blockchain
* HTTP interface to control the node
* Use Websockets to communicate with other nodes (P2P)
* Super simple "protocols" in P2P communication
* Data is not persisted in nodes
* No proof-of-work or proof-of-stake: a block can be added to the blockchain without competition


### Quick start
```
npm install
npm start
```

##### Get blockchain
```
curl http://localhost:3001/blocks
```

##### Mine a block
```
curl -X POST http://localhost:3001/mineBlock
``` 

##### Send transaction
```
curl -H "Content-type: application/json" --data '{"address": "ADDRESS", "amount" : 50}' http://localhost:3001/sendTransaction
```

##### Query transaction pool
```
curl http://localhost:3001/transactionPool
```

##### Mine transaction
```
curl -H "Content-type: application/json" --data '{"address": "ADDRESS", "amount" : 50}' http://localhost:3001/mineTransaction
```

##### Get balance
```
curl http://localhost:3001/balance
```

#### Query information about a specific address
```
curl http://localhost:3001/address/ADDRESS
```

##### Add peer
```
curl -H "Content-type:application/json" --data '{"peer" : "ws://localhost:6001"}' http://localhost:3001/addPeer
```
#### Query connected peers
```
curl http://localhost:3001/peers
```
