# On Block-BoC
![logo](https://github.com/user-attachments/assets/72b942d2-b4db-408f-a294-44d4419218b9)


**On Block-BoC** is an innovative platform that leverages blockchain technology to revolutionize real estate transactions and fiat-to-stablecoin conversion. Built during the [AIA Chain Inaugural Hackathon](https://www.hackquest.io/en/hackathon/explore/AIA-Chain-Inaugural-Hackathon), this project aims to streamline and automate real estate ownership transfer using NFTs, while also providing a stablecoin, **EurBoC**, pegged 1:1 to the euro, ensuring a smooth transition between traditional banking systems and decentralized finance.

## Table of Contents
- [About the Project](#about-the-project)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [How It Works](#how-it-works)
- [Getting Started](#getting-started)
- [Smart Contracts](#smart-contracts)
- [License](#license)
- [Contact](#contact)

---

## About the Project

The **On Block-BoC** platform offers a seamless solution for real estate tokenization and fiat-to-crypto exchange, built on **three core smart contracts**:
1. **EurBoC Stablecoin**: A fiat-pegged stablecoin ensuring liquidity and security while leveraging blockchain technology for decentralized yet controlled currency management.
2. **RealEstateNFT**: A smart contract to tokenize real estate assets as NFTs, enabling instant ownership transfers in a fully digitized and immutable way.
3. **Marketplace**: A decentralized platform where users can buy, sell, and trade tokenized real estate using EurBoC.

## Features
- **Fiat-to-Stablecoin Conversion**: Users can easily convert their fiat currency into **EurBoC**, a stablecoin pegged to the euro.
- **Tokenized Real Estate**: Properties are represented as NFTs, making real estate ownership and transfers as simple as sending a token.
- **KYC Compliance**: Users must pass a **Know Your Customer (KYC)** process to ensure regulatory compliance, creating a secure ecosystem for transactions.
- **Ownership Transfer**: Real estate ownership transfers happen instantly, recorded on the blockchain for transparency and security.
- **Decentralized Marketplace**: Users can list, buy, and sell tokenized properties directly in the marketplace using EurBoC.

---

## Technologies Used

- **Blockchain**: Built on the **AIA Chain** for fast, low-cost, and eco-friendly transactions.
- **Smart Contracts**: Developed using **Solidity** for the Ethereum Virtual Machine (EVM).
- **React.js**: Frontend built using **React** for a modern, responsive user interface.
- **MetaMask**: Wallet integration for interacting with the blockchain.
- **Node.js & Express**: Backend server to handle API calls and balance updates.

---

## How It Works

1. **Fiat to EurBoC Conversion**: Users can connect their BoC account and convert fiat euros into EurBoC tokens directly from the platform.
2. **Real Estate Tokenization**: Property owners can tokenize their assets by minting NFTs through the **RealEstateNFT** smart contract, where each NFT represents a real property.
3. **Marketplace**: Tokenized real estate NFTs can be listed for sale in the marketplace. Buyers can purchase the property using EurBoC, and ownership is transferred instantly via the blockchain.
4. **KYC Verification**: All transactions require verified users to comply with regulatory standards. Wallets must be KYC-verified before they can receive or send EurBoC or real estate NFTs.

---

## Getting Started

### Prerequisites
- **Node.js** and **npm**
- **MetaMask** wallet
- **Git** for version control
- Access to the **AIA Chain Testnet/Mainnet** network for blockchain interactions

### Installation
1. Clone the repository:
    ```bash
    git clone https://github.com/andreou00/On-Block_BoC.git
    cd On-Block_BoC
    ```

2. Install the dependencies:
    ```bash
    npm install
    ```

3. Set up your environment variables:
   - Configure the necessary blockchain network details, API keys, and BoC account access.
  
4. Run the development server:
    ```bash
    npm start
    ```

5. In another terminal, start the backend server:
    ```bash
    cd server
    node server.js
    ```

---

## Smart Contracts

### 1. [**EurBoC Stablecoin Contract**](https://testnet.aiascan.com/token/0x46a60ED30B1Ff8f99bb773Bae217221c7CE19e02?tab=contract)
- This contract manages the issuance, burning, and KYC verification of the EurBoC stablecoin.

### 2. [**RealEstateNFT Contract**](https://testnet.aiascan.com/token/0xA37831EE6E78bAEfDBaB3A2493C9f418258e18e4?tab=contract)
- This contract tokenizes real estate properties into NFTs.

### 3. [**Real Estate Marketplace Contract**](https://testnet.aiascan.com/address/0x0643E44f5772d1b369bDDe5c5201Bd85533F55dc?tab=contract)
- A decentralized marketplace for buying, selling, and trading real estate NFTs using EurBoC.

---

## License
This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

## Contact
Created by **Konstantinos Andreou**. 

- [LinkedIn](https://www.linkedin.com/in/andreou00/)

Feel free to reach out if you have any questions or want to contribute to the project!
