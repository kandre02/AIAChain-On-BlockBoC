import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Web3 from 'web3';
import FiatToEurBoC from './pages/FiatToEurBoC';
import Marketplace from './pages/Marketplace';
import Home from './pages/Home';  
import About from './pages/About'; 
import realEstateMarketplaceAbi from './abis/RealEstateMarketplace.json';
import EurBoCAbi from './abis/EurBoC.json';
import realEstateNFTAbi from './abis/RealEstateNFT.json';
import database from './server/database.json';  
import './App.css';  
import logo from './logo.png'; 

// Update TARGET_NETWORK with new values from the screenshot
const TARGET_NETWORK = {
  chainId: '0x528', // Chain ID for AIA Testnet (1320 in hex)
  chainName: 'AIA Testnet',
  rpcUrls: ['https://aia-dataseed1-testnet.aiachain.org'],
  nativeCurrency: { name: 'AIA', symbol: 'AIA', decimals: 18 },
  blockExplorerUrls: ['https://testnet.aiascan.com'],
};

// Update contract addresses
const REAL_ESTATE_MARKETPLACE_ADDRESS = "0x0643E44f5772d1b369bDDe5c5201Bd85533F55dc";
const EURBOC_ADDRESS = "0x46a60ED30B1Ff8f99bb773Bae217221c7CE19e02";
const REAL_ESTATE_NFT_ADDRESS = "0xA37831EE6E78bAEfDBaB3A2493C9f418258e18e4";

