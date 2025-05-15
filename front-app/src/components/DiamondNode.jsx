import React from "react";

const DiamondNode = ({ data }) => {
  return (
    <div
      style={{
        width: "100px",
        height: "100px",
        transform: "rotate(45deg)",
        backgroundColor: "#6777ef",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        border: "2px solid #fff",
      }}
    >
      <div
        style={{
          transform: "rotate(-45deg)",
          color: "#fff",
          textAlign: "center",
        }}
      >
        {data.label}
      </div>
    </div>
  );
};

export default DiamondNode;