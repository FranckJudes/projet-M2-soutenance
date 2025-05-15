import React from "react";

const FileUpload = ({ handleFileUpload, toggleDirection, direction, error }) => (
  <div style={{ padding: "20px", borderRight: "1px solid #ccc", display: "flex", flexDirection: "column", gap: "10px" }}>
    <input type="file" accept=".bpmn" onChange={handleFileUpload} />
    <button onClick={toggleDirection} style={{ padding: "5px 10px", cursor: "pointer" }}>
      Basculer en {direction === "TB" ? "horizontal" : "vertical"}
    </button>
    {error && <p style={{ color: "red" }}>{error}</p>}
  </div>
);

export default FileUpload;
