import Web3 from "web3";
import {
  abi,
  contractAddresses,
} from "../constants/smart_contract_details/index.js";

const web3 = new Web3(process.env.ETHEREUM_NODE_URL);
const minervaContractAddress = process.env.MINERVA_CONTRACT_ADDRESS;
const minervaContractABI = abi;

const minervaContract = new web3.eth.Contract(
  minervaContractABI,
  minervaContractAddress
);

const listenToEvent = async () => {
  minervaContract.events.UserRegistered({}, (error, event) => {
    if (error) {
      console.error("Error listening to RegisterUser event:", error);
      return;
    }

    console.log("RegisterUser event received:", event.returnValues);
  });
  console.log("Listening to RegisterUser event...");
};

export default listenToEvent;
