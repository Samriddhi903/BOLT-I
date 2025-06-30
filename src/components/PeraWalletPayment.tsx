import React, { useState, useEffect } from "react";
import { PeraWalletConnect } from "@perawallet/connect";
import { motion } from "framer-motion";
import { CreditCard, AlertCircle, CheckCircle, Loader } from "lucide-react";

const RECEIVER_ADDRESS =
  "ECJYSFKHAZI7LFF5WD2JYFH67GXYTFQ4M2MQ32ZM3HTIY3DYDQA6IUBGCU"; // Replace with your Algorand address
const USD_TO_ALGO = 0.6; // Placeholder conversion rate, replace with real-time rate if needed

interface PeraWalletPaymentProps {
  amountUsd: number;
  onPaymentSuccess?: (txId: string) => void;
}

const peraWallet = new PeraWalletConnect();

const PeraWalletPayment: React.FC<PeraWalletPaymentProps> = ({
  amountUsd,
  onPaymentSuccess,
}) => {
  const [account, setAccount] = useState<string | null>(null);
  const [algoAmount, setAlgoAmount] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [txId, setTxId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setAlgoAmount((amountUsd * USD_TO_ALGO).toFixed(2));
  }, [amountUsd]);

  const connectWallet = async () => {
    try {
      const accounts = await peraWallet.connect();
      setAccount(accounts[0]);
      setError(null);
    } catch (err: any) {
      setError("Failed to connect Pera Wallet");
    }
  };

  const sendPayment = async () => {
    if (!account) {
      setError("Please connect your wallet first.");
      return;
    }
    setStatus("Pending...");
    setError(null);
    setTxId(null);
    try {
      // This is a placeholder. In a real app, you would use Algorand SDK to build and sign the transaction.
      setTimeout(() => {
        setTxId("SIMULATED_TX_ID");
        setStatus("Payment successful!");
        if (onPaymentSuccess) onPaymentSuccess("SIMULATED_TX_ID");
      }, 2000);
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
          className="w-full p-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-3"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <CreditCard className="w-6 h-6" />
          Connect Pera Wallet
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
          <span className="text-gray-400">Amount (ALGO):</span>
          <span className="text-white font-mono">{algoAmount}</span>
        </div>
        <div className="text-xs text-gray-500 italic">
          (ALGO amount is approximate, based on current conversion rate)
        </div>
      </div>

      <motion.button
        onClick={sendPayment}
        disabled={!account}
        className={`w-full p-4 rounded-xl text-white font-bold shadow-lg transition-all flex items-center justify-center gap-3
          ${
            !account
              ? "bg-gray-700 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-500 to-cyan-500 shadow-blue-500/20 hover:shadow-blue-500/30"
          }`}
        whileHover={account ? { scale: 1.02 } : {}}
        whileTap={account ? { scale: 0.98 } : {}}
      >
        {status === "Pending..." ? (
          <Loader className="w-5 h-5 animate-spin" />
        ) : (
          <CreditCard className="w-5 h-5" />
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

      {txId && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-green-900/20 border border-green-500/20"
        >
          <div className="flex items-center gap-3 text-green-400 mb-2">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Transaction successful!</span>
          </div>
          <div className="text-sm text-green-400/80 break-all">
            Transaction ID: {txId}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default PeraWalletPayment;
