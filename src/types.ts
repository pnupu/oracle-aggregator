// src/types.ts
export interface PriceData {
    pythPrice: number | null;
    chainlinkPrice: number | null;
    diaPrice: number | null;
  }
  
  export interface PriceFeedToggles {
    usePyth: boolean;
    useChainlink: boolean;
    useDIA: boolean;
  }