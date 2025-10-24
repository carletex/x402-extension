import * as dotenv from "dotenv";
dotenv.config();
import { Wallet } from "ethers";
import password from "@inquirer/password";
import { Account, privateKeyToAccount } from "viem/accounts";
import { wrapFetchWithPayment, decodeXPaymentResponse } from "x402-fetch";

const URL_TO_SEND_REQUEST = "http://localhost:3000/api/payment/builder";

async function main() {
  const encryptedKey = process.env.DEPLOYER_PRIVATE_KEY_ENCRYPTED;

  if (!encryptedKey) {
    console.log("🚫️ You don't have a deployer account. Run `yarn generate` or `yarn account:import` first");
    return;
  }

  const pass = await password({ message: "Enter your password to decrypt the private key:" });
  let wallet: Wallet;
  let account: Account;
  try {
    wallet = (await Wallet.fromEncryptedJson(encryptedKey, pass)) as Wallet;
    account = privateKeyToAccount(wallet.privateKey as `0x${string}`);
  } catch {
    console.log("❌ Failed to decrypt private key. Wrong password?");
    return;
  }

  console.log("\n 📡 Sending x402 transaction on baseSepolia from", wallet.address, "\n");

  const fetchWithPayment = wrapFetchWithPayment(fetch, account);

  fetchWithPayment(URL_TO_SEND_REQUEST, {
    method: "GET",
  })
    .then(async (response: Response) => {
      const body = await response.json();
      console.log(body);

      const paymentResponse = decodeXPaymentResponse(response.headers.get("x-payment-response")!);
      console.log(paymentResponse);
    })
    .catch((error: any) => {
      console.error("error", error.response?.data?.error);
    });
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
