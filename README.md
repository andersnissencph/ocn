# OCN Demo

Contains mock eMobility Service Provider (eMSP) and Charge Point Operator (CPO) servers for use in developing connections
to an OCN Client.

The servers are designed to be used with the [OCN Client tutorial](https://bitbucket.org/shareandcharge/ocn-client/src/develop/examples/).

To start the servers:

```
npm install
npm start
```

To register the MSP used in the tutorial (with country code "DE" and party ID "MSP"):

```
npm run register-msp
```
