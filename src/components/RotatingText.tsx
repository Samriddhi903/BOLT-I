import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface RotatingTextProps {
  text: string;
  className?: string;
  delay?: number;
}

const RotatingText: React.FC<RotatingTextProps> = ({
  text,
  className = "",
  delay = 0,
}) => {
  return (
    <div className="overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.span
          key={text}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{
            y: { type: "spring", stiffness: 100, damping: 15, delay },
            opacity: { duration: 0.25, delay },
          }}
          className={className}
        >
          {text}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};

export default RotatingText;
