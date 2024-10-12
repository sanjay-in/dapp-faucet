import React, { useEffect, useState } from "react";
import { Contract, ethers } from "ethers";
import { Button, Spinner } from "react-bootstrap";
import { ToastContainer } from "react-toastify";
import { toastMessage, getTimeUnit } from "../../../utils/utils.mjs";
import address from "../../constants/contractAddress.json";
import abi from "../../constants/ABI.json";
import tokenImage from "../../assets/token.png";
import "./Home.css";

const Home = () => {
  const [withdrawAmount, setWithdrawAmount] = useState(5);
  const [account, setAccount] = useState();
  const [deployer, setDeployer] = useState();
  const [loading, setLoading] = useState(false);
  const [isGetTokensDisable, setIsGetTokensDisable] = useState(false);
  const [isWithdrawDisable, setIsWithdrawDisable] = useState(false);

  const getFaucetContract = async () => {
    setLoading(true);
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new Contract(address, abi, signer);

        const withdrawAmt = await contract.s_withdrawAmount();
        const owner = await contract.i_owner();

        setAccount(signer.address);
        setWithdrawAmount(Number(ethers.formatEther(withdrawAmt)));
        setDeployer(owner);
      } catch (error) {
        console.log(error);
        toastMessage("error", "Can't connect to smart contract");
      }
    } else {
      toastMessage("error", "Unable to detect metamask");
    }
    setLoading(false);
  };

  const getTokens = async () => {
    validate();
    if (window.ethereum) {
      setIsGetTokensDisable(true);
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const faucet = new Contract(address, abi, signer);
        const requestToken = await faucet.requestToken(account);
        requestToken
          .wait()
          .then(() => {
            toastMessage("success", "Transaction successful. Please check your wallet for RDT");
          })
          .catch((error) => {
            console.log(error);
          });
      } catch (error) {
        console.error(error);
        toastMessage("error", "Transaction failed");
      }
      setIsGetTokensDisable(false);
    }
  };

  const withdrawTokens = async () => {
    if (window.ethereum) {
      setIsWithdrawDisable(true);
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const faucet = new Contract(address, abi, signer);
        const withdraw = await faucet.withdraw();
        withdraw.wait().then(() => {
          toastMessage("success", "Transaction successful. Please check your wallet for RDT");
        });
      } catch (error) {
        toastMessage("error", "Transaction failed");
      }
      setIsWithdrawDisable(false);
    }
  };

  const validate = () => {
    if (account == ethers.ZeroAddress) {
      toastMessage("error", "Please enter a valid address");
      return;
    }
  };

  useEffect(() => {
    getFaucetContract();
    window?.ethereum.on("accountsChanged", (accounts) => {
      setAccount(accounts[0]);
    });
  }, []);

  return (
    <div>
      <div className="main-container">
        {loading ? (
          <Spinner className="spinner" animation="border" variant="light" />
        ) : (
          <>
            <div className="token-container">
              <h1 className="red-token">Red Token</h1>
              <img className="token-image" src={tokenImage} />
            </div>
            <div className="description">Get {withdrawAmount} RDT sent directly to your wallet</div>
            <div className="input-form">
              <input
                type="text"
                className="address-box"
                placeholder="Enter address: 0x5ef9b68719D38Ad5e5e8b6D0De9D537BAc90a0A1"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
              />
              <button className="get-token-btn" disabled={isGetTokensDisable} onClick={getTokens}>
                Get Tokens
              </button>
            </div>
            {deployer?.toLowerCase() == account?.toLowerCase() ? (
              <div className="withdraw-btn">
                <Button variant="warning" disabled={isWithdrawDisable} onClick={withdrawTokens}>
                  Withdraw
                </Button>
              </div>
            ) : null}
          </>
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default Home;
