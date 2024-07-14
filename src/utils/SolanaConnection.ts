import { Connection, PublicKey } from '@solana/web3.js';
import { AnchorProvider, setProvider, Program } from '@project-serum/anchor';
import { OCR2Feed } from "@chainlink/solana-sdk";

// This is a mock wallet for browser environments
const MockWallet = {
  signTransaction: () => Promise.reject(),
  signAllTransactions: () => Promise.reject(),
  publicKey: PublicKey.default,
};

export const CHAINLINK_PROGRAM_ID = new PublicKey("cjg3oHmg9uuPsP8D6g29NWvhySJkdYdAo9D25PRbKXJ");

let connection: Connection | null = null;
let provider: AnchorProvider | null = null;

export function getConnection(): Connection {
  if (!connection) {
    connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com");
  }
  return connection;
}

export function getProvider(): AnchorProvider {
  if (!provider) {
    const connection = getConnection();
    provider = new AnchorProvider(connection, MockWallet, {});
    setProvider(provider);
  }
  return provider;
}

export async function getOCR2Feed(): Promise<OCR2Feed> {
  const provider = getProvider();
  return OCR2Feed.load(CHAINLINK_PROGRAM_ID, provider);
}