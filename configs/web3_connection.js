import Web3 from "web3";
import fs from "fs";
const parsedABI = JSON.parse(
  fs.readFileSync("./constants/smart_contract_details/abi.json")
);
const web3 = new Web3(process.env.ETHEREUM_NODE_URL);
const contract = new web3.eth.Contract(
  parsedABI,
  process.env.MINERVA_CONTRACT_ADDRESS
);
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
