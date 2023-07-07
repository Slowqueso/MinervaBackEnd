import Web3 from "web3";
import fs from "fs";

const PROD = process.env.PRODUCTION;
let ETHEREUM_NODE_URL, ETHERUM_CHAIN_ID, MINERVA_CONTRACT_ADDRESS;

if (PROD === "true") {
  ETHEREUM_NODE_URL = process.env.ETHEREUM_NODE_URL;
  ETHERUM_CHAIN_ID = process.env.ETHERUM_CHAIN_ID;
  MINERVA_CONTRACT_ADDRESS = process.env.MINERVA_CONTRACT_ADDRESS;
} else {
  ETHEREUM_NODE_URL = process.env.ETHEREUM_DEV_NODE_URL;
  ETHERUM_CHAIN_ID = process.env.ETHERUM_DEV_CHAIN_ID;
  MINERVA_CONTRACT_ADDRESS = process.env.MINERVA_DEV_CONTRACT_ADDRESS;
}

const parsedABI = JSON.parse(
  fs.readFileSync("./constants/smart_contract_details/abi.json")
);
const web3 = new Web3(ETHEREUM_NODE_URL);
const contract = new web3.eth.Contract(parsedABI, MINERVA_CONTRACT_ADDRESS);
const accounts = await web3.eth.getAccounts();

async function connectToDevchain() {
  try {
    const networkId = await web3.eth.net.getId();
    console.log("Connected to devchain with network ID:", networkId);
  } catch (error) {
    console.error("Error connecting to devchain:", error);
  }
}

connectToDevchain();

export { web3, contract, accounts };
