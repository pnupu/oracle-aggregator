// src/utils/aggregator.ts
import { PriceData } from '../types';
import { getPythPrice, getChainlinkPrice, getDIAPrice } from "./oracles";

export async function getAllPrices(
  pythPriceId: string,
  chainlinkFeedAddress: string,
  diaBlockchain: string,
  diaAsset: string
): Promise<PriceData> {
  try {
    const [pythPrice, chainlinkPrice, diaPrice] = await Promise.all([
      getPythPrice(pythPriceId),
      getChainlinkPrice(chainlinkFeedAddress, null),
      getDIAPrice(diaBlockchain, diaAsset)
    ]);

    return {
      pythPrice,
      chainlinkPrice,
      diaPrice
    };
  } catch (error) {
    console.error("Error fetching prices:", error);
    return {
      pythPrice: null,
      chainlinkPrice: null,
      diaPrice: null
    };
  }
}