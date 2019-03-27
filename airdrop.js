// var Excel = require('exceljs');
var Web3 = require('web3');
var Tx = require('ethereumjs-tx');
var ethUtils = require('ethereumjs-util');
var assert = require('assert');
var abiJson = require('./DOSToken.json');

//config param---------------------
var pk = process.env.PK;
assert(pk !== undefined && pk.length == 64, "Please export private key in hex format without leading '0x'");

var pkBuf = Buffer.from(pk, 'hex');
var fromAddr = '0x' + ethUtils.privateToAddress(pkBuf).toString('hex'); // 从私钥得到地址
// var nodeURI = 'https://ropsten.infura.io/zbI5uVZrIdl9VdoWDqMG';
var nodeURI = 'https://mainnet.infura.io/zbI5uVZrIdl9VdoWDqMG';
var gasPrice = 4 * 1e9; // 4Gwei
var gasLimit = 60000;
var decimals = 1e18;
var dosAddr = "0x70861e862E1Ac0C96f853C8231826e469eAd37B1";

var droppedAddr = "地址";
var droppedAmount = 400;
//-----------------------------

var web3 = new Web3(new Web3.providers.HttpProvider(nodeURI));
var dosToken = web3.eth.contract(abiJson).at(dosAddr);

var callData = dosToken.transfer.getData(droppedAddr, droppedAmount * decimals);

async function getNonce() {
  return await web3.eth.getTransactionCount(fromAddr);
}

var nonce = getNonce();

var rawTx = {
  nonce: nonce++,
  gasPrice: web3.toHex(gasPrice),
  gasLimit: web3.toHex(gasLimit),
  to: dosAddr,
  value: '0x0',
  data: callData
};

var tx = new Tx(rawTx);
tx.sign(pkBuf);

var serializedTx = tx.serialize();

var txHash = tx.hash().toString('hex');

console.log(`txHash: ${txHash}`);

web3.eth.sendRawTransaction("0x" + serializedTx.toString('hex'), function (err, hash) {
  if (!err) {
    console.log("Dropped Address: " + droppedAddr + "\tAmount: " + droppedAmount + "\tTxHash: " + hash);
  } else {
    console.log("\tAddress: " + droppedAddr + "\tAmount: " + droppedAmount + "\tErr message: " + err);
  }
});


// PK=<没有0x前缀的私钥> node airdrop.js