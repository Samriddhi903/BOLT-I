import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Star, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CongratulationsModalProps {
  open: boolean;
  onClose: () => void;
  plan: string;
}

const CongratulationsModal: React.FC<CongratulationsModalProps> = ({ open, onClose, plan }) => {
  const navigate = useNavigate();

  const handleStartExploring = () => {
    onClose();
    navigate('/analytics');
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-gradient-to-br from-purple-900/90 to-gray-900/90 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center border-2 border-purple-500/50 backdrop-blur-sm"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.4, type: "spring", stiffness: 300 }}
          >
            {/* Success Icon */}
            <motion.div
              className="mx-auto mb-6"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
            >
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
            </motion.div>

            {/* Title */}
            <motion.h2
              className="text-3xl font-bold text-white mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Congratulations! 🎉
            </motion.h2>

            {/* Subtitle */}
            <motion.p
              className="text-xl text-purple-300 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              You've successfully upgraded to
            </motion.p>

            {/* Plan Name */}
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full font-bold text-xl">
                <Star className="w-5 h-5" />
                {plan} Plan
                <Zap className="w-5 h-5" />
              </div>
            </motion.div>

            {/* Benefits */}
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <p className="text-gray-300 mb-3">You now have access to:</p>
              <ul className="text-left text-gray-200 space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Priority support
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Unlimited projects
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Advanced analytics
                </li>
                {plan === 'Premium' && (
                  <>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      1-on-1 onboarding
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      Custom integrations
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      Dedicated account manager
                    </li>
                  </>
                )}
              </ul>
            </motion.div>

            {/* Action Button */}
            <motion.button
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              onClick={handleStartExploring}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              Start Exploring! 🚀
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CongratulationsModal; 