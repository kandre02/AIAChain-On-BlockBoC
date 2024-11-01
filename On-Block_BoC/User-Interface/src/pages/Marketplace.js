import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import './Marketplace.css';

function Marketplace({ realEstateContract, eurBoCContract, realEstateNFTContract, account }) {
    const [properties, setProperties] = useState([]);
    const [userNFTs, setUserNFTs] = useState([]);
    const [selectedNFT, setSelectedNFT] = useState(null);
    const [price, setPrice] = useState("");

    const web3 = new Web3(window.ethereum);

    const sendTransactionWithLegacyGas = async (transaction) => {
        try {
            const gasEstimate = await transaction.estimateGas({ from: account });
            const gasPrice = await web3.eth.getGasPrice(); // Fetch current gas price

            await transaction.send({
                from: account,
                gas: gasEstimate,
                gasPrice, // Use legacy gas price for networks not supporting EIP-1559
            });
        } catch (error) {
            console.error('Error sending transaction:', error);
            throw error;
        }
    };

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const totalTokens = await realEstateNFTContract.methods.nextTokenId().call();
                const fetchedProperties = [];

                for (let i = 0; i < totalTokens; i++) {
                    const listing = await realEstateContract.methods.getListingDetails(i).call();
                    const price = listing[0];
                    const seller = listing[1];

                    if (price > 0) {
                        const propertyDetails = await realEstateNFTContract.methods.getPropertyDetails(i).call();
                        const owner = await realEstateNFTContract.methods.ownerOf(i).call();

                        fetchedProperties.push({
                            id: i,
                            ...propertyDetails,
                            owner,
                            price,
                            seller,
                        });
                    }
                }

                setProperties(fetchedProperties);
            } catch (error) {
                console.error('Error fetching properties:', error);
            }
        };

        if (realEstateContract && realEstateNFTContract) {
            fetchProperties();
        }
    }, [realEstateContract, realEstateNFTContract]);

    useEffect(() => {
        const fetchUserNFTs = async () => {
            try {
                const totalSupply = await realEstateNFTContract.methods.nextTokenId().call();
                const ownedNFTs = [];

                for (let i = 0; i < totalSupply; i++) {
                    const owner = await realEstateNFTContract.methods.ownerOf(i).call();
                    if (owner.toLowerCase() === account.toLowerCase()) {
                        const nftDetails = await realEstateNFTContract.methods.getPropertyDetails(i).call();
                        ownedNFTs.push({
                            id: i,
                            ...nftDetails,
                            image: nftDetails.imageURL
                        });
                    }
                }

                setUserNFTs(ownedNFTs);
            } catch (error) {
                console.error('Error fetching user NFTs:', error);
            }
        };

        if (realEstateNFTContract && account) {
            fetchUserNFTs();
        }
    }, [realEstateNFTContract, account]);

    const handleApprove = async (tokenId) => {
        try {
            const transaction = realEstateNFTContract.methods.approve('0x0643E44f5772d1b369bDDe5c5201Bd85533F55dc', tokenId);
            await sendTransactionWithLegacyGas(transaction);
            alert('NFT approved for marketplace!');
        } catch (error) {
            console.error('Error approving NFT:', error);
            alert('Approval failed');
        }
    };

    const handleListProperty = async () => {
        try {
            if (selectedNFT && price) {
                await handleApprove(selectedNFT.id);
                const transaction = realEstateContract.methods.listProperty(selectedNFT.id, web3.utils.toWei(price, 'ether'));
                await sendTransactionWithLegacyGas(transaction);
                alert('Property listed successfully!');
            } else {
                alert('Please select an NFT and set a price.');
            }
        } catch (error) {
            console.error('Error listing property:', error);
            alert('Transaction failed');
        }
    };

    const handleCancelListing = async (propertyId) => {
        try {
            const transaction = realEstateContract.methods.cancelListing(propertyId);
            await sendTransactionWithLegacyGas(transaction);
            alert('Listing canceled successfully!');
        } catch (error) {
            console.error('Error canceling listing:', error);
            alert('Canceling listing failed');
        }
    };

    const handleBuy = async (property) => {
        try {
            const listingDetails = await realEstateContract.methods.getListingDetails(property.id).call();
            const priceInEurBoC = listingDetails[0];

            const transactionApprove = eurBoCContract.methods.approve('0x0643E44f5772d1b369bDDe5c5201Bd85533F55dc', priceInEurBoC);
            await sendTransactionWithLegacyGas(transactionApprove);

            const transactionBuy = realEstateContract.methods.buyProperty(property.id);
            await sendTransactionWithLegacyGas(transactionBuy);

            alert('Property purchased successfully!');
        } catch (error) {
            console.error('Error buying property:', error);
            alert('Transaction failed');
        }
    };

    return (
        <div className="marketplace-container">
            <h2>Real Estate Marketplace</h2>
            {properties.length > 0 ? (
                <div className="properties-grid">
                    {properties.map((property) => (
                        <div key={property.id} className="property-card">
                            <h3>{property.name}</h3>
                            <p>Location: {property.location}</p>
                            <p>Description: {property.description}</p>
                            <p>Type: {property.propertyType}</p>
                            <p className="owner">Owner: {property.owner}</p>
                            <p className="price">Price: {web3.utils.fromWei(property.price, 'ether')} EurBoC</p>
                            <img src={property.imageURL} alt={property.name} className="property-image" />
                            {account !== property.owner && (
                                <button className="buy-button" onClick={() => handleBuy(property)}>Buy</button>
                            )}
                            {account === property.seller && (
                                <button className="cancel-button" onClick={() => handleCancelListing(property.id)}>Cancel Listing</button>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p>No properties listed yet</p>
            )}

            <h2>My Properties</h2>
            {userNFTs.length > 0 ? (
                <div className="properties-grid">
                    {userNFTs.map((nft) => (
                        <div key={nft.id} className="property-card">
                            <h3>{nft.name}</h3>
                            <p>Location: {nft.location}</p>
                            <p>Description: {nft.description}</p>
                            <p>Type: {nft.propertyType}</p>
                            <img src={nft.image} alt={nft.name} className="property-image" />
                            <input
                                type="number"
                                placeholder="Set price in EurBoC"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="price-input"
                            />
                            <button className="list-button" onClick={() => setSelectedNFT(nft)}>List Property</button>
                        </div>
                    ))}
                </div>
            ) : (
                <p>You don't own any properties</p>
            )}

            {selectedNFT && (
                <div className="list-nft-section">
                    <button className="list-button" onClick={handleListProperty}>Confirm Listing</button>
                </div>
            )}
        </div>
    );
}

export default Marketplace;
