import React from "react";
import Spline from "@splinetool/react-spline";

interface VoiceVisualizerProps {
  isListening: boolean;
  isAvailable: boolean;
}

const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({
  isListening,
  isAvailable,
}) => {
  return (
    <div className="relative w-[200px] h-[200px] mx-auto">
      {/* Container for Spline scene */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${
          !isAvailable ? "opacity-50" : "opacity-100"
        }`}
      >
        <spline-viewer
          url="https://prod.spline.design/r9k4d9I6eMZdr-V0/scene.splinecode"
          className="w-full h-full"
        />
      </div>

      {/* Status overlay */}
      {!isAvailable && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black/50 text-white px-4 py-2 rounded-lg text-sm">
            Voice Input Unavailable
          </div>
        </div>
      )}
    </div>
  );
};

// Add the spline-viewer type to the global Window interface
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "spline-viewer": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        url: string;
      };
    }
  }
}

export default VoiceVisualizer;
