import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import axios from 'axios';

// Pass the logged-in user's account info as props
function FiatToEurBoC({ eurBoCContract, account, loggedInAccount }) {
    const [amount, setAmount] = useState('');
    const [eurBoCAmount, setEurBoCAmount] = useState('');
    const [eurBoCBalance, setEurBoCBalance] = useState(0);

    const { "Account Owner": userName } = loggedInAccount || { "Account Owner": '' };
    const fiatBalance = loggedInAccount ? loggedInAccount.Balance : 0;

    const web3 = new Web3(window.ethereum);

    // Fetch EurBoC balance from blockchain
    const fetchEurBoCBalance = async () => {
        try {
            const balance = await eurBoCContract.methods.balanceOf(account).call();
            setEurBoCBalance(web3.utils.fromWei(balance, 'ether'));
        } catch (error) {
            console.error('Error fetching EurBoC balance:', error);
        }
    };

    // Helper function to send transactions with legacy gasPrice
    const sendTransaction = async (transaction) => {
        try {
            const gasEstimate = await transaction.estimateGas({ from: account });
            const gasPrice = await web3.eth.getGasPrice(); // Get current gas price

            await transaction.send({
                from: account,
                gas: gasEstimate,
                gasPrice, // Use legacy gas price for networks not supporting EIP-1559
            });
        } catch (error) {
            console.error('Error sending transaction:', error);
        }
    };

    // Convert Fiat to EurBoC
    const handleConvertToEurBoC = async () => {
        if (!amount || isNaN(amount)) {
            alert('Please enter a valid amount');
            return;
        }
        const convertAmount = parseFloat(amount);

        if (convertAmount > fiatBalance) {
            alert('You do not have enough fiat balance!');
            return;
        }

        try {
            const amountInWei = web3.utils.toWei(amount.toString(), 'ether');
            const mintTransaction = eurBoCContract.methods.mint(account, amountInWei);
            await sendTransaction(mintTransaction);
            fetchEurBoCBalance(); // Fetch updated EurBoC balance

            const newFiatBalance = fiatBalance - convertAmount;
            await updateDatabaseBalance(loggedInAccount['Account Number'], newFiatBalance);
            setAmount('');

        } catch (error) {
            console.error('Error converting fiat to EurBoC:', error);
        }
    };

    // Convert EurBoC to Fiat
    const handleConvertToFiat = async () => {
        if (!eurBoCAmount || isNaN(eurBoCAmount)) {
            alert('Please enter a valid amount');
            return;
        }
        const convertAmount = parseFloat(eurBoCAmount);
        if (convertAmount > eurBoCBalance) {
            alert('You do not have enough EurBoC balance!');
            return;
        }

        try {
            const amountInWei = web3.utils.toWei(eurBoCAmount.toString(), 'ether');
            const burnTransaction = eurBoCContract.methods.burn(account, amountInWei);
            await sendTransaction(burnTransaction);
            fetchEurBoCBalance(); // Fetch updated EurBoC balance

            const newFiatBalance = fiatBalance + convertAmount;
            await updateDatabaseBalance(loggedInAccount['Account Number'], newFiatBalance);
            setEurBoCAmount('');

        } catch (error) {
            console.error('Error converting EurBoC to Fiat:', error);
        }
    };

    // Function to update fiat balance in the backend (via API)
    const updateDatabaseBalance = async (accountNumber, newFiatBalance) => {
        try {
            const response = await axios.post('http://localhost:5000/update-balance', {
                accountNumber,
                newFiatBalance,
            });
            if (response.data.message === 'Balance updated successfully') {
                console.log('Balance updated successfully');
            } else {
                console.error('Error updating balance:', response.data.error);
            }
        } catch (error) {
            console.error('Error updating balance:', error);
        }
    };

    // Fetch EurBoC balance when component mounts
    useEffect(() => {
        if (eurBoCContract && account) {
            fetchEurBoCBalance();
        }
    }, [eurBoCContract, account]);

    return (
        <div>
            <h2>Welcome, {userName}</h2>

            {/* Convert Fiat to EurBoC */}
            <div>
                <input
                    type="number"
                    placeholder="Enter amount to convert to EurBoC"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
                <button onClick={handleConvertToEurBoC}>Convert to EurBoC</button>
            </div>

            {/* Convert EurBoC to Fiat */}
            <div style={{ marginTop: '20px' }}>
                <input
                    type="number"
                    placeholder="Enter amount to convert to Fiat"
                    value={eurBoCAmount}
                    onChange={(e) => setEurBoCAmount(e.target.value)}
                />
                <button onClick={handleConvertToFiat}>Convert to Fiat</button>
            </div>
        </div>
    );
}

export default FiatToEurBoC;
