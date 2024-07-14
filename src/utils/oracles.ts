import { PriceServiceConnection, PriceFeed } from "@pythnetwork/price-service-client";
import { PublicKey } from "@solana/web3.js";
import { getOCR2Feed, CHAINLINK_PROGRAM_ID } from "./SolanaConnection";
import axios from 'axios';


interface DIAResponse {
  Symbol: string;
  Name: string;
  Address: string;
  Blockchain: string;
  Price: number;
  PriceYesterday: number;
  VolumeYesterdayUSD: number;
  Time: string;
  Source: string;
  Signature: string;
}

export async function getDIAPrice(blockchain: string, asset: string): Promise<number | null> {
  try {
    const response = await axios.get<DIAResponse>(`https://api.diadata.org/v1/assetQuotation/${blockchain}/${asset}`);
    console.log("DIA price received:", response.data.Price);
    return response.data.Price;
  } catch (error) {
    console.error("Error fetching DIA price:", error);
    return null;
  }
}

export function subscribeToDIAPriceUpdates(blockchain: string, asset: string, callback: (price: number | null) => void) {
  let intervalId: NodeJS.Timeout;
  let lastKnownPrice: number | null = null;

  const fetchAndUpdatePrice = async () => {
    const price = await getDIAPrice(blockchain, asset);
    if (price !== null) {
      lastKnownPrice = price;
    }
    callback(lastKnownPrice);
  };

  // Fetch immediately and then every 10 seconds
  fetchAndUpdatePrice();
  intervalId = setInterval(fetchAndUpdatePrice, 1000);

  return () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  };
}

const PYTH_HTTP_ENDPOINT = "https://hermes.pyth.network";  // Change this line
let pythConnection: PriceServiceConnection | null = null;

async function getPythConnection(): Promise<PriceServiceConnection> {
  if (!pythConnection) {
    pythConnection = new PriceServiceConnection(PYTH_HTTP_ENDPOINT);
  }
  return pythConnection;
}

export async function getPythPrice(priceId: string): Promise<number | null> {
  try {
    const connection = await getPythConnection();
    const priceFeeds = await connection.getLatestPriceFeeds([priceId]);
    if (priceFeeds && priceFeeds.length > 0) {
      const priceFeed = priceFeeds[0];
      const price = priceFeed.getPriceNoOlderThan(60);
      if (price) {
        return Number(price.price) * Math.pow(10, price.expo);
      }
    }
    throw new Error("Unable to fetch Pyth price");
  } catch (error) {
    console.error("Error fetching Pyth price:", error);
    return null;
  }
}

export async function getChainlinkPrice(feedAddress: string, lastKnownPrice: number | null): Promise<number | null> {
  return new Promise(async (resolve) => {
    try {
      console.log("Fetching Chainlink price for", feedAddress);
      const dataFeed = await getOCR2Feed();
      const feedAddressPubkey = new PublicKey(feedAddress);
      
      let listener: number;
      let timeout: NodeJS.Timeout;

      const handleRound = (round: any) => {
        if (round.answer) {
          clearTimeout(timeout);
          dataFeed.removeListener(listener);
          const price = round.answer.toNumber() / 1e8;
          console.log("Chainlink price received:", price);
          resolve(price);
        }
      };

      listener = dataFeed.onRound(feedAddressPubkey, handleRound);

      timeout = setTimeout(() => {
        dataFeed.removeListener(listener);
        console.warn("Timeout waiting for Chainlink price update. Using last known price:", lastKnownPrice);
        resolve(lastKnownPrice);
      }, 30000);

    } catch (error) {
      console.error("Error fetching Chainlink price:", error);
      resolve(lastKnownPrice);
    }
  });
}

export function subscribeToPythPriceUpdates(priceId: string, callback: (price: number | null) => void) {
  let intervalId: NodeJS.Timeout;

  const fetchAndUpdatePrice = async () => {
    const price = await getPythPrice(priceId);
    callback(price);
  };

  // Fetch immediately and then every 10 seconds
  fetchAndUpdatePrice();
  intervalId = setInterval(fetchAndUpdatePrice, 1000);

  return () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  };
}

export function subscribeToChainlinkPriceUpdates(feedAddress: string, callback: (price: number | null) => void) {
  let intervalId: NodeJS.Timeout;
  let lastKnownPrice: number | null = null;

  const fetchAndUpdatePrice = async () => {
    const price = await getChainlinkPrice(feedAddress, lastKnownPrice);
    if (price !== null) {
      lastKnownPrice = price;
    }
    callback(lastKnownPrice);
  };

  // Fetch immediately and then every 10 seconds
  fetchAndUpdatePrice();
  intervalId = setInterval(fetchAndUpdatePrice, 1000);

  return () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  };
}

export function closeAllConnections() {
  // No need to close anything since we're not using WebSockets anymore
  console.log("Closing all connections");
}