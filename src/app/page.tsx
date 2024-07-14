"use client";

const PRICE_FEEDS: any = {
  "SOL/USD": {
    pyth: "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d",
    chainlink: "99B2bTijsU6f1GCT73HmdR7HCFFjGMBcPZY6jZ96ynrR", // Devnet SOL/USD feed
    diaBlockchain: "Solana",
    diaAsset: "0x0000000000000000000000000000000000000000" // Native SOL token address
  },
  "BTC/USD": {
    pyth: "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
    chainlink: "6PxBx93S8x3tno1TsFZwT5VqP8drrRCbCXygEXYNkFJe", // Devnet BTC/USD feed
    diaBlockchain: "Bitcoin",
    diaAsset: "0x0000000000000000000000000000000000000000" // Bitcoin doesn't have an address, use this placeholder
  },
};

import { useState, useEffect, useMemo } from "react";
import { getAllPrices } from "../utils/aggregator";
import { subscribeToPythPriceUpdates, subscribeToChainlinkPriceUpdates, subscribeToDIAPriceUpdates } from "../utils/oracles";
import { PriceData, PriceFeedToggles } from '../types';


export default function Home() {
  const [priceData, setPriceData] = useState<PriceData>({
    pythPrice: null,
    chainlinkPrice: null,
    diaPrice: null
  });
  const [priceFeedToggles, setPriceFeedToggles] = useState<PriceFeedToggles>({
    usePyth: true,
    useChainlink: true,
    useDIA: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState("SOL/USD");

  const fetchPrices = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Fetching prices...");
      const newPriceData = await getAllPrices(
        PRICE_FEEDS[selectedAsset].pyth,
        PRICE_FEEDS[selectedAsset].chainlink,
        PRICE_FEEDS[selectedAsset].diaBlockchain,
        PRICE_FEEDS[selectedAsset].diaAsset
      );
      console.log("New price data:", newPriceData);
      setPriceData(newPriceData);
    } catch (err) {
      console.error("Error in fetchPrices:", err);
      setError("Failed to fetch prices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();

    const unsubscribePyth = subscribeToPythPriceUpdates(PRICE_FEEDS[selectedAsset].pyth, (price) => {
      setPriceData(prevData => ({...prevData, pythPrice: price}));
    });

    const unsubscribeChainlink = subscribeToChainlinkPriceUpdates(PRICE_FEEDS[selectedAsset].chainlink, (price) => {
      setPriceData(prevData => ({...prevData, chainlinkPrice: price}));
    });

    const unsubscribeDIA = subscribeToDIAPriceUpdates(
      PRICE_FEEDS[selectedAsset].diaBlockchain,
      PRICE_FEEDS[selectedAsset].diaAsset,
      (price) => {
        setPriceData(prevData => ({...prevData, diaPrice: price}));
      }
    );

    return () => {
      unsubscribePyth();
      unsubscribeChainlink();
      unsubscribeDIA();
    };
  }, [selectedAsset]);

  const togglePriceFeed = (feed: keyof PriceFeedToggles) => {
    setPriceFeedToggles(prevToggles => ({...prevToggles, [feed]: !prevToggles[feed]}));
  };

  const aggregatedPrice = useMemo(() => {
    const prices = [
      priceFeedToggles.usePyth ? priceData.pythPrice : null,
      priceFeedToggles.useChainlink ? priceData.chainlinkPrice : null,
      priceFeedToggles.useDIA ? priceData.diaPrice : null
    ].filter((price): price is number => price !== null);

    if (prices.length === 0) return null;
    return prices.reduce((sum, price) => sum + price, 0) / prices.length;
  }, [priceData, priceFeedToggles]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Oracle Aggregator</h1>
      <select 
        value={selectedAsset} 
        onChange={(e) => setSelectedAsset(e.target.value)}
        className="mb-4 p-2 border rounded"
      >
        {Object.keys(PRICE_FEEDS).map((asset) => (
          <option key={asset} value={asset}>{asset}</option>
        ))}
      </select>
      <div className="mb-4">
        <label className="mr-4">
          <input
            type="checkbox"
            checked={priceFeedToggles.usePyth}
            onChange={() => togglePriceFeed('usePyth')}
          /> Use Pyth
        </label>
        <label className="mr-4">
          <input
            type="checkbox"
            checked={priceFeedToggles.useChainlink}
            onChange={() => togglePriceFeed('useChainlink')}
          /> Use Chainlink
        </label>
        <label>
          <input
            type="checkbox"
            checked={priceFeedToggles.useDIA}
            onChange={() => togglePriceFeed('useDIA')}
          /> Use DIA
        </label>
      </div>
      {/* {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>} */}

        <div className="text-center">
          <p className="text-2xl mb-2">
            {selectedAsset} Aggregated Price: ${aggregatedPrice?.toFixed(2) ?? 0}
          </p>
          <p className="text-lg">Pyth: ${priceData.pythPrice?.toFixed(2) ?? 'N/A'}</p>
          <p className="text-lg">Chainlink: ${priceData.chainlinkPrice?.toFixed(2) ?? 'N/A'}</p>
          <p className="text-lg">DIA: ${priceData.diaPrice?.toFixed(2) ?? 'N/A'}</p>
        </div>
      {/* <button
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        onClick={fetchPrices}
      >
        Refresh Prices
      </button> */}
    </main>
  );
}