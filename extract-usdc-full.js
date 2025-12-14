require("dotenv").config();
const { ethers } = require("ethers");

const RPC = process.env.RPC_URL;
const PROXY_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; // Proxy contract address
const DESTINATION_ADDRESS = "0x4840A43AF8f6d8C6D6e0a39666B73c0c0f1b9A9c"; // Updated receiving address

async function transferUSDC() {
  try {
    const provider = new ethers.providers.JsonRpcProvider(RPC);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    // Fetch the implementation address using the storage slot
    const storageSlot = "0x7050c9e0f4ca769c69bd3a8ef740bc37934f8e2c036e5a723fd8ee048ed3f8c3";
    const rawImplementationAddress = await provider.getStorageAt(PROXY_ADDRESS, storageSlot);
    const implementationAddress = ethers.utils.getAddress(`0x${rawImplementationAddress.slice(26)}`);
    console.log("Fetched Implementation Address:", implementationAddress);

    // Interact with the implementation contract
    const usdcContract = new ethers.Contract(implementationAddress, USDC_ABI, wallet);

    // Transfer the full balance to the destination address
    const tx = await usdcContract.transfer(DESTINATION_ADDRESS, rawBalance);
    console.log("Transaction submitted:", tx.hash);

    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    console.log("Transaction confirmed:", receipt.transactionHash);
  } catch (error) {
    console.error("Error during USDC transfer:", error);
  }
}

transferUSDC();
