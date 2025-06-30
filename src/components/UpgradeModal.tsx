import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ open, onClose }) => {
  const navigate = useNavigate();

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
            className="bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center border-2 border-purple-500"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-purple-400 mb-2">Unlock More Benefits!</h2>
            <p className="text-gray-300 mb-6">Upgrade to <span className="text-purple-300 font-semibold">Pro</span> or <span className="text-purple-300 font-semibold">Premium</span> for these exclusive features:</p>
            <ul className="text-left text-gray-200 mb-6 space-y-2">
              <li>• Priority support</li>
              <li>• Unlimited projects</li>
              <li>• Advanced analytics</li>
              <li>• 1-on-1 onboarding (Premium)</li>
              <li>• Custom integrations (Premium)</li>
              <li>• Dedicated account manager (Premium)</li>
            </ul>
            <div className="flex flex-col gap-3">
              <motion.button
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded transition-colors"
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  onClose();
                  navigate('/payments');
                }}
              >
                Upgrade Now
              </motion.button>
              <button
                className="text-gray-400 underline mt-2"
                onClick={onClose}
              >
                Maybe Later
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UpgradeModal; 