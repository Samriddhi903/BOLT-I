import React from "react";
import blackCircle from "../assests/black_circle_360x360.png";

const BoltLogo: React.FC = () => (
  <a
    href="https://bolt.new/"
    target="_blank"
    rel="noopener noreferrer"
    style={{
      position: "fixed",
      top: 20,
      right: 20,
      zIndex: 1000,
      display: "block",
    }}
  >
    <img
      src={blackCircle}
      alt="Powered by Bolt"
      style={{ width: 60, height: 60, borderRadius: "50%" }}
    />
  </a>
);

export default BoltLogo; 