import * as dotenv from "dotenv";
dotenv.config();
import { privateKeyToAccount } from "viem/accounts";
import { wrapFetchWithPayment, decodeXPaymentResponse } from "x402-fetch";
import { getDecryptedPK } from "./getDecryptedPK";

const URL_TO_SEND_REQUEST = "http://localhost:3000/api/payment/builder";

async function main() {
  const privateKey = await getDecryptedPK();

  if (!privateKey) return;

  const account = privateKeyToAccount(privateKey as `0x${string}`);

  console.log("\n 📡 Sending x402 transaction on baseSepolia from", account.address, "\n");

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
