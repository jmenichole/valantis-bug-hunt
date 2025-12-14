import { ethers } from "ethers";
import { Buffer } from "buffer";

// USDC Contract Address and ABI
const USDC_CONTRACT_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const ERC20_ABI = [
  "function transfer(address to, uint256 amount) public returns (bool)",
];

window.Buffer = Buffer;

async function connectMetaMask() {
  // MetaMask provider
  const provider = new ethers.providers.Web3Provider(window.ethereum);

  // Request account access
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();

  console.log("Connected account:", await signer.getAddress());
  return signer;
}

async function transferUSDC() {
  try {
    const signer = await connectMetaMask();

    const signerAddress = await signer.getAddress();
    console.log("Connected account:", signerAddress);

    const usdcContract = new ethers.Contract(USDC_CONTRACT_ADDRESS, ERC20_ABI, signer);
    console.log("USDC Contract Address:", USDC_CONTRACT_ADDRESS);

    const recipient = "0x4840A43AF8f6d8C6D6e0a39666B73c0c0f1b9A9c";
    const amount = ethers.utils.parseUnits("100.0", 6);

    if (!ethers.utils.isAddress(recipient)) {
      throw new Error("Invalid recipient address");
    }
    console.log("Recipient:", recipient);
    console.log("Amount (in smallest units):", amount.toString());

    console.log("Initiating USDC transfer...");

    // Simulate the transaction
    const simulation = await usdcContract.callStatic.transfer(recipient, amount);
    console.log("Simulation result:", simulation);

    // Populate the transaction
    const tx = await usdcContract.populateTransaction.transfer(recipient, amount);
    console.log("Populated Transaction:", tx);

    // Send the transaction with manual gas configuration
    const sentTx = await signer.sendTransaction({
      ...tx,
      gasLimit: ethers.utils.hexlify(100000), // Example gas limit
      gasPrice: ethers.utils.parseUnits("20", "gwei"), // Example gas price
    });

    console.log("Transaction sent. Waiting for confirmation...");
    const receipt = await sentTx.wait();
    console.log("Transfer confirmed:", receipt.transactionHash);
  } catch (error) {
    console.error("Error during USDC transfer:", JSON.stringify(error, null, 2));
  }
}

transferUSDC();