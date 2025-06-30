import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Zap, Clock, Shield, Star } from "lucide-react";

const PaymentsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"subscription" | "history">(
    "subscription"
  );
  const [currentPlan, setCurrentPlan] = useState<string>("Free");
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [userType, setUserType] = useState<"startup" | "investor">("startup");

  useEffect(() => {
    const storedUserType = localStorage.getItem("userType");
    setCurrentPlan(localStorage.getItem("currentPlan") || "Free");
    setPaymentHistory(
      JSON.parse(localStorage.getItem("paymentHistory") || "[]")
    );
    setUserType(storedUserType === "investor" ? "investor" : "startup");
  }, []);

  const navigate = useNavigate();

  const getPrice = (monthlyPrice: number) => {
    if (billingCycle === "yearly") {
      const yearlyPrice = monthlyPrice * 12;
      const discount = yearlyPrice * 0.2; // 20% discount for yearly
      return (yearlyPrice - discount) / 12;
    }
    return monthlyPrice;
  };

  const startupPlans = [
    {
      name: "Basic",
      monthlyPrice: 0,
      description: "Perfect for early-stage startups",
      features: [
        "Basic startup profile",
        "Limited investor matching",
        "Email support",
        "Basic analytics dashboard",
      ],
      icon: <Zap className="w-6 h-6" />,
      color: "from-purple-500 to-blue-500",
    },
    {
      name: "Pro",
      monthlyPrice: 49,
      description: "Best for growing startups",
      features: [
        "Enhanced startup profile",
        "Priority investor matching",
        "Priority support",
        "Advanced analytics",
        "Pitch deck hosting",
        "Investor introduction requests",
      ],
      icon: <Star className="w-6 h-6" />,
      color: "from-indigo-500 to-purple-500",
      popular: true,
    },
    {
      name: "Enterprise",
      monthlyPrice: 99,
      description: "For established startups",
      features: [
        "Custom startup profile",
        "VIP investor matching",
        "24/7 dedicated support",
        "Real-time analytics",
        "Multiple pitch decks",
        "Unlimited investor introductions",
        "Funding round management",
      ],
      icon: <Shield className="w-6 h-6" />,
      color: "from-blue-500 to-indigo-500",
    },
  ];

  const investorPlans = [
    {
      name: "Basic",
      monthlyPrice: 0,
      description: "Perfect for angel investors",
      features: [
        "Basic investor profile",
        "Limited startup discovery",
        "Email support",
        "Basic portfolio tracking",
      ],
      icon: <Zap className="w-6 h-6" />,
      color: "from-purple-500 to-blue-500",
    },
    {
      name: "Pro",
      monthlyPrice: 49,
      description: "Best for active investors",
      features: [
        "Enhanced investor profile",
        "Advanced startup discovery",
        "Priority support",
        "Advanced portfolio tracking",
        "Deal flow management",
        "Investment analytics",
      ],
      icon: <Star className="w-6 h-6" />,
      color: "from-indigo-500 to-purple-500",
      popular: true,
    },
    {
      name: "Enterprise",
      monthlyPrice: 99,
      description: "For investment firms",
      features: [
        "Custom investor profile",
        "AI-powered startup matching",
        "24/7 dedicated support",
        "Multi-portfolio management",
        "Advanced deal flow tools",
        "Team collaboration",
        "Custom reporting",
      ],
      icon: <Shield className="w-6 h-6" />,
      color: "from-blue-500 to-indigo-500",
    },
  ];

  const plans = userType === "startup" ? startupPlans : investorPlans;

  const getPageTitle = () => {
    return userType === "startup" ? "Grow Your Startup" : "Invest in Startups";
  };

  const getPageDescription = () => {
    if (userType === "startup") {
      return "Choose the perfect plan to accelerate your startup's growth";
    }
    return "Discover and invest in promising startups with our tailored plans";
  };

  const getTabText = () => {
    return "Subscription Plans";
  };

  const getButtonText = () => {
    return userType === "startup" ? "Get Started" : "Start Investing";
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[#121212] pt-20 pb-12"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20" />

      <div className="relative z-10 max-w-7xl mx-auto px-4">
        {/* Tab Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab("subscription")}
            className={`px-8 py-3 rounded-full backdrop-blur-xl font-semibold transition-all
              ${
                activeTab === "subscription"
                  ? "bg-gradient-to-r from-purple-600/80 to-blue-600/80 text-white shadow-lg shadow-purple-500/20"
                  : "bg-gray-800/50 text-gray-400 hover:bg-gray-800/80"
              }`}
          >
            {getTabText()}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab("history")}
            className={`px-8 py-3 rounded-full backdrop-blur-xl font-semibold transition-all
              ${
                activeTab === "history"
                  ? "bg-gradient-to-r from-purple-600/80 to-blue-600/80 text-white shadow-lg shadow-purple-500/20"
                  : "bg-gray-800/50 text-gray-400 hover:bg-gray-800/80"
              }`}
          >
            Payment History
          </motion.button>
        </div>

        {activeTab === "subscription" && (
          /* Billing Cycle Toggle */
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="flex items-center gap-8 p-1 bg-gray-900/50 backdrop-blur-xl rounded-full border border-gray-800/50">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setBillingCycle("monthly")}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  billingCycle === "monthly"
                    ? "bg-gradient-to-r from-purple-600/80 to-blue-600/80 text-white shadow-lg shadow-purple-500/20"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Monthly
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setBillingCycle("yearly")}
                className={`relative px-6 py-2 rounded-full font-medium transition-all ${
                  billingCycle === "yearly"
                    ? "bg-gradient-to-r from-purple-600/80 to-blue-600/80 text-white shadow-lg shadow-purple-500/20"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Yearly
                {billingCycle === "yearly" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -top-8 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 whitespace-nowrap"
                  >
                    Save 20%
                  </motion.div>
                )}
              </motion.button>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {activeTab === "subscription" ? (
            <motion.div
              key="subscription"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid md:grid-cols-3 gap-8"
            >
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative rounded-2xl backdrop-blur-xl overflow-hidden
                    ${
                      plan.popular
                        ? "bg-gradient-to-b from-purple-900/50 to-gray-900/50 border-2 border-purple-500/30"
                        : "bg-gray-900/50 border border-gray-800/50"
                    }`}
                >
                  {plan.popular && (
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400">
                        Popular
                      </span>
                    </div>
                  )}

                  <div className="p-8">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-6`}
                    >
                      {plan.icon}
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-gray-400 mb-4">{plan.description}</p>

                    <div className="mb-6">
                      <span className="text-4xl font-bold text-white">
                        ${getPrice(plan.monthlyPrice).toFixed(2)}
                      </span>
                      <span className="text-gray-400">/month</span>
                      {billingCycle === "yearly" && plan.monthlyPrice > 0 && (
                        <div className="text-sm text-green-400 mt-1">
                          Save ${(plan.monthlyPrice * 12 * 0.2).toFixed(2)}{" "}
                          yearly
                        </div>
                      )}
                    </div>

                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-3 text-gray-300"
                        >
                          <CheckCircle className="w-5 h-5 text-purple-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() =>
                        navigate("/payment", {
                          state: {
                            plan: plan.name,
                            price: getPrice(plan.monthlyPrice),
                            billingCycle,
                            userType,
                          },
                        })
                      }
                      className={`w-full py-3 rounded-xl font-semibold transition-all
                        ${
                          plan.popular
                            ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30"
                            : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                        }`}
                    >
                      {getButtonText()}
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800/50 overflow-hidden"
            >
              {paymentHistory.length === 0 ? (
                <div className="p-8 text-center">
                  <Clock className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No payment history available</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-800/50">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                          Date
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                          Plan
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                          Amount
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                          Method
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentHistory.map((payment, index) => (
                        <motion.tr
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-gray-800/50"
                        >
                          <td className="px-6 py-4 text-gray-300">
                            {new Date(payment.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-purple-400 font-medium">
                              {payment.plan}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-300">
                            ${payment.price}
                          </td>
                          <td className="px-6 py-4 text-gray-300">
                            {payment.method}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                              Completed
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default PaymentsPage;
