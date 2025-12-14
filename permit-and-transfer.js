require("dotenv").config();
const { toMultichainNexusAccount, createMeeClient, getMEEVersion, MEEVersion } = require("@biconomy/abstractjs");
const { ethers } = require("ethers");
const { Web3Provider } = require("@metamask/providers");

// USDC Contract Address and ABI
const USDC_CONTRACT_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const ERC20_ABI = [
  "function permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s)",
  "function nonces(address owner) view returns (uint256)",
];

async function connectMetaMask() {
  // MetaMask provider
  const provider = new ethers.providers.Web3Provider(window.ethereum);

  // Request account access
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();

  console.log("Connected account:", await signer.getAddress());
  return signer;
}

async function permitAndTransfer() {
  try {
    const signer = await connectMetaMask();

    // USDC Contract Instance
    const usdcContract = new ethers.Contract(USDC_CONTRACT_ADDRESS, ERC20_ABI, signer);

    // Generate the permit signature
    const domain = {
      name: "USD Coin",
      version: "2",
      chainId: await signer.getChainId(),
      verifyingContract: USDC_CONTRACT_ADDRESS,
    };

    const types = {
      Permit: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    };

    const nonce = await usdcContract.nonces(await signer.getAddress());
    const value = ethers.utils.parseUnits("1.0", 6); // Example: 1 USDC
    const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 minutes from now

    const message = {
      owner: await signer.getAddress(),
      spender: "0xSpenderAddress", // Replace with actual spender address
      value,
      nonce,
      deadline,
    };

    const signature = await signer._signTypedData(domain, types, message);
    const { v, r, s } = ethers.utils.splitSignature(signature);

    // Call the permit function
    console.log("Calling permit...");
    const tx = await usdcContract.permit(
      message.owner,
      message.spender,
      message.value,
      message.deadline,
      v,
      r,
      s
    );

    console.log("Permit transaction sent. Waiting for confirmation...");
    await tx.wait();
    console.log("Permit confirmed:", tx.hash);
  } catch (error) {
    console.error("Error during permit and transfer:", error);
  }
}

permitAndTransfer();