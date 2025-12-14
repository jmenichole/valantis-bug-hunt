require('dotenv').config();
const { ethers } = require('ethers');

// USDC Contract Address on Ethereum Mainnet
const USDC_CONTRACT_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

// ERC20 ABI (Minimal)
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)"
];

// Load environment variables
const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RECIPIENT = process.env.RECIPIENT; // Address to send USDC to
const AMOUNT = process.env.AMOUNT; // Amount of USDC to send (in smallest unit)

// Bypass self-signed certificate validation
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";


// Initialize provider
const provider = new ethers.providers.JsonRpcProvider("https://mainnet.infura.io/v3/7c6e0ff1bc694f49befa78f3c78aa065");

const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// USDC Contract Instance
const usdcContract = new ethers.Contract(USDC_CONTRACT_ADDRESS, ERC20_ABI, wallet);

async function transferUSDC() {
  try {
    // Check balance
    const balance = await usdcContract.balanceOf(wallet.address);
    console.log(`USDC Balance: ${ethers.utils.formatUnits(balance, 6)} USDC`);

    if (balance.lt(ethers.utils.parseUnits(AMOUNT, 6))) {
      console.error("Insufficient USDC balance.");
      return;
    }

    // Transfer USDC
    console.log(`Transferring ${AMOUNT} USDC to ${RECIPIENT}...`);
    const tx = await usdcContract.transfer(RECIPIENT, ethers.utils.parseUnits(AMOUNT, 6), {
      gasLimit: 100000,
    });
    console.log("Transaction sent. Waiting for confirmation...");
    await tx.wait();
    console.log("Transaction confirmed:", tx.hash);
  } catch (error) {
    console.error("Error during transfer:", error);
  }
}

transferUSDC();