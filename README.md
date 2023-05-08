# SimpleCoin

Typescript implementation of a functionning cryptocurrency with PoW, transactions and wallets.

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
