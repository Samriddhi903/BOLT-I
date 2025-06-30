import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { motion } from "framer-motion";
import { Wallet, AlertCircle, CheckCircle, Loader } from "lucide-react";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const RECEIVER_ADDRESS = "0x60e6bc25c838fC0D06e96c05A9cF625ddCaE6675"; // Replace with your wallet address

interface MetamaskPaymentProps {
  amountUsd: number;
  onPaymentSuccess?: (txId: string) => void;
}

const USD_TO_ETH = 0.00032; // Placeholder conversion rate, replace with real-time rate if needed

const MetamaskPayment: React.FC<MetamaskPaymentProps> = ({
  amountUsd,
  onPaymentSuccess,
}) => {
  const [account, setAccount] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ethAmount, setEthAmount] = useState("");

  useEffect(() => {
    // Convert USD to ETH (static for now)
    setEthAmount((amountUsd * USD_TO_ETH).toFixed(6));
  }, [amountUsd]);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);
        setError(null);
      } catch (err: any) {
        setError("User rejected wallet connection");
      }
    } else {
      setError("Metamask not detected. Please install Metamask.");
    }
  };

  const sendPayment = async () => {
    if (!account) {
      setError("Please connect your wallet first.");
      return;
    }
    if (!ethAmount || isNaN(Number(ethAmount)) || Number(ethAmount) <= 0) {
      setError("Invalid amount.");
      return;
    }
    setStatus("Pending...");
    setError(null);
    setTxHash(null);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const tx = await signer.sendTransaction({
        to: RECEIVER_ADDRESS,
        value: ethers.parseEther(ethAmount),
      });
      setStatus("Transaction sent. Waiting for confirmation...");
      await tx.wait();
      setTxHash(tx.hash);
      setStatus("Payment successful!");
      if (onPaymentSuccess) onPaymentSuccess(tx.hash);
    } catch (err: any) {
      setError(err.message || "Transaction failed");
      setStatus(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {!account ? (
        <motion.button
          onClick={connectWallet}
          className="w-full p-4 rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all flex items-center justify-center gap-3"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Wallet className="w-6 h-6" />
          Connect Metamask
        </motion.button>
      ) : (
        <div className="p-4 rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50">
          <div className="flex items-center gap-3 text-green-400">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Connected:</span>
          </div>
          <div className="mt-2 text-gray-300 font-mono text-sm break-all">
            {account}
          </div>
        </div>
      )}

      <div className="space-y-4 p-4 rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Amount (USD):</span>
          <span className="text-white font-bold">${amountUsd}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Amount (ETH):</span>
          <span className="text-white font-mono">{ethAmount}</span>
        </div>
        <div className="text-xs text-gray-500 italic">
          (ETH amount is approximate, based on current conversion rate)
        </div>
      </div>

      <motion.button
        onClick={sendPayment}
        disabled={!account}
        className={`w-full p-4 rounded-xl text-white font-bold shadow-lg transition-all flex items-center justify-center gap-3
          ${
            !account
              ? "bg-gray-700 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-500 to-purple-500 shadow-blue-500/20 hover:shadow-blue-500/30"
          }`}
        whileHover={account ? { scale: 1.02 } : {}}
        whileTap={account ? { scale: 0.98 } : {}}
      >
        {status === "Pending..." ? (
          <Loader className="w-5 h-5 animate-spin" />
        ) : (
          <Wallet className="w-5 h-5" />
        )}
        {status || "Send Payment"}
      </motion.button>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-red-900/20 border border-red-500/20 text-red-400 flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      {txHash && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-green-900/20 border border-green-500/20"
        >
          <div className="flex items-center gap-3 text-green-400 mb-2">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Transaction successful!</span>
          </div>
          <a
            href={`https://etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-green-400/80 hover:text-green-400 underline break-all transition-colors"
          >
            {txHash}
          </a>
        </motion.div>
      )}
    </motion.div>
  );
};

export default MetamaskPayment;
