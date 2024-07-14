# Oracle Aggregator

Oracle Aggregator is a decentralized finance (DeFi) application that fetches and aggregates price data from multiple oracle sources, including Pyth, Chainlink, and DIA. This application allows users to view real-time price data for various assets and customize which oracle sources to include in the aggregated price calculation.

## Features

- Fetch real-time price data from Pyth, Chainlink, and DIA oracles
- Display individual prices from each oracle
- Calculate and display an aggregated price
- Allow users to toggle which oracle sources to include in the aggregation
- Support for multiple assets (currently SOL/USD and BTC/USD)
- Responsive design for various screen sizes

## Technologies Used

- Next.js
- React
- TypeScript
- Tailwind CSS
- Pyth Network SDK
- Chainlink Solana SDK
- DIA Oracle API

## Prerequisites

- Node.js (v14 or later)
- npm or yarn

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/pnupu/oracle-aggregator.git
   cd oracle-aggregator
   ```

2. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```

3. Create a `.env.local` file in the root directory and add the following environment variables:
   ```
   NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
   ANCHOR_WALLET=./id.json
   ```

## Running the Application

To run the application in development mode:

```
npm run dev
```
or
```
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## Usage

1. Select an asset from the dropdown menu (e.g., SOL/USD or BTC/USD).
2. View the individual prices from Pyth, Chainlink, and DIA oracles.
3. See the aggregated price calculated from the selected oracles.
4. Use the checkboxes to toggle which oracle sources to include in the aggregated price calculation.
5. Click the "Refresh Prices" button to manually fetch the latest prices.

## Project Structure

- `src/pages/`: Contains the main page component
- `src/utils/`: Utility functions for fetching and aggregating prices
- `src/types.ts`: TypeScript interfaces for price data and toggles
- `src/components/`: Reusable React components (if any)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Disclaimer

This application is for educational and demonstration purposes only. Do not use it for financial decisions without proper due diligence. The developers are not responsible for any financial losses incurred from using this application.