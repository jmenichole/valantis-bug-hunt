require("dotenv").config();
const { Wallet } = require("ethers");

const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  console.error("PRIVATE_KEY is not set in the environment variables.");
  process.exit(1);
}

console.log("Loaded PRIVATE_KEY:", privateKey);

try {
  const wallet = new Wallet(privateKey);
  console.log("Wallet Address:", wallet.address);
} catch (err) {
  console.error("Invalid Private Key:", err.message);
}