import fs from 'fs/promises';
async function getContractAddresses() {
    try {
      const data = await fs.readFile('./constants/smart_contract_details/contractAddresses.json', 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading contractAddresses.json:', error);
      return {};
    }
  }
  
  const contractAddresses = await getContractAddresses();
  async function getABI() {
    try {
      const data = await fs.readFile('./constants/smart_contract_details/abi.json', 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading abi.json:', error);
      return [];
    }
  }
  
  const abi = await getABI();

    export {contractAddresses, abi};