function App() {
    const [account, setAccount] = useState(null);  
    const [eurBoCBalance, setEurBoCBalance] = useState(0); 
    const [loggedInAccount, setLoggedInAccount] = useState(null);  
    const [isVerified, setIsVerified] = useState(false);  
    const [web3, setWeb3] = useState(null);
    const [realEstateMarketplaceContract, setRealEstateMarketplaceContract] = useState(null);
    const [eurBoCContract, setEurBoCContract] = useState(null);
    const [realEstateNFTContract, setRealEstateNFTContract] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const savedAccountNumber = localStorage.getItem('accountNumber');
        if (savedAccountNumber) {
            const userAccount = database.find(user => user['Account Number'] === savedAccountNumber);
            if (userAccount) {
                const savedWallet = localStorage.getItem(`wallet-${savedAccountNumber}`);
                setLoggedInAccount({ ...userAccount, 'Wallet Address': savedWallet || userAccount['Wallet Address'] });
            }
        }
    }, []);

    useEffect(() => {
        if (window.ethereum) {
            const web3Instance = new Web3(window.ethereum);
            setWeb3(web3Instance);

            try {
                const realEstateNFT = new web3Instance.eth.Contract(realEstateNFTAbi, REAL_ESTATE_NFT_ADDRESS);
                const realEstateMarketplace = new web3Instance.eth.Contract(realEstateMarketplaceAbi, REAL_ESTATE_MARKETPLACE_ADDRESS);
                const eurBoC = new web3Instance.eth.Contract(EurBoCAbi, EURBOC_ADDRESS);

                setRealEstateNFTContract(realEstateNFT); 
                setRealEstateMarketplaceContract(realEstateMarketplace); 
                setEurBoCContract(eurBoC); 
            } catch (err) {
                console.error('Contract initialization failed', err);
                setError('Contract initialization failed');
            }
        }
    }, [web3]);

    const fetchEurBoCBalance = async () => {
        if (!eurBoCContract || !account) return;
        try {
            const balance = await eurBoCContract.methods.balanceOf(account).call();
            setEurBoCBalance(Web3.utils.fromWei(balance, 'ether'));
        } catch (error) {
            console.error('Error fetching EurBoC balance:', error);
        }
    };

    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                const accounts = await web3.eth.getAccounts();
                setAccount(accounts[0]);
                await switchNetwork();
                fetchEurBoCBalance();
                checkWalletVerification(accounts[0]);
            } catch (err) {
                console.error('MetaMask connection failed', err);
                setError('MetaMask connection failed');
            }
        } else {
            alert('Please install MetaMask!');
        }
    };

    const checkWalletVerification = async (walletAddress) => {
        if (loggedInAccount && loggedInAccount['Wallet Address'] === walletAddress) {
            setIsVerified(true);
        } else {
            setIsVerified(false);
        }
    };

    const verifyWallet = async () => {
        try {
            console.log('Verifying wallet:', account);
    
            // Manually specify gasPrice for networks that do not support EIP-1559
            await eurBoCContract.methods.verifyUser(account).send({
                from: account,
                gasPrice: await web3.eth.getGasPrice(),  // Use the legacy gas price model
            });
    
            console.log('Verification successful');
            setIsVerified(true);
            updateWalletInDatabase(loggedInAccount['Account Number'], account);
        } catch (error) {
            console.error('Error verifying wallet:', error);
            alert('Verification failed: ' + error.message);
        }
    };
    

    const updateWalletInDatabase = (accountNumber, walletAddress) => {
        const updatedDatabase = database.map(user => {
            if (user['Account Number'] === accountNumber) {
                return {
                    ...user,
                    'Wallet Address': walletAddress,
                };
            }
            return user;
        });

        localStorage.setItem('database', JSON.stringify(updatedDatabase));
        setLoggedInAccount({ ...loggedInAccount, 'Wallet Address': walletAddress });
        localStorage.setItem(`wallet-${accountNumber}`, walletAddress);
    };

    const disconnectWallet = () => {
        setAccount(null);
        setEurBoCBalance(0);
        setIsVerified(false);
    };

    const switchNetwork = async () => {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: TARGET_NETWORK.chainId }],
            });
        } catch (switchError) {
            if (switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [TARGET_NETWORK],
                    });
                } catch (addError) {
                    console.error('Failed to add network', addError);
                    setError('Failed to add network');
                }
            } else {
                setError('Network switch failed');
            }
        }
    };

    const handleLogin = (accountNumber) => {
        const userAccount = database.find(user => user['Account Number'] === accountNumber);
        if (userAccount) {
            const savedWallet = localStorage.getItem(`wallet-${accountNumber}`);
            setLoggedInAccount({ ...userAccount, 'Wallet Address': savedWallet || userAccount['Wallet Address'] });
            localStorage.setItem('accountNumber', accountNumber);
        } else {
            alert('Invalid account number!');
        }
    };

    const handleLogout = () => {
        setLoggedInAccount(null);
        localStorage.removeItem('accountNumber');
        disconnectWallet();
    };

    useEffect(() => {
        if (account && eurBoCContract) {
            fetchEurBoCBalance();
        }
    }, [account, eurBoCContract]);

    return (
        <Router>
            <div className="container">
                <nav>
                    
                    <ul>
                        <div className="logo">
                            <img src={logo} alt="Logo" className="logo-img" />  {/* Add this for the logo */}
                        </div>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/about">About</Link></li>
                        <li><Link to="/fiat">Convert Fiat to EurBoC</Link></li>
                        <li><Link to="/marketplace">Real Estate Marketplace</Link></li>
                    </ul>
                </nav>

                {loggedInAccount ? (
                    <div className="account-info">
                        <p>Welcome, {loggedInAccount['Account Owner']}!</p>
                        <p>Your Fiat Balance: €{loggedInAccount.Balance.toLocaleString()}</p>
                        <p>Your EurBoC Balance: {eurBoCBalance} EurBoC</p>
                
                        {account ? (
                            <>
                                <p>Connected Wallet: {account}</p>
                                {!isVerified ? (
                                    <button onClick={verifyWallet}>Verify Wallet</button>
                                ) : (
                                    <p className="verified">Verified Wallet</p>
                                )}
                                <button className="disconnect-wallet" onClick={disconnectWallet}>Disconnect Wallet</button>
                            </>
                        ) : (
                            <button onClick={connectWallet}>Connect Wallet</button>
                        )}

                        <button className="sign-out" onClick={handleLogout}>Sign Out</button>
                    </div>
                ) : (
                    <div className="account-info">
                        <Login handleLogin={handleLogin} />
                    </div>
                )}

                {error && <p className="error">{error}</p>}

                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/fiat" element={<FiatToEurBoC eurBoCContract={eurBoCContract} account={account} loggedInAccount={loggedInAccount} />} />
                    <Route path="/marketplace" element={<Marketplace realEstateContract={realEstateMarketplaceContract} eurBoCContract={eurBoCContract} realEstateNFTContract={realEstateNFTContract} account={account} />} />
                </Routes>
            </div>
        </Router>
    );
}

const Login = ({ handleLogin }) => {
    const [accountNumber, setAccountNumber] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        handleLogin(accountNumber);
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Account Number:
                    <input type="text" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} required />
                </label>
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default App;
