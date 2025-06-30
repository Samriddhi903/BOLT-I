import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import MetamaskPayment from "./MetamaskPayment";
import PeraWalletPayment from "./PeraWalletPayment";
import {
  CreditCard,
  Wallet,
  Smartphone,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";

const PaymentPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { plan, price } = location.state || {};
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [upiRef, setUpiRef] = useState("");
  const [upiSubmitted, setUpiSubmitted] = useState(false);

  // Handle payment success
  const handlePaymentSuccess = (method: string, txIdOrRef: string) => {
    localStorage.setItem("currentPlan", plan);
    const history = JSON.parse(localStorage.getItem("paymentHistory") || "[]");
    history.unshift({
      plan,
      price,
      method,
      txIdOrRef,
      date: new Date().toISOString(),
      reason: "subscription",
    });
    localStorage.setItem("paymentHistory", JSON.stringify(history));
    sessionStorage.setItem("showCongratulationsModal", plan);
    navigate("/payments");
  };

  if (!plan || price === undefined || price === null) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen flex items-center justify-center bg-[#121212] p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center text-white"
        >
          <h2 className="text-2xl font-bold mb-4">No plan selected</h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg shadow-purple-500/20"
            onClick={() => navigate("/profile")}
          >
            Go Back
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  const handleUpiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUpiSubmitted(true);
    handlePaymentSuccess("UPI", upiRef);
  };

  const paymentMethods = [
    {
      id: "metamask",
      name: "Metamask",
      icon: <Wallet className="w-6 h-6" />,
      color: "from-orange-500 to-yellow-500",
    },
    {
      id: "pera",
      name: "Pera Wallet",
      icon: <CreditCard className="w-6 h-6" />,
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "upi",
      name: "UPI / IMPS",
      icon: <Smartphone className="w-6 h-6" />,
      color: "from-green-500 to-emerald-500",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center bg-[#121212] p-4"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20" />

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 bg-gray-900/90 backdrop-blur-xl rounded-2xl p-8 shadow-2xl shadow-purple-500/10 w-full max-w-md border border-purple-500/20"
      >
        <motion.button
          whileHover={{ x: -5 }}
          onClick={() =>
            selectedMethod ? setSelectedMethod(null) : navigate("/payments")
          }
          className="text-gray-400 hover:text-white flex items-center gap-2 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </motion.button>

        <motion.div layout>
          <motion.h2
            layout="position"
            className="text-2xl font-bold text-white mb-6 flex items-center gap-3"
          >
            Complete Your Payment
            <div className="h-1 w-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" />
          </motion.h2>

          <motion.div
            layout="position"
            className="mb-8 p-6 rounded-xl bg-gradient-to-br from-purple-900/50 to-gray-900/50 border border-purple-500/20"
          >
            <div className="text-lg text-gray-300 mb-2">Selected Plan:</div>
            <div className="text-xl font-bold text-purple-400 mb-2">{plan}</div>
            <div className="text-3xl font-extrabold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              ${price}/mo
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {!selectedMethod ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <div className="text-gray-400 mb-4">
                  Choose a payment method:
                </div>
                {paymentMethods.map((method) => (
                  <motion.button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className="w-full p-4 rounded-xl bg-gray-800/50 border border-gray-700/50 hover:border-purple-500/30 hover:bg-gray-800 transition-all flex items-center gap-4 group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div
                      className={`w-12 h-12 rounded-full bg-gradient-to-br ${method.color} flex items-center justify-center text-white shadow-lg`}
                    >
                      {method.icon}
                    </div>
                    <div className="text-left">
                      <div className="text-white font-semibold group-hover:text-purple-400 transition-colors">
                        {method.name}
                      </div>
                      <div className="text-sm text-gray-400">
                        Pay with {method.name}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {selectedMethod === "metamask" && (
                  <MetamaskPayment
                    amountUsd={price}
                    onPaymentSuccess={(txId) =>
                      handlePaymentSuccess("Metamask", txId)
                    }
                  />
                )}
                {selectedMethod === "pera" && (
                  <PeraWalletPayment
                    amountUsd={price}
                    onPaymentSuccess={(txId) =>
                      handlePaymentSuccess("Pera Wallet", txId)
                    }
                  />
                )}
                {selectedMethod === "upi" && !upiSubmitted && (
                  <motion.form onSubmit={handleUpiSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <div className="text-gray-300">
                        Send payment to UPI ID:
                      </div>
                      <div className="text-lg text-green-400 font-mono p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
                        yourupi@bank
                      </div>
                    </div>

                    <div className="text-gray-300">
                      Amount to pay:{" "}
                      <span className="text-white font-bold">${price} USD</span>
                    </div>

                    <motion.input
                      type="text"
                      className="w-full p-4 rounded-lg bg-gray-800/50 text-white border border-gray-700/50 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                      placeholder="Enter UPI transaction reference number"
                      value={upiRef}
                      onChange={(e) => setUpiRef(e.target.value)}
                      required
                    />

                    <motion.button
                      type="submit"
                      className="w-full py-4 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold shadow-lg shadow-green-500/20 hover:shadow-green-500/30 transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Submit Reference
                    </motion.button>
                  </motion.form>
                )}
                {selectedMethod === "upi" && upiSubmitted && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-8"
                  >
                    <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <div className="text-green-400 text-lg font-semibold">
                      Thank you! Your payment reference has been submitted for
                      verification.
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default PaymentPage;
